#!/usr/bin/env node

const importLocal = require('import-local')

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用common-cli 本地版本')
} else {
  // console.log(process.argv)
  // console.log(process.argv.slice(2))
  require('../lib')(process.argv.slice(2))
}