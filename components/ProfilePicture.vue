<script setup>
    const props = defineProps({
        images: {
            type: Array,
            default: () => [
                {
                    url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
                }
            ]
        },
        display_name: {
            type: String,
            default: 'IBHI Ahmed Yassine'
        }
    });
    const emit = defineEmits(['profile-click']);
</script>

<template>
    <button class="bg-black hover:bg-[#282828] rounded-full p-0.5 mr-8 mt-0.5 cursor-pointer" @click="emit('profile-click')">
        <div class="flex items-center">
            <img :src="images[0].url" alt="Profile picture" class="rounded-full" width="40">
            <span class="text-white ml-1.5 font-semibold text-[14px] px-2">{{ display_name }}</span>
        </div>
    </button>
</template>