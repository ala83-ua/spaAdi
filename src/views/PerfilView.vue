<template>
  <!-- Sección de perfil del usuario -->
  <section class="card profile-header">
    <div class="profile-header__content">
      <div class="profile-header__avatar-wrapper">
        <img :src="avatarUrl" alt="Avatar" class="profile-header__avatar">
        <input ref="avatarInput" @change="handleAvatarChange" type="file" accept="image/*" style="display:none">
        <button @click="$refs.avatarInput.click()" class="button button--avatar-change">Cambiar</button>
        <button v-if="hasUnsavedAvatar" @click="saveAvatar" class="button">Guardar cambios</button>
      </div>
      <div class="profile-header__info">
        <h1 class="profile-header__name">{{ userName }}</h1>
        <p class="profile-header__email">{{ userEmail }}</p>
        <p class="profile-header__meta">{{ myPosts.length }} publicaciones</p>
        <p v-if="perfilError" class="profile-header__error">{{ perfilError }}</p>
      </div>
    </div>
  </section>

  <!-- Compositor de posts en perfil -->
  <PostComposer 
    title="Subir publicación"
    placeholder="¿Qué estás pensando?"
    @post-created="loadMyPosts"
  />

  <!-- Sección de fotos del usuario (grid) -->
  <section class="mt-4">
    <h2 class="mt-0">Mis publicaciones</h2>
    <div v-if="myPosts.length === 0" class="muted" style="text-align:center;padding:32px">
      No has publicado nada aún.
    </div>
    <div v-else class="grid-3">
      <article v-for="post in myPosts" :key="post.id" class="post-grid-item">
        <div class="post-grid-item__image-container">
          <img v-if="getImages(post).length > 0" :src="getImageUrl(post, getImages(post)[0])" :alt="getTexto(post)" class="post-grid-item__image">
          <div v-else class="post-grid-item__no-image">Sin imagen</div>
          <div class="post-grid-item__overlay">
            <button @click="deletePost(post.id)" class="button--ghost">🗑️</button>
          </div>
        </div>
        <div class="post-grid-item__info">
          <p class="post-grid-item__text">{{ getTexto(post) }}</p>
          <p class="post-grid-item__date">{{ formatDate(post.created) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import { currentUser, isLogged, logout } from '../services/auth.service.js';
import { listarPublicaciones, eliminarPublicacion } from '../services/publicaciones.service.js';
import { actualizarUsuarioActual } from '../services/users.service.js';
import PostComposer from '../components/PostComposer.vue';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'PerfilView',
  components: {
    PostComposer
  },
  data() {
    return {
      userEmail: 'Invitado',
      userName: 'Usuario',
      userId: '-',
      avatarUrl: 'img/avatar.png',
      myPosts: [],
      perfilError: '',
      user: null,
      avatarPreviewUrl: null,
      selectedAvatarFile: null,
      hasUnsavedAvatar: false
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
    this.userName = user?.username ?? user?.email?.split('@')[0] ?? 'Usuario';
    this.userId = user?.id ?? '-';
    
    this.updateAvatarDisplay();
    this.loadMyPosts();
  },
  methods: {
    updateAvatarDisplay() {
      // Si hay un preview de avatar, mostrarlo primero
      if (this.avatarPreviewUrl) {
        this.avatarUrl = this.avatarPreviewUrl;
      } else {
        // Intentar obtener del localStorage primero (avatar guardado)
        const userAvatar = localStorage.getItem('userAvatar');
        if (userAvatar) {
          this.avatarUrl = userAvatar;
        } else if (this.user?.avatar) {
          this.avatarUrl = `http://127.0.0.1:8090/api/files/_pb_users_auth_/${this.user.id}/${this.user.avatar}?v=${Date.now()}`;
        } else {
          this.avatarUrl = 'img/avatar.png';
        }
      }
    },
    async handleAvatarChange() {
      const file = this.$refs.avatarInput?.files?.[0];
      if (!file) return;
      
      this.perfilError = '';
      this.selectedAvatarFile = file;
      
      // Mostrar preview inmediatamente
      this.avatarPreviewUrl = URL.createObjectURL(file);
      this.updateAvatarDisplay();
      this.hasUnsavedAvatar = true;
    },
    async saveAvatar() {
      if (!this.selectedAvatarFile) return;
      
      try {
        this.perfilError = 'Guardando...';
        
        // Guardar el avatar usando el servicio
        await actualizarUsuarioActual({ avatarFile: this.selectedAvatarFile });
        
        // Actualizar el usuario en memoria
        if (this.user) {
          this.user.avatar = this.selectedAvatarFile.name;
        }
        
        // Limpiar el preview temporal
        this.selectedAvatarFile = null;
        this.avatarPreviewUrl = null;
        this.hasUnsavedAvatar = false;
        this.updateAvatarDisplay();
        
        this.$refs.avatarInput.value = '';
        
        // Mensaje de éxito temporal
        this.perfilError = '✓ Avatar guardado correctamente';
        setTimeout(() => {
          if (this.perfilError === '✓ Avatar guardado correctamente') {
            this.perfilError = '';
          }
        }, 3000);
      } catch (e) {
        console.error('AVATAR SAVE ERROR', e);
        this.avatarPreviewUrl = null;
        this.updateAvatarDisplay();
        this.perfilError = e.message || 'No se pudo guardar el avatar.';
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
      // Si la publicación tiene datos de imagen en base64, usarlos
      if (item.imagenData) {
        const img = item.imagenData.find(i => i.nombre === filename);
        if (img) return img.data;
      }
      // Si no, usar la URL del servidor
      return `http://127.0.0.1:8090/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
}
</script>
