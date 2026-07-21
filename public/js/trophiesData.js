// public/js/trophiesData.js
// Base de datos oficial y completa de trofeos de Rainbow Six Siege (PS4 y PS5)

const TROPHIES_DATA = [
  {
    id: "trophy_plat",
    title: "Maestro de Siege",
    originalTitle: "Siege Master",
    platform: "AMBOS",
    category: "Platinum",
    isComplex: true,
    description: "Consigue todos los demás trofeos del juego.",
    guideText: "Se desbloquea automáticamente al obtener el 100% de los trofeos de bronce, plata y oro en tu consola (PS4 o PS5). Usa esta guía y el contador de rondas para llevar un registro impecable.",
    tips: ["Revisa periódicamente el tracker de agentes para asegurar que no te dejes a ningún agente pionero."]
  },
  {
    id: "trophy_full_roster",
    title: "Plantilla Completa (Pioneros)",
    originalTitle: "Full Roster",
    platform: "AMBOS",
    category: "Gold",
    isComplex: true,
    description: "Juega al menos 10 rondas con cada uno de los 20 Agentes Pioneros en Partidas Rápidas o Clasificatorias.",
    guideText: "El trofeo estrella de acumulación. Debes jugar 10 rondas COMPLETAS (de principio a fin de la ronda) con cada uno de los 20 agentes base del juego (S.A.S., F.B.I. S.W.A.T., G.I.G.N., Spetsnaz y G.S.G. 9). Usa la tabla de la parte superior de esta página para ir marcando tus rondas exactamente.",
    tips: [
      "Cuenta solo si la ronda termina por victoria o derrota sin que te desconectes.",
      "Usa la sección 'Tracker de Agentes' para llevar tu conteo agente por agente."
    ]
  },
  {
    id: "trophy_jack_trades",
    title: "Maestro de Todo",
    originalTitle: "Jack of All Trades",
    platform: "AMBOS",
    category: "Gold",
    isComplex: true,
    description: "Gana 1 ronda con 10 Agentes Pioneros diferentes.",
    guideText: "Gana al menos una ronda con la mitad de los agentes iniciales. Se conseguirá de manera natural mientras buscas el trofeo 'Plantilla Completa'.",
    tips: ["Asegúrate de jugar en Partida Rápida o Clasificada para que el sistema registre la victoria."]
  },
  {
    id: "trophy_uat_sas",
    title: "Especialista S.A.S.",
    originalTitle: "S.A.S. Vanguard",
    platform: "AMBOS",
    category: "Silver",
    isComplex: false,
    description: "Juega 10 rondas con cada agente pionero de la UAT S.A.S. (Sledge, Thatcher, Smoke, Mute).",
    guideText: "Juega 10 rondas con los 4 miembros del SAS británico. En el tracker de agentes de esta app, completa las 10 rondas de Sledge, Thatcher, Smoke y Mute para desbloquear este hito.",
    tips: ["Sledge y Thatcher son excelentes para ataque; Mute y Smoke son fundamentales en defensa."]
  },
  {
    id: "trophy_uat_fbi",
    title: "Especialista F.B.I. S.W.A.T.",
    originalTitle: "F.B.I. SWAT Vanguard",
    platform: "AMBOS",
    category: "Silver",
    isComplex: false,
    description: "Juega 10 rondas con cada agente pionero del F.B.I. S.W.A.T. (Ash, Thermite, Castle, Pulse).",
    guideText: "Completa 10 rondas jugadas con Ash, Thermite, Castle y Pulse en cualquier modo multijugador.",
    tips: ["Thermite es clave para brecha dura en mapas como Consulado o Banco."]
  },
  {
    id: "trophy_uat_gign",
    title: "Especialista G.I.G.N.",
    originalTitle: "G.I.G.N. Vanguard",
    platform: "AMBOS",
    category: "Silver",
    isComplex: false,
    description: "Juega 10 rondas con cada agente pionero del G.I.G.N. (Twitch, Montagne, Doc, Rook).",
    guideText: "Completa 10 rondas jugadas con Twitch, Montagne, Doc y Rook.",
    tips: ["Rook te permite soltar placas de blindaje al segundo 1 de la ronda para asegurar apoyo en equipo."]
  },
  {
    id: "trophy_uat_spetsnaz",
    title: "Especialista Spetsnaz",
    originalTitle: "Spetsnaz Vanguard",
    platform: "AMBOS",
    category: "Silver",
    isComplex: false,
    description: "Juega 10 rondas con cada agente pionero de Spetsnaz (Glaz, Fuze, Kapkan, Tachanka).",
    guideText: "Completa 10 rondas jugadas con Glaz, Fuze, Kapkan y Tachanka.",
    tips: ["Fuze en bombas de piso superior es letal para limpiar dispositivos y enemigos."]
  },
  {
    id: "trophy_uat_gsg9",
    title: "Especialista G.S.G. 9",
    originalTitle: "G.S.G. 9 Vanguard",
    platform: "AMBOS",
    category: "Silver",
    isComplex: false,
    description: "Juega 10 rondas con cada agente pionero del G.S.G. 9 (Blitz, IQ, Jäger, Bandit).",
    guideText: "Completa 10 rondas jugadas con Blitz, IQ, Jäger y Bandit.",
    tips: ["Jäger y Bandit son dos de los defensores más populares e indispensables."]
  },
  {
    id: "trophy_meat_wall",
    title: "Paredes de carne",
    originalTitle: "Meat Wall",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: true,
    description: "Mata a un enemigo con una Carga de Demolición (Breaching Charge).",
    guideText: "Uno de los trofeos más míticos y complejos. Debes derribar a un enemigo (dejarlo en estado 'DBNO' o desangrándose) o colocar una carga en una pared desreforzada o suelo donde haya un enemigo herido y detonarla.",
    tips: [
      "Estrategia recomendada: Juega con un amigo en partida rápida. Derriba a un enemigo con disparos en las piernas, coloca una carga de demolición justo al lado de su cuerpo herido en el suelo y detónala.",
      "También puedes usar a Thermite/Carga estándar en una pared blanda si notas que hay un defensor pegado haciendo 'anchor'."
    ]
  },
  {
    id: "trophy_bang_bang",
    title: "Bang-Bang",
    originalTitle: "Bang Bang",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: true,
    description: "Consigue una baja atravesando una pared destructible con disparos (Penetración de bala).",
    guideText: "Mata a un objetivo enemigo disparando a través de una superficie blanda (madera, pared no reforzada, ventana de madera).",
    tips: [
      "Usa a Pulse o IQ en defensa/ataque para detectar a los enemigos detrás de paredes o barricadas y dispara directo a través de la pared.",
      "Los drones de observación te permiten marcar a un enemigo detrás de una pared y hacer spray & pray."
    ]
  },
  {
    id: "trophy_perfectionist",
    title: "Perfeccionista",
    originalTitle: "Perfectionist",
    platform: "AMBOS",
    category: "Gold",
    isComplex: true,
    description: "Gana una partida clasificatoria sin perder ni una sola ronda (Partida Flawless 4-0).",
    guideText: "Gana una partida en el modo Clasificatoria (Ranked) o Estándar/Unranked con un marcador perfecto de 4 a 0 victorias consecutivas.",
    tips: [
      "Juega en escuadra de 5 personas comunicándoos con micrófono.",
      "Asegúrate de llevar siempre un brechador duro (Thermite/Ace) y anti-dispositivos (Thatcher/Kali/Twitch)."
    ]
  },
  {
    id: "trophy_designer",
    title: "Diseñador de Interiores",
    originalTitle: "Interior Designer",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: false,
    description: "Destruye 27 paredes desreforzadas en partidas multijugador.",
    guideText: "Usa cargas de demolición, escopetas o habilidades de agentes como Sledge, Buck, Ash o Zofia para abrir brechas en paredes de madera.",
    tips: ["Con Sledge puedes romper hasta 25 paredes por partida con su martillo de demolición."]
  },
  {
    id: "trophy_blind_ambition",
    title: "Cita a Ciegas",
    originalTitle: "Blind Ambition",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: true,
    description: "Consigue 5 bajas sobre enemigos desorientados o cegados.",
    guideText: "Elimina a enemigos bajo el efecto de granadas cegadoras, el escudo de Blitz o los dispositivos de agentes como Ying.",
    tips: [
      "Juega con Blitz o Ying. Lanza granadas cegadoras a una habitación cerrada y entra a rematar.",
      "También cuentan las cegadoras lanzadas a defensores atrapados en esquinas."
    ]
  },
  {
    id: "trophy_impenetrable",
    title: "Inexpugnable",
    originalTitle: "Impenetrable",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: false,
    description: "Bloquea daño 150 veces usando un Escudo Balístico.",
    guideText: "Recibe e impacta balas enemigas en tu escudo desplegable o balístico jugando como Montagne, Blitz, Fuze con escudo o Clash.",
    tips: ["Montagne con su escudo extendido en una puerta atrae fuego enemigo masivo en segundos."]
  },
  {
    id: "trophy_brotherhood",
    title: "Hermandad",
    originalTitle: "Brothers in Arms",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: false,
    description: "Reanima a un compañero caído 10 veces en partidas multijugador.",
    guideText: "Levanta a tus aliados cuando estén en estado derribado (DBNO - Down But Not Out).",
    tips: ["Doc puede reanimar a distancia usando su pistola estimulante DART."]
  },
  {
    id: "trophy_rank_gold",
    title: "A Tiro Fino",
    originalTitle: "Good as Gold",
    platform: "AMBOS",
    category: "Gold",
    isComplex: true,
    description: "Alcanza el rango Oro en el modo Clasificatorio (Ranked).",
    guideText: "Sube de rango en la tabla clasificatoria hasta alcanzar Oro V o superior durante una temporada competitiva.",
    tips: [
      "Juega con tu escuadra habitual.",
      "Si estás en PS5 o PS4 en la lista actualizada, también se puede cumplir completando las partidas de posicionamiento o ganando partidas clasificatorias."
    ]
  },
  {
    id: "trophy_death_from_above",
    title: "Muerte desde las Alturas",
    originalTitle: "Death from Above",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: false,
    description: "Destruye un suelo o escotilla destructible por encima del objetivo.",
    guideText: "Abre trampas (hatches) de madera con cargas de demolición o escopetas y elimina a defensores desde el piso superior.",
    tips: ["Sledge o cargas duras en escotillas son ideales."]
  },
  {
    id: "trophy_ps4_terro_2500",
    title: "[Exclusivo PS4 Original] Cazador de Maravillas",
    originalTitle: "Master (Legacy Terrorist Hunt)",
    platform: "PS4",
    category: "Gold",
    isComplex: true,
    description: "Consigue 2500 bajas en el modo Caza del Terrorista (Lista de trofeos antigua de PS4).",
    guideText: "Nota para usuarios de PS4 física / antigua lista: Si estás jugando la versión original de PS4 previa al parche de trofeos, este trofeo requiere 2500 eliminaciones en el modo PVE. En parches modernos y en PS5 este trofeo fue reemplazado por logros multijugador.",
    tips: ["Aplica únicamente en consolas PS4 jugando versiones anteriores o partidas contra IA si tu lista no ha sido actualizada."]
  },
  {
    id: "trophy_ps4_protect_hostage",
    title: "[Exclusivo PS4 Original] Inamovible",
    originalTitle: "Camper (Legacy)",
    platform: "PS4",
    category: "Gold",
    isComplex: true,
    description: "Gana 100 partidas de Defensa del Rehén en Caza del Terrorista (PS4 Antigua).",
    guideText: "Trofeo clásico de grind masivo de la primera lista de trofeos de PS4. Si tu consola está actualizada o juegas en PS5, esta tarea se sustituyó por ganar rondas en multijugador.",
    tips: ["Usar a Mute o Doc con armas secundarias rápidas en mapas pequeños como Casa (House)."]
  },
  {
    id: "trophy_ps5_precision",
    title: "[PS5 / Versión Actualizada] Precisión Táctica",
    originalTitle: "Tactical Precision",
    platform: "PS5",
    category: "Silver",
    isComplex: false,
    description: "Consigue 50 bajas a la cabeza (Headshots) en partidas multijugador.",
    guideText: "Logra 50 bajas apuntando a la cabeza de los operadores enemigos en cualquier modo PvP.",
    tips: ["Mantén la mira siempre a la altura de la cabeza al doblar esquinas."]
  },
  {
    id: "trophy_gadget_destroyer",
    title: "Sin Comunicaciones",
    originalTitle: "Zero Signals",
    platform: "AMBOS",
    category: "Bronze",
    isComplex: false,
    description: "Destruye 20 dispositivos o cámaras enemigas.",
    guideText: "Usa el dron de Twitch, el escáner de IQ o tus disparos para romper cámaras de mapa y dispositivos de defensa como inhibidores de Mute o baterías de Bandit.",
    tips: ["IQ detecta todos los electrónicos a través de paredes."]
  }
];
