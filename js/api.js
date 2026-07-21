// js/api.js - Cliente de API HTTP para conectar Frontend y Backend Node.js

class ApiClient {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  async checkServerStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/api/status`);
      return await res.json();
    } catch (e) {
      return { status: 'offline', message: 'Servidor no disponible' };
    }
  }

  async register(username, password) {
    try {
      const res = await fetch(`${this.baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  }

  async login(username, password) {
    try {
      const res = await fetch(`${this.baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  }

  async saveProgress(username, operatorRounds, trophies) {
    try {
      const res = await fetch(`${this.baseUrl}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, operatorRounds, trophies })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Error al sincronizar con el servidor.' };
    }
  }
}

const apiClient = new ApiClient();
