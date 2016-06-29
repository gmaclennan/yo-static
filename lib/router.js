var createRouter = require('base-router')
var assign = require('object-assign')
var assert = require('assert')

var __config = require('./config')
var api = require('./api')
var render = require('./render')
var metadata = require('./metadata')
var pages = require('./pages')
var sanitizePath = require('./util').sanitizePath

var routes = {}

Object.keys(metadata.byUrlPath).forEach(function (urlPath) {
  routes[sanitizePath(urlPath) + ':slug/'] = contentRoute(urlPath)
})

Object.keys(pages).forEach(function (path) {
  routes[sanitizePath(path)] = pageRoute(path)
})

module.exports = createRouter(routes, {location: true})

function contentRoute (path) {
  return function (params, done) {
    var permalink = (params && params.slug) ? path + '/' + params.slug : path
    var meta = metadata.byPermalink[permalink]
    api.get(meta.filename, function (err, html) {
      if (err) return done(err)
      var page = assign({}, meta, {content: html})
      done(null, render.content(page))
    })
  }
}

function pageRoute (path) {
  assert.equal(typeof pages[path], 'function',
    'Expected a function, check the export of \n`' +
    __config.pages_dir + '/' + path + '`')
  return function () {
    return render.page(pages[path], path)
  }
}
