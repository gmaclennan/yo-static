var yo = require('yo-yo')
var assert = require('assert')

var __config = require('../lib/config')

var head
try {
  head = require(__config.head_component)
  assert.equal(typeof head, 'function')
} catch (e) {
  head = function (props) {
    return yo`<head>
      <meta charset="utf-8">
      <title>${props.site.title || 'Yo-Static'}</title>
    </head>`
  }
}

module.exports = head
