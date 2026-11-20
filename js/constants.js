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
export const EXTRA_LIFE_STEP = 10000;
export const START_LIVES = 5;
export const MAX_LIVES = 6;
export const DASH_DURATION = 1.45;
export const FRUIT_MILESTONES = [35, 85];
export const ITEM_MILESTONES = [22, 65, 110];
export const CONTROL_MODES = ["SWIPE", "JOYSTICK", "DPAD"];

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
