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
const joystickZone = document.getElementById("joystick-zone");
const pauseLabelEl = document.getElementById("pause-label");
const muteLabelEl = document.getElementById("mute-label");
const controlLabelEl = document.getElementById("control-label");

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
        name: "Nivel 1 - Clásico",
        pacmanSpawn: { col: 9, row: 16 },
        ghostGate: { col: 9, row: 9 },
        ghostSpawns: [
            { col: 9, row: 8, color: "#ef4444", type: "chaser" },
            { col: 8, row: 10, color: "#f472b6", type: "ambusher" },
            { col: 9, row: 10, color: "#38bdf8", type: "flanker" },
            { col: 10, row: 10, color: "#fb923c", type: "random" }
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
        name: "Nivel 2 - Doble Túnel",
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker" },
            { col: 10, row: 9, color: "#fb923c", type: "random" }
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
        name: "Nivel 3 - Laberinto Fortaleza",
        pacmanSpawn: { col: 9, row: 15 },
        ghostGate: { col: 9, row: 8 },
        ghostSpawns: [
            { col: 9, row: 7, color: "#ef4444", type: "chaser" },
            { col: 8, row: 9, color: "#f472b6", type: "ambusher" },
            { col: 9, row: 9, color: "#38bdf8", type: "flanker" },
            { col: 10, row: 9, color: "#fb923c", type: "random" }
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
    }
];

// Motor de audio offline híbrido (MP3 reales + síntesis arcade con sirena de fondo dinámica)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.chompToggle = false;
        this.samples = {};

        this.introOscs = [];
        this.introGain = null;
        this.introPlaying = false;

        // Sirena de fondo normal (acelera conforme quedan menos puntos)
        this.bgOsc = null;
        this.bgLfo = null;
        this.bgLfoGain = null;
        this.bgGain = null;
        this.bgBaseVol = 0.042;
        this.isDucked = false;

        // Sirena cuando los fantasmas son vulnerables
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

        this.stopIntro();
        this.introPlaying = true;

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
        notes.forEach(([freq, delay, dur], idx) => {
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

            if (idx === notes.length - 1) {
                osc.onended = () => {
                    this.introPlaying = false;
                };
            }
            this.introOscs.push(osc);
        });
    }

    stopIntro() {
        this.introPlaying = false;
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

    // "Waka-Waka" con filtro vocal paso-banda
    chomp() {
        if (this.muted || !this.ctx) return;
        this.chompToggle = !this.chompToggle;

        const now = this.ctx.currentTime;
        const dur = 0.085;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        filter.type = "bandpass";
        filter.Q.value = 3.5;

        if (this.chompToggle) {
            osc.frequency.setValueAtTime(190, now);
            osc.frequency.exponentialRampToValueAtTime(340, now + dur);
            filter.frequency.setValueAtTime(350, now);
            filter.frequency.exponentialRampToValueAtTime(950, now + dur);
        } else {
            osc.frequency.setValueAtTime(340, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + dur);
            filter.frequency.setValueAtTime(950, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + dur);
        }

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
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
let level = 1;
let lives = 3;
let totalDotsInLevel = 1;
let dotsRemaining = 0;
let dotsEatenInLevel = 0;
let state = "MENU"; // MENU, PLAYING, PAUSED, LEVEL_CLEAR, GAME_OVER
let frightenedTimer = 0;
let ghostCombo = 0;
let bonusFruit = null;
let floatingTexts = [];
let lastTime = 0;
let animTick = 0;

let controlMode = localStorage.getItem("pacman_offline_control") || "SWIPE";

let pacman = {};
let ghosts = [];

highScoreEl.textContent = highScore;
overlaySubEl.textContent = "Toca aquí para escuchar la intro • Desliza o usa flechas";

function getLevelProgress() {
    return Math.min(1, Math.max(0, 1 - dotsRemaining / Math.max(1, totalDotsInLevel)));
}

function applyControlMode(mode) {
    controlMode = mode;
    localStorage.setItem("pacman_offline_control", mode);

    if (mode === "JOYSTICK") {
        joystickZone.classList.remove("hidden");
        controlLabelEl.textContent = "Joystick";
        controlModeBtn.classList.add("is-alt");
    } else {
        joystickZone.classList.add("hidden");
        controlLabelEl.textContent = "Dedo";
        controlModeBtn.classList.remove("is-alt");
    }
}

applyControlMode(controlMode);

controlModeBtn.addEventListener("click", () => {
    applyControlMode(controlMode === "SWIPE" ? "JOYSTICK" : "SWIPE");
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
        col: Math.floor(x / TILE),
        row: Math.floor(y / TILE)
    };
}

function canMove(col, row, dir, isGhost = false) {
    if (dir.x === 0 && dir.y === 0) return false;
    let nextCol = col + dir.x;
    const nextRow = row + dir.y;

    if (nextRow < 0 || nextRow >= ROWS) return false;

    if (nextCol < 0) nextCol = COLS - 1;
    if (nextCol >= COLS) nextCol = 0;

    const cell = grid[nextRow][nextCol];
    if (cell === 1) return false;
    if (cell === 4 && !isGhost) return false;
    return true;
}

function resetPositions() {
    const cfg = getLevelConfig();
    const pStart = tileCenter(cfg.pacmanSpawn.col, cfg.pacmanSpawn.row);
    pacman = {
        x: pStart.x,
        y: pStart.y,
        dir: DIRS.NONE,
        nextDir: DIRS.NONE,
        speed: 112 + Math.min(level - 1, 5) * 4,
        mouth: 0
    };

    const baseGhostSpeed = 94 + Math.min(level - 1, 6) * 6;
    ghosts = cfg.ghostSpawns.map((g, idx) => {
        const pos = tileCenter(g.col, g.row);
        return {
            x: pos.x,
            y: pos.y,
            dir: idx % 2 === 0 ? DIRS.LEFT : DIRS.RIGHT,
            color: g.color,
            type: g.type,
            speed: baseGhostSpeed,
            lastTileKey: ""
        };
    });

    frightenedTimer = 0;
    ghostCombo = 0;
    sound.stopAllLoops();
    if (state === "PLAYING") {
        sound.startBgSiren(getLevelProgress());
    }
}

function loadLevel() {
    const cfg = getLevelConfig();
    grid = cloneMap(cfg.map);
    dotsRemaining = 0;
    dotsEatenInLevel = 0;
    bonusFruit = null;
    floatingTexts = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === 0 || grid[r][c] === 3) {
                dotsRemaining++;
            }
        }
    }
    totalDotsInLevel = dotsRemaining;

    resetPositions();
    updateHUD();
}

function startNewGame() {
    sound.init();
    sound.stopIntro();
    score = 0;
    level = 1;
    lives = 3;
    state = "PLAYING";
    loadLevel();
    overlayEl.classList.add("hidden");
    sound.startBgSiren(0);
    pauseBtn.classList.remove("is-paused");
    pauseLabelEl.textContent = "Pausar";
}

function updateHUD() {
    scoreEl.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("pacman_offline_highscore", highScore);
    }
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;
    livesEl.textContent = lives > 0 ? "🟡".repeat(lives) : "💀";
}

function addScore(points, x, y) {
    score += points;
    updateHUD();
    if (x !== undefined && y !== undefined) {
        floatingTexts.push({ text: `+${points}`, x, y, life: 0.9 });
    }
}

function updatePacman(dt) {
    const step = pacman.speed * dt;
    const { col, row } = posToTile(pacman.x, pacman.y);
    const center = tileCenter(col, row);

    if (
        pacman.nextDir.x !== 0 &&
        pacman.nextDir.x === -pacman.dir.x &&
        pacman.nextDir.y === 0
    ) {
        pacman.dir = pacman.nextDir;
    } else if (
        pacman.nextDir.y !== 0 &&
        pacman.nextDir.y === -pacman.dir.y &&
        pacman.nextDir.x === 0
    ) {
        pacman.dir = pacman.nextDir;
    }

    const distToCenter = Math.hypot(pacman.x - center.x, pacman.y - center.y);
    if (
        (pacman.nextDir.x !== pacman.dir.x || pacman.nextDir.y !== pacman.dir.y) &&
        distToCenter <= TILE * 0.38 &&
        canMove(col, row, pacman.nextDir, false)
    ) {
        pacman.x = center.x;
        pacman.y = center.y;
        pacman.dir = pacman.nextDir;
    }

    if (pacman.dir.x !== 0 || pacman.dir.y !== 0) {
        if (pacman.dir.x !== 0) pacman.y = center.y;
        if (pacman.dir.y !== 0) pacman.x = center.x;

        const movingTowardsCenter =
            (pacman.dir.x > 0 && pacman.x < center.x) ||
            (pacman.dir.x < 0 && pacman.x > center.x) ||
            (pacman.dir.y > 0 && pacman.y < center.y) ||
            (pacman.dir.y < 0 && pacman.y > center.y);

        if (!movingTowardsCenter && !canMove(col, row, pacman.dir, false)) {
            pacman.x = center.x;
            pacman.y = center.y;
            pacman.dir = DIRS.NONE;
        } else {
            pacman.x += pacman.dir.x * step;
            pacman.y += pacman.dir.y * step;
            pacman.mouth += dt * 14;
        }
    }

    if (pacman.x < 0) pacman.x += COLS * TILE;
    if (pacman.x >= COLS * TILE) pacman.x -= COLS * TILE;

    const cur = posToTile(pacman.x, pacman.y);
    const tileVal = grid[cur.row]?.[cur.col];
    if (tileVal === 0 || tileVal === 3) {
        grid[cur.row][cur.col] = 2;
        dotsRemaining--;
        dotsEatenInLevel++;

        const progress = getLevelProgress();
        sound.updateBgSiren(progress);

        if (tileVal === 0) {
            addScore(10);
            sound.chomp();
        } else {
            addScore(50, pacman.x, pacman.y);
            frightenedTimer = Math.max(5, 9 - (level - 1) * 0.6);
            ghostCombo = 0;
            sound.startPowerLoop();
        }

        if (dotsEatenInLevel === 35 || dotsEatenInLevel === 85) {
            const cfg = getLevelConfig();
            const bPos = tileCenter(cfg.pacmanSpawn.col, cfg.pacmanSpawn.row);
            bonusFruit = { x: bPos.x, y: bPos.y, timer: 9, points: 100 * level };
        }

        if (dotsRemaining <= 0) {
            state = "LEVEL_CLEAR";
            sound.win();
            setTimeout(() => {
                level++;
                state = "PLAYING";
                loadLevel();
            }, 1400);
        }
    }

    if (bonusFruit) {
        bonusFruit.timer -= dt;
        if (bonusFruit.timer <= 0) {
            bonusFruit = null;
        } else if (Math.hypot(pacman.x - bonusFruit.x, pacman.y - bonusFruit.y) < TILE * 0.65) {
            addScore(bonusFruit.points, bonusFruit.x, bonusFruit.y);
            sound.fruit();
            bonusFruit = null;
        }
    }
}

function chooseGhostDirection(ghost, col, row) {
    const cfg = getLevelConfig();
    const options = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT].filter((d) => {
        if (d.x === -ghost.dir.x && d.y === -ghost.dir.y) return false;
        return canMove(col, row, d, true);
    });

    if (options.length === 0) {
        const rev = { x: -ghost.dir.x, y: -ghost.dir.y };
        return canMove(col, row, rev, true) ? rev : DIRS.NONE;
    }

    const inHouseZone =
        Math.abs(col - cfg.ghostGate.col) <= 2 &&
        row >= cfg.ghostGate.row &&
        row <= cfg.ghostGate.row + 2;

    if (inHouseZone) {
        const targetCol = cfg.ghostGate.col;
        const targetRow = cfg.ghostGate.row - 1;
        options.sort(
            (a, b) =>
                Math.hypot(col + a.x - targetCol, row + a.y - targetRow) -
                Math.hypot(col + b.x - targetCol, row + b.y - targetRow)
        );
        return options[0];
    }

    if (frightenedTimer > 0 || ghost.type === "random") {
        return options[Math.floor(Math.random() * options.length)];
    }

    const pTile = posToTile(pacman.x, pacman.y);
    let target = { col: pTile.col, row: pTile.row };

    if (ghost.type === "ambusher") {
        target.col += pacman.dir.x * 4;
        target.row += pacman.dir.y * 4;
    } else if (ghost.type === "flanker") {
        target.col += pacman.dir.x * 2 - 2;
        target.row += pacman.dir.y * 2;
    }

    options.sort(
        (a, b) =>
            Math.hypot(col + a.x - target.col, row + a.y - target.row) -
            Math.hypot(col + b.x - target.col, row + b.y - target.row)
    );
    return options[0];
}

function updateGhosts(dt) {
    if (frightenedTimer > 0) {
        frightenedTimer = Math.max(0, frightenedTimer - dt);
        if (frightenedTimer === 0) {
            sound.stopPowerLoop();
            sound.startBgSiren(getLevelProgress());
        }
    }

    const cfg = getLevelConfig();

    for (const ghost of ghosts) {
        const currentSpeed = frightenedTimer > 0 ? ghost.speed * 0.6 : ghost.speed;
        const step = currentSpeed * dt;
        const { col, row } = posToTile(ghost.x, ghost.y);
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
        } else if (!canMove(col, row, ghost.dir, true) && dist <= step + 1.5) {
            ghost.x = center.x;
            ghost.y = center.y;
            ghost.dir = chooseGhostDirection(ghost, col, row);
        }

        ghost.x += ghost.dir.x * step;
        ghost.y += ghost.dir.y * step;

        if (ghost.x < 0) ghost.x += COLS * TILE;
        if (ghost.x >= COLS * TILE) ghost.x -= COLS * TILE;

        if (Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y) < TILE * 0.68) {
            if (frightenedTimer > 0) {
                ghostCombo++;
                const pts = 200 * Math.pow(2, ghostCombo - 1);
                addScore(pts, ghost.x, ghost.y);
                sound.eatGhost();
                const respawn = tileCenter(cfg.ghostGate.col, cfg.ghostGate.row + 1);
                ghost.x = respawn.x;
                ghost.y = respawn.y;
                ghost.dir = DIRS.UP;
                ghost.lastTileKey = "";
            } else {
                lives--;
                updateHUD();
                sound.die();
                if (lives <= 0) {
                    state = "GAME_OVER";
                    overlayTitleEl.textContent = "GAME OVER";
                    overlaySubEl.textContent = `Puntuación final: ${score} pts • Nivel alcanzado: ${level}`;
                    startBtn.textContent = "JUGAR DE NUEVO";
                    overlayEl.classList.remove("hidden");
                } else {
                    resetPositions();
                }
                return;
            }
        }
    }
}

function drawMaze() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            const x = c * TILE;
            const y = r * TILE;

            if (cell === 1) {
                ctx.fillStyle = "#172554";
                ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
            } else if (cell === 4) {
                ctx.fillStyle = "#f472b6";
                ctx.fillRect(x, y + TILE / 2 - 2, TILE, 4);
            } else if (cell === 0) {
                ctx.fillStyle = "#fde68a";
                ctx.beginPath();
                ctx.arc(x + TILE / 2, y + TILE / 2, 2.7, 0, Math.PI * 2);
                ctx.fill();
            } else if (cell === 3) {
                const pulse = 5.5 + Math.sin(animTick * 8) * 1.5;
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(x + TILE / 2, y + TILE / 2, pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawBonusFruit() {
    if (!bonusFruit) return;
    const { x, y } = bonusFruit;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x - 4, y + 3, 5, 0, Math.PI * 2);
    ctx.arc(x + 4, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 1);
    ctx.quadraticCurveTo(x, y - 9, x + 5, y - 7);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 5, y - 7);
    ctx.stroke();
}

function drawPacman() {
    const angleOffset = Math.abs(Math.sin(pacman.mouth)) * 0.28 * Math.PI;
    let rotation = 0;
    if (pacman.dir === DIRS.DOWN) rotation = Math.PI / 2;
    else if (pacman.dir === DIRS.LEFT) rotation = Math.PI;
    else if (pacman.dir === DIRS.UP) rotation = -Math.PI / 2;

    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(rotation);
    ctx.fillStyle = "#facc15";
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
        let bodyColor = g.color;

        if (frightenedTimer > 0) {
            const blinking = frightenedTimer < 2.5 && Math.floor(frightenedTimer * 4.5) % 2 === 0;
            bodyColor = blinking ? "#f8fafc" : "#2563eb";
        }

        ctx.save();
        ctx.translate(g.x, g.y);

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

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(-4, -3, 3.2, 0, Math.PI * 2);
        ctx.arc(4, -3, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = frightenedTimer > 0 ? "#ef4444" : "#0f172a";
        ctx.beginPath();
        ctx.arc(-4 + g.dir.x * 1.4, -3 + g.dir.y * 1.4, 1.6, 0, Math.PI * 2);
        ctx.arc(4 + g.dir.x * 1.4, -3 + g.dir.y * 1.4, 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawFloatingTexts(dt) {
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 26 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(1, ft.life)})`;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
}

function render(dt) {
    ctx.fillStyle = "#050811";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawBonusFruit();
    drawPacman();
    drawGhosts();
    drawFloatingTexts(dt);

    if (state === "LEVEL_CLEAR") {
        ctx.fillStyle = "rgba(9, 13, 22, 0.72)";
        ctx.fillRect(0, canvas.height / 2 - 36, canvas.width, 72);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`¡${getLevelConfig().name.toUpperCase()} COMPLETADO!`, canvas.width / 2, canvas.height / 2 + 7);
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    animTick += dt;

    if (state === "PLAYING") {
        updatePacman(dt);
        updateGhosts(dt);
    }

    render(dt);
    requestAnimationFrame(gameLoop);
}

// Reproducir música de intro al tocar el menú (sin iniciar partida)
overlayEl.addEventListener("pointerdown", (e) => {
    if (state === "MENU" && e.target !== startBtn) {
        sound.intro();
    }
});

// Controles de teclado
window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
    }

    if (state === "MENU") {
        sound.intro();
    }

    if (key === "arrowup" || key === "w") pacman.nextDir = DIRS.UP;
    else if (key === "arrowdown" || key === "s") pacman.nextDir = DIRS.DOWN;
    else if (key === "arrowleft" || key === "a") pacman.nextDir = DIRS.LEFT;
    else if (key === "arrowright" || key === "d") pacman.nextDir = DIRS.RIGHT;
    else if (key === "p") togglePause();
    else if (key === "m") toggleMute();
});

// 1) Control táctil rápido por deslizamiento (Solo dedo - respuesta inmediata)
let swipeTouchId = null;
let swipeAnchorX = 0;
let swipeAnchorY = 0;
let swipeHasTurned = false;

document.addEventListener("touchstart", (e) => {
    if (controlMode !== "SWIPE" || state !== "PLAYING") return;
    if (e.target.closest("button")) return;

    e.preventDefault();
    const touch = e.changedTouches[0];
    swipeTouchId = touch.identifier;
    swipeAnchorX = touch.clientX;
    swipeAnchorY = touch.clientY;
    swipeHasTurned = false;
}, { passive: false });

document.addEventListener("touchmove", (e) => {
    if (controlMode !== "SWIPE" || state !== "PLAYING" || swipeTouchId === null) return;
    if (e.target.closest("button")) return;

    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier !== swipeTouchId) continue;

        const dx = touch.clientX - swipeAnchorX;
        const dy = touch.clientY - swipeAnchorY;
        const dist = Math.hypot(dx, dy);
        const threshold = swipeHasTurned ? 22 : 10;

        if (dist >= threshold) {
            if (Math.abs(dx) > Math.abs(dy)) {
                pacman.nextDir = dx > 0 ? DIRS.RIGHT : DIRS.LEFT;
            } else {
                pacman.nextDir = dy > 0 ? DIRS.DOWN : DIRS.UP;
            }
            swipeAnchorX = touch.clientX;
            swipeAnchorY = touch.clientY;
            swipeHasTurned = true;
        }
    }
}, { passive: false });

document.addEventListener("touchend", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === swipeTouchId) {
            swipeTouchId = null;
            swipeHasTurned = false;
        }
    }
});

document.addEventListener("touchcancel", () => {
    swipeTouchId = null;
    swipeHasTurned = false;
});

// 2) Control táctil por Joystick virtual
const joystickBase = document.getElementById("joystick-base");
const joystickKnob = document.getElementById("joystick-knob");

if (joystickBase && joystickKnob) {
    const maxRadius = 38;
    const deadZone = 12;
    let activePointerId = null;

    const updateJoystick = (clientX, clientY) => {
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxRadius;
            dy = Math.sin(angle) * maxRadius;
        }

        joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

        if (distance >= deadZone) {
            if (Math.abs(dx) > Math.abs(dy)) {
                pacman.nextDir = dx > 0 ? DIRS.RIGHT : DIRS.LEFT;
            } else {
                pacman.nextDir = dy > 0 ? DIRS.DOWN : DIRS.UP;
            }
        }
    };

    const resetJoystick = () => {
        activePointerId = null;
        joystickBase.classList.remove("active");
        joystickKnob.style.transform = "translate(0px, 0px)";
    };

    joystickBase.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        activePointerId = e.pointerId;
        joystickBase.setPointerCapture(e.pointerId);
        joystickBase.classList.add("active");
        updateJoystick(e.clientX, e.clientY);
    });

    joystickBase.addEventListener("pointermove", (e) => {
        if (e.pointerId !== activePointerId) return;
        updateJoystick(e.clientX, e.clientY);
    });

    joystickBase.addEventListener("pointerup", (e) => {
        if (e.pointerId === activePointerId) resetJoystick();
    });

    joystickBase.addEventListener("pointercancel", (e) => {
        if (e.pointerId === activePointerId) resetJoystick();
    });
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

// Inicializar vista previa del mapa
loadLevel();
requestAnimationFrame((t) => {
    lastTime = t;
    requestAnimationFrame(gameLoop);
});