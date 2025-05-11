export const useSpotify = () => {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    // Helper to validate token is present before making API calls
    const validateToken = () => {
        if (!auth.token) {
            throw new Error("Authentication token is missing. Please log in again.");
        }
        return true;
    };

    const searchTrackPlaylist = async (query) => {
        try {
            validateToken();
            
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
                {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                    },
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                console.error("Search API error:", error);
                throw new Error(error.error?.message || "Failed to search tracks");
            }
            
            const data = await response.json();
            return data;
        } catch (e) {
            console.error("There's a problem when you fetch for songs for a playlist", e);
            throw e;
        }
    };

    const createPlaylist = async (info) => {
        try {
            validateToken();
            
            if (!auth.user || !auth.user.id) {
                throw new Error("User profile information is missing");
            }
            
            const response = await fetch(`https://api.spotify.com/v1/users/${auth.user.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    name: info.title,
                    public: info.isPublic,
                    description: info.description || "",
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error("Create playlist API error:", error);
                throw new Error(error.error?.message || "Failed to create playlist");
            }
            
            const data = await response.json();
            return data;
        }
        catch (e) {
            console.error("There was an error while initiating a playlist", e);
            throw e;
        }
    }

    const addSongsToPlaylist = async (id, songsUri) => {
        try {
            validateToken();
            
            if (!songsUri.length) return; // Skip if no songs to add
            
            const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: songsUri
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error("Add songs API error:", error);
                throw new Error(error.error?.message || "Failed to add songs to playlist");
            }
            
            return await response.json();
        }
        catch (e) {
            console.error("There was an error while adding songs", e);
            throw e;
        }
    }

    const addCoverToPlaylist = async (id, imageData) => {
        try {
            validateToken();
            
            if (!imageData) return; // Skip if no image to add
            
            // Extract base64 data without the data URL prefix
            let base64Image = imageData;
            if (imageData.includes('base64,')) {
                base64Image = imageData.split('base64,')[1];
            }
            
            console.log('About to upload cover image');
            
            // Make the API call with the correct content type and format
            const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/images`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'image/jpeg' // This is important
                },
                body: base64Image // Send just the base64 string without the data URL prefix
            });
            
            // Get detailed error information
            if (!response.ok) {
                let errorInfo;
                try {
                    errorInfo = await response.json();
                } catch (e) {
                    errorInfo = { error: { status: response.status, message: "Error parsing response" } };
                }
                
                console.error("Cover upload failed. Status:", response.status);
                console.error("Error details:", errorInfo);
                
                // Special handling for 401 - likely an issue with token scope
                if (response.status === 401) {
                    console.warn("Authentication error when uploading cover image. Try logging out and back in.");
                    alert("You need additional permissions to upload cover images. Please log out and log in again.");
                }
                
                return false;
            }
            
            console.log("Cover image uploaded successfully");
            return true;
        }
        catch (e) {
            console.error("There was an error while adding cover to playlist", e);
            // Don't throw the error - allow playlist creation to proceed without the cover
            console.warn("Continuing playlist creation without cover image");
            return false;
        }
    }

    const createPlaylistComplete = async (p) => {
        try {
            validateToken();
            
            // Wait for the playlist creation to complete and get the response
            const playlist = await createPlaylist(p);
            console.log("Playlist created:", playlist);
            
            if (!playlist.id) {
                throw new Error("Failed to get playlist ID from response");
            }
            
            const id = playlist.id;
            
            // Add songs if present - do this first
            if (p.songs && p.songs.length > 0) {
                try {
                    const songsUri = p.songs.map((song) => song.uri);
                    await addSongsToPlaylist(id, songsUri);
                    console.log("Songs added to playlist successfully");
                } catch (error) {
                    console.error("Error adding songs to playlist:", error);
                    // Continue with the process - at least the playlist exists
                }
            }
            
            // Add cover image if present - do this last and handle failures gracefully
            if (p.image) {
                try {
                    const imageResult = await addCoverToPlaylist(id, p.image);
                    if (imageResult) {
                        console.log("Cover image added successfully");
                    } else {
                        console.warn("Cover image could not be added, but playlist was created");
                    }
                } catch (error) {
                    console.error("Error adding cover image:", error);
                    // Don't let image upload failure stop the process
                }
            }
            
            console.log("Playlist creation process completed");
            return playlist;
        }
        catch (e) {
            console.error("There was an error while creating a playlist", e);
            throw e;
        }
    };

    return {
        searchTrackPlaylist,
        createPlaylistComplete,
    };
};
