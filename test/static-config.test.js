var staticVars = require('../transforms/static-vars')
var test = require('tape')

test('Replaces environment variables', function (t) {
  var buffer = ''
  var vars = {
    __config: {
      LOREM: 'ipsum',
      HELLO: 'world',
      ZALGO: 'it comes'
    }
  }

  staticVars('file.js', vars)
    .on('data', function (d) { buffer += d })
    .on('end', function () {
      t.notEqual(-1, buffer.indexOf('ipsum'))
      t.notEqual(-1, buffer.indexOf('world'))
      t.notEqual(-1, buffer.indexOf('it comes'))
      t.notEqual(-1, buffer.indexOf('__config[ZALGO]'))
      t.end()
    })
    .end([
      '__config.LOREM',
      '__config.HELLO',
      '__config["ZALGO"]',
      '__config[ZALGO]'
    ].join('\n'))
})

test('Ignores assignments', function (t) {
  var buffer = ''
  var vars = {
    __config: {
      LOREM: 'ipsum',
      HELLO: 'world',
      UP: 'down'
    }
  }

  staticVars('file.js', vars)
    .on('data', function (d) { buffer += d })
    .on('end', function () {
      t.notEqual(-1, buffer.indexOf('world'))
      t.notEqual(-1, buffer.indexOf('lorem'))
      t.notEqual(-1, buffer.indexOf('__config.LOREM'))
      t.notEqual(-1, buffer.indexOf('__config["LOREM"]'))
      t.notEqual(-1, buffer.indexOf('__config.HELLO'))
      t.notEqual(-1, buffer.indexOf('__config["HELLO"]'))
      t.notEqual(-1, buffer.indexOf('down'))
      t.equal(-1, buffer.indexOf('__config.UP'))
      t.end()
    })
    .end([
      '__config["LOREM"] += "lorem"',
      '__config.LOREM += "lorem"',
      '__config["HELLO"] = __config["HELLO"] || "world"',
      '__config.HELLO = __config.HELLO || "world"',
      '__config.UP'
    ].join('\n'))
})

test("Doesn't ignore assigning to a variable", function (t) {
  var buffer = ''
  var vars = {
    __config: {
      LOREM: 'ipsum',
      HELLO: 'world'
    }
  }

  staticVars('file.js', vars)
    .on('data', function (d) { buffer += d })
    .on('end', function () {
      t.notEqual(-1, buffer.indexOf('foo = "ipsum"'))
      t.notEqual(-1, buffer.indexOf('oof = "ipsum"'))
      t.notEqual(-1, buffer.indexOf('oof.bar = "ipsum"'))
      t.notEqual(-1, buffer.indexOf('bar = "world"'))
      t.notEqual(-1, buffer.indexOf('rab = "world"'))
      t.equal(-1, buffer.indexOf('__config.NOTTHERE'))
      t.equal(-1, buffer.indexOf('__config.UNDEFINED'))
      t.notEqual(-1, buffer.indexOf('a = undefined'))
      t.notEqual(-1, buffer.indexOf('b = undefined || null'))
      t.end()
    })
    .end([
      'var foo = __config.LOREM',
      'oof = __config.LOREM',
      'oof.bar = __config.LOREM',
      'var bar = __config.HELLO || null',
      'rab = __config.HELLO || null',
      'a = __config.UNDEFINED',
      'b = __config.NOTTHERE || null'
    ].join('\n'))
})

test('Handles getter properties', function (t) {
  var env = { __config: {} }
  var buffer = ''
  var counter = 0

  Object.defineProperty(env.__config, 'DYNAMIC', {
    // please don't actually do this:
    get: function () { return counter++ ? 'really!' : 'dynamic!' }
  })

  staticVars('file.js', env)
    .on('data', function (d) { buffer += d })
    .on('end', function () {
      t.notEqual(-1, buffer.indexOf('foo = "dynamic!"'))
      t.notEqual(-1, buffer.indexOf('bar = "really!"'))
      t.end()
    })
    .end([
      'var foo = __config.DYNAMIC',
      'var bar = __config.DYNAMIC'
    ].join('\n'))
})

test('Replaces require statements', function (t) {
  var buffer = ''

  staticVars('file.js', {__config: {}})
    .on('data', function (d) { buffer += d })
    .on('end', function () {
      t.notEqual(-1, buffer.indexOf('var __config = {}'))
      t.end()
    })
    .end([
      'var __config = require(\'myfile\')'
    ].join('\n'))
})
