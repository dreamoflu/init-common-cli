'use strict';
const axios = require('axios')
const urljoin = require('url-join')
const semver = require('semver')

// 获取当前包在npm上的信息
function getNpmInfo(npmName, registry) {
  // console.log(npmName)
  if(!npmName) {
    return null
  }
  const registryUrl = registry || getDefaultRegistery()
  const npmInfoUrl = urljoin(registryUrl, npmName)
  // console.log(npmInfoUrl)
  return axios.get(npmInfoUrl).then(response => {
    // console.log(response)
    if(response.status===200) {
      return response.data
    } else {
      return null
    }
  }).catch(err => {
    return Promise.reject(err)
  })
}
//  使用npm源还是淘宝源
function getDefaultRegistery(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'

}

// 获取当前包 在npm上所有版本号
async function  getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if(data) {
    return Object.keys(data.versions)
  } else {
    return  []
  }
}

// 获取大于等于当前版本的的版本号
function getNpmSemverVersions(baseVersion, versions) {
  versions = versions
    .filter(version =>semver.satisfies(version, `^${baseVersion}`))
    .sort((a,b)=>{ return semver.gt(b, a)})
  return versions
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getNpmSemverVersions(baseVersion, versions)
  if(newVersions&&newVersions.length) {
    return newVersions[0]
  }
}


module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion
}