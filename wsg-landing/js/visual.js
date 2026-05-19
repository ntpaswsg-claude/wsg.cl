/* =========================================================
 * visual.js
 * Componentes visuales en JS para WSG.cl:
 *  1. Barra de progreso de scroll en el tope de la página.
 *  2. Fondo animado de partículas conectadas (canvas)
 *     que evoca una red logística distribuida.
 *
 * Sin dependencias externas. Compatible con navegadores
 * modernos. Respeta prefers-reduced-motion.
 * ========================================================= */

(function () {
  "use strict";

  /* ------------------------------------------------------
   * 1. Barra de progreso de scroll
   * ------------------------------------------------------ */
  const progressEl = document.getElementById("scroll-progress");

  function updateScrollProgress() {
    if (!progressEl) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressEl.style.width = pct + "%";
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* ------------------------------------------------------
   * 2. Fondo animado de partículas conectadas
   * ------------------------------------------------------ */
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let animationId = null;

  const CONFIG = {
    densityDivisor: 16000, // 1 partícula cada N pixels²
    maxParticles: 90,
    minParticles: 25,
    speed: 0.25,
    radius: 1.6,
    connectionDistance: 130,
    particleColor: "rgba(15, 36, 68, 0.55)",
    lineColor: "rgba(15, 36, 68, 0.12)",
    accentColor: "rgba(249, 115, 22, 0.6)",
  };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initParticles();
  }

  function initParticles() {
    const count = Math.max(
      CONFIG.minParticles,
      Math.min(
        CONFIG.maxParticles,
        Math.floor((width * height) / CONFIG.densityDivisor)
      )
    );

    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        accent: Math.random() < 0.12,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Mover y dibujar partículas
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Rebote en bordes
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.accent ? CONFIG.accentColor : CONFIG.particleColor;
      ctx.fill();
    }

    // Dibujar conexiones cercanas
    const maxDist = CONFIG.connectionDistance;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < maxDistSq) {
          const alpha = 1 - dSq / maxDistSq;
          ctx.strokeStyle = `rgba(15, 36, 68, ${alpha * 0.18})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(step);
  }

  // Inicialización
  resize();

  if (!prefersReducedMotion) {
    step();
  } else {
    // Render estático para usuarios con motion reducido
    step();
    if (animationId) cancelAnimationFrame(animationId);
  }

  // Reaccionar a cambios de tamaño con throttle
  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // Pausar cuando la pestaña no esté visible (ahorro de recursos)
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!prefersReducedMotion && !animationId) {
      step();
    }
  });
})();
