<template>
  <div class="post-list">
    <Post v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script>
/**
 * PostList.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Componente contenedor simple que renderiza una lista de publicaciones.
 * Itera sobre un array de posts y renderiza un componente Post para cada uno.
 * 
 * PROPS:
 * - posts: Array (default: [])
 *   Descripción: Array de objetos de publicación a mostrar
 */
import Post from './Post.vue';

export default {
  name: 'PostList',
  components: {
    Post
  },
  props: {
    posts: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
