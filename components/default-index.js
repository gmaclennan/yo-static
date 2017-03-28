var yo = require('yo-yo')
var layout = require('./default-layout')

module.exports = function renderIndex (props) {
  return layout({},
    yo`<div>
      <h1>Welcome to Yo-Static</h1>
      <p>Create an <code>index.js</code> file in <code>${props.site.pages_dir}</code>
      and add some markdown files to <code>${props.site.content_dir}</code> to get started</p>`
  )
}
