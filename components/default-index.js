var yo = require('yo-yo')
var layout = require('./default-layout')

module.exports = function renderIndex () {
  return layout({
    content: yo`<p>Create an index.js file in your _pages folder to get started</p>`
  })
}
