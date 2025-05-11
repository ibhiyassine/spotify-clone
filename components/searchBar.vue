<script setup>
let q = ref("");

function search(){
    if (q.value.length > 0) {
        navigateTo(`/search/${q.value}`);
    }
}
</script>

<template>
    <div class="flex justify-center items-center">
        <NuxtLink to="/">
            <IconsHome class="text-white size-10 bg-[#282828] rounded-full p-1 hover:cursor-pointer hover:bg-[#323232]" />
        </NuxtLink>
        <NuxtLink :to="`/search/${q}`">
            <div
                class="bg-[#282828] focus:bg-[#323232] text-white rounded-full ml-2 w-120 outline-none flex items-center justify-between px-1">
                <input v-model="q" type="text" placeholder="Search" class="bg-transparent border-none outline-none text-white px-5 h-6 grow" @input="search()"/>
                <IconsLibrary class="text-white size-10 border-l  p-1 hover:cursor-pointer" />
            </div>
        </NuxtLink>
    </div>
</template>