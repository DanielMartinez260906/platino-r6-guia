// server.js - Backend Node.js con Express y conexión a Google Sheets DB (Contraseñas en Texto Plano)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwaqrck9GXpmsmT7CQ_aslL8pTSVQVa38FtqkGZzH7jinwcw-Up_GgHWDtijSG3AIHfLw/exec';

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir la aplicación web estática desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta explícita sin caché para la página principal
app.get(['/', '/index.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de persistencia local en JSON (Base de Datos Fallback)
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error leyendo base de datos local:', e);
  }
  return { users: {} };
}

function writeLocalDB(dbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error guardando base de datos local:', e);
  }
}

/**
 * Peticiones POST a Google Apps Script (Texto Plano)
 */
async function fetchGoogleSheets(action, payload) {
  if (!GOOGLE_SHEETS_URL || !GOOGLE_SHEETS_URL.startsWith('http')) {
    return { success: false, offline: true, message: 'Google Sheets URL no configurada.' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, payload }),
      redirect: 'follow'
    });

    const data = await response.json();
    console.log(`📊 Google Sheets Response (${action}):`, data);
    return data;
  } catch (err) {
    console.error(`❌ Error enviando (${action}) a Google Sheets:`, err.message);
    return { success: false, message: err.message };
  }
}

// ----------------------------------------------------
// RUTAS DE LA API REST
// ----------------------------------------------------

// Estado del Servidor
app.get('/api/status', (req, res) => {
  const db = readLocalDB();
  const usersCount = Object.keys(db.users || {}).length;
  res.json({
    status: 'ok',
    appName: 'Rainbow Six Siege Platinum Tracker API',
    nodeVersion: process.version,
    googleSheetsConnected: !!GOOGLE_SHEETS_URL,
    totalLocalUsers: usersCount,
    timestamp: new Date().toISOString()
  });
});

// Registro de Usuario (Contraseña en Texto Plano)
app.post('/api/register', async (req, res) => {
  const { username, password, passwordHash, operatorRounds, trophies } = req.body;
  const cleanUser = (username || '').trim();
  const plainPassword = password || passwordHash || '';

  if (!cleanUser) {
    return res.status(400).json({ success: false, message: 'Usuario obligatorio.' });
  }

  const key = cleanUser.toLowerCase();
  const db = readLocalDB();

  const newUser = {
    username: cleanUser,
    password: plainPassword,
    createdAt: new Date().toISOString(),
    progress: {
      operatorRounds: operatorRounds || {},
      trophies: trophies || {},
      lastUpdated: new Date().toISOString()
    }
  };

  db.users[key] = newUser;
  writeLocalDB(db);

  let sheetsResult = { success: false };
  if (GOOGLE_SHEETS_URL) {
    sheetsResult = await fetchGoogleSheets('register', {
      username: cleanUser,
      password: plainPassword,
      operatorRounds: newUser.progress.operatorRounds,
      trophies: newUser.progress.trophies
    });
  }

  return res.json({
    success: true,
    user: newUser,
    googleSheets: sheetsResult,
    message: 'Usuario registrado en texto plano con éxito.'
  });
});

// Login de Usuario (Contraseña en Texto Plano)
app.post('/api/login', async (req, res) => {
  const { username, password, passwordHash } = req.body;
  const cleanUser = (username || '').trim();
  const plainPassword = password || passwordHash || '';

  if (!cleanUser) {
    return res.status(400).json({ success: false, message: 'Usuario obligatorio.' });
  }

  const key = cleanUser.toLowerCase();
  const db = readLocalDB();

  let user = db.users[key];
  if (!user) {
    user = {
      username: cleanUser,
      password: plainPassword,
      createdAt: new Date().toISOString(),
      progress: {
        operatorRounds: {},
        trophies: {},
        lastUpdated: new Date().toISOString()
      }
    };
    db.users[key] = user;
    writeLocalDB(db);
  }

  let sheetsResult = { success: false };
  if (GOOGLE_SHEETS_URL) {
    sheetsResult = await fetchGoogleSheets('login', {
      username: cleanUser,
      password: plainPassword
    });
  }

  return res.json({
    success: true,
    user: user,
    googleSheets: sheetsResult,
    message: 'Sesión iniciada.'
  });
});

// Guardar Progreso (Agentes y Trofeos)
app.post('/api/progress', async (req, res) => {
  const { username, operatorRounds, trophies } = req.body;
  const cleanUser = (username || '').trim();
  const key = cleanUser.toLowerCase();

  if (!cleanUser) {
    return res.status(400).json({ success: false, message: 'Usuario requerido.' });
  }

  const db = readLocalDB();
  if (!db.users[key]) {
    db.users[key] = {
      username: cleanUser,
      password: '123',
      createdAt: new Date().toISOString(),
      progress: {
        operatorRounds: {},
        trophies: {},
        lastUpdated: new Date().toISOString()
      }
    };
  }

  db.users[key].progress.operatorRounds = operatorRounds || db.users[key].progress.operatorRounds || {};
  db.users[key].progress.trophies = trophies || db.users[key].progress.trophies || {};
  db.users[key].progress.lastUpdated = new Date().toISOString();
  writeLocalDB(db);

  let sheetsResult = { success: false };
  if (GOOGLE_SHEETS_URL) {
    sheetsResult = await fetchGoogleSheets('saveProgress', {
      username: cleanUser,
      operatorRounds: db.users[key].progress.operatorRounds,
      trophies: db.users[key].progress.trophies
    });
  }

  return res.json({
    success: true,
    googleSheets: sheetsResult,
    message: 'Progreso guardado.'
  });
});

// Capturar cualquier otra ruta y entregar index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🎮 RAINBOW SIX SIEGE PLATINUM TRACKER INICIADO`);
  console.log(`=================================================`);
  console.log(`👉 Haz Clic o Abre en tu navegador este enlace:`);
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   🌐 http://127.0.0.1:${PORT}`);
  console.log(`-------------------------------------------------`);
  console.log(`📊 Base de Datos Google Sheets: ${GOOGLE_SHEETS_URL ? '🟢 CONECTADA' : '🟡 MODO LOCAL'}`);
  console.log(`=================================================\n`);
});
