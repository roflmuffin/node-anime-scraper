const cheerio = require('cheerio');
const CloudHttp = require('../libs/http');
const debug = require('debug')('anime-scraper');
const html = require('./html');
const Promise = require('bluebird');
const _ = require('lodash');

const BASE_URL = 'https://gogoanime.io';

const cHttp = new CloudHttp();

class Page {
  static fromResponse(response) {
    return cheerio.load(response.body);
  }

  static fromUrl(url, options = {}) {
    return cHttp.request(url, options).then(Page.fromResponse);
  }
}

class Episode {
  constructor({
    name,
    url,
    videoLinks
  }) {
    this.name = name || null;
    this.url = url || null;
    this.videoLinks = videoLinks || null;
  }

  fetch() {
    return Page.fromUrl(this.url).then(html.parseVideo).then((videoLinks) => {
      this.videoLinks = videoLinks;
    }).then(() => this);
  }
}

class Anime {
  constructor({
    name,
    url,
    id,
    summary,
    genres,
    released,
    episodes
  }) {
    this.name = name || null;
    this.url = url || null;
    this.id = id || null;
    this.summary = summary || null;
    this.genres = genres || null;
    this.released = released || null;
    this.episodes = episodes || null;
    debug(`Anime created: ${this}`);
  }

  fetchEpisodes() {
    const url = BASE_URL + '/load-list-episode';

    const options = {
      query: {
        ep_start: 0,
        ep_end: 2000,
        id: this.id,
      }
    };

    return Page.fromUrl(url, options).then(html.parseEpisodeListing).then((episodes) => {
      this.episodes = episodes.map(x => new Episode(x));
    }).then(() => this);
  }

  fetchAllEpisodes() {
    debug(`Fetching all episodes for anime: ${this}`);
    return Promise.map(this.episodes, episode => episode.fetch(), {
        concurrency: 1
      })
      .then(() => this);
  }

  fetchInformation() {
    return Anime.fromUrl(this.url).then((anime) => {
      _.merge(this, anime);
    }).then(() => this);
  }

  toString() {
    return `${this.name} (${this.id}).`;
  }

  static fromName(name) {

    return Anime.search(name).then((results) => {

      return results[0]
    }).then(result => result.toAnime());
  }

  static fromPage($) {
    return new Anime(html.parseAnimePage($)).fetchEpisodes();
  }

  static fromUrl(url) {
    return Page.fromUrl(url).then(Anime.fromPage);
  }

  static fromSearchResult(result) {
    return Anime.fromUrl(result.url);
  }

  static search(query) {
    const url = `${BASE_URL}/search.html`;

    const options = {
      method: 'GET',
      query: {
        keyword: query
      },
    };

    debug(`Running search for ${query}`);

    return Page.fromUrl(url, options).then(html.parseSearchResults)
      .then(results => results.map(x => new SearchResult(x)));
  }
}

class SearchResult {
  constructor({
    name,
    url
  }) {
    this.name = name || null;
    this.url = url || null;
    debug(`Search result created: ${this.name}`);
  }

  toAnime() {
    return Anime.fromSearchResult(this);
  }
}



module.exports = {
  Page,
  Anime,
  Episode,
  SearchResult,
};
