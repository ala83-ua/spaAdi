<template>
  <div v-if="post" class="post-detail">
    <!-- Encabezado -->
    <div class="post-detail-header">
      <img :src="getAvatarUrl(post)" alt="Avatar" class="avatar">
      <div class="user-info">
        <h3>{{ getUsername(post) }}</h3>
        <p class="date">{{ formatDate(post.created) }}</p>
      </div>
      <div v-if="isAuthor" class="actions">
        <button @click="editPost" class="btn-edit" title="Editar">✏️</button>
        <button @click="deletePost" class="btn-delete" title="Eliminar">🗑️</button>
      </div>
    </div>

    <!-- Imágenes -->
    <div v-if="getImages(post).length > 0" class="images-section">
      <img 
        v-for="filename in getImages(post)" 
        :key="filename" 
        :src="getImageUrl(post, filename)"
        alt="Publicación"
        class="post-image"
      >
    </div>

    <!-- Texto -->
    <div v-if="!editingText" class="text-section">
      <p class="post-text">{{ getTexto(post) }}</p>
    </div>

    <!-- Editor de texto (si es autor) -->
    <div v-if="editingText && isAuthor" class="edit-section">
      <textarea 
        v-model="editedText" 
        class="edit-textarea"
        placeholder="Edita el texto de tu publicación..."
      />
      <div class="edit-buttons">
        <button @click="saveEdit" class="btn-save">Guardar</button>
        <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-section">
      <span class="stat">👍 {{ post.likes || 0 }} likes</span>
      <span class="stat">💬 {{ post.commentCount || post.comentarios?.length || 0 }} comentarios</span>
    </div>

    <!-- Botones de interacción -->
    <div class="interaction-buttons">
      <button 
        @click="toggleLike" 
        :class="{ liked: userLiked }"
        class="btn-like"
      >
        {{ userLiked ? '❤️' : '🤍' }} Like
      </button>
      <button @click="focusCommentBox" class="btn-comment">💬 Comentar</button>
    </div>

    <!-- Sección de comentarios -->
    <div class="comments-section">
      <div v-if="post.comentarios && post.comentarios.length > 0" class="comments-list">
        <div 
          v-for="comment in post.comentarios" 
          :key="comment.id"
          class="comment"
        >
          <div class="comment-header">
            <strong>{{ comment.autorUsername }}</strong>
            <span class="comment-date">{{ formatDate(comment.created) }}</span>
          </div>
          <p class="comment-text">{{ comment.texto }}</p>
          <button 
            v-if="currentUser()?.id === comment.autor"
            @click="deleteComment(comment.id)"
            class="btn-delete-comment"
            title="Eliminar comentario"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Caja para nuevo comentario -->
      <div v-if="isLogged()" class="new-comment">
        <textarea 
          ref="commentBox"
          v-model="newComment"
          class="comment-input"
          placeholder="Escribe un comentario..."
        />
        <button @click="addComment" class="btn-add-comment" :disabled="!newComment.trim()">
          Comentar
        </button>
      </div>

      <p v-else class="login-msg">
        <a href="/login">Inicia sesión</a> para comentar
      </p>
    </div>

    <!-- Mensajes de error -->
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script>
import { currentUser, isLogged } from '../services/auth.service.js';
import { 
  editarPublicacion, 
  agregarLike,
  removerLike,
  agregarComentario,
  eliminarComentario,
  eliminarPublicacion
} from '../services/publicaciones.service.js';
import { obtenerAvatarUsuario } from '../services/users.service.js';

const BASE = 'http://127.0.0.1:8090';

/**
 * PostDetail.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Componente modal que muestra los detalles completos de una publicación.
 * Permite ver comentarios, dar/quitar likes, editar el texto (solo si eres el autor),
 * agregar comentarios, y eliminar la publicación. Incluye edición en tiempo real del texto.
 * 
 * EVENTOS GENERADOS:
 * - 'close': Se emite cuando el usuario cierra el modal
 * - 'post-updated': Se emite cuando se actualiza la publicación (edición, like, comentario)
 * - 'post-deleted': Se emite cuando se elimina la publicación
 * 
 * PROPS:
 * - post: Object (required)
 *   Descripción: Objeto de la publicación a mostrar
 * 
 * VARIABLES DE ESTADO (data):
 * - editingText: boolean - Indica si está en modo edición del texto
 * - editedText: string - Texto siendo editado
 * - newComment: string - Texto del nuevo comentario siendo escrito
 * - errorMsg: string - Mensaje de error
 * - userLiked: boolean - Indica si el usuario actual ha dado like a esta publicación
 * 
 * MÉTODOS:
 * - currentUser(): Object - Retorna el usuario autenticado actual
 * 
 * - isLogged(): boolean - Retorna si hay un usuario autenticado
 * 
 * - updateUserLikedStatus(): void
 *   Descripción: Actualiza el estado si el usuario actual ha dado like
 * 
 * - getTexto(p: Object): string
 *   Descripción: Extrae el texto de la publicación (busca en múltiples campos posibles)
 *   Parámetros: p - objeto publicación
 * 
 * - getImages(p: Object): string[]
 *   Descripción: Extrae la lista de nombres de imágenes de la publicación
 *   Parámetros: p - objeto publicación
 * 
 * - getImageUrl(item: Object, filename: string): string
 *   Descripción: Construye la URL para acceder a una imagen específica
 *   Parámetros: item - objeto publicación, filename - nombre del archivo
 * 
 * - getAvatarUrl(p: Object): string
 *   Descripción: Obtiene la URL del avatar del autor de la publicación
 *   Parámetros: p - objeto publicación
 * 
 * - getUsername(p: Object): string
 *   Descripción: Extrae el nombre de usuario del autor
 *   Parámetros: p - objeto publicación
 * 
 * - formatDate(date: string): string
 *   Descripción: Formatea una fecha ISO a formato legible local
 *   Parámetros: date - string de fecha ISO
 * 
 * - editPost(): void
 *   Descripción: Activa el modo edición del texto
 * 
 * - cancelEdit(): void
 *   Descripción: Cancela la edición sin guardar cambios
 * 
 * - saveEdit(): Promise<void>
 *   Descripción: Guarda los cambios al texto de la publicación
 * 
 * - toggleLike(): Promise<void>
 *   Descripción: Agrega o quita un like a la publicación
 * 
 * - focusCommentBox(): void
 *   Descripción: Enfoca el textarea de comentarios
 * 
 * - addComment(): Promise<void>
 *   Descripción: Agrega un nuevo comentario a la publicación
 * 
 * - deleteComment(commentId: string): Promise<void>
 *   Descripción: Elimina un comentario específico
 *   Parámetros: commentId - id del comentario a eliminar
 * 
 * - deletePost(): Promise<void>
 *   Descripción: Elimina la publicación completa
 */
export default {
  name: 'PostDetail',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'post-updated', 'post-deleted'],
  data() {
    return {
      editingText: false,
      editedText: '',
      newComment: '',
      errorMsg: '',
      userLiked: false
    };
  },
  computed: {
    isAuthor() {
      const user = currentUser();
      return user && this.post.id_usuario === user.id;
    }
  },
  watch: {
    post: {
      handler() {
        this.updateUserLikedStatus();
      },
      deep: true
    }
  },
  mounted() {
    this.updateUserLikedStatus();
  },
  methods: {
    currentUser,
    isLogged,
    updateUserLikedStatus() {
      const user = currentUser();
      if (user && this.post.likedBy) {
        this.userLiked = this.post.likedBy.includes(user.id);
      } else {
        this.userLiked = false;
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
      if (item.imagenData) {
        const img = item.imagenData.find(i => i.nombre === filename);
        if (img) return img.data;
      }
      return `${BASE}/api/files/${item.collectionId}/${item.id}/${filename}`;
    },
    getAvatarUrl(p) {
      const autor = p.expand?.id_usuario;
      
      if (autor?.id) {
        const userAvatar = obtenerAvatarUsuario(autor.id);
        if (userAvatar) {
          return userAvatar;
        }
      }
      
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
    editPost() {
      this.editingText = true;
      this.editedText = this.getTexto(this.post);
    },
    cancelEdit() {
      this.editingText = false;
      this.editedText = '';
    },
    async saveEdit() {
      if (!this.editedText.trim()) {
        this.errorMsg = 'El texto no puede estar vacío';
        return;
      }
      
      try {
        const updated = await editarPublicacion(this.post.id, { comentario: this.editedText });
        this.$emit('post-updated', updated);
        this.editingText = false;
        this.errorMsg = '';
      } catch (err) {
        this.errorMsg = err.message;
      }
    },
    async toggleLike() {
      try {
        if (this.userLiked) {
          await removerLike(this.post.id);
        } else {
          await agregarLike(this.post.id);
        }
        this.userLiked = !this.userLiked;
        this.$emit('post-updated', this.post);
      } catch (err) {
        this.errorMsg = err.message;
      }
    },
    focusCommentBox() {
      this.$refs.commentBox?.focus();
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      
      try {
        const updated = await agregarComentario(this.post.id, { texto: this.newComment });
        this.$emit('post-updated', updated);
        this.newComment = '';
        this.errorMsg = '';
      } catch (err) {
        this.errorMsg = err.message;
      }
    },
    async deleteComment(commentId) {
      if (!confirm('¿Seguro que quieres eliminar este comentario?')) return;
      
      try {
        const updated = await eliminarComentario(this.post.id, commentId);
        this.$emit('post-updated', updated);
        this.errorMsg = '';
      } catch (err) {
        this.errorMsg = err.message;
      }
    },
    async deletePost() {
      if (!confirm('¿Seguro que quieres eliminar esta publicación?')) return;
      
      try {
        await eliminarPublicacion(this.post.id);
        this.$emit('post-deleted', this.post.id);
        this.$emit('close');
      } catch (err) {
        this.errorMsg = err.message;
      }
    }
  }
};
</script>

<style scoped>
.post-detail {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.user-info .date {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-edit:hover, .btn-delete:hover {
  opacity: 1;
}

.images-section {
  margin-bottom: 20px;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.text-section {
  margin-bottom: 20px;
}

.post-text {
  margin: 0;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

.edit-section {
  margin-bottom: 20px;
}

.edit-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.edit-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-save, .btn-cancel {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover {
  background: #5568d3;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.stats-section {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.stat {
  cursor: default;
}

.interaction-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-like, .btn-comment {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-like:hover, .btn-comment:hover {
  background: #f0f0f0;
}

.btn-like.liked {
  background: #ffe0e6;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.comments-section {
  margin-top: 20px;
}

.comments-list {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.comment {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  position: relative;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.comment-header strong {
  color: #333;
}

.comment-date {
  color: #999;
  font-size: 12px;
}

.comment-text {
  margin: 0;
  color: #555;
  word-wrap: break-word;
}

.btn-delete-comment {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-delete-comment:hover {
  opacity: 1;
  color: #ff6b6b;
}

.new-comment {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.btn-add-comment {
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add-comment:hover:not(:disabled) {
  background: #5568d3;
}

.btn-add-comment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-msg {
  text-align: center;
  color: #999;
  font-size: 14px;
}

.login-msg a {
  color: #667eea;
  text-decoration: none;
}

.login-msg a:hover {
  text-decoration: underline;
}

.error {
  color: #c00;
  padding: 10px;
  background: #fef0f0;
  border-radius: 4px;
  margin-top: 10px;
}
</style>
