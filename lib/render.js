var assert = require('assert')
var yo = require('yo-yo')

var isDomElement = require('./util').isDomElement

module.exports = createRenderer

if (process.env.NODE_ENV !== 'production') {
  module.exports.render = render
  module.exports.updateTitleFromHead = updateTitleFromHead
  module.exports.ensureNotWrappedWithBody = ensureNotWrappedWithBody
}

function createRenderer (categories, layouts, renderHead, opts) {
  opts = opts || {}
  assert.ok(layouts)
  layouts.default = layouts.default
  assert.equal(typeof layouts.default, 'function')
  assert.equal(typeof renderHead, 'function')
  var siteConfig = opts.siteConfig || {}

  return {
    content: renderContent,
    page: renderPage
  }

  function renderContent (page) {
    assert.ok(page)
    assert.equal(typeof page.content, 'string',
      'Missing content for page: ' + JSON.stringify(page, null, 2))

    var layout = layouts[page.layout] || layouts.default
    assert.equal(typeof layout, 'function', 'missing or invalid layout: ' + page.layout)

    var content = yo([
      '<div id="__yo_static_content" data-src="' + page.filename + '">',
      page.content,
      '</div>'
    ])

    var props = {
      page: page,
      site: siteConfig,
      categories: categories
    }

    var el = layout(props, content)
    assert(isDomElement(el),
      'Expected an HTMLElement. Check the layout function \n`' +
      '<layouts_dir>/' + (page.layout || 'default') + '.js`\n' +
      'and ensure it is returning a valid DOM HTMLElement')

    return render(el, renderHead(props), props)
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
      categories: categories
    }

    var el = page(props)
    assert(isDomElement(el),
      'Expected an HTMLElement. Check the layout function \n`' +
      '<content_dir>/' + path + '.js`\n' +
      'and ensure it is returning a valid DOM HTMLElement')

    return render(el, renderHead(props), props)
  }
}

function render (body, head, props) {
  body = ensureNotWrappedWithBody(body)
  body.id = '__yo_static_root'
  assert(isDomElement(head),
    'Expected an HTMLElement. Check your config.head_componment \n' +
    'and ensure it is returning a valid DOM HTMLElement')
  assert(head.tagName.toLowerCase() === 'head',
    'Head should be wrapped in <head> tags, \n' +
    'check the component config.head_component')

  if (process.browser) {
    updateTitleFromHead(head)
    // TODO: Update metadata and other head tags, but don't override dynamically inserted scripts
    return body
  } else {
    return yo`<html>
      ${head}
      <body>
        ${body}
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
    'check the function `config.head_component`')

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
