import { useRuntimeConfig } from "#app";
import { useAuthStore } from "~/stores/auth";

export const useProfile = () => {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const fetchProfile = async () => {
        try{
            // Check if token exists
            if (!auth.token) {
                throw new Error("No authentication token available");
            }
            
            const response = await fetch("https://api.spotify.com/v1/me", {
                method: 'GET',
                headers: {
                    'Authorization' : `Bearer ${auth.token}`,
                }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        }
        catch(e){
            console.error("An error occured while fetching for user profile", e);
            throw e;
        }
    }

    const fetchTopArtists = async () => {
        try{
            const response = await fetch("https://api.spotify.com/v1/me/top/artists", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            });
            const data = response.json();
            return data;
        }
        catch(e){
            console.error("There's an error while fetching for user top artists", e);
            throw e;
        }
    }

    const fetchTopTracks = async () => {
        try{
            const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                }
            });
            const data = response.json();
            return data;
        }
        catch(e){
            console.error("There's an error while fetching for user top tracks", e);
            throw e;
        }
    }

    const fetchPlaylists = async() => {
        try{
            const response = await fetch("https://api.spotify.com/v1/me/playlists", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            return data;
        }   
        catch(e) {
            console.error("Something went wrong while searching for playlist", e);
            throw e;
        }
    }

    return {
        fetchProfile,
        fetchTopArtists,
        fetchTopTracks,
        fetchPlaylists,
    };
}