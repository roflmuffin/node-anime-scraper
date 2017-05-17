import test from 'ava';

const Episode = require('../../src/index').Episode;
const helper = require('../helper');

test('can create empty episode', (t) => {
  const e = new Episode({});
  t.truthy(e.name === null);
  t.truthy(e.url === null);
});

test('can retrieve video links', t => (
  new Episode({ url: helper.TEST_EPISODE_URL }).fetch().then((episode) => {
    t.truthy(episode.videoLinks.length > 0);
    t.truthy(typeof episode.videoLinks !== 'undefined');
  })
));
