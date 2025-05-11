<script setup>
import { useRoute } from 'vue-router';
import { useSpotify } from '~/composables/useSpotify';
import { useSearch } from '~/composables/useSearch';
import { usePlayerStore } from '~/stores/player';

const auth = useAuthStore();
const route = useRoute();
const id = route.params.id;
const { searchPlaylistById } = useSearch();
const playerStore = usePlayerStore();
const playlist = ref(null);
let isOwner = ref(false);
const isLoading = ref(true);
const error = ref('');
const showModal = ref(false); // Control modal visibility

// Format milliseconds to minutes:seconds
const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Play a track from the playlist
const playTrack = (index) => {
    console.log('Play button clicked, index:', index);
    console.log('Playlist data:', playlist.value?.tracks?.items);
    
    if (playlist.value && playlist.value.tracks && playlist.value.tracks.items) {
        console.log('Setting playlist in store, items count:', playlist.value.tracks.items.length);
        playerStore.setPlaylist(playlist.value.tracks.items, index);
        playerStore.togglePlay(true);
        console.log('Player visibility after setting track:', playerStore.isVisible);
        console.log('Current track after setting:', playerStore.currentTrack);
    } else {
        console.error('Cannot play - missing playlist data');
    }
};

// Prepare playlist data for editing
const prepareDataForEdit = () => {
    showModal.value = true;
};

onMounted(async () => {
    isLoading.value = true;
    try {
        playlist.value = await searchPlaylistById(id);
        isOwner.value = playlist.value.owner.id === auth.user.id;
        console.log(playlist.value);
    } catch (err) {
        console.error(err);
        error.value = err.message;
    }
    finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div v-if="isLoading" class="flex justify-center items-center h-screen w-screen">
        <div class="text-center">
            <div class="text-white font-black text-6xl mb-4">
            Loading...
            </div>
        </div>
    </div>
    <div v-else-if="!!error">
        <div class="text-red-900 font-black text-6xl flex justify-center items-center h-screen w-screen">
            {{ error }}
        </div>
    </div>
    <div v-else class="p-20">
        <!-- Playlist Header -->
        <div class="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
            <!-- Playlist Cover -->
            <div class="min-w-[192px] w-48 h-48 shadow-2xl">
                <img 
                    :src="playlist.images?.[0]?.url" 
                    :alt="playlist.name" 
                    class="w-full h-full object-cover"
                />
            </div>
            
            <!-- Playlist Info -->
            <div class="flex flex-col">
                <div class="text-xs text-zinc-300 uppercase font-semibold mb-2">Playlist</div>
                <h1 class="text-white text-3xl md:text-5xl lg:text-7xl font-bold mb-3">{{ playlist.name }}</h1>
                <div v-if="playlist.description" class="text-zinc-300 mb-2 text-sm">{{ playlist.description }}</div>
                <div class="flex items-center text-zinc-300 text-sm gap-1">
                    <span class="font-semibold text-white">{{ playlist.owner?.display_name }}</span>
                    <span>•</span>
                    <span>{{ playlist.tracks?.total }} {{ playlist.tracks?.total === 1 ? 'song' : 'songs' }}</span>
                    <span v-if="playlist.followers?.total">•</span>
                    <span v-if="playlist.followers?.total">{{ playlist.followers.total }} {{ playlist.followers.total === 1 ? 'like' : 'likes' }}</span>
                </div>
            </div>
        </div>

        <!-- Playlist Controls -->
        <div class="py-4 flex items-center gap-4">
            <Button 
                @click="playTrack(0)"
                class="rounded-full p-4 h-14 w-14 flex items-center justify-center bg-green-500 hover:bg-green-400 text-black"
                aria-label="Play"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </Button>
            
            <!-- Edit Playlist Button - Only visible for owner -->
            <Button 
                v-if="isOwner"
                @click="prepareDataForEdit"
                class="rounded-full px-4 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white"
                aria-label="Edit Playlist"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Playlist
            </Button>
        </div>

        <!-- Track List -->
        <div class="mt-6">
            <!-- Track List Header -->
            <div class="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-3 text-zinc-400 text-md border-b border-zinc-800 sticky top-16 bg-zinc-900/90 backdrop-blur-md z-10">
                <div class="text-center">#</div>
                <div>Title</div>
                <div>Album</div>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
            </div>

            <!-- Track List Items -->
            <div class="mt-2 h-[500px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <div 
                    v-for="(item, index) in playlist.tracks?.items" 
                    :key="index" 
                    class="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-3 text-zinc-300 text-md border-b border-transparent hover:bg-zinc-800/50 rounded-md group cursor-pointer"
                    @click="playTrack(index)"
                >
                    <!-- Track Number -->
                    <div class="flex items-center justify-center">
                        <span class="group-hover:hidden">{{ index + 1 }}</span>
                        <span class="hidden group-hover:block text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                    </div>

                    <!-- Track Info -->
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="w-12 h-12 flex-shrink-0">
                            <img 
                                :src="item.track?.album?.images?.[0]?.url" 
                                :alt="item.track?.name" 
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div class="overflow-hidden">
                            <div class="font-medium text-white truncate text-base">{{ item.track?.name }}</div>
                            <div class="text-zinc-400 text-sm truncate">
                                {{ item.track?.artists?.map(artist => artist.name).join(', ') }}
                            </div>
                        </div>
                    </div>

                    <!-- Album -->
                    <div class="flex items-center overflow-hidden">
                        <div class="truncate text-zinc-400">{{ item.track?.album?.name }}</div>
                    </div>

                    <!-- Duration -->
                    <div class="flex items-center">
                        <div>{{ formatDuration(item.track?.duration_ms) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Playlist Edit Modal -->
        <PlaylistModal 
            v-if="showModal" 
            @close="showModal = false"
            :playlist-data="playlist"
            :is-editing="true"
        />
    </div>
</template>

<style scoped>
/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>