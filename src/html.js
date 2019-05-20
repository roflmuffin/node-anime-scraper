const cheerio = require('cheerio');
const got = require('got');
const debug = require('debug')('anime-scraper-html');

const BASE_URL = 'https://gogoanime.io';

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
        $('.linkserver').map((i, val) => {
          val = $(val);
          var source = val.attr('data-video');
          var type = "iframe"
          if (!source && val.hasClass("active")) {
            $('script').each((i, el) => {
              var html = $(el).html();
              var ind = html.indexOf("playerInstance.setup({");
              if (ind != -1) {

                ind += "playerInstance.setup({".length;
                var curly = 1;
                var text = false;
                var results = [];
                var str = "";
                for (; ind < html.length; ind++) {
                  var char = html.charAt(ind);

                  if (char == "'") {
                    text = !text
                    if (!text) {
                      results.push(str)
                      str = "";
                    }
                  } else if (!text && char == "{") {
                    curly++;
                  } else if (!text && char == "}") {
                    curly--;
                    if (curly == 0) break;
                  } else if (text) {
                    str += char
                  }

                }
                source = results[0]
                type = "source"
              }
            })
          }
          return {
            name: val.text(),
            url: source,
            type: type
          }
        }).get());
  },
};

function parseVideo($) {

  const vidStreaming = $('[data-video*="//vidstreaming.io/"]').attr('data-video');
  debug(`Found Vidstreaming link: ${vidStreaming}`);

  if (vidStreaming != null) {
    return VideoProviders.Vidstreaming("http:" + vidStreaming);
  }

  return null;
}


module.exports = {
  parseSearchResults,
  parseEpisodeListing,
  parseAnimePage,
  parseVideo,
};
