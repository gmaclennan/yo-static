'use strict'

var through = require('through2')
var falafel = require('falafel')

// var regex = /\b__config\b/

module.exports = function (rootEnv) {
  rootEnv = rootEnv || {}
  return function staticifyConfig (file) {
    if (/\.json$/.test(file)) return through()

    var output = through(function (buf, enc, next) {
      var source = buf.toString('utf8')
      try {
        var injectified = falafel(source, {
          ecmaVersion: 6,
          sourceType: 'module'
        }, walk)
      } catch (err) {
        return error(err)
      }

      this.push(injectified.toString())
      next()
    })

    function walk (node) {
      if (isRequire(node) &&
          node.parent.type === 'VariableDeclarator' &&
          node.parent.id.name === '__config') {
        node.update('{}')
      }
      if (node.type === 'MemberExpression' &&
          !(node.parent.type === 'AssignmentExpression' && node.parent.left === node) &&
          node.property.type === (node.computed ? 'Literal' : 'Identifier') &&
          node.object.type === 'Identifier' &&
          node.object.name === '__config') {
        var value = rootEnv[node.property.name || node.property.value]
        if (typeof value === 'undefined') {
          node.update('undefined')
        } else {
          node.update(JSON.stringify(value))
        }
      }
    }

    function error (msg) {
      var err = typeof msg === 'string' ? new Error(msg) : msg
      output.emit('error', err)
    }

    return output
  }
}

function isRequire (node) {
  return node.callee &&
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require'
}
