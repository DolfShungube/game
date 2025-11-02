export class Settings {
  constructor() {
    this.controls = this.loadControls();
    this.awaitingKeyFor = null;
    this.createSettingsUI();
  }

  getDefaultControls() {
    return {
      forward: "KeyW",
      backward: "KeyZ",
      right: "KeyD",
      left: "KeyA",
      jump: "Space",
      interact: "KeyE",
      exitInteract: "Space"
    };
  }

  loadControls() {
    const saved = localStorage.getItem('gameControls');
    return saved ? JSON.parse(saved) : this.getDefaultControls();
  }

  saveControls() {
    localStorage.setItem('gameControls', JSON.stringify(this.controls));
  }

  getKeyName(code) {
    const keyNames = {
      Space: "Space",
      KeyW: "W", KeyA: "A", KeyS: "S", KeyD: "D",
      KeyZ: "Z", KeyE: "E", KeyQ: "Q",
      ShiftLeft: "Shift", ShiftRight: "Shift",
      ControlLeft: "Ctrl", ControlRight: "Ctrl",
      Escape: "Esc"
    };
    return keyNames[code] || code.replace('Key', '');
  }

  createSettingsUI() {
    // Check if settings UI already exists
    if (document.getElementById('settings-btn')) {
      console.log('Settings UI already exists, skipping creation');
      return;
    }

    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'settings-btn';
    settingsBtn.className = 'menu-btn';
    settingsBtn.textContent = 'Settings';
    
    const infoSection = document.getElementById('info-section');
    infoSection.parentNode.insertBefore(settingsBtn, infoSection);

    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'popup';
    panel.innerHTML = `
      <h2>Controls Settings</h2>
      <p style="color: #aaa; margin-bottom: 20px;">Click a button to change its key binding</p>
      <div id="control-bindings" style="display: flex; flex-direction: column; gap: 12px;"></div>
      <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: center;">
        <button id="reset-controls" style="
          padding: 10px 20px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">Reset to Default</button>
        <button id="close-settings" style="
          padding: 10px 20px;
          background: cyan;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">Close</button>
      </div>
    `;
    document.body.appendChild(panel);

    this.updateControlBindings();

    settingsBtn.addEventListener('click', () => this.openSettings());
    document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
    document.getElementById('reset-controls').addEventListener('click', () => this.resetControls());
  }

  updateControlBindings() {
    const container = document.getElementById('control-bindings');
    if (!container) return;
    
    container.innerHTML = '';

    const controlNames = {
      forward: "Move Forward",
      backward: "Move Backward",
      left: "Move Left",
      right: "Move Right",
      jump: "Jump",
      interact: "Interact",
      exitInteract: "Exit Interaction"
    };

    for (const [key, label] of Object.entries(controlNames)) {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
      `;

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      labelSpan.style.fontSize = '16px';
      labelSpan.style.color = '#eee';

      const button = document.createElement('button');
      button.id = `bind-${key}`;
      button.textContent = this.getKeyName(this.controls[key]);
      button.style.cssText = `
        padding: 8px 20px;
        background: rgba(0, 255, 255, 0.2);
        border: 1px solid cyan;
        color: cyan;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        min-width: 100px;
        transition: all 0.3s;
      `;
      
      button.addEventListener('mouseenter', () => {
        if (this.awaitingKeyFor !== key) {
          button.style.background = 'rgba(0, 255, 255, 0.4)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (this.awaitingKeyFor !== key) {
          button.style.background = 'rgba(0, 255, 255, 0.2)';
        }
      });

      button.addEventListener('click', () => {
        this.startRebinding(key, button);
      });

      row.appendChild(labelSpan);
      row.appendChild(button);
      container.appendChild(row);
    }
  }

  startRebinding(controlKey, button) {
    // Remove any existing listener first
    if (this.currentKeydownHandler) {
      document.removeEventListener('keydown', this.currentKeydownHandler);
      this.currentKeydownHandler = null;
    }

    if (this.awaitingKeyFor) {
      const oldButton = document.getElementById(`bind-${this.awaitingKeyFor}`);
      if (oldButton) {
        oldButton.style.background = 'rgba(0, 255, 255, 0.2)';
        oldButton.style.borderColor = 'cyan';
        oldButton.textContent = this.getKeyName(this.controls[this.awaitingKeyFor]);
      }
    }

    this.awaitingKeyFor = controlKey;
    button.style.background = '#ff9800';
    button.style.borderColor = '#ff9800';
    button.textContent = 'Press a key...';

    const keydownHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.code === 'Escape') {
        this.awaitingKeyFor = null;
        button.style.background = 'rgba(0, 255, 255, 0.2)';
        button.style.borderColor = 'cyan';
        button.textContent = this.getKeyName(this.controls[controlKey]);
        document.removeEventListener('keydown', keydownHandler);
        this.currentKeydownHandler = null;
        return;
      }

      // CHECK IF KEY IS ALREADY USED - This prevents duplicates!
      const existingControl = Object.entries(this.controls).find(
        ([key, code]) => key !== controlKey && code === e.code
      );
      
      if (existingControl) {
        // Show error - key is already in use!
        const [usedByKey] = existingControl;
        const controlNames = {
          forward: "Move Forward",
          backward: "Move Backward",
          left: "Move Left",
          right: "Move Right",
          jump: "Jump",
          interact: "Interact",
          exitInteract: "Exit Interaction"
        };
        
        button.style.background = '#ff4444';
        button.style.borderColor = '#ff4444';
        button.textContent = `Already used by ${controlNames[usedByKey]}`;
        
        setTimeout(() => {
          button.style.background = 'rgba(0, 255, 255, 0.2)';
          button.style.borderColor = 'cyan';
          button.textContent = this.getKeyName(this.controls[controlKey]);
          this.awaitingKeyFor = null;
        }, 2000);
        
        document.removeEventListener('keydown', keydownHandler);
        this.currentKeydownHandler = null;
        return;
      }

      // Key is unique - save it
      this.controls[controlKey] = e.code;
      this.saveControls();
      
      button.textContent = this.getKeyName(e.code);
      button.style.background = '#4CAF50';
      button.style.borderColor = '#4CAF50';
      
      setTimeout(() => {
        button.style.background = 'rgba(0, 255, 255, 0.2)';
        button.style.borderColor = 'cyan';
        this.awaitingKeyFor = null;
      }, 500);

      document.removeEventListener('keydown', keydownHandler);
      this.currentKeydownHandler = null;
    };

    this.currentKeydownHandler = keydownHandler;
    document.addEventListener('keydown', keydownHandler);
  }

  resetControls() {
    this.controls = this.getDefaultControls();
    this.saveControls();
    this.updateControlBindings();
  }

  openSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.style.display = 'block';
  }

  closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.style.display = 'none';
    this.awaitingKeyFor = null;
  }

  getControls() {
    return { ...this.controls };
  }
}