Promise = require 'bluebird'
fs = Promise.promisifyAll(require 'fs')
path = require 'path'
debug = require('debug')('cookies')
_ = require 'lodash'

class KissCookie
  DEFAULT_OPTIONS =
    directory: 'data'
    cookie_filename: 'cloudflare.cookie'

  constructor: (options) ->
    @options = _.merge(DEFAULT_OPTIONS, options)
    @options.directory = path.join __dirname, '..', @options.directory
    @options.cookie_path =
      path.join @options.directory, @options.cookie_filename

  saveCookie: (cookie_string) ->
    if (!fs.existsSync @options.directory)
      fs.mkdirSync @options.directory

    fs.writeFileSync @options.cookie_path, cookie_string

  loadCookie: ->
    if (fs.existsSync @options.cookie_path)
      return fs.readFileSync(@options.cookie_path).toString().trim()
    else
      return ''

module.exports = KissCookie
