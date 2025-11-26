<template>
  <div class="post">
    <div class="post-header">
      <h3>{{ post.author }}</h3>
      <span class="date">{{ post.date }}</span>
    </div>
    <div class="post-content">
      <p>{{ post.content }}</p>
    </div>
    <div class="post-footer">
      <button @click="like">👍 Like</button>
      <button @click="comment">💬 Comment</button>
      <button @click="share">📤 Share</button>
    </div>
  </div>
</template>

<script>
/**
 * Post.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Componente simple para mostrar una tarjeta de publicación básica con
 * información del autor, fecha y contenido. Incluye botones de interacción
 * (like, comentario, compartir).
 * 
 * PROPS:
 * - post: Object (default: { author: 'User', date: fecha actual, content: 'Post content' })
 *   Descripción: Objeto que contiene la información de la publicación a mostrar
 *   Estructura esperada: { author: string, date: string, content: string }
 * 
 * MÉTODOS:
 * - like(): void
 *   Descripción: Manejador del botón de like (actualmente solo registra en consola)
 * 
 * - comment(): void
 *   Descripción: Manejador del botón de comentario (actualmente solo registra en consola)
 * 
 * - share(): void
 *   Descripción: Manejador del botón de compartir (actualmente solo registra en consola)
 */
export default {
  name: 'Post',
  props: {
    post: {
      type: Object,
      default: () => ({
        author: 'User',
        date: new Date().toLocaleDateString(),
        content: 'Post content'
      })
    }
  },
  methods: {
    like() {
      console.log('Like clicked');
    },
    comment() {
      console.log('Comment clicked');
    },
    share() {
      console.log('Share clicked');
    }
  }
}
</script>

<style scoped>
.post {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: white;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-header h3 {
  margin: 0;
  color: #333;
}

.date {
  color: #999;
  font-size: 12px;
}

.post-content {
  margin-bottom: 15px;
}

.post-content p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  gap: 10px;
}

button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e8e8e8;
}
</style>
