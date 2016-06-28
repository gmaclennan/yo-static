var yo = require('yo-yo')
var router = require('./lib/router')
var captureAnchorClicks = require('./lib/util').captureAnchorClicks

var el = document.body

// Add trailing slash to missing routes and try again
router.on('error', function (route, err) {
  if (route.length > 1 && !/\/$/.test(route)) {
    return router.transitionTo(route + '/')
  }
  console.log(router, err)
})

// On transition, render the app with the page
router.on('transition', function (route, page) {
  yo.update(el, page)
})

// Capture all non-outgoing clicks to call transitionTo instead
captureAnchorClicks(function (pathname) {
  router.transitionTo(pathname)
  window.scrollTo(0, 0)
})

// Start on path or /
router.transitionTo(window.location.pathname || '/')
