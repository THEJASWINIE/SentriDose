/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Atmospheric Environmental Particle Engine
 * 
 * Note: This is an ambient environmental visualization effect for UI demonstration.
 * It is NOT a real-world chemical or gas dispersion simulation.
 */

'use strict';

const ParticleEngine = (() => {
  let canvas = null;
  let ctx = null;
  let animationFrameId = null;
  let isRunning = false;
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Particle pools
  let microParticles = [];
  let cloudPuffs = [];

  // Visual intensity presets (Visual demo effect only, not real concentrations)
  const INTENSITY_PRESETS = {
    LOW: {
      particleCount: 40,
      cloudCount: 6,
      speedMultiplier: 0.35,
      cloudAlpha: 0.03,
      particleAlpha: 0.28,
      baseColor: { r: 56, g: 189, b: 248 } // Muted industrial cyan
    },
    MEDIUM: {
      particleCount: 70,
      cloudCount: 9,
      speedMultiplier: 0.55,
      cloudAlpha: 0.045,
      particleAlpha: 0.4,
      baseColor: { r: 245, g: 158, b: 11 } // Muted amber
    },
    HIGH: {
      particleCount: 110,
      cloudCount: 12,
      speedMultiplier: 0.8,
      cloudAlpha: 0.06,
      particleAlpha: 0.55,
      baseColor: { r: 239, g: 68, b: 68 } // Muted hazard red
    }
  };

  let currentIntensity = 'LOW';
  let activeConfig = { ...INTENSITY_PRESETS.LOW };

  /**
   * Initializes or recreates a single micro particle
   */
  function createMicroParticle(initial = false) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      radius: 0.8 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.3 * activeConfig.speedMultiplier,
      vy: -(0.2 + Math.random() * 0.4) * activeConfig.speedMultiplier,
      baseAlpha: 0.1 + Math.random() * activeConfig.particleAlpha,
      alpha: 0,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  /**
   * Initializes or recreates a soft translucent cloud puff
   */
  function createCloudPuff(initial = false) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 60,
      radius: 40 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.15 * activeConfig.speedMultiplier,
      vy: -(0.08 + Math.random() * 0.15) * activeConfig.speedMultiplier,
      baseAlpha: activeConfig.cloudAlpha * (0.8 + Math.random() * 0.4),
      alpha: 0,
      phase: Math.random() * Math.PI * 2
    };
  }

  /**
   * Populates the particle arrays based on current configuration
   */
  function populateParticles() {
    microParticles = [];
    cloudPuffs = [];

    const pCount = Math.min(activeConfig.particleCount, Math.floor((width * height) / 25000));
    const cCount = activeConfig.cloudCount;

    for (let i = 0; i < pCount; i++) {
      microParticles.push(createMicroParticle(true));
    }
    for (let i = 0; i < cCount; i++) {
      cloudPuffs.push(createCloudPuff(true));
    }
  }

  /**
   * Handles resizing and canvas backing store pixel ratio
   */
  function resize() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    populateParticles();
  }

  /**
   * Main render tick
   */
  let lastTime = 0;
  function render(timestamp) {
    if (!isRunning) return;

    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    const { r, g, b } = activeConfig.baseColor;

    // 1. Draw soft translucent cloud puffs (background depth)
    for (let i = 0; i < cloudPuffs.length; i++) {
      const puff = cloudPuffs[i];
      puff.x += puff.vx;
      puff.y += puff.vy;
      puff.phase += 0.01;

      // Wrap around
      if (puff.y + puff.radius < 0) {
        puff.y = height + puff.radius;
        puff.x = Math.random() * width;
      }
      if (puff.x + puff.radius < 0) puff.x = width + puff.radius;
      if (puff.x - puff.radius > width) puff.x = -puff.radius;

      const currentAlpha = puff.baseAlpha * (0.85 + 0.15 * Math.sin(puff.phase));
      const grad = ctx.createRadialGradient(
        puff.x, puff.y, 0,
        puff.x, puff.y, puff.radius
      );
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha.toFixed(4)})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw micro drifting particles
    for (let i = 0; i < microParticles.length; i++) {
      const p = microParticles[i];
      p.x += p.vx + Math.sin(p.pulseOffset) * 0.12;
      p.y += p.vy;
      p.pulseOffset += p.pulseSpeed;

      // Wrap around
      if (p.y < -5) {
        p.y = height + 5;
        p.x = Math.random() * width;
      }
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;

      const alpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.pulseOffset));

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  /**
   * Initializes canvas and event listeners
   */
  function init(canvasId = 'particle-canvas') {
    canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ParticleEngine] Canvas with id "${canvasId}" not found.`);
      return false;
    }

    ctx = canvas.getContext('2d', { alpha: true });
    resize();

    window.removeEventListener('resize', handleResizeThrottled);
    window.addEventListener('resize', handleResizeThrottled);

    return true;
  }

  let resizeTimeout = null;
  function handleResizeThrottled() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
    }, 120);
  }

  /**
   * Starts the animation loop
   */
  function start() {
    if (isRunning) return;
    if (!canvas && !init()) return;

    isRunning = true;
    lastTime = 0;
    animationFrameId = requestAnimationFrame(render);
    console.info('[ParticleEngine] Atmospheric visualization started (LOW/neutral intensity).');
  }

  /**
   * Pauses the animation loop
   */
  function stop() {
    if (!isRunning) return;
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Updates visual exposure intensity for scenario demos
   * @param {'LOW' | 'MEDIUM' | 'HIGH'} level
   */
  function setIntensity(level) {
    const key = (level || '').toUpperCase();
    if (INTENSITY_PRESETS[key]) {
      currentIntensity = key;
      activeConfig = { ...INTENSITY_PRESETS[key] };
      populateParticles();
      console.info(`[ParticleEngine] Visual intensity set to ${key}.`);
    }
  }

  /**
   * Completely tears down the engine and event listeners
   */
  function destroy() {
    stop();
    window.removeEventListener('resize', handleResizeThrottled);
    if (ctx && canvas) {
      ctx.clearRect(0, 0, width, height);
    }
    microParticles = [];
    cloudPuffs = [];
    canvas = null;
    ctx = null;
  }

  return {
    init,
    start,
    stop,
    resize,
    destroy,
    setIntensity,
    isRunning: () => isRunning,
    getIntensity: () => currentIntensity
  };
})();

// Export globally
window.ParticleEngine = ParticleEngine;
