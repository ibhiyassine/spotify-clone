import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore();
    if (to.path !== "/login" && to.path !== "/callback" && !auth.isAuthenticated) {
        console.log("Go to the login page");
        return navigateTo("/login");
    }
});
