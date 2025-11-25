<template>
  <section class="grid-3">
    <!-- LOGIN -->
    <form @submit.prevent="handleLogin" class="card" novalidate>
      <h1 class="mt-0">Entrar</h1>
      <label class="mt-2">Email
        <input v-model="loginForm.email" class="input" type="email" placeholder="tu@email" required>
      </label>
      <label>Contraseña
        <input v-model="loginForm.password" class="input" type="password" placeholder="••••••••" required>
      </label>
      <button type="submit" class="button mt-2">Acceder</button>
      <p class="muted mt-1">Sesión: <span>{{ currentUserEmail }}</span></p>
      <p v-if="loginError" style="color:#c00">{{ loginError }}</p>
    </form>

    <!-- REGISTRO -->
    <form @submit.prevent="handleRegister" class="card" novalidate>
      <h2>Crear cuenta</h2>
      <label class="mt-2">Usuario
        <input v-model="regForm.username" class="input" type="text" placeholder="@usuario" required>
      </label>
      <label>Email
        <input v-model="regForm.email" class="input" type="email" placeholder="tu@email" required>
      </label>
      <label>Contraseña
        <input v-model="regForm.password" class="input" type="password" placeholder="••••••••" required>
      </label>
      <label>Repite contraseña
        <input v-model="regForm.passwordConfirm" class="input" type="password" placeholder="••••••••" required>
      </label>
      <button type="submit" class="button mt-2">Registrarme</button>
      <p v-if="regError" style="color:#c00">{{ regError }}</p>
      <p v-if="regSuccess" style="color:#090">✓ Usuario creado. Ahora inicia sesión.</p>
    </form>

    <div class="card">
      <h2>Info</h2>
      <p class="muted">Bienvenido a INST·ALACANT, una red social para compartir momentos con amigos.</p>
    </div>
  </section>
</template>

<script>
import { login, register, currentUser, isLogged } from '../services/auth.service.js';

export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      regForm: {
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
      },
      loginError: '',
      regError: '',
      regSuccess: false,
      currentUserEmail: 'Invitado'
    }
  },
  mounted() {
    // Si ya está logueado, redirigir al feed
    if (isLogged()) {
      this.$router.push('/feed');
    }
    
    const user = currentUser();
    this.currentUserEmail = isLogged() ? (user?.email || '—') : 'Invitado';
  },
  methods: {
    async handleLogin() {
      this.loginError = '';
      try {
        await login(this.loginForm.email.trim(), this.loginForm.password);
        this.$router.push('/feed');
      } catch (e) {
        console.error('LOGIN ERROR', e);
        this.loginError = e.message || 'No se pudo iniciar sesión.';
      }
    },
    async handleRegister() {
      this.regError = '';
      this.regSuccess = false;
      try {
        if (this.regForm.password !== this.regForm.passwordConfirm) {
          this.regError = 'Las contraseñas no coinciden.';
          return;
        }
        
        await register({
          email: this.regForm.email.trim(),
          password: this.regForm.password,
          passwordConfirm: this.regForm.passwordConfirm,
          username: this.regForm.username.trim()
        });
        
        this.regSuccess = true;
        // Limpiar formulario
        this.regForm = { username: '', email: '', password: '', passwordConfirm: '' };
      } catch (e) {
        console.error('REGISTER ERROR', e);
        this.regError = e.message || 'No se pudo registrar.';
      }
    }
  }
}
</script>
