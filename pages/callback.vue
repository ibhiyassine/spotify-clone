<script setup>
import { onMounted } from 'vue';

definePageMeta({
    layout: 'login',
});


const route = useRoute();
const auth = useAuth();

onMounted( async () => {
    const code = route.query.code;
    if(code){
        await auth.handleCallback(code);
        navigateTo('/');
    }
    else{
        console.error("No code provided");
        navigateTo('/login');
    }
})

</script>
<template>
    <div>
        <LoginForm disabled="true" />
        <p>Please wait while we process your request...</p>
    </div>
</template>