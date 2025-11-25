<template>
  <section class="card">
    <h1 class="mt-0">Mi perfil</h1>
    <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" style="width:96px;height:96px;border-radius:999px;object-fit:cover">
    <div class="mt-2">
      <input ref="avatarInput" @change="handleAvatarChange" type="file" accept="image/*" style="display:none">
      <button @click="$refs.avatarInput.click()" class="button--ghost" type="button">Cambiar avatar</button>
    </div>
    <p class="muted mt-1">Email: <span>{{ userEmail }}</span></p>
    <p class="muted">ID: <span>{{ userId }}</span></p>
    <p v-if="perfilError" style="color:#c00">{{ perfilError }}</p>
  </section>

  <!-- Mis publicaciones -->
  <section class="post-list mt-4">
    <article v-for="post in myPosts" :key="post.id" class="post-card">
      <header class="post-card__header">
        <img class="post-card__avatar" :src="avatarUrl" alt="Avatar">
        <div>
          <div class="post-card__user">{{ userEmail }}</div>
          <div class="post-card__meta">{{ formatDate(post.created) }}</div>
        </div>
      </header>
      <img v-for="filename in getImages(post)" :key="filename" class="post-card__image" :src="getImageUrl(post, filename)" alt="">
      <div class="post-card__body">
        <p>{{ getTexto(post) }}</p>
      </div>
      <div class="post-card__actions">
        <button @click="deletePost(post.id)" class="button--ghost">🗑️ Eliminar</button>
      </div>
    </article>
  </section>
</template>

<script>
import { currentUser, isLogged, logout } from '../services/auth.service.js';
import { listarPublicaciones, eliminarPublicacion } from '../services/publicaciones.service.js';
import { actualizarUsuarioActual } from '../services/users.service.js';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'PerfilView',
  data() {
    return {
      userEmail: 'Invitado',
      userId: '-',
      avatarUrl: 'img/avatar.png',
      myPosts: [],
      perfilError: '',
      user: null
    }
  },
  mounted() {
    // Verificar si está logueado
    if (!isLogged()) {
      this.$router.push('/login');
      return;
    }
    
    const user = currentUser();
    this.user = user;
    this.userEmail = user?.email ?? 'Invitado';
    this.userId = user?.id ?? '-';
    
    this.updateAvatarDisplay();
    this.loadMyPosts();
  },
  methods: {
    updateAvatarDisplay() {
      if (this.user?.avatar) {
        this.avatarUrl = `${BASE}/api/files/_pb_users_auth_/${this.user.id}/${this.user.avatar}?v=${Date.now()}`;
      } else {
        this.avatarUrl = 'img/avatar.png';
      }
    },
    async handleAvatarChange() {
      const file = this.$refs.avatarInput?.files?.[0];
      if (!file) return;
      
      const btn = this.$refs.avatarInput.previousElementSibling;
      this.perfilError = '';
      
      try {
        await actualizarUsuarioActual({ avatarFile: file });
        this.updateAvatarDisplay();
        this.$refs.avatarInput.value = '';
        
        this.perfilError = '';
        // Mensaje de éxito temporal
        setTimeout(() => {
          this.perfilError = '✓ Avatar actualizado correctamente';
        }, 100);
      } catch (e) {
        console.error('AVATAR ERROR', e);
        this.perfilError = e.message || 'No se pudo actualizar el avatar.';
      }
    },
    async loadMyPosts() {
      try {
        const res = await listarPublicaciones({ page: 1, perPage: 100 });
        const items = res.items || res;
        // Filtrar solo los posts del usuario actual
        this.myPosts = items.filter(p => p.expand?.id_usuario?.id === this.user?.id);
      } catch (err) {
        console.error(err);
        this.perfilError = 'Error al cargar tus publicaciones.';
      }
    },
    async deletePost(id) {
      if (confirm('¿Seguro que quieres eliminar esta publicación?')) {
        try {
          await eliminarPublicacion(id);
          this.loadMyPosts();
        } catch (err) {
          console.error(err);
          alert('No se pudo eliminar la publicación.');
        }
      }
    },
    getTexto(p) {
      return p.Comentario ?? p.comentario ?? p.texto ?? p.content ?? '';
    },
    getImages(p) {
      if (Array.isArray(p.Imagen) && p.Imagen.length) return p.Imagen;
      if (p.imagen) return [p.imagen];
      return [];
    },
    getImageUrl(item, filename) {
      return `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
}
</script>
