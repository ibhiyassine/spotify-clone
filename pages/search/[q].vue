<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSearch } from '~/composables/useSearch';
import { usePlayerStore } from '~/stores/player';
import { Progress } from '@/components/ui/progress'

const { searchTracks, searchArtists, searchPlaylists, searchAlbums } = useSearch();
const playerStore = usePlayerStore();

const route = useRoute();
const q = route.params.q;
let data = ref({
    tracks: [],
    artists: [],
    playlists: [],
    albums: []
});
let loading = ref(true);
let error = ref(false);
let errorMessage = ref("");

// Function to play a specific track directly from search results
const playSearchTrack = (track, index) => {
    console.log('Playing track directly from search results:', track.name, 'at index:', index);
    
    // Create a proper playlist from all tracks in the search results
    const trackItems = data.value.tracks.items.map(item => ({ track: item }));
    
    // Set up the playlist and play the selected track
    playerStore.setPlaylist(trackItems, index);
    playerStore.togglePlay(true);
};

onMounted(async () => {
    try {
        loading.value = true;
        const [tracks, artists, playlists, albums] = await Promise.all([
            searchTracks(q),
            searchArtists(q),
            searchPlaylists(q),
            searchAlbums(q)
        ]);
        data.value.tracks = tracks.tracks;
        data.value.tracks.items = tracks.tracks.items.filter(item => !!item);
        data.value.artists = artists.artists;
        data.value.artists.items = artists.artists.items.filter(item => !!item);
        data.value.playlists = playlists.playlists;
        data.value.playlists.items = playlists.playlists.items.filter(item => !!item);
        data.value.albums = albums.albums;
        data.value.albums.items = albums.albums.items.filter(item => !!item);
        console.log(data.value.playlists);
    } catch (err) {
        error.value = true;
        errorMessage.value = err.message;
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="loading" class="flex justify-center items-center h-screen w-screen">
        <div class="text-center">
            <div class="text-white font-black text-6xl mb-4">
            Loading...
            </div>
            <Progress :model-value="33" class="bg-white"/>
        </div>
    </div>
    <div v-else-if="error">
        <div class="text-red-900 font-black text-6xl flex justify-center items-center h-screen w-screen">
            {{ errorMessage }}
        </div>
    </div>
    <div v-else>
        <div class="text-white p-20">
            <div id="TopTracks" class="mb-6">
                <div class="text-4xl font-bold mb-2">Tracks</div>
                <ItemsList v-bind="data.tracks" type="tracks" @play="playSearchTrack"/>
            </div>
            <div id="TopArtists" class="mb-6">
                <div class="text-4xl font-bold mb-2">Artists</div>
                <ItemsList v-bind="data.artists" type="artists"/>  
            </div>
            <div id="TopPlaylists" class="mb-6">
                <div class="flex items-center justify-between">
                    <div class="text-4xl font-bold mb-2">Playlists</div>
                </div>
                <ItemsList v-bind="data.playlists" type="playlists"/>  
            </div>
            <div id="TopPlaylists" class="mb-6">
                <div class="flex items-center justify-between">
                    <div class="text-4xl font-bold mb-2">Albums</div>
                </div>
                <ItemsList v-bind="data.albums" type="albums"/>  
            </div>
        </div>
    </div>
</template>