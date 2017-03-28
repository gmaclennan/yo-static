var bulk = require('bulk-require')
var assert = require('assert')

var __config = require('./config')

var layouts = bulk(__config.layouts_dir, ['*.js'], {index: false})

if (!layouts.default) {
  console.warn('No default layout found.\n' +
    'You should put a layout `default.js` in your `' + __config.layouts_dir + '`\n' +
    'folder, it will be used for any content pages which do not have a layout\n' +
    'property defined in the yaml front matter.')
  layouts.default = require('../components/default-layout')
}

Object.keys(layouts).forEach(function (name) {
  assert.equal(typeof layouts[name], 'function', 'Layouts must be functions, check `' +
    __config.layouts_dir + '/' + name + '`')
})

module.exports = layouts
