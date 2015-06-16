/**
 * Created by Michael on 5/2/2015.
 */

var got = require('got')
var cheerio = require('cheerio')
var Q = require('q')
var async = require('async')
var _ = require('underscore')

var WEBSITE_ROOT = 'http://kissanime.com'

var OPTIONS = {
  headers: {
    'Cookie': '',
    'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36'
  }
}

var AnimeUtils = {

  /**
   * Sets the cookie used by all future request (needed to bypass cloudflare)
   * @param {string} cookie string used in headers
   */
  setSessionCookie: function(cookie) {
    OPTIONS.headers['Cookie'] = cookie
  },

  /**
   * Sends a POST request to KissAnime and expects a HTML response. Empty name parameter returns entire list of anime.
   * @param  {string} name
   * @return {promise}
   */
  searchByName: function (name) {
    var deferred = Q.defer()
    var url = WEBSITE_ROOT + '/AdvanceSearch'
    var body = 'animeName=' + name + '&status=&genres='

    var options = {
      method: 'POST',
      body: body
    }

    options = _.extend(OPTIONS, options)

    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.headers['Content-Length'] = Buffer.byteLength(body)

    got(url, options, function (err, data, resp) {
      // Handle server not found & unauthorized error codes
      if (err) throw err
      if (resp.statusCode !== 200) deferred.reject(resp.statusCode + ':' + 'Page was not received', null)

      var $ = cheerio.load(data)
      // Gets content rows inside pages (this usually contains anime links or episode links)
      var rows = PageUtils.getPageRows($)

      var results = []

      for (var i = 0; i < rows.length; i++) {
        var rowColumns = $(rows[i]).children()

        // Name element is found in the first column
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

  /**
   * Splits the foreign names into an array from a string
   * @param  {string} text The string to be split
   * @return {array}       The split string
   */
  parseForeignNames: function (text) {
    text = text.replace(/Other name:/, '').trim()
    return text.split(';')
  },

  /**
   * Splits genres into an array from a string
   * @param  {string} text The string to be split
   * @return {array}       The split string
   */
  parseGenres: function (text) {
    text = text.replace(/Genres:/, '').trim()
    return text.split(', ')
  },

  /**
   * Splits the date it was added into an array from a string
   * @param  {string} text The string to be split
   * @return {array}       The split string
   */
  parseDateAired: function (text) {
    text = text.replace(/Date aired:/, '').trim()
    return text.split(' to ')
  },

  /**
   * Iterates over a set of option elements to get video quality links
   * @param  {object} $ The cheerio object holding the elements
   * @return {array}    Holds the quality names and links
   */
  getQualityLinkList: function ($) {
    var arr = []
    $('#selectQuality > option').each(function (index) {
      var name = $(this).text()
      var url = $(this).attr('value')
      var buf = new Buffer(url, 'base64')
      url = buf.toString('utf-8')
      arr.push({name: name, url: url})
    })

    return arr
  },

  /**
   * Returns row elements in main content table
   * @param  {object} $ The cheerio object holding the elements
   * @return {array}    The row elements
   */
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

  /**
   * Shortcut to only get the name & href from the table
   * @param  {object} $ The cheerio object holding the elements
   * @return {array}    Holding the name & link of each element
   */
  getNameLinkRows: function ($) {
    var rows = this.getPageRows($)
    var arr = []

    for (var i = 0; i < rows.length; i++) {
      var rowColumns = $(rows[i]).children()

      // Name element is found in the first column
      var nameElement = rowColumns.eq(0).find('a')
      var name = nameElement.text().trim().replace(/(\r\n|\n|\r)/gm, '')
      var url = WEBSITE_ROOT + nameElement.attr('href')

      arr.push({text: name, href: url})
    }

    return arr
  }

}

/**
 * Episode constructor
 * @param {string} name    The name of the episode
 * @param {string} pageUrl URL to the page
 */
var Episode = function (name, pageUrl) {
  this.name = name
  this.pageUrl = pageUrl

  /**
   * Fetches videoUrl information of an episode
   * @return {promise}
   */
  this.getVideoUrl = function () {
    var deferred = Q.defer()
    var self = this

    got(this.pageUrl, OPTIONS, function (err, data, resp) {
      if (err) deferred.reject(new Error('Page could not be loaded'))
      var $ = cheerio.load(data)

      self.videoUrls = PageUtils.getQualityLinkList($)
      deferred.resolve(self.videoUrls)
    })

    return deferred.promise
  }
}

/**
 * Anime constructor
 * @param {string} name Name of anime
 * @param {string} url  Link to anime
 */
var Anime = function (name, url) {
  this.name = name
  this.url = url

  /**
   * Fetches videoUrls for every episode
   * @return {promise}
   */
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

/**
 * Sends a POST request to the search function on the page and creates an Anime object from it.
 * Note: Significantly slower than using a direct URL as this is an additional step to figure out the URL
 * @param  {string} name Name of the anime to search for
 * @return {promise}
 */
Anime.fromName = function (name) {
  var deferred = Q.defer()
  AnimeUtils.searchByName(name).then(function (results) {
    for (var i = 0; i < results.length; i++) {
      var anime = results[i]

      // Search for direct URL
      if (anime.name === name) {
        Anime.fromUrl(anime.url).then(function (animeObj) {
          deferred.resolve(animeObj)
          return deferred.promise
        })
      }
    }
    var error = new Error("Exact match not found. See matches property.")
    error.matches = results
    deferred.reject(error)
  })

  return deferred.promise
}

/**
 * Sends a GET request to a given URL and creates a Anime object from the page contents.
 * @param  {string} pageUrl The URL to the anime page
 * @return {promise}
 */
Anime.fromUrl = function (pageUrl) {
  var deferred = Q.defer()
  got(pageUrl, OPTIONS, function (err, data, resp) {
    if (err && err.code == 503) {
      deferred.reject(new Error('Connection failed. \
      Is the website up & have you set the cloudflare session cookie?'))
    }
    else if (err) deferred.reject(new Error('Connection timeout'))
    var $ = cheerio.load(data)

    // We must keep track of the summary text index because it is an arbitrary tag one after
    var indexOfSummary = Number.MAX_VALUE
    var info = {}

    // Parse foreign names, genres and air date from page
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

    // Anime Name
    var animeName = $('.bigChar').first().text()

    // Episode Page Links, in reverse order of HTML
    var rows = PageUtils.getNameLinkRows($)
    var episodes = []
    for (var i = rows.length - 1; i >= 0; i--) {
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
