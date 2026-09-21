/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Standalone Visual Prototype Engine Entry Point
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const startDemoBtn = document.getElementById('start-demo-btn');
  const systemStatus = document.getElementById('system-status');

  console.info('[SentriDose Member 3] Visual foundation initialized.');

  // Initialize Atmospheric Environmental Particles
  if (window.ParticleEngine) {
    window.ParticleEngine.start();
  }

  // Initialize Dosimeter Wristband Visualizer
  if (window.DosimeterBadge) {
    window.DosimeterBadge.init();
  }

  // Initialize Visual Scenario Controller
  if (window.ScenarioController) {
    window.ScenarioController.init();
  }

  // Initialize Automated Demo Controller
  if (window.DemoController) {
    window.DemoController.init();
  }

  // Launch the Cinematic Startup Boot Sequence
  if (window.BootSequence) {
    window.BootSequence.start(() => {
      console.info('[SentriDose Member 3] Boot sequence complete. Landing screen revealed.');
    });
  }
});
