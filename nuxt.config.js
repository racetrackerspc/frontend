require('dotenv').config()

module.exports = {
  env: {
    fbApiKey: process.env.FB_API_KEY,
    fbAuthDomain: process.env.FB_AUTH_DOMAIN,
    fbDatabaseUrl: process.env.FB_DATABASE_URL,
    fbProjectId: process.env.FB_PROJECT_ID,
    fbStorageBucket: process.env.FB_STORAGE_BUCKET,
    fbMessagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    mbAccessToken: process.env.MB_ACCESS_TOKEN
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'racetracker',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    { src: '~/node_modules/mapbox-gl/dist/mapbox-gl.css', lang: 'css' }
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: ['mapbox-gl', 'firebase'],
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  modules: ['nuxt-buefy']
}
