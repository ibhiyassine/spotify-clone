<script setup>
import { Card, CardContent, CardAction, CardHeader, CardFooter, CardTitle, CardDescription } from '~/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel'
import { usePlayerStore } from '~/stores/player';

const playerStore = usePlayerStore();
const emit = defineEmits(['play']);

const props = defineProps({
    type: {
        type: String,
        default: 'tracks',
    },
    total: {
        type: Number,
        default: 2,
    },
    limit: {
        type: Number,
        default: 5,
    },
    items: {
        type: Array,
        default: () => [],
    },
})

// Play a track when the play button is clicked
const playTrack = (track, index) => {
    if (!track) return;
    
    console.log('Playing track from carousel:', track.name, 'at index:', index);
    
    // Emit the play event for parent components that need direct control
    emit('play', track, index);
    
    // Only handle playback directly if no listeners for the play event
    if (!emit.hasListeners?.('play')) {
        // Check if tracks are already formatted with track property
        const firstItem = props.items[0];
        const tracksNeedWrapping = !firstItem.hasOwnProperty('track');
        
        // Format tracks consistently for the player store
        let trackItems;
        if (tracksNeedWrapping) {
            // If items are direct track objects, wrap them in {track: item} structure
            trackItems = props.items.map(item => ({ track: item }));
        } else {
            // Items already have the correct structure
            trackItems = props.items;
        }
        
        playerStore.setPlaylist(trackItems, index);
        playerStore.togglePlay(true);
    }
}

// Format milliseconds to minutes:seconds
const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

onMounted(() => {
    console.log(props.type, props.items);
})
</script>

<template>
    <Carousel class="relative w-full" :opts="{
        align: 'start',
        gap: 12,
    }">
        <CarouselContent class="-ml-3">
            <CarouselItem v-for="(item, index) in items" :key="index" class="pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <!--TRACKS CARD-->
                <Card v-if="type === 'tracks' && !!item" class="bg-black/40 backdrop-blur-md border-none hover:bg-zinc-800/70 transition-all duration-300 shadow-lg h-full w-full rounded-lg overflow-hidden group">
                    <CardHeader class="p-3 space-y-2">
                        <div class="relative overflow-hidden rounded-md aspect-square">
                            <img 
                                :src="item.album?.images?.[0]?.url || item.album?.images?.[1]?.url" 
                                alt="Track Image"
                                class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                            <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    @click.prevent="playTrack(item, index)"
                                    class="bg-green-500 rounded-full p-2.5 shadow-lg hover:bg-green-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <CardTitle class="text-white text-base font-bold line-clamp-1 mt-1">
                            {{ item.name }}
                        </CardTitle>
                        <CardDescription class="text-zinc-400 text-xs line-clamp-2">
                            {{ item.artists?.map(artist => artist.name).join(', ') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="p-3 pt-0">
                        <div class="flex items-center justify-between text-xs text-zinc-400">
                            <div class="flex items-center gap-1" v-if="item.explicit">
                                <span class="bg-zinc-600 text-white px-1 py-0.5 text-[10px] font-bold rounded">E</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="flex items-center gap-1" v-if="item.popularity">
                                    <span class="text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </span>
                                    {{ item.popularity }}
                                </div>
                                <span v-if="item.duration_ms">{{ formatDuration(item.duration_ms) }}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <!--ARTIST CARD-->
                <NuxtLink v-else-if="type === 'artists' && !!item" :to="item.external_urls?.spotify" class="block">
                    <Card class="bg-black/40 backdrop-blur-md border-none hover:bg-zinc-800/70 transition-all duration-300 shadow-lg h-full w-full rounded-lg overflow-hidden group">
                        <CardHeader class="p-3 space-y-2">
                            <div class="relative overflow-hidden rounded-md aspect-square">
                                <img 
                                    :src="item.images?.[0]?.url || item.images?.[1]?.url" 
                                    alt="Artist Image"
                                    class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />

                            </div>
                            <CardTitle class="text-white text-base font-bold line-clamp-1 mt-1">
                                {{ item.name }}
                            </CardTitle>
                            <CardDescription class="text-zinc-400 text-xs line-clamp-2">
                                Artist
                                <span v-if="item.followers?.total" class="mx-1">·</span>
                                <span v-if="item.followers?.total">{{ item.followers.total.toLocaleString() }} followers</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="p-3 pt-0">
                            <div class="flex items-center justify-between text-xs text-zinc-400">
                                <div class="flex flex-wrap gap-1 max-w-[70%]" v-if="item.genres && item.genres.length">
                                    <span v-for="genre in item.genres.slice(0, 1)" :key="genre" 
                                        class="bg-zinc-700/70 text-zinc-300 px-1.5 py-0.5 text-[10px] rounded-full truncate">
                                        {{ genre }}
                                    </span>
                                    <span v-if="item.genres.length > 1" class="text-[10px]">+{{ item.genres.length - 1 }}</span>
                                </div>
                                <div class="flex items-center gap-1" v-if="item.popularity">
                                    <span class="text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </span>
                                    {{ item.popularity }}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </NuxtLink>
                <!--PLAYLIST CARD-->
                <NuxtLink v-else-if="type === 'playlists' && !!item" :to="`/playlist/${item.id}`" class="block">
                    <Card class="bg-black/40 backdrop-blur-md border-none hover:bg-zinc-800/70 transition-all duration-300 shadow-lg h-full w-full rounded-lg overflow-hidden group">
                        <CardHeader class="p-3 space-y-2">
                            <div class="relative overflow-hidden rounded-md aspect-square">
                                <img 
                                    :src="item.images?.[0]?.url" 
                                    alt="Playlist Cover"
                                    class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                                <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        @click.stop="playTrack(item, index)"
                                        class="bg-green-500 rounded-full p-2.5 shadow-lg hover:bg-green-400 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black">
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
                                    <span v-if="item.collaborative" class="bg-blue-500/70 text-white px-1.5 py-0.5 text-[10px] rounded-full">
                                        Collab
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </NuxtLink>
                <!--ALBUM CARD-->
                <NuxtLink v-else-if="type === 'albums' && !!item" :to="item.external_urls?.spotify">
                    <Card  class="bg-black/40 backdrop-blur-md border-none hover:bg-zinc-800/70 transition-all duration-300 shadow-lg h-full w-full rounded-lg overflow-hidden group">
                        <CardHeader class="p-3 space-y-2">
                            <div class="relative overflow-hidden rounded-md aspect-square">
                                <img 
                                    :src="item.images?.[0]?.url" 
                                    alt="Album Cover"
                                    class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <CardTitle class="text-white text-base font-bold line-clamp-1 mt-1">
                                {{ item.name }}
                            </CardTitle>
                            <CardDescription class="text-zinc-400 text-xs line-clamp-2">
                                {{ new Date(item.release_date).getFullYear() }} • {{ item.artists?.map(artist => artist.name).join(', ') }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="p-3 pt-0">
                            <div class="flex items-center justify-between text-xs text-zinc-400">
                                <div class="flex items-center gap-1">
                                    <span class="capitalize">
                                        {{ item.album_type || 'Album' }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 whitespace-nowrap">
                                    <span v-if="item.total_tracks">
                                        {{ item.total_tracks }} {{ item.total_tracks === 1 ? 'track' : 'tracks' }}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </NuxtLink>
            </CarouselItem>
        </CarouselContent>
        <CarouselPrevious class="hidden md:flex -left-3 bg-zinc-900/60 hover:bg-zinc-800/80 text-white border-none shadow-lg" />
        <CarouselNext class="hidden md:flex -right-3 bg-zinc-900/60 hover:bg-zinc-800/80 text-white border-none shadow-lg" />
    </Carousel>
</template>

<style scoped>
.group:hover .opacity-0 {
    opacity: 1;
}
</style>