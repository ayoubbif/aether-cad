export class ExtrudeUI {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.createUI();
  }

  createUI() {
    this.container = this.createContainer();
    this.heightInput = this.createNumberInput('Height:', '0.01', '0.01');
    this.pitchInput = this.createNumberInput('Pitch (degrees):', '0', '1', '0', '90');
    this.appendUIElements();
  }

  createContainer() {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      left: '20px',
      top: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '10px',
      borderRadius: '5px',
      display: 'none'
    });
    return container;
  }

  createNumberInput(labelText, defaultValue, step, min = '0.01', max = null) {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '5px';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.color = 'white';
    label.style.marginRight = '5px';

    const input = document.createElement('input');
    Object.assign(input, {
      type: 'number',
      value: defaultValue,
      step: step,
      min: min,
      style: { width: '60px' }
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
