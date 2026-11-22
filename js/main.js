import {
    TILE,
    COLS,
    ROWS,
    DIRS,
    SCATTER_CORNERS,
    SAVE_KEY,
    EXTRA_LIFE_STEP,
    START_LIVES,
    MAX_LIVES,
    DASH_DURATION,
    FRUIT_MILESTONES,
    ITEM_MILESTONES,
    CONTROL_MODES,
    getWaveSchedule,
    tileCenter,
    posToTile,
    dirToKey,
    keyToDir
} from "./constants.js";
import { LEVELS, cloneMap } from "./maps.js";
import { generateInfiniteLevel } from "./mapGenerator.js";
import { SoundEngine } from "./audio.js";
import { setupInputs } from "./input.js";
import { renderGame } from "./renderer.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const overlayEl = document.getElementById("overlay");
const menuCardEl = overlayEl ? overlayEl.querySelector(".menu-card") : null;
const overlayTitleEl = document.getElementById("overlay-title");
const overlaySubEl = document.getElementById("overlay-subtitle");
const savedBannerEl = document.getElementById("saved-banner");
const menuConfigEl = document.getElementById("menu-config");
const modeNormalBtn = document.getElementById("mode-normal-btn");
const modePowersBtn = document.getElementById("mode-powers-btn");
const modeChaosBtn = document.getElementById("mode-chaos-btn");
const chaosMapWrap = document.getElementById("chaos-map-wrap");
const mapPrevBtn = document.getElementById("map-prev-btn");
const mapNextBtn = document.getElementById("map-next-btn");
const mapCurrentBtn = document.getElementById("map-current-btn");
const mapSwatchEl = document.getElementById("map-swatch");
const mapCurrentNameEl = document.getElementById("map-current-name");
const continueBtn = document.getElementById("continue-btn");
const menuBtn = document.getElementById("menu-btn");
const startBtn = document.getElementById("start-btn");
const statusStripEl = document.getElementById("status-strip");
const toolbarEl = document.getElementById("toolbar");
const gameToastEl = document.getElementById("game-toast");
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

// Estado global del juego
let state = "MENU"; // MENU, READY, PLAYING, PAUSED, DYING, LEVEL_CLEAR, GAME_OVER
let stateTimer = 0;

const sound = new SoundEngine(() => state);

let gameMode = localStorage.getItem("pacman_offline_gamemode") || "ARCADE";
if (gameMode !== "ARCADE" && gameMode !== "CHAOS") gameMode = "ARCADE";
let arcadeSubMode = localStorage.getItem("pacman_offline_arcade_sub") || "POWERS";
if (arcadeSubMode !== "NORMAL" && arcadeSubMode !== "POWERS") arcadeSubMode = "POWERS";
let selectedMapMode = localStorage.getItem("pacman_offline_mapmode") || "RANDOM";
let currentLevelIndex = 0;
let lastPlayedMapIndex = -1;
let activeGeneratedLevel = null;

let grid = [];
let score = 0;
let highScore = Number(localStorage.getItem("pacman_offline_highscore") || 0);
let level = 1;
let lives = START_LIVES;
let nextExtraLifeScore = EXTRA_LIFE_STEP;
let totalDotsInLevel = 1;
let dotsRemaining = 0;
let dotsEatenInLevel = 0;
let dotsSinceLifeStart = 0;
let ghostHouseTimer = 0;

let waveSchedule = [];
let waveIndex = 0;
let waveTimer = 0;
let globalGhostMode = "SCATTER";

let frightenedTimer = 0;
let ghostCombo = 0;

let dashEnergy = 0;
let dashTimer = 0;
let dashTrail = [];

let dotStreak = 0;
let comboTimer = 0;
let comboMultiplier = 1;

let freezeTimer = 0;
let magnetTimer = 0;
let shieldActive = false;
let invulnTimer = 0;

let bonusFruit = null;
let nextFruitMilestoneIdx = 0;

let powerItems = [];
let nextItemMilestoneIdx = 0;
let lifeSpawnedInLevel = false;

let chaosEventTimer = 14;
let chaosGhostCooldown = 12;
let nextChaosBossType = "TITAN";
let autoSaveTimer = 0;

let floatingTexts = [];
let particles = [];
let shockwaves = [];
let screenShake = 0;
let toastTimerId = null;

let lastTime = 0;
let animTick = 0;
let lastVibrateAt = 0;

let controlMode = localStorage.getItem("pacman_offline_control") || "SWIPE";
if (!CONTROL_MODES.includes(controlMode)) controlMode = "SWIPE";

let pacman = {};
let clonePacman = null;
let ghosts = [];

highScoreEl.textContent = highScore;

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

function getLevelConfig() {
    if (activeGeneratedLevel) return activeGeneratedLevel;
    return LEVELS[currentLevelIndex] || LEVELS[0];
}

function isPowersEnabled() {
    return gameMode === "CHAOS" || arcadeSubMode === "POWERS";
}

function syncPowersVisibility() {
    const enabled = isPowersEnabled();
    if (statusStripEl) statusStripEl.classList.toggle("hidden", !enabled);
    if (dashBtn) dashBtn.classList.toggle("hidden", !enabled);
    if (toolbarEl) toolbarEl.classList.toggle("no-dash", !enabled);
}

// =========================================================================
// Selector de controles, modos y carrusel de mapas
// =========================================================================
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

const MAP_OPTIONS = ["RANDOM", "INFINITE", ...LEVELS.map((_, i) => String(i))];

function updateMapPickerUI() {
    if (selectedMapMode !== "RANDOM" && selectedMapMode !== "INFINITE") {
        const parsed = Number(selectedMapMode);
        if (!Number.isInteger(parsed) || parsed < 0 || parsed >= LEVELS.length) {
            selectedMapMode = "RANDOM";
        }
    }

    if (selectedMapMode === "RANDOM") {
        if (mapCurrentNameEl) mapCurrentNameEl.textContent = "🎲 Aleatorio";
        if (mapSwatchEl) {
            mapSwatchEl.style.background = "linear-gradient(135deg, #38bdf8, #a855f7, #facc15)";
            mapSwatchEl.style.boxShadow = "0 0 9px rgba(168, 85, 247, 0.8)";
        }
    } else if (selectedMapMode === "INFINITE") {
        if (mapCurrentNameEl) mapCurrentNameEl.textContent = "♾️ Infinitos";
        if (mapSwatchEl) {
            mapSwatchEl.style.background = "linear-gradient(135deg, #22d3ee, #f43f5e, #facc15)";
            mapSwatchEl.style.boxShadow = "0 0 10px rgba(34, 211, 238, 0.85)";
        }
    } else {
        const idx = Number(selectedMapMode);
        const lvl = LEVELS[idx];
        const color = lvl.theme?.wallStroke || "#38bdf8";
        const shortName = lvl.name.replace(/^Nivel\s+\d+\s*[-–—:]\s*/i, "");
        if (mapCurrentNameEl) mapCurrentNameEl.textContent = `${idx + 1}. ${shortName}`;
        if (mapSwatchEl) {
            mapSwatchEl.style.background = color;
            mapSwatchEl.style.boxShadow = `0 0 10px ${color}`;
        }
    }
}

function applyThemeVisuals(theme) {
    if (!theme) return;
    canvas.style.borderColor = theme.wallStroke;
    canvas.style.boxShadow = `0 0 26px ${theme.glow}`;
    document.body.style.background = `radial-gradient(circle at top, ${theme.wallFill} 0%, #090d16 72%)`;
    if (menuCardEl) {
        menuCardEl.style.borderColor = `${theme.wallStroke}80`;
        menuCardEl.style.boxShadow = `0 12px 32px rgba(0, 0, 0, 0.55), 0 0 24px ${theme.glow}`;
    }
}

function setSelectedMapMode(val, previewOnCanvas = true) {
    selectedMapMode = val;
    localStorage.setItem("pacman_offline_mapmode", selectedMapMode);
    updateMapPickerUI();
    if (previewOnCanvas && state === "MENU" && gameMode === "CHAOS") {
        if (selectedMapMode === "INFINITE") {
            activeGeneratedLevel = generateInfiniteLevel(1);
            loadLevel();
        } else if (selectedMapMode !== "RANDOM") {
            activeGeneratedLevel = null;
            currentLevelIndex = Number(selectedMapMode);
            loadLevel();
        } else {
            activeGeneratedLevel = null;
            currentLevelIndex = 0;
            loadLevel();
        }
    }
}

function syncModeButtonsUI() {
    const activePreset = gameMode === "CHAOS" ? "CHAOS" : arcadeSubMode;
    if (modeNormalBtn) modeNormalBtn.classList.toggle("active", activePreset === "NORMAL");
    if (modePowersBtn) modePowersBtn.classList.toggle("active", activePreset === "POWERS");
    if (modeChaosBtn) modeChaosBtn.classList.toggle("active", activePreset === "CHAOS");
    if (chaosMapWrap) chaosMapWrap.classList.toggle("hidden", gameMode !== "CHAOS");
}

function applyModePreset(preset) {
    if (preset === "CHAOS") {
        gameMode = "CHAOS";
    } else {
        gameMode = "ARCADE";
        arcadeSubMode = preset === "NORMAL" ? "NORMAL" : "POWERS";
    }
    localStorage.setItem("pacman_offline_gamemode", gameMode);
    localStorage.setItem("pacman_offline_arcade_sub", arcadeSubMode);

    syncModeButtonsUI();
    syncPowersVisibility();

    if (state === "MENU") {
        if (gameMode === "CHAOS" && selectedMapMode === "INFINITE") {
            activeGeneratedLevel = generateInfiniteLevel(1);
        } else {
            activeGeneratedLevel = null;
            currentLevelIndex =
                gameMode === "CHAOS" && selectedMapMode !== "RANDOM" ? Number(selectedMapMode) : 0;
        }
        loadLevel();
    }
}

function pickChaosMapIndex(avoidIndex = -1) {
    if (selectedMapMode !== "RANDOM") {
        const idx = Number(selectedMapMode);
        if (Number.isInteger(idx) && idx >= 0 && idx < LEVELS.length) return idx;
    }
    const candidates = [];
    for (let i = 0; i < LEVELS.length; i++) {
        if (i !== avoidIndex || LEVELS.length <= 1) candidates.push(i);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}

updateMapPickerUI();
applyModePreset(gameMode === "CHAOS" ? "CHAOS" : arcadeSubMode);

if (modeNormalBtn) modeNormalBtn.addEventListener("click", () => applyModePreset("NORMAL"));
if (modePowersBtn) modePowersBtn.addEventListener("click", () => applyModePreset("POWERS"));
if (modeChaosBtn) modeChaosBtn.addEventListener("click", () => applyModePreset("CHAOS"));
if (mapPrevBtn) {
    mapPrevBtn.addEventListener("click", () => {
        const idx = MAP_OPTIONS.indexOf(selectedMapMode);
        setSelectedMapMode(MAP_OPTIONS[(idx - 1 + MAP_OPTIONS.length) % MAP_OPTIONS.length]);
    });
}
if (mapNextBtn) {
    mapNextBtn.addEventListener("click", () => {
        const idx = MAP_OPTIONS.indexOf(selectedMapMode);
        setSelectedMapMode(MAP_OPTIONS[(idx + 1) % MAP_OPTIONS.length]);
    });
}
if (mapCurrentBtn) {
    mapCurrentBtn.addEventListener("click", () => setSelectedMapMode("RANDOM"));
}

// =========================================================================
// Helpers de mapa, partículas y HUD
// =========================================================================
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

function pulseHudElement(el) {
    if (!el) return;
    el.classList.remove("hud-pop");
    void el.offsetWidth;
    el.classList.add("hud-pop");
}

function showMilestoneBanner(title, subtitle, color) {
    if (!gameToastEl) return;
    clearTimeout(toastTimerId);

    gameToastEl.style.borderColor = color;
    gameToastEl.style.boxShadow = `0 6px 20px rgba(0, 0, 0, 0.55), 0 0 14px ${color}66`;
    gameToastEl.innerHTML = `<span>${title}</span><span class="game-toast-sub" style="color:${color}">${subtitle}</span>`;
    gameToastEl.classList.remove("hidden");
    void gameToastEl.offsetWidth;
    gameToastEl.classList.add("show");

    toastTimerId = setTimeout(() => {
        gameToastEl.classList.remove("show");
        setTimeout(() => {
            if (!gameToastEl.classList.contains("show")) {
                gameToastEl.classList.add("hidden");
            }
        }, 200);
    }, 2200);
}

function triggerDash() {
    if (!isPowersEnabled()) return;
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
    if (shieldActive) pills += `<span class="power-pill shield">🛡️</span>`;
    if (freezeTimer > 0) pills += `<span class="power-pill">❄️ ${Math.ceil(freezeTimer)}s</span>`;
    if (magnetTimer > 0) pills += `<span class="power-pill magnet">🧲 ${Math.ceil(magnetTimer)}s</span>`;
    if (clonePacman && clonePacman.timer > 0) {
        pills += `<span class="power-pill clone">🤖 ${Math.ceil(clonePacman.timer)}s</span>`;
    }

    const eliteGhost = ghosts.find((g) => g.isChaosGhost || g.isTitanGhost);
    if (eliteGhost && eliteGhost.chaosTimer > 0) {
        if (eliteGhost.isTitanGhost) {
            pills += `<span class="power-pill titan">👹 ${Math.ceil(eliteGhost.chaosTimer)}s</span>`;
        } else {
            pills += `<span class="power-pill chaos">👾 ${Math.ceil(eliteGhost.chaosTimer)}s</span>`;
        }
    }
    powerBadgesEl.innerHTML = pills;
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
    while (score >= nextExtraLifeScore) {
        const milestone = nextExtraLifeScore;
        nextExtraLifeScore += EXTRA_LIFE_STEP;
        const label = milestone.toLocaleString("es-ES");

        sound.extraLife();
        vibrateShort(24);

        if (lives < MAX_LIVES) {
            lives++;
            showMilestoneBanner(`🎉 ¡${label} PUNTOS!`, "💚 +1 VIDA EXTRA", "#4ade80");
            addFloatingText("¡+1 VIDA!", pacman.x, pacman.y - 18, "#4ade80");
            spawnShockwave(pacman.x, pacman.y, "#4ade80", 90);
            spawnShockwave(pacman.x, pacman.y, "#facc15", 56);
            spawnParticles(pacman.x, pacman.y, "#4ade80", 16, 130);
            spawnParticles(pacman.x, pacman.y, "#facc15", 10, 100);
            pulseHudElement(livesEl);
        } else {
            score += 500;
            showMilestoneBanner(`🏆 ¡${label} PUNTOS!`, "VIDAS AL MÁX • +500 BONUS", "#facc15");
            addFloatingText("+500 BONUS!", pacman.x, pacman.y - 18, "#facc15");
            spawnShockwave(pacman.x, pacman.y, "#facc15", 90);
            spawnShockwave(pacman.x, pacman.y, "#38bdf8", 56);
            spawnParticles(pacman.x, pacman.y, "#facc15", 18, 135);
            spawnParticles(pacman.x, pacman.y, "#38bdf8", 10, 100);
            pulseHudElement(scoreEl);
        }
    }
    updateHUD();
    if (x !== undefined && y !== undefined) {
        addFloatingText(`+${points}`, x, y, color);
    }
}

// =========================================================================
// Inicialización de niveles, destrucción de muros, ítems y fantasmas élite
// =========================================================================
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
            isChaosGhost: false,
            isTitanGhost: false,
            chaosTimer: 0,
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
    clonePacman = null;
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
    powerItems = [];
    nextItemMilestoneIdx = 0;
    lifeSpawnedInLevel = false;
    chaosEventTimer = 14;
    chaosGhostCooldown = 12;
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
        applyThemeVisuals(cfg.theme);
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
    clearSavedGame();
    score = 0;
    level = 1;
    lives = START_LIVES;
    nextExtraLifeScore = EXTRA_LIFE_STEP;
    dashEnergy = isPowersEnabled() ? 35 : 0;
    shieldActive = false;

    if (gameMode === "CHAOS") {
        if (selectedMapMode === "INFINITE") {
            activeGeneratedLevel = generateInfiniteLevel(level);
        } else {
            activeGeneratedLevel = null;
            currentLevelIndex = pickChaosMapIndex(lastPlayedMapIndex);
            lastPlayedMapIndex = currentLevelIndex;
        }
    } else {
        activeGeneratedLevel = null;
        currentLevelIndex = 0;
        lastPlayedMapIndex = 0;
    }

    syncPowersVisibility();
    loadLevel();
    overlayEl.classList.add("hidden");
    if (menuConfigEl) menuConfigEl.classList.add("hidden");
    if (savedBannerEl) savedBannerEl.classList.add("hidden");
    if (continueBtn) continueBtn.classList.add("hidden");
    if (menuBtn) menuBtn.classList.add("hidden");
    pauseBtn.classList.remove("is-paused");
    pauseLabelEl.textContent = "Pausar";
    beginReadyPhase();
    saveGameState();
}

function isDestructibleWall(col, row) {
    if (row <= 0 || row >= ROWS - 1 || col <= 0 || col >= COLS - 1) return false;
    const cfg = getLevelConfig();
    const inGhostHouseShell =
        Math.abs(col - cfg.ghostGate.col) <= 3 &&
        row >= cfg.ghostGate.row &&
        row <= cfg.ghostGate.row + 2;
    if (inGhostHouseShell) return false;
    return grid[row]?.[col] === 1;
}

function destroyWallTile(col, row) {
    if (!isDestructibleWall(col, row)) return false;
    grid[row][col] = 2;
    const cfg = getLevelConfig();
    const pos = tileCenter(col, row);
    const color = cfg.theme?.wallStroke || "#38bdf8";
    spawnParticles(pos.x, pos.y, color, 8, 115);
    spawnParticles(pos.x, pos.y, "#facc15", 4, 90);
    return true;
}

function destroyWallsInRadius(centerCol, centerRow, radius = 2) {
    let broken = 0;
    for (let r = centerRow - radius; r <= centerRow + radius; r++) {
        for (let c = centerCol - radius; c <= centerCol + radius; c++) {
            if (Math.hypot(c - centerCol, r - centerRow) <= radius + 0.25) {
                if (destroyWallTile(c, r)) {
                    broken++;
                }
            }
        }
    }
    return broken;
}

function pickOpenSpawnPosition(avoidList = []) {
    const validTiles = [];
    const cfg = getLevelConfig();
    for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
            if (grid[r][c] !== 0 && grid[r][c] !== 2) continue;
            const inHouse =
                Math.abs(c - cfg.ghostGate.col) <= 2 &&
                r >= cfg.ghostGate.row - 1 &&
                r <= cfg.ghostGate.row + 2;
            if (inHouse) continue;
            const pos = tileCenter(c, r);
            if (Math.hypot(pos.x - pacman.x, pos.y - pacman.y) < TILE * 3.5) continue;
            let tooClose = false;
            for (const other of avoidList) {
                if (other && Math.hypot(pos.x - other.x, pos.y - other.y) < TILE * 2.2) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            validTiles.push(pos);
        }
    }
    if (validTiles.length === 0) return null;
    return validTiles[Math.floor(Math.random() * validTiles.length)];
}

function spawnBonusFruit() {
    const pos = pickOpenSpawnPosition(powerItems);
    if (!pos) return;
    const isRotten = isPowersEnabled() && Math.random() < 0.3;
    bonusFruit = {
        x: pos.x,
        y: pos.y,
        timer: 10,
        points: 150 * level,
        isRotten
    };
    spawnShockwave(pos.x, pos.y, isRotten ? "#84cc16" : "#ef4444", 30);
}

function spawnSpecialItem(isChaosRain = false) {
    if (!isPowersEnabled()) return;
    const maxItems = gameMode === "CHAOS" ? 2 : 1;
    if (powerItems.length >= maxItems) return;

    const avoid = bonusFruit ? [bonusFruit, ...powerItems] : [...powerItems];
    const pos = pickOpenSpawnPosition(avoid);
    if (!pos) return;

    let type;
    const canSpawnLife =
        lives < START_LIVES &&
        !lifeSpawnedInLevel &&
        !powerItems.some((it) => it.type === "LIFE");
    const lifeChance = lives <= 2 ? 0.35 : 0.15;

    if (canSpawnLife && Math.random() < lifeChance) {
        type = "LIFE";
        lifeSpawnedInLevel = true;
    } else {
        const pool = ["FREEZE", "MAGNET"];
        if (!shieldActive) pool.push("SHIELD");
        if (!clonePacman && !powerItems.some((it) => it.type === "CLONE")) pool.push("CLONE");
        if (gameMode === "CHAOS") pool.push("BOMB");
        type = pool[Math.floor(Math.random() * pool.length)];
    }

    powerItems.push({
        type,
        x: pos.x,
        y: pos.y,
        timer: type === "LIFE" ? 13 : 10.5
    });
    const waveColor =
        type === "LIFE"
            ? "#4ade80"
            : type === "BOMB"
                ? "#f97316"
                : type === "CLONE"
                    ? "#67e8f9"
                    : "#38bdf8";
    spawnShockwave(pos.x, pos.y, waveColor, 38);
}

function spawnChaosGhost() {
    if (ghosts.some((g) => g.isChaosGhost || g.isTitanGhost)) return;
    const cfg = getLevelConfig();
    const spawnPos = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row - 1);
    const baseGhostSpeed = 92 + Math.min(level - 1, 6) * 5.5;

    ghosts.push({
        x: spawnPos.x,
        y: spawnPos.y,
        dir: DIRS.LEFT,
        color: "#a855f7",
        type: "chaos",
        name: "Caos",
        speed: baseGhostSpeed * 1.24,
        state: frightenedTimer > 0 ? "FRIGHTENED" : "NORMAL",
        homeX: spawnPos.x,
        homeY: spawnPos.y,
        releaseDots: 0,
        releaseTime: 0,
        reversePending: false,
        recoveredFromPower: false,
        isChaosGhost: true,
        isTitanGhost: false,
        chaosTimer: 14,
        lastTileKey: "",
        bobPhase: 0
    });

    sound.chaosGhost();
    spawnShockwave(spawnPos.x, spawnPos.y, "#a855f7", 75);
    spawnParticles(spawnPos.x, spawnPos.y, "#c084fc", 18, 120);
    showMilestoneBanner("👾 ¡FANTASMA CAÓTICO!", "Veloz por 14s", "#c084fc");
    updateStatusStrip();
}

function spawnTitanGhost() {
    if (ghosts.some((g) => g.isChaosGhost || g.isTitanGhost)) return;
    const cfg = getLevelConfig();
    const spawnPos = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row - 1);
    const baseGhostSpeed = 92 + Math.min(level - 1, 6) * 5.5;

    ghosts.push({
        x: spawnPos.x,
        y: spawnPos.y,
        dir: DIRS.LEFT,
        color: "#f97316",
        type: "titan",
        name: "Titán",
        speed: baseGhostSpeed * 0.84,
        state: frightenedTimer > 0 ? "FRIGHTENED" : "NORMAL",
        homeX: spawnPos.x,
        homeY: spawnPos.y,
        releaseDots: 0,
        releaseTime: 0,
        reversePending: false,
        recoveredFromPower: false,
        isChaosGhost: false,
        isTitanGhost: true,
        chaosTimer: 16,
        lastTileKey: "",
        bobPhase: 0
    });

    sound.bomb();
    screenShake = 0.22;
    spawnShockwave(spawnPos.x, spawnPos.y, "#f97316", 90);
    spawnParticles(spawnPos.x, spawnPos.y, "#fb923c", 22, 130);
    showMilestoneBanner("👹 ¡TITÁN DESTRUCTOR!", "Rompe muros por 16s", "#fb923c");
    updateStatusStrip();
}

// =========================================================================
// Lógica de Pac-Man (giros ágiles sin necesidad de anticipación extrema
// y SIN giro automático en esquinas en L)
// =========================================================================
function eatTileDot(row, col) {
    const tileVal = grid[row]?.[col];
    if (tileVal !== 0 && tileVal !== 3) return;

    grid[row][col] = 2;
    dotsRemaining--;
    dotsEatenInLevel++;
    dotsSinceLifeStart++;

    if (isPowersEnabled()) {
        dotStreak++;
        comboTimer = 1.85;
        if (dotStreak >= 32) comboMultiplier = 4;
        else if (dotStreak >= 18) comboMultiplier = 3;
        else if (dotStreak >= 8) comboMultiplier = 2;
        else comboMultiplier = 1;

        if (dashTimer <= 0) {
            dashEnergy = Math.min(100, dashEnergy + (tileVal === 3 ? 20 : 5));
        }
    } else {
        dotStreak = 0;
        comboTimer = 0;
        comboMultiplier = 1;
        dashEnergy = 0;
    }

    const pos = tileCenter(col, row);
    sound.updateBgSiren(getLevelProgress());

    if (tileVal === 0) {
        addScore(10 * comboMultiplier);
        sound.chomp(1 + (comboMultiplier - 1) * 0.08);
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
        spawnSpecialItem(false);
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

    // 1. Giro inmediato de 180 grados en el mismo eje
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

    // 3. Movimiento preciso con ventana de giro cómoda (~7.2px antes/después del centro)
    //    para no tener que anticiparse demasiado, pero SIN giro automático en esquinas en L
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
        const distToCenter = Math.hypot(prevX - center.x, prevY - center.y);
        const turnWindow = TILE * 0.30; // ~7.2px: atrapa el giro al llegar o un instante después de cruzar

        const wantsPerpTurn =
            pacman.nextDir !== DIRS.NONE &&
            (pacman.nextDir.x !== pacman.dir.x || pacman.nextDir.y !== pacman.dir.y);

        if (
            wantsPerpTurn &&
            (distToCenter <= turnWindow || crossedCenterX || crossedCenterY) &&
            canMove(col, row, pacman.nextDir, false)
        ) {
            const distUsed = Math.min(step, distToCenter);
            const leftover = Math.max(0, step - distUsed * 0.35);
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
                const targetCol = col + pacman.dir.x;
                const targetRow = row + pacman.dir.y;
                if (gameMode === "CHAOS" && dashTimer > 0 && destroyWallTile(targetCol, targetRow)) {
                    sound.wallBreak();
                    screenShake = Math.max(screenShake, 0.14);
                    vibrateShort(14);
                    pacman.x = nextX;
                    pacman.y = nextY;
                    pacman.mouth += dt * 22;
                } else {
                    pacman.x = center.x;
                    pacman.y = center.y;
                    pacman.dir = DIRS.NONE;
                }
            } else {
                pacman.x = nextX;
                pacman.y = nextY;
                pacman.mouth += dt * (dashTimer > 0 ? 22 : 14);
            }
        }
    }

    if (dashTimer > 0 && pacman.dir !== DIRS.NONE) {
        dashTrail.push({ x: pacman.x, y: pacman.y, life: 0.22 });
    }

    if (pacman.x < 0) pacman.x += COLS * TILE;
    if (pacman.x >= COLS * TILE) pacman.x -= COLS * TILE;

    const cur = posToTile(pacman.x, pacman.y);
    eatTileDot(cur.row, cur.col);

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

    // Frutas clásicas y tóxicas (el Imán NO las atrae)
    if (bonusFruit) {
        bonusFruit.timer -= dt;
        if (bonusFruit.timer <= 0) {
            bonusFruit = null;
        } else if (Math.hypot(pacman.x - bonusFruit.x, pacman.y - bonusFruit.y) < TILE * 0.72) {
            const f = bonusFruit;
            bonusFruit = null;

            if (f.isRotten) {
                if (shieldActive || dashTimer > 0) {
                    addScore(100, f.x, f.y, "#84cc16");
                    addFloatingText("¡PURIFICADA!", f.x, f.y - 16, "#a3e635");
                    sound.fruit();
                    spawnShockwave(f.x, f.y, "#84cc16", 44);
                    spawnParticles(f.x, f.y, "#84cc16", 12, 100);
                    spawnParticles(f.x, f.y, "#a855f7", 8, 90);
                } else {
                    const penalty = 100 * level;
                    score = Math.max(0, score - penalty);
                    dotStreak = 0;
                    comboMultiplier = 1;
                    comboTimer = 0;
                    dashEnergy = Math.max(0, dashEnergy - 20);
                    updateHUD();
                    sound.rottenFruit();
                    screenShake = 0.2;
                    vibrateShort(26);
                    addFloatingText(`-${penalty} ☠️`, f.x, f.y, "#a3e635");
                    spawnShockwave(f.x, f.y, "#7e22ce", 48);
                    spawnParticles(f.x, f.y, "#7e22ce", 12, 95);
                    spawnParticles(f.x, f.y, "#84cc16", 10, 85);
                }
            } else {
                if (isPowersEnabled() && dashTimer <= 0) dashEnergy = Math.min(100, dashEnergy + 20);
                addScore(f.points, f.x, f.y, "#4ade80");
                sound.fruit();
                spawnParticles(f.x, f.y, "#ef4444", 12, 95);
            }
            updateStatusStrip();
        }
    }

    // Power-Ups especiales
    for (let i = powerItems.length - 1; i >= 0; i--) {
        const item = powerItems[i];
        item.timer -= dt;
        if (item.timer <= 0) {
            powerItems.splice(i, 1);
            continue;
        }
        if (Math.hypot(pacman.x - item.x, pacman.y - item.y) < TILE * 0.72) {
            powerItems.splice(i, 1);
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
                    pulseHudElement(livesEl);
                    addFloatingText("¡+1 VIDA!", item.x, item.y - 16, "#4ade80");
                    sound.extraLife();
                } else {
                    addScore(300, item.x, item.y, "#4ade80");
                    sound.fruit();
                }
                spawnShockwave(item.x, item.y, "#4ade80", 80);
                spawnParticles(item.x, item.y, "#4ade80", 16, 115);
            } else if (item.type === "BOMB") {
                const tile = posToTile(item.x, item.y);
                const broken = destroyWallsInRadius(tile.col, tile.row, 2);
                addScore(150 + broken * 20, item.x, item.y, "#fb923c");
                addFloatingText("💥 ¡BOMBA!", item.x, item.y - 16, "#fb923c");
                sound.bomb();
                screenShake = 0.32;
                vibrateShort(30);
                spawnShockwave(item.x, item.y, "#f97316", 105);
                spawnShockwave(item.x, item.y, "#facc15", 65);
                spawnParticles(item.x, item.y, "#f97316", 24, 150);
            } else if (item.type === "CLONE") {
                spawnClonePacman(item.x, item.y);
                addScore(100, item.x, item.y, "#67e8f9");
            }
            updateStatusStrip();
        }
    }
}

function spawnClonePacman(x, y) {
    const t = posToTile(x, y);
    const center = tileCenter(t.col, t.row);
    const startDir =
        [DIRS.LEFT, DIRS.RIGHT, DIRS.UP, DIRS.DOWN].find(
            (d) => canMove(t.col, t.row, d, false)
        ) || DIRS.RIGHT;

    clonePacman = {
        x: center.x,
        y: center.y,
        dir: startDir,
        facingDir: startDir,
        speed: pacman.speed * 1.06,
        mouth: 0,
        timer: 10,
        lastTileKey: ""
    };

    sound.cloneSpawn();
    spawnShockwave(center.x, center.y, "#38bdf8", 75);
    spawnParticles(center.x, center.y, "#67e8f9", 18, 120);
    addFloatingText("🤖 ¡CLON!", center.x, center.y - 16, "#67e8f9");
    showMilestoneBanner("🤖 ¡CLON HOLOGRÁFICO!", "Atrae fantasmas y come puntos (10s)", "#38bdf8");
    updateStatusStrip();
}

function chooseCloneDirection(col, row) {
    const candidates = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];
    const valid = candidates.filter((d) => canMove(col, row, d, false));

    if (valid.length === 0) return DIRS.NONE;

    let options = valid.filter((d) => !(d.x === -clonePacman.dir.x && d.y === -clonePacman.dir.y));
    if (options.length === 0) options = valid;

    let bestDir = options[0];
    let bestScore = -Infinity;

    for (const d of options) {
        const nc = (col + d.x + COLS) % COLS;
        const nr = row + d.y;
        let s = Math.random() * 1.5;

        // Priorizar comer puntos y super puntos
        const cell = grid[nr]?.[nc];
        if (cell === 0) s += 14;
        else if (cell === 3) s += 18;

        // Evaluar fantasmas cercanos
        for (const g of ghosts) {
            if (g.state === "IN_HOUSE" || g.state === "EXITING" || g.state === "EATEN") continue;
            const gt = posToTile(g.x, g.y);
            const dist = Math.hypot(nc - gt.col, nr - gt.row);
            if (g.state === "FRIGHTENED") {
                if (dist < 6) s += (6 - dist) * 5;
            } else {
                if (dist < 4.5) s -= (4.5 - dist) * 16;
            }
        }

        if (s > bestScore) {
            bestScore = s;
            bestDir = d;
        }
    }
    return bestDir;
}

function updateClonePacman(dt) {
    if (!clonePacman) return;

    const prevSec = Math.ceil(clonePacman.timer);
    clonePacman.timer -= dt;
    if (Math.ceil(clonePacman.timer) !== prevSec) updateStatusStrip();

    if (clonePacman.timer <= 0) {
        sound.cloneVanish();
        spawnParticles(clonePacman.x, clonePacman.y, "#67e8f9", 16, 110);
        spawnShockwave(clonePacman.x, clonePacman.y, "#38bdf8", 42);
        clonePacman = null;
        updateStatusStrip();
        return;
    }

    const step = clonePacman.speed * dt;
    const { col, row } = posToTile(clonePacman.x, clonePacman.y);
    const center = tileCenter(col, row);
    const tileKey = `${col},${row}`;

    if (clonePacman.dir.x !== 0) clonePacman.y = center.y;
    if (clonePacman.dir.y !== 0) clonePacman.x = center.x;

    const dist = Math.hypot(clonePacman.x - center.x, clonePacman.y - center.y);
    if (
        (dist <= step + 1.5 && clonePacman.lastTileKey !== tileKey) ||
        (!canMove(col, row, clonePacman.dir, false) && dist <= step + 1.5)
    ) {
        clonePacman.x = center.x;
        clonePacman.y = center.y;
        clonePacman.dir = chooseCloneDirection(col, row);
        clonePacman.lastTileKey = tileKey;
    }

    if (clonePacman.dir !== DIRS.NONE) {
        clonePacman.facingDir = clonePacman.dir;
        clonePacman.x += clonePacman.dir.x * step;
        clonePacman.y += clonePacman.dir.y * step;
        clonePacman.mouth += dt * 16;
    }

    if (clonePacman.x < 0) clonePacman.x += COLS * TILE;
    if (clonePacman.x >= COLS * TILE) clonePacman.x -= COLS * TILE;

    // El Clon come puntos para el jugador
    const cur = posToTile(clonePacman.x, clonePacman.y);
    eatTileDot(cur.row, cur.col);
    if (state !== "PLAYING") return;

    // Colisión del Clon con fantasmas
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const g = ghosts[i];
        if (g.state === "EATEN" || g.state === "IN_HOUSE" || g.state === "EXITING") continue;
        const hitDist = g.isTitanGhost ? TILE * 0.82 : TILE * 0.66;
        if (Math.hypot(g.x - clonePacman.x, g.y - clonePacman.y) < hitDist) {
            if (g.state === "FRIGHTENED") {
                ghostCombo++;
                const basePts = 200 * Math.pow(2, ghostCombo - 1);
                const pts = g.isTitanGhost ? Math.max(600, basePts) : basePts;
                addScore(pts, g.x, g.y, "#67e8f9");
                sound.eatGhost();
                spawnParticles(g.x, g.y, "#67e8f9", 16, 125);
                spawnShockwave(g.x, g.y, "#38bdf8", 46);
                if (g.isChaosGhost || g.isTitanGhost) {
                    ghosts.splice(i, 1);
                    updateStatusStrip();
                } else {
                    g.state = "EATEN";
                    g.lastTileKey = "";
                }
            } else {
                // El fantasma atrapa al Clon señuelo (sin quitar vida al jugador)
                sound.cloneVanish();
                spawnParticles(clonePacman.x, clonePacman.y, "#67e8f9", 22, 135);
                spawnShockwave(clonePacman.x, clonePacman.y, "#38bdf8", 55);
                addFloatingText("🤖 ¡SEÑUELO!", clonePacman.x, clonePacman.y - 12, "#67e8f9");
                clonePacman = null;
                updateStatusStrip();
                return;
            }
        }
    }
}

// =========================================================================
// IA de fantasmas (reglas clásicas + Caos + Titán Destructor)
// =========================================================================
function getGhostTargetTile(ghost) {
    const cfg = getLevelConfig();

    if (ghost.state === "EATEN") {
        return { col: cfg.ghostGate.col, row: cfg.ghostGate.row };
    }

    // Si el Clon Holográfico está activo, atrae como señuelo a todos los fantasmas perseguidores
    const targetActor = clonePacman || pacman;
    const pTile = posToTile(targetActor.x, targetActor.y);

    if (ghost.isChaosGhost || ghost.isTitanGhost) {
        return { col: pTile.col, row: pTile.row };
    }

    const isCruiseElroy =
        ghost.type === "chaser" && dotsRemaining <= Math.max(12, Math.floor(totalDotsInLevel * 0.14));

    if (globalGhostMode === "SCATTER" && !isCruiseElroy && !clonePacman) {
        return SCATTER_CORNERS[ghost.type] || SCATTER_CORNERS.chaser;
    }

    const pFace = targetActor.facingDir || DIRS.RIGHT;

    if (ghost.type === "chaser") {
        return { col: pTile.col, row: pTile.row };
    }
    if (ghost.type === "ambusher") {
        return {
            col: pTile.col + pFace.x * 4,
            row: pTile.row + pFace.y * 4
        };
    }
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

    const gTile = posToTile(ghost.x, ghost.y);
    if (Math.hypot(gTile.col - pTile.col, gTile.row - pTile.row) > 6) {
        return { col: pTile.col, row: pTile.row };
    }
    return SCATTER_CORNERS.clyde;
}

function canGhostStep(col, row, dir, ghost) {
    const allowGate = ghost.state === "EATEN";
    if (canMove(col, row, dir, allowGate)) return true;
    if (ghost.isTitanGhost && ghost.state === "NORMAL" && dir && (dir.x !== 0 || dir.y !== 0)) {
        if (isDestructibleWall(col + dir.x, row + dir.y)) return true;
    }
    return false;
}

function chooseGhostDirection(ghost, col, row) {
    const candidates = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];

    if (ghost.reversePending) {
        ghost.reversePending = false;
        const rev = { x: -ghost.dir.x, y: -ghost.dir.y };
        if (canGhostStep(col, row, rev, ghost)) {
            return rev;
        }
    }

    const options = candidates.filter((d) => {
        if (d.x === -ghost.dir.x && d.y === -ghost.dir.y) return false;
        return canGhostStep(col, row, d, ghost);
    });

    if (options.length === 0) {
        const rev = { x: -ghost.dir.x, y: -ghost.dir.y };
        return canGhostStep(col, row, rev, ghost) ? rev : DIRS.NONE;
    }
    if (options.length === 1) return options[0];
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

function checkGhostCollision(ghost) {
    if (ghost.state === "EATEN" || ghost.state === "IN_HOUSE" || ghost.state === "EXITING") return;

    const hitDist = ghost.isTitanGhost ? TILE * 0.84 : TILE * 0.68;
    if (Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y) < hitDist) {
        if (ghost.state === "FRIGHTENED") {
            ghostCombo++;
            const basePts = 200 * Math.pow(2, ghostCombo - 1);
            const pts = ghost.isTitanGhost ? Math.max(600, basePts) : basePts;
            addScore(pts, ghost.x, ghost.y, ghost.isTitanGhost ? "#fb923c" : "#38bdf8");
            sound.eatGhost();
            screenShake = ghost.isTitanGhost ? 0.24 : 0.16;
            spawnParticles(ghost.x, ghost.y, ghost.isTitanGhost ? "#fb923c" : "#38bdf8", 18, 130);
            spawnShockwave(ghost.x, ghost.y, ghost.isTitanGhost ? "#fb923c" : "#38bdf8", 52);
            if (ghost.isChaosGhost || ghost.isTitanGhost) {
                const idx = ghosts.indexOf(ghost);
                if (idx !== -1) ghosts.splice(idx, 1);
                updateStatusStrip();
            } else {
                ghost.state = "EATEN";
                ghost.lastTileKey = "";
            }
            vibrateShort(18);
            return;
        }

        if (invulnTimer > 0) return;

        if (shieldActive) {
            shieldActive = false;
            invulnTimer = 1.6;
            screenShake = 0.25;
            sound.shieldBreak();
            spawnShockwave(pacman.x, pacman.y, "#a855f7", 110);
            spawnParticles(pacman.x, pacman.y, "#c084fc", 24, 150);
            addFloatingText("¡ESCUDO!", pacman.x, pacman.y - 12, "#c084fc");
            vibrateShort(25);

            if (gameMode === "CHAOS") {
                const pTile = posToTile(pacman.x, pacman.y);
                destroyWallsInRadius(pTile.col, pTile.row, 2);
            }

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

function updateGhosts(dt) {
    const cfg = getLevelConfig();

    if (frightenedTimer > 0) {
        frightenedTimer = Math.max(0, frightenedTimer - dt);
        if (frightenedTimer === 0) {
            for (const g of ghosts) {
                if (g.state === "FRIGHTENED") g.state = "NORMAL";
            }
            sound.stopPowerLoop();
            sound.startBgSiren(getLevelProgress());
        }
    }

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

    for (let gi = ghosts.length - 1; gi >= 0; gi--) {
        const ghost = ghosts[gi];

        if (ghost.isChaosGhost || ghost.isTitanGhost) {
            const prevSec = Math.ceil(ghost.chaosTimer);
            if (freezeTimer <= 0) ghost.chaosTimer -= dt;
            if (Math.ceil(ghost.chaosTimer) !== prevSec) updateStatusStrip();
            if (ghost.chaosTimer <= 0) {
                const fxColor = ghost.isTitanGhost ? "#f97316" : "#a855f7";
                spawnParticles(ghost.x, ghost.y, fxColor, 20, 125);
                spawnShockwave(ghost.x, ghost.y, fxColor, 50);
                ghosts.splice(gi, 1);
                updateStatusStrip();
                continue;
            }
        }

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

        if (freezeTimer > 0 && ghost.state !== "EATEN") {
            checkGhostCollision(ghost);
            if (state !== "PLAYING") return;
            continue;
        }

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

        if (dist <= step + 1.5 && ghost.lastTileKey !== tileKey) {
            ghost.x = center.x;
            ghost.y = center.y;
            ghost.dir = chooseGhostDirection(ghost, col, row);
            ghost.lastTileKey = tileKey;
        } else if (!canGhostStep(col, row, ghost.dir, ghost) && dist <= step + 1.5) {
            ghost.x = center.x;
            ghost.y = center.y;
            ghost.dir = chooseGhostDirection(ghost, col, row);
        }

        if (ghost.isTitanGhost && ghost.state === "NORMAL" && (ghost.dir.x !== 0 || ghost.dir.y !== 0)) {
            const aheadCol = col + ghost.dir.x;
            const aheadRow = row + ghost.dir.y;
            if (isDestructibleWall(aheadCol, aheadRow)) {
                destroyWallTile(aheadCol, aheadRow);
                sound.wallBreak();
                screenShake = Math.max(screenShake, 0.09);
            }
        }

        ghost.x += ghost.dir.x * step;
        ghost.y += ghost.dir.y * step;

        if (ghost.x < 0) ghost.x += COLS * TILE;
        if (ghost.x >= COLS * TILE) ghost.x -= COLS * TILE;

        checkGhostCollision(ghost);
        if (state !== "PLAYING") return;
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

    if (invulnTimer > 0) invulnTimer = Math.max(0, invulnTimer - dt);
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt);

    if (state === "PLAYING" && gameMode === "CHAOS") {
        chaosEventTimer -= dt;
        if (chaosEventTimer <= 0) {
            chaosEventTimer = 14;
            spawnSpecialItem(true);
        }

        if (!ghosts.some((g) => g.isChaosGhost || g.isTitanGhost)) {
            chaosGhostCooldown -= dt;
            if (chaosGhostCooldown <= 0) {
                if (nextChaosBossType === "TITAN") {
                    spawnTitanGhost();
                    nextChaosBossType = "CHAOS";
                } else {
                    spawnChaosGhost();
                    nextChaosBossType = "TITAN";
                }
                chaosGhostCooldown = 20;
            }
        }
    }

    if (state === "PLAYING") {
        autoSaveTimer += dt;
        if (autoSaveTimer >= 3) {
            autoSaveTimer = 0;
            saveGameState();
        }
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

// =========================================================================
// Auto-guardado nativo (localStorage: pacman_offline_savestate)
// =========================================================================
function clearSavedGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (_) { }
}

function saveGameState() {
    if (
        (state !== "PLAYING" && state !== "PAUSED" && state !== "READY") ||
        lives <= 0 ||
        !grid ||
        grid.length !== ROWS
    ) {
        return;
    }

    const payload = {
        version: 1,
        savedAt: Date.now(),
        mode: gameMode,
        arcadeSubMode,
        selectedMapMode,
        currentLevelIndex,
        generatedMeta: activeGeneratedLevel
            ? {
                name: activeGeneratedLevel.name,
                isGenerated: true,
                theme: activeGeneratedLevel.theme,
                pacmanSpawn: activeGeneratedLevel.pacmanSpawn,
                ghostGate: activeGeneratedLevel.ghostGate,
                ghostSpawns: activeGeneratedLevel.ghostSpawns
            }
            : null,
        score,
        level,
        lives,
        nextExtraLifeScore,
        grid: cloneMap(grid),
        totalDotsInLevel,
        dotsRemaining,
        dotsEatenInLevel,
        dotsSinceLifeStart,
        ghostHouseTimer,
        nextFruitMilestoneIdx,
        nextItemMilestoneIdx,
        lifeSpawnedInLevel,
        waveIndex,
        waveTimer: waveTimer === Infinity ? "INF" : waveTimer,
        globalGhostMode,
        pacman: {
            x: pacman.x,
            y: pacman.y,
            dir: dirToKey(pacman.dir),
            nextDir: dirToKey(pacman.nextDir),
            facingDir: dirToKey(pacman.facingDir),
            speed: pacman.speed,
            mouth: pacman.mouth
        },
        ghosts: ghosts.map((g) => ({
            x: g.x,
            y: g.y,
            dir: dirToKey(g.dir),
            color: g.color,
            type: g.type,
            name: g.name,
            speed: g.speed,
            state: g.state,
            homeX: g.homeX,
            homeY: g.homeY,
            releaseDots: g.releaseDots,
            releaseTime: g.releaseTime,
            reversePending: !!g.reversePending,
            recoveredFromPower: !!g.recoveredFromPower,
            isChaosGhost: !!g.isChaosGhost,
            isTitanGhost: !!g.isTitanGhost,
            chaosTimer: g.chaosTimer || 0,
            bobPhase: g.bobPhase || 0
        })),
        turbo: { dashEnergy, dashTimer },
        combo: { dotStreak, comboTimer, comboMultiplier },
        powers: {
            frightenedTimer,
            ghostCombo,
            freezeTimer,
            magnetTimer,
            shieldActive,
            invulnTimer,
            chaosEventTimer,
            chaosGhostCooldown,
            nextChaosBossType
        },
        bonusFruit: bonusFruit ? { ...bonusFruit } : null,
        powerItems: powerItems.map((it) => ({ ...it })),
        clonePacman: clonePacman
            ? {
                x: clonePacman.x,
                y: clonePacman.y,
                dir: dirToKey(clonePacman.dir),
                facingDir: dirToKey(clonePacman.facingDir),
                speed: clonePacman.speed,
                mouth: clonePacman.mouth,
                timer: clonePacman.timer
            }
            : null
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (_) { }
}

function readSavedGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (
            !data ||
            !Array.isArray(data.grid) ||
            data.grid.length !== ROWS ||
            !Array.isArray(data.grid[0]) ||
            data.grid[0].length !== COLS ||
            typeof data.lives !== "number" ||
            data.lives <= 0 ||
            !data.pacman ||
            !Array.isArray(data.ghosts) ||
            data.ghosts.length === 0
        ) {
            return null;
        }
        return data;
    } catch (_) {
        return null;
    }
}

function restoreSavedGame() {
    const data = readSavedGame();
    if (!data) return false;

    sound.init();
    sound.stopIntro();

    gameMode = data.mode === "CHAOS" ? "CHAOS" : "ARCADE";
    arcadeSubMode = data.arcadeSubMode === "NORMAL" ? "NORMAL" : "POWERS";
    selectedMapMode = data.selectedMapMode || "RANDOM";
    syncModeButtonsUI();
    syncPowersVisibility();
    updateMapPickerUI();

    currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, Number(data.currentLevelIndex) || 0));
    lastPlayedMapIndex = currentLevelIndex;
    activeGeneratedLevel = data.generatedMeta
        ? { ...data.generatedMeta, map: cloneMap(data.grid) }
        : null;

    score = Math.max(0, Number(data.score) || 0);
    level = Math.max(1, Number(data.level) || 1);
    lives = Math.max(1, Math.min(MAX_LIVES, Number(data.lives) || START_LIVES));
    nextExtraLifeScore = Math.max(EXTRA_LIFE_STEP, Number(data.nextExtraLifeScore) || EXTRA_LIFE_STEP);

    grid = cloneMap(data.grid).map((row) => row.map((cell) => (cell === 5 ? 2 : cell)));
    totalDotsInLevel = Math.max(1, Number(data.totalDotsInLevel) || 1);
    dotsRemaining = Math.max(1, Number(data.dotsRemaining) || 1);
    dotsEatenInLevel = Math.max(0, Number(data.dotsEatenInLevel) || 0);
    dotsSinceLifeStart = Math.max(0, Number(data.dotsSinceLifeStart) || 0);
    ghostHouseTimer = Math.max(0, Number(data.ghostHouseTimer) || 0);

    nextFruitMilestoneIdx = Math.max(0, Number(data.nextFruitMilestoneIdx) || 0);
    nextItemMilestoneIdx = Math.max(0, Number(data.nextItemMilestoneIdx) || 0);
    lifeSpawnedInLevel = !!data.lifeSpawnedInLevel;

    waveSchedule = getWaveSchedule(level);
    waveIndex = Math.max(0, Math.min(waveSchedule.length - 1, Number(data.waveIndex) || 0));
    waveTimer = data.waveTimer === "INF" ? Infinity : Math.max(0, Number(data.waveTimer) || 5);
    globalGhostMode = data.globalGhostMode === "CHASE" ? "CHASE" : "SCATTER";

    pacman = {
        x: Number(data.pacman.x),
        y: Number(data.pacman.y),
        dir: keyToDir(data.pacman.dir),
        nextDir: keyToDir(data.pacman.nextDir),
        facingDir: keyToDir(data.pacman.facingDir) || DIRS.RIGHT,
        speed: Number(data.pacman.speed) || (112 + Math.min(level - 1, 5) * 4),
        mouth: Number(data.pacman.mouth) || 0
    };

    ghosts = data.ghosts.map((g) => ({
        x: Number(g.x),
        y: Number(g.y),
        dir: keyToDir(g.dir),
        color: g.color || "#ef4444",
        type: g.type || "chaser",
        name: g.name || "Ghost",
        speed: Number(g.speed) || 92,
        state: g.state || "NORMAL",
        homeX: Number(g.homeX),
        homeY: Number(g.homeY),
        releaseDots: Number(g.releaseDots) || 0,
        releaseTime: Number(g.releaseTime) || 0,
        reversePending: !!g.reversePending,
        recoveredFromPower: !!g.recoveredFromPower,
        isChaosGhost: !!g.isChaosGhost,
        isTitanGhost: !!g.isTitanGhost,
        chaosTimer: Number(g.chaosTimer) || 0,
        lastTileKey: "",
        bobPhase: Number(g.bobPhase) || 0
    }));

    dashEnergy = Math.max(0, Math.min(100, Number(data.turbo?.dashEnergy) || 0));
    dashTimer = Math.max(0, Number(data.turbo?.dashTimer) || 0);
    dashTrail = [];

    dotStreak = Math.max(0, Number(data.combo?.dotStreak) || 0);
    comboTimer = Math.max(0, Number(data.combo?.comboTimer) || 0);
    comboMultiplier = Math.max(1, Number(data.combo?.comboMultiplier) || 1);

    frightenedTimer = Math.max(0, Number(data.powers?.frightenedTimer) || 0);
    ghostCombo = Math.max(0, Number(data.powers?.ghostCombo) || 0);
    freezeTimer = Math.max(0, Number(data.powers?.freezeTimer) || 0);
    magnetTimer = Math.max(0, Number(data.powers?.magnetTimer) || 0);
    shieldActive = !!data.powers?.shieldActive;
    invulnTimer = Math.max(0, Number(data.powers?.invulnTimer) || 0);
    chaosEventTimer = Math.max(0.5, Number(data.powers?.chaosEventTimer) || 14);
    chaosGhostCooldown = Math.max(1, Number(data.powers?.chaosGhostCooldown) || 12);
    nextChaosBossType = data.powers?.nextChaosBossType === "CHAOS" ? "CHAOS" : "TITAN";

    bonusFruit = data.bonusFruit ? { ...data.bonusFruit } : null;
    powerItems = Array.isArray(data.powerItems) ? data.powerItems.map((it) => ({ ...it })) : [];
    clonePacman = data.clonePacman
        ? {
            x: Number(data.clonePacman.x),
            y: Number(data.clonePacman.y),
            dir: keyToDir(data.clonePacman.dir),
            facingDir: keyToDir(data.clonePacman.facingDir) || DIRS.RIGHT,
            speed: Number(data.clonePacman.speed) || pacman.speed,
            mouth: Number(data.clonePacman.mouth) || 0,
            timer: Math.max(0.5, Number(data.clonePacman.timer) || 5),
            lastTileKey: ""
        }
        : null;

    floatingTexts = [];
    particles = [];
    shockwaves = [];

    const cfg = getLevelConfig();
    if (cfg.theme) {
        applyThemeVisuals(cfg.theme);
    }

    updateHUD();
    updateStatusStrip();

    overlayEl.classList.add("hidden");
    if (menuConfigEl) menuConfigEl.classList.add("hidden");
    if (savedBannerEl) savedBannerEl.classList.add("hidden");
    if (continueBtn) continueBtn.classList.add("hidden");
    if (menuBtn) menuBtn.classList.add("hidden");
    pauseBtn.classList.remove("is-paused");
    pauseLabelEl.textContent = "Pausar";

    beginReadyPhase();
    return true;
}

// =========================================================================
// Menú, pausa, sonido y ciclo de vida de la app
// =========================================================================
function startMenuMusic() {
    if (state === "MENU" && !sound.muted) {
        sound.intro();
    }
}

function goToMainMenu() {
    if (state === "PLAYING" || state === "READY" || state === "PAUSED") {
        saveGameState();
    }
    state = "MENU";
    sound.stopAllLoops();
    pauseBtn.classList.remove("is-paused");
    pauseLabelEl.textContent = "Pausar";
    if (menuBtn) menuBtn.classList.add("hidden");
    refreshMenuOverlay();
    overlayEl.classList.remove("hidden");
    startMenuMusic();
}

function refreshMenuOverlay() {
    const saved = readSavedGame();
    overlayTitleEl.textContent = "PAC-MAN";
    overlaySubEl.textContent = "";
    overlaySubEl.classList.add("hidden");
    if (menuConfigEl) menuConfigEl.classList.remove("hidden");
    if (menuBtn) menuBtn.classList.add("hidden");

    if (saved) {
        const modeTag =
            saved.mode === "CHAOS"
                ? "Caótico"
                : saved.arcadeSubMode === "NORMAL"
                    ? "Normal"
                    : "Poderes";
        if (savedBannerEl) {
            savedBannerEl.textContent = `💾 Nivel ${saved.level} • ${saved.score} pts • ${modeTag}`;
            savedBannerEl.classList.remove("hidden");
        }
        if (continueBtn) {
            continueBtn.textContent = "▶ CONTINUAR PARTIDA";
            continueBtn.classList.remove("hidden");
        }
        startBtn.textContent = "↻ NUEVA PARTIDA";
        startBtn.classList.remove("btn-primary");
        startBtn.classList.add("btn-secondary");
    } else {
        if (savedBannerEl) savedBannerEl.classList.add("hidden");
        if (continueBtn) continueBtn.classList.add("hidden");
        startBtn.textContent = "▶ JUGAR";
        startBtn.classList.remove("btn-secondary");
        startBtn.classList.add("btn-primary");
    }
}

function pauseForBackground() {
    if (state === "PLAYING" || state === "READY") {
        state = "PAUSED";
        sound.stopAllLoops();
        saveGameState();
        pauseBtn.classList.add("is-paused");
        pauseLabelEl.textContent = "Pausado";
        overlayTitleEl.textContent = "PAUSA";
        overlaySubEl.textContent = "Partida guardada";
        overlaySubEl.classList.remove("hidden");
        if (savedBannerEl) savedBannerEl.classList.add("hidden");
        if (menuConfigEl) menuConfigEl.classList.add("hidden");
        if (continueBtn) {
            continueBtn.textContent = "▶ CONTINUAR";
            continueBtn.classList.remove("hidden");
        }
        if (menuBtn) menuBtn.classList.remove("hidden");
        startBtn.textContent = "↻ NUEVA PARTIDA";
        startBtn.classList.remove("btn-primary");
        startBtn.classList.add("btn-secondary");
        overlayEl.classList.remove("hidden");
    } else if (state === "PAUSED") {
        sound.stopAllLoops();
        saveGameState();
    } else if (state === "MENU") {
        sound.stopIntro();
    }
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseForBackground();
});

window.addEventListener("pagehide", () => {
    pauseForBackground();
});

function togglePause() {
    if (state === "PLAYING" || state === "READY") {
        state = "PAUSED";
        sound.stopAllLoops();
        saveGameState();
        pauseBtn.classList.add("is-paused");
        pauseLabelEl.textContent = "Pausado";
        overlayTitleEl.textContent = "PAUSA";
        overlaySubEl.textContent = "Presiona P o Continuar";
        overlaySubEl.classList.remove("hidden");
        if (savedBannerEl) savedBannerEl.classList.add("hidden");
        if (menuConfigEl) menuConfigEl.classList.add("hidden");
        if (continueBtn) {
            continueBtn.textContent = "▶ CONTINUAR";
            continueBtn.classList.remove("hidden");
        }
        if (menuBtn) menuBtn.classList.remove("hidden");
        startBtn.textContent = "↻ NUEVA PARTIDA";
        startBtn.classList.remove("btn-primary");
        startBtn.classList.add("btn-secondary");
        overlayEl.classList.remove("hidden");
    } else if (state === "PAUSED") {
        state = "PLAYING";
        pauseBtn.classList.remove("is-paused");
        pauseLabelEl.textContent = "Pausar";
        if (frightenedTimer > 0) sound.startPowerLoop();
        else sound.startBgSiren(getLevelProgress());
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
        if (frightenedTimer > 0) sound.startPowerLoop();
        else sound.startBgSiren(getLevelProgress());
    }
}

if (continueBtn) {
    continueBtn.addEventListener("click", () => {
        if (state === "PAUSED") {
            togglePause();
        } else if (!restoreSavedGame()) {
            startNewGame();
        }
    });
}
if (menuBtn) menuBtn.addEventListener("click", goToMainMenu);
startBtn.addEventListener("click", () => startNewGame());
pauseBtn.addEventListener("click", togglePause);
muteBtn.addEventListener("click", toggleMute);

setupInputs({
    joystickZone,
    dpadZone,
    getState: () => state,
    getControlMode: () => controlMode,
    getPacman: () => pacman,
    setNextDirection,
    triggerDash,
    togglePause,
    toggleMute,
    startMenuMusic
});

// =========================================================================
// Bucle principal
// =========================================================================
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
            updateClonePacman(dt);
        }
        if (state === "PLAYING") {
            updateGhosts(dt);
        }
    } else if (state === "DYING") {
        stateTimer -= dt;
        updateTimersAndEffects(dt);
        if (stateTimer <= 0) {
            if (lives <= 0) {
                state = "GAME_OVER";
                clearSavedGame();
                overlayTitleEl.textContent = "GAME OVER";
                overlaySubEl.textContent = `Puntuación final: ${score} pts • Nivel ${level}`;
                overlaySubEl.classList.remove("hidden");
                if (savedBannerEl) savedBannerEl.classList.add("hidden");
                if (menuConfigEl) menuConfigEl.classList.remove("hidden");
                if (continueBtn) continueBtn.classList.add("hidden");
                if (menuBtn) menuBtn.classList.add("hidden");
                startBtn.classList.remove("btn-secondary");
                startBtn.classList.add("btn-primary");
                startBtn.textContent = "▶ JUGAR DE NUEVO";
                overlayEl.classList.remove("hidden");
            } else {
                resetPositions(false);
                beginReadyPhase();
                saveGameState();
            }
        }
    } else if (state === "LEVEL_CLEAR") {
        stateTimer -= dt;
        updateTimersAndEffects(dt);
        if (stateTimer <= 0) {
            level++;
            if (gameMode === "CHAOS") {
                if (selectedMapMode === "INFINITE") {
                    activeGeneratedLevel = generateInfiniteLevel(level);
                } else {
                    activeGeneratedLevel = null;
                    if (selectedMapMode === "RANDOM") {
                        currentLevelIndex = pickChaosMapIndex(currentLevelIndex);
                    } else {
                        currentLevelIndex = (currentLevelIndex + 1) % LEVELS.length;
                    }
                    lastPlayedMapIndex = currentLevelIndex;
                }
            } else {
                if (level > LEVELS.length) {
                    activeGeneratedLevel = generateInfiniteLevel(level);
                } else {
                    activeGeneratedLevel = null;
                    currentLevelIndex = level - 1;
                    lastPlayedMapIndex = currentLevelIndex;
                }
            }
            loadLevel();
            beginReadyPhase();
            saveGameState();
        }
    }

    renderGame(ctx, canvas, dt, {
        grid,
        levelConfig: getLevelConfig(),
        animTick,
        freezeTimer,
        frightenedTimer,
        bonusFruit,
        powerItems,
        particles,
        shockwaves,
        pacman,
        clonePacman,
        dashTrail,
        dashTimer,
        invulnTimer,
        state,
        stateTimer,
        magnetTimer,
        shieldActive,
        ghosts,
        floatingTexts,
        screenShake
    });

    requestAnimationFrame(gameLoop);
}

// Registro del Service Worker para modo offline
if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => { });
    });
}

// Arranque inicial
loadLevel();
refreshMenuOverlay();
startMenuMusic();
requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(gameLoop);
});
