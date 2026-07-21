// psnService.js - Integración Oficial con PlayStation Network usando psn-api y Token NPSSO
const {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  getUserTitles,
  getUserTrophiesEarnedForTitle
} = require('psn-api');

// NP Communication IDs conocidos de Rainbow Six Siege
const R6S_FALLBACK_COMMUNICATION_IDS = [
  'NPWR08496_00', // PS4 Base
  'NPWR15849_00', // PS4 Lista Actualizada
  'NPWR21051_00'  // PS5 Lista Actualizada
];

// Mapa de trofeos de PSN a IDs de nuestra aplicación (Español e Inglés)
const PSN_TROPHY_MAPPING = {
  // Platino
  "siege master": "trophy_plat",
  "maestro de siege": "trophy_plat",

  // Oro
  "full roster": "trophy_full_roster",
  "plantilla completa": "trophy_full_roster",
  "plantilla completa (pioneros)": "trophy_full_roster",

  "jack of all trades": "trophy_jack_trades",
  "maestro de todo": "trophy_jack_trades",

  "perfectionist": "trophy_perfectionist",
  "perfeccionista": "trophy_perfectionist",

  "good as gold": "trophy_rank_gold",
  "a tiro fino": "trophy_rank_gold",

  "master": "trophy_ps4_terro_2500",
  "cazador de maravillas": "trophy_ps4_terro_2500",

  "camper": "trophy_ps4_protect_hostage",
  "inamovible": "trophy_ps4_protect_hostage",

  // Plata
  "s.a.s. vanguard": "trophy_uat_sas",
  "especialista s.a.s.": "trophy_uat_sas",

  "f.b.i. swat vanguard": "trophy_uat_fbi",
  "especialista f.b.i. s.w.a.t.": "trophy_uat_fbi",

  "g.i.g.n. vanguard": "trophy_uat_gign",
  "especialista g.i.g.n.": "trophy_uat_gign",

  "spetsnaz vanguard": "trophy_uat_spetsnaz",
  "especialista spetsnaz": "trophy_uat_spetsnaz",

  "g.s.g. 9 vanguard": "trophy_uat_gsg9",
  "especialista g.s.g. 9": "trophy_uat_gsg9",

  "tactical precision": "trophy_ps5_precision",
  "precisión táctica": "trophy_ps5_precision",

  // Bronce
  "meat wall": "trophy_meat_wall",
  "paredes de carne": "trophy_meat_wall",

  "bang bang": "trophy_bang_bang",
  "bang-bang": "trophy_bang_bang",

  "interior designer": "trophy_designer",
  "diseñador de interiores": "trophy_designer",

  "blind ambition": "trophy_blind_ambition",
  "cita a ciegas": "trophy_blind_ambition",

  "impenetrable": "trophy_impenetrable",
  "inexpugnable": "trophy_impenetrable",

  "brothers in arms": "trophy_brotherhood",
  "hermandad": "trophy_brotherhood",

  "death from above": "trophy_death_from_above",
  "muerte desde las alturas": "trophy_death_from_above",

  "zero signals": "trophy_gadget_destroyer",
  "sin comunicaciones": "trophy_gadget_destroyer"
};

class OfficialPsnService {
  /**
   * Autentica con Sony usando el Token NPSSO de 64 caracteres
   */
  async getAccessTokenFromNpsso(npssoToken) {
    const cleanToken = (npssoToken || '').trim();
    if (!cleanToken) {
      throw new Error("Por favor ingresa un Token NPSSO válido de 64 caracteres.");
    }
    if (cleanToken.length < 50) {
      throw new Error("El Token NPSSO debe tener aproximadamente 64 caracteres.");
    }

    try {
      const accessCode = await exchangeNpssoForCode(cleanToken);
      const authorization = await exchangeCodeForAccessToken(accessCode);
      return authorization;
    } catch (err) {
      console.error("Error autenticando Token NPSSO:", err.message);
      throw new Error("El Token NPSSO ingresado ha expirado o es incorrecto. Vuelve a iniciar sesión en playstation.com y copia el nuevo npsso.");
    }
  }

  /**
   * Obtiene trofeos reales ganados desde PlayStation Network usando NPSSO Token y PSN ID
   */
  async getEarnedTrophiesForR6S(npssoToken, psnOnlineId) {
    try {
      const authorization = await this.getAccessTokenFromNpsso(npssoToken);
      const unlockedTrophiesMap = {};

      // 1. Intentar descubrir dinámicamente el NP Communication ID de la biblioteca del usuario
      let targetCommIds = [];
      try {
        const userTitles = await getUserTitles(authorization, "me");
        if (userTitles && userTitles.trophyTitles) {
          userTitles.trophyTitles.forEach(title => {
            const name = (title.trophyTitleName || '').toLowerCase();
            if (name.includes('rainbow') || name.includes('siege') || name.includes('six')) {
              if (title.npCommunicationId && !targetCommIds.includes(title.npCommunicationId)) {
                targetCommIds.push(title.npCommunicationId);
              }
            }
          });
        }
      } catch (e) {
        console.warn("No se pudieron listar títulos con me, usando fallbacks conocidos:", e.message);
      }

      // Si no se encontraron por búsqueda dinámica, usar IDs de comunicación conocidos de R6S
      if (targetCommIds.length === 0) {
        targetCommIds = R6S_FALLBACK_COMMUNICATION_IDS;
      }

      // 2. Consultar trofeos ganados para cada ID de comunicación
      for (const npCommId of targetCommIds) {
        try {
          const trophiesResult = await getUserTrophiesEarnedForTitle(
            authorization,
            "me",
            npCommId,
            "all"
          );

          if (trophiesResult && trophiesResult.trophies) {
            trophiesResult.trophies.forEach(t => {
              if (t.earned) {
                const nameClean = (t.trophyName || '').toLowerCase().trim();
                const matchedId = PSN_TROPHY_MAPPING[nameClean];
                if (matchedId) {
                  unlockedTrophiesMap[matchedId] = true;
                } else {
                  // Coincidencia por sub-cadena
                  Object.keys(PSN_TROPHY_MAPPING).forEach(key => {
                    if (nameClean.includes(key) || key.includes(nameClean)) {
                      unlockedTrophiesMap[PSN_TROPHY_MAPPING[key]] = true;
                    }
                  });
                }
              }
            });
          }
        } catch (err) {
          console.warn(`No se pudieron leer trofeos para ${npCommId}:`, err.message);
        }
      }

      const count = Object.keys(unlockedTrophiesMap).length;
      return {
        success: true,
        psnOnlineId: psnOnlineId || 'me',
        unlockedCount: count,
        unlockedTrophies: unlockedTrophiesMap,
        message: `¡Autenticación con PSN Exitosa! Se han sincronizado ${count} trofeos reales de tu cuenta de PlayStation.`
      };

    } catch (err) {
      return {
        success: false,
        message: err.message || "Error al conectar con la API oficial de PlayStation Network."
      };
    }
  }
}

module.exports = new OfficialPsnService();
