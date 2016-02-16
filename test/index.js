var expect = require('expect.js')
var scraper = require('../lib/index.js')
var cloudscraper = require('cloudscraper')

var Anime = scraper.Anime
var AnimeUtils = scraper.AnimeUtils

var ANIME_NAME = 'Yoru no Yatterman'
var ANIME_NAME_MULTIPLE = 'Akame ga Kill!'
var ANIME_NAME_UNICODE = 'Space☆Dandy (Sub)'

before('anime-scraper', function(done) {
  this.timeout(10000)
  cloudscraper.get('http://kissanime.com', function(err, body, resp) {
    var cookieString = resp.request.headers.cookie
    AnimeUtils.setSessionCookie(cookieString)
    done()
  })
})

// Once we have our CloudFlare stuff out of the way, continue with the test.
describe('anime-scraper', function() {
  describe('AnimeUtils.searchByName', function() {
    describe('with blank string', function() {
      this.timeout(10000)
      it('returns a large array', function(callback) {
        AnimeUtils.searchByName('')
          .then(function(results) {
            callback()
          })
          .catch(function(error) {
            callback(error)
          })
      })
    })

    describe('with anime name', function() {
      this.timeout(4000)
      it('returns an array with one object', function(callback) {
        AnimeUtils.searchByName(ANIME_NAME)
          .then(function(results) {
            if (results.length == 1)
              callback()
            else
              callback(new Error('Invalid anime count'))
          })
          .catch(function(error) {
            callback(error)
          })
      })
    })
  })

  describe('Anime.fromName', function() {
    describe('with basic anime name: ' + ANIME_NAME, function() {
      this.timeout(10000)
      it('should return an anime object', function(callback) {
        Anime.fromName(ANIME_NAME)
          .then(function(anime) {
            callback()
          })
          .catch(function(error){
            callback(error)
          })
      })

    })

    describe('with multiple results: ' + ANIME_NAME_MULTIPLE, function() {
      this.timeout(10000)
      it('should return an an error with matches array, length > 1', function(callback) {
        Anime.fromName(ANIME_NAME_MULTIPLE)
          .then(function(anime) {
            callback()
          })
          .catch(function(error){
            if (error.matches.length > 1)
              callback()
            else
              callback(error)
          })
      })

    })

    describe('with unicode character: ' + ANIME_NAME_UNICODE, function() {
      this.timeout(10000)
      it('should return an anime object', function(callback) {
        Anime.fromName(ANIME_NAME_UNICODE)
          .then(function(anime) {
            callback()
          })
          .catch(function(error){
            callback(error)
          })
      })
    })
  })
})
