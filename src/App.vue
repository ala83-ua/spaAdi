<template>
  <div id="app">
    <Navbar />
    <main class="container">
      <router-view></router-view>
    </main>
    <footer class="site-footer">© 2025 — Inst·alacant</footer>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  background: #fafafa;
}
</style>