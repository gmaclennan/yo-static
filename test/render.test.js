const render = require('../lib/render')
const test = require('tape')
const yo = require('yo-yo')

const {
  // renderContent,
  // renderPage,
  // render,
  updateTitleFromHead,
  ensureNotWrappedWithBody
} = render

// Render helper functions

test('updateTitleFromHead', t => {
  const headNoTitle = yo`<head></head>`
  t.throws(updateTitleFromHead.bind(null, headNoTitle), /Head component should include a <title> tag/, 'Throws if no <title> tag present')
  t.end()
})

test('ensureNotWrappedWithBody', t => {
  const div = yo`<div>My Page</div>`
  const bodyTextNode = yo`<body>My Page</body>`
  const bodyDiv = yo`<body><div>My Page</div></body>`
  const bodyChildren = yo`<body>Hello<div>World</div><p>hello sun</p></body>`
  t.equal(div, ensureNotWrappedWithBody(div), 'passthrough if not wrapped in <body>')
  t.equal(toString(ensureNotWrappedWithBody(bodyTextNode)), '<div>My Page</div>', 'replaces <body> with div')
  t.equal(toString(ensureNotWrappedWithBody(bodyDiv)), '<div><div>My Page</div></div>', 'replaces <body> with div with nested <div>')
  t.equal(toString(ensureNotWrappedWithBody(bodyChildren)), '<div>Hello<div>World</div><p>hello sun</p></div>', 'replaces <body> with div with multiple children')
  t.end()
})

function toString (el) {
  return el.outerHTML || el.toString()
}
