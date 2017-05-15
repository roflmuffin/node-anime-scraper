const cheerio = require('cheerio');
const debug = require('debug')('anime-scraper');
const got = require('got');
const CloudHttp = require('../libs/http');

const BASE_URL = 'https://ww1.gogoanime.io';

const cHttp = new CloudHttp();

function bodyToCheerio(resp) {
  return cheerio.load(resp.body);
}

function getEpisodesFromId(id) {
  const url = 'https://ww1.gogoanime.io/load-list-episode';
  const params = {
    ep_start: 0,
    ep_end: 2000,
    id,
  };

  return cHttp.request(url, { query: params })
  .then(bodyToCheerio)
  .then(($) => {
    const episodes = $('li a');

    return episodes.map((i, value) => ({
      name: $(value).find('.name').text().trim(),
      url: `${BASE_URL}${$(value).attr('href').trim()}`,
    })).get().reverse();
  });
}

const Anime = {
  search(query) {
    const url = `${BASE_URL}/search.html`;

    const options = {
      method: 'GET',
      query: { keyword: query },
    };

    return cHttp.request(url, options)
    .then(bodyToCheerio)
    .then(($) => {
      const results = $('.items li .name a');

      return results.map((i, value) => ({
        name: $(value).text(),
        url: `${BASE_URL}${$(value).attr('href')}`,
      })).get();
    });
  },

  fromUrl(url) {
    return cHttp.request(url)
    .then(bodyToCheerio)
    .then(($) => {
      const id = $('#movie_id').val();

      return getEpisodesFromId(id).then(episodes => ({
        id: $('#movie_id').val(),
        name: $('.anime_info_body h1').text(),
        summary: $('span:contains("Plot Summary")').get(0).nextSibling.data,
        genres: $("span:contains('Genre')").parent().find('a').map((i, val) => $(val).attr('title'))
          .get(),
        episodes,
      }));
    });
  },
};

function getVideosFromVidstreaming(url) {
  return got(url)
  .then(bodyToCheerio)
  .then($ =>
    $('video source').map((i, val) => ({
      name: $(val).attr('label'),
      url: $(val).attr('src'),
    })).get());
}

function getVideoFromUrl(url) {
  return cHttp.request(url)
  .then(bodyToCheerio)
  .then(($) => {
    const vidStreaming = $('[data-video*="https://vidstreaming.io/"]').attr('data-video');

    if (vidStreaming != null) {
      return getVideosFromVidstreaming(vidStreaming);
    }

    return null;
  });
}

// Anime.search('Haikyuu').then(results => debug(results))

// Anime.fromUrl('https://ww1.gogoanime.io/category/tsugumomo').then(id => debug(id))

// getVideoFromUrl('https://ww1.gogoanime.io/atom-the-beginning-episode-5').then(vid => debug(vid))

// getEpisodesFromId(2477).then(eps => debug(eps))


Anime.search('Haikyuu').then((results) => {
  debug(results);
  Anime.fromUrl(results[0].url).then((anime) => {
    debug(anime);
    getVideoFromUrl(anime.episodes[0].url).then(video => debug(video));
  });
});
