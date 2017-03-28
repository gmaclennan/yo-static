var fs = require('fs')
var path = require('path')
var pump = require('pump')
var browserify = require('browserify')
// convert bundle paths to IDS to save bytes in browserify bundles
var collapse = require('bundle-collapser/plugin')
// removes assert statements
var unassertify = require('unassertify')
// Replaces `__config` variables with static values
var staticVars = require('../transforms/static-vars')
// Replaces bulk requires with static requires
var bulkify = require('bulkify')
// Transform yo-yo template strings into pure and fast document calls.
var yoyoify = require('yo-yoify')
// Let's ensure everything is ES5 code - some required modules use ES2015
var babelify = require('babelify')
// Removes console.{log,error,info} messages
var stripify = require('stripify')
// Replaces `process.env.NODE_ENV` with `'production'`
var envify = require('envify/custom')({
  NODE_ENV: 'production'
})
// replaces `process.browser` with `true`
var bpb = require('bpb')
// Removes unreachable code - once `envify` and `bpb` have run
// unnecessary code for the server is unreachable
var unreachableBranchTransform = require('unreachable-branch-transform')

var userTransforms = require('./user-transforms')
var config = require('../lib/config')

module.exports = function buildJavascript (cb) {
  console.time('build javascript')
  var bundleStream = fs.createWriteStream(path.join(config.site_dir, 'bundle.js'))
  var b = browserify({
    basedir: path.join(__dirname, '..'),
    debug: false
  })
    .add('./index')
    .plugin(collapse)

  userTransforms.forEach(function (t) {
    b.transform(t)
  })

  b.transform(yoyoify, {leaveBel: false})
    .transform(babelify, {presets: ['es2015']}, {global: true})
    .transform(unassertify, {global: true})
    .transform(staticVars, {__config: config})
    .transform(bulkify)
    .transform(stripify, {global: true})
    .transform(envify, {global: true})
    .transform(bpb, {global: true})
    .transform(unreachableBranchTransform)

  pump(b.bundle(), bundleStream, function (err) {
    console.timeEnd('build javascript')
    if (cb) cb(err)
  })
}
