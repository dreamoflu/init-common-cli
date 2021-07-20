'use strict'

module.exports = core


const semver = require('semver')
const colors = require('colors/safe')
const pkg = require('../package.json')
const log = require('@init-common-cli/log')
const constant = require('./const')

function core() {
  try{
    checkPkgVersin()
    checkNodeVersion()
  }catch (e) {
    log.error(e.message)
  }

}
function checkPkgVersin() {  // 检查脚手架版本号
  log.info('version', pkg.version)

}

function checkNodeVersion() { // node 版本号
  // 第一步 获取当前Node版本号
  const currentVersion = process.version
    // 第二步 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if(!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`init-common-cli 需要安装v${lowestVersion} 以上版本的Node.js`))
  }
}