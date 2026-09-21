// Complete headless unit test for Step 6 Automated Demo Controller
const fs = require ? null : null;

// Mock Browser Environment
globalThis.window = globalThis;
globalThis.document = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        className: '',
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        style: {},
        textContent: '',
        setAttribute(k, v) { this[k] = v; },
        getAttribute(k) { return this[k] || null; },
        listeners: {},
        addEventListener(evt, fn) {
          if (!this.listeners[evt]) this.listeners[evt] = [];
          this.listeners[evt].push(fn);
        },
        dispatchEvent(evt) {
          if (this.listeners[evt]) this.listeners[evt].forEach(fn => fn({ preventDefault() {} }));
        },
        querySelector(sel) {
          if (sel === '.btn-label' || sel === 'span') {
            return {
              textContent: 'START AUTOMATED DEMO'
            };
          }
          if (sel === 'svg') {
            return { innerHTML: '' };
          }
          if (sel === '.validity-label') {
            return { textContent: 'BADGE ACTIVE' };
          }
          return null;
        }
      };
    }
    return this.elements[id];
  },
  querySelector(sel) {
    return { textContent: '' };
  },
  querySelectorAll() {
    return [];
  }
};

console.log('Test harness initialized successfully.');
