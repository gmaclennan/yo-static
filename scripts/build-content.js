'use strict'

const fs = require('fs')
const glob = require('glob')
const mkdirp = require('mkdirp')
const parallelLimit = require('run-parallel-limit')
const convertFile = require('./convert-file')

module.exports = buildContent

function buildContent (config, cb) {
  config = config || {}
  Object.assign(config, require('../lib/config'))

  config.renderer = require('markdown-it')(config.markdown_opts)
    .use(require('markdown-it-footnote'))

  mkdirp.sync(config.site_dir)

  console.time('build content')

  glob('**/*.{md,mdown,markdown}', { cwd: config.content_dir }, function (err, files) {
    if (err) return cb ? cb(err) : console.error(err)
    if (files.length === 0) {
      console.warn(`No markdown files found in path ${config.content_dir}`)
    }

    const tasks = files.map(function (file) {
      return function (cb) {
        convertFile(file, config, cb)
      }
    })

    parallelLimit(tasks, 10, function (err, metadata) {
      if (err) return cb ? cb(err) : console.error(err)
      // metadataJson is an array of metadata for all content files
      const metadataJson = JSON.stringify(metadata, null, 2)
      fs.writeFile(config.metadata_file, metadataJson, function (err) {
        if (err) return cb ? cb(err) : console.error(err)
        console.timeEnd('build content')
        if (cb) cb()
      })
    })
  })
}
