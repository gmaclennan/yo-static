var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
// Replaces `__config` variables with static values
var staticConfig = require('../transforms/static-config')
// Replaces bulk requires with static requires
var bulkify = require('bulkify')
// Transform yo-yo template strings into pure and fast document calls.
var yoyoify = require('yo-yoify')
// Removes console.{log,error,info} messages
var stripify = require('stripify')
// Replaces `process.env.NODE_ENV` with `'production'`
var envify = require('envify/custom')({
  NODE_ENV: 'production'
})
// replaces `bpb.browser` with `true`
var bpb = require('bpb')
// Removes unreachable code - once `envify` and `bpb` have run
// unnecessary code for the serve is unreachable
var unreachableBranchTransform = require('unreachable-branch-transform')

var config = require('../lib/config')

module.exports = function buildJavascript () {
  var bundleStream = fs.createWriteStream(path.join(config.site_dir, 'bundle.js'))
  var b = browserify({
    basedir: path.join(__dirname, '..')
  })
    .add('./index')
    .transform(yoyoify)
    .transform(staticConfig(config))
    .transform(bulkify)
    .transform(stripify)
    .transform(envify)
    .transform(bpb)
    .transform(unreachableBranchTransform)
  b.bundle().pipe(bundleStream)
}
