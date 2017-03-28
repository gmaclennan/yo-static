var window = require('global/window')
var yo = require('yo-yo')

var __config = require('./lib/config')
var pages = require('./lib/pages')
var metadata = require('./lib/metadata')
var createRouter = require('./lib/router')
var createRenderer = require('./lib/render')
var captureAnchorClicks = require('./lib/util').captureAnchorClicks
var notFound = require('./components/404.js')
var siteConfig = require(__config.config_file)
var layouts = require('./lib/layouts')
var head = require('./lib/head')

var api = require('./lib/api')()

var el = document.getElementById('__yo_static_root')
var originalPath = window.location.pathname

// Pages are rendered on the server, and when they first load in the browser
// the api will try to load the content to replace the static HTML with
// dynamic content. We already have this content in the static HTML, so we
// grab that, and put it in the API cache, to avoid an unnecessary request
var bootstrappedContent = document.getElementById('__yo_static_content')
if (bootstrappedContent && bootstrappedContent.dataset.src) {
  api.cache(bootstrappedContent.dataset.src, bootstrappedContent.innerHTML)
}

var render = createRenderer(metadata.byFilePath, layouts, head, {siteConfig: siteConfig})

var router = createRouter(render, api)

router.addPageRoutes(pages)
router.addContentRoutes(metadata.byPermalink)

// Add trailing slash to missing routes and try again
router.on('error', function (route, err) {
  if (route.length > 1 && !/\/$/.test(route)) {
    return router.transitionTo(route + '/')
  }
  console.error(err)
  if (originalPath === route) {
    // We only get here in development, otherwise the server would 404
    yo.update(el, notFound({pathname: route, error: err}))
  } else {
    // When we don't have a route defined,
    // try to load a static resource from the server
    window.location = route
  }
})

router.on('loading', function () {
  // We can use this to style the page or add a :before overlay to show
  // loading state. This class is removed when the page loads.
  el.classList.add('yo-static-loading')
})

// On transition, render the app with the page
router.on('transition', function (route, page) {
  yo.update(el, page)
})

// Capture all non-outgoing clicks to call transitionTo instead
captureAnchorClicks(function (pathname) {
  router.transitionTo(pathname)
  // We don't store scroll state, so clicking 'back' will always return
  // to the top of the page
  window.scrollTo(0, 0)
})

// Start on path or /
router.transitionTo(window.location.pathname || '/')
