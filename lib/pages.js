var bulk = require('bulk-require')
var flatten = require('flat')

var __config = require('./config')

var pages = bulk(__config.pages_dir, ['**/*.js'], {index: false})

if (typeof pages.index !== 'function') {
  console.warn('No root index page found.\n' +
    'You should put a page `index.js` in your `' + __config.pages_dir + '` folder')
  pages.index = require('../components/default-index')
}

module.exports = flatten(pages, {delimiter: '/'})
