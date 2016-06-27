var buildContent = require('./build-content')
var buildPages = require('./build-pages')

module.exports = function buildSite (argv) {
  argv = argv || {}
  buildContent(argv, function (err) {
    if (err) return console.error(err)
    buildPages(argv, function (err) {
      if (err) return console.error(err)
    })
  })
}
