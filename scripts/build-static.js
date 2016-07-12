'use strict'

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const mkdirp = require('mkdirp')
const parallelLimit = require('run-parallel-limit')

var cwd = process.cwd()
var gitignore = []

try {
  gitignore = fs.readFileSync(path.join(cwd, '.gitignore'), 'utf8')
    .split('\n')
    .filter(s => s.length && s.slice(0, 1) !== '#')
} catch (e) {}

module.exports = buildStatic

function buildStatic (config, cb) {
  config = config || {}
  Object.assign(config, require('../lib/config'))

  mkdirp.sync(config.site_dir)

  console.time('build static assets')

  glob('!(_|.){*,**/*}', {
    cwd: process.cwd(),
    ignore: config.blacklist.concat(gitignore),
    nodir: true
  }, function (err, files) {
    if (err) return cb ? cb(err) : console.error(err)
    if (!files.length) {
      console.timeEnd('build static assets')
      return cb && cb()
    }

    const tasks = files.map(function (file) {
      const src = path.resolve(cwd, file)
      const dst = path.join(config.site_dir, file)
      return function (cb) {
        fs.copy(src, dst, {clobber: true}, cb)
      }
    })

    parallelLimit(tasks, 10, function (err) {
      console.timeEnd('build static assets')
      cb ? cb(err) : err && console.error(err)
    })
  })
}
