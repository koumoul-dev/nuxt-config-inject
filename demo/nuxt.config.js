import colors from 'vuetify/es5/util/colors'

let config = {
  title: 'Demo title default',
  prop1: 'Property 1 default',
  prop2: 'Property 2 default',
  number1: 10,
  bool1: true,
  code1: '<a href="test.com">test</a>'
}

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('../index.js')
  if (process.argv.slice(-1)[0] === 'build') {
    config = nuxtConfigInject.prepare(config)
  } else {
    config = {
      ...config,
      title: 'Demo title overwritten',
      prop1: 'Property 1 overwritten'
    }
    nuxtConfigInject.replace(config)
  }
}

export default {
  mode: 'universal',
  env: {
    prop1: config.prop1,
    prop2: config.prop2,
    number1: config.number1,
    bool1: config.bool1,
    code1: config.code1
  },
  /*
  ** Headers of the page
  */
  head: {
    title: config.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
