<script setup>
import { onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter, useRoute } from 'vue-router';

definePageMeta({
    layout: 'login',
});

const route = useRoute();
const router = useRouter();
const auth = useAuth();

onMounted(async () => {
    const code = route.query.code;
    if (code) {
        try {
            await auth.handleCallback(code);
            console.log('Authentication successful, redirecting to home');
            // Use navigateTo for client-side navigation in Nuxt 3
            navigateTo('/');
        } catch (error) {
            console.error("Authentication failed:", error);
            navigateTo('/login');
        }
    } else {
        console.error("No code provided in callback");
        navigateTo('/login');
    }
});
</script>

<template>
    <div class="flex flex-col items-center justify-center p-8">
        <LoginForm disabled="true" />
        <p class="mt-4 text-white text-center">Please wait while we process your authentication...</p>
        <div class="mt-4 w-16 h-16 border-t-4 border-spotify-green rounded-full animate-spin"></div>
    </div>
</template>