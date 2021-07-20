'use strict';



const log = require('npmlog')
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info' // log 打印等级  判断debug模式
log.heading = 'init-common-cli'  // 修改前缀
log.headingStyle = {fg: 'white', bg: 'black'}
log.addLevel('sucess', 2000, {fg: 'green', bold: true})  // 自定义打印方法
// function index() {
//   log.sucess('cli', 'test')
// }
module.exports = log;