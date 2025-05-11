<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { usePlayerStore } from '~/stores/player';
import { useAuthStore } from '~/stores/auth';
import { Progress } from '~/components/ui/progress';
import { Toggle } from '~/components/ui/toggle';
import { useSpotify } from '~/composables/useSpotify';

// Player store
const playerStore = usePlayerStore();

// Props for current track data
const props = defineProps({
    currentTrack: {
        type: Object,
        default: () => null
    },
    playlist: {
        type: Array,
        default: () => []
    },
    currentIndex: {
        type: Number,
        default: 0
    }
});

// Emits for player control
const emit = defineEmits(['next', 'previous', 'play-pause']);

// Player state
const playerState = reactive({
    isPlaying: false,
    volume: 70,
    isMuted: false,
    previousVolume: 70,
    isShuffling: false,
    repeatMode: 'off', // off, track, context
    currentTime: 0,
    duration: 0,
    progress: 0
});

// References for audio element and intervals
const audioRef = ref(null);
const progressInterval = ref(null);

// Computed properties
const formattedCurrentTime = computed(() => formatTime(playerState.currentTime));
const formattedDuration = computed(() => formatTime(playerState.duration));
const trackImage = computed(() => props.currentTrack?.album?.images?.[0]?.url || '');
const trackName = computed(() => props.currentTrack?.name || 'No track playing');
const artistNames = computed(() => {
    if (!props.currentTrack?.artists) return '';
    return props.currentTrack.artists.map(artist => artist.name).join(', ');
});

// Check if a track has playable audio
const hasPreviewUrl = computed(() => {
    return !!props.currentTrack?.preview_url;
});

// Create a fallback audio URL when Spotify preview is not available
const audioSrc = computed(() => {
    if (props.currentTrack?.preview_url) {
        return props.currentTrack.preview_url;
    }

    // If no preview URL is available, try to create a fallback URL
    // using the track and artist name for a YouTube-like search
    if (props.currentTrack?.name && props.currentTrack?.artists) {
        const trackName = props.currentTrack.name;
        const artistName = props.currentTrack.artists[0]?.name || '';
        const searchQuery = `${trackName} ${artistName} audio`;

        // Return empty to rely on our built-in handling for tracks without preview URLs
        return '';
    }

    return '';
});

// Format time in milliseconds to MM:SS format
function formatTime(ms) {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Player control functions
function togglePlay() {
    if (!props.currentTrack) return;

    // Don't attempt to play if no preview URL is available
    if (!hasPreviewUrl.value && !playerState.isPlaying) {
        console.warn('No preview URL available for this track');
        alert('No preview audio available for this track. This is a limitation of the Spotify API - only some tracks have preview URLs.');
        return;
    }

    // Set local playing state
    playerState.isPlaying = !playerState.isPlaying;

    if (audioRef.value) {
        if (playerState.isPlaying) {
            const playPromise = audioRef.value.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing audio:', error);
                    playerState.isPlaying = false;

                    // Show user-friendly error if needed
                    if (error.name === 'NotAllowedError') {
                        alert('Playback was blocked by your browser. Please interact with the page first or check your autoplay settings.');
                    }

                    // Update store state only after handling errors
                    nextTick(() => {
                        playerStore.togglePlay(false);
                    });
                    return;
                });
            }
            startProgressTracking();
        } else {
            audioRef.value.pause();
            stopProgressTracking();
        }
    }

    // Use nextTick to update the store after local state is settled
    nextTick(() => {
        playerStore.togglePlay(playerState.isPlaying);
    });

    emit('play-pause', playerState.isPlaying);
}

function nextTrack() {
    stopProgressTracking();
    
    // Directly update the player store first
    playerStore.nextTrack();
    
    // Then emit the event for any parent components
    emit('next');
}

function previousTrack() {
    stopProgressTracking();
    
    // Directly update the player store first
    playerStore.previousTrack();
    
    // Then emit the event for any parent components
    emit('previous');
}

function toggleShuffle() {
    playerState.isShuffling = !playerState.isShuffling;
}

function toggleRepeat() {
    const modes = ['off', 'track', 'context'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    playerState.repeatMode = modes[nextIndex];
}

function toggleMute() {
    if (playerState.isMuted) {
        playerState.volume = playerState.previousVolume;
        playerState.isMuted = false;
    } else {
        playerState.previousVolume = playerState.volume;
        playerState.volume = 0;
        playerState.isMuted = true;
    }

    if (audioRef.value) {
        audioRef.value.volume = playerState.volume / 100;
    }
}

function handleVolumeChange(event) {
    playerState.volume = event.target.value;
    playerState.isMuted = playerState.volume === 0;

    if (audioRef.value) {
        audioRef.value.volume = playerState.volume / 100;
    }
}

function handleProgressClick(event) {
    if (!audioRef.value || !props.currentTrack) return;

    const progressBar = event.currentTarget;
    const clickPosition = event.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.clientWidth;
    const percentage = clickPosition / progressBarWidth;

    const newTime = percentage * playerState.duration;
    playerState.currentTime = newTime;
    playerState.progress = percentage * 100;

    if (audioRef.value) {
        audioRef.value.currentTime = newTime / 1000;
    }
}

// Track progress
function startProgressTracking() {
    if (progressInterval.value) clearInterval(progressInterval.value);

    progressInterval.value = setInterval(() => {
        if (audioRef.value && !audioRef.value.paused) {
            playerState.currentTime = audioRef.value.currentTime * 1000;
            playerState.progress = (playerState.currentTime / playerState.duration) * 100;
        }
    }, 100);
}

function stopProgressTracking() {
    if (progressInterval.value) {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
    }
}

// Audio element event handlers
function onAudioLoaded() {
    if (audioRef.value) {
        playerState.duration = audioRef.value.duration * 1000;
        audioRef.value.volume = playerState.volume / 100;
        if (playerState.isPlaying) {
            audioRef.value.play();
            startProgressTracking();
        }
    }
}

function onAudioEnded() {
    playerState.isPlaying = false;
    playerState.currentTime = 0;
    playerState.progress = 0;
    stopProgressTracking();

    if (playerState.repeatMode === 'track') {
        playerState.isPlaying = true;
        audioRef.value.play();
        startProgressTracking();
    } else {
        nextTrack();
    }
}

// Cleanup on component unmount
onUnmounted(() => {
    stopProgressTracking();
});

// Watch for changes in current track
watch(() => props.currentTrack, (newTrack) => {
    console.log('Current track changed in musicPlayer component:', newTrack);
    console.log('Preview URL:', newTrack?.preview_url);
    
    if (newTrack) {
        playerState.currentTime = 0;
        playerState.progress = 0;
        
        // Check if track has a preview URL
        if (!newTrack.preview_url) {
            console.warn('Track has no preview URL:', newTrack.name);
            playerState.isPlaying = false;
            
            // Stop auto-skipping - just update the store state when needed
            nextTick(() => {
                playerStore.togglePlay(false);
            });
        }
        
        // If we have a new track, we need to reset the audio element
        if (audioRef.value) {
            audioRef.value.pause();
            audioRef.value.src = '';
            audioRef.value.load();
        }
        
        // If the player was playing, start the new track
        if (playerState.isPlaying && newTrack.preview_url) {
            setTimeout(() => {
                if (audioRef.value) {
                    audioRef.value.play().catch(error => {
                        console.error('Error playing audio:', error);
                        playerState.isPlaying = false;
                    });
                    startProgressTracking();
                }
            }, 100);
        }
    }
}, { immediate: true });

// Sync with the store's playing state - add a guard against recursion
let isUpdatingFromStore = false;
watch(() => playerStore.isPlaying, (newIsPlaying) => {
    if (playerState.isPlaying !== newIsPlaying && !isUpdatingFromStore) {
        isUpdatingFromStore = true;
        playerState.isPlaying = newIsPlaying;

        if (audioRef.value) {
            if (newIsPlaying) {
                audioRef.value.play().catch(error => {
                    console.error('Error playing audio:', error);
                    playerState.isPlaying = false;
                    // Use a nextTick to avoid immediate recursion
                    nextTick(() => {
                        playerStore.togglePlay(false);
                        isUpdatingFromStore = false;
                    });
                    return;
                });
                startProgressTracking();
            } else {
                audioRef.value.pause();
                stopProgressTracking();
            }
        }
        isUpdatingFromStore = false;
    }
});
</script>

<template>
    <div class="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] px-4 py-3 z-50">
        <!-- Audio element (hidden) -->
        <audio ref="audioRef" @loadedmetadata="onAudioLoaded" @ended="onAudioEnded" :src="audioSrc"></audio>
        <div class="flex items-center justify-between max-w-7xl mx-auto">
            <!-- Track Info -->
            <div class="flex items-center w-1/4">
                <div class="h-14 w-14 mr-3 flex-shrink-0 relative" v-if="currentTrack">
                    <img :src="trackImage" :alt="trackName" class="h-full w-full object-cover" />
                    <div v-if="!hasPreviewUrl"
                        class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="text-red-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                    </div>
                </div>
                <div class="overflow-hidden">
                    <div class="flex items-center">
                        <div class="text-white text-sm font-medium truncate">{{ trackName }}</div>
                        <span v-if="!hasPreviewUrl" class="ml-1 text-red-500 text-xs">(No preview)</span>
                    </div>
                    <div class="text-zinc-400 text-xs truncate">{{ artistNames }}</div>
                </div>
            </div>

            <!-- Player Controls -->
            <div class="flex flex-col items-center justify-center flex-1 max-w-xl">
                <!-- Controls Buttons -->
                <div class="flex items-center justify-center gap-4 mb-2">
                    <!-- Shuffle Button -->
                    <button @click="toggleShuffle" class="text-zinc-400 hover:text-white transition-colors"
                        :class="{ 'text-green-500 hover:text-green-400': playerState.isShuffling }"
                        aria-label="Shuffle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="16 3 21 3 21 8"></polyline>
                            <line x1="4" y1="20" x2="21" y2="3"></line>
                            <polyline points="21 16 21 21 16 21"></polyline>
                            <line x1="15" y1="15" x2="21" y2="21"></line>
                            <line x1="4" y1="4" x2="9" y2="9"></line>
                        </svg>
                    </button>

                    <!-- Previous Button -->
                    <button @click="previousTrack" class="text-zinc-400 hover:text-white transition-colors"
                        aria-label="Previous">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
                        </svg>
                    </button>

                    <!-- Play/Pause Button -->
                    <button @click="togglePlay"
                        class="rounded-full p-2 bg-white text-black hover:scale-110 transition-transform"
                        aria-label="Play or Pause">
                        <svg v-if="!playerState.isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                        </svg>
                    </button>

                    <!-- Next Button -->
                    <button @click="nextTrack" class="text-zinc-400 hover:text-white transition-colors"
                        aria-label="Next">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path>
                        </svg>
                    </button>

                    <!-- Repeat Button -->
                    <button @click="toggleRepeat" class="text-zinc-400 hover:text-white transition-colors"
                        :class="{ 'text-green-500 hover:text-green-400': playerState.repeatMode !== 'off' }"
                        aria-label="Repeat">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="17 1 21 5 17 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                            <polyline points="7 23 3 19 7 15"></polyline>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                    </button>
                </div>

                <!-- Progress Bar -->
                <div class="w-full flex items-center gap-2 text-xs text-zinc-400">
                    <span>{{ formattedCurrentTime }}</span>
                    <div class="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative group"
                        @click="handleProgressClick">
                        <div class="absolute top-0 left-0 h-full bg-zinc-400 rounded-full group-hover:bg-green-500"
                            :style="{ width: `${playerState.progress}%` }"></div>
                    </div>
                    <span>{{ formattedDuration }}</span>
                </div>
            </div>

            <!-- Volume Controls -->
            <div class="flex items-center justify-end gap-2 w-1/4">
                <button @click="toggleMute" class="text-zinc-400 hover:text-white transition-colors" aria-label="Mute">
                    <svg v-if="playerState.volume > 70" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <svg v-else-if="playerState.volume > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                </button>
                <input type="range" min="0" max="100" step="1" v-model="playerState.volume" @input="handleVolumeChange"
                    class="w-24 accent-white cursor-pointer" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom styling for range inputs */
input[type="range"] {
    -webkit-appearance: none;
    height: 4px;
    background: #535353;
    border-radius: 2px;
    background-image: linear-gradient(#fff, #fff);
    background-repeat: no-repeat;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 0 2px 0 #555;
    transition: background .3s ease-in-out;
}

input[type="range"]::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    box-shadow: none;
    border: none;
    background: transparent;
}

input[type="range"]::-webkit-slider-thumb:hover {
    background: #1DB954;
}

/* Update background-image gradient as value changes */
input[type="range"] {
    background-size: calc(var(--value, 0) * 1%) 100%;
}
</style>