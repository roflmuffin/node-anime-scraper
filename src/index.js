const cheerio = require('cheerio');
const debug = require('debug')('anime-scraper');
const CloudHttp = require('../libs/http');

const BASE_URL = 'https://ww1.gogoanime.io';

const cHttp = new CloudHttp()

function getEpisodesFromId(id) {
  const url = 'https://ww1.gogoanime.io/load-list-episode';
  const params = {
    ep_start: 0,
    ep_end: 2000,
    id,
  };

  return cHttp.request(url, { query: params }).then((resp) => {
    const $ = cheerio.load(resp.body);

    const episodes = $('li a');

    return episodes.map((i, value) => ({
      name: $(value).find('.name').text().trim(),
      url: `${BASE_URL}${$(value).attr('href').trim()}`,
    })).get().reverse();
  });
}

Anime = {
  search(query) {
    const url = `${BASE_URL}/search.html`;

    const options = {
      method: 'GET',
      query: { keyword: query },
    };

    return cHttp.request(url, options).then((resp) => {
      const $ = cheerio.load(resp.body);
      const results = $('.items li .name a');

      return results.map((i, value) => ({
        name: $(value).text(),
        url: `${BASE_URL}${$(value).attr('href')}`,
      })).get();
    });
  },

  fromUrl(url) {
    return cHttp.request(url).then((resp) => {
      const $ = cheerio.load(resp.body);

      const id = $('#movie_id').val()

      const params = {
        ep_start: 0,
        ep_end: 2000,
        id: id,
      }

      cHttp.request('https://ww1.gogoanime.io/load-list-episode', { query: params }).then(eps => debug(eps))

      // const anime = {
      //   id: $('#movie_id').val(),
      //   name: $('.anime_info_body h1').text(),
      //   summary: $('span:contains("Plot Summary")').get(0).nextSibling.data,
      //   genres: $("span:contains('Genre')").parent().find('a').map((i, val) => $(val).attr('title')).get(),
      // };
      //
      // debug(anime)


      //return id;
    })
  }
};

// Anime.search('Haikyuu').then(results => debug(results))

// Anime.fromUrl('https://ww1.gogoanime.io/category/haikyuu').then(id => debug(id))

getEpisodesFromId(2477).then(eps => debug(eps))
