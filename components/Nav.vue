<script setup>
import ProfilePicture from './ProfilePicture.vue';
import SearchBar from './searchBar.vue';

</script>

<template>
    <div class="
            w-[calc(100%-240px)] 
            h-[60px] 
            fixed 
            right-0 
            z-20 
            flex 
            items-center 
            justify-evenly
        ">
        <SearchBar class="grow" />
        <ProfilePicture @profile-click="console.log('Hello')" />
    </div>
</template>