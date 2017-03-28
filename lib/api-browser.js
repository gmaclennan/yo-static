var xhr = require('xhr')
var LRU = require('lru')

module.exports = Api

function Api () {
  if (!(this instanceof Api)) return new Api()
  this._cache = LRU(10)
}

Api.prototype.get = function (filename, done) {
  var cache = this._cache
  var cached = cache.get(filename)
  if (cached) return done(null, cached)
  xhr(filename, function (err, res, body) {
    if (err) return done(err)
    cache.set(filename, body)
    done(null, body)
  })
}

// Used to prepopulate the cache with page content
Api.prototype.cache = function (filename, body) {
  this._cache.set(filename, body)
}
