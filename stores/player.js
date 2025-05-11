import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentTrack: null,
    playlist: [],
    currentIndex: 0,
    isVisible: false,
    isPlaying: false
  }),
  
  actions: {
    setTrack(track) {
      console.log("Setting single track in store:", track);
      this.currentTrack = track;
      this.isVisible = true;
    },
    
    setPlaylist(playlist, index = 0) {
      console.log("Setting playlist in store. Items:", playlist.length, "Starting at index:", index);
      this.playlist = playlist;
      this.currentIndex = index;
      
      // Important: Extract the track object correctly based on structure
      // Some APIs return the track directly, others nest it under a 'track' property
      const trackItem = playlist[index];
      const trackObj = trackItem?.track || trackItem;
      
      console.log("Track object selected from playlist:", trackObj);
      this.currentTrack = trackObj;
      this.isVisible = true;
    },
    
    nextTrack() {
      if (this.playlist.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      
      // Handle both direct tracks and nested track objects
      const trackItem = this.playlist[this.currentIndex];
      this.currentTrack = trackItem?.track || trackItem;
    },
    
    previousTrack() {
      if (this.playlist.length === 0) return;
      this.currentIndex = this.currentIndex === 0 
        ? this.playlist.length - 1 
        : this.currentIndex - 1;
      
      // Handle both direct tracks and nested track objects
      const trackItem = this.playlist[this.currentIndex];
      this.currentTrack = trackItem?.track || trackItem;
    },
    
    togglePlay(state) {
      if (state !== undefined) {
        this.isPlaying = state;
      } else {
        this.isPlaying = !this.isPlaying;
      }
    },
    
    hidePlayer() {
      this.isVisible = false;
      this.isPlaying = false;
    },
    
    showPlayer() {
      this.isVisible = true;
    }
  }
});