/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Scenario Simulation Controller
 * 
 * Coordinates the visual components across simulated demonstration scenarios:
 * LOW, MEDIUM, HIGH, EXPIRED.
 * 
 * Note: Visual prototype simulation values only. NOT real ppm or occupational measurements.
 */

'use strict';

const ScenarioController = (() => {
  const SCENARIO_CYCLE = ['LOW', 'MEDIUM', 'HIGH', 'EXPIRED'];
  let currentScenario = 'LOW';
  let isInitialized = false;

  // Cached DOM elements for the controller
  let dom = {
    card: null,
    buttons: {},
    nextBtn: null,
    activeIndicator: null
  };

  function cacheDOM() {
    dom.card = document.getElementById('scenario-controller');
    dom.buttons = {
      LOW: document.getElementById('scenario-btn-low'),
      MEDIUM: document.getElementById('scenario-btn-medium'),
      HIGH: document.getElementById('scenario-btn-high'),
      EXPIRED: document.getElementById('scenario-btn-expired')
    };
    dom.nextBtn = document.getElementById('scenario-btn-next');
    dom.activeIndicator = document.getElementById('active-scenario-name');
  }

  /**
   * Updates visual active state on control buttons and indicators
   * @param {string} scenario
   */
  function updateUIState(scenario) {
    if (!dom.card) cacheDOM();

    // Update active class and aria-pressed on scenario buttons
    Object.keys(dom.buttons).forEach((key) => {
      const btn = dom.buttons[key];
      if (btn) {
        const isActive = key === scenario;
        if (isActive) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      }
    });

    // Update text and color class on current scenario indicator
    if (dom.activeIndicator) {
      dom.activeIndicator.textContent = scenario;
      dom.activeIndicator.className = `ctrl-indicator-val val-${scenario.toLowerCase()}`;
    }
  }

  /**
   * Sets the active scenario across visual components
   * @param {'LOW'|'MEDIUM'|'HIGH'|'EXPIRED'|string} level
   */
  function setScenario(level) {
    const key = String(level || '').trim().toUpperCase();
    if (!SCENARIO_CYCLE.includes(key)) {
      console.warn(`[ScenarioController] Unknown scenario level: "${level}". Expected LOW, MEDIUM, HIGH, or EXPIRED.`);
      return;
    }

    currentScenario = key;

    // 1. Coordinate Dosimeter Wristband Visualizer
    if (window.DosimeterBadge && typeof window.DosimeterBadge.setScenario === 'function') {
      window.DosimeterBadge.setScenario(key);
    }

    // 2. Coordinate H2S Atmospheric Particle Engine
    if (window.ParticleEngine && typeof window.ParticleEngine.setIntensity === 'function') {
      if (key === 'EXPIRED') {
        // Particle intensity returns to LOW/neutral
        window.ParticleEngine.setIntensity('LOW');
      } else {
        window.ParticleEngine.setIntensity(key);
      }
    }

    // 3. Update Controller UI button active states
    updateUIState(key);

    console.info(`[ScenarioController] Active scenario set to: ${key}`);
  }

  /**
   * Returns current active scenario
   * @returns {string}
   */
  function getScenario() {
    return currentScenario;
  }

  /**
   * Advances to the next scenario in predefined cycle:
   * LOW → MEDIUM → HIGH → EXPIRED → LOW
   * @returns {string}
   */
  function nextScenario() {
    const currentIndex = SCENARIO_CYCLE.indexOf(currentScenario);
    const nextIndex = (currentIndex + 1) % SCENARIO_CYCLE.length;
    const nextLevel = SCENARIO_CYCLE[nextIndex];
    setScenario(nextLevel);
    return nextLevel;
  }

  /**
   * Resets simulation to initial state:
   * - LOW scenario
   * - index 24.8
   * - badge ACTIVE
   * - particle intensity LOW
   * - active button LOW
   */
  function reset() {
    if (window.DosimeterBadge && typeof window.DosimeterBadge.reset === 'function') {
      window.DosimeterBadge.reset();
    }
    setScenario('LOW');
    console.info('[ScenarioController] Simulation reset to initial LOW state.');
  }

  /**
   * Initializes the scenario controller and attaches event listeners
   */
  function init() {
    if (isInitialized) return;

    cacheDOM();

    // Attach click listeners to individual scenario buttons
    Object.keys(dom.buttons).forEach((key) => {
      const btn = dom.buttons[key];
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          setScenario(key);
        });
      }
    });

    // Attach click listener to Next Scenario button
    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextScenario();
      });
    }

    // Default to LOW scenario on startup
    setScenario('LOW');

    isInitialized = true;
    console.info('[ScenarioController] Initialized with default scenario: LOW');
  }

  return {
    init,
    setScenario,
    getScenario,
    nextScenario,
    reset
  };
})();

// Export globally
window.ScenarioController = ScenarioController;
