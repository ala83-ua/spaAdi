<template>
  <div>
    <PostComposer 
      title="Inicio" 
      placeholder="¿Qué estás pensando?" 
      @post-created="loadPosts"
    />

    <section class="post-list mt-4">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <header class="post-card__header">
          <img class="post-card__avatar" :src="getAvatarUrl(post)" alt="Avatar">
          <div>
            <div class="post-card__user">{{ getUsername(post) }}</div>
            <div class="post-card__meta">{{ formatDate(post.created) }}</div>
          </div>
        </header>
        <img v-for="img in getImages(post)" :key="img" class="post-card__image" :src="getImageUrl(post, img)" alt="">
        <div class="post-card__body">
          <p>{{ getTexto(post) }}</p>
        </div>
        <div class="post-card__actions">
          <button v-if="isLogged && isOwnPost(post)" @click="deletePost(post.id)" class="button--ghost">🗑️ Eliminar</button>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import { isLogged, currentUser } from '../services/auth.service.js';
import { crearPublicacion, listarPublicaciones, eliminarPublicacion } from '../services/publicaciones.service.js';
import PostComposer from '../components/PostComposer.vue';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'FeedView',
  components: {
    PostComposer
  },
  data() {
    return {
      posts: [],
      isLogged: false,
      currentUserEmail: 'Invitado',
      currentUserId: null
    }
  },
  mounted() {
    this.isLogged = isLogged();
    const user = currentUser();
    this.currentUserEmail = this.isLogged ? (user?.email || '—') : 'Invitado';
    this.currentUserId = user?.id;
    this.loadPosts();
  },
  methods: {
    async loadPosts() {
      try {
        const res = await listarPublicaciones({ page: 1, perPage: 10 });
        this.posts = res.items || res;
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    },
    async deletePost(id) {
      if (!confirm('¿Eliminar?')) return;
      try {
        await eliminarPublicacion(id);
        this.loadPosts();
      } catch {
        alert('No se pudo eliminar');
      }
    },
    getTexto(p) { return p.Comentario || p.comentario || ''; },
    getImages(p) { return (p.Imagen || p.imagen || []); },
    getImageUrl(item, filename) {
      // Si la publicación tiene datos de imagen en base64, usarlos
      if (item.imagenData) {
        const img = item.imagenData.find(i => i.nombre === filename);
        if (img) return img.data;
      }
      // Si no, usar la URL del servidor
      return `http://127.0.0.1:8090/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    getAvatarUrl(p) {
      const u = p.expand?.id_usuario;
      
      // Primero, buscar avatar en localStorage si es el usuario actual
      if (u?.id && this.currentUserId === u.id) {
        const userAvatar = localStorage.getItem('userAvatar');
        if (userAvatar) {
          return userAvatar;
        }
      }
      
      // Si no, usar la URL del servidor
      return (u?.avatar) ? `http://127.0.0.1:8090/api/files/_pb_users_auth_/${u.id}/${u.avatar}` : 'img/avatar.png';
    },
    getUsername(p) { return p.expand?.id_usuario?.username || p.expand?.id_usuario?.email || 'Usuario'; },
    formatDate(date) { return new Date(date).toLocaleString(); },
    isOwnPost(p) { return this.currentUserId && p.expand?.id_usuario?.id === this.currentUserId; }
  }
}
</script>
