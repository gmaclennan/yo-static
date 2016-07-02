var buildContent = require('./build-content')
var deleteSite = require('./delete-site')

module.exports = function buildSite (argv) {
  console.time('total')
  deleteSite()
  argv = argv || {}
  buildContent(argv, function (err) {
    if (err) return console.error('Error building content:', err)
    var pending = 3

    var buildPages = require('./build-pages')
    var buildJavascript = require('./build-javascript')
    var buildStatic = require('../scripts/build-static')

    buildStatic(argv, done)
    buildPages(argv, done)
    buildJavascript(done)

    function done (err) {
      if (err) throw err
      if (--pending === 0) {
        console.timeEnd('total')
      }
    }
  })
}
