<template>
    <div id="app">
        <NavBar />
        <router-view />
    </div>
</template>

import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
// ... otras importaciones

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    // ... otras rutas
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;