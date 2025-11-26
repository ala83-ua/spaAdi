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
          <div v-if="isOwnPost(post)" class="post-card__actions-menu">
            <button @click.stop="editPost(post)" class="button--ghost" title="Editar">✏️</button>
            <button @click.stop="deletePost(post.id)" class="button--ghost" title="Eliminar">🗑️</button>
          </div>
        </header>
        <img v-for="img in getImages(post)" :key="img" class="post-card__image" :src="getImageUrl(post, img)" alt="">
        <div class="post-card__body">
          <p>{{ getTexto(post) }}</p>
        </div>
        <div class="post-card__interactions">
          <button @click="openPostDetail(post)" class="button--ghost">Ver detalles</button>
        </div>
      </article>
    </section>

    <!-- Modal con detalles del post -->
    <div v-if="selectedPost" class="modal-overlay" @click="closePostDetail">
      <div class="modal-content" @click.stop>
        <button class="btn-close" @click="closePostDetail">✕</button>
        <PostDetail 
          :post="selectedPost"
          @close="closePostDetail"
          @post-updated="onPostUpdated"
          @post-deleted="onPostDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { isLogged, currentUser } from '../services/auth.service.js';
import { crearPublicacion, listarPublicaciones, eliminarPublicacion } from '../services/publicaciones.service.js';
import { obtenerAvatarUsuario } from '../services/users.service.js';
import PostComposer from '../components/PostComposer.vue';
import PostDetail from '../components/PostDetail.vue';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'FeedView',
  components: {
    PostComposer,
    PostDetail
  },
  data() {
    return {
      posts: [],
      isLogged: false,
      currentUserEmail: 'Invitado',
      currentUserId: null,
      selectedPost: null
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
    editPost(post) {
      this.selectedPost = post;
    },
    openPostDetail(post) {
      this.selectedPost = post;
    },
    closePostDetail() {
      this.selectedPost = null;
    },
    onPostUpdated(updatedPost) {
      const index = this.posts.findIndex(p => p.id === updatedPost.id);
      if (index !== -1) {
        this.posts[index] = updatedPost;
        this.selectedPost = updatedPost;
      }
    },
    onPostDeleted(postId) {
      this.posts = this.posts.filter(p => p.id !== postId);
      this.selectedPost = null;
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
      
      if (u?.id) {
        const userAvatar = obtenerAvatarUsuario(u.id);
        if (userAvatar) {
          return userAvatar;
        }
      }
      
      return (u?.avatar) ? `http://127.0.0.1:8090/api/files/_pb_users_auth_/${u.id}/${u.avatar}` : 'img/avatar.png';
    },
    getUsername(p) { return p.expand?.id_usuario?.username || p.expand?.id_usuario?.email || 'Usuario'; },
    formatDate(date) { return new Date(date).toLocaleString(); },
    isOwnPost(p) { return this.currentUserId && p.expand?.id_usuario?.id === this.currentUserId; }
  }
}
</script>

<style scoped>
.post-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.post-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.post-card__user {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.post-card__meta {
  color: #999;
  font-size: 13px;
  margin-top: 2px;
}

.post-card__actions-menu {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.post-card__image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.post-card__body {
  margin-bottom: 12px;
}

.post-card__body p {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.post-card__interactions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
}

.btn-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 1);
  color: #333;
}
</style>