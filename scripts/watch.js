const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const deepEqual = require('deep-equal')
const debug = require('debug')('yo-static:watch')

const convertFile = require('./convert-file')
const config = require('../lib/config')

module.exports = function watch () {
  debug('watching:', config.content_dir)
  var metadata = []
  var index = {}

  var watcher = chokidar.watch('**/*.{md,mdown,markdown}', {
    cwd: config.content_dir
  })

  config.renderer = require('markdown-it')(config.markdown_opts)
    .use(require('markdown-it-footnote'))

  watcher.on('change', processChangedFile)
  watcher.on('add', processNewFile)
  watcher.on('unlink', processDeletedFile)

  function processChangedFile (filepath) {
    debug('File modified:', filepath)
    convertFile(filepath, config, function (err, fileMetadata) {
      if (err) return console.error(err)
      debug('Updated content file:', fileMetadata.filename)
      var dirty = false
      index[filepath] = fileMetadata
      metadata = metadata.map(function (m) {
        if (m.filename === fileMetadata.filename && !deepEqual(m, fileMetadata)) {
          dirty = true
          return fileMetadata
        }
        return m
      })
      if (dirty) writeMetadata(metadata)
    })
  }

  function processNewFile (filepath) {
    debug('File added:', filepath)
    convertFile(filepath, config, function (err, fileMetadata) {
      if (err) return console.error(err)
      debug('Added content file:', fileMetadata.filename)
      // TODO: We should probably maintain some kind of sort order?
      index[filepath] = fileMetadata
      metadata.push(fileMetadata)
      writeMetadata(metadata)
    })
  }

  function processDeletedFile (filepath) {
    debug('File deleted:', filepath)
    var fileMetadata = index[filepath]
    fs.unlink(path.join(config.site_dir, fileMetadata.filename), function (err) {
      if (err) return console.error(err)
      debug('Deleted content file:', fileMetadata.filename)
      metadata = metadata.filter(function (m) {
        return m.filename !== fileMetadata.filename
      })
      writeMetadata(metadata)
    })
  }
}

// TODO: Should probably batch these changes because this is called multiple
// times when the watch script is first started and all files are added
function writeMetadata (metadata, cb) {
  fs.writeFile(config.metadata_file, JSON.stringify(metadata), function (err) {
    if (err) return console.error(err)
    debug('Updated metadata:', config.metadata_file)
    if (cb) return cb(err)
  })
}
