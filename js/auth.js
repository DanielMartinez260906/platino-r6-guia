// js/auth.js
// Manejo de la interfaz de usuario para Login, Registro y Selección de Cuentas

class AuthUI {
  constructor() {
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modalOverlay = document.getElementById("authModalOverlay");
    this.loginForm = document.getElementById("loginForm");
    this.registerForm = document.getElementById("registerForm");
    
    this.tabLoginBtn = document.getElementById("tabLoginBtn");
    this.tabRegisterBtn = document.getElementById("tabRegisterBtn");

    this.loginError = document.getElementById("loginError");
    this.registerError = document.getElementById("registerError");

    this.userBadgeName = document.getElementById("userBadgeName");
    this.userAvatarInitial = document.getElementById("userAvatarInitial");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.switchAccountBtn = document.getElementById("switchAccountBtn");
    this.openAuthModalBtn = document.getElementById("openAuthModalBtn");
  }

  bindEvents() {
    if (this.tabLoginBtn) {
      this.tabLoginBtn.addEventListener("click", () => this.switchTab("login"));
    }
    if (this.tabRegisterBtn) {
      this.tabRegisterBtn.addEventListener("click", () => this.switchTab("register"));
    }

    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
    if (this.registerForm) {
      this.registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    if (this.switchAccountBtn) {
      this.switchAccountBtn.addEventListener("click", () => this.openAuthModal());
    }

    if (this.openAuthModalBtn) {
      this.openAuthModalBtn.addEventListener("click", () => this.openAuthModal());
    }
  }

  switchTab(tab) {
    if (tab === "login") {
      this.tabLoginBtn.classList.add("active");
      this.tabRegisterBtn.classList.remove("active");
      this.loginForm.classList.remove("hidden");
      this.registerForm.classList.add("hidden");
      this.clearErrors();
    } else {
      this.tabRegisterBtn.classList.add("active");
      this.tabLoginBtn.classList.remove("active");
      this.registerForm.classList.remove("hidden");
      this.loginForm.classList.add("hidden");
      this.clearErrors();
    }
  }

  clearErrors() {
    if (this.loginError) this.loginError.textContent = "";
    if (this.registerError) this.registerError.textContent = "";
  }

  openAuthModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove("hidden");
      this.renderQuickUserList();
    }
  }

  closeAuthModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add("hidden");
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("loginUsername").value;
    const passwordInput = document.getElementById("loginPassword").value;

    const res = await storage.loginUser(usernameInput, passwordInput);
    if (!res.success) {
      if (this.loginError) this.loginError.textContent = res.message;
      return;
    }

    this.closeAuthModal();
    this.updateUserUI();
    if (window.app) window.app.renderAll();
  }

  async handleRegister(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("regUsername").value;
    const passwordInput = document.getElementById("regPassword").value;
    const passwordConfirm = document.getElementById("regPasswordConfirm").value;

    if (passwordInput !== passwordConfirm) {
      if (this.registerError) this.registerError.textContent = "Las contraseñas no coinciden.";
      return;
    }

    const res = await storage.registerUser(usernameInput, passwordInput);
    if (!res.success) {
      if (this.registerError) this.registerError.textContent = res.message;
      return;
    }

    this.closeAuthModal();
    this.updateUserUI();
    if (window.app) window.app.renderAll();
  }


  handleLogout() {
    storage.logoutUser();
    this.updateUserUI();
    this.openAuthModal();
  }

  updateUserUI() {
    const user = storage.getActiveUser();
    if (user) {
      if (this.userBadgeName) this.userBadgeName.textContent = user.username;
      if (this.userAvatarInitial) this.userAvatarInitial.textContent = user.username.charAt(0).toUpperCase();
      if (this.logoutBtn) this.logoutBtn.classList.remove("hidden");
    } else {
      if (this.userBadgeName) this.userBadgeName.textContent = "Sin sesión";
      if (this.userAvatarInitial) this.userAvatarInitial.textContent = "?";
      if (this.logoutBtn) this.logoutBtn.classList.add("hidden");
    }
  }

  renderQuickUserList() {
    const container = document.getElementById("quickUserListContainer");
    if (!container) return;

    const usersMap = storage.getUsersMap();
    const keys = Object.keys(usersMap);
    const activeUsername = storage.getActiveUsername();

    if (keys.length === 0) {
      container.innerHTML = "<p class='text-muted'>No hay cuentas registradas aún.</p>";
      return;
    }

    let html = "<div class='quick-user-grid'>";
    keys.forEach(k => {
      const u = usersMap[k];
      const isActive = k === activeUsername;
      html += `
        <div class="quick-user-card ${isActive ? 'active-user' : ''}" onclick="authUI.selectQuickUser('${u.username}')">
          <div class="user-avatar-circle">${u.username.charAt(0).toUpperCase()}</div>
          <div class="user-info">
            <span class="user-name">${u.username}</span>
            <span class="user-status">${isActive ? 'Sesión Actual' : 'Clic para ingresar'}</span>
          </div>
        </div>
      `;
    });
    html += "</div>";
    container.innerHTML = html;
  }

  selectQuickUser(username) {
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").focus();
    this.switchTab("login");
  }
}

let authUI;
document.addEventListener("DOMContentLoaded", () => {
  authUI = new AuthUI();
  authUI.updateUserUI();
});
