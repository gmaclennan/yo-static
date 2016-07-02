const chokidar = require('chokidar')
const fs = require('fs-extra')
const path = require('path')
const deepEqual = require('deep-equal')
const debug = require('debug')('yo-static:watch')

const convertFile = require('./convert-file')
const config = require('../lib/config')

var cwd = process.cwd()

var gitignore = fs.readFileSync(path.join(cwd, '.gitignore'), 'utf8')
  .split('\n')
  .filter(s => s.length && s.slice(0, 1) !== '#')

module.exports = function watch () {
  debug('watching:', config.content_dir)
  var metadata = []
  var index = {}

  var mdWatcher = chokidar.watch('**/*.{md,mdown,markdown}', {
    cwd: config.content_dir
  })

  var staticWatcher = chokidar.watch('{*,**/*}', {
    cwd: cwd,
    ignored: ['.*', '_*', '_*/**'].concat(config.blacklist, gitignore)
  })

  staticWatcher.on('change', copyFile)
  staticWatcher.on('add', copyFile)
  staticWatcher.on('unlink', unlinkFile)

  config.renderer = require('markdown-it')(config.markdown_opts)
    .use(require('markdown-it-footnote'))

  mdWatcher.on('change', processChangedFile)
  mdWatcher.on('add', processNewFile)
  mdWatcher.on('unlink', processDeletedFile)

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

function copyFile (filepath) {
  const src = path.resolve(cwd, filepath)
  const dst = path.resolve(config.site_dir, filepath)
  fs.copy(src, dst, {clobber: true}, function (err) {
    if (err) return console.error(err)
    debug('Updated file:', filepath)
  })
}

function unlinkFile (filepath) {
  fs.unlink(path.resolve(config.site_dir, filepath), function (err) {
    if (err) return console.error(err)
    debug('Deleted file:', filepath)
  })
}
