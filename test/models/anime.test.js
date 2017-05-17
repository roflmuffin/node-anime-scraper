import test from 'ava';

const Anime = require('../../src/index').Anime;
const helper = require('../helper');

test('can view by url', t => (
  Anime.fromUrl(helper.TEST_ANIME_URL).then((anime) => {
    t.is(anime.name, helper.TEST_ANIME_NAME);
  })
));

test('can view by name', t => (
  Anime.fromName(helper.TEST_ANIME_NAME).then((anime) => {
    t.is(anime.url, helper.TEST_ANIME_URL);
  })
));

test('can search', t => (
  Anime.search(helper.TEST_SEARCH_NAME).then((results) => {
    const resultsReduced = results.map(item => item.name);
    t.truthy(JSON.stringify(resultsReduced) === JSON.stringify(helper.TEST_SEARCH_RESULT));
  })
));

test('can fetch all episodes', t => (
  Anime.fromUrl(helper.TEST_ANIME_SMALL_URL).then(anime => (
    anime.fetchAllEpisodes().then((fetched) => {
      t.truthy(fetched.episodes.length === helper.TEST_ANIME_SMALL_EPISODECOUNT);
    })
  ))
));
