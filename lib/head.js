var assert = require('assert')

var __config = require('./config')

var head
try {
  head = require(__config.head_component)
  assert.equal(typeof head, 'function', 'Your head component should be a function\n' +
    'that returns a DOM element. Check the file `' + __config.head_component + '`\n' +
    'to ensure that it exports a function')
} catch (e) {
  head = require('../components/default-head')
}

module.exports = head
