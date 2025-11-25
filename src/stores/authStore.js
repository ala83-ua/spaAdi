import { defineStore } from 'pinia'

// Store de autenticación básica
export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null,
		token: null,
		error: null,
	}),
	actions: {
		async login(email, password) {
			// Simulación de login: acepta cualquier email con '@' y password >= 4
			if (email.includes('@') && password.length >= 4) {
				this.user = { email }
				this.token = 'mock-token'
				this.error = null
			} else {
				this.error = 'Credenciales inválidas'
				throw new Error(this.error)
			}
		},
		logout() {
			this.user = null
			this.token = null
			this.error = null
		}
	}
})
