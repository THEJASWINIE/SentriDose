/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Automated Presentation Demo Controller
 * 
 * Orchestrates an automated presentation sequence using the existing ScenarioController.
 * Does NOT contain independent scenario state logic; ScenarioController is the single source of truth.
 * 
 * Note: Demonstration prototype values only. NOT real ppm or occupational measurements.
 */

'use strict';

const DemoController = (() => {
  let isRunning = false;
  let isInitialized = false;
  let activeTimers = [];

  // DOM Elements Cache
  let dom = {
    btn: null,
    btnLabel: null,
    btnIcon: null,
    safetyAlert: null,
    manualButtons: []
  };

  function cacheDOM() {
    dom.btn = document.getElementById('start-demo-btn') || document.getElementById('auto-demo-btn');
    if (dom.btn) {
      dom.btnLabel = dom.btn.querySelector('.btn-label') || dom.btn.querySelector('span');
      dom.btnIcon = dom.btn.querySelector('svg');
    }
    dom.safetyAlert = document.getElementById('demo-safety-alert');
    dom.manualButtons = [
      document.getElementById('scenario-btn-low'),
      document.getElementById('scenario-btn-medium'),
      document.getElementById('scenario-btn-high'),
      document.getElementById('scenario-btn-expired'),
      document.getElementById('scenario-btn-next')
    ].filter(Boolean);
  }

  /**
   * Clears all pending sequence timers
   */
  function clearAllTimers() {
    activeTimers.forEach((timerId) => clearTimeout(timerId));
    activeTimers = [];
  }

  /**
   * Helper to schedule a step with timer tracking
   */
  function scheduleStep(fn, delayMs) {
    const id = setTimeout(() => {
      // Remove self from activeTimers list
      const idx = activeTimers.indexOf(id);
      if (idx !== -1) activeTimers.splice(idx, 1);
      fn();
    }, delayMs);
    activeTimers.push(id);
    return id;
  }

  /**
   * Shows the prototype safety alert banner
   */
  function showSafetyAlert() {
    if (!dom.safetyAlert) cacheDOM();
    if (dom.safetyAlert) {
      dom.safetyAlert.style.display = 'flex';
      console.info('[DemoController] High exposure safety alert banner displayed.');
    }
  }

  /**
   * Hides the prototype safety alert banner
   */
  function hideSafetyAlert() {
    if (!dom.safetyAlert) cacheDOM();
    if (dom.safetyAlert) {
      dom.safetyAlert.style.display = 'none';
    }
  }

  /**
   * Updates visual button state (START AUTOMATED DEMO <-> STOP DEMO)
   * @param {boolean} running
   */
  function updateButtonState(running) {
    if (!dom.btn) cacheDOM();
    if (!dom.btn) return;

    if (running) {
      if (dom.btnLabel) dom.btnLabel.textContent = 'STOP DEMO';
      dom.btn.classList.add('demo-running');
      dom.btn.setAttribute('aria-label', 'Stop Automated Demo');
      if (dom.btnIcon) {
        dom.btnIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"/>';
      }
    } else {
      if (dom.btnLabel) dom.btnLabel.textContent = 'START AUTOMATED DEMO';
      dom.btn.classList.remove('demo-running');
      dom.btn.setAttribute('aria-label', 'Start Automated Demo');
      if (dom.btnIcon) {
        dom.btnIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      }
    }
  }

  /**
   * Starts the automated demonstration sequence
   */
  function start() {
    // Prevent duplicate runs
    if (isRunning) {
      console.warn('[DemoController] Demo sequence is already running.');
      return;
    }

    isRunning = true;
    updateButtonState(true);
    clearAllTimers();
    hideSafetyAlert();

    console.info('[DemoController] Automated demo sequence started (approx 20s cycle).');

    // Stage 1: RESET (t = 0 ms)
    // Return to initial LOW state and hold for 2s
    if (window.ScenarioController) {
      window.ScenarioController.reset();
    }

    // Stage 2: LOW (t = 2000 ms)
    scheduleStep(() => {
      console.info('[DemoController] Stage 2: LOW scenario.');
      if (window.ScenarioController) {
        window.ScenarioController.setScenario('LOW');
      }
    }, 2000);

    // Stage 3: MEDIUM (t = 5500 ms, duration: 3.5s)
    scheduleStep(() => {
      console.info('[DemoController] Stage 3: MEDIUM scenario.');
      if (window.ScenarioController) {
        window.ScenarioController.setScenario('MEDIUM');
      }
    }, 5500);

    // Stage 4: HIGH (t = 9000 ms, duration: 3.5s)
    scheduleStep(() => {
      console.info('[DemoController] Stage 4: HIGH scenario.');
      if (window.ScenarioController) {
        window.ScenarioController.setScenario('HIGH');
      }
    }, 9000);

    // Stage 5: HIGH SAFETY ALERT (t = 12500 ms, duration: 4.0s)
    // Keep HIGH scenario active with index 84.2 visible, show prominent safety alert banner
    scheduleStep(() => {
      console.info('[DemoController] Stage 5: HIGH SAFETY ALERT banner active.');
      showSafetyAlert();
    }, 12500);

    // Stage 6: EXPIRED (t = 16500 ms, duration: 3.5s)
    scheduleStep(() => {
      console.info('[DemoController] Stage 6: EXPIRED scenario.');
      hideSafetyAlert();
      if (window.ScenarioController) {
        window.ScenarioController.setScenario('EXPIRED');
      }
    }, 16500);

    // Stage 7: RESET & COMPLETE (t = 20000 ms)
    scheduleStep(() => {
      console.info('[DemoController] Stage 7: Sequence completed. Resetting to LOW.');
      stop(true);
    }, 20000);
  }

  /**
   * Immediately stops demo, clears timers, hides alert, and resets to LOW
   * @param {boolean} [resetToLow=true] Whether to restore ScenarioController to LOW
   */
  function stop(resetToLow = true) {
    clearAllTimers();
    hideSafetyAlert();
    isRunning = false;
    updateButtonState(false);

    if (resetToLow && window.ScenarioController) {
      window.ScenarioController.reset();
    }

    console.info('[DemoController] Automated demo stopped. Restored normal controls.');
  }

  /**
   * Restarts the automated sequence from the beginning
   */
  function restart() {
    stop(true);
    start();
  }

  /**
   * Initializes controller, caches DOM, and binds click handlers
   */
  function init() {
    if (isInitialized) return;

    cacheDOM();
    hideSafetyAlert();

    // Attach click listener to automated demo toggle button
    if (dom.btn) {
      dom.btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isRunning) {
          stop(true);
        } else {
          start();
        }
      });
    }

    // If manual scenario controls are clicked while running, cleanly cancel automated demo
    dom.manualButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isRunning) {
          console.info('[DemoController] Manual scenario selected. Stopping automated sequence.');
          stop(false); // Stop timers & alert without overriding user manual pick
        }
      });
    });

    isInitialized = true;
    console.info('[DemoController] Initialized successfully.');
  }

  return {
    init,
    start,
    stop,
    restart,
    isRunning: () => isRunning
  };
})();

// Export globally
window.DemoController = DemoController;
