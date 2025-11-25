// import { pb } from './pb'; // TODO: Implementar conexión a base de datos
const COL = 'publicaciones';

export async function crearPublicacion({ comentario, archivos = [], ubicacion = '' }) {
  // TODO: Implementar con pb cuando esté disponible
  console.log('Creating publication:', { comentario, ubicacion, archivos });
  return Promise.resolve({ id: 'mock-id', comentario, ubicacion });
}

export async function listarPublicaciones({
  page = 1, perPage = 10, sort = '-created', filter = '', expand = 'id_usuario'
} = {}) {
  // TODO: Implementar con pb cuando esté disponible
  console.log('Listing publications:', { page, perPage, sort, filter });
  return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
}

export async function obtenerPublicacion(id) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ id, comentario: '' });
}

export async function eliminarPublicacion(id) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ success: true });
}

// (Opcional) eliminar una imagen concreta del array "Imagen"
export async function eliminarImagenDePublicacion(idPublicacion, nombreArchivoAEliminar) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ success: true });
}