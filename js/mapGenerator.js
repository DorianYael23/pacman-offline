import { COLS, ROWS } from "./constants.js";
import { LEVELS, cloneMap } from "./maps.js";

const INFINITE_THEMES = [
    {
        label: "Voltio",
        bg: "#04111b",
        gridLine: "rgba(56, 189, 248, 0.08)",
        wallFill: "#0c2d48",
        wallInner: "#0284c7",
        wallStroke: "#38bdf8",
        glow: "rgba(56, 189, 248, 0.5)",
        dotColor: "#fef08a",
        accent: "#7dd3fc"
    },
    {
        label: "Plasma",
        bg: "#15051d",
        gridLine: "rgba(217, 70, 239, 0.08)",
        wallFill: "#3b0764",
        wallInner: "#9333ea",
        wallStroke: "#e879f9",
        glow: "rgba(217, 70, 239, 0.5)",
        dotColor: "#fde68a",
        accent: "#f0abfc"
    },
    {
        label: "Tóxico",
        bg: "#061508",
        gridLine: "rgba(132, 204, 22, 0.08)",
        wallFill: "#1a2e05",
        wallInner: "#4d7c0f",
        wallStroke: "#a3e635",
        glow: "rgba(132, 204, 22, 0.5)",
        dotColor: "#fef9c3",
        accent: "#bef264"
    },
    {
        label: "Magma",
        bg: "#1a0704",
        gridLine: "rgba(249, 115, 22, 0.09)",
        wallFill: "#431407",
        wallInner: "#c2410c",
        wallStroke: "#fb923c",
        glow: "rgba(249, 115, 22, 0.52)",
        dotColor: "#fef08a",
        accent: "#fdba74"
    },
    {
        label: "Ártico",
        bg: "#03131a",
        gridLine: "rgba(45, 212, 191, 0.08)",
        wallFill: "#134e4a",
        wallInner: "#0f766e",
        wallStroke: "#5eead4",
        glow: "rgba(45, 212, 191, 0.48)",
        dotColor: "#e0f2fe",
        accent: "#99f6e4"
    },
    {
        label: "Rubí",
        bg: "#1a040c",
        gridLine: "rgba(244, 63, 94, 0.08)",
        wallFill: "#4c0519",
        wallInner: "#be123c",
        wallStroke: "#fb7185",
        glow: "rgba(244, 63, 94, 0.5)",
        dotColor: "#fde68a",
        accent: "#fda4af"
    }
];

function isHouseProtected(c, r, gateCol, gateRow) {
    return Math.abs(c - gateCol) <= 3 && r >= gateRow - 1 && r <= gateRow + 3;
}

function getReachableSet(grid, startCol, startRow, treatSpikesAsBlocked = false) {
    const vis = new Set();
    const q = [[startCol, startRow]];
    vis.add(`${startCol},${startRow}`);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (q.length > 0) {
        const [c, r] = q.shift();
        for (const [dc, dr] of dirs) {
            const nc = (c + dc + COLS) % COLS;
            const nr = r + dr;
            if (nr < 0 || nr >= ROWS) continue;
            const cell = grid[nr][nc];
            if (cell === 1 || cell === 4) continue;
            if (treatSpikesAsBlocked && cell === 5) continue;
            const k = `${nc},${nr}`;
            if (!vis.has(k)) {
                vis.add(k);
                q.push([nc, nr]);
            }
        }
    }
    return vis;
}

function validateGeneratedMap(grid, pacmanSpawn) {
    const vis = getReachableSet(grid, pacmanSpawn.col, pacmanSpawn.row, true);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if ((cell === 0 || cell === 3) && !vis.has(`${c},${r}`)) return false;
            if (!vis.has(`${c},${r}`)) continue;

            let deg = 0;
            for (const [dc, dr] of dirs) {
                const nc = (c + dc + COLS) % COLS;
                const nr = r + dr;
                if (nr >= 0 && nr < ROWS && grid[nr][nc] !== 1 && grid[nr][nc] !== 4) deg++;
            }
            if (deg < 2) return false;

            if (
                r < ROWS - 1 &&
                c < COLS - 1 &&
                vis.has(`${c + 1},${r}`) &&
                vis.has(`${c},${r + 1}`) &&
                vis.has(`${c + 1},${r + 1}`)
            ) {
                return false;
            }
        }
    }
    return true;
}

export function placeSafeSpikes(grid, cfg, pairCount = 2) {
    const pSpawn = cfg.pacmanSpawn;
    const gate = cfg.ghostGate;
    const candidates = [];

    for (let r = 2; r < ROWS - 2; r++) {
        for (let c = 2; c <= 8; c++) {
            const mc = COLS - 1 - c;
            if (grid[r][c] !== 0 || grid[r][mc] !== 0) continue;
            if (isHouseProtected(c, r, gate.col, gate.row)) continue;
            if (Math.hypot(c - pSpawn.col, r - pSpawn.row) < 3.5) continue;
            candidates.push({ c, r, mc });
        }
    }

    // Mezclar candidatos
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    let placed = 0;
    const placedPos = [];

    for (const cand of candidates) {
        if (placed >= pairCount) break;
        const { c, r, mc } = cand;
        if (placedPos.some((p) => Math.hypot(p.c - c, p.r - r) < 4)) continue;

        grid[r][c] = 5;
        grid[r][mc] = 5;

        // Verificar que todos los puntos restantes sigan siendo 100% alcanzables SIN tocar espinas
        const vis = getReachableSet(grid, pSpawn.col, pSpawn.row, true);
        let allReachable = true;
        for (let rr = 1; rr < ROWS - 1 && allReachable; rr++) {
            for (let cc = 1; cc < COLS - 1; cc++) {
                if ((grid[rr][cc] === 0 || grid[rr][cc] === 3) && !vis.has(`${cc},${rr}`)) {
                    allReachable = false;
                    break;
                }
            }
        }

        if (allReachable) {
            placed++;
            placedPos.push({ c, r });
        } else {
            grid[r][c] = 0;
            grid[r][mc] = 0;
        }
    }
}

function buildProceduralGrid() {
    // Usar un mapa base del catálogo (niveles 2..10 que comparten ghostGate en 9,8)
    // y mutar simétricamente bloques internos de arriba y abajo manteniendo 0 dead-ends y 0 bloques 2x2
    const topDonor = LEVELS[1 + Math.floor(Math.random() * (LEVELS.length - 1))];
    const botDonor = LEVELS[1 + Math.floor(Math.random() * (LEVELS.length - 1))];
    const midDonor = LEVELS[1 + Math.floor(Math.random() * (LEVELS.length - 1))];

    const g = cloneMap(midDonor.map);

    // Combinar mitad superior (filas 1..6) y mitad inferior (filas 13..19) de distintos mapas
    for (let r = 1; r <= 6; r++) {
        g[r] = [...topDonor.map[r]];
    }
    for (let r = 13; r <= 19; r++) {
        g[r] = [...botDonor.map[r]];
    }

    // Mutaciones simétricas aleatorias seguras (agregar/quitar paredes pequeñas)
    const gateCol = 9;
    const gateRow = 8;
    const pSpawn = { col: 9, row: 15 };

    for (let tries = 0; tries < 28; tries++) {
        const r = 2 + Math.floor(Math.random() * (ROWS - 4));
        const c = 2 + Math.floor(Math.random() * 7);
        const mc = COLS - 1 - c;
        if (isHouseProtected(c, r, gateCol, gateRow)) continue;
        if (r === pSpawn.row && (c === pSpawn.col || mc === pSpawn.col)) continue;
        if (g[r][c] === 3 || g[r][mc] === 3) continue;

        const oldA = g[r][c];
        const oldB = g[r][mc];
        const nextVal = oldA === 1 ? 0 : 1;
        g[r][c] = nextVal;
        g[r][mc] = nextVal;

        if (!validateGeneratedMap(g, pSpawn)) {
            g[r][c] = oldA;
            g[r][mc] = oldB;
        }
    }

    return g;
}

export function generateInfiniteLevel(levelNumber, withSpikes = true) {
    const theme = INFINITE_THEMES[Math.floor(Math.random() * INFINITE_THEMES.length)];
    const pSpawn = { col: 9, row: 15 };
    const gate = { col: 9, row: 8 };

    let finalMap = null;
    for (let attempt = 0; attempt < 25; attempt++) {
        const candidate = buildProceduralGrid();
        if (validateGeneratedMap(candidate, pSpawn)) {
            finalMap = candidate;
            break;
        }
    }

    // Respaldo garantizado si ningún intento combinatorio pasó
    if (!finalMap) {
        const fallback = LEVELS[1 + Math.floor(Math.random() * (LEVELS.length - 1))];
        finalMap = cloneMap(fallback.map);
    }

    const cfg = {
        name: `Infinito #${levelNumber} - ${theme.label}`,
        isGenerated: true,
        theme: { ...theme },
        pacmanSpawn: { ...pSpawn },
        ghostGate: { ...gate },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: finalMap
    };

    if (withSpikes) {
        const pairCount = Math.min(3, 1 + Math.floor(levelNumber / 2));
        placeSafeSpikes(cfg.map, cfg, pairCount);
    }

    return cfg;
}
