// import { pb } from './pb'; // TODO: Implementar conexión a base de datos

/**
 * Actualiza el usuario actualmente autenticado
 * @param {Object} options - Opciones de actualización
 * @param {File} [options.avatarFile] - Archivo de imagen para el avatar
 * @param {string} [options.username] - Nuevo nombre de usuario
 * @returns {Promise} Promesa con el usuario actualizado
 */
export async function actualizarUsuarioActual({ avatarFile, username } = {}) {
  // Mock: guardar el archivo en localStorage como base64
  if (avatarFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Guardar avatar en localStorage
          const base64Data = e.target.result;
          localStorage.setItem('userAvatar', base64Data);
          
          // Actualizar usuario
          const user = JSON.parse(localStorage.getItem('authUser') || '{}');
          user.avatar = avatarFile.name;
          localStorage.setItem('authUser', JSON.stringify(user));
          
          resolve({ id: user.id, username: user.username, avatar: avatarFile.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(avatarFile);
    });
  }
  
  // TODO: Implementar con pb cuando esté disponible
  console.log('Updating user:', { avatarFile, username });
  return Promise.resolve({ id: 'mock-user-id', username });
}

/**
 * Obtiene la información de un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise} Promesa con los datos del usuario
 */
export async function obtenerUsuario(userId) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ id: userId, username: 'mock-user' });
}

/**
 * Lista usuarios (si las reglas lo permiten)
 * @param {Object} options - Opciones de listado
 * @returns {Promise} Promesa con la lista de usuarios
 */
export async function listarUsuarios({ page = 1, perPage = 20, filter = '' } = {}) {
  // TODO: Implementar con pb cuando esté disponible
  return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
}