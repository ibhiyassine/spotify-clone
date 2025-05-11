<script setup>
import { ref, defineEmits } from 'vue';
import { Toggle } from '@/components/ui/toggle';
import { useSpotify } from '@/composables/useSpotify';
import { useRouter } from 'vue-router';

// Define emits
const emit = defineEmits(['close']);

// Form fields
const title = ref('');
const description = ref('');
const isPublic = ref(true);
const imageFile = ref(null);
const previewImage = ref('');
const searchQuery = ref('');
const searchResults = ref([]);

const { searchTrackPlaylist, createPlaylistComplete } = useSpotify();
const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref('');

// Selected songs for the playlist
const selectedSongs = ref([]);

// Handle toggle change for public/private status
const handleToggleChange = (pressed) => {
    isPublic.value = pressed;
};

// Function to handle image upload - simplified to only encode without compression
const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type - only accept image files
    if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
        alert('Please select a JPEG image file');
        return;
    }

    // Check file size - maximum 256 KB (262,144 bytes)
    if (file.size > 262144) {
        alert('Image size must be less than 256 KB');
        return;
    }

    // Read the file and convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
        // Get the Base64 encoded data
        const base64Data = e.target.result;
        imageFile.value = base64Data;
        previewImage.value = base64Data;
        console.log('Image loaded as Base64', base64Data);
    };
    reader.onerror = (e) => {
        console.error('Error reading file:', e);
        alert('Error reading the image file');
    };

    // Read as Data URL (Base64)
    reader.readAsDataURL(file);
};

// Search function
const searchSongs = async () => {
    if (searchQuery.value.trim() === '') {
        searchResults.value = [];
        return;
    }

    try {
        const response = await searchTrackPlaylist(searchQuery.value);
        console.log('Search response:', response); // Debug log

        if (response && response.tracks && response.tracks.items) {
            // Transform the Spotify API response to our needed format
            searchResults.value = response.tracks.items.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artists.map(artist => artist.name).join(', '),
                album: item.album.name,
                albumCover: item.album.images.length > 0 ? item.album.images[0].url : null,
                uri: item.uri
            }));
            console.log('Processed search results:', searchResults.value); // Debug log
        } else {
            searchResults.value = [];
            console.log('No search results found or unexpected response structure');
        }
    } catch (error) {
        console.error('Error searching songs:', error);
        searchResults.value = [];
    }
};

// Add song to selected list
const addSong = (song) => {
    if (!selectedSongs.value.some(s => s.id === song.id)) {
        selectedSongs.value.push(song);
    }
    console.log('Selected songs:', selectedSongs.value); // Debug log
};

// Remove song from selected list
const removeSong = (songId) => {
    selectedSongs.value = selectedSongs.value.filter(song => song.id !== songId);
};

// Handle form submission
const handleSubmit = async () => {
    if (!title.value.trim()) {
        alert('Title is required');
        return;
    }

    // Reset error state
    errorMessage.value = '';
    isLoading.value = true;

    try {
        // Create playlist object
        const playlistData = {
            title: title.value,
            description: description.value,
            isPublic: isPublic.value,
            image: imageFile.value,
            songs: selectedSongs.value
        };

        console.log('Creating playlist:', playlistData);

        // Call the API to create the playlist
        const result = await createPlaylistComplete(playlistData);

        if (result && result.id) {
            // Success - close modal and potentially redirect to the new playlist
            console.log('Playlist created successfully:', result);
            emit('close');
            router.push(`/playlist/${result.id}`);
        } else {
            errorMessage.value = 'Failed to create playlist. Please try again.';
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        errorMessage.value = error.message || 'Failed to create playlist. Please try again.';
    } finally {
        isLoading.value = false;
    }
};

// Stop click propagation on the modal content to prevent closing
const stopPropagation = (e) => {
    e.stopPropagation();
};
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10" @click="$emit('close')">
        <div class="w-full max-w-2xl rounded-md max-h-[90vh] overflow-y-auto" @click="stopPropagation">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">Create Playlist</h2>
                    <button class="text-white hover:text-gray-300 text-xl" @click="$emit('close')">✕</button>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Image Upload -->
                    <div class="flex items-center space-x-4">
                        <div class="w-32 h-32 bg-spotify-gray flex items-center justify-center rounded cursor-pointer overflow-hidden"
                            @click="$refs.imageInput.click()">
                            <img v-if="previewImage" :src="previewImage" class="w-full h-full object-cover"
                                alt="Playlist cover" />
                            <span v-else class="text-4xl text-gray-400">+</span>
                            <input ref="imageInput" type="file" accept="image/*" class="hidden"
                                @change="handleImageUpload" />
                        </div>
                        <div class="flex-1">
                            <!-- Title Input -->
                            <div class="mb-3">
                                <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                                <input id="title" v-model="title" type="text" required
                                    class="w-full px-3 py-2 bg-spotify-gray text-white rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="My Awesome Playlist" />
                            </div>

                            <!-- Description Input -->
                            <div>
                                <label for="description"
                                    class="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                                <input id="description" v-model="description" type="text"
                                    class="w-full px-3 py-2 bg-spotify-gray text-white rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Describe your playlist" />
                            </div>
                        </div>
                    </div>

                    <!-- Privacy Toggle using the Toggle component -->
                    <div class="flex items-center space-x-4">
                        <label class="text-white text-sm">Privacy Setting:</label>
                        <div class="flex items-center space-x-2">
                            <Toggle v-model="isPublic" aria-label="Toggle public/private" variant="outline"
                                class="text-white hover:bg-white hover:text-black">
                                {{ isPublic ? 'Public' : 'Private' }}
                            </Toggle>
                        </div>
                    </div>

                    <!-- Search for Songs -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Add Songs</label>
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Search for songs"
                                class="w-full px-3 py-2 bg-spotify-gray text-white rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                @input="searchSongs" />
                        </div>

                        <!-- Search Results -->
                        <div v-if="searchResults.length > 0"
                            class="mt-2 bg-spotify-gray rounded max-h-40 overflow-y-auto">
                            <div v-for="song in searchResults" :key="song.id"
                                class="px-3 py-2 hover:bg-spotify-light-gray flex justify-between items-center cursor-pointer"
                                @click="addSong(song)">
                                <div>
                                    <div class="text-white">{{ song.title }}</div>
                                    <div class="text-gray-400 text-sm">{{ song.artist }} • {{ song.album }}</div>
                                </div>
                                <button type="button" class="text-green-500 hover:text-green-400">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Selected Songs -->
                    <div v-if="selectedSongs.length > 0">
                        <h3 class="text-white font-medium mb-2">Selected Songs</h3>
                        <div class="bg-spotify-gray rounded max-h-40 overflow-y-auto">
                            <div v-for="song in selectedSongs" :key="song.id"
                                class="px-3 py-2 hover:bg-spotify-light-gray flex justify-between items-center">
                                <div>
                                    <div class="text-white">{{ song.title }}</div>
                                    <div class="text-gray-400 text-sm">{{ song.artist }}</div>
                                </div>
                                <button type="button" class="text-red-500 hover:text-red-400"
                                    @click="removeSong(song.id)">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col space-y-2 pt-4">
                        <!-- Error message display -->
                        <div v-if="errorMessage" class="text-red-500 text-sm mb-2">
                            {{ errorMessage }}
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button"
                                class="px-4 py-2 bg-transparent text-white hover:text-gray-300 rounded"
                                @click="$emit('close')" :disabled="isLoading">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                :disabled="isLoading">
                                <span v-if="isLoading"
                                    class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                {{ isLoading ? 'Creating...' : 'Create Playlist' }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Additional styles for the component */
.bg-spotify-dark {
    background-color: #121212;
}

.bg-spotify-gray {
    background-color: #282828;
}

.bg-spotify-light-gray {
    background-color: #323232;
}
</style>