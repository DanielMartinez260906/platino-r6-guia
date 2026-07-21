// server.js - Backend Node.js con Express y conexión a Google Sheets DB
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwaqrck9GXpmsmT7CQ_aslL8pTSVQVa38FtqkGZzH7jinwcw-Up_GgHWDtijSG3AIHfLw/exec';



// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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

// Helper para hacer peticiones HTTPS a Google Apps Script
function fetchGoogleSheets(action, payload) {
  return new Promise((resolve) => {
    if (!GOOGLE_SHEETS_URL || !GOOGLE_SHEETS_URL.startsWith('http')) {
      return resolve({ success: false, offline: true, message: 'Google Sheets URL no configurada.' });
    }

    const postData = JSON.stringify({ action, payload });

    const parsedUrl = new URL(GOOGLE_SHEETS_URL);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      // Manejar redirecciones de Google Apps Script (302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location);
        const redirOptions = {
          hostname: redirectUrl.hostname,
          path: redirectUrl.pathname + redirectUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const redirReq = https.request(redirOptions, (redirRes) => {
          let body = '';
          redirRes.on('data', chunk => body += chunk);
          redirRes.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              resolve({ success: false, message: 'Respuesta inválida de Google Sheets.' });
            }
          });
        });

        redirReq.on('error', () => resolve({ success: false, message: 'Error de conexión con Google Sheets.' }));
        redirReq.write(postData);
        redirReq.end();
        return;
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          resolve({ success: false, message: 'Respuesta no procesable.' });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Error al conectar con Google Sheets:', err.message);
      resolve({ success: false, offline: true, message: err.message });
    });

    req.write(postData);
    req.end();
  });
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

// Registro de Usuario
app.post('/api/register', async (req, res) => {
  const { username, passwordHash, operatorRounds, trophies } = req.body;
  const cleanUser = (username || '').trim();

  if (!cleanUser || !passwordHash) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña obligatorios.' });
  }

  const key = cleanUser.toLowerCase();
  const db = readLocalDB();

  if (db.users[key]) {
    return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe.' });
  }

  const newUser = {
    username: cleanUser,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
    progress: {
      operatorRounds: operatorRounds || {},
      trophies: trophies || {},
      lastUpdated: new Date().toISOString()
    }
  };

  // Guardar en DB local
  db.users[key] = newUser;
  writeLocalDB(db);

  // Sincronizar en Google Sheets DB (si está configurada)
  if (GOOGLE_SHEETS_URL) {
    fetchGoogleSheets('register', { username: cleanUser, passwordHash, operatorRounds, trophies });
  }

  return res.json({
    success: true,
    user: newUser,
    message: '¡Usuario registrado correctamente!'
  });
});

// Inicio de Sesión
app.post('/api/login', async (req, res) => {
  const { username, passwordHash } = req.body;
  const cleanUser = (username || '').trim();
  const key = cleanUser.toLowerCase();

  const db = readLocalDB();
  const localUser = db.users[key];

  // Si existe en Google Sheets DB, intentar sincronización
  if (GOOGLE_SHEETS_URL) {
    const sheetRes = await fetchGoogleSheets('login', { username: cleanUser, passwordHash });
    if (sheetRes.success && sheetRes.user) {
      // Actualizar DB local con los datos más recientes de Google Sheets
      db.users[key] = {
        ...db.users[key],
        username: sheetRes.user.username,
        passwordHash: passwordHash,
        progress: sheetRes.user.progress
      };
      writeLocalDB(db);
      return res.json(sheetRes);
    }
  }

  // Fallback a DB local
  if (!localUser) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
  }

  if (localUser.passwordHash !== passwordHash) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }

  return res.json({
    success: true,
    user: localUser,
    message: 'Inicio de sesión exitoso.'
  });
});

// Guardar/Actualizar Progreso
app.post('/api/progress', async (req, res) => {
  const { username, operatorRounds, trophies } = req.body;
  const cleanUser = (username || '').trim();
  const key = cleanUser.toLowerCase();

  const db = readLocalDB();
  if (db.users[key]) {
    db.users[key].progress = {
      operatorRounds: operatorRounds || {},
      trophies: trophies || {},
      lastUpdated: new Date().toISOString()
    };
    writeLocalDB(db);
  }

  // Enviar cambio a Google Sheets DB de fondo
  if (GOOGLE_SHEETS_URL) {
    fetchGoogleSheets('saveProgress', { username: cleanUser, operatorRounds, trophies });
  }

  return res.json({ success: true, message: 'Progreso guardado.' });
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
