var glob = require('glob')
var path = require('path')
var rimraf = require('rimraf')
var assert = require('assert')
var config = require('../lib/config')

module.exports = function deleteSite () {
  var dir = config.site_dir
  assert.equal(typeof dir, 'string')
  assert(dir.length > 0)
  assert.equal(path.basename(dir).slice(0, 1), '_',
    'Probably didn\'t mean to delete this: ' + dir)
  assert.notEqual(dir.indexOf(process.cwd()), -1,
    'Probably didn\'t mean to delete this: ' + dir)

  var toDelete = glob.sync('*', {cwd: dir})
  toDelete.forEach(function (f) {
    f = path.resolve(dir, f)
    assert.notEqual(f.indexOf(dir), -1,
      'Probably didn\'t mean to delete this: ' + f)
    rimraf.sync(f)
  })
}
