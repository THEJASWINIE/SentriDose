/**
 * SentriDose - Member 3: Visual & Demo Experience
 * Dosimeter Wristband / Colorimetric Strip Visualizer Controller
 * 
 * Note: Visual prototype component demonstrating the colorimetric strip concept.
 * Values are simulated demonstration indices, NOT real ppm or occupational measurements.
 */

'use strict';

const DosimeterBadge = (() => {
  // Prototype demonstration scenario definitions
  const SCENARIO_PRESETS = {
    LOW: {
      indexValue: 24.8,
      indexLabel: '24.8',
      levelText: 'LOW EXPOSURE',
      levelClass: 'level-low',
      stripClass: 'state-low',
      badgeStatus: 'BADGE ACTIVE',
      isExpired: false
    },
    MEDIUM: {
      indexValue: 42.7,
      indexLabel: '42.7',
      levelText: 'MEDIUM EXPOSURE',
      levelClass: 'level-medium',
      stripClass: 'state-medium',
      badgeStatus: 'BADGE ACTIVE',
      isExpired: false
    },
    HIGH: {
      indexValue: 84.2,
      indexLabel: '84.2',
      levelText: 'HIGH EXPOSURE',
      levelClass: 'level-high',
      stripClass: 'state-high',
      badgeStatus: 'BADGE ACTIVE',
      isExpired: false
    },
    EXPIRED: {
      indexValue: null,
      indexLabel: null,
      levelText: 'EXPIRED',
      levelClass: 'level-expired',
      stripClass: 'state-expired',
      badgeStatus: 'BADGE EXPIRED',
      isExpired: true
    }
  };

  let currentScenario = 'LOW';

  // DOM elements cache
  let dom = null;

  function cacheDOM() {
    dom = {
      card: document.getElementById('dosimeter-visualizer'),
      strip: document.getElementById('colorimetric-strip'),
      sensorHousing: document.getElementById('sensor-housing'),
      expiredOverlay: document.getElementById('expired-overlay'),
      indexBox: document.getElementById('exposure-index-box'),
      indexValue: document.getElementById('exposure-index-value'),
      blockedBox: document.getElementById('blocked-index-box'),
      levelBadge: document.getElementById('current-level-badge'),
      levelText: document.getElementById('current-level-text'),
      badgeStatus: document.getElementById('badge-validity-status'),
      validityLabel: document.querySelector('#badge-validity-status .validity-label')
    };
  }

  /**
   * Sets the visual scenario (LOW, MEDIUM, HIGH, EXPIRED)
   * @param {'LOW'|'MEDIUM'|'HIGH'|'EXPIRED'} level
   */
  function setScenario(level) {
    if (!dom || !dom.card) cacheDOM();
    if (!dom.card) {
      console.warn('[DosimeterBadge] Component elements not found in DOM.');
      return;
    }

    const key = (level || 'LOW').toUpperCase();
    const config = SCENARIO_PRESETS[key] || SCENARIO_PRESETS.LOW;
    currentScenario = key;

    // 1. Update Sensing Strip Appearance
    if (dom.strip) {
      dom.strip.className = `colorimetric-strip ${config.stripClass}`;
    }

    // 2. Update Expiration Lockout Overlay
    if (dom.expiredOverlay) {
      if (config.isExpired) {
        dom.expiredOverlay.classList.add('active');
      } else {
        dom.expiredOverlay.classList.remove('active');
      }
    }

    // 3. Update Exposure Index Area
    if (config.isExpired) {
      // Do NOT display an exposure index. Display blocked state.
      if (dom.indexBox) dom.indexBox.style.display = 'none';
      if (dom.blockedBox) dom.blockedBox.style.display = 'flex';
    } else {
      if (dom.blockedBox) dom.blockedBox.style.display = 'none';
      if (dom.indexBox) {
        dom.indexBox.style.display = 'flex';
        if (dom.indexValue) dom.indexValue.textContent = config.indexLabel;
      }
    }

    // 4. Update Current Exposure Level Badge
    if (dom.levelBadge) {
      dom.levelBadge.className = `current-level-badge ${config.levelClass}`;
    }
    if (dom.levelText) {
      dom.levelText.textContent = config.levelText;
    }

    // 5. Update Badge Validity Status Pill
    if (dom.badgeStatus) {
      if (config.isExpired) {
        dom.badgeStatus.classList.add('expired');
      } else {
        dom.badgeStatus.classList.remove('expired');
      }
    }
    if (dom.validityLabel) {
      dom.validityLabel.textContent = config.badgeStatus;
    }

    console.info(`[DosimeterBadge] Scenario set to: ${key}`);
  }

  /**
   * Updates the simulated exposure index display manually
   * @param {number|string} value
   */
  function setExposureIndex(value) {
    if (!dom || !dom.card) cacheDOM();
    if (dom.indexValue && value !== null && value !== undefined) {
      dom.indexValue.textContent = String(value);
    }
  }

  /**
   * Updates badge status pill text
   * @param {string} status
   */
  function setBadgeStatus(status) {
    if (!dom || !dom.card) cacheDOM();
    if (dom.validityLabel) {
      dom.validityLabel.textContent = status;
    }
  }

  /**
   * Resets visualizer to initial LOW exposure state
   */
  function reset() {
    setScenario('LOW');
  }

  /**
   * Initializes component
   */
  function init() {
    cacheDOM();
    setScenario('LOW');
  }

  return {
    init,
    setScenario,
    setExposureIndex,
    setBadgeStatus,
    reset,
    getScenario: () => currentScenario
  };
})();

// Export globally for demo controller integration
window.DosimeterBadge = DosimeterBadge;
