var path = require('path')
var merge = require('deepmerge')

var config = require('../config.default.json')

var cwd = process.cwd()

var siteConfig
if (process.browser) {
  var __config = {}
  siteConfig = require(__config.config_file)
} else {
  siteConfig = require(path.join(cwd, config.config_file))
}

merge(config, siteConfig)

Object.keys(config).map(function (key) {
  if (!/(_dir|_file|_component)$/.test(key)) return
  config[key] = path.join(cwd, config[key])
})

config.site_content_path = '_content'
config.site_content_dir = path.join(config.site_dir, config.site_content_path)
config.metadata_file = path.join(config.site_content_dir, 'metadata.json')

module.exports = config
