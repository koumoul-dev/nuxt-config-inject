const flat = require('flat')
const replace = require('replace-in-file')
const debug = require('debug')('nuxt-config-inject')

// take a config object and replace all values with placeholders that will be easy to find in built files afterwards
exports.prepare = config => {
  const flatConfig = flat(config)
  Object.keys(flatConfig).forEach(key => {
    const val = flatConfig[key] === null ? '' : flatConfig[key]
    const type = typeof val
    let alias = `STARTCONFIGALIAS/${type}/${key}/ENDCONFIGALIAS`
    // keep prefix marking as a url or path
    if (type === 'string') {
      if (val.startsWith('http://')) alias = 'http://' + alias
      if (val.startsWith('https://')) alias = 'https://' + alias
      if (val.startsWith('/')) alias = '/' + alias
    }
    debug(`Use config alias ${key} -> ${alias}`)
    flatConfig[key] = alias
  })
  return flat.unflatten(flatConfig)
}

// read all built files and replace config placeholders with actual values
exports.replace = (config, files = ['.nuxt/**/*', 'dist/**/*']) => {
  const flatConfig = flat(config)
  replace.sync({
    files,
    from: new RegExp('(\'|"|http://|https://|/)?STARTCONFIGALIAS/(.*?)/(.*?)/ENDCONFIGALIAS(\'|"|/)?', 'gm'),
    to: (match, prefix, type, key, suffix, offset, originalString, file) => {
      debug(`Match in file ${file}, key=${key}, type=${type} prefix=${prefix} suffix=${suffix}`)
      const val = flatConfig[key]
      // keep quotes around strings and asymmetrical quotes
      let result = `${prefix || ''}${val}${suffix || ''}`
      // remove quote delimiting a non-string value
      if (type !== 'string' && prefix === suffix) result = '' + val
      // remove prefix that was kept to mark a url or path
      else if (['http://', 'https://', '/'].includes(prefix)) {
        if (suffix === '/' && val.endsWith('/')) suffix = '' // prevent double slashes in base path
        result = `${val}${suffix || ''}`
      }
      debug(`${match} -> ${result}`)
      return result
    }
    // dry: true
  })
}
