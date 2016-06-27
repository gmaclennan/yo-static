var __config = require('./config')

var metadata = []
try {
  metadata = require(__config.metadata_file)
} catch (e) {}

var byFilePath = metadata.reduce(function (p, v) {
  var filepath = parseFilepathFromFilename(v.filename)
  p[filepath] = p[filepath] || []
  p[filepath].push(v)
  return p
}, {})

Object.keys(byFilePath).forEach(function (filepath) {
  byFilePath[filepath].sort(sortByDateThenTitle)
})

var byUrlPath = metadata.reduce(function (p, v) {
  var urlpath = v.permalink.split('/').slice(0, -1).join('/')
  p[urlpath] = p[urlpath] || []
  p[urlpath].push(v)
  return p
}, {})

var byPermalink = metadata.reduce(function (p, v) {
  p[v.permalink] = v
  return p
}, {})

module.exports = {
  asArray: metadata,
  byFilePath: byFilePath,
  byUrlPath: byUrlPath,
  byPermalink: byPermalink
}

function parseFilepathFromFilename (filename) {
  var re = new RegExp('^\\/' + __config.site_content_path)
  return filename
    .replace(re, '')
    .split('/')
    .slice(1, -1)
    .join('/')
}

function sortByDateThenTitle (a, b) {
  if (a.date && b.date && b.date.localeCompare(a.date) !== 0) {
    // sort by newest first
    return b.date.localeCompare(a.date)
  } else {
    // sort by title lexigraphically
    return a.title.localeCompare(b.title)
  }
}
