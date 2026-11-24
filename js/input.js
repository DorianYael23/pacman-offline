import { DIRS } from "./constants.js";

function pickAxisDirection(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx > 0 ? DIRS.RIGHT : DIRS.LEFT;
    }
    return dy > 0 ? DIRS.DOWN : DIRS.UP;
}

export function setupInputs({
    joystickZone,
    dpadZone,
    getState,
    getControlMode,
    getPacman,
    setNextDirection,
    triggerDash,
    togglePause,
    toggleMute,
    startMenuMusic,
    navigateMenuVertical,
    navigateMenuHorizontal,
    cycleMap,
    resetMapRandom,
    activateFocusedMenuItem,
    confirmMenuAction,
    startNewGame,
    goToMainMenu,
    onGamepadActivity,
    onGamepadNotice
}) {
    // Desbloquear música de menú si el navegador bloqueó el autoplay
    const unlockMenuAudio = (e) => {
        if (getState() !== "MENU") {
            window.removeEventListener("pointerdown", unlockMenuAudio);
            window.removeEventListener("touchstart", unlockMenuAudio);
            window.removeEventListener("keydown", unlockMenuAudio);
            return;
        }
        if (e && e.target && e.target.closest && e.target.closest("#start-btn, #continue-btn")) return;
        startMenuMusic();
    };

    window.addEventListener("pointerdown", unlockMenuAudio, { passive: true });
    window.addEventListener("touchstart", unlockMenuAudio, { passive: true });
    window.addEventListener("keydown", unlockMenuAudio);

    // Teclado
    window.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        const st = getState();

        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
            e.preventDefault();
        }

        if (st === "MENU") {
            startMenuMusic();
        }

        if (key === "m") {
            toggleMute();
            return;
        }

        if (st === "MENU" || st === "GAME_OVER") {
            if (key === "arrowup" || key === "w") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuVertical) navigateMenuVertical(-1);
            } else if (key === "arrowdown" || key === "s") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuVertical) navigateMenuVertical(1);
            } else if (key === "arrowleft" || key === "a") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuHorizontal) navigateMenuHorizontal(-1);
            } else if (key === "arrowright" || key === "d") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuHorizontal) navigateMenuHorizontal(1);
            } else if (key === "enter" || key === " ") {
                e.preventDefault();
                if (activateFocusedMenuItem) activateFocusedMenuItem();
                else if (confirmMenuAction) confirmMenuAction();
            } else if (key === "r" && resetMapRandom) {
                resetMapRandom();
            }
            return;
        }

        if (st === "PAUSED") {
            if (key === "arrowup" || key === "w") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuVertical) navigateMenuVertical(-1);
            } else if (key === "arrowdown" || key === "s") {
                if (onGamepadActivity) onGamepadActivity("KEYBOARD");
                if (navigateMenuVertical) navigateMenuVertical(1);
            } else if (key === "enter" || key === " ") {
                e.preventDefault();
                if (activateFocusedMenuItem) activateFocusedMenuItem();
                else togglePause();
            } else if (key === "p" || key === "escape") {
                togglePause();
            } else if (key === "backspace" && goToMainMenu) {
                goToMainMenu();
            }
            return;
        }

        if (key === "arrowup" || key === "w") setNextDirection(DIRS.UP);
        else if (key === "arrowdown" || key === "s") setNextDirection(DIRS.DOWN);
        else if (key === "arrowleft" || key === "a") setNextDirection(DIRS.LEFT);
        else if (key === "arrowright" || key === "d") setNextDirection(DIRS.RIGHT);
        else if (key === " " || key === "shift") triggerDash();
        else if (key === "p" || key === "escape") togglePause();
    });

    // 1) Control táctil ultra-responsivo (Solo dedo con ancla rodante y multitáctil)
    let swipeTouchId = null;
    let swipeAnchorX = 0;
    let swipeAnchorY = 0;
    let swipeOriginX = 0;
    let swipeOriginY = 0;
    let swipeMoved = false;
    let lastTapTime = 0;

    function processSwipePoint(clientX, clientY, isEnd = false) {
        const dx = clientX - swipeAnchorX;
        const dy = clientY - swipeAnchorY;
        const dist = Math.hypot(dx, dy);
        const threshold = isEnd ? 7 : (swipeMoved ? 12 : 9);

        if (dist >= threshold) {
            setNextDirection(pickAxisDirection(dx, dy));
            swipeAnchorX = clientX;
            swipeAnchorY = clientY;
            swipeMoved = true;
        }
    }

    document.addEventListener("touchstart", (e) => {
        const st = getState();
        if (getControlMode() !== "SWIPE" || (st !== "PLAYING" && st !== "READY")) return;
        if (e.target.closest("button")) return;

        e.preventDefault();
        const touch = e.changedTouches[e.changedTouches.length - 1];
        swipeTouchId = touch.identifier;
        swipeAnchorX = touch.clientX;
        swipeAnchorY = touch.clientY;
        swipeOriginX = touch.clientX;
        swipeOriginY = touch.clientY;
        swipeMoved = false;
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
        const st = getState();
        if (getControlMode() !== "SWIPE" || (st !== "PLAYING" && st !== "READY")) return;
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
        const st = getState();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === swipeTouchId) {
                if (getControlMode() === "SWIPE" && (st === "PLAYING" || st === "READY")) {
                    processSwipePoint(touch.clientX, touch.clientY, true);

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

    // 2) Control táctil por Joystick virtual
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
                const pac = getPacman();
                const isHorizontal = pac.nextDir && pac.nextDir.x !== 0;
                const isVertical = pac.nextDir && pac.nextDir.y !== 0;

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

    // 3) Control táctil por Cruceta (D-Pad) con soporte de deslizamiento
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
        dpadButtons.forEach((b) => b.addEventListener("click", (e) => e.preventDefault()));
    }

    // 4) Soporte nativo de controles / gamepads (Xbox, PlayStation, Switch, genéricos USB/Bluetooth)
    const prevGamepadState = new Map();
    let lastActiveGamepadIndex = -1;
    let menuNavCooldownUntil = 0;

    const getFriendlyGamepadName = (id = "") => {
        const lower = id.toLowerCase();
        if (lower.includes("xbox") || lower.includes("xinput") || lower.includes("045e")) {
            return "Control Xbox listo";
        }
        if (lower.includes("dualsense") || lower.includes("dualshock") || lower.includes("playstation") || lower.includes("054c")) {
            return "Control PlayStation listo";
        }
        if (lower.includes("nintendo") || lower.includes("switch") || lower.includes("pro controller") || lower.includes("057e")) {
            return "Control Nintendo listo";
        }
        return "Mando listo para jugar";
    };

    const isBtnPressed = (gp, idx, threshold = 0.35) => {
        const btn = gp.buttons && gp.buttons[idx];
        if (!btn) return false;
        return Boolean(btn.pressed || (typeof btn.value === "number" && btn.value > threshold));
    };

    window.addEventListener("gamepadconnected", (e) => {
        if (!e.gamepad) return;
        lastActiveGamepadIndex = e.gamepad.index;
        prevGamepadState.set(e.gamepad.index, {});
        if (onGamepadActivity) onGamepadActivity("GAMEPAD");
        if (onGamepadNotice) {
            onGamepadNotice("🎮 CONTROL CONECTADO", getFriendlyGamepadName(e.gamepad.id), "#38bdf8");
        }
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        if (!e.gamepad) return;
        prevGamepadState.delete(e.gamepad.index);
        if (lastActiveGamepadIndex === e.gamepad.index) {
            lastActiveGamepadIndex = -1;
        }
        const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter((p) => p && p.connected) : [];
        if (pads.length === 0 && onGamepadActivity) {
            onGamepadActivity("NONE");
        }
        const wasPlaying = getState() === "PLAYING";
        if (wasPlaying) {
            togglePause();
        }
        if (onGamepadNotice) {
            onGamepadNotice(
                "🎮 CONTROL DESCONECTADO",
                wasPlaying ? "Juego pausado automáticamente" : "Reconéctalo cuando quieras",
                "#f97316"
            );
        }
    });

    function rumbleGamepad(durationMs = 80, strongMagnitude = 0.35, weakMagnitude = 0.5) {
        if (!navigator.getGamepads) return;
        const pads = navigator.getGamepads();
        if (!pads) return;

        let target = lastActiveGamepadIndex >= 0 ? pads[lastActiveGamepadIndex] : null;
        if (!target) {
            for (let i = 0; i < pads.length; i++) {
                if (pads[i] && pads[i].connected) {
                    target = pads[i];
                    break;
                }
            }
        }
        if (!target) return;

        const actuator = target.vibrationActuator || (target.hapticActuators && target.hapticActuators[0]);
        if (!actuator) return;

        try {
            if (typeof actuator.playEffect === "function") {
                actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: durationMs,
                    weakMagnitude: Math.min(1, Math.max(0, weakMagnitude)),
                    strongMagnitude: Math.min(1, Math.max(0, strongMagnitude))
                }).catch(() => { });
            } else if (typeof actuator.pulse === "function") {
                actuator.pulse(Math.min(1, Math.max(0, strongMagnitude)), durationMs).catch(() => { });
            }
        } catch (_) { }
    }

    function pollGamepad() {
        if (!navigator.getGamepads) return;
        const pads = navigator.getGamepads();
        if (!pads) return;

        const now = performance.now();

        for (let i = 0; i < pads.length; i++) {
            const gp = pads[i];
            if (!gp || !gp.connected) continue;

            const prev = prevGamepadState.get(gp.index) || {};
            const stateNow = getState();

            // Leer botones clave (estándar W3C: Xbox / PlayStation / Switch / genéricos)
            const cur = {
                a: isBtnPressed(gp, 0),
                b: isBtnPressed(gp, 1),
                x: isBtnPressed(gp, 2),
                y: isBtnPressed(gp, 3),
                lb: isBtnPressed(gp, 4),
                rb: isBtnPressed(gp, 5),
                lt: isBtnPressed(gp, 6, 0.4),
                rt: isBtnPressed(gp, 7, 0.35),
                back: isBtnPressed(gp, 8),
                start: isBtnPressed(gp, 9),
                up: isBtnPressed(gp, 12),
                down: isBtnPressed(gp, 13),
                left: isBtnPressed(gp, 14),
                right: isBtnPressed(gp, 15)
            };

            const justPressed = (k) => cur[k] && !prev[k];

            // Leer Stick izquierdo (ejes 0 y 1)
            const axX = gp.axes && gp.axes.length > 0 ? gp.axes[0] : 0;
            const axY = gp.axes && gp.axes.length > 1 ? gp.axes[1] : 0;
            const stickMag = Math.hypot(axX, axY);
            const stickDeadzone = 0.32;

            const anyInput =
                cur.a || cur.b || cur.x || cur.y || cur.lb || cur.rb ||
                cur.rt || cur.back || cur.start || cur.up || cur.down ||
                cur.left || cur.right || stickMag >= stickDeadzone;

            if (anyInput) {
                lastActiveGamepadIndex = gp.index;
                if (onGamepadActivity) onGamepadActivity("GAMEPAD");
                if (stateNow === "MENU") {
                    startMenuMusic();
                }
            }

            // Silenciar / activar sonido con Back/View/Select (botón 8) en cualquier estado
            if (justPressed("back")) {
                toggleMute();
            }

            if (stateNow === "PLAYING" || stateNow === "READY") {
                // Dirección: prioridad a Cruceta (D-Pad), luego Stick izquierdo con histéresis suave
                if (cur.up) {
                    setNextDirection(DIRS.UP);
                } else if (cur.down) {
                    setNextDirection(DIRS.DOWN);
                } else if (cur.left) {
                    setNextDirection(DIRS.LEFT);
                } else if (cur.right) {
                    setNextDirection(DIRS.RIGHT);
                } else if (stickMag >= stickDeadzone) {
                    const absX = Math.abs(axX);
                    const absY = Math.abs(axY);
                    const pac = getPacman();
                    const isHorizontal = pac && pac.nextDir && pac.nextDir.x !== 0;
                    const isVertical = pac && pac.nextDir && pac.nextDir.y !== 0;

                    if (isHorizontal) {
                        if (absY > absX * 1.12) {
                            setNextDirection(axY > 0 ? DIRS.DOWN : DIRS.UP);
                        } else {
                            setNextDirection(axX > 0 ? DIRS.RIGHT : DIRS.LEFT);
                        }
                    } else if (isVertical) {
                        if (absX > absY * 1.12) {
                            setNextDirection(axX > 0 ? DIRS.RIGHT : DIRS.LEFT);
                        } else {
                            setNextDirection(axY > 0 ? DIRS.DOWN : DIRS.UP);
                        }
                    } else {
                        setNextDirection(pickAxisDirection(axX, axY));
                    }
                }

                // Turbo Dash con A, X, RB o RT
                if (justPressed("a") || justPressed("x") || justPressed("rb") || justPressed("rt")) {
                    triggerDash();
                }

                // Pausa con Start / Menu
                if (justPressed("start")) {
                    togglePause();
                }
            } else if (stateNow === "PAUSED") {
                const navUp = cur.up || axY < -0.55;
                const navDown = cur.down || axY > 0.55;

                if (now >= menuNavCooldownUntil) {
                    if (navUp && navigateMenuVertical) {
                        navigateMenuVertical(-1);
                        menuNavCooldownUntil = now + 200;
                    } else if (navDown && navigateMenuVertical) {
                        navigateMenuVertical(1);
                        menuNavCooldownUntil = now + 200;
                    }
                }

                if (justPressed("a")) {
                    if (activateFocusedMenuItem) activateFocusedMenuItem();
                    else togglePause();
                } else if (justPressed("start")) {
                    togglePause();
                } else if (justPressed("b") && goToMainMenu) {
                    goToMainMenu();
                } else if (justPressed("y") && startNewGame) {
                    startNewGame();
                }
            } else if (stateNow === "MENU" || stateNow === "GAME_OVER") {
                const navLeft = cur.left || axX < -0.55;
                const navRight = cur.right || axX > 0.55;
                const navUp = cur.up || axY < -0.55;
                const navDown = cur.down || axY > 0.55;

                if (now >= menuNavCooldownUntil) {
                    if (navUp && navigateMenuVertical) {
                        navigateMenuVertical(-1);
                        menuNavCooldownUntil = now + 200;
                    } else if (navDown && navigateMenuVertical) {
                        navigateMenuVertical(1);
                        menuNavCooldownUntil = now + 200;
                    } else if (navLeft && navigateMenuHorizontal) {
                        navigateMenuHorizontal(-1);
                        menuNavCooldownUntil = now + 200;
                    } else if (navRight && navigateMenuHorizontal) {
                        navigateMenuHorizontal(1);
                        menuNavCooldownUntil = now + 200;
                    }
                }

                // Atajos directos LB / RB para cambiar mapa en Modo Caótico desde cualquier fila
                if (justPressed("lb") && cycleMap) {
                    cycleMap(-1);
                } else if (justPressed("rb") && cycleMap) {
                    cycleMap(1);
                } else if (justPressed("x") && resetMapRandom) {
                    resetMapRandom();
                }

                // A ejecuta la opción resaltada; Start inicia/continúa directo; Y nueva partida
                if (justPressed("a")) {
                    if (activateFocusedMenuItem) activateFocusedMenuItem();
                    else if (confirmMenuAction) confirmMenuAction();
                } else if (justPressed("start")) {
                    if (confirmMenuAction) confirmMenuAction();
                } else if (justPressed("y") && startNewGame) {
                    startNewGame();
                }
            }

            prevGamepadState.set(gp.index, cur);
        }
    }

    return {
        pollGamepad,
        rumbleGamepad
    };
}
