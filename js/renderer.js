import { TILE, COLS, ROWS, DIRS } from "./constants.js";

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
        }

        ctx.restore();
    }
}

function drawPacman(ctx, stateObj) {
    const { pacman, dashTrail, dashTimer, invulnTimer, state, stateTimer, magnetTimer, shieldActive, animTick } = stateObj;

    for (const t of dashTrail) {
        const alpha = Math.max(0, t.life / 0.22) * 0.45;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
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
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
