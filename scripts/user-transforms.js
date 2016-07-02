/**
 * NB: right now these transforms seem to also transform everything in
 * node_modules because of the way they are being required from inside
 * a module of the folder where your site is.
 */

var path = require('path')
var relative = require('require-relative')

var cwd = process.cwd()
var userTransforms

try {
  var browserifySettings = require(path.join(cwd, 'package.json')).browserify
  userTransforms = browserifySettings && browserifySettings.transform
} catch (e) {}

userTransforms = userTransforms &&
  userTransforms.length &&
  userTransforms.map(function (t) {
    try {
      var modulePath = relative.resolve(t, cwd)
      return require(modulePath)
    } catch (e) {
      console.error(e)
      throw new Error('You included a custom transform in your `package.json`\n' +
        'but we couldn\'t find it, try `npm i ' + t + '`')
    }
  })

module.exports = userTransforms || []
