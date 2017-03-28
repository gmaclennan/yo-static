'use strict'

var through = require('through2')
var buble = require('buble')

module.exports = function bublefy (file) {
  if (/\.json$/.test(file)) return through()

  var source = ''
  var output = through(function (buf, enc, next) {
    source += buf.toString('utf8')
    next()
  }, function (cb) {
    try {
      var transformed = buble.transform(source)
    } catch (err) {
      return error(err)
    }
    this.push(transformed.code)
    cb()
  })

  function error (msg) {
    var err = typeof msg === 'string' ? new Error(msg) : msg
    output.emit('error', err)
  }

  return output
}
