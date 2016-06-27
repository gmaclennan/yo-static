var xhr = require('xhr')

function get (filename, done) {
  xhr(filename, function (err, res, body) {
    if (err) return done(err)
    done(null, body)
  })
}

module.exports = {
  get: get
}
