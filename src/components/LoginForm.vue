<template>
  <div class="login-form">
    <div class="form-container">
      <h1>Bienvenido</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Contraseña"
            required
          />
        </div>

        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
/**
 * LoginForm.vue
 * 
 * DESCRIPCIÓN GENERAL:
 * Componente de formulario de login que permite a los usuarios iniciar sesión.
 * Valida los campos de email y contraseña y emite un evento 'login' con los datos.
 * 
 * EVENTOS GENERADOS:
 * - 'login': Se emite cuando el usuario envía el formulario válido
 *   Campos: { email: string, password: string }
 * 
 * VARIABLES DE ESTADO (data):
 * - form: { email: '', password: '' } - Objeto que almacena los valores del formulario
 *   * email: string - Email ingresado por el usuario
 *   * password: string - Contraseña ingresada por el usuario
 * - error: vacio | string - Mensaje de error de validación (sale nulo si no hay error)
 * 
 * MÉTODOS:
 * - handleSubmit(): void
 *   Descripción: Valida y envía el formulario
 *   Parámetros: ninguno
 *   Efectos: Limpia errores previos, valida campos, emite evento 'login' si es válido,
 *            limpia el formulario después del envío
 */
export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: null
    }
  },
  methods: {
    handleSubmit() {
      this.error = null;
      
      if (!this.form.email || !this.form.password) {
        this.error = 'Por favor completa todos los campos';
        return;
      }

      this.$emit('login', {
        email: this.form.email,
        password: this.form.password
      });

      this.form = { email: '', password: '' };
    }
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  padding: 20px;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  color: #111;
  background-color: #fff;
}

input::placeholder {
  color: #999;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 15px;
  padding: 10px;
  background: #fadbd8;
  border-left: 4px solid #e74c3c;
  border-radius: 4px;
}
</style>
