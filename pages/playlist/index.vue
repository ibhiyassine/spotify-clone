<script setup>
import { useSearch } from '~/composables/useSearch';

const auth = useAuthStore();

let playlists = ref(null);
const { searchOwnedPlaylists } = useSearch();
let isLoading = ref(true);
let error = ref(false);
let errorMessage = ref("");

onMounted(async () => {
    try {
        playlists.value = await searchOwnedPlaylists();
        playlists.value.items = playlists.value.items.filter(item => !!item && item.owner.id == auth.user.id);
    } catch (err) {
        error.value = true;
        errorMessage.value = err.message;
    } finally {
        isLoading.value = false;
    }
})
</script>

<template>
    <div class="p-20">
        <div v-if="isLoading" class="flex justify-center items-center h-screen w-screen">
            <div class="text-center">
                <div class="text-white font-black text-6xl mb-4">
                    Loading...
                </div>
            </div>
        </div>
        <div v-else-if="error">
            <div class="text-red-900 font-black text-6xl flex justify-center items-center h-screen w-screen">
                {{ errorMessage }}
            </div>
        </div>
        <div v-else>
            <div class="text-4xl font-bold mb-2">Playlists</div>
            <div class="flex wrap-anywhere flex-wrap justify-center">
                <!-- Add your content here -->
                <div v-for="(item, index) in playlists.items" :key="index" class="w-[320px] p-2">
    
                    <NuxtLink :to="`/playlist/${item.id}`" class="block">
                        <Card
                            class="bg-black/40 backdrop-blur-md border-none hover:bg-zinc-800/70 transition-all duration-300 shadow-lg h-full w-full rounded-lg overflow-hidden group">
                            <CardHeader class="p-3 space-y-2">
                                <div class="relative overflow-hidden rounded-md aspect-square">
                                    <img :src="item.images?.[0]?.url" alt="Playlist Cover"
                                        class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                                    <div
                                        class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button @click.stop="playTrack(item, index)"
                                            class="bg-green-500 rounded-full p-2.5 shadow-lg hover:bg-green-400 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round" class="text-black">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <CardTitle class="text-white text-base font-bold line-clamp-1 mt-1">
                                    {{ item.name }}
                                </CardTitle>
                                <CardDescription class="text-zinc-400 text-xs line-clamp-2">
                                    {{ item.description || 'Playlist' }}
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="p-3 pt-0">
                                <div class="flex items-center justify-between text-xs text-zinc-400">
                                    <div class="flex items-center gap-1 truncate">
                                        <span v-if="item.owner?.display_name" class="truncate">
                                            By {{ item.owner.display_name }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 whitespace-nowrap">
                                        <span v-if="item.tracks?.total">
                                            {{ item.tracks.total }} {{ item.tracks.total === 1 ? 'track' : 'tracks' }}
                                        </span>
                                        <span v-if="item.collaborative"
                                            class="bg-blue-500/70 text-white px-1.5 py-0.5 text-[10px] rounded-full">
                                            Collab
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>