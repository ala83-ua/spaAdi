import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import FeedView from '../views/FeedView.vue';
import ExplorarView from '../views/ExplorarView.vue';
import PerfilView from '../views/PerfilView.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/feed',
        name: 'Feed',
        component: FeedView
    },
    {
        path: '/explorar',
        name: 'Explorar',
        component: ExplorarView
    },
    {
        path: '/perfil',
        name: 'Perfil',
        component: PerfilView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;