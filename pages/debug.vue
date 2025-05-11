<script setup>
const config = useRuntimeConfig();

// Create a safe version of config to display (without sensitive secrets)
const safeConfig = {
  spotifyClientId: config.public.spotifyClientId,
  spotifyRedirectUri: config.public.spotifyRedirectUri,
  // Not showing spotifyClientSecret for security reasons
};
</script>

<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold mb-4">Environment Variable Checker</h1>
    <div class="bg-gray-100 p-4 rounded">
      <h2 class="text-xl mb-2">Runtime Config:</h2>
      <pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto">{{ safeConfig }}</pre>
    </div>
    <div class="mt-6">
      <button @click="$router.push('/')" class="bg-spotify-green text-black px-4 py-2 rounded hover:bg-spotify-green-dark transition duration-300">
        Back to Home
      </button>
    </div>
  </div>
</template>