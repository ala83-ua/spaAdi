// import { pb } from './pb'; // TODO: Implementar conexión a base de datos
const COL = 'publicaciones';

export async function crearPublicacion({ contenido, archivos = [], ubicacion = '' }) {
  // TODO: Implementar con pb cuando esté disponible
  console.log('Creating publication:', { contenido, ubicacion, archivos });
  return Promise.resolve({ id: 'mock-id', contenido, ubicacion });
}

export async function listarPublicaciones({ page=1, perPage=10, sort='-created' } = {}) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
}

export async function eliminarPublicacion(id) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ success: true });
}