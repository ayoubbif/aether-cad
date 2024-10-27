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
        background: #1f1f1f;
        padding: 16px;
        width: 280px;
        font-family: system-ui, -apple-system, sans-serif;
        border: 1px solid #333;
      }

      .extrude-ui-wrapper {
        margin-bottom: 12px;
      }

      .extrude-ui-header {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
      }

      .extrude-ui-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .extrude-ui-value {
        color: #999;
        font-size: 13px;
      }

      .extrude-ui-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #333;
        background: #2d2d2d;
        color: white;
        font-size: 14px;
      }

      .extrude-ui-input:focus {
        border-color: #666;
        outline: none;
      }

      .extrude-ui-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        background: #333;
        margin: 10px 0;
      }

      .extrude-ui-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        background: #666;
        cursor: pointer;
        border: none;
      }

      .extrude-ui-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #666;
        cursor: pointer;
        border: none;
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
    this.header = this.createHeader();
    this.heightInput = this.createNumberInput('Height:', '0.01', '0.01', 'm');
    this.pitchInput = this.createSliderInput(
      'Pitch:',
      '0',
      '1',
      '-45',
      '45',
      '°'
    );
    this.appendUIElements();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'extrude-ui-container';
    container.style.display = 'none';
    return container;
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'extrude-ui-header';
    header.textContent = 'Extrude Settings';
    return header;
  }

  createWrapper(labelText, defaultValue, unit) {
    const wrapper = document.createElement('div');
    wrapper.className = 'extrude-ui-wrapper';

    const labelContainer = document.createElement('div');
    labelContainer.className = 'extrude-ui-label';

    const label = document.createElement('span');
    label.textContent = labelText;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'extrude-ui-value';
    valueDisplay.textContent = `${defaultValue}${unit}`;

    labelContainer.appendChild(label);
    labelContainer.appendChild(valueDisplay);
    wrapper.appendChild(labelContainer);

    return { wrapper, valueDisplay };
  }

  createNumberInput(labelText, defaultValue, step, unit, min = '0.01', max = null) {
    const { wrapper, valueDisplay } = this.createWrapper(labelText, defaultValue, unit);

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

    input.addEventListener('input', () => {
      valueDisplay.textContent = `${input.value}${unit}`;
    });

    wrapper.appendChild(input);
    return { wrapper, input, valueDisplay };
  }

  createSliderInput(labelText, defaultValue, step, min, max, unit) {
    const { wrapper, valueDisplay } = this.createWrapper(labelText, defaultValue, unit);

    const input = document.createElement('input');
    input.className = 'extrude-ui-slider';
    Object.assign(input, {
      type: 'range',
      value: defaultValue,
      step: step,
      min: min,
      max: max
    });

    input.addEventListener('input', () => {
      valueDisplay.textContent = `${input.value}${unit}`;
    });

    wrapper.appendChild(input);
    return { wrapper, input, valueDisplay };
  }

  appendUIElements() {
    this.container.appendChild(this.header);
    this.container.appendChild(this.heightInput.wrapper);
    this.container.appendChild(this.pitchInput.wrapper);
    this.parentElement.appendChild(this.container);
  }

  show(height, pitch = 0) {
    this.heightInput.input.value = height.toFixed(1);
    this.heightInput.valueDisplay.textContent = `${height.toFixed(1)}mm`;
    this.pitchInput.input.value = pitch.toFixed(1);
    this.pitchInput.valueDisplay.textContent = `${pitch.toFixed(1)}°`;
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
    this.pitchInput.input.addEventListener('input', (event) => {
      const newPitch = parseFloat(event.target.value);
      const height = parseFloat(this.heightInput.input.value);
      if (!isNaN(newPitch) && newPitch >= -45 && newPitch <= 45) {
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
