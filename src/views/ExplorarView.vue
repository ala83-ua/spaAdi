<template>
  <section class="toolbar">
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

  <section class="grid-3" id="grid">
    <article v-for="post in posts" :key="post.id" class="post-card">
      <header class="post-card__header">
        <img class="post-card__avatar" :src="getAvatarUrl(post)" alt="Avatar">
        <div>
          <div class="post-card__user">{{ getUsername(post) }}</div>
          <div class="post-card__meta">{{ formatDate(post.created) }}</div>
        </div>
      </header>
      <img v-for="filename in getImages(post)" :key="filename" class="post-card__image" :src="getImageUrl(post, filename)" alt="">
      <div class="post-card__body">
        <p>{{ getTexto(post) }}</p>
      </div>
    </article>
  </section>

  <div class="mt-3" style="display:flex;justify-content:center">
    <button v-if="!eof" @click="loadMore" class="button--ghost">Cargar más</button>
  </div>

  <p v-if="exploreError" class="muted" style="color:#c00">{{ exploreError }}</p>
</template>

<script>
import { listarPublicaciones } from '../services/publicaciones.service.js';
import { isLogged, logout } from '../services/auth.service.js';

const BASE = 'http://127.0.0.1:8090';

export default {
  name: 'ExplorarView',
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
      eof: false
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
    extractHashtags(text) {
      if (!text) return [];
      const tags = text.match(/#\w+/g);
      return tags ? tags.map(t => t.toLowerCase()) : [];
    },
    buildFilter() {
      const filters = [];
      
      const catTag = this.categoryFilter?.trim();
      if (catTag) {
        filters.push(`Comentario ~ "${catTag}"`);
      }
      
      const q = this.searchBox?.trim();
      if (q) {
        if (q.startsWith('@')) {
          filters.push(`id_usuario.username ~ "${q.slice(1)}"`);
        } else if (q.startsWith('#')) {
          filters.push(`Comentario ~ "${q}"`);
        } else {
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
      return `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    getAvatarUrl(p) {
      const autor = p.expand?.id_usuario;
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
    }
  }
}
</script>
