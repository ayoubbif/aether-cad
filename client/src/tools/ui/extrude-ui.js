export class ExtrudeUI {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.createStyles();
    this.createUI();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .extrude-ui-container {
        position: absolute;
        left: 20px;
        top: 20px;
        background: rgba(15, 23, 42, 0.9);
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 240px;
      }

      .extrude-ui-wrapper {
        margin-bottom: 12px;
      }

      .extrude-ui-label {
        display: block;
        color: #e2e8f0;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
      }

      .extrude-ui-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.8);
        color: white;
        font-size: 14px;
        transition: all 0.2s ease;
        outline: none;
      }

      .extrude-ui-input:hover {
        border-color: rgba(255, 255, 255, 0.3);
      }

      .extrude-ui-input:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
      }

      .extrude-ui-input::-webkit-inner-spin-button,
      .extrude-ui-input::-webkit-outer-spin-button {
        opacity: 1;
        height: 24px;
      }
    `;
    document.head.appendChild(style);
  }

  createUI() {
    this.container = this.createContainer();
    this.heightInput = this.createNumberInput('Height:', '0.01', '0.01');
    this.pitchInput = this.createNumberInput('Pitch (degrees):', '0', '1', '0', '90');
    this.appendUIElements();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'extrude-ui-container';
    container.style.display = 'none';
    return container;
  }

  createNumberInput(labelText, defaultValue, step, min = '0.01', max = null) {
    const wrapper = document.createElement('div');
    wrapper.className = 'extrude-ui-wrapper';

    const label = document.createElement('label');
    label.className = 'extrude-ui-label';
    label.textContent = labelText;

    const input = document.createElement('input');
    input.className = 'extrude-ui-input';
    Object.assign(input, {
      type: 'number',
      value: defaultValue,
      step: step,
      min: min
    });

    if (max !== null) {
      input.max = max;
    }

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return { wrapper, input };
  }

  appendUIElements() {
    this.container.appendChild(this.heightInput.wrapper);
    this.container.appendChild(this.pitchInput.wrapper);
    this.parentElement.appendChild(this.container);
  }

  show(height, pitch = 0) {
    this.heightInput.input.value = height.toFixed(1);
    this.pitchInput.input.value = pitch.toFixed(1);
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }

  setHeightChangeHandler(handler) {
    this.heightInput.input.addEventListener('change', (event) => {
      const newHeight = parseFloat(event.target.value);
      const pitch = parseFloat(this.pitchInput.input.value);
      if (!isNaN(newHeight) && newHeight >= 0.01) {
        handler(newHeight, pitch);
      }
    });
  }

  setPitchChangeHandler(handler) {
    this.pitchInput.input.addEventListener('change', (event) => {
      const newPitch = parseFloat(event.target.value);
      const height = parseFloat(this.heightInput.input.value);
      if (!isNaN(newPitch) && newPitch >= 0 && newPitch <= 90) {
        handler(newPitch, height);
      }
    });
  }

  dispose() {
    if (this.container?.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
