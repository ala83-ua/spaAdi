export async function actualizarUsuarioActual({ avatarFile, username } = {}) {
  if (avatarFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const user = JSON.parse(localStorage.getItem('authUser') || '{}');
          if (!user.id) {
            reject(new Error('No hay usuario autenticado'));
            return;
          }
          
          const base64Data = e.target.result;
          localStorage.setItem(`userAvatar_${user.id}`, base64Data);
          
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
  
  return Promise.resolve({ id: 'mock-user-id', username });
}

export function obtenerAvatarUsuario(userId) {
  if (!userId) return null;
  return localStorage.getItem(`userAvatar_${userId}`) || null;
}

export async function obtenerUsuario(userId) {
  return Promise.resolve({ id: userId, username: 'mock-user' });
}

export async function listarUsuarios({ page = 1, perPage = 20, filter = '' } = {}) {
  return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
}