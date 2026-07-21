/**
 * GOOGLE APPS SCRIPT - CONECTOR DE BASE DE DATOS EN GOOGLE SHEETS
 * 
 * INSTRUCCIONES DE INSTALACIÓN (EN 1 MINUTO):
 * 1. Abre una Hoja de Cálculo nueva en Google Sheets.
 * 2. En el menú superior, ve a "Extensiones" > "Apps Script".
 * 3. Borra todo el código que aparezca y pega este código completo.
 * 4. Haz clic en el botón azul "Implementar" (esquina superior derecha) > "Nueva implementación".
 * 5. Selecciona el tipo "Aplicación web".
 * 6. En "Ejecutar como": Pon "Yo (tu email)".
 * 7. En "Quién tiene acceso": Selecciona "Cualquier persona" (Anyone).
 * 8. Haz clic en "Implementar", autoriza el acceso y copia la URL generada.
 * 9. Pega esa URL en tu archivo `.env` o en las variables de entorno de RENDER como:
 *    GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/xxxx/exec
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheetUsers = getOrCreateSheet("Usuarios", ["Username", "PasswordHash", "FechaRegistro", "UltimaSesion"]);
    var sheetProgress = getOrCreateSheet("Progreso", ["Username", "OperatorRoundsJSON", "TrophiesJSON", "UltimaActualizacion"]);

    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload || {};

    var result = { success: false, message: "Acción no reconocida" };

    if (action === "register") {
      result = handleRegister(sheetUsers, sheetProgress, payload);
    } else if (action === "login") {
      result = handleLogin(sheetUsers, sheetProgress, payload);
    } else if (action === "saveProgress") {
      result = handleSaveProgress(sheetProgress, payload);
    } else if (action === "syncAll") {
      result = handleSyncAll(sheetUsers, sheetProgress);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Base de datos R6S Platino Tracker activa en Google Sheets." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f4ad16");
  }
  return sheet;
}

function handleRegister(sheetUsers, sheetProgress, payload) {
  var username = (payload.username || "").trim();
  var passwordHash = payload.passwordHash || "";
  var key = username.toLowerCase();

  if (!username || !passwordHash) {
    return { success: false, message: "Usuario y contraseña requeridos." };
  }

  var usersData = sheetUsers.getDataRange().getValues();
  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0].toString().toLowerCase() === key) {
      return { success: false, message: "El usuario ya está registrado en la hoja de cálculo." };
    }
  }

  var now = new Date().toISOString();
  sheetUsers.appendRow([username, passwordHash, now, now]);

  var defaultRounds = payload.operatorRounds ? JSON.stringify(payload.operatorRounds) : "{}";
  var defaultTrophies = payload.trophies ? JSON.stringify(payload.trophies) : "{}";
  sheetProgress.appendRow([username, defaultRounds, defaultTrophies, now]);

  return {
    success: true,
    user: { username: username, progress: { operatorRounds: payload.operatorRounds || {}, trophies: payload.trophies || {} } },
    message: "Usuario registrado en Google Sheets."
  };
}

function handleLogin(sheetUsers, sheetProgress, payload) {
  var username = (payload.username || "").trim();
  var passwordHash = payload.passwordHash || "";
  var key = username.toLowerCase();

  var usersData = sheetUsers.getDataRange().getValues();
  var foundUserRow = -1;
  var actualUsername = username;

  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0].toString().toLowerCase() === key) {
      foundUserRow = i + 1;
      actualUsername = usersData[i][0];
      if (usersData[i][1].toString() !== passwordHash.toString()) {
        return { success: false, message: "Contraseña incorrecta." };
      }
      break;
    }
  }

  if (foundUserRow === -1) {
    return { success: false, message: "Usuario no encontrado." };
  }

  // Actualizar última sesión
  var now = new Date().toISOString();
  sheetUsers.getRange(foundUserRow, 4).setValue(now);

  // Leer Progreso
  var progressData = sheetProgress.getDataRange().getValues();
  var userRounds = {};
  var userTrophies = {};

  for (var j = 1; j < progressData.length; j++) {
    if (progressData[j][0].toString().toLowerCase() === key) {
      try { userRounds = JSON.parse(progressData[j][1]); } catch(e) {}
      try { userTrophies = JSON.parse(progressData[j][2]); } catch(e) {}
      break;
    }
  }

  return {
    success: true,
    user: {
      username: actualUsername,
      progress: { operatorRounds: userRounds, trophies: userTrophies }
    },
    message: "Inicio de sesión correcto."
  };
}

function handleSaveProgress(sheetProgress, payload) {
  var username = (payload.username || "").trim();
  var key = username.toLowerCase();
  var roundsJSON = JSON.stringify(payload.operatorRounds || {});
  var trophiesJSON = JSON.stringify(payload.trophies || {});
  var now = new Date().toISOString();

  var progressData = sheetProgress.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < progressData.length; i++) {
    if (progressData[i][0].toString().toLowerCase() === key) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow !== -1) {
    sheetProgress.getRange(foundRow, 2).setValue(roundsJSON);
    sheetProgress.getRange(foundRow, 3).setValue(trophiesJSON);
    sheetProgress.getRange(foundRow, 4).setValue(now);
  } else {
    sheetProgress.appendRow([username, roundsJSON, trophiesJSON, now]);
  }

  return { success: true, message: "Progreso guardado en Google Sheets." };
}

function handleSyncAll(sheetUsers, sheetProgress) {
  var usersData = sheetUsers.getDataRange().getValues();
  var progressData = sheetProgress.getDataRange().getValues();

  var usersList = [];
  for (var i = 1; i < usersData.length; i++) {
    usersList.push(usersData[i][0]);
  }

  return { success: true, users: usersList, total: usersList.length };
}
