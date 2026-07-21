// public/js/storage.js
// Gestor de persistencia en LocalStorage y cliente de sincronización con servidor/Google Sheets DB

const STORAGE_KEYS = {
  USERS: "r6s_platinum_users_v2",
  ACTIVE_USER: "r6s_platinum_active_user_v2"
};

class StorageManager {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const defaultUser = {
        username: "OperadorInvitado",
        passwordHash: this.hashPassword("123456"),
        createdAt: new Date().toISOString(),
        progress: this.getEmptyProgress()
      };

      const usersMap = {};
      usersMap[defaultUser.username.toLowerCase()] = defaultUser;

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersMap));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, defaultUser.username.toLowerCase());
    }
  }

  getEmptyProgress() {
    const operatorRounds = {};
    ALL_OPERATORS.forEach(op => {
      operatorRounds[op.id] = 0;
    });

    const trophies = {};
    TROPHIES_DATA.forEach(t => {
      trophies[t.id] = false;
    });

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
    return hash.toString();
  }

  getUsersMap() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveUsersMap(usersMap) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersMap));
    } catch (e) {}
  }

  getActiveUsername() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || "";
  }

  setActiveUsername(username) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, username.toLowerCase());
  }

  getActiveUser() {
    const activeUsername = this.getActiveUsername();
    const usersMap = this.getUsersMap();
    if (activeUsername && usersMap[activeUsername]) {
      return usersMap[activeUsername];
    }
    return null;
  }

  async registerUser(username, password) {
    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: "El usuario debe tener al menos 3 caracteres." };
    }
    if (!password || password.length < 4) {
      return { success: false, message: "La contraseña debe tener al menos 4 caracteres." };
    }

    const key = cleanUser.toLowerCase();
    const passwordHash = this.hashPassword(password);
    const emptyProgress = this.getEmptyProgress();

    // Intentar registro en el Servidor Node.js / Google Sheets DB
    const apiRes = await apiClient.registerUser(cleanUser, passwordHash, emptyProgress.operatorRounds, emptyProgress.trophies);

    const newUser = {
      username: cleanUser,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      progress: emptyProgress
    };

    const usersMap = this.getUsersMap();
    usersMap[key] = newUser;
    this.saveUsersMap(usersMap);
    this.setActiveUsername(cleanUser);

    if (apiRes.success) {
      return { success: true, user: newUser, message: "¡Usuario registrado y sincronizado en Google Sheets!" };
    }

    return { success: true, user: newUser, message: "¡Usuario registrado localmente!" };
  }

  async loginUser(username, password) {
    const cleanUser = username.trim();
    const key = cleanUser.toLowerCase();
    const passwordHash = this.hashPassword(password);

    // Intentar login con Servidor Node.js / Google Sheets DB
    const apiRes = await apiClient.loginUser(cleanUser, passwordHash);

    if (apiRes.success && apiRes.user) {
      const usersMap = this.getUsersMap();
      usersMap[key] = {
        username: apiRes.user.username,
        passwordHash: passwordHash,
        progress: apiRes.user.progress || this.getEmptyProgress()
      };
      this.saveUsersMap(usersMap);
      this.setActiveUsername(cleanUser);
      return { success: true, user: usersMap[key], message: "¡Sesión iniciada desde Google Sheets DB!" };
    }

    // Fallback a almacenamiento local
    const usersMap = this.getUsersMap();
    if (!usersMap[key]) {
      return { success: false, message: "Usuario no encontrado." };
    }

    const user = usersMap[key];
    if (user.passwordHash !== passwordHash) {
      return { success: false, message: "Contraseña incorrecta." };
    }

    this.setActiveUsername(cleanUser);
    return { success: true, user, message: "¡Sesión iniciada con éxito!" };
  }

  logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  }

  updateOperatorRounds(opId, newCount) {
    const activeUser = this.getActiveUser();
    if (!activeUser) return;

    const count = Math.max(0, Math.min(100, parseInt(newCount) || 0));
    activeUser.progress.operatorRounds[opId] = count;
    activeUser.progress.lastUpdated = new Date().toISOString();

    this.checkUatTrophiesAuto(activeUser);

    const usersMap = this.getUsersMap();
    usersMap[activeUser.username.toLowerCase()] = activeUser;
    this.saveUsersMap(usersMap);

    // Sincronizar en segundo plano
    apiClient.syncProgress(activeUser.username, activeUser.progress.operatorRounds, activeUser.progress.trophies);
  }

  toggleTrophy(trophyId, forceStatus = null) {
    const activeUser = this.getActiveUser();
    if (!activeUser) return;

    const current = !!activeUser.progress.trophies[trophyId];
    const newStatus = forceStatus !== null ? !!forceStatus : !current;

    activeUser.progress.trophies[trophyId] = newStatus;
    activeUser.progress.lastUpdated = new Date().toISOString();

    const usersMap = this.getUsersMap();
    usersMap[activeUser.username.toLowerCase()] = activeUser;
    this.saveUsersMap(usersMap);

    // Sincronizar en segundo plano
    apiClient.syncProgress(activeUser.username, activeUser.progress.operatorRounds, activeUser.progress.trophies);
  }

  checkUatTrophiesAuto(user) {
    if (!user || !user.progress) return;
    const opRounds = user.progress.operatorRounds;

    UATS_DATA.forEach(uat => {
      const all10 = uat.operators.every(op => (opRounds[op.id] || 0) >= 10);
      if (all10 && uat.trophyId) {
        user.progress.trophies[uat.trophyId] = true;
      }
    });

    const all20Completed = ALL_OPERATORS.every(op => (opRounds[op.id] || 0) >= 10);
    if (all20Completed) {
      user.progress.trophies["trophy_full_roster"] = true;
    }

    const operatorsWithRounds = ALL_OPERATORS.filter(op => (opRounds[op.id] || 0) >= 1).length;
    if (operatorsWithRounds >= 10) {
      user.progress.trophies["trophy_jack_trades"] = true;
    }
  }

  importFullProgress(importedRounds, importedTrophies) {
    const activeUser = this.getActiveUser();
    if (!activeUser) return false;

    if (importedRounds && typeof importedRounds === "object") {
      Object.keys(importedRounds).forEach(opId => {
        if (activeUser.progress.operatorRounds.hasOwnProperty(opId)) {
          activeUser.progress.operatorRounds[opId] = parseInt(importedRounds[opId]) || 0;
        }
      });
    }

    if (importedTrophies && typeof importedTrophies === "object") {
      Object.keys(importedTrophies).forEach(tId => {
        if (activeUser.progress.trophies.hasOwnProperty(tId)) {
          activeUser.progress.trophies[tId] = !!importedTrophies[tId];
        }
      });
    }

    this.checkUatTrophiesAuto(activeUser);
    activeUser.progress.lastUpdated = new Date().toISOString();

    const usersMap = this.getUsersMap();
    usersMap[activeUser.username.toLowerCase()] = activeUser;
    this.saveUsersMap(usersMap);

    apiClient.syncProgress(activeUser.username, activeUser.progress.operatorRounds, activeUser.progress.trophies);
    return true;
  }
}

const storage = new StorageManager();
