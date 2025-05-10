export const useAuth = () => {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const login = () => {
        const scope = [
            "user-read-private",
            "user-read-email",
            "playlist-read-private",
            "playlist-modify-public",
            "playlist-modify-private",
            "user-top-read",
            "playlist-read-collaborative",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-currently-playing",
            "streaming",
            "playlist-modify-public",
            "playlist-modify-private",
            "user-library-read",
            "user-library-modify",
        ].join(" ");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: config.public.spotifyClientId,
            scope,
            redirect_uri: config.public.spotifyRedirectUri,
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    const handleCallback = async (code) => {
        try{
            const params = new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: config.public.spotifyRedirectUri,
            });
    
            const query = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    Authorization:
                        "Basic " + new Buffer.from(client_id + ":" + client_secret).toString("base64"),
                    "Content-type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            });
    
            const data = await query.json();
            auth.setToken(data.access_token);
    
            // fetch user profile
            const userProfile = await fetch("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }).then((response) => response.json());
    
            auth.setUser(userProfile)
        }
        catch(e){
            console.error("Error while managing callback: ", error);
            throw error;
        }
        
    };

    return {
        login,
        handleCallback,
    };
};
