'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // BASE_API: '"https://65.49.204.236:8888"',
  BASE_API: '"https://65.49.204.236:8888"',
  // BASE_API: '"https://123.56.232.247:8888"',
})
