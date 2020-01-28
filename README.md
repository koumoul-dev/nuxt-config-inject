# nuxt-config-inject

Hackish way to obtain "build once - deploy many times" with nuxtjs.

## Why

[Nuxt](https://fr.nuxtjs.org/) is neat, but it doesn't respect principles that we consider very important. We want to [store config in the environment](https://12factor.net/config), we want to build docker images meant to be used in as many environments as possible without additional build steps.

[This issue](https://github.com/nuxt/nuxt.js/issues/5100) shows that the problem is not easily solved. There are code solutions for parts of the problem: [nuxt-env](https://github.com/samtgarson/nuxt-env), monkey-patching router base, defining `__webpack_public_path__`, etc. But we keep hitting roadblocks, incompatibility with some modules, regressions at upgrades.

This module is an attempt to solve the problem in a more brute force way. At build time a pseudo-config is transformed so that all values contain easily recognizable placeholders. Then at runtime all the files in `.nuxt` and `dist` directories are read and the placeholders are replaced with actual values from current environment. This solution is kinda ugly and it certainly has limitations, but early tests are encouraging.

## Usage

```js
// somewhere at the start of nuxt.config.js

let config = require('config') // or other way to fetch a config from the environment

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')

  // take a config object and replace all values with placeholders that will be easy to find in built files afterwards
  if (process.argv.slice(-1)[0] === 'build') config = nuxtConfigInject.prepare(config)

  // read all built files and replace config placeholders with actual values
  else nuxtConfigInject.replace(config)
}
```

```shell
DEBUG=nuxt-config-inject NODE_ENV=production nuxt build
DEBUG=nuxt-config-inject NODE_ENV=production nuxt start
```

## Development

```
cd demo
DEBUG=nuxt-config-inject NODE_ENV=production npm run build
DEBUG=nuxt-config-inject NODE_ENV=production npm run start
```
