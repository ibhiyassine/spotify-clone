<script setup>
const auth = useAuth();

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
});

function handleLogin() {
    console.log("Logging in");
    auth.login();
}
</script>

<template>
    <div
        class=" bg-spotify-gray w-[500px] text-2xl text-white text-center rounded-2xl p-4 flex gap-5 flex-col items-center justify-center">
        <div class="w-[4rem] p-0 rounded-full">
            <img src="~/assets/Spotify-clone.png" class="">
        </div>
        <div class=" text-4xl font-bold">
            Welcome to the Spotify Clone
        </div>
        <div>
            In order to use the app, you need to login with your Spotify account.
        </div>
        <div class="h-[80px] flex justify-center items-center">
            <Button v-show="!disabled" class="cursor-pointer bg-spotify-green text-slate-950 rounded-full text-xl font-bold hover:bg-spotify-green-dark transition duration-300 ease-in-out"
                @click="handleLogin()">
                <span class="p-4">
                    Login with Spotify
                </span>
            </Button>
        </div>
    </div>
</template>