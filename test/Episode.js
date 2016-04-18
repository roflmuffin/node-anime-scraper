var expect = require('expect.js')
var scraper = require('../lib/index.js')

var Anime = scraper.Anime;
var Episode = scraper.Episode;
var Video = scraper.Video;
var SearchResult = scraper.SearchResult;

var EPISODE_URL_VALID = 'https://kissanime.to/Anime/Kiznaiver/Episode-001?id=124602'
var EPISODE_URL_INVALID = 'https://kissanime.to/Anime/Kiznaiver/Episode-321'

describe('Episode', function() {
  describe('fromUrl', function() {
    describe('with valid episode Url', function() {
      it('should return an episode object with video links', function(callback) {
        Episode.fromUrl(EPISODE_URL_VALID).then(function(episode) {
          expect(episode).to.be.an(Episode)
          expect(episode.video_links).to.be.an(Array)
          expect(episode.video_links[0]).to.be.a(Video)
          callback()
        })
      })
    })

    describe('with invalid episode Url', function() {
      it('should return an error', function(callback) {
        Episode.fromUrl(EPISODE_URL_INVALID).then(function(){})
        .catch(function(error) {
          callback()
        })
      })
    })
  })
})
