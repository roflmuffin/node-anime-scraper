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
    released: $("span:contains('Released')").get(0).nextSibling.data
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
          var out = {
            name: val.text(),
            url: source,
            type: "iframe"
          }
          if (!source && val.hasClass("active")) {
            $('script').each((i, el) => {
              var html = $(el).html();
              var ind = html.indexOf("window.urlVideo = '");

              if (ind != -1) {
                ind += "window.urlVideo = '".length;
                var results = [""];
                for (; ind < html.length; ind++) {
                  var char = html.charAt(ind);
                  if (char == "'") {
                    break;
                  } else {
                    results.push(char);

                  }
                }
                out.url = results.join("");
                out.type = "source";

              } else {
                ind = html.indexOf("playerInstance.setup({");
                if (ind != -1) {

                  ind += "playerInstance.setup({".length;
                  var curly = 1;
                  var text = false;
                  var results = ["{"];
                  var str = "";
                  for (; ind < html.length; ind++) {
                    var char = html.charAt(ind);
                    results.push(char)
                    if (char == "'") {
                      text = !text

                    } else if (!text && char == "{") {
                      curly++;
                    } else if (!text && char == "}") {
                      curly--;
                      if (curly == 0) break;
                    }

                  }
                  var parsed = results.join("")

                    // Replace ":" with "@colon@" if it's between double-quotes
                    .replace(/:\s*"([^"]*)"/g, function (match, p1) {
                      return ': "' + p1.replace(/:/g, '@colon@') + '"';
                    })

                    // Replace ":" with "@colon@" if it's between single-quotes
                    .replace(/:\s*'([^']*)'/g, function (match, p1) {
                      return ': "' + p1.replace(/:/g, '@colon@') + '"';
                    })

                    // Add double-quotes around any tokens before the remaining ":"
                    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')

                    // Turn "@colon@" back into ":"
                    .replace(/@colon@/g, ':')
                    .replace(/(.*?),\s*(\}|])/g, "$1$2");

                  try {

                    parsed = JSON.parse(parsed);
                  } catch (e) {

                    return;
                  }
                  var max = null;
                  parsed.sources.forEach((item) => {
                    if (item.file) {
                      if (!max) max = item;
                      if ((parseInt(item.label) || 0) > (parseInt(max.label) || 0)) {
                        max = item;
                      }
                    }
                  })
                  out.url = max.file;
                  out.type = "source"
                  out.quality = max.label;
                  out.sources = parsed.sources;
                }
              }
            })
          }
          return out
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
