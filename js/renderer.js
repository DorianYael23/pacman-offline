import { TILE, COLS, ROWS, DIRS, PACMAN_SKINS } from "./constants.js";

function drawMaze(ctx, canvas, stateObj) {
    const { grid, levelConfig, animTick, freezeTimer, frightenedTimer } = stateObj;
    const theme = levelConfig.theme || {
        bg: "#050918",
        gridLine: "rgba(59, 130, 246, 0.08)",
        wallFill: "#10214a",
        wallInner: "#1d4ed8",
        wallStroke: "#60a5fa",
        glow: "rgba(59, 130, 246, 0.45)",
        dotColor: "#fde68a",
        accent: "#38bdf8"
    };

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

                ctx.fillStyle = theme.wallFill;
                ctx.fillRect(x, y, TILE, TILE);

                ctx.save();
                ctx.globalAlpha = 0.22 + wallPulse * 0.14;
                ctx.fillStyle = activeInner;
                const padL = leftWall ? 0 : 4;
                const padR = rightWall ? 0 : 4;
                const padT = upWall ? 0 : 4;
                const padB = downWall ? 0 : 4;
                ctx.fillRect(x + padL, y + padT, TILE - padL - padR, TILE - padT - padB);
                ctx.restore();

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

function drawBonusFruit(ctx, bonusFruit, animTick) {
    if (!bonusFruit) return;
    const { x, y, timer, isRotten } = bonusFruit;
    if (timer < 2.2 && Math.floor(timer * 6) % 2 === 0) return;

    const bob = Math.sin(animTick * 5.5) * 1.8;
    ctx.save();
    ctx.translate(x, y + bob);

    if (isRotten) {
        ctx.fillStyle = "rgba(132, 204, 22, 0.2)";
        ctx.beginPath();
        ctx.arc(0, 2, 10.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#7e22ce";
        ctx.beginPath();
        ctx.arc(-4, 3, 5, 0, Math.PI * 2);
        ctx.arc(4, 4, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#84cc16";
        ctx.beginPath();
        ctx.arc(-5.2, 2, 1.7, 0, Math.PI * 2);
        ctx.arc(3.5, 5.2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#84cc16";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -1);
        ctx.quadraticCurveTo(0, -9, 5, -7);
        ctx.moveTo(4, 0);
        ctx.lineTo(5, -7);
        ctx.stroke();

        for (let b = 0; b < 3; b++) {
            const phase = (animTick * 1.7 + b * 0.34) % 1;
            const bx = (b - 1) * 4.5 + Math.sin(animTick * 6 + b * 2) * 1.6;
            const by = -4 - phase * 12;
            const br = 1.6 + (1 - phase) * 1.1;
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - phase);
            ctx.fillStyle = b % 2 === 0 ? "#84cc16" : "#a855f7";
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else {
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
    }
    ctx.restore();
}

function drawSpecialItems(ctx, powerItems, animTick) {
    for (const item of powerItems) {
        const { type, x, y, timer } = item;
        if (timer < 2.5 && Math.floor(timer * 6) % 2 === 0) continue;

        const bob = Math.sin(animTick * 6 + x) * 2.2;
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
        } else if (type === "BOMB") {
            ctx.fillStyle = "rgba(249, 115, 22, 0.26)";
            ctx.beginPath();
            ctx.arc(0, 1, 10.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, 2, 6.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(2, -4);
            ctx.quadraticCurveTo(5, -9, 7.5, -7.5);
            ctx.stroke();

            const sparkR = 2.2 + Math.sin(animTick * 18) * 1;
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(7.5, -7.5, sparkR, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === "CLONE") {
            // Píldora Pac-Man (invoca Clon Holográfico)
            ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
            ctx.beginPath();
            ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(0, 0, 8.8, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 6.2, 0.22 * Math.PI, 1.78 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

function drawClonePacman(ctx, clonePacman, animTick) {
    if (!clonePacman) return;
    if (clonePacman.timer < 2.2 && Math.floor(clonePacman.timer * 7) % 2 === 0) return;

    const pulse = TILE * (0.56 + Math.sin(animTick * 12) * 0.05);
    ctx.save();
    ctx.translate(clonePacman.x, clonePacman.y);

    // Anillo holográfico
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
    ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const angleOffset = Math.abs(Math.sin(clonePacman.mouth)) * 0.28 * Math.PI;
    const face = clonePacman.facingDir || DIRS.RIGHT;
    let rotation = 0;
    if (face === DIRS.DOWN) rotation = Math.PI / 2;
    else if (face === DIRS.LEFT) rotation = Math.PI;
    else if (face === DIRS.UP) rotation = -Math.PI / 2;

    ctx.rotate(rotation);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, TILE * 0.4, angleOffset, Math.PI * 2 - angleOffset);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
}

function resolveSkinColor(skin, animTick, isDash = false) {
    if (skin && skin.color === "RAINBOW") {
        const hue = (animTick * 150) % 360;
        return `hsl(${hue}, 94%, ${isDash ? 76 : 60}%)`;
    }
    if (isDash) return skin?.dashColor || "#fef08a";
    return skin?.color || "#facc15";
}

function drawPacmanAccessory(ctx, r, accessoryId, face, animTick) {
    if (!accessoryId || accessoryId === "none") return;

    const isLeft = face === DIRS.LEFT;
    const isUp = face === DIRS.UP;
    const dirSign = isLeft ? -1 : 1;

    ctx.save();
    if (accessoryId === "shades") {
        if (face === DIRS.RIGHT || face === DIRS.LEFT) {
            ctx.scale(dirSign, 1);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = Math.max(1.5, r * 0.14);
            ctx.beginPath();
            ctx.moveTo(-0.36 * r, -0.32 * r);
            ctx.lineTo(0.18 * r, -0.34 * r);
            ctx.stroke();

            ctx.fillStyle = "#090d16";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = Math.max(1, r * 0.1);
            ctx.beginPath();
            ctx.roundRect(0.08 * r, -0.52 * r, 0.56 * r, 0.34 * r, Math.max(1.5, r * 0.1));
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
            ctx.lineWidth = Math.max(1, r * 0.08);
            ctx.beginPath();
            ctx.moveTo(0.18 * r, -0.45 * r);
            ctx.lineTo(0.32 * r, -0.25 * r);
            ctx.stroke();
        } else {
            const yOff = isUp ? 0.14 * r : -0.3 * r;
            ctx.fillStyle = "#090d16";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = Math.max(1, r * 0.09);
            ctx.beginPath();
            ctx.roundRect(-0.54 * r, yOff - 0.16 * r, 0.44 * r, 0.3 * r, Math.max(1.2, r * 0.08));
            ctx.roundRect(0.1 * r, yOff - 0.16 * r, 0.44 * r, 0.3 * r, Math.max(1.2, r * 0.08));
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = Math.max(1.4, r * 0.12);
            ctx.beginPath();
            ctx.moveTo(-0.1 * r, yOff);
            ctx.lineTo(0.1 * r, yOff);
            ctx.stroke();
        }
    } else if (accessoryId === "crown") {
        if (isUp) {
            ctx.translate(-0.55 * r, -0.68 * r);
            ctx.rotate(-0.52);
        } else {
            ctx.translate(0, -0.92 * r);
        }
        ctx.fillStyle = "#fbbf24";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = Math.max(1, r * 0.1);
        ctx.beginPath();
        ctx.moveTo(-0.48 * r, 0.12 * r);
        ctx.lineTo(-0.54 * r, -0.34 * r);
        ctx.lineTo(-0.22 * r, -0.1 * r);
        ctx.lineTo(0, -0.44 * r);
        ctx.lineTo(0.22 * r, -0.1 * r);
        ctx.lineTo(0.54 * r, -0.34 * r);
        ctx.lineTo(0.48 * r, 0.12 * r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, -0.08 * r, Math.max(1.2, r * 0.11), 0, Math.PI * 2);
        ctx.fill();
    } else if (accessoryId === "cap") {
        if (isUp) {
            ctx.translate(-0.5 * r, -0.64 * r);
            ctx.rotate(-0.48);
        } else {
            ctx.translate(0, -0.78 * r);
            if (isLeft) ctx.scale(-1, 1);
        }
        ctx.fillStyle = "#ef4444";
        ctx.strokeStyle = "#fee2e2";
        ctx.lineWidth = Math.max(1, r * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0.08 * r, 0.56 * r, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(0.15 * r, 0.04 * r);
        ctx.lineTo(0.86 * r, 0.12 * r);
        ctx.quadraticCurveTo(0.66 * r, 0.24 * r, 0.1 * r, 0.14 * r);
        ctx.closePath();
        ctx.fill();
    } else if (accessoryId === "bow") {
        if (isUp) {
            ctx.translate(0.54 * r, -0.68 * r);
            ctx.rotate(0.48);
        } else {
            ctx.translate(-0.34 * r * dirSign, -0.82 * r);
            ctx.rotate(-0.3 * dirSign);
        }
        ctx.fillStyle = "#ec4899";
        ctx.strokeStyle = "#fbcfe8";
        ctx.lineWidth = Math.max(1, r * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-0.42 * r, -0.26 * r);
        ctx.lineTo(-0.38 * r, 0.24 * r);
        ctx.closePath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0.42 * r, -0.26 * r);
        ctx.lineTo(0.38 * r, 0.24 * r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.5, r * 0.14), 0, Math.PI * 2);
        ctx.fill();
    } else if (accessoryId === "halo") {
        const floatY = -1.24 * r + Math.sin(animTick * 5.2) * r * 0.07;
        ctx.strokeStyle = "#fef08a";
        ctx.shadowColor = "rgba(250, 204, 21, 0.9)";
        ctx.shadowBlur = Math.max(4, r * 0.45);
        ctx.lineWidth = Math.max(1.6, r * 0.16);
        ctx.beginPath();
        ctx.ellipse(0, floatY, 0.54 * r, 0.18 * r, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (accessoryId === "horns") {
        if (isUp) {
            ctx.translate(-0.48 * r, -0.66 * r);
            ctx.rotate(-0.45);
        } else {
            ctx.translate(0, -0.78 * r);
        }
        ctx.fillStyle = "#ef4444";
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = Math.max(1, r * 0.08);
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(side * 0.2 * r, 0.08 * r);
            ctx.quadraticCurveTo(side * 0.52 * r, -0.15 * r, side * 0.42 * r, -0.52 * r);
            ctx.quadraticCurveTo(side * 0.22 * r, -0.25 * r, side * 0.42 * r, 0.12 * r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else if (accessoryId === "headphones") {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = Math.max(2, r * 0.19);
        ctx.beginPath();
        ctx.arc(0, -0.08 * r, 1.04 * r, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();

        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = Math.max(1.2, r * 0.1);
        if (face === DIRS.RIGHT || face === DIRS.LEFT) {
            ctx.beginPath();
            ctx.roundRect(-0.22 * r * dirSign - 0.18 * r, -0.28 * r, 0.36 * r, 0.54 * r, 0.14 * r);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.roundRect(-1.14 * r, -0.26 * r, 0.26 * r, 0.52 * r, 0.1 * r);
            ctx.roundRect(0.88 * r, -0.26 * r, 0.26 * r, 0.52 * r, 0.1 * r);
            ctx.fill();
            ctx.stroke();
        }
    } else if (accessoryId === "tophat") {
        if (isUp) {
            ctx.translate(-0.54 * r, -0.68 * r);
            ctx.rotate(-0.48);
        } else {
            ctx.translate(0, -0.84 * r);
        }
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = Math.max(1, r * 0.08);
        // Ala del sombrero
        ctx.beginPath();
        ctx.roundRect(-0.68 * r, -0.05 * r, 1.36 * r, 0.18 * r, 0.08 * r);
        ctx.fill();
        ctx.stroke();
        // Copa
        ctx.beginPath();
        ctx.roundRect(-0.42 * r, -0.64 * r, 0.84 * r, 0.62 * r, 0.08 * r);
        ctx.fill();
        ctx.stroke();
        // Banda dorada
        ctx.fillStyle = "#facc15";
        ctx.fillRect(-0.41 * r, -0.18 * r, 0.82 * r, 0.12 * r);
    } else if (accessoryId === "bandana") {
        const wave = Math.sin(animTick * 12) * 0.1 * r;
        if (face === DIRS.RIGHT || face === DIRS.LEFT) {
            ctx.scale(dirSign, 1);
            // Cinta frontal
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.roundRect(-0.88 * r, -0.58 * r, 1.62 * r, 0.22 * r, 0.08 * r);
            ctx.fill();
            // Nudo y colas ondeando atrás
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = Math.max(1.5, r * 0.15);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-0.82 * r, -0.46 * r);
            ctx.quadraticCurveTo(-1.12 * r, -0.58 * r + wave, -1.35 * r, -0.4 * r - wave);
            ctx.moveTo(-0.82 * r, -0.42 * r);
            ctx.quadraticCurveTo(-1.08 * r, -0.25 * r - wave, -1.28 * r, -0.16 * r + wave);
            ctx.stroke();
        } else {
            const bandY = isUp ? 0.34 * r : -0.54 * r;
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.roundRect(-0.92 * r, bandY, 1.84 * r, 0.2 * r, 0.08 * r);
            ctx.fill();
        }
    }
    ctx.restore();
}

export function drawPacmanSprite(ctx, x, y, radius, mouth, facingDir, appearance = {}, options = {}) {
    const skin = PACMAN_SKINS.find((s) => s.id === appearance?.skinId) || PACMAN_SKINS[0];
    const trailId = appearance?.trailId || "classic";
    const animTick = options.animTick || 0;
    const isDash = !!options.isDash;
    const bodyColor = resolveSkinColor(skin, animTick, isDash);

    const angleOffset = Math.abs(Math.sin(mouth)) * 0.28 * Math.PI;
    const face = facingDir || DIRS.RIGHT;
    let rotation = 0;
    if (face === DIRS.DOWN) rotation = Math.PI / 2;
    else if (face === DIRS.LEFT) rotation = Math.PI;
    else if (face === DIRS.UP) rotation = -Math.PI / 2;

    ctx.save();
    ctx.translate(x, y);

    if (options.showPreviewTrail && trailId !== "classic") {
        for (let i = 3; i >= 1; i--) {
            const tx = -i * radius * 0.48;
            const ty = Math.sin(animTick * 7 + i * 1.4) * radius * 0.12;
            ctx.save();
            ctx.globalAlpha = 0.24 * (4 - i);
            if (trailId === "pixel") {
                ctx.fillStyle = bodyColor;
                const s = radius * (0.38 - i * 0.07);
                ctx.fillRect(tx - s, ty - s, s * 2, s * 2);
            } else if (trailId === "fire") {
                ctx.fillStyle = i === 1 ? "#fde047" : i === 2 ? "#f97316" : "#ef4444";
                ctx.beginPath();
                ctx.arc(tx, ty, radius * (0.32 - i * 0.06), 0, Math.PI * 2);
                ctx.fill();
            } else if (trailId === "sparks") {
                ctx.fillStyle = i % 2 === 0 ? "#fef08a" : bodyColor;
                const sr = radius * (0.28 - i * 0.04);
                ctx.beginPath();
                ctx.moveTo(tx, ty - sr);
                ctx.lineTo(tx + sr * 0.4, ty - sr * 0.4);
                ctx.lineTo(tx + sr, ty);
                ctx.lineTo(tx + sr * 0.4, ty + sr * 0.4);
                ctx.lineTo(tx, ty + sr);
                ctx.lineTo(tx - sr * 0.4, ty + sr * 0.4);
                ctx.lineTo(tx - sr, ty);
                ctx.lineTo(tx - sr * 0.4, ty - sr * 0.4);
                ctx.closePath();
                ctx.fill();
            } else if (trailId === "glow") {
                ctx.fillStyle = bodyColor;
                ctx.beginPath();
                ctx.arc(tx, ty, radius * (0.36 - i * 0.06), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    if (trailId === "glow") {
        ctx.save();
        ctx.strokeStyle = `rgba(${skin.trailRgb || "250, 204, 21"}, 0.48)`;
        ctx.lineWidth = Math.max(1.5, radius * 0.14);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.rotate(rotation);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angleOffset, Math.PI * 2 - angleOffset);
    ctx.closePath();
    ctx.fill();
    if (skin.strokeColor) {
        ctx.strokeStyle = skin.strokeColor;
        ctx.lineWidth = Math.max(1.4, radius * 0.12);
        ctx.stroke();
    }
    ctx.restore();

    drawPacmanAccessory(ctx, radius, appearance?.accessoryId, face, animTick);
    ctx.restore();
}

function drawPacman(ctx, stateObj) {
    const {
        pacman,
        pacmanAppearance,
        dashTrail,
        dashTimer,
        invulnTimer,
        state,
        stateTimer,
        magnetTimer,
        shieldActive,
        animTick
    } = stateObj;

    const skin = PACMAN_SKINS.find((s) => s.id === pacmanAppearance?.skinId) || PACMAN_SKINS[0];
    const trailRgb = skin.trailRgb || "56, 189, 248";

    for (const t of dashTrail) {
        const alpha = Math.max(0, t.life / 0.22) * 0.45;
        ctx.fillStyle = `rgba(${trailRgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, TILE * 0.36, 0, Math.PI * 2);
        ctx.fill();
    }

    if (invulnTimer > 0 && Math.floor(invulnTimer * 14) % 2 === 0) return;

    if (state === "DYING") {
        const progress = 1 - Math.max(0, stateTimer) / 0.95;
        const startA = progress * Math.PI;
        const endA = Math.PI * 2 - progress * Math.PI;
        if (endA > startA) {
            ctx.save();
            ctx.translate(pacman.x, pacman.y);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = resolveSkinColor(skin, animTick, false);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, TILE * 0.43, startA, endA);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        return;
    }

    if (magnetTimer > 0) {
        const pulse = TILE * (1.1 + Math.sin(animTick * 10) * 0.12);
        ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pacman.x, pacman.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (shieldActive) {
        ctx.strokeStyle = "rgba(192, 132, 252, 0.85)";
        ctx.fillStyle = "rgba(168, 85, 247, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pacman.x, pacman.y, TILE * 0.56, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawPacmanSprite(ctx, pacman.x, pacman.y, TILE * 0.43, pacman.mouth, pacman.facingDir, pacmanAppearance, {
        animTick,
        isDash: dashTimer > 0
    });
}

function drawGhosts(ctx, stateObj) {
    const { ghosts, frightenedTimer, freezeTimer, animTick } = stateObj;

    for (const g of ghosts) {
        const isTitan = !!g.isTitanGhost;
        const r = isTitan ? TILE * 0.62 : TILE * 0.43;
        ctx.save();
        ctx.translate(g.x, g.y);

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

        if (isTitan && g.state === "NORMAL" && freezeTimer <= 0) {
            const pulse = r + 3.5 + Math.sin(animTick * 10) * 1.6;
            ctx.fillStyle = "rgba(249, 115, 22, 0.24)";
            ctx.beginPath();
            ctx.arc(0, 0, pulse, 0, Math.PI * 2);
            ctx.fill();
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

        if (isTitan && g.state === "NORMAL" && freezeTimer <= 0) {
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 1.6;
            ctx.stroke();
        } else if (freezeTimer > 0 && g.state !== "FRIGHTENED") {
            ctx.strokeStyle = "#e0f2fe";
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }

        const eyeOffsetX = isTitan ? 5.6 : 4;
        const eyeOffsetY = isTitan ? -4 : -3;
        const eyeR = isTitan ? 4.2 : 3.2;
        const pupilR = isTitan ? 2.1 : 1.6;

        ctx.fillStyle = isTitan && g.state === "NORMAL" ? "#fef08a" : "#fff";
        ctx.beginPath();
        ctx.arc(-eyeOffsetX, eyeOffsetY, eyeR, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX, eyeOffsetY, eyeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = g.state === "FRIGHTENED" ? "#ef4444" : (isTitan ? "#7c2d12" : "#0f172a");
        ctx.beginPath();
        ctx.arc(-eyeOffsetX + g.dir.x * 1.6, eyeOffsetY + g.dir.y * 1.6, pupilR, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX + g.dir.x * 1.6, eyeOffsetY + g.dir.y * 1.6, pupilR, 0, Math.PI * 2);
        ctx.fill();

        if (isTitan && g.state === "NORMAL") {
            ctx.strokeStyle = "#450a0a";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-eyeOffsetX - 3.5, eyeOffsetY - 4.5);
            ctx.lineTo(-eyeOffsetX + 2.8, eyeOffsetY - 2);
            ctx.moveTo(eyeOffsetX + 3.5, eyeOffsetY - 4.5);
            ctx.lineTo(eyeOffsetX - 2.8, eyeOffsetY - 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function drawParticlesAndWaves(ctx, particles, shockwaves) {
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
        if (p.shape === "square") {
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        } else if (p.shape === "spark") {
            const sr = p.size * 1.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - sr);
            ctx.lineTo(p.x + sr * 0.35, p.y - sr * 0.35);
            ctx.lineTo(p.x + sr, p.y);
            ctx.lineTo(p.x + sr * 0.35, p.y + sr * 0.35);
            ctx.lineTo(p.x, p.y + sr);
            ctx.lineTo(p.x - sr * 0.35, p.y + sr * 0.35);
            ctx.lineTo(p.x - sr, p.y);
            ctx.lineTo(p.x - sr * 0.35, p.y - sr * 0.35);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function drawFloatingTexts(ctx, floatingTexts, dt) {
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

const CUSTOMIZER_SVG_ICONS = {
    acc: {
        none: `<circle cx="14" cy="14" r="8" fill="none" stroke="#64748b" stroke-width="2.2"/><line x1="8.5" y1="19.5" x2="19.5" y2="8.5" stroke="#64748b" stroke-width="2.2" stroke-linecap="round"/>`,
        shades: `<rect x="3" y="10" width="9.5" height="7" rx="2" fill="#090d16" stroke="#38bdf8" stroke-width="1.8"/><rect x="15.5" y="10" width="9.5" height="7" rx="2" fill="#090d16" stroke="#38bdf8" stroke-width="1.8"/><line x1="12.5" y1="12.5" x2="15.5" y2="12.5" stroke="#38bdf8" stroke-width="2"/><line x1="5" y1="12" x2="7.5" y2="15" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/><line x1="17.5" y1="12" x2="20" y2="15" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>`,
        crown: `<path d="M5 20L4 10l5.5 4L14 7l4.5 7L24 10l-1 10z" fill="#fbbf24" stroke="#fef08a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="14" cy="15.5" r="1.8" fill="#ef4444"/>`,
        cap: `<path d="M5 17a8 8 0 0 1 15.5-2.5L25 16.5c-1.8 2-5 2.5-10 2.5H5z" fill="#ef4444" stroke="#fee2e2" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 15.2l12 1.3c-1.5 1.8-4.8 2.4-11.5 1.7z" fill="#38bdf8"/>`,
        bow: `<path d="M14 14L6 8.5v11zM14 14l8-5.5v11z" fill="#ec4899" stroke="#fbcfe8" stroke-width="1.4" stroke-linejoin="round"/><circle cx="14" cy="14" r="2.6" fill="#f43f5e" stroke="#fbcfe8" stroke-width="1"/>`,
        halo: `<ellipse cx="14" cy="14" rx="9" ry="3.8" fill="none" stroke="#fef08a" stroke-width="2.6"/><ellipse cx="14" cy="14" rx="9" ry="3.8" fill="none" stroke="#facc15" stroke-width="1" opacity="0.7"/>`,
        horns: `<path d="M10 21c-3.5-2.5-4.5-8.5-2-14 0.5 4 2.5 6.5 4.2 8.2z" fill="#ef4444" stroke="#fca5a5" stroke-width="1.3" stroke-linejoin="round"/><path d="M18 21c3.5-2.5 4.5-8.5 2-14-0.5 4-2.5 6.5-4.2 8.2z" fill="#ef4444" stroke="#fca5a5" stroke-width="1.3" stroke-linejoin="round"/>`,
        headphones: `<path d="M6.5 15a7.5 7.5 0 0 1 15 0" fill="none" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round"/><rect x="4" y="13" width="4.5" height="8" rx="2" fill="#1e293b" stroke="#a855f7" stroke-width="1.6"/><rect x="19.5" y="13" width="4.5" height="8" rx="2" fill="#1e293b" stroke="#a855f7" stroke-width="1.6"/>`,
        tophat: `<rect x="4" y="19.5" width="20" height="3" rx="1.5" fill="#1e293b" stroke="#94a3b8" stroke-width="1.2"/><rect x="8" y="6.5" width="12" height="13" rx="1.5" fill="#1e293b" stroke="#94a3b8" stroke-width="1.2"/><rect x="8.3" y="16" width="11.4" height="2.4" fill="#facc15"/>`,
        bandana: `<rect x="4" y="10" width="16" height="4.5" rx="1.5" fill="#dc2626"/><path d="M19 12.2c3-.8 4.5-2 6-1.5M19 13.5c2.5 1.2 4 3 5.5 2.5" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round"/>`
    },
    trail: {
        classic: `<line x1="5" y1="10" x2="17" y2="10" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/><line x1="8" y1="14" x2="22" y2="14" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="4 3"/><line x1="5" y1="18" x2="17" y2="18" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/>`,
        glow: `<circle cx="15" cy="14" r="8" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.8"/><circle cx="15" cy="14" r="4.2" fill="#7dd3fc"/><circle cx="7" cy="14" r="2.2" fill="#38bdf8" opacity="0.65"/>`,
        sparks: `<path d="M16 6l1.5 4.2L22 11.7l-4.5 1.5L16 17.5l-1.5-4.3L10 11.7l4.5-1.5z" fill="#fef08a"/><path d="M8 15l0.9 2.3L11.2 18l-2.3.8L8 21l-.8-2.2L5 18l2.2-.7z" fill="#38bdf8"/><circle cx="20.5" cy="20" r="1.5" fill="#f472b6"/>`,
        pixel: `<rect x="15" y="9" width="7" height="7" rx="1" fill="#22d3ee"/><rect x="9" y="13" width="5" height="5" rx="0.8" fill="#4ade80" opacity="0.85"/><rect x="4.5" y="15.5" width="3.5" height="3.5" rx="0.6" fill="#facc15" opacity="0.7"/>`,
        fire: `<path d="M14 4.5c2.8 3.6 6.5 6.4 6.5 11a6.5 6.5 0 0 1-13 0c0-3 1.6-5.6 3.5-7.6.2 2 1.2 3 2.3 3.2-.6-2.5-.2-4.6.7-6.6z" fill="#ef4444"/><path d="M14 9.5c1.7 2.2 3.8 3.8 3.8 6.5a3.8 3.8 0 0 1-7.6 0c0-1.7.9-3.2 2-4.3.2 1.2.9 1.7 1.6 1.8-.3-1.4-.2-2.7.2-4z" fill="#fb923c"/><circle cx="14" cy="17" r="2" fill="#fde047"/>`
    }
};

export function getCustomizerIconSvg(category, id) {
    const body = CUSTOMIZER_SVG_ICONS[category]?.[id] || "";
    return `<svg class="custom-opt-icon" viewBox="0 0 28 28" aria-hidden="true">${body}</svg>`;
}

export function renderGame(ctx, canvas, dt, stateObj) {
    ctx.save();
    if (stateObj.screenShake > 0) {
        const mag = stateObj.screenShake * 18;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    drawMaze(ctx, canvas, stateObj);
    drawBonusFruit(ctx, stateObj.bonusFruit, stateObj.animTick);
    drawSpecialItems(ctx, stateObj.powerItems, stateObj.animTick);
    drawParticlesAndWaves(ctx, stateObj.particles, stateObj.shockwaves);
    drawClonePacman(ctx, stateObj.clonePacman, stateObj.animTick);
    drawPacman(ctx, stateObj);
    drawGhosts(ctx, stateObj);
    drawFloatingTexts(ctx, stateObj.floatingTexts, dt);

    if (stateObj.state === "READY") {
        ctx.fillStyle = "rgba(9, 13, 22, 0.58)";
        ctx.fillRect(0, canvas.height / 2 - 24, canvas.width, 48);
        ctx.fillStyle = "#facc15";
        ctx.font = "900 20px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡LISTO!", canvas.width / 2, canvas.height / 2 + 7);
    } else if (stateObj.state === "LEVEL_CLEAR") {
        ctx.fillStyle = "rgba(9, 13, 22, 0.72)";
        ctx.fillRect(0, canvas.height / 2 - 36, canvas.width, 72);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
            `¡${stateObj.levelConfig.name.toUpperCase()} COMPLETADO!`,
            canvas.width / 2,
            canvas.height / 2 + 7
        );
    }

    ctx.restore();
}
