const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const matter = require('gray-matter')
const slugify = require('slug')
const toTitleCase = require('titlecase')

module.exports = convertFile

// Convert a file to markdown and return parsed metadata
function convertFile (file, opts, cb) {
  const src = path.resolve(opts.content_dir, file)
  const dst = path.join(opts.site_content_dir, replaceExt(file, '.html'))
  fs.readFile(src, 'utf8', function (err, str) {
    if (err) return cb(err)
    mkdirp(path.dirname(dst), function (err) {
      if (err) return cb(err)
      const parts = matter(str)
      const metadata = parseMetadata(parts.data, file, opts)
      const html = opts.renderer.render(parts.content)
      fs.writeFile(dst, html, function (err) {
        cb(err, metadata)
      })
    })
  })
}

function parseMetadata (frontMatter, file, opts) {
  // Ensure any permalink set by the user is a valid url slug
  // and replace any trailing slash
  if (frontMatter.permalink) {
    frontMatter.permalink = frontMatter.permalink
      .split('/').map(s => slugify(s)).join('/').replace(/\/$/, '')
  }
  // merge metadata parsed from the filename (date, title)
  // with metadata from the front matter, and add a filename
  return Object.assign(
    parseFilename(file),
    frontMatter,
    { filename: '/' + opts.site_content_path + '/' + replaceExt(file, '.html') }
  )
}

// replaces a file extension
function replaceExt (str, ext) {
  if (typeof str !== 'string' || str.length === 0) return str
  var newFileName = path.basename(str, path.extname(str)) + ext
  return path.join(path.dirname(str), newFileName)
}

const dateRegExp = /^(?:(\d\d\d\d-\d\d-\d\d)-)?(.*)/

// Parse permalink, collection, categories and title
// from filename and path
function parseFilename (file) {
  const meta = {}
  const dirs = path.dirname(file).split(path.sep)
  meta.collection = dirs.shift()
  if (dirs.length) meta.categories = dirs
  const matches = dateRegExp.exec(path.parse(file).name)
  if (matches[1]) meta.date = matches[1]
  // TODO: allow configuration of permalink and checking for
  // duplicate permalinks
  meta.permalink = '/' + meta.collection + '/' + slugify(matches[2])
  meta.title = toTitleCase(matches[2].split('-').join(' '))
  return meta
}
