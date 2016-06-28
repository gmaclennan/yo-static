var path = require('path')
var merge = require('deepmerge')

var config = require('../config.default.json')

var cwd = process.cwd()

var siteConfig = {}
try {
  if (process.browser) {
    var __config = {}
    siteConfig = require(__config.config_file)
  } else {
    siteConfig = require(path.resolve(cwd, config.config_file))
  }
} catch (e) {
  siteConfig.config_file = path.join(__dirname, '..', 'config.default.json')
}

config = merge(config, siteConfig)

Object.keys(config).map(function (key) {
  if (!/(_dir|_file|_component)$/.test(key)) return
  config[key] = path.resolve(cwd, config[key])
})

config.site_content_path = '_content'
config.site_content_dir = path.resolve(config.site_dir, config.site_content_path)
config.metadata_file = path.resolve(config.site_content_dir, 'metadata.json')

module.exports = config
