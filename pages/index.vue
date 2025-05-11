<script setup>
import { onMounted } from 'vue';
import { useProfile } from '~/composables/useProfile';
import { useAuthStore } from '~/stores/auth';
import { PlaylistModal } from '#components';
const auth = useAuthStore();

let tracks = ref(null);
let artists = ref(null);
let playlists = ref(null);
const { fetchTopArtists, fetchTopTracks, fetchPlaylists } = useProfile();

let showModal = ref(false);

onMounted(async () => {
    tracks.value = await fetchTopTracks();
    artists.value = await fetchTopArtists();
    playlists.value = await fetchPlaylists();
})
</script>

<template>
    <div id="app" class="p-20">
        <div class="text-white mb-6 text-4xl font-bold">
            What are you looking for?
        </div>
        <div class="flex items-center justify-start gap-8 mb-8">
            <a href="#TopTracks" class="rounded-full bg-spotify-green hover:bg-spotify-green-dark font-bold text-lg px-4 py-2">Tracks</a>
            <a href="#TopArtists" class="rounded-full bg-spotify-green hover:bg-spotify-green-dark font-bold text-lg px-4 py-2">Artists</a>
            <a href="#TopPlaylists" class="rounded-full bg-spotify-green hover:bg-spotify-green-dark font-bold text-lg px-4 py-2">Playlists</a>
        </div>
        <div class="text-white">
            <div id="TopTracks" class="mb-6">
                <div class="text-4xl font-bold mb-2">Your Top Tracks</div>
                <ItemsList v-bind="tracks" type="tracks"/>
            </div>
            <div id="TopArtists" class="mb-6">
                <div class="text-4xl font-bold mb-2">Your Top Artists</div>
                <ItemsList v-bind="artists" type="artists"/>  
            </div>
            <div id="TopPlaylists" class="mb-6">
                <div class="flex items-center justify-between">
                    <NuxtLink to="/playlist">
                        <div class="text-4xl font-bold mb-2">Your Playlists</div>
                    </NuxtLink>
                    <IconsAdd  @click="showModal = true; console.log(showModal)" class="text-white font-bold text-3xl rounded-full bg-spotify-gray hover:rotate-90 ease-in duration-300 hover:bg-spotify-green-dark hover:scale-110"/>
                    <div v-if="showModal" class="z-20 fixed inset-0 flex items-center justify-center bg-opacity-10 backdrop-blur-sm">
                        <PlaylistModal @close="showModal = false" />
                    </div>
                </div>
                <ItemsList v-bind="playlists" type="playlists"/>  
            </div>
        </div>
    </div>
</template>