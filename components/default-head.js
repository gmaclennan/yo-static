var yo = require('yo-yo')

module.exports = function defaultHead (props) {
  return yo`<head>
    <meta charset="utf-8">
    <title>${props.site.title || 'Yo-Static'}</title>
  </head>`
}
