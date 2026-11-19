const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlaySubEl = document.getElementById("overlay-subtitle");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const muteBtn = document.getElementById("mute-btn");
const controlModeBtn = document.getElementById("control-mode-btn");
const dashBtn = document.getElementById("dash-btn");
const joystickZone = document.getElementById("joystick-zone");
const dpadZone = document.getElementById("dpad-zone");
const pauseLabelEl = document.getElementById("pause-label");
const muteLabelEl = document.getElementById("mute-label");
const controlLabelEl = document.getElementById("control-label");
const dashBarFillEl = document.getElementById("dash-bar-fill");
const dashReadyTagEl = document.getElementById("dash-ready-tag");
const comboBadgeEl = document.getElementById("combo-badge");
const powerBadgesEl = document.getElementById("power-badges");

const TILE = 24;
const COLS = 19;
const ROWS = 21;

const DIRS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// 1 = Pared, 0 = Punto, 2 = Vacío, 3 = Super Punto, 4 = Puerta Fantasmas
const LEVELS = [
    {
        name: "Nivel 1 - Clásico Neón",
        theme: {
            bg: "#050918",
            gridLine: "rgba(59, 130, 246, 0.08)",
            wallFill: "#10214a",
            wallInner: "#1d4ed8",
            wallStroke: "#60a5fa",
            glow: "rgba(59, 130, 246, 0.45)",
            dotColor: "#fde68a",
            accent: "#38bdf8"
        },
        pacmanSpawn: { col: 9, row: 16 },
        ghostGate: { col: 9, row: 9 },
        ghostSpawns: [
            { col: 9, row: 8, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 10, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 10, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 10, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
            [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
            [1, 1, 1, 1, 0, 1, 2, 1, 1, 4, 1, 1, 2, 1, 0, 1, 1, 1, 1],
            [2, 2, 2, 2, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 0, 2, 2, 2, 2],
            [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
            [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
            [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 3, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 3, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        name: "Nivel 2 - Ciber Púrpura",
        theme: {
            bg: "#0d061a",
            gridLine: "rgba(192, 132, 252, 0.08)",
            wallFill: "#2a0e54",
            wallInner: "#7e22ce",
            wallStroke: "#d8b4fe",
            glow: "rgba(168, 85, 247, 0.48)",
            dotColor: "#fbcfe8",
            accent: "#f472b6"
        },
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 2, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 3, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        name: "Nivel 3 - Fortaleza Esmeralda",
        theme: {
            bg: "#03140f",
            gridLine: "rgba(16, 185, 129, 0.08)",
            wallFill: "#064030",
            wallInner: "#047857",
            wallStroke: "#34d399",
            glow: "rgba(16, 185, 129, 0.45)",
            dotColor: "#fef08a",
            accent: "#2dd4bf"
        },
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
            [2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 4, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 1, 2, 2, 2, 2, 2, 1, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 3, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        name: "Nivel 4 - Núcleo Solar",
        theme: {
            bg: "#160a03",
            gridLine: "rgba(251, 146, 60, 0.08)",
            wallFill: "#431705",
            wallInner: "#c2410c",
            wallStroke: "#fbbf24",
            glow: "rgba(245, 158, 11, 0.48)",
            dotColor: "#fef3c7",
            accent: "#fb923c"
        },
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
            [2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 2, 1, 1, 4, 1, 1, 2, 0, 1, 1, 1, 0, 1],
            [2, 0, 0, 0, 0, 0, 2, 1, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0, 2],
            [1, 0, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        name: "Nivel 5 - Espiral Carmesí",
        theme: {
            bg: "#18040c",
            gridLine: "rgba(244, 63, 94, 0.08)",
            wallFill: "#4a081e",
            wallInner: "#be123c",
            wallStroke: "#fb7185",
            glow: "rgba(244, 63, 94, 0.48)",
            dotColor: "#fde68a",
            accent: "#fda4af"
        },
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [1, 0, 1, 1, 1, 0, 2, 1, 1, 4, 1, 1, 2, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 2, 1, 2, 2, 2, 1, 2, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [1, 3, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },
    {
        name: "Nivel 6 - Abismo Cian",
        theme: {
            bg: "#03121a",
            gridLine: "rgba(6, 182, 212, 0.09)",
            wallFill: "#083344",
            wallInner: "#0e7490",
            wallStroke: "#22d3ee",
            glow: "rgba(34, 211, 238, 0.48)",
            dotColor: "#e0f2fe",
            accent: "#67e8f9"
        },
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser", name: "Blinky" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher", name: "Pinky" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker", name: "Inky" },
            { col: 10, row: 9, color: "#fb923c", type: "clyde", name: "Clyde" }
        ],
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1],
            [2, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 2],
            [1, 1, 1, 0, 1, 0, 2, 1, 1, 4, 1, 1, 2, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 2, 1, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 3, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    }
];

// Esquinas oficiales de Scatter para cada personalidad
const SCATTER_CORNERS = {
    chaser: { col: COLS - 2, row: 0 },       // Blinky: arriba-derecha
    ambusher: { col: 1, row: 0 },            // Pinky: arriba-izquierda
    flanker: { col: COLS - 2, row: ROWS - 1 }, // Inky: abajo-derecha
    clyde: { col: 1, row: ROWS - 1 }         // Clyde: abajo-izquierda
};

// Ciclos clásicos de Scatter / Chase del Pac-Man original
function getWaveSchedule(lvl) {
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

// Motor de audio offline híbrido (MP3 reales + síntesis arcade)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.chompToggle = false;
        this.samples = {};

        this.introOscs = [];
        this.introGain = null;
        this.introPlaying = false;
        this.introLoopTimer = null;

        this.bgOsc = null;
        this.bgLfo = null;
        this.bgLfoGain = null;
        this.bgGain = null;
        this.bgBaseVol = 0.042;
        this.isDucked = false;

        this.powerBuffer = null;
        this.powerSource = null;
        this.powerGain = null;
        this.powerFallbackAudio = null;
        this.duckTimer = null;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();

        this.loadSamples();
    }

    sliceAndTrimBuffer(buffer, startIdx, endIdx) {
        const chData = buffer.getChannelData(0);
        const threshold = 0.015;
        let s = startIdx;
        let e = endIdx;

        while (s < e && Math.abs(chData[s]) < threshold) s++;
        while (e > s && Math.abs(chData[e]) < threshold) e--;

        const len = Math.max(1, e - s + 1);
        const out = this.ctx.createBuffer(buffer.numberOfChannels, len, buffer.sampleRate);
        for (let c = 0; c < buffer.numberOfChannels; c++) {
            out.copyToChannel(buffer.getChannelData(c).subarray(s, s + len), c);
        }
        return out;
    }

    async preparePowerBuffer() {
        if (!this.ctx) return;
        try {
            const res = await fetch("./sounds/power.mp3");
            if (!res.ok) return;
            const arrayBuf = await res.arrayBuffer();
            const decoded = await this.ctx.decodeAudioData(arrayBuf);
            this.powerBuffer = this.sliceAndTrimBuffer(decoded, 0, decoded.length - 1);
        } catch (_) { }
    }

    loadSamples() {
        const names = ["power", "eatghost", "fruit", "death"];
        for (const name of names) {
            const audio = new Audio(`./sounds/${name}.mp3`);
            audio.preload = "auto";
            audio.addEventListener(
                "canplaythrough",
                () => {
                    this.samples[name] = audio;
                },
                { once: true }
            );
        }
        this.preparePowerBuffer();
    }

    playSample(name) {
        if (this.muted || !this.samples[name]) return false;
        const clone = this.samples[name].cloneNode();
        clone.volume = 0.65;
        clone.play().catch(() => { });
        return true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    duckSirens(ms = 185) {
        clearTimeout(this.duckTimer);
        this.isDucked = true;

        if (this.bgGain && this.ctx) {
            this.bgGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.008);
        }
        if (this.powerGain && this.ctx) {
            this.powerGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.008);
        }
        if (this.powerFallbackAudio) {
            this.powerFallbackAudio.volume = 0;
        }

        this.duckTimer = setTimeout(() => {
            this.isDucked = false;
            if (this.muted) return;

            if (this.bgGain && this.ctx) {
                this.bgGain.gain.setTargetAtTime(this.bgBaseVol, this.ctx.currentTime, 0.025);
            }
            if (this.powerGain && this.ctx) {
                this.powerGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.015);
            }
            if (this.powerFallbackAudio) {
                this.powerFallbackAudio.volume = 0.5;
            }
        }, ms);
    }

    startBgSiren(progress = 0) {
        if (this.muted || !this.ctx || this.bgOsc) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const masterGain = this.ctx.createGain();

        osc.type = "triangle";
        lfo.type = "sine";

        const baseFreq = 112 + progress * 65;
        const lfoRate = 1.65 + progress * 2.1;
        const depth = 20 + progress * 14;

        osc.frequency.setValueAtTime(baseFreq, now);
        lfo.frequency.setValueAtTime(lfoRate, now);
        lfoGain.gain.setValueAtTime(depth, now);
        masterGain.gain.setValueAtTime(this.isDucked ? 0 : this.bgBaseVol, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        osc.start(now);
        lfo.start(now);

        this.bgOsc = osc;
        this.bgLfo = lfo;
        this.bgLfoGain = lfoGain;
        this.bgGain = masterGain;
    }

    updateBgSiren(progress) {
        if (!this.bgOsc || !this.bgLfo || !this.bgLfoGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        this.bgOsc.frequency.setTargetAtTime(112 + progress * 65, now, 0.2);
        this.bgLfo.frequency.setTargetAtTime(1.65 + progress * 2.1, now, 0.2);
        this.bgLfoGain.gain.setTargetAtTime(20 + progress * 14, now, 0.2);
    }

    stopBgSiren() {
        if (this.bgOsc) {
            try {
                this.bgOsc.stop();
                this.bgOsc.disconnect();
            } catch (_) { }
            this.bgOsc = null;
        }
        if (this.bgLfo) {
            try {
                this.bgLfo.stop();
                this.bgLfo.disconnect();
            } catch (_) { }
            this.bgLfo = null;
        }
        this.bgLfoGain = null;
        this.bgGain = null;
    }

    sweep(startFreq, endFreq, duration, type = "triangle", vol = 0.09, delay = 0) {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    intro() {
        this.init();
        if (this.muted || !this.ctx || this.introPlaying) return;

        const begin = () => {
            if (this.muted || this.introPlaying || state !== "MENU") return;
            if (!this.ctx || this.ctx.state !== "running") return;
            this.stopIntro();
            this.introPlaying = true;
            this.scheduleIntroCycle();
        };

        if (this.ctx.state === "running") {
            begin();
        } else {
            this.ctx.resume().then(begin).catch(() => { });
        }
    }

    scheduleIntroCycle() {
        if (!this.introPlaying || this.muted || !this.ctx) return;

        // Limpiar osciladores del ciclo anterior
        for (const osc of this.introOscs) {
            try {
                osc.stop();
                osc.disconnect();
            } catch (_) { }
        }
        this.introOscs = [];

        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.065, this.ctx.currentTime);
        masterGain.connect(this.ctx.destination);
        this.introGain = masterGain;

        const notes = [
            [493.88, 0.00, 0.11], [987.77, 0.13, 0.11], [739.99, 0.26, 0.11], [622.25, 0.39, 0.11],
            [987.77, 0.52, 0.08], [739.99, 0.61, 0.16], [622.25, 0.80, 0.22],
            [523.25, 1.06, 0.11], [1046.50, 1.19, 0.11], [783.99, 1.32, 0.11], [659.25, 1.45, 0.11],
            [1046.50, 1.58, 0.08], [783.99, 1.67, 0.16], [659.25, 1.86, 0.22],
            [493.88, 2.12, 0.11], [987.77, 2.25, 0.11], [739.99, 2.38, 0.11], [622.25, 2.51, 0.11],
            [987.77, 2.64, 0.08], [739.99, 2.73, 0.16], [622.25, 2.92, 0.22],
            [622.25, 3.18, 0.07], [659.25, 3.26, 0.07], [698.46, 3.34, 0.11],
            [698.46, 3.48, 0.07], [739.99, 3.56, 0.07], [783.99, 3.64, 0.11],
            [783.99, 3.78, 0.07], [830.61, 3.86, 0.07], [880.00, 3.94, 0.11],
            [987.77, 4.08, 0.24]
        ];

        const baseTime = this.ctx.currentTime;
        notes.forEach(([freq, delay, dur]) => {
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, baseTime + delay);

            noteGain.gain.setValueAtTime(0.001, baseTime + delay);
            noteGain.gain.linearRampToValueAtTime(1, baseTime + delay + 0.008);
            noteGain.gain.exponentialRampToValueAtTime(0.01, baseTime + delay + dur);

            osc.connect(noteGain);
            noteGain.connect(masterGain);

            osc.start(baseTime + delay);
            osc.stop(baseTime + delay + dur + 0.01);
            this.introOscs.push(osc);
        });

        clearTimeout(this.introLoopTimer);
        this.introLoopTimer = setTimeout(() => {
            if (this.introPlaying && !this.muted && state === "MENU") {
                this.scheduleIntroCycle();
            } else {
                this.introPlaying = false;
            }
        }, 4450);
    }

    stopIntro() {
        this.introPlaying = false;
        clearTimeout(this.introLoopTimer);
        this.introLoopTimer = null;
        if (this.introGain && this.ctx) {
            try {
                this.introGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.introGain.gain.setValueAtTime(0, this.ctx.currentTime);
            } catch (_) { }
            this.introGain = null;
        }
        for (const osc of this.introOscs) {
            try {
                osc.stop();
                osc.disconnect();
            } catch (_) { }
        }
        this.introOscs = [];
    }

    chomp(pitchBoost = 1) {
        if (this.muted || !this.ctx) return;
        this.chompToggle = !this.chompToggle;

        const now = this.ctx.currentTime;
        const dur = 0.08;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        filter.type = "bandpass";
        filter.Q.value = 3.5;

        if (this.chompToggle) {
            osc.frequency.setValueAtTime(190 * pitchBoost, now);
            osc.frequency.exponentialRampToValueAtTime(340 * pitchBoost, now + dur);
            filter.frequency.setValueAtTime(350 * pitchBoost, now);
            filter.frequency.exponentialRampToValueAtTime(950 * pitchBoost, now + dur);
        } else {
            osc.frequency.setValueAtTime(340 * pitchBoost, now);
            osc.frequency.exponentialRampToValueAtTime(160 * pitchBoost, now + dur);
            filter.frequency.setValueAtTime(950 * pitchBoost, now);
            filter.frequency.exponentialRampToValueAtTime(300 * pitchBoost, now + dur);
        }

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
    }

    dash() {
        this.sweep(260, 880, 0.16, "sawtooth", 0.08, 0);
        this.sweep(520, 1240, 0.14, "triangle", 0.07, 0.05);
    }

    freeze() {
        this.sweep(1200, 620, 0.14, "sine", 0.09, 0);
        this.sweep(960, 1520, 0.18, "triangle", 0.08, 0.08);
    }

    magnet() {
        this.sweep(300, 680, 0.15, "sine", 0.09, 0);
        this.sweep(440, 920, 0.16, "triangle", 0.08, 0.1);
    }

    shield() {
        this.sweep(392, 587, 0.12, "triangle", 0.09, 0);
        this.sweep(587, 880, 0.18, "triangle", 0.09, 0.08);
    }

    shieldBreak() {
        this.duckSirens(260);
        this.sweep(640, 140, 0.24, "sawtooth", 0.12, 0);
        this.sweep(880, 320, 0.2, "square", 0.08, 0.04);
    }

    extraLife() {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((f, i) => {
            this.sweep(f, f * 1.03, 0.11, "triangle", 0.1, i * 0.075);
        });
    }

    startPowerLoop() {
        this.stopBgSiren();
        this.stopPowerLoop();
        if (this.muted) return;

        if (this.powerBuffer && this.ctx) {
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            src.buffer = this.powerBuffer;
            src.loop = true;
            gain.gain.value = 0.5;
            src.connect(gain);
            gain.connect(this.ctx.destination);
            src.start();
            this.powerSource = src;
            this.powerGain = gain;
            return;
        }

        if (this.samples["power"]) {
            const audio = this.samples["power"];
            audio.loop = true;
            audio.volume = 0.5;
            audio.currentTime = 0;
            audio.play().catch(() => { });
            this.powerFallbackAudio = audio;
            return;
        }

        this.sweep(360, 720, 0.12, "square", 0.07, 0);
        this.sweep(420, 840, 0.14, "square", 0.07, 0.12);
    }

    stopPowerLoop() {
        if (this.powerSource) {
            try {
                this.powerSource.stop();
                this.powerSource.disconnect();
            } catch (_) { }
            this.powerSource = null;
            this.powerGain = null;
        }
        if (this.powerFallbackAudio) {
            this.powerFallbackAudio.pause();
            this.powerFallbackAudio.currentTime = 0;
            this.powerFallbackAudio.loop = false;
            this.powerFallbackAudio = null;
        }
    }

    stopAllLoops() {
        clearTimeout(this.duckTimer);
        this.isDucked = false;
        this.stopBgSiren();
        this.stopPowerLoop();
    }

    eatGhost() {
        this.duckSirens(350);
        if (this.playSample("eatghost")) return;
        this.sweep(220, 980, 0.28, "sawtooth", 0.1);
    }

    fruit() {
        if (this.playSample("fruit")) return;
        this.sweep(520, 780, 0.1, "triangle", 0.1, 0);
        this.sweep(660, 1040, 0.16, "triangle", 0.1, 0.1);
    }

    die() {
        this.stopAllLoops();
        if (this.playSample("death")) return;
        const drops = [560, 510, 460, 410, 360, 310, 260, 210];
        drops.forEach((f, i) => {
            this.sweep(f, f * 0.72, 0.09, "sawtooth", 0.08, i * 0.095);
        });
        this.sweep(180, 420, 0.08, "square", 0.08, 0.82);
        this.sweep(180, 480, 0.11, "square", 0.08, 0.93);
    }

    win() {
        this.stopAllLoops();
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            this.sweep(f, f, 0.15, "triangle", 0.1, i * 0.13);
        });
    }
}

const sound = new SoundEngine();

// Estado global del juego
let grid = [];
let score = 0;
let highScore = Number(localStorage.getItem("pacman_offline_highscore") || 0);
const START_LIVES = 5;
const MAX_LIVES = 6;
let level = 1;
let lives = START_LIVES;
let nextExtraLifeScore = 5000;
let totalDotsInLevel = 1;
let dotsRemaining = 0;
let dotsEatenInLevel = 0;
let dotsSinceLifeStart = 0;
let ghostHouseTimer = 0;

// MENU, READY, PLAYING, PAUSED, DYING, LEVEL_CLEAR, GAME_OVER
let state = "MENU";
let stateTimer = 0;

// Modos clásicos de fantasmas (Scatter / Chase)
let waveSchedule = [];
let waveIndex = 0;
let waveTimer = 0;
let globalGhostMode = "SCATTER";

let frightenedTimer = 0;
let ghostCombo = 0;

// Mecánicas nuevas: Turbo Dash, Combo Streak, Power-Ups, Juice
let dashEnergy = 0; // 0..100
let dashTimer = 0;  // >0 cuando el turbo está activo
const DASH_DURATION = 1.45;
let dashTrail = [];

let dotStreak = 0;
let comboTimer = 0;
let comboMultiplier = 1;

let freezeTimer = 0;
let magnetTimer = 0;
let shieldActive = false;
let invulnTimer = 0;

let bonusFruit = null; // { x, y, timer, points }
let nextFruitMilestoneIdx = 0;
const FRUIT_MILESTONES = [35, 85];

let activePowerItem = null; // { type, x, y, timer }
let nextItemMilestoneIdx = 0;
let lifeSpawnedInLevel = false;
const ITEM_MILESTONES = [22, 65, 110];

let floatingTexts = [];
let particles = [];
let shockwaves = [];
let screenShake = 0;

let lastTime = 0;
let animTick = 0;
let lastVibrateAt = 0;

const CONTROL_MODES = ["SWIPE", "JOYSTICK", "DPAD"];
let controlMode = localStorage.getItem("pacman_offline_control") || "SWIPE";
if (!CONTROL_MODES.includes(controlMode)) controlMode = "SWIPE";

let pacman = {};
let ghosts = [];

highScoreEl.textContent = highScore;
overlaySubEl.textContent = "Desliza el dedo, usa Joystick, Cruceta o Flechas • Doble toque = Turbo";

function vibrateShort(ms = 8) {
    const now = performance.now();
    if (now - lastVibrateAt < 55) return;
    lastVibrateAt = now;
    if (navigator.vibrate) {
        try {
            navigator.vibrate(ms);
        } catch (_) { }
    }
}

function setNextDirection(dir) {
    if (!dir || (dir.x === 0 && dir.y === 0)) return;
    if (!pacman.nextDir || pacman.nextDir.x !== dir.x || pacman.nextDir.y !== dir.y) {
        pacman.nextDir = dir;
        vibrateShort(7);
    }
}

function getLevelProgress() {
    return Math.min(1, Math.max(0, 1 - dotsRemaining / Math.max(1, totalDotsInLevel)));
}

function applyControlMode(mode) {
    controlMode = mode;
    localStorage.setItem("pacman_offline_control", mode);

    joystickZone.classList.toggle("hidden", mode !== "JOYSTICK");
    dpadZone.classList.toggle("hidden", mode !== "DPAD");

    if (mode === "JOYSTICK") {
        controlLabelEl.textContent = "Joystick";
        controlModeBtn.classList.add("is-alt");
    } else if (mode === "DPAD") {
        controlLabelEl.textContent = "Cruceta";
        controlModeBtn.classList.add("is-alt");
    } else {
        controlLabelEl.textContent = "Dedo";
        controlModeBtn.classList.remove("is-alt");
    }
}

applyControlMode(controlMode);

controlModeBtn.addEventListener("click", () => {
    const idx = CONTROL_MODES.indexOf(controlMode);
    applyControlMode(CONTROL_MODES[(idx + 1) % CONTROL_MODES.length]);
});

function cloneMap(map) {
    return map.map((row) => [...row]);
}

function getLevelConfig() {
    return LEVELS[(level - 1) % LEVELS.length];
}

function tileCenter(col, row) {
    return {
        x: col * TILE + TILE / 2,
        y: row * TILE + TILE / 2
    };
}

function posToTile(x, y) {
    return {
        col: Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE))),
        row: Math.max(0, Math.min(ROWS - 1, Math.floor(y / TILE)))
    };
}

function canMove(col, row, dir, allowGate = false) {
    if (!dir || (dir.x === 0 && dir.y === 0)) return false;
    let nextCol = col + dir.x;
    const nextRow = row + dir.y;

    if (nextRow < 0 || nextRow >= ROWS) return false;

    if (nextCol < 0) nextCol = COLS - 1;
    if (nextCol >= COLS) nextCol = 0;

    const cell = grid[nextRow][nextCol];
    if (cell === 1) return false;
    if (cell === 4 && !allowGate) return false;
    return true;
}

function spawnParticles(x, y, color, count = 10, speed = 95) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = speed * (0.35 + Math.random() * 0.75);
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * mag,
            vy: Math.sin(angle) * mag,
            color,
            size: 1.8 + Math.random() * 2.4,
            life: 0.28 + Math.random() * 0.28,
            maxLife: 0.56
        });
    }
}

function spawnShockwave(x, y, color, maxRadius = 64) {
    shockwaves.push({
        x,
        y,
        color,
        radius: 6,
        maxRadius,
        life: 0.42,
        maxLife: 0.42
    });
}

function addFloatingText(text, x, y, color = "#facc15") {
    floatingTexts.push({ text, x, y, life: 0.95, maxLife: 0.95, color });
}

function triggerDash() {
    if (state !== "PLAYING") return;
    if (dashTimer > 0 || dashEnergy < 100) return;

    dashTimer = DASH_DURATION;
    dashEnergy = 100;
    sound.dash();
    spawnShockwave(pacman.x, pacman.y, "#38bdf8", 42);
    spawnParticles(pacman.x, pacman.y, "#facc15", 14, 120);
    addFloatingText("¡TURBO!", pacman.x, pacman.y - 10, "#38bdf8");
    vibrateShort(14);
    updateStatusStrip();
}

dashBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    triggerDash();
});

function updateStatusStrip() {
    const pct = dashTimer > 0
        ? Math.round((dashTimer / DASH_DURATION) * 100)
        : Math.round(dashEnergy);

    dashBarFillEl.style.width = `${pct}%`;
    dashBarFillEl.classList.toggle("ready", dashTimer <= 0 && dashEnergy >= 100);
    dashBarFillEl.classList.toggle("active", dashTimer > 0);

    dashReadyTagEl.textContent = dashTimer > 0 ? "ON!" : (dashEnergy >= 100 ? "LISTO" : `${pct}%`);
    dashReadyTagEl.classList.toggle("ready", dashEnergy >= 100 || dashTimer > 0);

    dashBtn.classList.toggle("is-ready", dashTimer <= 0 && dashEnergy >= 100);
    dashBtn.classList.toggle("is-active", dashTimer > 0);

    comboBadgeEl.textContent = `x${comboMultiplier}`;
    comboBadgeEl.classList.toggle("hot", comboMultiplier === 2 || comboMultiplier === 3);
    comboBadgeEl.classList.toggle("max", comboMultiplier >= 4);

    let pills = "";
    if (shieldActive) {
        pills += `<span class="power-pill shield">🛡️</span>`;
    }
    if (freezeTimer > 0) {
        pills += `<span class="power-pill">❄️ ${Math.ceil(freezeTimer)}s</span>`;
    }
    if (magnetTimer > 0) {
        pills += `<span class="power-pill magnet">🧲 ${Math.ceil(magnetTimer)}s</span>`;
    }
    powerBadgesEl.innerHTML = pills;
}

function resetWaveSchedule() {
    waveSchedule = getWaveSchedule(level);
    waveIndex = 0;
    waveTimer = waveSchedule[0].dur;
    globalGhostMode = waveSchedule[0].mode;
}

function reverseActiveGhosts() {
    for (const g of ghosts) {
        if (g.state === "NORMAL" || g.state === "FRIGHTENED") {
            g.reversePending = true;
        }
    }
}

function resetPositions(isNewLevel = false) {
    const cfg = getLevelConfig();
    const pStart = tileCenter(cfg.pacmanSpawn.col, cfg.pacmanSpawn.row);
    pacman = {
        x: pStart.x,
        y: pStart.y,
        dir: DIRS.NONE,
        nextDir: DIRS.NONE,
        facingDir: DIRS.RIGHT,
        speed: 112 + Math.min(level - 1, 5) * 4,
        mouth: 0
    };

    dotsSinceLifeStart = 0;
    ghostHouseTimer = 0;
    resetWaveSchedule();

    const baseGhostSpeed = 92 + Math.min(level - 1, 6) * 5.5;
    const inkyDots = Math.max(0, 18 - (level - 1) * 5);
    const clydeDots = Math.max(0, 38 - (level - 1) * 8);
    const inkyTime = Math.max(2, 5.5 - (level - 1) * 0.7);
    const clydeTime = Math.max(3.5, 10 - (level - 1) * 1.1);

    ghosts = cfg.ghostSpawns.map((g, idx) => {
        const pos = tileCenter(g.col, g.row);
        const startsOutside = idx === 0;
        let releaseDots = 0;
        let releaseTime = 0.5;
        if (idx === 2) {
            releaseDots = inkyDots;
            releaseTime = inkyTime;
        } else if (idx === 3) {
            releaseDots = clydeDots;
            releaseTime = clydeTime;
        }

        return {
            x: pos.x,
            y: pos.y,
            dir: startsOutside ? DIRS.LEFT : DIRS.UP,
            color: g.color,
            type: g.type,
            name: g.name,
            speed: baseGhostSpeed,
            state: startsOutside ? "NORMAL" : "IN_HOUSE",
            homeX: pos.x,
            homeY: pos.y,
            releaseDots,
            releaseTime,
            reversePending: false,
            recoveredFromPower: false,
            lastTileKey: "",
            bobPhase: idx * 1.6
        };
    });

    frightenedTimer = 0;
    freezeTimer = 0;
    magnetTimer = 0;
    invulnTimer = 0;
    dashTimer = 0;
    dashTrail = [];
    ghostCombo = 0;

    if (isNewLevel) {
        dotStreak = 0;
        comboTimer = 0;
        comboMultiplier = 1;
    }

    sound.stopAllLoops();
    updateStatusStrip();
}

function loadLevel() {
    const cfg = getLevelConfig();
    grid = cloneMap(cfg.map);
    dotsRemaining = 0;
    dotsEatenInLevel = 0;
    bonusFruit = null;
    nextFruitMilestoneIdx = 0;
    activePowerItem = null;
    nextItemMilestoneIdx = 0;
    lifeSpawnedInLevel = false;
    floatingTexts = [];
    particles = [];
    shockwaves = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === 0 || grid[r][c] === 3) {
                dotsRemaining++;
            }
        }
    }
    totalDotsInLevel = dotsRemaining;

    if (cfg.theme) {
        canvas.style.borderColor = cfg.theme.wallStroke;
        canvas.style.boxShadow = `0 0 26px ${cfg.theme.glow}`;
    }

    resetPositions(true);
    updateHUD();
}

function beginReadyPhase() {
    state = "READY";
    stateTimer = 0.95;
    sound.stopAllLoops();
}

function startNewGame() {
    sound.init();
    sound.stopIntro();
    score = 0;
    level = 1;
    lives = START_LIVES;
    nextExtraLifeScore = 5000;
    dashEnergy = 35;
    shieldActive = false;
    loadLevel();
    overlayEl.classList.add("hidden");
    pauseBtn.classList.remove("is-paused");
    pauseLabelEl.textContent = "Pausar";
    beginReadyPhase();
}

function updateHUD() {
    scoreEl.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("pacman_offline_highscore", highScore);
    }
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;
    livesEl.textContent = lives > 0 ? `🟡 ×${lives}` : "👻";
}

function addScore(points, x, y, color = "#facc15") {
    score += points;
    if (score >= nextExtraLifeScore) {
        nextExtraLifeScore += 5000;
        if (lives < MAX_LIVES) {
            lives++;
            sound.extraLife();
            addFloatingText("¡+1 VIDA!", pacman.x, pacman.y - 18, "#4ade80");
            spawnShockwave(pacman.x, pacman.y, "#4ade80", 78);
            spawnParticles(pacman.x, pacman.y, "#4ade80", 16, 115);
            vibrateShort(22);
        }
    }
    updateHUD();
    if (x !== undefined && y !== undefined) {
        addFloatingText(`+${points}`, x, y, color);
    }
}

function pickOpenSpawnPosition(avoidItem = null) {
    const validTiles = [];
    const cfg = getLevelConfig();
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (grid[r][c] !== 0 && grid[r][c] !== 2) continue;
            // Evitar la caja de fantasmas, encima de Pac-Man o encima de otro objeto
            const inHouse =
                Math.abs(c - cfg.ghostGate.col) <= 2 &&
                r >= cfg.ghostGate.row - 1 &&
                r <= cfg.ghostGate.row + 2;
            if (inHouse) continue;
            const pos = tileCenter(c, r);
            if (Math.hypot(pos.x - pacman.x, pos.y - pacman.y) < TILE * 3.5) continue;
            if (avoidItem && Math.hypot(pos.x - avoidItem.x, pos.y - avoidItem.y) < TILE * 2.5) continue;
            validTiles.push(pos);
        }
    }
    if (validTiles.length === 0) return null;
    return validTiles[Math.floor(Math.random() * validTiles.length)];
}

function spawnBonusFruit() {
    const pos = pickOpenSpawnPosition(activePowerItem);
    if (!pos) return;
    bonusFruit = {
        x: pos.x,
        y: pos.y,
        timer: 10,
        points: 150 * level
    };
    spawnShockwave(pos.x, pos.y, "#ef4444", 30);
}

function spawnSpecialItem() {
    const pos = pickOpenSpawnPosition(bonusFruit);
    if (!pos) return;

    let type;
    // Si te faltan vidas, garantiza al menos un corazón de vida extra en el nivel
    if (lives < START_LIVES && !lifeSpawnedInLevel) {
        type = "LIFE";
        lifeSpawnedInLevel = true;
    } else {
        const pool = ["FREEZE", "MAGNET"];
        if (!shieldActive) pool.push("SHIELD");
        if (lives < MAX_LIVES) pool.push("LIFE");
        type = pool[Math.floor(Math.random() * pool.length)];
        if (type === "LIFE") lifeSpawnedInLevel = true;
    }

    activePowerItem = {
        type,
        x: pos.x,
        y: pos.y,
        timer: type === "LIFE" ? 13 : 10.5
    };
    spawnShockwave(pos.x, pos.y, type === "LIFE" ? "#4ade80" : "#38bdf8", 38);
}

function eatTileDot(row, col) {
    const tileVal = grid[row]?.[col];
    if (tileVal !== 0 && tileVal !== 3) return;

    grid[row][col] = 2;
    dotsRemaining--;
    dotsEatenInLevel++;
    dotsSinceLifeStart++;

    // Racha de combo
    dotStreak++;
    comboTimer = 1.85;
    if (dotStreak >= 32) comboMultiplier = 4;
    else if (dotStreak >= 18) comboMultiplier = 3;
    else if (dotStreak >= 8) comboMultiplier = 2;
    else comboMultiplier = 1;

    // Recarga de Turbo Dash
    if (dashTimer <= 0) {
        dashEnergy = Math.min(100, dashEnergy + (tileVal === 3 ? 20 : 5));
    }

    const pos = tileCenter(col, row);
    const progress = getLevelProgress();
    sound.updateBgSiren(progress);

    if (tileVal === 0) {
        const pts = 10 * comboMultiplier;
        addScore(pts);
        const pitchBoost = 1 + (comboMultiplier - 1) * 0.08;
        sound.chomp(pitchBoost);
        spawnParticles(pos.x, pos.y, "#fde68a", 3, 45);
    } else {
        addScore(50 * comboMultiplier, pos.x, pos.y, "#facc15");
        frightenedTimer = Math.max(4.5, 8.5 - (level - 1) * 0.55);
        ghostCombo = 0;

        for (const g of ghosts) {
            g.recoveredFromPower = false;
            if (g.state === "NORMAL" || g.state === "FRIGHTENED") {
                g.state = "FRIGHTENED";
                g.reversePending = true;
            }
        }

        sound.startPowerLoop();
        spawnShockwave(pos.x, pos.y, "#facc15", 58);
        spawnParticles(pos.x, pos.y, "#facc15", 14, 110);
    }

    if (
        nextFruitMilestoneIdx < FRUIT_MILESTONES.length &&
        dotsEatenInLevel >= FRUIT_MILESTONES[nextFruitMilestoneIdx]
    ) {
        nextFruitMilestoneIdx++;
        if (!bonusFruit) spawnBonusFruit();
    }

    if (
        nextItemMilestoneIdx < ITEM_MILESTONES.length &&
        dotsEatenInLevel >= ITEM_MILESTONES[nextItemMilestoneIdx]
    ) {
        nextItemMilestoneIdx++;
        if (!activePowerItem) spawnSpecialItem();
    }

    updateStatusStrip();

    if (dotsRemaining <= 0) {
        state = "LEVEL_CLEAR";
        stateTimer = 1.5;
        sound.win();
        spawnShockwave(pacman.x, pacman.y, "#22c55e", 110);
    }
}

function updatePacman(dt) {
    const speedMult = dashTimer > 0 ? 1.55 : 1;
    const step = pacman.speed * speedMult * dt;
    const { col, row } = posToTile(pacman.x, pacman.y);
    const center = tileCenter(col, row);

    // 1. Giro inmediato de 180 grados en el mismo eje (siempre instantáneo)
    if (
        pacman.dir !== DIRS.NONE &&
        ((pacman.nextDir.x !== 0 && pacman.nextDir.x === -pacman.dir.x && pacman.nextDir.y === 0) ||
            (pacman.nextDir.y !== 0 && pacman.nextDir.y === -pacman.dir.y && pacman.nextDir.x === 0))
    ) {
        pacman.dir = pacman.nextDir;
        pacman.facingDir = pacman.dir;
    }

    // 2. Arrancar desde parado si la dirección pedida está libre
    if (pacman.dir === DIRS.NONE && pacman.nextDir !== DIRS.NONE) {
        if (canMove(col, row, pacman.nextDir, false)) {
            if (pacman.nextDir.x !== 0) pacman.y = center.y;
            if (pacman.nextDir.y !== 0) pacman.x = center.x;
            pacman.dir = pacman.nextDir;
            pacman.facingDir = pacman.dir;
        }
    }

    // 3. Movimiento preciso sin ayudas de giro en esquinas ni teletransporte anticipado
    if (pacman.dir !== DIRS.NONE) {
        pacman.facingDir = pacman.dir;
        if (pacman.dir.x !== 0) pacman.y = center.y;
        if (pacman.dir.y !== 0) pacman.x = center.x;

        const prevX = pacman.x;
        const prevY = pacman.y;
        const nextX = prevX + pacman.dir.x * step;
        const nextY = prevY + pacman.dir.y * step;

        const crossedCenterX =
            pacman.dir.x !== 0 &&
            ((prevX <= center.x && nextX >= center.x) || (prevX >= center.x && nextX <= center.x));
        const crossedCenterY =
            pacman.dir.y !== 0 &&
            ((prevY <= center.y && nextY >= center.y) || (prevY >= center.y && nextY <= center.y));
        const atCenter = Math.hypot(prevX - center.x, prevY - center.y) <= 2.2;

        const wantsPerpTurn =
            pacman.nextDir !== DIRS.NONE &&
            (pacman.nextDir.x !== pacman.dir.x || pacman.nextDir.y !== pacman.dir.y);

        // Solo gira perpendicularmente al pasar exactamente por el centro de la casilla
        if (wantsPerpTurn && (atCenter || crossedCenterX || crossedCenterY) && canMove(col, row, pacman.nextDir, false)) {
            const distUsed = Math.hypot(center.x - prevX, center.y - prevY);
            const leftover = Math.max(0, step - distUsed);
            pacman.x = center.x + pacman.nextDir.x * leftover;
            pacman.y = center.y + pacman.nextDir.y * leftover;
            pacman.dir = pacman.nextDir;
            pacman.facingDir = pacman.dir;
            pacman.mouth += dt * (dashTimer > 0 ? 22 : 14);
        } else {
            const movingTowardsCenter =
                (pacman.dir.x > 0 && prevX < center.x) ||
                (pacman.dir.x < 0 && prevX > center.x) ||
                (pacman.dir.y > 0 && prevY < center.y) ||
                (pacman.dir.y < 0 && prevY > center.y);

            if (!canMove(col, row, pacman.dir, false) && (!movingTowardsCenter || crossedCenterX || crossedCenterY)) {
                // Se detiene limpio frente a la pared (SIN giro automático en esquinas en L)
                pacman.x = center.x;
                pacman.y = center.y;
                pacman.dir = DIRS.NONE;
            } else {
                pacman.x = nextX;
                pacman.y = nextY;
                pacman.mouth += dt * (dashTimer > 0 ? 22 : 14);
            }
        }
    }

    // Estela visual durante el Turbo Dash
    if (dashTimer > 0 && pacman.dir !== DIRS.NONE) {
        dashTrail.push({ x: pacman.x, y: pacman.y, life: 0.22 });
    }

    // Túneles laterales
    if (pacman.x < 0) pacman.x += COLS * TILE;
    if (pacman.x >= COLS * TILE) pacman.x -= COLS * TILE;

    // Comer punto actual
    const cur = posToTile(pacman.x, pacman.y);
    eatTileDot(cur.row, cur.col);

    // Imán de puntos: atrae puntos normales cercanos
    if (magnetTimer > 0 && state === "PLAYING") {
        const radiusTiles = 2;
        for (let r = Math.max(0, cur.row - radiusTiles); r <= Math.min(ROWS - 1, cur.row + radiusTiles); r++) {
            for (let c = Math.max(0, cur.col - radiusTiles); c <= Math.min(COLS - 1, cur.col + radiusTiles); c++) {
                if (grid[r][c] === 0) {
                    const p = tileCenter(c, r);
                    if (Math.hypot(p.x - pacman.x, p.y - pacman.y) <= TILE * 2.35) {
                        eatTileDot(r, c);
                        spawnParticles(p.x, p.y, "#f472b6", 3, 75);
                    }
                }
            }
        }
    }

    // Recoger fruta clásica (independiente de los power-ups)
    if (bonusFruit) {
        bonusFruit.timer -= dt;
        if (bonusFruit.timer <= 0) {
            bonusFruit = null;
        } else if (Math.hypot(pacman.x - bonusFruit.x, pacman.y - bonusFruit.y) < TILE * 0.72) {
            const f = bonusFruit;
            bonusFruit = null;
            if (dashTimer <= 0) dashEnergy = Math.min(100, dashEnergy + 20);
            addScore(f.points, f.x, f.y, "#4ade80");
            sound.fruit();
            spawnParticles(f.x, f.y, "#ef4444", 12, 95);
            updateStatusStrip();
        }
    }

    // Recoger objeto especial (Hielo, Imán o Escudo)
    if (activePowerItem) {
        activePowerItem.timer -= dt;
        if (activePowerItem.timer <= 0) {
            activePowerItem = null;
        } else if (Math.hypot(pacman.x - activePowerItem.x, pacman.y - activePowerItem.y) < TILE * 0.72) {
            const item = activePowerItem;
            activePowerItem = null;
            if (dashTimer <= 0) dashEnergy = Math.min(100, dashEnergy + 25);

            if (item.type === "FREEZE") {
                freezeTimer = 4.5;
                addScore(100, item.x, item.y, "#38bdf8");
                addFloatingText("¡HIELO!", item.x, item.y - 16, "#38bdf8");
                sound.freeze();
                spawnShockwave(item.x, item.y, "#38bdf8", 95);
                spawnParticles(item.x, item.y, "#bae6fd", 16, 110);
            } else if (item.type === "MAGNET") {
                magnetTimer = 6.5;
                addScore(100, item.x, item.y, "#f472b6");
                addFloatingText("¡IMÁN!", item.x, item.y - 16, "#f472b6");
                sound.magnet();
                spawnShockwave(item.x, item.y, "#f472b6", 75);
                spawnParticles(item.x, item.y, "#f472b6", 14, 100);
            } else if (item.type === "SHIELD") {
                shieldActive = true;
                addScore(100, item.x, item.y, "#c084fc");
                addFloatingText("¡ESCUDO!", item.x, item.y - 16, "#c084fc");
                sound.shield();
                spawnShockwave(item.x, item.y, "#a855f7", 75);
                spawnParticles(item.x, item.y, "#c084fc", 14, 100);
            } else if (item.type === "LIFE") {
                if (lives < MAX_LIVES) {
                    lives++;
                    updateHUD();
                    addFloatingText("¡+1 VIDA!", item.x, item.y - 16, "#4ade80");
                    sound.extraLife();
                } else {
                    addScore(300, item.x, item.y, "#4ade80");
                    sound.fruit();
                }
                spawnShockwave(item.x, item.y, "#4ade80", 80);
                spawnParticles(item.x, item.y, "#4ade80", 16, 115);
            }
            updateStatusStrip();
        }
    }
}

function getGhostTargetTile(ghost) {
    const cfg = getLevelConfig();

    if (ghost.state === "EATEN") {
        return { col: cfg.ghostGate.col, row: cfg.ghostGate.row };
    }

    // Regla original: Blinky "Cruise Elroy" ignora Scatter cuando quedan pocos puntos
    const isCruiseElroy = ghost.type === "chaser" && dotsRemaining <= Math.max(12, Math.floor(totalDotsInLevel * 0.14));

    if (globalGhostMode === "SCATTER" && !isCruiseElroy) {
        return SCATTER_CORNERS[ghost.type] || SCATTER_CORNERS.chaser;
    }

    const pTile = posToTile(pacman.x, pacman.y);
    const pFace = pacman.facingDir || DIRS.RIGHT;

    // 1. Blinky (Rojo): persigue directamente la casilla actual de Pac-Man
    if (ghost.type === "chaser") {
        return { col: pTile.col, row: pTile.row };
    }

    // 2. Pinky (Rosa): embosca 4 casillas delante de hacia donde mira Pac-Man
    if (ghost.type === "ambusher") {
        return {
            col: pTile.col + pFace.x * 4,
            row: pTile.row + pFace.y * 4
        };
    }

    // 3. Inky (Cian): toma 2 casillas delante de Pac-Man y duplica el vector desde Blinky
    if (ghost.type === "flanker") {
        const pivotCol = pTile.col + pFace.x * 2;
        const pivotRow = pTile.row + pFace.y * 2;
        const blinky = ghosts.find((g) => g.type === "chaser");
        if (blinky) {
            const bTile = posToTile(blinky.x, blinky.y);
            return {
                col: bTile.col + (pivotCol - bTile.col) * 2,
                row: bTile.row + (pivotRow - bTile.row) * 2
            };
        }
        return { col: pivotCol, row: pivotRow };
    }

    // 4. Clyde (Naranja): persigue a Pac-Man si está lejos (> 6 casillas), huye a su esquina si se acerca
    const gTile = posToTile(ghost.x, ghost.y);
    const distToPac = Math.hypot(gTile.col - pTile.col, gTile.row - pTile.row);
    if (distToPac > 6) {
        return { col: pTile.col, row: pTile.row };
    }
    return SCATTER_CORNERS.clyde;
}

function chooseGhostDirection(ghost, col, row) {
    const allowGate = ghost.state === "EATEN";

    // Orden oficial de desempate del arcade original: UP > LEFT > DOWN > RIGHT
    const candidates = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];

    // Si hay reversa pendiente por cambio de fase (Scatter <-> Chase o Frightened)
    if (ghost.reversePending) {
        ghost.reversePending = false;
        const rev = { x: -ghost.dir.x, y: -ghost.dir.y };
        if (canMove(col, row, rev, allowGate)) {
            return rev;
        }
    }

    const options = candidates.filter((d) => {
        if (d.x === -ghost.dir.x && d.y === -ghost.dir.y) return false;
        return canMove(col, row, d, allowGate);
    });

    if (options.length === 0) {
        const rev = { x: -ghost.dir.x, y: -ghost.dir.y };
        return canMove(col, row, rev, allowGate) ? rev : DIRS.NONE;
    }

    if (options.length === 1) {
        return options[0];
    }

    if (ghost.state === "FRIGHTENED") {
        return options[Math.floor(Math.random() * options.length)];
    }

    const target = getGhostTargetTile(ghost);
    let bestDir = options[0];
    let bestDistSq = Infinity;

    for (const d of options) {
        const nc = col + d.x;
        const nr = row + d.y;
        const distSq = (nc - target.col) ** 2 + (nr - target.row) ** 2;
        if (distSq < bestDistSq) {
            bestDistSq = distSq;
            bestDir = d;
        }
    }
    return bestDir;
}

function updateGhosts(dt) {
    const cfg = getLevelConfig();

    // Actualizar temporizador de Frightened
    if (frightenedTimer > 0) {
        frightenedTimer = Math.max(0, frightenedTimer - dt);
        if (frightenedTimer === 0) {
            for (const g of ghosts) {
                if (g.state === "FRIGHTENED") {
                    g.state = "NORMAL";
                }
            }
            sound.stopPowerLoop();
            sound.startBgSiren(getLevelProgress());
        }
    }

    // Reloj global de fases Scatter / Chase (se pausa durante Frightened o Freeze)
    if (frightenedTimer <= 0 && freezeTimer <= 0) {
        ghostHouseTimer += dt;
        if (waveTimer !== Infinity) {
            waveTimer -= dt;
            if (waveTimer <= 0 && waveIndex < waveSchedule.length - 1) {
                waveIndex++;
                globalGhostMode = waveSchedule[waveIndex].mode;
                waveTimer = waveSchedule[waveIndex].dur;
                reverseActiveGhosts();
            }
        }
    }

    const gateCenter = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row);
    const outsideGate = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row - 1);
    const insideHouse = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row + 1);

    for (const ghost of ghosts) {
        // 1. Fantasmas esperando en la casa (salida escalonada como en el original)
        if (ghost.state === "IN_HOUSE") {
            ghost.bobPhase += dt * 5;
            ghost.y = ghost.homeY + Math.sin(ghost.bobPhase) * 3.5;

            if (
                freezeTimer <= 0 &&
                (dotsSinceLifeStart >= ghost.releaseDots || ghostHouseTimer >= ghost.releaseTime)
            ) {
                ghost.state = "EXITING";
                ghost.y = ghost.homeY;
            }
            continue;
        }

        // 2. Saliendo suavemente por la puerta de la casa
        if (ghost.state === "EXITING") {
            if (freezeTimer > 0) continue;
            const exitSpeed = ghost.speed * 0.78 * dt;
            if (Math.abs(ghost.x - gateCenter.x) > 1.5) {
                const dx = Math.sign(gateCenter.x - ghost.x);
                ghost.x += dx * Math.min(exitSpeed, Math.abs(gateCenter.x - ghost.x));
                ghost.dir = dx > 0 ? DIRS.RIGHT : DIRS.LEFT;
            } else {
                ghost.x = gateCenter.x;
                const dy = outsideGate.y - ghost.y;
                if (Math.abs(dy) > 1.5) {
                    ghost.y += Math.sign(dy) * Math.min(exitSpeed, Math.abs(dy));
                    ghost.dir = DIRS.UP;
                } else {
                    ghost.x = outsideGate.x;
                    ghost.y = outsideGate.y;
                    ghost.state = frightenedTimer > 0 && !ghost.recoveredFromPower ? "FRIGHTENED" : "NORMAL";
                    ghost.dir = DIRS.LEFT;
                    ghost.lastTileKey = "";
                }
            }
            continue;
        }

        // Congelamiento (solo afecta a fantasmas activos, no a los ojos que regresan)
        if (freezeTimer > 0 && ghost.state !== "EATEN") {
            // Sigue comprobando colisión si Pac-Man los toca (o se los come si están asustados)
            checkGhostCollision(ghost);
            if (state !== "PLAYING") return;
            continue;
        }

        // Calcular velocidad según estado, Cruise Elroy y túnel
        let currentSpeed = ghost.speed;
        const { col, row } = posToTile(ghost.x, ghost.y);

        if (ghost.state === "EATEN") {
            currentSpeed = ghost.speed * 1.95;
        } else if (ghost.state === "FRIGHTENED") {
            currentSpeed = ghost.speed * 0.58;
        } else {
            const isCruiseElroy =
                ghost.type === "chaser" && dotsRemaining <= Math.max(12, Math.floor(totalDotsInLevel * 0.14));
            if (isCruiseElroy) currentSpeed *= 1.08;
            if (col <= 1 || col >= COLS - 2) currentSpeed *= 0.65;
        }

        const step = currentSpeed * dt;

        // Si los ojos llegaron a la puerta, entran a regenerarse dentro de la casa
        if (ghost.state === "EATEN") {
            const distGate = Math.hypot(ghost.x - gateCenter.x, ghost.y - gateCenter.y);
            if (distGate <= step + 3) {
                ghost.x = insideHouse.x;
                ghost.y = insideHouse.y;
                ghost.state = "EXITING";
                ghost.recoveredFromPower = true;
                ghost.dir = DIRS.UP;
                ghost.lastTileKey = "";
                continue;
            }
        }

        const center = tileCenter(col, row);
        const tileKey = `${col},${row}`;

        if (ghost.dir.x !== 0) ghost.y = center.y;
        if (ghost.dir.y !== 0) ghost.x = center.x;

        const dist = Math.hypot(ghost.x - center.x, ghost.y - center.y);
        const allowGate = ghost.state === "EATEN";

        if (dist <= step + 1.5 && ghost.lastTileKey !== tileKey) {
            ghost.x = center.x;
            ghost.y = center.y;
            ghost.dir = chooseGhostDirection(ghost, col, row);
            ghost.lastTileKey = tileKey;
        } else if (!canMove(col, row, ghost.dir, allowGate) && dist <= step + 1.5) {
            ghost.x = center.x;
            ghost.y = center.y;
            ghost.dir = chooseGhostDirection(ghost, col, row);
        }

        ghost.x += ghost.dir.x * step;
        ghost.y += ghost.dir.y * step;

        if (ghost.x < 0) ghost.x += COLS * TILE;
        if (ghost.x >= COLS * TILE) ghost.x -= COLS * TILE;

        checkGhostCollision(ghost);
        if (state !== "PLAYING") return;
    }
}

function checkGhostCollision(ghost) {
    if (ghost.state === "EATEN" || ghost.state === "IN_HOUSE" || ghost.state === "EXITING") return;

    if (Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y) < TILE * 0.68) {
        if (ghost.state === "FRIGHTENED") {
            ghostCombo++;
            const pts = 200 * Math.pow(2, ghostCombo - 1);
            addScore(pts, ghost.x, ghost.y, "#38bdf8");
            sound.eatGhost();
            screenShake = 0.16;
            spawnParticles(ghost.x, ghost.y, "#38bdf8", 16, 125);
            spawnShockwave(ghost.x, ghost.y, "#38bdf8", 44);
            ghost.state = "EATEN";
            ghost.lastTileKey = "";
            vibrateShort(18);
            return;
        }

        if (invulnTimer > 0) return;

        // Si el Escudo está activo, absorbe el golpe y asusta fantasmas cercanos
        if (shieldActive) {
            shieldActive = false;
            invulnTimer = 1.6;
            screenShake = 0.25;
            sound.shieldBreak();
            spawnShockwave(pacman.x, pacman.y, "#a855f7", 110);
            spawnParticles(pacman.x, pacman.y, "#c084fc", 24, 150);
            addFloatingText("¡ESCUDO!", pacman.x, pacman.y - 12, "#c084fc");
            vibrateShort(25);

            // Asusta brevemente a los fantasmas en el radio de la onda
            for (const g of ghosts) {
                if (g.state === "NORMAL" && Math.hypot(g.x - pacman.x, g.y - pacman.y) < TILE * 4.5) {
                    g.state = "FRIGHTENED";
                    g.reversePending = true;
                    frightenedTimer = Math.max(frightenedTimer, 3.0);
                }
            }
            updateStatusStrip();
            return;
        }

        // Muerte clásica con animación
        lives--;
        dotStreak = 0;
        comboMultiplier = 1;
        comboTimer = 0;
        updateHUD();
        updateStatusStrip();
        sound.die();
        screenShake = 0.28;
        spawnParticles(pacman.x, pacman.y, "#facc15", 20, 130);
        vibrateShort(35);
        state = "DYING";
        stateTimer = 0.95;
    }
}

function updateTimersAndEffects(dt) {
    if (dashTimer > 0) {
        dashTimer = Math.max(0, dashTimer - dt);
        if (dashTimer === 0) dashEnergy = 0;
        updateStatusStrip();
    }

    if (comboTimer > 0) {
        comboTimer = Math.max(0, comboTimer - dt);
        if (comboTimer === 0 && dotStreak > 0) {
            dotStreak = 0;
            comboMultiplier = 1;
            updateStatusStrip();
        }
    }

    if (freezeTimer > 0) {
        const prevSec = Math.ceil(freezeTimer);
        freezeTimer = Math.max(0, freezeTimer - dt);
        if (Math.ceil(freezeTimer) !== prevSec || freezeTimer === 0) updateStatusStrip();
    }

    if (magnetTimer > 0) {
        const prevSec = Math.ceil(magnetTimer);
        magnetTimer = Math.max(0, magnetTimer - dt);
        if (Math.ceil(magnetTimer) !== prevSec || magnetTimer === 0) updateStatusStrip();
    }

    if (invulnTimer > 0) {
        invulnTimer = Math.max(0, invulnTimer - dt);
    }

    if (screenShake > 0) {
        screenShake = Math.max(0, screenShake - dt);
    }

    for (let i = dashTrail.length - 1; i >= 0; i--) {
        dashTrail[i].life -= dt;
        if (dashTrail[i].life <= 0) dashTrail.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i];
        s.life -= dt;
        const t = 1 - Math.max(0, s.life) / s.maxLife;
        s.radius = 6 + (s.maxRadius - 6) * t;
        if (s.life <= 0) shockwaves.splice(i, 1);
    }
}

function drawMaze() {
    const cfg = getLevelConfig();
    const theme = cfg.theme || {
        bg: "#050918",
        gridLine: "rgba(59, 130, 246, 0.08)",
        wallFill: "#10214a",
        wallInner: "#1d4ed8",
        wallStroke: "#60a5fa",
        glow: "rgba(59, 130, 246, 0.45)",
        dotColor: "#fde68a",
        accent: "#38bdf8"
    };

    // 1. Fondo atmosférico + cuadrícula neón sutil animada
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * TILE, 0);
        ctx.lineTo(c * TILE, canvas.height);
        ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * TILE);
        ctx.lineTo(canvas.width, r * TILE);
        ctx.stroke();
    }

    // Tinte dinámico de bordes según estado activo (Hielo / Super Punto / Pulso normal)
    const wallPulse = 0.72 + Math.sin(animTick * 3.4) * 0.28;
    let activeStroke = theme.wallStroke;
    let activeInner = theme.wallInner;
    if (freezeTimer > 0) {
        activeStroke = "#67e8f9";
        activeInner = "#0891b2";
    } else if (frightenedTimer > 0) {
        const flash = frightenedTimer < 2.2 && Math.floor(frightenedTimer * 6) % 2 === 0;
        activeStroke = flash ? "#f8fafc" : "#60a5fa";
        activeInner = "#2563eb";
    }

    // 2. Paredes conectadas con bisel interior y borde neón solo hacia pasillos
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            const x = c * TILE;
            const y = r * TILE;

            if (cell === 1) {
                const upWall = r > 0 && grid[r - 1][c] === 1;
                const downWall = r < ROWS - 1 && grid[r + 1][c] === 1;
                const leftWall = c > 0 && grid[r][c - 1] === 1;
                const rightWall = c < COLS - 1 && grid[r][c + 1] === 1;

                // Relleno base conectado
                ctx.fillStyle = theme.wallFill;
                ctx.fillRect(x, y, TILE, TILE);

                // Núcleo luminoso sutil (efecto circuito)
                ctx.save();
                ctx.globalAlpha = 0.22 + wallPulse * 0.14;
                ctx.fillStyle = activeInner;
                const padL = leftWall ? 0 : 4;
                const padR = rightWall ? 0 : 4;
                const padT = upWall ? 0 : 4;
                const padB = downWall ? 0 : 4;
                ctx.fillRect(x + padL, y + padT, TILE - padL - padR, TILE - padT - padB);
                ctx.restore();

                // Bordes neón continuos solo donde da a un pasillo
                ctx.strokeStyle = activeStroke;
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (!upWall) {
                    ctx.moveTo(x, y + 1);
                    ctx.lineTo(x + TILE, y + 1);
                }
                if (!downWall) {
                    ctx.moveTo(x, y + TILE - 1);
                    ctx.lineTo(x + TILE, y + TILE - 1);
                }
                if (!leftWall) {
                    ctx.moveTo(x + 1, y);
                    ctx.lineTo(x + 1, y + TILE);
                }
                if (!rightWall) {
                    ctx.moveTo(x + TILE - 1, y);
                    ctx.lineTo(x + TILE - 1, y + TILE);
                }
                ctx.stroke();
            } else if (cell === 4) {
                // Puerta láser de la casa de fantasmas
                const gateGlow = 0.65 + Math.sin(animTick * 7) * 0.35;
                ctx.save();
                ctx.fillStyle = `rgba(244, 114, 182, ${gateGlow * 0.35})`;
                ctx.fillRect(x, y + TILE / 2 - 4, TILE, 8);
                ctx.fillStyle = "#f472b6";
                ctx.fillRect(x, y + TILE / 2 - 1.5, TILE, 3);
                ctx.restore();
            } else if (cell === 0) {
                ctx.fillStyle = theme.dotColor;
                ctx.beginPath();
                ctx.arc(x + TILE / 2, y + TILE / 2, 2.7, 0, Math.PI * 2);
                ctx.fill();
            } else if (cell === 3) {
                const pulse = 5.4 + Math.sin(animTick * 8) * 1.5;
                ctx.save();
                ctx.fillStyle = theme.glow;
                ctx.beginPath();
                ctx.arc(x + TILE / 2, y + TILE / 2, pulse + 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(x + TILE / 2, y + TILE / 2, pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    // 3. Indicadores animados en los túneles laterales de teletransporte
    const chevronAlpha = 0.35 + Math.sin(animTick * 5) * 0.3;
    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = chevronAlpha;
    ctx.font = "900 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    for (let r = 1; r < ROWS - 1; r++) {
        if (grid[r][0] !== 1 && grid[r][COLS - 1] !== 1) {
            const cy = r * TILE + TILE / 2 + 4;
            const shift = Math.sin(animTick * 6) * 2;
            ctx.fillText("«", 9 - shift, cy);
            ctx.fillText("»", canvas.width - 9 + shift, cy);
        }
    }
    ctx.restore();
}

function drawBonusFruit() {
    if (!bonusFruit) return;
    const { x, y, timer } = bonusFruit;
    if (timer < 2.2 && Math.floor(timer * 6) % 2 === 0) return;

    const bob = Math.sin(animTick * 5.5) * 1.8;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-4, 3, 5, 0, Math.PI * 2);
    ctx.arc(4, 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -1);
    ctx.quadraticCurveTo(0, -9, 5, -7);
    ctx.moveTo(4, 0);
    ctx.lineTo(5, -7);
    ctx.stroke();
    ctx.restore();
}

function drawSpecialItem() {
    if (!activePowerItem) return;
    const { type, x, y, timer } = activePowerItem;
    if (timer < 2.5 && Math.floor(timer * 6) % 2 === 0) return;

    const bob = Math.sin(animTick * 6) * 2.2;
    ctx.save();
    ctx.translate(x, y + bob);

    if (type === "FREEZE") {
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const a = (i * Math.PI) / 3 + animTick * 1.2;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * 7, -Math.sin(a) * 7);
            ctx.lineTo(Math.cos(a) * 7, Math.sin(a) * 7);
            ctx.stroke();
        }
    } else if (type === "MAGNET") {
        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 1, 6.5, Math.PI, 0);
        ctx.lineTo(6.5, 6);
        ctx.moveTo(-6.5, 1);
        ctx.lineTo(-6.5, 6);
        ctx.stroke();
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(-8.2, 4.5, 3.4, 3);
        ctx.fillRect(4.8, 4.5, 3.4, 3);
    } else if (type === "SHIELD") {
        ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(7, -4);
        ctx.lineTo(6, 3);
        ctx.lineTo(0, 8);
        ctx.lineTo(-6, 3);
        ctx.lineTo(-7, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (type === "LIFE") {
        ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
        ctx.beginPath();
        ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4ade80";
        ctx.strokeStyle = "#dcfce7";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, 6.5);
        ctx.bezierCurveTo(-9, 1, -8.5, -7, -3.5, -6.5);
        ctx.bezierCurveTo(-1, -6.2, 0, -4, 0, -3.2);
        ctx.bezierCurveTo(0, -4, 1, -6.2, 3.5, -6.5);
        ctx.bezierCurveTo(8.5, -7, 9, 1, 0, 6.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

function drawPacman() {
    // Estela del Turbo Dash
    for (const t of dashTrail) {
        const alpha = Math.max(0, t.life / 0.22) * 0.45;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, TILE * 0.36, 0, Math.PI * 2);
        ctx.fill();
    }

    if (invulnTimer > 0 && Math.floor(invulnTimer * 14) % 2 === 0) return;

    // Animación de muerte
    if (state === "DYING") {
        const progress = 1 - Math.max(0, stateTimer) / 0.95;
        const startA = progress * Math.PI;
        const endA = Math.PI * 2 - progress * Math.PI;
        if (endA > startA) {
            ctx.save();
            ctx.translate(pacman.x, pacman.y);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, TILE * 0.43, startA, endA);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        return;
    }

    // Aura del imán
    if (magnetTimer > 0) {
        const pulse = TILE * (1.1 + Math.sin(animTick * 10) * 0.12);
        ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pacman.x, pacman.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Aura del escudo
    if (shieldActive) {
        ctx.strokeStyle = "rgba(192, 132, 252, 0.85)";
        ctx.fillStyle = "rgba(168, 85, 247, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pacman.x, pacman.y, TILE * 0.56, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    const angleOffset = Math.abs(Math.sin(pacman.mouth)) * 0.28 * Math.PI;
    const face = pacman.facingDir || DIRS.RIGHT;
    let rotation = 0;
    if (face === DIRS.DOWN) rotation = Math.PI / 2;
    else if (face === DIRS.LEFT) rotation = Math.PI;
    else if (face === DIRS.UP) rotation = -Math.PI / 2;

    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(rotation);
    ctx.fillStyle = dashTimer > 0 ? "#fef08a" : "#facc15";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, TILE * 0.43, angleOffset, Math.PI * 2 - angleOffset);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawGhosts() {
    for (const g of ghosts) {
        const r = TILE * 0.43;
        ctx.save();
        ctx.translate(g.x, g.y);

        // Fantasma comido: solo ojos flotantes regresando a la casa
        if (g.state === "EATEN") {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(-4, -2, 3.6, 0, Math.PI * 2);
            ctx.arc(4, -2, 3.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#2563eb";
            ctx.beginPath();
            ctx.arc(-4 + g.dir.x * 1.6, -2 + g.dir.y * 1.6, 1.8, 0, Math.PI * 2);
            ctx.arc(4 + g.dir.x * 1.6, -2 + g.dir.y * 1.6, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
        }

        let bodyColor = g.color;
        if (g.state === "FRIGHTENED") {
            const blinking = frightenedTimer < 2.4 && Math.floor(frightenedTimer * 5) % 2 === 0;
            bodyColor = blinking ? "#f8fafc" : "#2563eb";
        } else if (freezeTimer > 0) {
            bodyColor = "#67e8f9";
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -2, r, Math.PI, 0);
        ctx.lineTo(r, r);
        ctx.lineTo(r * 0.35, r * 0.65);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.35, r * 0.65);
        ctx.lineTo(-r, r);
        ctx.closePath();
        ctx.fill();

        if (freezeTimer > 0 && g.state !== "FRIGHTENED") {
            ctx.strokeStyle = "#e0f2fe";
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(-4, -3, 3.2, 0, Math.PI * 2);
        ctx.arc(4, -3, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = g.state === "FRIGHTENED" ? "#ef4444" : "#0f172a";
        ctx.beginPath();
        ctx.arc(-4 + g.dir.x * 1.4, -3 + g.dir.y * 1.4, 1.6, 0, Math.PI * 2);
        ctx.arc(4 + g.dir.x * 1.4, -3 + g.dir.y * 1.4, 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawParticlesAndWaves() {
    for (const s of shockwaves) {
        const alpha = Math.max(0, s.life / s.maxLife) * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawFloatingTexts(dt) {
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 28 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life / ft.maxLife + 0.15);
        ctx.fillStyle = ft.color || "#facc15";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
}

function render(dt) {
    ctx.save();
    if (screenShake > 0) {
        const mag = screenShake * 18;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    ctx.fillStyle = "#050811";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawBonusFruit();
    drawSpecialItem();
    drawParticlesAndWaves();
    drawPacman();
    drawGhosts();
    drawFloatingTexts(dt);

    if (state === "READY") {
        ctx.fillStyle = "rgba(9, 13, 22, 0.58)";
        ctx.fillRect(0, canvas.height / 2 - 24, canvas.width, 48);
        ctx.fillStyle = "#facc15";
        ctx.font = "900 20px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡LISTO!", canvas.width / 2, canvas.height / 2 + 7);
    } else if (state === "LEVEL_CLEAR") {
        ctx.fillStyle = "rgba(9, 13, 22, 0.72)";
        ctx.fillRect(0, canvas.height / 2 - 36, canvas.width, 72);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`¡${getLevelConfig().name.toUpperCase()} COMPLETADO!`, canvas.width / 2, canvas.height / 2 + 7);
    }

    ctx.restore();
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    animTick += dt;

    if (state === "READY") {
        stateTimer -= dt;
        updateTimersAndEffects(dt);
        if (stateTimer <= 0) {
            state = "PLAYING";
            sound.startBgSiren(getLevelProgress());
        }
    } else if (state === "PLAYING") {
        updateTimersAndEffects(dt);
        updatePacman(dt);
        if (state === "PLAYING") {
            updateGhosts(dt);
        }
    } else if (state === "DYING") {
        stateTimer -= dt;
        updateTimersAndEffects(dt);
        if (stateTimer <= 0) {
            if (lives <= 0) {
                state = "GAME_OVER";
                overlayTitleEl.textContent = "GAME OVER";
                overlaySubEl.textContent = `Puntuación final: ${score} pts • Nivel alcanzado: ${level}`;
                startBtn.textContent = "JUGAR DE NUEVO";
                overlayEl.classList.remove("hidden");
            } else {
                resetPositions(false);
                beginReadyPhase();
            }
        }
    } else if (state === "LEVEL_CLEAR") {
        stateTimer -= dt;
        updateTimersAndEffects(dt);
        if (stateTimer <= 0) {
            level++;
            loadLevel();
            beginReadyPhase();
        }
    }

    render(dt);
    requestAnimationFrame(gameLoop);
}

// Reproducir música de intro automáticamente al entrar (y desbloquear si el navegador la suspende)
function startMenuMusic() {
    if (state === "MENU" && !sound.muted) {
        sound.intro();
    }
}

const unlockMenuAudio = (e) => {
    if (state !== "MENU") {
        window.removeEventListener("pointerdown", unlockMenuAudio);
        window.removeEventListener("touchstart", unlockMenuAudio);
        window.removeEventListener("keydown", unlockMenuAudio);
        return;
    }
    if (e && e.target && e.target.closest && e.target.closest("#start-btn")) return;
    startMenuMusic();
};

window.addEventListener("pointerdown", unlockMenuAudio, { passive: true });
window.addEventListener("touchstart", unlockMenuAudio, { passive: true });
window.addEventListener("keydown", unlockMenuAudio);

// Controles de teclado
window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
    }

    if (state === "MENU") {
        startMenuMusic();
    }

    if (key === "arrowup" || key === "w") setNextDirection(DIRS.UP);
    else if (key === "arrowdown" || key === "s") setNextDirection(DIRS.DOWN);
    else if (key === "arrowleft" || key === "a") setNextDirection(DIRS.LEFT);
    else if (key === "arrowright" || key === "d") setNextDirection(DIRS.RIGHT);
    else if (key === " " || key === "shift") triggerDash();
    else if (key === "p") togglePause();
    else if (key === "m") toggleMute();
});

// =========================================================================
// 1) Control táctil ultra-responsivo (Solo dedo)
//    - Ancla rodante: actualiza origen al avanzar en la misma dirección,
//      evitando quedar atorado al cambiar de dirección bruscamente.
//    - Soporte multitáctil limpio: si un segundo dedo toca rápido, toma el
//      control sin bloquearse al soltar el dedo anterior.
//    - Doble toque rápido activa el Turbo Dash.
// =========================================================================
let swipeTouchId = null;
let swipeAnchorX = 0;
let swipeAnchorY = 0;
let swipeOriginX = 0;
let swipeOriginY = 0;
let swipeMoved = false;
let lastTapTime = 0;

function pickAxisDirection(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx > 0 ? DIRS.RIGHT : DIRS.LEFT;
    }
    return dy > 0 ? DIRS.DOWN : DIRS.UP;
}

function processSwipePoint(clientX, clientY, isEnd = false) {
    const dx = clientX - swipeAnchorX;
    const dy = clientY - swipeAnchorY;
    const dist = Math.hypot(dx, dy);

    // Umbral muy bajo para respuestas rápidas en toques cortos o cambios bruscos
    const threshold = isEnd ? 7 : (swipeMoved ? 12 : 9);

    if (dist >= threshold) {
        const dir = pickAxisDirection(dx, dy);
        setNextDirection(dir);
        swipeAnchorX = clientX;
        swipeAnchorY = clientY;
        swipeMoved = true;
    }
}

document.addEventListener("touchstart", (e) => {
    if (controlMode !== "SWIPE" || (state !== "PLAYING" && state !== "READY")) return;
    if (e.target.closest("button")) return;

    e.preventDefault();
    // Siempre tomar el toque más reciente para soportar toques alternados muy rápidos
    const touch = e.changedTouches[e.changedTouches.length - 1];
    swipeTouchId = touch.identifier;
    swipeAnchorX = touch.clientX;
    swipeAnchorY = touch.clientY;
    swipeOriginX = touch.clientX;
    swipeOriginY = touch.clientY;
    swipeMoved = false;
}, { passive: false });

document.addEventListener("touchmove", (e) => {
    if (controlMode !== "SWIPE" || (state !== "PLAYING" && state !== "READY")) return;
    if (swipeTouchId === null) return;
    if (e.target.closest("button")) return;

    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === swipeTouchId) {
            processSwipePoint(touch.clientX, touch.clientY, false);
        }
    }
}, { passive: false });

document.addEventListener("touchend", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === swipeTouchId) {
            if (controlMode === "SWIPE" && (state === "PLAYING" || state === "READY")) {
                processSwipePoint(touch.clientX, touch.clientY, true);

                // Detectar doble toque rápido (sin arrastre) para activar Turbo Dash
                const totalTravel = Math.hypot(touch.clientX - swipeOriginX, touch.clientY - swipeOriginY);
                if (!swipeMoved && totalTravel < 10) {
                    const now = performance.now();
                    if (now - lastTapTime <= 270) {
                        triggerDash();
                        lastTapTime = 0;
                    } else {
                        lastTapTime = now;
                    }
                }
            }
            swipeTouchId = null;
            swipeMoved = false;
        }
    }
});

document.addEventListener("touchcancel", () => {
    swipeTouchId = null;
    swipeMoved = false;
});

// =========================================================================
// 2) Control táctil por Joystick virtual (más ágil y menor zona muerta)
// =========================================================================
const joystickBase = document.getElementById("joystick-base");
const joystickKnob = document.getElementById("joystick-knob");

if (joystickZone && joystickBase && joystickKnob) {
    const maxRadius = 38;
    const deadZone = 7;
    let activePointerId = null;
    let originX = 0;
    let originY = 0;

    const updateJoystick = (clientX, clientY) => {
        let dx = clientX - originX;
        let dy = clientY - originY;
        const distance = Math.hypot(dx, dy);

        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxRadius;
            dy = Math.sin(angle) * maxRadius;
        }

        joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

        if (distance >= deadZone) {
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            const isHorizontal = pacman.nextDir && pacman.nextDir.x !== 0;
            const isVertical = pacman.nextDir && pacman.nextDir.y !== 0;

            if (isHorizontal) {
                if (absY > absX * 1.1) {
                    setNextDirection(dy > 0 ? DIRS.DOWN : DIRS.UP);
                } else {
                    setNextDirection(dx > 0 ? DIRS.RIGHT : DIRS.LEFT);
                }
            } else if (isVertical) {
                if (absX > absY * 1.1) {
                    setNextDirection(dx > 0 ? DIRS.RIGHT : DIRS.LEFT);
                } else {
                    setNextDirection(dy > 0 ? DIRS.DOWN : DIRS.UP);
                }
            } else {
                setNextDirection(pickAxisDirection(dx, dy));
            }
        }
    };

    const resetJoystick = () => {
        activePointerId = null;
        joystickBase.classList.remove("active");
        joystickBase.style.transform = "translate(0px, 0px)";
        joystickKnob.style.transform = "translate(0px, 0px)";
    };

    joystickZone.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        activePointerId = e.pointerId;
        try {
            joystickZone.setPointerCapture(e.pointerId);
        } catch (_) { }

        const zoneRect = joystickZone.getBoundingClientRect();
        const zoneCenterX = zoneRect.left + zoneRect.width / 2;
        const zoneCenterY = zoneRect.top + zoneRect.height / 2;

        const maxOffsetX = Math.max(0, zoneRect.width / 2 - 60);
        const maxOffsetY = Math.max(0, zoneRect.height / 2 - 58);

        const offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, e.clientX - zoneCenterX));
        const offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, e.clientY - zoneCenterY));

        originX = zoneCenterX + offsetX;
        originY = zoneCenterY + offsetY;

        joystickBase.classList.add("active");
        joystickBase.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        updateJoystick(e.clientX, e.clientY);
    });

    joystickZone.addEventListener("pointermove", (e) => {
        if (e.pointerId !== activePointerId) return;
        updateJoystick(e.clientX, e.clientY);
    });

    joystickZone.addEventListener("pointerup", (e) => {
        if (e.pointerId === activePointerId) resetJoystick();
    });

    joystickZone.addEventListener("pointercancel", (e) => {
        if (e.pointerId === activePointerId) resetJoystick();
    });

    joystickZone.addEventListener("lostpointercapture", resetJoystick);
}

// =========================================================================
// 3) Control táctil por Cruceta (D-Pad) con soporte de deslizamiento
// =========================================================================
if (dpadZone) {
    const dpadButtons = Array.from(dpadZone.querySelectorAll(".dpad-btn"));
    let dpadPointerId = null;
    let activeDpadBtn = null;

    const clearDpadVisual = () => {
        if (activeDpadBtn) {
            activeDpadBtn.classList.remove("pressed");
            activeDpadBtn = null;
        }
    };

    const activateDpadFromPoint = (clientX, clientY) => {
        const el = document.elementFromPoint(clientX, clientY);
        const btn = el ? el.closest(".dpad-btn") : null;
        if (!btn) return;
        const dirKey = btn.dataset.dir;
        if (dirKey && DIRS[dirKey]) {
            if (activeDpadBtn !== btn) {
                clearDpadVisual();
                activeDpadBtn = btn;
                btn.classList.add("pressed");
            }
            setNextDirection(DIRS[dirKey]);
        }
    };

    dpadZone.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        dpadPointerId = e.pointerId;
        try {
            dpadZone.setPointerCapture(e.pointerId);
        } catch (_) { }
        activateDpadFromPoint(e.clientX, e.clientY);
    });

    dpadZone.addEventListener("pointermove", (e) => {
        if (e.pointerId !== dpadPointerId) return;
        activateDpadFromPoint(e.clientX, e.clientY);
    });

    const releaseDpad = (e) => {
        if (!e || e.pointerId === dpadPointerId) {
            dpadPointerId = null;
            clearDpadVisual();
        }
    };

    dpadZone.addEventListener("pointerup", releaseDpad);
    dpadZone.addEventListener("pointercancel", releaseDpad);
    dpadZone.addEventListener("lostpointercapture", () => releaseDpad(null));
    // Evitar click fantasma
    dpadButtons.forEach((b) => b.addEventListener("click", (e) => e.preventDefault()));
}

function togglePause() {
    if (state === "PLAYING") {
        state = "PAUSED";
        sound.stopAllLoops();
        pauseBtn.classList.add("is-paused");
        pauseLabelEl.textContent = "Pausado";
        overlayTitleEl.textContent = "PAUSA";
        overlaySubEl.textContent = "Presiona P o Continuar para seguir";
        startBtn.textContent = "CONTINUAR";
        overlayEl.classList.remove("hidden");
    } else if (state === "PAUSED") {
        state = "PLAYING";
        pauseBtn.classList.remove("is-paused");
        pauseLabelEl.textContent = "Pausar";
        if (frightenedTimer > 0) {
            sound.startPowerLoop();
        } else {
            sound.startBgSiren(getLevelProgress());
        }
        overlayEl.classList.add("hidden");
    }
}

function toggleMute() {
    sound.muted = !sound.muted;
    muteBtn.classList.toggle("is-muted", sound.muted);
    muteLabelEl.textContent = sound.muted ? "Silencio" : "Sonido ON";
    if (sound.muted) {
        sound.stopIntro();
        sound.stopAllLoops();
    } else if (state === "MENU") {
        startMenuMusic();
    } else if (state === "PLAYING") {
        if (frightenedTimer > 0) {
            sound.startPowerLoop();
        } else {
            sound.startBgSiren(getLevelProgress());
        }
    }
}

startBtn.addEventListener("click", () => {
    if (state === "PAUSED") {
        togglePause();
    } else {
        startNewGame();
    }
});

pauseBtn.addEventListener("click", togglePause);
muteBtn.addEventListener("click", toggleMute);

// Registro del Service Worker para modo offline
if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => { });
    });
}

// Inicializar vista previa del mapa e intentar iniciar música de intro automáticamente
loadLevel();
startMenuMusic();
requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(gameLoop);
});
