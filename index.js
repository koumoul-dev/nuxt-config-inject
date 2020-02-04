const fs = require('fs')
const flat = require('flat')
const replace = require('replace-in-file')
const hash = require('object-hash')
const debug = require('debug')('nuxt-config-inject')

const getProp = (obj, path) => {
  for (var i = 0, parts = path.split('.'), len = parts.length; i < len; i++) {
    obj = obj && obj[parts[i]]
  }
  return obj
}

// take a config object and replace all values with placeholders that will be easy to find in built files afterwards
exports.prepare = config => {
  const flatConfig = flat(config)
  Object.keys(flatConfig).forEach(key => {
    const val = flatConfig[key] === null ? '' : flatConfig[key]
    const type = typeof val
    let alias = `STARTCONFIGALIAS-${type}-${key}-ENDCONFIGALIAS`
    // keep prefix/suffix marking as a url or path
    if (type === 'string') {
      if (val.startsWith('http://')) alias = 'http://' + alias
      if (val.startsWith('https://')) alias = 'https://' + alias
      if (val.startsWith('/')) alias = '/' + alias
      if (val.endsWith('/')) alias = alias + '/'
    }
    debug(`Use config alias ${key} -> ${alias}`)
    flatConfig[key] = alias
  })
  return flat.unflatten(flatConfig)
}

// read all built files and replace config placeholders with actual values
exports.replace = (config, files = ['.nuxt/**/*', 'static/**/*']) => {
  const changedFiles = []
  replace.sync({
    files,
    from: new RegExp('(\'|"|http://|https://|/)?STARTCONFIGALIAS-(.*?)-(.*?)-ENDCONFIGALIAS(\'|"|/)?', 'gm'),
    to: (match, prefix, type, key, suffix, offset, originalString, file) => {
      debug(`Match in file ${file}, key=${key}, type=${type} prefix=${prefix} suffix=${suffix}`)
      let val = getProp(config, key)
      val = (val === null || val === undefined) ? '' : val
      // keep quotes around strings and asymmetrical quotes
      let result = `${prefix || ''}${val}${suffix || ''}`
      // remove quote delimiting a non-string value
      if (type !== 'string' && ['\'', '"'].includes(prefix) && prefix === suffix) {
        result = ` ${JSON.stringify(val)} `
      } else if (type === 'string' && ['\'', '"'].includes(prefix) && prefix === suffix) {
        // escape quotes and linebreaks inside a quote delimited string
        result = `${prefix}${val.replace(new RegExp(prefix, 'g'), `\\${prefix}`).replace(/\n/g, '\\n')}${suffix}`
      } else if (['http://', 'https://', '/'].includes(prefix)) {
        // remove prefix that was kept to mark a url or path
        if (suffix === '/' && val.endsWith('/')) suffix = '' // prevent double slashes in base path
        if (prefix !== '/' || val.startsWith('/')) prefix = ''
        result = `${prefix || ''}${val}${suffix || ''}`
      }
      debug(`${match} -> ${result}`)
      if (!changedFiles.includes(file)) changedFiles.push(file)
      return result
    }
    // dry: true
  })

  // for proper cache management some files need to be renamed with new hash
  const hashedFiles = changedFiles
    .map(file => ({
      file,
      match: file.match(/\/([a-z0-9]{20})\./) || file.match(/\/manifest\.([a-z0-9]{8}\.json)/)
    }))
    .filter(f => !!f.match)
  const configHash = hash(config).slice(0, 8)
  hashedFiles.forEach(f => {
    const newPath = f.file.replace(`${f.match[1]}`, `${configHash}-${f.match[1]}`)
    fs.renameSync(f.file, newPath)
    debug(`Rename hashed file ${f.file} -> ${newPath}`)
  })
  replace.sync({
    files,
    from: hashedFiles.map(f => new RegExp(f.match[1].replace('.', '\\.'), 'g')),
    to: (match, offset, originalString, file) => {
      debug(`Replace reference to hashed file in other file ${file}, hash=${match}`)
      return `${configHash}-${match}`
    }
    // dry: true
  })
}
