export const useSearch = () => {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const searchTracks = async (q) => {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=20`,
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
        }
        catch(e) {
            console.error("There's something wrong while fetching for tracks", e);
        }
    };

    const searchArtists = async (q) => {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=20`,
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
        }
        catch(e) {
            console.error("There's something wrong while fetching for tracks", e);
        }
    };

    const searchPlaylists = async (q) => {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=playlist&limit=20`,
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
                throw new Error(error.error?.message || "Failed to search playlists");
            }

            const data = await response.json();
            return data;
        }
        catch(e) {
            console.error("There's something wrong while fetching for playlists", e);
        }
    };

    const searchAlbums = async (q) => {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=20`,
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
                throw new Error(error.error?.message || "Failed to search albums");
            }

            const data = await response.json();
            return data;
        }
        catch(e) {
            console.error("There's something wrong while fetching for albums", e);
        }
    };

    const searchPlaylistById = async (id) => {
        try{
            const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization' : `Bearer ${auth.token}`
                }
            });

            const data = await response.json();

            return data;
        }
        catch(e){
            console.error("Can't fetch playlist by ID");
            throw e;
        }
    };

    const searchOwnedPlaylists = async () => {
        try{
            const response = await fetch(`https://api.spotify.com/v1/users/${auth.user.id}/playlists`, {
                method: 'GET',
                headers: {
                    'Authorization' : `Bearer ${auth.token}`,
                }
            });
            if(!response.ok){
                throw new Error("Wasn't able to fetch user's playlists");
            }
            const data = await response.json();

            return data;
        }
        catch(e) {
            console.error("There was an error while fetching for playlist owned by user", e);
            throw e
        }
    };

    return { searchTracks, searchArtists, searchPlaylists, searchAlbums, searchPlaylistById, searchOwnedPlaylists };
};