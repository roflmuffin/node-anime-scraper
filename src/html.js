const cheerio = require('cheerio');
const got = require('got');
const debug = require('debug')('anime-scraper-html');

const BASE_URL = 'https://ww1.gogoanime.io';

// Search Results
function parseSearchResults($) {
  const results = $('.items li .name a');

  return results.map((i, value) => ({
    name: $(value).text(),
    url: `${BASE_URL}${$(value).attr('href')}`,
  })).get();
}

// Episode
function parseEpisodeListing($) {
  const episodes = $('li a');

  return episodes.map((i, value) => ({
    name: $(value).find('.name').text().trim(),
    url: `${BASE_URL}${$(value).attr('href').trim()}`,
  })).get().reverse();
}

// Anime
function parseAnimePage($) {
  return {
    id: $('#movie_id').val(),
    url: `${BASE_URL}${$('[rel="canonical"]').attr('href')}`,
    name: $('.anime_info_body h1').text(),
    summary: $('span:contains("Plot Summary")').get(0).nextSibling.data,
    genres: $("span:contains('Genre')").parent().find('a').map((i, val) => $(val).attr('title'))
      .get(),
  };
}

// Video
const VideoProviders = {
  Vidstreaming(url) {
    return got(url).then(resp => cheerio.load(resp.body))
    .then($ =>
      $('video source').map((i, val) => ({
        name: $(val).attr('label'),
        url: $(val).attr('src'),
      })).get());
  },
};

function parseVideo($) {
  const vidStreaming = $('[data-video*="https://vidstreaming.io/"]').attr('data-video');
  debug(`Found Vidstreaming link: ${vidStreaming}`);

  if (vidStreaming != null) {
    return VideoProviders.Vidstreaming(vidStreaming);
  }

  return null;
}


module.exports = {
  parseSearchResults,
  parseEpisodeListing,
  parseAnimePage,
  parseVideo,
};
