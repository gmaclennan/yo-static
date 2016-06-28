# yo-static

![stability][1]
[![travis][2]][3]
[![npm version][4]][5]
[![js-standard-style][6]][7]

[1]: https://img.shields.io/badge/stability-experimental-orange.svg
[2]: https://travis-ci.org/gmaclennan/yo-static.svg
[3]: https://travis-ci.org/gmaclennan/yo-static
[4]: https://img.shields.io/npm/v/yo-static.svg
[5]: https://www.npmjs.com/package/yo-static
[6]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[7]: http://standardjs.com/

> [`yo-yo`][8] single-page website and isomorphic static site generator

`yo-static` is a tiny library (11.1kb minified and gzipped) that helps you build a fast, single-page website. It also generates a static version of the site that you can upload to [Github Pages][13] or [Amazon S3][14] so you get fast loading pages and search engine SEO without needing to maintain a server. Whatever page you enter the site, from there it acts as a single-page app.

`yo-static` uses the excellent [`yo-yo`][8] library under the hood, and recommends you do too, but it doesn't really care what you use. Pages and Layouts are just javascript functions that should return a DOM element that will be rendered into `document.body`.

Content pages are markdown, with [YAML Front Matter][15]. Markdown is rendered as `html` and passed as a parameter to the layout functions.

`yo-static` is inspired by [@shama][11]'s website [dontkry.com][9] and borrows a lot of ideas from [jekyll][10].

Needs some docs! For now check [digidem/digital-democracy.org/tree/yo-yo][12] (also WIP)

[8]: https://github.com/maxogden/yo-yo
[9]: https://github.com/shama/dontkry.com
[10]: https://jekyllrb.com
[11]: https://github.com/shama
[12]: https://github.com/digidem/digital-democracy.org/tree/yo-yo
[13]: https://pages.github.com
[14]: https://aws.amazon.com/s3/
[15]: http://assemble.io/docs/YAML-front-matter.html

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```
npm i -g yo-static
```

## Usage

Create pages by creating javascript files in a `_pages` folder. They must export a function that will receive a `props` argument and must return a DOM element that will be rendered to the page body.

```js
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
```

Create content by creating markdown files in a `_content` folder. You can define a layout in YAML front matter or a default layout will be used.

Create layouts as javascript files in a `_layouts`, the content will be available as the second argument:

```js
var yo = require('yo-yo')

module.exports = function defaultLayout (props, children) {
  return yo`<body>
    ${children}
  </body>`
}
```

To serve a site locally for development:

```
yo-static serve
```

To build a site for deployment:

```
yo-static build
```

Your site will be in `_site`

## Development Status

This is experimental. As we figure out the best API, things might change and things might break (we don't have good test coverage yet, but would welcome [contributions](#Contribute)).

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Gregor MacLennan
