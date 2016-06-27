var createRouter = require('base-router')
var assign = require('object-assign')
var assert = require('assert')

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
    assert(params && params.slug,
      'contentRoute expects a slug param')

    var meta = metadata.byPermalink[path + '/' + params.slug]
    api.get(meta.filename, function (err, html) {
      if (err) return done(err)
      var page = assign({}, meta, {content: html})
      done(null, render.content(page))
    })
  }
}

function pageRoute (path) {
  return function () {
    return render.page(pages[path])
  }
}
