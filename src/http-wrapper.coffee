got = require 'got'
debug = require('debug')('test')
Promise = require 'bluebird'
cloudscraper = Promise.promisifyAll(require 'cloudscraper')
_ = require 'lodash'
cheerio = require 'cheerio'
Bottleneck = require 'bottleneck'

KissCookie = require './cookie-storage'
b = new Bottleneck(1, 0)

class InvalidUserAgentError extends Error
  constructor: ->
    @name = 'InvalidUserAgentError'
    @message = 'The user-agent used to request content
      differs from the user-agent accepted by Cloudflare.'
    Error.captureStackTrace(this, InvalidUserAgentError)

class InvalidCFCookieError extends Error
  constructor: ->
    @name = 'InvalidCFCookieError'
    @message = 'The the cloudflare cookie used to request content
      is no longer valid.'
    Error.captureStackTrace(this, InvalidCFCookieError)

class BlockedError extends Error
  constructor: (reason, body) ->
    $ = cheerio.load(body)
    reason = $('.barContent').text()
    @name = 'BlockedError'
    @message = "You have been blocked, the page states:  #{reason.trim()}"
    Error.captureStackTrace(this, BlockedError)

class MaxRetryError extends Error
  constructor: ->
    @name = 'MaxRetryError'
    @message = 'Retrieving page after 5 attempts failed.
      Something has most likely been broken by external forces.'
    Error.captureStackTrace(this, MaxRetryError)

class KissHTTP
  DEFAULT_OPTIONS =
    method: 'GET'
    headers:
      'user-agent': 'got/6.11 (https://github.com/sindresorhus/got)'
    followRedirect: true
    save_cookies: true

  constructor: (options) ->
    @options = _.merge(DEFAULT_OPTIONS, options)

    if @options.save_cookies
      @cookie_storage = new KissCookie()
      @options.headers.cookie = @cookie_storage.loadCookie()

  setDelay: (amount) ->
    b = new Bottleneck(1, amount)

  getFreshCookie: ->
    debug 'Retrieving fresh Cloudflare cookie.'
    return new Promise (resolve, reject) =>
      cloudscraper.get 'https://kissanime.ru', (err, resp) =>
        if (err)
          reject(new Error('Unable to bypass Cloudflare protection.'))
        else
          @options.headers.cookie = resp.request.headers.cookie
          if @options.save_cookies
            @cookie_storage.saveCookie(resp.request.headers.cookie)
          debug 'Fresh Cloudflare cookie retrieved.'
          resolve()
      , {'User-Agent': @options.headers['user-agent']}

  request: (url, options={retries: 0}) ->
    local_options = _.merge(@options, options)
    b.schedule(got, url, local_options)
      .then (resp) ->
        if resp.body.indexOf('Are you human?') > -1
          throw new BlockedError('Captcha Blocked', resp.body)
        else if resp.body.indexOf('does not allow unofficial apps') > -1
          throw new BlockedError('Blocked IP', resp.body)
        else
          return resp
      .catch (err) ->
        debug(err)
        if err instanceof BlockedError
          throw err
        else if err.name == 'HTTPError'
          debug("Received HTTP error retrieving URL: #{url}")
          throw err
        else if local_options.retries > 5
          throw new MaxRetryError()
        if err.name == 'InvalidCFCookieError'
          throw new InvalidCFCookieError()
        else throw err
      .catch (err) =>
        local_options.retries += 1
        if err.name == 'MaxRetryError' || err.name == 'BlockedError'
          throw err
        else
          @getFreshCookie().then =>
            @request(url, local_options)

module.exports = KissHTTP
