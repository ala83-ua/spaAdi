<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link to="/" class="logo">INST·ALACANT</router-link>
      <nav class="nav">
        <router-link to="/">Inicio</router-link>
        <router-link to="/explorar">Explorar</router-link>
        <router-link to="/perfil">Perfil</router-link>
        <router-link to="/login" id="authLink">{{ isLogged ? 'Cerrar sesión' : 'Entrar' }}</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
import { isLogged, logout } from '../services/auth.service.js';

export default {
  name: 'Navbar',
  data() {
    return {
      isLogged: false
    }
  },
  mounted() {
    this.isLogged = isLogged();
  },
  methods: {
    handleLogout(e) {
      if (this.isLogged) {
        e.preventDefault();
        if (confirm('¿Seguro que quieres cerrar sesión?')) {
          logout();
          this.$router.push('/login');
        }
      }
    }
  }
}
</script>

<style scoped>
/* Los estilos vienen del CSS global en assets/styles.css */
</style>