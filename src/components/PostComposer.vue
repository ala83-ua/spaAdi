<template>
  <section class="card">
    <h2 class="mt-0">{{ title }}</h2>
    <div class="toolbar mt-2">
      <input v-model="composeInput" class="input" type="text" :placeholder="placeholder" />
      <input ref="fileInput" @change="handleFileSelect" type="file" accept="image/*" multiple style="display:none">
      <button @click="$refs.fileInput.click()" class="button--ghost">Añadir fotos</button>
      <button @click="publishPost" class="button" :disabled="isPublishing">{{ isPublishing ? 'Publicando...' : 'Publicar' }}</button>
    </div>
    <div class="mt-2" v-if="previewFiles.length > 0" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <div v-for="(f, i) in previewFiles" :key="i" class="preview-item">
        <img :src="f" alt="Preview" class="preview-image" />
        <button @click="removePreview(i)" class="preview-remove">✕</button>
      </div>
    </div>
    <p v-if="error" style="color:#c00;margin:8px 0">{{ error }}</p>
    <p v-if="success" style="color:#28a745;margin:8px 0">{{ success }}</p>
  </section>
</template>

<script>
import { isLogged, currentUser } from '../services/auth.service.js';
import { crearPublicacion } from '../services/publicaciones.service.js';

export default {
  name: 'PostComposer',
  props: {
    title: {
      type: String,
      default: 'Crear publicación'
    },
    placeholder: {
      type: String,
      default: '¿Qué estás pensando?'
    }
  },
  emits: ['post-created'],
  data() {
    return {
      composeInput: '',
      selectedFiles: [],
      previewFiles: [],
      error: '',
      success: '',
      isPublishing: false
    }
  },
  mounted() {
    if (!isLogged()) {
      this.error = 'Debes iniciar sesión para publicar';
    }
  },
  methods: {
    handleFileSelect(e) {
      this.selectedFiles = Array.from(e.target.files || []);
      this.previewFiles = this.selectedFiles.map(f => URL.createObjectURL(f));
      this.error = '';
      this.success = '';
    },
    removePreview(index) {
      this.selectedFiles.splice(index, 1);
      this.previewFiles.splice(index, 1);
    },
    async publishPost() {
      if (!isLogged()) {
        this.error = 'Debes iniciar sesión para publicar';
        return;
      }
      
      const comentario = this.composeInput.trim();
      if (!comentario && !this.selectedFiles.length) {
        this.error = 'Escribe algo o añade fotos';
        return;
      }
      
      this.isPublishing = true;
      this.error = '';
      this.success = '';
      
      try {
        await crearPublicacion({ comentario, archivos: this.selectedFiles });
        
        this.composeInput = '';
        this.selectedFiles = [];
        this.previewFiles = [];
        this.$refs.fileInput.value = '';
        
        this.success = '✓ Publicación creada correctamente';
        this.$emit('post-created');
        
        setTimeout(() => {
          this.success = '';
        }, 3000);
      } catch (err) {
        console.error('Publish error:', err);
        this.error = err.message || 'No se pudo publicar';
      } finally {
        this.isPublishing = false;
      }
    }
  }
}
</script>

<style scoped>
.preview-item {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  display: block;
}

.preview-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #c00;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
}

.preview-remove:hover {
  background: #a00;
}
</style>
