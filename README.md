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

> [`yo-yo`][8] static isomorphic site generator

`yo-static` builds a static site that loads as a single-page site in the browser using [`yo-yo`][8] both in the browser but also for building the site.

It is inspired by [**@shama**][11]'s website [dontkry.com][9] and borrows a lot of ideas from [jekyll][10]

Still experimental, things will change, and some docs are needed!

[8]: https://github.com/maxogden/yo-yo
[9]: https://github.com/shama/dontkry.com
[10]: https://jekyllrb.com
[11]: https://github.com/shama

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

To serve a site locally for development:

```
yo-static serve
```

To build a site for deployment:

```
yo-static build
```

Your site will be in `_site`

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Gregor MacLennan
