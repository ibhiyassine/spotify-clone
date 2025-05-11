<script setup>
import ProfilePicture from './ProfilePicture.vue';
import SearchBar from './searchBar.vue';

import { onMounted } from 'vue';
import { useProfile } from '~/composables/useProfile';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
let profile = ref({
    display_name: 'IBHI Ahmed Yassine',
    images: [
        {
            url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
        }
    ],
});
const {fetchProfile} = useProfile();

onMounted(async () => {
    if (auth.isAuthenticated) {
        try {
            profile.value = await fetchProfile();
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }
});

</script>

<template>
    <div class="
            w-full
            px-7
            h-[60px] 
            fixed 
            right-0 
            z-20 
            flex 
            items-center 
            justify-evenly
            bg-spotify-black
        ">
        <img src="~/assets/Spotify-clone.png" alt="Profile Picture" class="rounded-full" width="50" />
        <SearchBar class="grow" />
        <ProfilePicture @profile-click="console.log('Hello')" :images="profile.images" :display_name="profile.display_name"/>    
    </div>
</template>