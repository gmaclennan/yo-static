var budo = require('budo')
var path = require('path')
var fs = require('fs')

var watch = require('./watch')
var config = require('../lib/config')
var staticConfig = require('../transforms/static-config')

var bulkify = require('bulkify')

var cwd = process.cwd()

module.exports = function serve (argv) {
  argv = argv || {}
  fs.unlink(config.metadata_file, function () {
    watch()
    budo(path.join(__dirname, '../index.js'), {
      pushstate: true,
      live: true,             // live reload
      watchGlob: '**/*.{html,css}',
      stream: process.stdout, // log to stdout
      dir: [
        path.join(cwd, '_site')
      ],
      verbose: true,
      browserify: {
        transform: [
          staticConfig(config),
          bulkify
        ],
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
