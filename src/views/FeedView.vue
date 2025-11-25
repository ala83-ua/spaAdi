<script setup>
import { ref, onMounted } from 'vue'
import { listarPublicaciones } from '../services/publicaciones.service.js'

// Estado reactivo
const publicaciones = ref([])
const cargando = ref(true)
const error = ref('')

// La URL base que usabas en feed.html
const BASE = 'http://127.0.0.1:8090'

// Helpers que ya tenías en feed.html (adaptados aquí)
const fileUrl = (item, filename) =>
  `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`

const userAvatarUrl = (u) =>
  `${BASE}/api/files/_pb_users_auth_/${u.id}/${u.avatar}`

// Tolerar distintos nombres de campos (igual que en tu HTML)
const getTexto = (p) =>
  p.Comentario ?? p.comentario ?? p.texto ?? p.content ?? ''

const getArchivos = (p) =>
  p.Imagen ?? p.imagen ?? p.archivos ?? p.files ?? []

const getUsuario = (p) =>
  p.expand?.id_usuario ?? p.usuario ?? p.user ?? null

// Cargar publicaciones al montar el componente
onMounted(async () => {
  try {
    cargando.value = true
    error.value = ''

    const res = await listarPublicaciones({ page: 1, perPage: 10 })
    // res.items contiene la lista (así es como PocketBase devuelve getList)
    publicaciones.value = res.items ?? []
  } catch (e) {
    console.error('ERROR FEED', e)
    error.value = 'No se pudo cargar el feed.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="grid-3">
    <div class="card" style="grid-column: span 2;">
      <h1>Inicio</h1>

      <p v-if="cargando" class="muted">
        Cargando publicaciones...
      </p>

      <p v-if="error" style="color:#c00;">
        {{ error }}
      </p>

      <ul v-if="!cargando && !error" class="feed-list">
        <li
          v-for="pub in publicaciones"
          :key="pub.id"
          class="feed-item"
        >
          <article>
            <!-- cabecera con avatar + email/usuario -->
            <header class="feed-item__header">
              <img
                v-if="getUsuario(pub)?.avatar"
                :src="userAvatarUrl(getUsuario(pub))"
                alt="avatar"
                class="avatar"
              >
              <div>
                <strong>{{ getUsuario(pub)?.username || getUsuario(pub)?.email }}</strong>
                <div class="muted">
                  {{ new Date(pub.created).toLocaleString() }}
                </div>
              </div>
            </header>

            <!-- texto de la publicación -->
            <p class="mt-1">
              {{ getTexto(pub) }}
            </p>

            <!-- imágenes -->
            <div v-if="getArchivos(pub).length" class="mt-1">
              <img
                v-for="img in getArchivos(pub)"
                :key="img"
                :src="fileUrl(pub, img)"
                alt="imagen publicación"
                style="max-width: 100%; border-radius: 8px; margin-top: 8px;"
              >
            </div>
          </article>
        </li>
      </ul>
    </div>

    <div class="card">
      <h2>Info</h2>
      <p class="muted">Aquí podrás añadir cosas extra del feed.</p>
    </div>
  </section>
</template>

<style scoped>
.feed-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.feed-item {
  border-bottom: 1px solid #ddd;
  padding: 12px 0;
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
}
</style>
