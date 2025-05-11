import { useRuntimeConfig } from "nuxt/app";

export const useProfile = () => {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const fetchProfile = async () => {
        try{
            const response = await fetch("https://api.spotify.com/v1/me", {
                method: 'GET',
                headers: {
                    'Authorization' : `Bearer ${auth.token}`,
                }
            });
            const data = await response.json();
            return data;
        }
        catch(e){
            console.error("An error occured while fetching for user profile", e);
            throw e;
        }
    }

    return {
        fetchProfile,
    };

}