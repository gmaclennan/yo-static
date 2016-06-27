var fs = require('fs')
var path = require('path')
var config = require('./config')

function get (filename, done) {
  var filepath = path.join(config.site_dir, filename)
  fs.readFile(filepath, 'utf8', function (err, body) {
    if (err) return done(err)
    done(null, body)
  })
}

module.exports = {
  get: get
}
