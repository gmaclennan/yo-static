var window = require('global/window')
var assert = require('assert')

module.exports = {
  captureAnchorClicks: captureAnchorClicks,
  sanitizePath: sanitizePath
}

// handle a click if is anchor tag with an href
// and url lives on the same domain. Replaces
// trailing '#' so empty links work as expected.
// fn(str) -> null
function captureAnchorClicks (cb) {
  assert.equal(typeof cb, 'function', 'callback must be a function')

  window.onclick = function (e) {
    var node = (function traverse (node) {
      if (!node) return
      if (node.localName !== 'a') return traverse(node.parentNode)
      if (node.href === undefined) return traverse(node.parentNode)
      if (window.location.host !== node.host) return traverse(node.parentNode)
      return node
    })(e.target)

    if (!node) return

    e.preventDefault()
    var pathname = node.pathname.replace(/#$/, '')
    cb(pathname)
  }
}

// Route paths should start and end in a `/` and `index` should be ignored
function sanitizePath (path) {
  assert.equal(typeof path, 'string')
  path = path.split('/').filter(function (s) {
    return s !== '' && s !== 'index'
  }).join('/')
  return path.length > 0 ? '/' + path + '/' : '/'
}
