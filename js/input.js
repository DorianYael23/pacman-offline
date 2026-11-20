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
    startMenuMusic
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
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
            e.preventDefault();
        }

        if (getState() === "MENU") {
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
}
