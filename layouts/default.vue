<script setup>
import MusicPlayer from '~/components/musicPlayer.vue';
import { usePlayerStore } from '~/stores/player';

const playerStore = usePlayerStore();
</script>

<template>
    <div class="min-h-screen bg-zinc-900 text-white">
        <Nav />
        <main class="px-4 md:px-8 pb-24">
            <slot />
        </main>

        <!-- Music player that only appears when isVisible is true -->
        <MusicPlayer v-if="playerStore.isVisible" :current-track="playerStore.currentTrack"
            :playlist="playerStore.playlist" :current-index="playerStore.currentIndex" @next="playerStore.nextTrack"
            @previous="playerStore.previousTrack" @play-pause="playerStore.togglePlay" />
    </div>
</template>