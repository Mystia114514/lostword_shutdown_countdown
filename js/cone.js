(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.getElementById("cone");
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let ratio = 0;
    let apexY = null;

    const END_FADE = 1600;
    const EMBER_GLOW = [255, 188, 142];
    const EMBER_PULSE = [255, 196, 152];
    const EMBER_DOT = [255, 208, 168];
    const EMBER_SHADOW = [255, 180, 136];
    const END_GRAY = [154, 166, 184];
    const END_LIGHT = [206, 214, 226];
    let endMix = 0;
    let endTarget = 0;
    let lastTime = null;

    function lerp(from, to, t) {
        return Math.round(from + (to - from) * t);
    }

    function mixColor(from, to, t, alpha) {
        return "rgba(" + lerp(from[0], to[0], t) + ", " + lerp(from[1], to[1], t) + ", " + lerp(from[2], to[2], t) + ", " + alpha.toFixed(3) + ")";
    }

    function syncSize() {
        const rect = canvas.getBoundingClientRect();
        const cssWidth = Math.max(1, Math.round(rect.width));
        const cssHeight = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (cssWidth === w && cssHeight === h && dpr === ratio) {
            return;
        }
        w = cssWidth;
        h = cssHeight;
        ratio = dpr;
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time) {
        syncSize();
        ctx.clearRect(0, 0, w, h);

        const delta = lastTime === null ? 0 : Math.max(0, time - lastTime);
        lastTime = time;
        if (reduceMotion) {
            endMix = endTarget;
        } else {
            endMix = Math.min(endTarget, endMix + delta / END_FADE);
        }
        const end = endMix * endMix * (3 - 2 * endMix);

        const apexX = w * 0.5;
        const targetApexY = h * 0.82;
        if (apexY === null || reduceMotion) {
            apexY = targetApexY;
        } else {
            apexY += (targetApexY - apexY) * 0.12;
        }
        const spread = Math.max(w, h) * 1.7;

        const glow = ctx.createRadialGradient(apexX, apexY, 0, apexX, apexY, Math.min(w, h) * 0.55);
        glow.addColorStop(0, mixColor(EMBER_GLOW, END_GRAY, end, 0.15 - end * 0.08));
        glow.addColorStop(0.35, "rgba(150, 196, 255, 0.055)");
        glow.addColorStop(1, "rgba(5, 7, 13, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        const leftX = apexX - apexY;
        const rightX = apexX + apexY;
        const coneFill = ctx.createLinearGradient(0, 0, 0, apexY);
        coneFill.addColorStop(0, "rgba(122, 172, 255, 0.012)");
        coneFill.addColorStop(1, "rgba(142, 186, 255, 0.05)");
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(leftX, 0);
        ctx.lineTo(rightX, 0);
        ctx.closePath();
        ctx.fillStyle = coneFill;
        ctx.fill();

        const rays = 30;
        for (let i = 0; i <= rays; i++) {
            const p = i / rays;
            const angle = -Math.PI * 0.75 + p * Math.PI * 0.5;
            const edge = Math.pow(Math.abs(p - 0.5) * 2, 4);
            ctx.beginPath();
            ctx.moveTo(apexX, apexY);
            ctx.lineTo(apexX + Math.cos(angle) * spread, apexY + Math.sin(angle) * spread);
            ctx.strokeStyle = "rgba(196, 222, 255, " + (0.03 + edge * 0.1).toFixed(3) + ")";
            ctx.lineWidth = edge > 0.6 ? 1.1 : 0.7;
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(200, 226, 255, 0.26)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(leftX, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(rightX, 0);
        ctx.stroke();

        const pastRays = 8;
        for (let i = 0; i <= pastRays; i++) {
            const p = i / pastRays;
            const angle = Math.PI * 0.25 + p * Math.PI * 0.5;
            const edge = Math.pow(Math.abs(p - 0.5) * 2, 4);
            ctx.beginPath();
            ctx.moveTo(apexX, apexY);
            ctx.lineTo(apexX + Math.cos(angle) * spread * 0.7, apexY + Math.sin(angle) * spread * 0.7);
            ctx.strokeStyle = "rgba(196, 222, 255, " + (0.02 + edge * 0.05).toFixed(3) + ")";
            ctx.lineWidth = 0.7;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(apexX, -20);
        ctx.strokeStyle = "rgba(214, 232, 255, 0.15)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.strokeStyle = "rgba(214, 232, 255, 0.12)";
        for (let y = apexY - 28, k = 0; y > -10; y -= 38, k++) {
            const len = k % 4 === 0 ? 7 : 3;
            ctx.beginPath();
            ctx.moveTo(apexX - len, y);
            ctx.lineTo(apexX + len, y);
            ctx.stroke();
        }

        const step = Math.min(w, h) * 0.085;
        for (let k = 1; k <= 8; k++) {
            ctx.beginPath();
            ctx.arc(apexX, apexY, k * step, Math.PI * 1.25, Math.PI * 1.75);
            ctx.strokeStyle = "rgba(206, 228, 255, " + Math.max(0.015, 0.15 - k * 0.017).toFixed(3) + ")";
            ctx.lineWidth = k === 4 ? 1 : 0.6;
            ctx.stroke();
        }

        if (!reduceMotion) {
            const period = 6400;
            const phase = (time % period) / period;
            ctx.beginPath();
            ctx.arc(apexX, apexY, phase * step * 8, Math.PI * 1.25, Math.PI * 1.75);
            ctx.strokeStyle = mixColor(EMBER_PULSE, END_GRAY, end, 0.24 * (1 - phase) * (1 - end));
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        const horizon = ctx.createLinearGradient(0, 0, w, 0);
        horizon.addColorStop(0, "rgba(190, 216, 255, 0)");
        horizon.addColorStop(0.5, "rgba(190, 216, 255, 0.13)");
        horizon.addColorStop(1, "rgba(190, 216, 255, 0)");
        ctx.beginPath();
        ctx.moveTo(0, apexY);
        ctx.lineTo(w, apexY);
        ctx.strokeStyle = horizon;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(apexX, apexY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = mixColor(EMBER_DOT, END_LIGHT, end, 0.9 - end * 0.2);
        ctx.shadowColor = mixColor(EMBER_SHADOW, END_GRAY, end, 0.85 - end * 0.45);
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    window.addEventListener("service-ended", function () {
        endTarget = 1;
        if (reduceMotion) {
            draw(performance.now());
        }
    });

    let frame = 0;

    function loop(time) {
        draw(time);
        frame = requestAnimationFrame(loop);
    }

    if (reduceMotion) {
        draw(0);
        window.addEventListener("scroll", function () {
            draw(0);
        }, { passive: true });
        window.addEventListener("resize", function () {
            draw(0);
        });
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", function () {
                draw(0);
            });
        }
    } else {
        frame = requestAnimationFrame(loop);
    }
})();
