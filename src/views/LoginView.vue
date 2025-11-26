<template>
  <section class="grid-3">
    <!-- LOGIN -->
    <form @submit.prevent="handleLogin" :class="['card', { shake: showShake }]" novalidate>
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
import { emit } from '../eventBus.js';

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
      currentUserEmail: 'Invitado',
      showShake: false
    }
  },
  mounted() {
    if (isLogged()) {
      this.$router.push('/feed');
    }
    
    const user = currentUser();
    this.currentUserEmail = isLogged() ? (user?.email || '—') : 'Invitado';
  },
  methods: {
    async handleLogin() {
      this.loginError = '';
      this.showShake = false;
      
      if (!this.loginForm.email.trim() || !this.loginForm.password.trim()) {
        this.loginError = 'Email y contraseña son requeridos';
        this.showShake = true;
        setTimeout(() => { this.showShake = false; }, 500);
        return;
      }
      
      try {
        await login(this.loginForm.email.trim(), this.loginForm.password);
        emit('login', currentUser());
        this.$router.push('/feed');
      } catch (e) {
        console.error('LOGIN ERROR', e);
        this.loginError = e.message || 'No se pudo iniciar sesión.';
        this.showShake = true;
        setTimeout(() => { this.showShake = false; }, 500);
      }
    },
    async handleRegister() {
      this.regError = '';
      this.regSuccess = false;
      
      // Validar campos vacíos
      if (!this.regForm.username.trim() || !this.regForm.email.trim() || 
          !this.regForm.password.trim() || !this.regForm.passwordConfirm.trim()) {
        this.regError = 'Todos los campos son requeridos';
        return;
      }
      
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

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>