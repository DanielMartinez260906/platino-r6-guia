// js/storage.js
// Gestor de persistencia en LocalStorage y cliente de sincronización con servidor/Google Sheets DB

const STORAGE_KEYS = {
  USERS: "r6s_platinum_users_v3",
  ACTIVE_USER: "r6s_platinum_active_user_v3"
};

class StorageManager {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify({}));
    }
  }

  getEmptyProgress() {
    const operatorRounds = {};
    if (typeof ALL_OPERATORS !== "undefined") {
      ALL_OPERATORS.forEach(op => {
        operatorRounds[op.id] = 0;
      });
    }

    const trophies = {};
    if (typeof TROPHIES_DATA !== "undefined") {
      TROPHIES_DATA.forEach(t => {
        trophies[t.id] = false;
      });
    }

    return {
      operatorRounds,
      trophies,
      platformFilter: "AMBOS",
      lastUpdated: new Date().toISOString()
    };
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return "h_" + Math.abs(hash).toString(16);
  }

  getUsersMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveUsersMap(map) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(map));
  }

  getActiveUsername() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || null;
  }

  getActiveUser() {
    const usernameKey = this.getActiveUsername();
    if (!usernameKey) return null;
    const map = this.getUsersMap();
    return map[usernameKey.toLowerCase()] || null;
  }

  async registerUser(username, password) {
    const cleanUser = (username || '').trim();
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const key = cleanUser.toLowerCase();
    const map = this.getUsersMap();

    if (map[key]) {
      return { success: false, message: 'El nombre de usuario ya está registrado.' };
    }

    const newUser = {
      username: cleanUser,
      passwordHash: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      progress: this.getEmptyProgress()
    };

    map[key] = newUser;
    this.saveUsersMap(map);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, key);

    // Intentar sincronizar registro en servidor backend / Google Sheets DB
    if (typeof apiClient !== "undefined") {
      apiClient.register(cleanUser, password, newUser.passwordHash);
    }

    return { success: true, user: newUser };
  }

  async loginUser(username, password) {
    const cleanUser = (username || '').trim();
    const key = cleanUser.toLowerCase();
    const map = this.getUsersMap();

    if (!map[key]) {
      return { success: false, message: 'El usuario no existe.' };
    }

    const inputHash = this.hashPassword(password);
    if (map[key].passwordHash !== inputHash) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, key);

    // Intentar sincronizar login en servidor backend
    if (typeof apiClient !== "undefined") {
      apiClient.login(cleanUser, password, inputHash);
    }


    return { success: true, user: map[key] };
  }

  logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  }

  updateOperatorRounds(opId, rounds) {
    const user = this.getActiveUser();
    if (!user) return;

    const val = Math.max(0, parseInt(rounds, 10) || 0);
    user.progress.operatorRounds[opId] = val;

    // Calcular trofeo "Plantilla Completa"
    const all10 = ALL_OPERATORS.every(op => (user.progress.operatorRounds[op.id] || 0) >= 10);
    user.progress.trophies["trophy_full_roster"] = all10;

    // Calcular trofeos de UATs
    UATS_DATA.forEach(uat => {
      const uatAll10 = uat.operators.every(op => (user.progress.operatorRounds[op.id] || 0) >= 10);
      user.progress.trophies[uat.trophyId] = uatAll10;
    });

    user.progress.lastUpdated = new Date().toISOString();
    this.saveActiveUserProgress(user);
  }

  toggleTrophy(trophyId) {
    const user = this.getActiveUser();
    if (!user) return;

    const current = !!user.progress.trophies[trophyId];
    user.progress.trophies[trophyId] = !current;
    user.progress.lastUpdated = new Date().toISOString();
    this.saveActiveUserProgress(user);
  }

  importFullProgress(opRounds, trophies) {
    const user = this.getActiveUser();
    if (!user) return;

    if (opRounds && typeof opRounds === "object") {
      user.progress.operatorRounds = { ...user.progress.operatorRounds, ...opRounds };
    }
    if (trophies && typeof trophies === "object") {
      user.progress.trophies = { ...user.progress.trophies, ...trophies };
    }

    user.progress.lastUpdated = new Date().toISOString();
    this.saveActiveUserProgress(user);
  }

  saveActiveUserProgress(user) {
    const map = this.getUsersMap();
    const key = user.username.toLowerCase();
    map[key] = user;
    this.saveUsersMap(map);

    if (typeof apiClient !== "undefined") {
      apiClient.saveProgress(user.username, user.progress.operatorRounds, user.progress.trophies);
    }
  }
}

const storage = new StorageManager();
