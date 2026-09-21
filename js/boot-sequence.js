/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Cinematic Startup Boot Sequence Engine
 */

'use strict';

const BootSequence = (() => {
  // Ordered sequence per requirements
  const BOOT_STEPS = [
    { tag: 'SYS', text: 'INITIALIZING SYSTEM...', progress: 15, delay: 800 },
    { tag: 'OPT', text: 'OPTICAL ENGINE READY', progress: 35, delay: 1000 },
    { tag: 'CAL', text: 'CALIBRATION READY', progress: 55, delay: 1000 },
    { tag: 'MON', text: 'SAFETY MONITOR READY', progress: 75, delay: 1000 },
    { tag: 'DAT', text: 'DATA CHANNEL READY', progress: 90, delay: 1000 },
    { tag: 'ALL', text: 'SYSTEM ONLINE', progress: 100, delay: 1000, isFinal: true }
  ];

  let isRunning = false;
  let hasCompleted = false;

  /**
   * Builds the DOM elements for each diagnostic step in the boot terminal
   */
  function setupStepsContainer(container) {
    if (!container) return;
    container.innerHTML = '';

    BOOT_STEPS.forEach((step, idx) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'boot-step';
      stepEl.id = `boot-step-${idx}`;
      
      const labelEl = document.createElement('div');
      labelEl.className = 'boot-step-label';

      const tagEl = document.createElement('span');
      tagEl.className = 'boot-step-tag';
      tagEl.textContent = `[${step.tag}]`;

      const textEl = document.createElement('span');
      textEl.className = 'boot-step-text';
      textEl.textContent = step.text;

      labelEl.appendChild(tagEl);
      labelEl.appendChild(textEl);

      const statusEl = document.createElement('span');
      statusEl.className = 'boot-step-status';
      statusEl.textContent = 'PENDING';

      stepEl.appendChild(labelEl);
      stepEl.appendChild(statusEl);
      container.appendChild(stepEl);
    });
  }

  /**
   * Starts the sequential boot execution
   * @param {Function} onComplete Callback fired after boot completes and landing page is revealed
   */
  function start(onComplete) {
    if (isRunning) return;
    isRunning = true;

    const bootScreen = document.getElementById('boot-screen');
    const diagnosticsContainer = document.getElementById('boot-diagnostics');
    const progressFill = document.getElementById('boot-progress-fill');
    const progressPct = document.getElementById('boot-pct');

    if (!bootScreen) {
      console.warn('[BootSequence] #boot-screen element not found.');
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    setupStepsContainer(diagnosticsContainer);

    let currentStepIdx = 0;
    let accumulatedTime = 600;

    BOOT_STEPS.forEach((step, index) => {
      accumulatedTime += step.delay;

      setTimeout(() => {
        const stepEl = document.getElementById(`boot-step-${index}`);
        if (!stepEl) return;

        // Mark previous step as completed
        if (index > 0) {
          const prevEl = document.getElementById(`boot-step-${index - 1}`);
          if (prevEl && !prevEl.classList.contains('online')) {
            prevEl.classList.remove('active');
            prevEl.classList.add('complete');
            const prevStatus = prevEl.querySelector('.boot-step-status');
            if (prevStatus) prevStatus.textContent = 'OK';
          }
        }

        // Activate current step
        if (step.isFinal) {
          stepEl.classList.add('online');
          const status = stepEl.querySelector('.boot-step-status');
          if (status) status.textContent = 'LIVE';
        } else {
          stepEl.classList.add('active');
          const status = stepEl.querySelector('.boot-step-status');
          if (status) status.textContent = 'RUNNING';
        }

        // Update progress bar
        if (progressFill) progressFill.style.width = `${step.progress}%`;
        if (progressPct) progressPct.textContent = `${step.progress}%`;

        // If final step reached, schedule fade out
        if (step.isFinal) {
          setTimeout(() => {
            finish(onComplete);
          }, 900);
        }
      }, accumulatedTime);
    });
  }

  /**
   * Fades out boot screen and triggers completion callback
   */
  function finish(onComplete) {
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen) {
      bootScreen.classList.add('boot-complete');
    }

    isRunning = false;
    hasCompleted = true;
    console.info('[BootSequence] Boot sequence finished. Revealing landing screen.');

    if (typeof onComplete === 'function') {
      setTimeout(onComplete, 700);
    }
  }

  return {
    start,
    hasCompleted: () => hasCompleted,
    isRunning: () => isRunning
  };
})();

// Export globally for clean modular usage
window.BootSequence = BootSequence;
