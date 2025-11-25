// Mock de auth store hasta que PocketBase esté configurado
let authStore = {
  token: null,
  model: null
};

export async function login(email, password) {
  // TODO: Integrar con PocketBase
  // Por ahora, mock que simula login exitoso
  authStore.token = `token_${Date.now()}`;
  authStore.model = {
    id: 'user_' + Date.now(),
    email: email,
    username: email.split('@')[0],
    avatar: null
  };
  localStorage.setItem('authToken', authStore.token);
  localStorage.setItem('authUser', JSON.stringify(authStore.model));
  return authStore.model;
}

export async function register({ email, password, passwordConfirm, username }) {
  // TODO: Integrar con PocketBase
  // Por ahora, mock que simula registro exitoso
  if (password !== passwordConfirm) {
    throw new Error('Las contraseñas no coinciden');
  }
  // Simular registro
  return { id: 'user_' + Date.now(), email, username, avatar: null };
}

export function logout() {
  authStore.token = null;
  authStore.model = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

export function currentUser() {
  if (!authStore.model && typeof window !== 'undefined') {
    const saved = localStorage.getItem('authUser');
    if (saved) {
      authStore.model = JSON.parse(saved);
    }
  }
  return authStore.model;
}

export function isLogged() {
  if (!authStore.token && typeof window !== 'undefined') {
    authStore.token = localStorage.getItem('authToken');
  }
  return !!authStore.token;
}
 