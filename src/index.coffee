Promise = require 'bluebird'
debug = require('debug')('scraper')
cheerio = require 'cheerio'
Bottleneck = require 'bottleneck'
KissHTTP = require './http-wrapper'

KISS_URL = 'https://kissanime.to'

k = new KissHTTP()
b = new Bottleneck(0, 500)

class KissPage
  constructor: (@url, @_buffer) ->
    @_$ = cheerio.load(@_buffer)

  getTableRows: ->
    arr = []

    @_$(".listing tr")
      .not(".head")
      .not("[style]")
      # Ignore the top row of every page
      .not(":contains(Episode name)")
      .not(":contains(Anime name)")
      .each (index, value) =>
        nameTag = @_$(value).children("td").first().find("a")
        altText = @_$(value).children("td").eq(1)
        result =
          name: nameTag.text().trim()
          url: "#{KISS_URL}#{nameTag.attr("href")}"
          alt: altText.text().trim()
        arr[index] = result

    return arr

  getQualityList: ->
    arr = []

    @_$('#selectQuality > option').each (index, value) =>
      name = @_$(value).text()
      url = @_$(value).attr('value')
      buf = new Buffer(url, 'base64')
      url = buf.toString('utf-8')
      arr[index] =
        name: name
        url: url

    return arr

  @fromUrl: (url) ->
    k.request(url).then (resp) ->
      return new KissPage(url, resp.body)

class Video
  constructor: (obj) ->
    {@name, @url} = obj

class SearchResult
  constructor: (obj) ->
    {@name, @url, @last_episode} = obj

  toAnime: ->
    return Anime.fromUrl(@url)

class Episode
  constructor: (obj) ->
    {@name, @url, @video_links, @anime_name, @anime_url} = obj

  @fromUrl: (url) ->
    KissPage.fromUrl(url).then (page) ->
      if page._buffer.indexOf('has not been released yet') > -1
        throw new Error('Invalid episode/not released.')
      debug page
      return new Episode
        anime_name: page._$("#navsubbar a").text().replace("Anime", "").replace("information", "").trim()
        anime_url: page._$("#navsubbar a").attr('href')
        name: page._$("meta[name='keywords']").attr('content').split(',')[0]
        url: url
        video_links: page.getQualityList().map (row) -> return new Video(row)

  fetch: ->
    return Episode.fromUrl(@url)

class Anime
  constructor: (obj) ->
    {@name, @url, @summary, @genres
      @names, @episodes} = obj

  @fromUrl: (url) ->
    KissPage.fromUrl(url).then (page) ->
      # If we have the home page, something has gone wrong.
      if page._$('title').text().trim() == 'KissAnime - Watch anime online in high quality'
        throw new Error('KissAnime returned an error.')

      return new Anime
        url: page.url
        name: page._$(".bigChar").text().trim()
        summary: page._$("p:contains('Summary')").next().text().trim()
        genres: page._$("span:contains('Genres')").parent().text()
          .replace('Genres:', '').trim().split(',').map (s) -> return s.trim()
        names: page._$("span:contains('Other name:')").parent().text()
          .replace('Other name:', '').trim().split(';').map (s) -> return s.trim()
        episodes: page.getTableRows().map (e) -> return new Episode(e)

  @fromSearchResult: (searchResult) ->
    return Anime.fromUrl(searchResult.url)

  @search: (query) ->
    url = "#{KISS_URL}/AdvanceSearch"
    body = 'animeName=' + query + '&status=&genres='

    options =
      method: 'POST'
      body: body
      headers:
        'Content-Type': 'application/x-www-form-urlencoded'
        'Content-Length': Buffer.byteLength(body)

    debug 'Starting AdvanceSearch'
    k.request(url, options).then (resp) ->
      debug 'AdvanceSearch Ended'
      kiss_page = new KissPage(url, resp.body)
      rows = kiss_page.getTableRows()

      search_results = rows.map (row) ->
        row.last_episode = row.alt
        return new SearchResult(row)

      return search_results

  @fromName: (query) ->
    Anime.search(query).then (results) ->
      if results.length > 0
        return results[0].toAnime()
      else
        throw new Error('No anime found by that name.')

  fetchAllEpisodes: ->
    Promise.map @episodes, (episode) ->
      return episode.fetch()
    , {concurrency: 1}
    .then (episodes) =>
      return @episodes = episodes

module.exports =
  Anime: Anime
  Episode: Episode
  SearchResult: SearchResult
  Video: Video
