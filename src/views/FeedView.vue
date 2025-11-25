<template>
  <div>
    <section class="card">
      <h1 class="mt-0">Inicio</h1>
      <div class="toolbar mt-2">
        <input v-model="composeInput" class="input" type="text" placeholder="¿Qué estás pensando?" />
        <input ref="fileInput" @change="handleFileSelect" type="file" accept="image/*" multiple style="display:none">
        <button @click="$refs.fileInput.click()" class="button--ghost">Añadir fotos</button>
        <button @click="publishPost" class="button">Publicar</button>
      </div>
      <div class="mt-2" v-if="previewFiles.length > 0" style="display:flex;gap:.5rem;flex-wrap:wrap">
        <img v-for="(f, i) in previewFiles" :key="i" :src="f" style="max-width:120px;border-radius:8px" />
      </div>
      <p class="muted mt-1">Sesión: {{ currentUserEmail }}</p>
      <p v-if="feedError" style="color:#c00">{{ feedError }}</p>
    </section>

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

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'FeedView',
  data() {
    return {
      composeInput: '',
      selectedFiles: [],
      previewFiles: [],
      posts: [],
      feedError: '',
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
    handleFileSelect(e) {
      this.selectedFiles = Array.from(e.target.files || []);
      this.previewFiles = this.selectedFiles.map(f => URL.createObjectURL(f));
    },
    async publishPost() {
      if (!this.isLogged) return alert('Inicia sesión');
      const comentario = this.composeInput.trim();
      if (!comentario && !this.selectedFiles.length) return;
      try {
        await crearPublicacion({ comentario, archivos: this.selectedFiles });
        this.composeInput = '';
        this.selectedFiles = [];
        this.previewFiles = [];
        this.loadPosts();
      } catch (err) {
        alert('No se pudo publicar');
      }
    },
    async loadPosts() {
      try {
        const res = await listarPublicaciones({ page: 1, perPage: 10 });
        this.posts = res.items || res;
      } catch (err) {
        this.feedError = 'Error al cargar el feed.';
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
    getImageUrl(item, filename) { return `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`; },
    getAvatarUrl(p) {
      const u = p.expand?.id_usuario;
      return (u?.avatar) ? `${BASE}/api/files/_pb_users_auth_/${u.id}/${u.avatar}` : 'img/avatar.png';
    },
    getUsername(p) { return p.expand?.id_usuario?.username || p.expand?.id_usuario?.email || 'Usuario'; },
    formatDate(date) { return new Date(date).toLocaleString(); },
    isOwnPost(p) { return this.currentUserId && p.expand?.id_usuario?.id === this.currentUserId; }
  }
}
</script>
