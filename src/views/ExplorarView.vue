<template>
  <!-- Compositor de posts en explorar -->
  <PostComposer 
    title="Compartir con la comunidad"
    placeholder="Comparte tu foto, idea o proyecto..."
    @post-created="refreshPosts"
  />

  <!-- Barra de búsqueda y filtros -->
  <section class="toolbar mt-4">
    <input v-model="searchBox" @input="updateSearch" class="input" type="search" placeholder="Busca @usuario, texto o #hashtag" aria-label="Buscar" />
    <select v-model="categoryFilter" @change="updateSearch" class="select" aria-label="Filtrar por categoría">
      <option value="">Todo</option>
      <option value="#fotografia">Fotografía</option>
      <option value="#arte">Arte</option>
      <option value="#viajes">Viajes</option>
    </select>
    <select v-model="orderFilter" @change="updateSearch" class="select" aria-label="Ordenar">
      <option value="-created">Recientes</option>
      <option value="popular">Populares</option>
    </select>
    <button @click="clearFilters" class="button--ghost" type="button">Limpiar</button>
  </section>

  <section class="grid-3 mt-4" id="grid">
    <article v-for="post in posts" :key="post.id" class="post-card" @click="openPostDetail(post)">
      <header class="post-card__header">
        <img class="post-card__avatar" :src="getAvatarUrl(post)" alt="Avatar">
        <div>
          <div class="post-card__user">{{ getUsername(post) }}</div>
          <div class="post-card__meta">{{ formatDate(post.created) }}</div>
        </div>
        <div v-if="isAuthor(post)" class="post-card__actions" @click.stop>
          <button @click="editPost(post)" class="post-card__btn-edit" title="Editar">✏️</button>
        </div>
      </header>
      <img v-for="filename in getImages(post)" :key="filename" class="post-card__image" :src="getImageUrl(post, filename)" alt="">
      <div class="post-card__body">
        <p>{{ getTexto(post) }}</p>
      </div>
      <div class="post-card__stats">
        <span>👍 {{ post.likes || 0 }}</span>
        <span>💬 {{ post.commentCount || post.comentarios?.length || 0 }}</span>
      </div>
    </article>
  </section>

  <div class="mt-3" style="display:flex;justify-content:center">
    <button v-if="!eof" @click="loadMore" class="button--ghost">Cargar más</button>
  </div>

  <p v-if="exploreError" class="muted" style="color:#c00">{{ exploreError }}</p>

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
</template>

<script>
import { listarPublicaciones } from '../services/publicaciones.service.js';
import { isLogged, logout, currentUser } from '../services/auth.service.js';
import { obtenerAvatarUsuario } from '../services/users.service.js';
import PostComposer from '../components/PostComposer.vue';
import PostDetail from '../components/PostDetail.vue';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'ExplorarView',
  components: {
    PostComposer,
    PostDetail
  },
  data() {
    return {
      searchBox: '',
      categoryFilter: '',
      orderFilter: '-created',
      posts: [],
      exploreError: '',
      page: 1,
      perPage: 9,
      loading: false,
      eof: false,
      selectedPost: null
    }
  },
  mounted() {
    if (isLogged()) {
      const authLink = document.querySelector('#authLink');
      if (authLink) {
        authLink.textContent = 'Cerrar sesión';
        authLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (confirm('¿Seguro que quieres cerrar sesión?')) {
            logout();
            this.$router.push('/login');
          }
        });
      }
    }
    
    this.loadPosts();
  },
  methods: {
    refreshPosts() {
      this.page = 1;
      this.posts = [];
      this.eof = false;
      this.loadPosts();
    },
    extractHashtags(text) {
      if (!text) return [];
      const tags = text.match(/#\w+/g);
      return tags ? tags.map(t => t.toLowerCase()) : [];
    },
    buildFilter() {
      const filters = [];
      
      // Filtro por categoría (hashtag)
      const catTag = this.categoryFilter?.trim();
      if (catTag) {
        filters.push(`Comentario ~ "${catTag}"`);
      }
      
      // Filtro por búsqueda
      const q = this.searchBox?.trim();
      if (q) {
        if (q.startsWith('@')) {
          // Búsqueda por usuario
          const username = q.slice(1);
          filters.push(`id_usuario.username ~ "${username}"`);
        } else if (q.startsWith('#')) {
          // Búsqueda por hashtag
          filters.push(`Comentario ~ "${q}"`);
        } else {
          // Búsqueda por texto de la publicación
          filters.push(`Comentario ~ "${q}"`);
        }
      }
      
      return filters.length ? filters.join(' && ') : '';
    },
    async loadPosts() {
      if (this.loading) return;
      this.loading = true;
      this.exploreError = '';
      
      try {
        const filter = this.buildFilter();
        const res = await listarPublicaciones({
          page: this.page,
          perPage: this.perPage,
          sort: this.orderFilter,
          filter
        });
        
        const items = res.items || res;
        this.posts = items;
        this.eof = items.length < this.perPage;
      } catch (err) {
        console.error(err);
        this.exploreError = 'Error al cargar publicaciones.';
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      this.page++;
      this.loadPosts();
    },
    updateSearch() {
      this.page = 1;
      this.eof = false;
      this.loadPosts();
    },
    clearFilters() {
      this.searchBox = '';
      this.categoryFilter = '';
      this.orderFilter = '-created';
      this.page = 1;
      this.eof = false;
      this.loadPosts();
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
      return `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    getAvatarUrl(p) {
      const autor = p.expand?.id_usuario;
      
      // Buscar avatar específico del usuario en localStorage
      if (autor?.id) {
        const userAvatar = obtenerAvatarUsuario(autor.id);
        if (userAvatar) {
          return userAvatar;
        }
      }
      
      // Si no, usar la URL del servidor
      if (autor?.avatar) {
        return `${BASE}/api/files/_pb_users_auth_/${autor.id}/${autor.avatar}`;
      }
      return 'img/avatar.png';
    },
    getUsername(p) {
      const autor = p.expand?.id_usuario;
      return autor?.username || autor?.email || 'Usuario';
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    isAuthor(post) {
      const user = currentUser();
      return user && post.id_usuario === user.id;
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
      // Actualizar el post en la lista
      const index = this.posts.findIndex(p => p.id === updatedPost.id);
      if (index !== -1) {
        this.posts[index] = updatedPost;
        this.selectedPost = updatedPost;
      }
    },
    onPostDeleted(postId) {
      // Eliminar el post de la lista
      this.posts = this.posts.filter(p => p.id !== postId);
      this.selectedPost = null;
    }
  }
}
</script>

<style scoped>
.post-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.post-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-card__user {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.post-card__meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.post-card__actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.post-card__btn-edit {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.post-card__btn-edit:hover {
  opacity: 1;
}

.post-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.post-card__body {
  margin-bottom: 12px;
}

.post-card__body p {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__stats {
  padding: 10px 0;
  border-top: 1px solid #eee;
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
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
