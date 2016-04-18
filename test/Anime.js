var expect = require('expect.js')
var scraper = require('../lib/index.js')

var Anime = scraper.Anime;
var Episode = scraper.Episode;
var SearchResult = scraper.SearchResult;

var ANIME_URL_VALID = 'https://kissanime.to/Anime/Haikyuu-Second-Season'
var ANIME_URL_INVALID = 'https://kissanime.to/Anime/Doesnt-Exist'

var ANIME_SEARCH_ONERESULT = 'Kiznaiver'
var ANIME_SEARCH_LARGERESULT = 'Naruto'
var ANIME_SEARCH_NORESULT = 'Absolute Gibberish'
var ANIME_SEARCH_UNICODE = 'Space☆Dandy'

var ANIME_EPISODES_SMALL = 'https://kissanime.to/Anime/The-Garden-of-Words'
var ANIME_EPISODES_MEDIUM = 'https://kissanime.to/Anime/Boku-dake-ga-Inai-Machi'

describe('Anime', function() {
  this.timeout(10000)
  describe('Anime.fromUrl', function() {
    describe('with valid Url', function() {
      it('returns anime object', function(callback) {
        Anime.fromUrl(ANIME_URL_VALID).then(function(anime) {
          expect(anime).to.be.an('object')
          expect(anime.name).to.be.a('string')
          callback()
        }).catch(callback)
      })
    })

    describe('with invalid Url', function() {
      it('returns an error', function(callback) {
        Anime.fromUrl(ANIME_URL_INVALID).then(function(anime) {})
        .catch(function(error) {
          callback()
        })
      })
    })
  })

  describe('Anime.search', function() {
    describe('with 1 expected result', function() {
      it('should return an array of search results with 1 search result', function(callback) {
        Anime.search(ANIME_SEARCH_ONERESULT).then(function(results) {
          expect(results).to.be.an(Array)
          expect(results).to.have.length(1)
          expect(results[0]).to.be.a(SearchResult)
          callback()
        }).catch(callback)
      })
    })

    describe('with > 5 expected result', function() {
      it('should return an array of search results with more than 5 search results', function(callback) {
        Anime.search(ANIME_SEARCH_LARGERESULT).then(function(results) {
          expect(results).to.be.an(Array)
          expect(results.length).to.be.greaterThan(5)
          expect(results[0]).to.be.a(SearchResult)
          callback()
        }).catch(callback)
      })
    })

    describe('with 0 expected results', function() {
      it('should return an array of search results with 0 search results', function(callback) {
        Anime.search(ANIME_SEARCH_NORESULT).then(function(results) {
          expect(results).to.be.an(Array)
          expect(results.length).to.be(0)
          callback()
        }).catch(callback)
      })
    })

    describe('with unicode search parameter', function() {
      it('should return an array of search results', function(callback) {
        Anime.search(ANIME_SEARCH_UNICODE).then(function(results) {
          expect(results).to.be.an(Array)
          expect(results[0]).to.be.a(SearchResult)
          callback()
        }).catch(callback)
      })
    })
  })

  describe('Anime.fetchAllEpisodes', function() {
    describe('with small amount of episodes', function() {
      it('should return an array of episodes', function(callback) {
        Anime.fromUrl(ANIME_EPISODES_SMALL).then(function(anime) {
          anime.fetchAllEpisodes().then(function(episodes) {
            expect(episodes).to.be.an(Array)
            expect(episodes).to.have.length(1)
            expect(episodes[0]).to.be.an(Episode)
            callback()
          })
        })
      })
    })

    describe('with medium amount of episodes', function() {
      this.timeout(20000)
      it('should return an array of episodes', function(callback) {
        Anime.fromUrl(ANIME_EPISODES_MEDIUM).then(function(anime) {
          anime.fetchAllEpisodes().then(function(episodes) {
            expect(episodes).to.be.an(Array)
            expect(episodes.length).to.be.greaterThan(10)
            expect(episodes[0]).to.be.an(Episode)
            callback()
          }).catch(callback)
        })
      })
    })
  })
})
