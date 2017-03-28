var budo = require('budo')
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')

var deleteSite = require('./delete-site')
var watch = require('./watch')
var config = require('../lib/config')
var staticVars = require('../transforms/static-vars')
var bulkify = require('bulkify')

var cwd = process.cwd()

var userTransforms = require('./user-transforms')

module.exports = function serve (argv) {
  argv = argv || {}
  deleteSite()
  mkdirp.sync(config.site_content_dir)
  fs.writeFile(config.metadata_file, '[]', function (err) {
    if (err) throw err
    watch()
    budo(path.join(__dirname, '..', 'index.js'), {
      pushstate: true,
      live: true,             // live reload
      watchGlob: '**/*.{html,css}',
      stream: process.stdout, // log to stdout
      dir: [
        path.join(cwd, '_site'),
        cwd
      ],
      verbose: true,
      browserify: {
        transform: [
          [staticVars, {__config: config}],
          bulkify
        ].concat(userTransforms),
        debug: true
      },
      defaultIndex: function () {
        return fs.createReadStream(
          path.join(__dirname, '../index.html'),
          {encoding: 'utf8'}
        )
      }
    })
  })
}
