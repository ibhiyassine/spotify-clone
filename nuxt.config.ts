// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      spotifyClientId: process.env.CLIENT_ID,
      spotifyClientSecret: process.env.CLIENT_SECRET,
      spotifyRedirectUri: process.env.REDIRECT_URI
    }
  },

  alias: {
    '@': resolve(__dirname, '/'),
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    'shadcn-nuxt',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  }
})