<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link to="/" class="logo">INST·ALACANT</router-link>
      <nav class="nav">
        <router-link to="/">Inicio</router-link>
        <router-link to="/explorar">Explorar</router-link>
        <router-link to="/perfil">Perfil</router-link>
        <a 
          href="#"
          id="authLink"
          @click="handleAuthClick"
        >
          {{ isLogged ? 'Cerrar sesión' : 'Entrar' }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script>
/**
 * Navbar.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Barra de navegación principal de la aplicación. Muestra el logo, enlaces de navegación
 * y un botón dinámico para iniciar/cerrar sesión. 
 * 
 * EVENTOS PROCESADOS:
 * - 'login': Se dispara cuando un usuario inicia sesión (desde LoginView)
 * - 'logout': Al cerrar sesión
 * 
 * EVENTOS GENERADOS:
 * - 'logout': Se emite cuando el usuario confirma cerrar sesión
 * 
 * VARIABLES DE ESTADO (data):
 * - isLogged: boolean - Indica si hay un usuario autenticado
 * 
 * MÉTODOS:
 * 
 * - handleAuthClick(e: Event): void
 *   Maneja el clic en el botón de autenticación (Entrar/Cerrar sesión)
 *   Parámetros: e - Evento del clic
 *   Efectos: Si está logeado, muestra confirmación y cierra sesión; si no está logeado, redirige a /login
 */
import { isLogged, logout, currentUser } from '../services/auth.service.js';
import { on, off, emit } from '../eventBus.js';

export default {
  name: 'Navbar',
  data() {
    return {
      isLogged: false
    }
  },
  mounted() {
    this.checkLoginStatus();
    on('login', this.handleLoginEvent);
    on('logout', this.handleLogoutEvent);
    window.addEventListener('storage', this.checkLoginStatus);
  },
  beforeUnmount() {
    off('login', this.handleLoginEvent);
    off('logout', this.handleLogoutEvent);
    window.removeEventListener('storage', this.checkLoginStatus);
  },
  methods: {
    checkLoginStatus() {
      this.isLogged = isLogged();
    },
    handleLoginEvent() {
      this.isLogged = true;
    },
    handleLogoutEvent() {
      this.isLogged = false;
    },
    handleAuthClick(e) {
      e.preventDefault();
      
      if (this.isLogged) {
        if (confirm('¿Seguro que quieres cerrar sesión?')) {
          logout();
          emit('logout');
          this.isLogged = false;
          this.$router.push('/login');
        }
      } else {
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
/* Los estilos vienen del CSS global en assets/styles.css */
</style>