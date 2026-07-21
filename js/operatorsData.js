// js/operatorsData.js
// Estructura de datos completa de los 20 Agentes Pioneros y sus 5 UATs (Unidades Anti-Terroristas)

const UATS_DATA = [
  {
    id: "sas",
    name: "S.A.S.",
    country: "Reino Unido 🇬🇧",
    trophyId: "trophy_uat_sas",
    operators: [
      {
        id: "sledge",
        name: "Sledge",
        realName: "Seamus Cowden",
        role: "ATK",
        ability: "Martillo Táctico Caber",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M5 4h14v3H5V4zm0 5h14v2H5V9zm2 4h10v7H7v-7z"/></svg>`
      },
      {
        id: "thatcher",
        name: "Thatcher",
        realName: "Mike Baker",
        role: "ATK",
        ability: "Granada PEM EG MKO",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10" stroke="#0e141b" stroke-width="2"/></svg>`
      },
      {
        id: "smoke",
        name: "Smoke",
        realName: "James Porter",
        role: "DEF",
        ability: "Granada de Gas Remota",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
      },
      {
        id: "mute",
        name: "Mute",
        realName: "Mark Chandar",
        role: "DEF",
        ability: "Inhibidor de Señal GC90",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M3 3l18 18M12 5a7 7 0 017 7M5 12a7 7 0 017-7"/></svg>`
      }
    ]
  },
  {
    id: "fbi",
    name: "F.B.I. S.W.A.T.",
    country: "Estados Unidos 🇺🇸",
    trophyId: "trophy_uat_fbi",
    operators: [
      {
        id: "ash",
        name: "Ash",
        realName: "Elżbieta Cohen",
        role: "ATK",
        ability: "Proyectil Volador de Brecha M120",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4l6.5 13h-13L12 6z"/></svg>`
      },
      {
        id: "thermite",
        name: "Thermite",
        realName: "Jordan Trace",
        role: "ATK",
        ability: "Carga de Exotérmico Exo-Thermic",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L6 20l2-7L2.5 9h7z"/></svg>`
      },
      {
        id: "castle",
        name: "Castle",
        realName: "Miles Campbell",
        role: "DEF",
        ability: "Panel Táctico Blindado UTP1",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`
      },
      {
        id: "pulse",
        name: "Pulse",
        realName: "Jack Estrada",
        role: "DEF",
        ability: "Sensor Cardiaco HB-5",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
      }
    ]
  },
  {
    id: "gign",
    name: "G.I.G.N.",
    country: "Francia 🇫🇷",
    trophyId: "trophy_uat_gign",
    operators: [
      {
        id: "twitch",
        name: "Twitch",
        realName: "Emmanuelle Pichon",
        role: "ATK",
        ability: "Dron de Electrochoque RSD1",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`
      },
      {
        id: "montagne",
        name: "Montagne",
        realName: "Gilles Touré",
        role: "ATK",
        ability: "Escudo Extensible Le Roc",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4z"/></svg>`
      },
      {
        id: "doc",
        name: "Doc",
        realName: "Gustave Kateb",
        role: "DEF",
        ability: "Pistola Estimulante MPD-0",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19z"/></svg>`
      },
      {
        id: "rook",
        name: "Rook",
        realName: "Julien Nizan",
        role: "DEF",
        ability: "Pack de Blindaje ROU-2",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3zm0 4a3 3 0 110 6 3 3 0 010-6z"/></svg>`
      }
    ]
  },
  {
    id: "spetsnaz",
    name: "Spetsnaz",
    country: "Rusia 🇷🇺",
    trophyId: "trophy_uat_spetsnaz",
    operators: [
      {
        id: "glaz",
        name: "Glaz",
        realName: "Timur Glazkov",
        role: "ATK",
        ability: "Mira Térmica HLS Flip Sight",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`
      },
      {
        id: "fuze",
        name: "Fuze",
        realName: "Shuhrat Kessikbayev",
        role: "ATK",
        ability: "Carga de Racimo APM-6",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2h-4z"/></svg>`
      },
      {
        id: "kapkan",
        name: "Kapkan",
        realName: "Maxim Basuda",
        role: "DEF",
        ability: "Dispositivo Bloqueador de Puertas EDD Mk II",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.27 2.27C21.46 15.37 22 13.75 22 12c0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-1.75.64-3.37 1.73-4.63l2.27 2.27C8.68 10.43 8.5 11.2 8.5 12c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5h3c0 3.87-3.13 7-7 7z"/></svg>`
      },
      {
        id: "tachanka",
        name: "Tachanka",
        realName: "Alexsandr Senaviev",
        role: "DEF",
        ability: "Lanza granadas incendiarias Shumikha",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
      }
    ]
  },
  {
    id: "gsg9",
    name: "G.S.G. 9",
    country: "Alemania 🇩🇪",
    trophyId: "trophy_uat_gsg9",
    operators: [
      {
        id: "blitz",
        name: "Blitz",
        realName: "Elias Kötz",
        role: "ATK",
        ability: "Escudo Cegador G52-Tactical",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`
      },
      {
        id: "iq",
        name: "IQ",
        realName: "Monika Weiss",
        role: "ATK",
        ability: "Detector de Electrónicos RED Mk III",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`
      },
      {
        id: "jager",
        name: "Jäger",
        realName: "Marius Streicher",
        role: "DEF",
        ability: "Defensa Activa ADS-MKIV (Magpie)",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83z"/></svg>`
      },
      {
        id: "bandit",
        name: "Bandit",
        realName: "Dominic Brunsmeier",
        role: "DEF",
        ability: "Cable Electrificado CED-1",
        iconSvg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66s.07-.13.08-.15L13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15L11 21z"/></svg>`
      }
    ]
  }
];

// Array plano de los 20 agentes para consultas rápidas
const ALL_OPERATORS = UATS_DATA.flatMap(uat =>
  uat.operators.map(op => ({ ...op, uatId: uat.id, uatName: uat.name }))
);
