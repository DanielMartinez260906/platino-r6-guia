// js/excel.js
// Gestor de importación y exportación de datos en hojas de cálculo de Excel (.xlsx) usando SheetJS

class ExcelManager {
  constructor() {
    this.ensureSheetJsLoaded();
  }

  ensureSheetJsLoaded() {
    if (typeof XLSX === "undefined") {
      console.warn("SheetJS (XLSX) aún no se ha cargado. Se verificará en tiempo de ejecución.");
    }
  }

  /**
   * Exporta todo el progreso del usuario actual a un archivo Excel (.xlsx)
   */
  exportToExcel() {
    if (typeof XLSX === "undefined") {
      alert("Error: La librería de Excel (SheetJS) no se ha cargado correctamente.");
      return;
    }

    const user = storage.getActiveUser();
    if (!user) {
      alert("Debes iniciar sesión para exportar tu progreso.");
      return;
    }

    const username = user.username;
    const progress = user.progress;
    const opRounds = progress.operatorRounds || {};
    const trophiesMap = progress.trophies || {};

    // 1. Pestaña de Resumen y Trofeos
    const trophiesRows = TROPHIES_DATA.map(t => {
      const isCompleted = !!trophiesMap[t.id];
      return {
        "ID Trofeo": t.id,
        "Título Trofeo": t.title,
        "Título Original": t.originalTitle,
        "Plataforma": t.platform,
        "Categoría": t.category,
        "Estado": isCompleted ? "COMPLETADO" : "PENDIENTE",
        "Descripción": t.description,
        "Consejo Táctico": t.tips ? t.tips.join(" | ") : ""
      };
    });

    // 2. Pestaña de Tracker de Agentes Pioneros
    const operatorsRows = ALL_OPERATORS.map(op => {
      const rounds = opRounds[op.id] || 0;
      const uat = UATS_DATA.find(u => u.id === op.uatId);
      return {
        "ID Agente": op.id,
        "Nombre Agente": op.name,
        "UAT (Unidad)": uat ? uat.name : op.uatName,
        "Rol": op.role === "ATK" ? "Atacante" : "Defensor",
        "Rondas Jugadas": rounds,
        "Meta (10 Rondas)": rounds >= 10 ? "LOGRADO (10/10)" : `${rounds}/10 Rondas`,
        "Nombre Real": op.realName,
        "Habilidad Especial": op.ability
      };
    });

    // 3. Crear Libro de Trabajo Excel
    const wb = XLSX.utils.book_new();
    const wsTrofeos = XLSX.utils.json_to_sheet(trophiesRows);
    const wsAgentes = XLSX.utils.json_to_sheet(operatorsRows);

    // Ajustar anchos de columnas para mejor presentación
    wsTrofeos["!cols"] = [
      { wch: 18 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 50 }, { wch: 50 }
    ];
    wsAgentes["!cols"] = [
      { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, wsTrofeos, "Trofeos R6S");
    XLSX.utils.book_append_sheet(wb, wsAgentes, "Agentes Pioneros");

    // Formatear nombre de archivo
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Progreso_Platino_R6S_${username}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  }

  /**
   * Lee un archivo Excel (.xlsx) subido por el usuario e importa el progreso
   */
  importFromExcelFile(file, callback) {
    if (typeof XLSX === "undefined") {
      alert("Error: La librería de Excel no está disponible.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const importedRounds = {};
        const importedTrophies = {};

        // Procesar hoja de Agentes Pioneros si existe
        if (workbook.SheetNames.includes("Agentes Pioneros")) {
          const wsAgentes = workbook.Sheets["Agentes Pioneros"];
          const jsonAgentes = XLSX.utils.sheet_to_json(wsAgentes);

          jsonAgentes.forEach(row => {
            const opId = row["ID Agente"];
            const rounds = parseInt(row["Rondas Jugadas"]);
            if (opId && !isNaN(rounds)) {
              importedRounds[opId] = rounds;
            }
          });
        }

        // Procesar hoja de Trofeos si existe
        if (workbook.SheetNames.includes("Trofeos R6S")) {
          const wsTrofeos = workbook.Sheets["Trofeos R6S"];
          const jsonTrofeos = XLSX.utils.sheet_to_json(wsTrofeos);

          jsonTrofeos.forEach(row => {
            const tId = row["ID Trofeo"];
            const estado = row["Estado"];
            if (tId && estado) {
              importedTrophies[tId] = estado.toUpperCase() === "COMPLETADO";
            }
          });
        }

        const success = storage.importFullProgress(importedRounds, importedTrophies);
        if (callback) callback(success, importedRounds, importedTrophies);
      } catch (err) {
        console.error("Error al procesar archivo de Excel:", err);
        if (callback) callback(false, null, null, "El archivo de Excel no tiene el formato esperado.");
      }
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Descarga una plantilla de Excel en blanco lista para llenar
   */
  downloadTemplate() {
    const defaultUser = storage.getActiveUser();
    this.exportToExcel();
  }
}

const excelManager = new ExcelManager();
