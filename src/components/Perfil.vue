<template>
  <div class="perfil">
    <div class="perfil-header">
      <div class="avatar"></div>
      <div class="perfil-info">
        <h2>{{ username }}</h2>
        <p>{{ bio }}</p>
      </div>
    </div>
    <div class="perfil-stats">
      <div class="stat">
        <strong>Publicaciones</strong>
        <span>{{ posts }}</span>
      </div>
      <div class="stat">
        <strong>Seguidores</strong>
        <span>{{ followers }}</span>
      </div>
      <div class="stat">
        <strong>Siguiendo</strong>
        <span>{{ following }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Perfil.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Componente que muestra una tarjeta de perfil de usuario simplificada con
 * información básica como nombre de usuario, biografía y estadísticas.
 * 
 * VARIABLES DE ESTADO (data):
 * - username: string - Nombre del usuario (inicial: 'Mi Usuario')
 * - bio: string - Biografía del usuario (inicial: 'Bienvenido a mi perfil')
 * - posts: number - Número de publicaciones del usuario
 * - followers: number - Número de seguidores
 * - following: number - Número de usuarios que sigue
 */
export default {
  name: 'Perfil',
  data() {
    return {
      username: 'Mi Usuario',
      bio: 'Bienvenido a mi perfil',
      posts: 0,
      followers: 0,
      following: 0
    }
  }
}
</script>

<style scoped>
.perfil {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.perfil-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.perfil-info h2 {
  margin: 0 0 5px 0;
  color: #333;
}

.perfil-info p {
  margin: 0;
  color: #999;
}

.perfil-stats {
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat strong {
  display: block;
  color: #666;
  margin-bottom: 5px;
}

.stat span {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
</style>
