var bulk = require('bulk-require')
var assert = require('assert')
var yo = require('yo-yo')

var metadata = require('./metadata')
var __config = require('./config')
var siteConfig = require(__config.config_file)
var renderHead = require('../components/head')
var isDomElement = require('./util').isDomElement

var layouts = bulk(__config.layouts_dir, ['*.js'], {index: false})

if (typeof layouts.default !== 'function') {
  console.warn('No default layout found.\n' +
    'You should put a layout `default.js` in your `' + __config.layouts_dir + '`\n' +
    'folder, it will be used for any content pages which do not have a layout\n' +
    'property defined in the yaml front matter.')
  layouts.default = require('../components/default-layout')
}

module.exports = {
  content: renderContent,
  page: renderPage
}

if (process.env.NODE_ENV !== 'production') {
  module.exports.render = render
  module.exports.updateTitleFromHead = updateTitleFromHead
  module.exports.ensureNotWrappedWithBody = ensureNotWrappedWithBody
}

function renderContent (page, path) {
  assert.equal(typeof page.content, 'string',
    'Missing content for page: ' + JSON.stringify(page, null, 2))

  var layout = layouts[page.layout] || layouts.default
  assert.equal(typeof layout, 'function')

  var content = yo([
    '<div id="__yo_static_content" data-src="' + page.filename + '">',
    page.content,
    '</div>'
  ])
  var props = {
    page: page,
    site: siteConfig,
    categories: metadata.byFilePath
  }

  var el = layout(props, content)
  assert(isDomElement(el),
    'Expected an HTMLElement. Check the layout function \n`' +
    __config.layouts_dir + '/' + (page.layout || 'default') + '.js`\n' +
    'and ensure it is returning a valid DOM HTMLElement')

  return render(el, props, path)
}

function renderPage (page, path) {
  assert.equal(typeof page, 'function')

  var pageStaticProps = Object.keys(page).reduce(function (p, v) {
    p[v] = page[v]
    return p
  }, {})

  var props = {
    page: pageStaticProps,
    site: siteConfig,
    categories: metadata.byFilePath
  }

  var el = page(props)
  assert(isDomElement(el),
    'Expected an HTMLElement. Check the layout function \n`' +
    __config.pages_dir + '/' + path + '.js`\n' +
    'and ensure it is returning a valid DOM HTMLElement')

  return render(el, props)
}

function render (body, props, path) {
  body = ensureNotWrappedWithBody(body)
  var head = renderHead(props)
  assert(isDomElement(head),
    'Expected an HTMLElement. Check the component \n`' +
    __config.head_component + '`\n' +
    'and ensure it is returning a valid DOM HTMLElement')
  assert(head.tagName.toLowerCase() === 'head',
    'Head should be wrapped in <head> tags, \n' +
    'check the component ' + __config.head_component)

  if (process.browser && process.env.NODE_ENV !== 'production') {
    // In development, make sure we don't overwrite the livereload.js <script> tag
    var livereloadScript = document.querySelector('script[src*="livereload.js"]')
    livereloadScript && body.appendChild(livereloadScript)
  }
  if (process.browser) {
    updateTitleFromHead(head)
    // TODO: Update metadata and other head tags, but don't override dynamically inserted scripts
    return body
  } else {
    return yo`<html>
      ${head}
      <body>
        <div id="__yo_static_root">
          ${body}
        </div>
        <script src="/bundle.js"></script>
      </body>
    </html>`
  }
}

// For a given dom fragment `head`, parse the `<title>` and update the
// current document title - replacing the <head> dom node dynamincally
// does not update the document title
function updateTitleFromHead (head) {
  var titleNodes = head.getElementsByTagName('title')
  assert(titleNodes.length > 0,
    'Head component should include a <title> tag\n' +
    'check the function `' + __config.head_component + '`')

  if (titleNodes && titleNodes[0].innerHTML !== '') {
    document.title = titleNodes[0].innerHTML
  }
}

function ensureNotWrappedWithBody (el) {
  if (el.tagName.toLowerCase() !== 'body') return el
  console.warn('Deprecated: layouts should no longer be wrapped in <body>\n' +
    'See https://github.com/gmaclennan/yo-static/issues/3')
  var children = Array.prototype.slice.call(el.childNodes)
  return yo`<div>${children}</div>`
}
