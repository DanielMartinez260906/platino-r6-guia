/**
 * GOOGLE APPS SCRIPT - CONECTOR DE BASE DE DATOS EN GOOGLE SHEETS
 * (Versión con Contraseñas en Texto Plano a petición del usuario)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheetUsers = getOrCreateSheet("Usuarios", ["Username", "Password", "FechaRegistro", "UltimaSesion"]);
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
  var password = payload.password || payload.passwordHash || "";
  var key = username.toLowerCase();

  if (!username || !password) {
    return { success: false, message: "Usuario y contraseña requeridos." };
  }

  var usersData = sheetUsers.getDataRange().getValues();
  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0].toString().toLowerCase() === key) {
      return { success: false, message: "El usuario ya está registrado en la hoja de cálculo." };
    }
  }

  var now = new Date().toISOString();
  sheetUsers.appendRow([username, password, now, now]);

  var defaultRounds = payload.operatorRounds ? JSON.stringify(payload.operatorRounds) : "{}";
  var defaultTrophies = payload.trophies ? JSON.stringify(payload.trophies) : "{}";
  sheetProgress.appendRow([username, defaultRounds, defaultTrophies, now]);

  return {
    success: true,
    user: { username: username, password: password, progress: { operatorRounds: payload.operatorRounds || {}, trophies: payload.trophies || {} } },
    message: "Usuario registrado en Google Sheets (Texto Plano)."
  };
}

function handleLogin(sheetUsers, sheetProgress, payload) {
  var username = (payload.username || "").trim();
  var password = payload.password || payload.passwordHash || "";
  var key = username.toLowerCase();

  var usersData = sheetUsers.getDataRange().getValues();
  var foundIndex = -1;

  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0].toString().toLowerCase() === key) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) {
    return { success: false, message: "El usuario no existe." };
  }

  var storedPassword = usersData[foundIndex][1].toString();
  if (storedPassword !== password) {
    return { success: false, message: "Contraseña incorrecta." };
  }

  var now = new Date().toISOString();
  sheetUsers.getRange(foundIndex + 1, 4).setValue(now);

  return {
    success: true,
    message: "Inicio de sesión correcto en Google Sheets."
  };
}

function handleSaveProgress(sheetProgress, payload) {
  var username = (payload.username || "").trim();
  var key = username.toLowerCase();

  if (!username) {
    return { success: false, message: "Usuario requerido." };
  }

  var progressData = sheetProgress.getDataRange().getValues();
  var foundIndex = -1;

  for (var i = 1; i < progressData.length; i++) {
    if (progressData[i][0].toString().toLowerCase() === key) {
      foundIndex = i;
      break;
    }
  }

  var roundsJSON = JSON.stringify(payload.operatorRounds || {});
  var trophiesJSON = JSON.stringify(payload.trophies || {});
  var now = new Date().toISOString();

  if (foundIndex !== -1) {
    sheetProgress.getRange(foundIndex + 1, 2, 1, 3).setValues([[roundsJSON, trophiesJSON, now]]);
  } else {
    sheetProgress.appendRow([username, roundsJSON, trophiesJSON, now]);
  }

  return { success: true, message: "Progreso actualizado en Google Sheets." };
}

function handleSyncAll(sheetUsers, sheetProgress) {
  var usersData = sheetUsers.getDataRange().getValues();
  var progressData = sheetProgress.getDataRange().getValues();

  var progressMap = {};
  for (var j = 1; j < progressData.length; j++) {
    var uName = progressData[j][0].toString().toLowerCase();
    try {
      progressMap[uName] = {
        operatorRounds: JSON.parse(progressData[j][1] || "{}"),
        trophies: JSON.parse(progressData[j][2] || "{}"),
        lastUpdated: progressData[j][3]
      };
    } catch (e) {
      progressMap[uName] = { operatorRounds: {}, trophies: {}, lastUpdated: "" };
    }
  }

  var allUsers = {};
  for (var i = 1; i < usersData.length; i++) {
    var rawName = usersData[i][0].toString();
    var uKey = rawName.toLowerCase();
    var userPass = usersData[i][1].toString();
    var createdAt = usersData[i][2];

    allUsers[uKey] = {
      username: rawName,
      password: userPass,
      createdAt: createdAt,
      progress: progressMap[uKey] || { operatorRounds: {}, trophies: {}, lastUpdated: "" }
    };
  }

  return { success: true, users: allUsers };
}
