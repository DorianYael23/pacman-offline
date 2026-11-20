// Motor de audio offline híbrido (MP3 reales + síntesis arcade)
export class SoundEngine {
    constructor(getStateFn) {
        this.getState = getStateFn || (() => "MENU");
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
            this.ctx.resume().catch(() => { });
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
            if (this.muted || this.introPlaying || this.getState() !== "MENU") return;
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
            if (this.introPlaying && !this.muted && this.getState() === "MENU") {
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

    rottenFruit() {
        this.sweep(240, 82, 0.22, "sawtooth", 0.11, 0);
        this.sweep(175, 58, 0.26, "square", 0.08, 0.09);
    }

    wallBreak() {
        this.sweep(220, 62, 0.14, "sawtooth", 0.11, 0);
    }

    bomb() {
        this.duckSirens(260);
        this.sweep(180, 38, 0.34, "sawtooth", 0.14, 0);
        this.sweep(340, 72, 0.22, "square", 0.09, 0.04);
    }

    chaosGhost() {
        this.sweep(320, 960, 0.14, "sawtooth", 0.09, 0);
        this.sweep(960, 480, 0.18, "sawtooth", 0.09, 0.12);
    }
}
