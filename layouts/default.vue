<script setup>
import { onMounted } from 'vue';
import {useProfile} from '@/composables/useProfile';
let profile = {
    display_name: 'IBHI Ahmed Yassine',
    images: [
        {
            url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
        }
    ],
}
const {fetchProfile} = useProfile();

onMounted(async () => {
    profile = await fetchProfile();
    console.log(profile);
});
</script>

<template>
    <div class="bg-spotify-black w-full h-screen">
        <Nav />
        <slot />
    </div>
</template>