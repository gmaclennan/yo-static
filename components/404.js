var yo = require('yo-yo')
var layout = require('./default-layout')

// TODO: Put a descriptive error message here that tells the user
// why this is happening and what they need to do to fix it.
module.exports = function renderIndex (props) {
  var error = props.error
  if (error.message === 'model.node.cb is not a function') {
    error.name = 'Not Found'
    error.message = 'Cannot find a page or content for \n' +
      '`' + props.pathname + '`'
  }
  return layout({},
    yo`<body>
      <p><strong>${props.error && props.error.name}:</strong></p>
      <pre>${props.error && props.error.message}</pre>
    </body>`
  )
}
