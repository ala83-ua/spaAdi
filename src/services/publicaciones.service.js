// import { pb } from './pb'; // TODO: Implementar conexión a base de datos
import { currentUser } from './auth.service.js';

const COL = 'publicaciones';
const STORAGE_KEY = 'app_publicaciones';

// Obtener publicaciones almacenadas en localStorage
function getStoredPublications() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Guardar publicaciones en localStorage
function savePublications(publications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(publications));
}

export async function crearPublicacion({ comentario = '', archivos = [], ubicacion = '' }) {
  // Mock: guardar publicación con imágenes en localStorage
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    const publications = getStoredPublications();
    
    // Convertir archivos a base64
    const imagenes = [];
    for (const archivo of archivos) {
      const base64 = await fileToBase64(archivo);
      imagenes.push({
        nombre: archivo.name,
        data: base64
      });
    }

    const newPublication = {
      id: 'pub_' + Date.now(),
      Comentario: comentario,
      comentario: comentario,
      Imagen: imagenes.map(i => i.nombre),
      imagen: imagenes.map(i => i.nombre),
      imagenData: imagenes, // Guardar datos en base64
      ubicacion: ubicacion,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: {
        id_usuario: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      },
      id_usuario: user.id,
      collectionId: 'publicaciones'
    };

    publications.push(newPublication);
    savePublications(publications);

    console.log('Publication created:', newPublication);
    return newPublication;
  } catch (err) {
    console.error('Error creating publication:', err);
    throw err;
  }
}

// Convertir archivo a base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function listarPublicaciones({
  page = 1, perPage = 10, sort = '-created', filter = '', expand = 'id_usuario'
} = {}) {
  // Mock: obtener publicaciones de localStorage
  try {
    const publications = getStoredPublications();

    // Ordenar por fecha (más recientes primero)
    const sorted = publications.sort((a, b) => {
      return new Date(b.created) - new Date(a.created);
    });

    // Aplicar paginación
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = sorted.slice(start, end);

    return Promise.resolve({
      items: items,
      page: page,
      perPage: perPage,
      totalItems: publications.length,
      totalPages: Math.ceil(publications.length / perPage)
    });
  } catch (err) {
    console.error('Error listing publications:', err);
    return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
  }
}

export async function obtenerPublicacion(id) {
  // TODO: Implementar con pb cuando esté disponible
  const publications = getStoredPublications();
  const pub = publications.find(p => p.id === id);
  return Promise.resolve(pub || { id, comentario: '' });
}

export async function eliminarPublicacion(id) {
  // Mock: eliminar publicación de localStorage
  try {
    const publications = getStoredPublications();
    const filtered = publications.filter(p => p.id !== id);
    savePublications(filtered);
    return Promise.resolve({ success: true });
  } catch (err) {
    console.error('Error deleting publication:', err);
    throw err;
  }
}

// (Opcional) eliminar una imagen concreta del array "Imagen"
export async function eliminarImagenDePublicacion(idPublicacion, nombreArchivoAEliminar) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ success: true });
}