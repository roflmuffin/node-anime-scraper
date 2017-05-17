import test from 'ava';

const SearchResult = require('../../src/index').SearchResult;
const helper = require('../helper');

test('can create empty search result', (t) => {
  const sr = new SearchResult({});
  t.truthy(sr.name === null);
  t.truthy(sr.url === null);
});

test('can create valid search result', (t) => {
  const sr = new SearchResult({
    name: helper.TEST_SEARCH_RESULT_NAME,
    url: helper.TEST_SEARCH_RESULT_URL,
  });
  t.truthy(sr.name === helper.TEST_SEARCH_RESULT_NAME);
  t.truthy(sr.url === helper.TEST_SEARCH_RESULT_URL);
});
