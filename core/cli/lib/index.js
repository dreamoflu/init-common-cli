'use strict'

module.exports = core

const path = require('path')

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const commander = require('commander')

const pkg = require('../package.json')
const log = require('@init-common-cli/log')
const init = require('@init-common-cli/init')
const constant = require('./const')
let args;
const program = new commander.Command()

function core() {
  try {
    checkPkgVersin()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    checkGlobalUpdate()
    registerCommand()
    // log.verbose('debug','这是debug模式')
  } catch (e) {
    log.error(e.message)
  }
}

// 1、检查脚手架版本号
function checkPkgVersin() {
  log.info('version', pkg.version)

}

// 2、检查 node 版本号
function checkNodeVersion() {
  // 第一步 获取当前Node版本号
  const currentVersion = process.version
  // 第二步 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`init-common-cli 需要安装v${lowestVersion} 以上版本的Node.js`))
  }
}

// 3、root账号启动检查和自动降级功能开发
// 解决root权限使用脚手架 正常进入电脑用户无法操作文件权限的问题
function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
  // console.log(process.geteuid())
}

// 检查用户主目录
function checkUserHome() {
  // console.log(userHome)
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录主目录不存在！'))
  }
}

// 检查入参  可以进入debugger 模式
function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  // console.log(args)
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  // if(pathExists(dotenvPath)) {
  //   config = dotenv.config({
  //     path: dotenvPath
  //   }) // 默认找的是当前目录的.evn
  // }
  //
  // console.log(config, process.env.DB_USER)

  if (pathExists(dotenvPath)) {
    dotenv.config({  // 读取到环境变量之后就可以全局获取了
      path: dotenvPath
    }) // 默认找的是当前目录的.evn
  }
  createDefaultConfig()

  console.log(process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {  // 创建默认配置， 防止检差环境变量时，因找不到.evn文件，获取不到环境变量而报错
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
  // return cliConfig

}

// 检查脚手架更新
async function checkGlobalUpdate() {
  // 1.获取当前版本号和模块名
  // 2.调用npm API, 获取所有版本号
  // 3. 提取所有版本号，对比那些版本号大于当前版本号
  // 4. 获取最新的版本号，提示用户更新到该版本
  const currentVersion = pkg.version
  const npmName = pkg.name
  const {getNpmSemverVersion} = require('@init-common-cli/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`更新提示 请更新${npmName},当前版本：${currentVersion},最新版本：${lastVersion}，更新命令：npm install -g ${npmName}`))
  }
  // console.log(lastVersion)
}

// 注册命令
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目') // -f 可以覆盖已有文件夹
    .action(init)

  const options = program.opts()
  program.on('option:debug', function () {
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
    log.verbose('test debug11')
  })
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知命令：' + obj[0]))
    if (availableCommands.length) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')))
    }
  })

  program.parse(process.argv)

  if (program.args && program.args.length < 1) {   // 用户输入 debug 此模式无实际用处 也要弹出帮助文档
    program.outputHelp()
  }

}