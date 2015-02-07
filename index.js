/**
 * Created by Michael on 5/2/2015.
 */

var got = require('got')
var cheerio = require('cheerio')
var Q = require('q')
var async = require('async')

var WEBSITE_ROOT = 'http://kissanime.com'

var AnimeUtils = {
  /*  KissAnime uses a POST driven search that returns a table of rows  with links to anime pages.
    Returns Promise of {name, url}.
    NOTE: Searching with an empty name tag will return the entire list of anime.
    */
  searchByName: function (name) {
    var deferred = Q.defer()
    var url = WEBSITE_ROOT + '/AdvanceSearch'
    var options = {
      method: 'POST',
      body: 'animeName=' + name + '&status=&genres=',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    got(url, options, function (err, data, resp) {
      /* Handle server not found & unauthorized error codes */
      if (err) throw err
      if (resp.statusCode !== 200) deferred.reject(resp.statusCode + ':' + 'Page was not received', null)

      var $ = cheerio.load(data)
      /* Gets content rows inside pages (this usually contains anime links or episode links) */
      var rows = PageUtils.getPageRows($)

      var results = []

      for (var i = 0; i < rows.length; i++) {
        var rowColumns = $(rows[i]).children()

        /* Name element is found in the first column */
        var nameElement = rowColumns.eq(0).find('a')
        var name = nameElement.text().trim().replace(/(\r\n|\n|\r)/gm, '')
        var url = WEBSITE_ROOT + nameElement.attr('href')

        var obj = {
          name: name,
          url: url
        }

        results.push(obj)
      }

      deferred.resolve(results)
    })

    return deferred.promise
  }
}

var PageUtils = {
  /*  These helper functions parse information about the anime on the page,
    and boy is their HTML structure ugly!
   */
  parseForeignNames: function (text) {
    text = text.replace(/Other name:/, '').trim()
    return text.split(';')
  },

  parseGenres: function (text) {
    text = text.replace(/Genres:/, '').trim()
    return text.split(', ')
  },

  parseDateAired: function (text) {
    text = text.replace(/Date aired:/, '').trim()
    return text.split(' to ')
  },

  /* Video links are held in a select tag dropdown. */
  getQualityLinkList: function ($) {
    var arr = []
    $('#selectQuality > option').each(function (index) {
      var name = $(this).text()
      var url = $(this).attr('value')
      arr.push({name: name, url: url})
    })

    return arr
  },

  /* Returns row elements in main content table
  * Used by search & episode retrieval */
  getPageRows: function ($) {
    var elements = $('.listing tr:not(.head):not([style])').toArray()
    var rows = []

    for (var i = 0; i < elements.length; i++) {
      var children = $(elements[i]).children()
      if (children[0].name !== 'th') {
        rows.push($(elements[i]))
      }
    }

    return rows
  },

  /* Shortcut method to just get name & href from content table */
  getNameLinkRows: function ($) {
    var rows = this.getPageRows($)
    var arr = []

    for (var i = 0; i < rows.length; i++) {
      var rowColumns = $(rows[i]).children()

      /* Name element is found in the first column */
      var nameElement = rowColumns.eq(0).find('a')
      var name = nameElement.text().trim().replace(/(\r\n|\n|\r)/gm, '')
      var url = WEBSITE_ROOT + nameElement.attr('href')

      arr.push({text: name, href: url})
    }

    return arr
  }
}

/* Mini class definition for episode objects
 *  Lets you call getVideoUrl on each individual object to get their videoUrl information */
var Episode = function (name, pageUrl) {
  this.name = name
  this.pageUrl = pageUrl

  this.getVideoUrl = function () {
    var deferred = Q.defer()
    var self = this

    got(this.pageUrl, function (err, data, resp) {
      if (err) deferred.reject(new Error('Page could not be loaded'))
      var $ = cheerio.load(data)

      self.videoUrls = PageUtils.getQualityLinkList($)
      deferred.resolve(self.videoUrls)
    })
    return deferred.promise
  }
}

/* Encapsulates anime information
 *  Includes method to retrieve videoUrls for every episode */
var Anime = function (name, url) {
  this.name = name
  this.url = url

  this.getVideoUrls = function () {
    var deferred = Q.defer()
    async.map(this.episodes, function (episode, callback) {
      episode.getVideoUrl().then(function () {
        callback(null, episode)
      })
    },
    function (err, results) {
      if (err) deferred.reject(new Error('Video links could not be loaded'))
      deferred.resolve(results)
    })

    return deferred.promise
  }
}

/* Anime Object Factory Methods */

/*
 Searches the website using POST and then creates Anime from name.
 Note this is significantly slower than using a url directly as POST search is slow
 */
Anime.fromName = function (name) {
  var deferred = Q.defer()
  AnimeUtils.searchByName(name).then(function (results) {
    for (var i = 0; i < results.length; i++) {
      var anime = results[i]

      /* Search for direct */
      if (anime.name === name) {
        Anime.fromUrl(anime.url).then(function (animeObj) {
          deferred.resolve(animeObj)
          return deferred.promise
        })
      }
    }
  })

  return deferred.promise
}

/*  Creates an anime object from a given url.
  This includes information like genres, other names and episode links (but not video links).
 */
Anime.fromUrl = function (pageUrl) {
  var deferred = Q.defer()
  got(pageUrl, function (err, data, resp) {
    if (err) deferred.reject(new Error('Connection timeout'))
    var $ = cheerio.load(data)

    /* We must keep track of the summary text index because it is an arbitrary tag one after */
    var indexOfSummary = Number.MAX_VALUE
    var info = {}

    /* Parse foreign names, genres and air date from page */
    $('.barContent').eq(0).find('p').each(function (index) {
      var text = $(this).text().trim()

      if (text.indexOf('Other name:') >= 0) {
        info.names = PageUtils.parseForeignNames(text)
      } else if (text.indexOf('Genres:') >= 0) {
        info.genres = PageUtils.parseGenres(text)
      } else if (text.indexOf('Date aired:') >= 0) {
        info.airdates = PageUtils.parseDateAired(text)
      } else if (text.indexOf('Summary:') >= 0) {
        indexOfSummary = index++
      } else if (indexOfSummary === index) {
        info.summary = text
      }
    })

    /* Anime Name */
    var animeName = $('.bigChar').first().text()

    /* Episode Page Links */
    var rows = PageUtils.getNameLinkRows($)
    var episodes = []
    for (var i = 0; i < rows.length; i++) {
      var name = rows[i].text
      var url = rows[i].href
      episodes.push(new Episode(name, url))
    }

    var anime = new Anime(animeName, pageUrl)
    anime.info = info
    anime.episodes = episodes

    deferred.resolve(anime)
  })

  return deferred.promise
}

module.exports = {
  Anime: Anime,
  AnimeUtils: AnimeUtils,
  PageUtils: PageUtils,
  Episode: Episode
}
