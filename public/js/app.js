// public/js/app.js
// Controlador principal de la aplicación R6 Siege Platinum Tracker

class R6App {
  constructor() {
    this.currentPlatformFilter = "AMBOS";
    this.currentStatusFilter = "ALL";
    this.searchQuery = "";
    
    this.initElements();
    this.bindEvents();
    this.checkCloudConnection();
    this.renderAll();
  }

  initElements() {
    this.operatorsContainer = document.getElementById("operatorsContainer");
    this.trophiesContainer = document.getElementById("trophiesContainer");
    this.searchInput = document.getElementById("trophySearchInput");
    
    this.statOverallProgress = document.getElementById("statOverallProgress");
    this.statTrophiesCount = document.getElementById("statTrophiesCount");
    this.statOperatorsMaxed = document.getElementById("statOperatorsMaxed");
    this.statUatsMaxed = document.getElementById("statUatsMaxed");
    this.progressBarFill = document.getElementById("mainProgressBarFill");
    this.cloudStatusBadge = document.getElementById("cloudStatusBadge");

    this.exportExcelBtn = document.getElementById("exportExcelBtn");
    this.importExcelInput = document.getElementById("importExcelInput");
    this.downloadTemplateBtn = document.getElementById("downloadTemplateBtn");
  }

  async checkCloudConnection() {
    if (!this.cloudStatusBadge) return;
    const res = await apiClient.checkServerStatus();
    if (res.status === 'ok') {
      if (res.googleSheetsConnected) {
        this.cloudStatusBadge.className = "cloud-badge cloud-online";
        this.cloudStatusBadge.innerHTML = "🟢 Google Sheets DB Conectada";
      } else {
        this.cloudStatusBadge.className = "cloud-badge cloud-local";
        this.cloudStatusBadge.innerHTML = "🟡 Servidor Activo (Modo Local)";
      }
    } else {
      this.cloudStatusBadge.className = "cloud-badge cloud-offline";
      this.cloudStatusBadge.innerHTML = "⚪ Modo Offline (LocalStorage)";
    }
  }

  bindEvents() {
    document.querySelectorAll(".platform-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".platform-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentPlatformFilter = btn.dataset.platform;
        this.renderTrophies();
      });
    });

    document.querySelectorAll(".status-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".status-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentStatusFilter = btn.dataset.status;
        this.renderTrophies();
      });
    });

    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTrophies();
      });
    }

    if (this.exportExcelBtn) {
      this.exportExcelBtn.addEventListener("click", () => {
        excelManager.exportToExcel();
      });
    }

    if (this.importExcelInput) {
      this.importExcelInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          excelManager.importFromExcelFile(file, (success, rounds, trophies, errMsg) => {
            if (success) {
              alert("¡Progreso importado con éxito desde el archivo de Excel!");
              this.renderAll();
            } else {
              alert(errMsg || "Error al importar el archivo de Excel.");
            }
            this.importExcelInput.value = "";
          });
        }
      });
    }

    if (this.downloadTemplateBtn) {
      this.downloadTemplateBtn.addEventListener("click", () => {
        excelManager.exportToExcel();
      });
    }
  }

  renderAll() {
    this.renderStats();
    this.renderOperatorsTracker();
    this.renderTrophies();
  }



  renderStats() {
    const user = storage.getActiveUser();
    if (!user) return;

    const trophiesMap = user.progress.trophies || {};
    const opRounds = user.progress.operatorRounds || {};

    const totalTrophies = TROPHIES_DATA.length;
    const completedTrophies = TROPHIES_DATA.filter(t => !!trophiesMap[t.id]).length;
    const percentage = totalTrophies > 0 ? Math.round((completedTrophies / totalTrophies) * 100) : 0;

    if (this.statOverallProgress) this.statOverallProgress.textContent = `${percentage}%`;
    if (this.statTrophiesCount) this.statTrophiesCount.textContent = `${completedTrophies} / ${totalTrophies}`;
    if (this.progressBarFill) this.progressBarFill.style.width = `${percentage}%`;

    const maxedOperators = ALL_OPERATORS.filter(op => (opRounds[op.id] || 0) >= 10).length;
    if (this.statOperatorsMaxed) this.statOperatorsMaxed.textContent = `${maxedOperators} / 20`;

    let completedUats = 0;
    UATS_DATA.forEach(uat => {
      const all10 = uat.operators.every(op => (opRounds[op.id] || 0) >= 10);
      if (all10) completedUats++;
    });
    if (this.statUatsMaxed) this.statUatsMaxed.textContent = `${completedUats} / 5 UATs`;
  }

  renderOperatorsTracker() {
    if (!this.operatorsContainer) return;
    const user = storage.getActiveUser();
    if (!user) return;

    const opRounds = user.progress.operatorRounds || {};

    let html = "";
    UATS_DATA.forEach(uat => {
      const uatOperatorsMaxed = uat.operators.filter(op => (opRounds[op.id] || 0) >= 10).length;
      const isUatCompleted = uatOperatorsMaxed === 4;

      html += `
        <div class="uat-card ${isUatCompleted ? 'uat-completed' : ''}">
          <div class="uat-header">
            <div class="uat-title-group">
              <span class="uat-flag">${uat.country}</span>
              <h3 class="uat-name">UAT ${uat.name}</h3>
            </div>
            <div class="uat-badge-group">
              <span class="uat-progress-badge ${isUatCompleted ? 'badge-gold' : 'badge-slate'}">
                ${uatOperatorsMaxed}/4 Agentes con 10 Rondas ${isUatCompleted ? '🏆' : ''}
              </span>
            </div>
          </div>
          <div class="operators-grid">
      `;

      uat.operators.forEach(op => {
        const rounds = opRounds[op.id] || 0;
        const isOpCompleted = rounds >= 10;
        const percent = Math.min(100, Math.round((rounds / 10) * 100));

        html += `
          <div class="operator-item ${isOpCompleted ? 'op-completed' : ''}">
            <div class="op-avatar-role">
              <div class="op-icon-wrapper role-${op.role.toLowerCase()}">
                ${op.iconSvg}
              </div>
              <span class="role-pill ${op.role.toLowerCase()}">${op.role}</span>
            </div>
            <div class="op-details">
              <div class="op-name-header">
                <span class="op-name">${op.name}</span>
                <span class="op-realname">${op.realName}</span>
              </div>
              <p class="op-ability">⚡ ${op.ability}</p>
              
              <div class="op-round-counter-bar">
                <div class="counter-controls">
                  <button class="btn-counter btn-minus" onclick="app.changeRounds('${op.id}', -1)">-</button>
                  <input type="number" class="input-rounds-count" value="${rounds}" min="0" max="100" 
                    onchange="app.setRounds('${op.id}', this.value)" />
                  <span class="round-slash">/10 rondas</span>
                  <button class="btn-counter btn-plus" onclick="app.changeRounds('${op.id}', 1)">+</button>
                  <button class="btn-counter btn-max ${isOpCompleted ? 'active-gold' : ''}" 
                    title="Marcar 10/10 completado" onclick="app.setRounds('${op.id}', 10)">10/10</button>
                </div>
                <div class="op-progress-track">
                  <div class="op-progress-fill ${isOpCompleted ? 'fill-gold' : ''}" style="width: ${percent}%;"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    this.operatorsContainer.innerHTML = html;
  }

  renderTrophies() {
    if (!this.trophiesContainer) return;
    const user = storage.getActiveUser();
    if (!user) return;

    const trophiesMap = user.progress.trophies || {};

    let filtered = TROPHIES_DATA.filter(t => {
      if (this.currentPlatformFilter !== "AMBOS") {
        if (t.platform !== "AMBOS" && t.platform !== this.currentPlatformFilter) {
          return false;
        }
      }

      const isCompleted = !!trophiesMap[t.id];
      if (this.currentStatusFilter === "COMPLETED" && !isCompleted) return false;
      if (this.currentStatusFilter === "PENDING" && isCompleted) return false;

      if (this.searchQuery) {
        const matchTitle = t.title.toLowerCase().includes(this.searchQuery);
        const matchDesc = t.description.toLowerCase().includes(this.searchQuery);
        const matchOrig = t.originalTitle.toLowerCase().includes(this.searchQuery);
        if (!matchTitle && !matchDesc && !matchOrig) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      this.trophiesContainer.innerHTML = `
        <div class="empty-trophies-state">
          <p>🚫 No se encontraron trofeos que coincidan con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach(t => {
      const isCompleted = !!trophiesMap[t.id];
      const categoryClass = `cat-${t.category.toLowerCase()}`;

      html += `
        <div class="trophy-card ${isCompleted ? 'trophy-completed' : ''}" id="trophy-card-${t.id}">
          <div class="trophy-main-row">
            <label class="custom-checkbox-wrapper">
              <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                onchange="app.toggleTrophy('${t.id}')" />
              <span class="checkmark"></span>
            </label>

            <div class="trophy-info-col">
              <div class="trophy-header-tags">
                <span class="badge-category ${categoryClass}">${t.category}</span>
                <span class="badge-platform platform-${t.platform.toLowerCase()}">${t.platform}</span>
                ${t.isComplex ? '<span class="badge-complex">🎯 Complejo</span>' : ''}
              </div>
              <h4 class="trophy-title ${isCompleted ? 'line-through' : ''}">${t.title}</h4>
              <p class="trophy-original-title">${t.originalTitle}</p>
              <p class="trophy-description">${t.description}</p>
            </div>

            <button class="btn-toggle-guide" onclick="app.toggleGuide('${t.id}')">
              📖 Estrategia
            </button>
          </div>

          <div class="trophy-guide-drawer hidden" id="guide-drawer-${t.id}">
            <div class="guide-content-box">
              <h5>🛡️ Guía y Estrategia Táctica:</h5>
              <p>${t.guideText}</p>
              ${t.tips && t.tips.length > 0 ? `
                <div class="tips-box">
                  <strong>💡 Consejos Clave:</strong>
                  <ul>
                    ${t.tips.map(tip => `<li>${tip}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });

    this.trophiesContainer.innerHTML = html;
  }

  changeRounds(opId, delta) {
    const user = storage.getActiveUser();
    if (!user) return;
    const current = user.progress.operatorRounds[opId] || 0;
    const updated = Math.max(0, current + delta);
    storage.updateOperatorRounds(opId, updated);
    this.renderAll();
  }

  setRounds(opId, val) {
    storage.updateOperatorRounds(opId, val);
    this.renderAll();
  }

  toggleTrophy(tId) {
    storage.toggleTrophy(tId);
    this.renderAll();
  }

  toggleGuide(tId) {
    const drawer = document.getElementById(`guide-drawer-${tId}`);
    if (drawer) {
      drawer.classList.toggle("hidden");
    }
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new R6App();
  window.app = app;
});
