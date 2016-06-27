var yo = require('yo-yo')

module.exports = function defaultLayout (props, children) {
  return yo`<body>
    <div>
      ${children}
    </div>
  </body>`
}
