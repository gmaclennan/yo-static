var baseRouter = require('base-router')
var assign = require('object-assign')
var assert = require('assert')

var api = require('./api')
var sanitizePath = require('./util').sanitizePath

module.exports = function createRouter (render) {
  assert(render, 'must pass a renderer to the router')
  assert.equal(typeof render.content, 'function', 'renderer must implement render.content method')
  assert.equal(typeof render.page, 'function', 'renderer must implement render.page method')

  var router = baseRouter(null, {location: true})

  router.addContentRoutes = function (metadataByPermalink) {
    assert.ok(metadataByPermalink)
    Object.keys(metadataByPermalink).forEach(function (permalink) {
      var path = sanitizePath(permalink)
      router.addRoute(path, contentRoute(metadataByPermalink[permalink]))
    })
  }

  router.addPageRoutes = function (pages) {
    assert.ok(pages)
    Object.keys(pages).forEach(function (permalink) {
      var path = sanitizePath(permalink)
      router.addRoute(path, pageRoute(pages[permalink], permalink))
    })
  }

  return router

  function contentRoute (metadata) {
    return function (params, done) {
      api.get(metadata.filename, function (err, html) {
        if (err) return done(err)
        var page = assign({}, metadata, {content: html})
        done(null, render.content(page))
      })
    }
  }

  function pageRoute (createPage, permalink) {
    assert.equal(typeof createPage, 'function',
      'Expected a function, check the export of page \n`' +
      permalink + '`')
    return function () {
      return render.page(createPage)
    }
  }
}
