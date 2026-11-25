export const TILE = 24;
export const COLS = 19;
export const ROWS = 21;

export const DIRS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

export const SCATTER_CORNERS = {
    chaser: { col: COLS - 2, row: 0 },         // Blinky: arriba-derecha
    ambusher: { col: 1, row: 0 },              // Pinky: arriba-izquierda
    flanker: { col: COLS - 2, row: ROWS - 1 }, // Inky: abajo-derecha
    clyde: { col: 1, row: ROWS - 1 }           // Clyde: abajo-izquierda
};

export const SAVE_KEY = "pacman_offline_savestate";
export const HIGHSCORES_KEY = "pacman_offline_highscores";
export const LEGACY_HIGHSCORE_KEY = "pacman_offline_highscore";
export const SKIN_KEY = "pacman_offline_skin";
export const ACCESSORY_KEY = "pacman_offline_accessory";
export const TRAIL_KEY = "pacman_offline_trail";
export const EXTRA_LIFE_STEP = 10000;
export const START_LIVES = 5;
export const MAX_LIVES = 6;
export const DASH_DURATION = 1.45;
export const FRUIT_MILESTONES = [35, 85];
export const ITEM_MILESTONES = [22, 65, 110];
export const CONTROL_MODES = ["SWIPE", "JOYSTICK", "DPAD"];

export const PACMAN_SKINS = [
    { id: "classic", name: "Clásico", color: "#facc15", dashColor: "#fef08a", trailRgb: "250, 204, 21" },
    { id: "cyber", name: "Ciber Neón", color: "#22d3ee", dashColor: "#a5f3fc", trailRgb: "34, 211, 238" },
    { id: "magenta", name: "Neón Rosa", color: "#f472b6", dashColor: "#fbcfe8", trailRgb: "244, 114, 182" },
    { id: "emerald", name: "Esmeralda", color: "#4ade80", dashColor: "#bbf7d0", trailRgb: "74, 222, 128" },
    { id: "inferno", name: "Fuego", color: "#fb923c", dashColor: "#fed7aa", trailRgb: "251, 146, 60" },
    { id: "crimson", name: "Carmesí", color: "#ef4444", dashColor: "#fecaca", trailRgb: "239, 68, 68" },
    { id: "violet", name: "Ultravioleta", color: "#a855f7", dashColor: "#e9d5ff", trailRgb: "168, 85, 247" },
    { id: "ice", name: "Glacial", color: "#f8fafc", dashColor: "#e0f2fe", trailRgb: "224, 242, 254" },
    { id: "obsidian", name: "Sombra Neón", color: "#0f172a", strokeColor: "#38bdf8", dashColor: "#38bdf8", trailRgb: "56, 189, 248" },
    { id: "prism", name: "Prisma", color: "RAINBOW", dashColor: "#ffffff", trailRgb: "192, 132, 252" }
];

export const PACMAN_ACCESSORIES = [
    { id: "none", name: "Sin accesorio", icon: "🚫" },
    { id: "shades", name: "Lentes Cool", icon: "🕶️" },
    { id: "crown", name: "Corona", icon: "👑" },
    { id: "cap", name: "Gorra", icon: "🧢" },
    { id: "bow", name: "Moño", icon: "🎀" },
    { id: "halo", name: "Aura", icon: "😇" },
    { id: "horns", name: "Cuernos", icon: "😈" },
    { id: "headphones", name: "Audífonos", icon: "🎧" },
    { id: "tophat", name: "Sombrero", icon: "🎩" },
    { id: "bandana", name: "Bandana", icon: "🥷" }
];

export const PACMAN_TRAILS = [
    { id: "classic", name: "Normal", icon: "💨" },
    { id: "glow", name: "Aura Neón", icon: "🌟" },
    { id: "sparks", name: "Chispas", icon: "✨" },
    { id: "pixel", name: "Retro", icon: "🟦" },
    { id: "fire", name: "Fuego", icon: "🔥" }
];

export function getWaveSchedule(lvl) {
    if (lvl === 1) {
        return [
            { mode: "SCATTER", dur: 7 },
            { mode: "CHASE", dur: 20 },
            { mode: "SCATTER", dur: 7 },
            { mode: "CHASE", dur: 20 },
            { mode: "SCATTER", dur: 5 },
            { mode: "CHASE", dur: 20 },
            { mode: "SCATTER", dur: 5 },
            { mode: "CHASE", dur: Infinity }
        ];
    }
    if (lvl <= 4) {
        return [
            { mode: "SCATTER", dur: 7 },
            { mode: "CHASE", dur: 20 },
            { mode: "SCATTER", dur: 7 },
            { mode: "CHASE", dur: 20 },
            { mode: "SCATTER", dur: 5 },
            { mode: "CHASE", dur: Infinity }
        ];
    }
    return [
        { mode: "SCATTER", dur: 5 },
        { mode: "CHASE", dur: 20 },
        { mode: "SCATTER", dur: 5 },
        { mode: "CHASE", dur: 20 },
        { mode: "SCATTER", dur: 4 },
        { mode: "CHASE", dur: Infinity }
    ];
}

export function tileCenter(col, row) {
    return {
        x: col * TILE + TILE / 2,
        y: row * TILE + TILE / 2
    };
}

export function posToTile(x, y) {
    return {
        col: Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE))),
        row: Math.max(0, Math.min(ROWS - 1, Math.floor(y / TILE)))
    };
}

export function dirToKey(dir) {
    if (!dir) return "NONE";
    if (dir.x === 0 && dir.y === -1) return "UP";
    if (dir.x === 0 && dir.y === 1) return "DOWN";
    if (dir.x === -1 && dir.y === 0) return "LEFT";
    if (dir.x === 1 && dir.y === 0) return "RIGHT";
    return "NONE";
}

export function keyToDir(key) {
    return DIRS[key] || DIRS.NONE;
}
