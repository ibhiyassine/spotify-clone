// Pinia persistence plugin
import { defineNuxtPlugin } from '#app';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin(nuxtApp => {
  // Only use the persistence plugin on the client-side where window is available
  if (process.client) {
    nuxtApp.$pinia.use(piniaPluginPersistedstate);
  }
});