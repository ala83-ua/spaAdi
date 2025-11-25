<template>
  <section class="grid-3">
    <div class="card feature-card">
      <h2>📸 Comparte momentos</h2>
      <p class="muted">Publica tus mejores fotos y videos con amigos</p>
    </div>
    <div class="card feature-card">
      <h2>🔍 Explora contenido</h2>
      <p class="muted">Descubre contenido interesante de otros usuarios</p>
    </div>
    <div class="card feature-card">
      <h2>👥 Conecta con amigos</h2>
      <p class="muted">Sigue a otros usuarios y mantente en contacto</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  min-height: 200px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: #ddd;
}

.feature-card h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #333;
}

.feature-card p {
  margin: 0;
}
</style>
