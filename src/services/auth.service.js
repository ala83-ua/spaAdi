let authStore = {
  token: null,
  model: null
};

function getRegisteredUsers() {
  const users = localStorage.getItem('registeredUsers');
  return users ? JSON.parse(users) : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
}

function findUserByEmail(email) {
  const users = getRegisteredUsers();
  return users.find(u => u.email === email);
}

export async function login(email, password) {
  if (!email || !email.trim()) {
    throw new Error('El email es requerido');
  }
  if (!password || !password.trim()) {
    throw new Error('La contraseña es requerida');
  }
  
  const user = findUserByEmail(email.trim());
  if (!user) {
    throw new Error('El usuario no existe. Registrate primero.');
  }
  
  if (user.password !== password) {
    throw new Error('Contraseña incorrecta.');
  }
  
  authStore.token = `token_${Date.now()}`;
  authStore.model = {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: null
  };
  localStorage.setItem('authToken', authStore.token);
  localStorage.setItem('authUser', JSON.stringify(authStore.model));
  return authStore.model;
}

export async function register({ email, password, passwordConfirm, username }) {
  if (!email || !email.trim()) {
    throw new Error('El email es requerido');
  }
  if (!password || !password.trim()) {
    throw new Error('La contraseña es requerida');
  }
  if (!username || !username.trim()) {
    throw new Error('El nombre de usuario es requerido');
  }
  if (password !== passwordConfirm) {
    throw new Error('Las contraseñas no coinciden');
  }
  
  const existingUser = findUserByEmail(email.trim());
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }
  
  const newUser = {
    id: 'user_' + Date.now(),
    email: email.trim(),
    username: username.trim(),
    password: password,
    avatar: null
  };
  
  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);
  
  return { id: newUser.id, email: newUser.email, username: newUser.username, avatar: null };
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
 