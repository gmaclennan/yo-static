var fs = require('fs')
var path = require('path')

var config = require('./config')

module.exports = Api

function Api () {
  if (!(this instanceof Api)) return new Api()
}

Api.prototype.get = function get (filename, done) {
  var filepath = path.join(config.site_dir, filename)
  fs.readFile(filepath, 'utf8', function (err, body) {
    if (err) return done(err)
    done(null, body)
  })
}

// noop on server
Api.prototype.cache = function () {}
