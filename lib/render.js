var bulk = require('bulk-require')
var assert = require('assert')
var yo = require('yo-yo')

var metadata = require('./metadata')
var __config = require('./config')
var siteConfig = require(__config.config_file)
var renderHead = require('../components/head')

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

function renderContent (page) {
  assert.equal(typeof page.content, 'string',
    'Missing content for page: ' + JSON.stringify(page, null, 2))

  var layout = layouts[page.layout] || layouts.default
  assert.equal(typeof layout, 'function')

  var content = yo(['<div>', page.content, '</div>'])
  var props = {
    page: page,
    site: siteConfig,
    categories: metadata.byFilePath
  }

  return render(layout(props, content), props)
}

function renderPage (page) {
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

  return render(page(props), props)
}

function render (body, props) {
  body = ensureWrappedWithBody(body, 'body')
  var head = ensureWrappedWithHead(renderHead(props), 'head')

  if (process.browser && process.env.NODE_ENV !== 'production') {
    // In development, make sure we don't overwrite the livereload.js <script> tag
    var livereloadScript = document.querySelector('script[src*="livereload.js"]')
    body.appendChild(livereloadScript)
  }

  if (process.browser) {
    updateTitleFromHead(head)
    return body
  } else {
    return yo`<html>
      ${head}
      ${body}
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

// Wraps an element in a tag if it is not already so.
function ensureWrappedWithBody (el) {
  if (el.tagName.toLowerCase() === 'body') return el
  return yo`<body>${el}</body>`
}

// Wraps an element in a tag if it is not already so.
function ensureWrappedWithHead (el) {
  if (el.tagName.toLowerCase() === 'head') return el
  return yo`<head>${el}</head>`
}
