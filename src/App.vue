<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app">
    <Navbar />

    <!-- Contenido principal: lo pone el router -->
    <main class="container">
      <RouterView />
    </main>

    <footer class="site-footer">
      © 2025 — Inst·alacant
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main.container {
  flex: 1;
}
</style>
