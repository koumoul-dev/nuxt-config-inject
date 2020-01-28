# nuxt-config-inject

Hackish way to obtain "build once - deploy many times" with nuxtjs.



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
