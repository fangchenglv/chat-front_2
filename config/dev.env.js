'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  
  // WEB_API: '"wss://104.207.153.191:8888"',
  BASE_API: '"https://123.56.232.247:8888"',
  
  // WEB_API: '"wss://10.112.48.143:8890"',
  // BASE_API: '"https://10.112.48.143:8890"',
  
  // BASE_API: '"https://10.28.211.163:8890"',
})
