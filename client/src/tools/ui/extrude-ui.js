export class ExtrudeUI {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.createUI();
  }

  createUI() {
    this.heightInputContainer = this.createHeightInputContainer();
    this.heightInput = this.createHeightInput();
    this.appendUIElements();
  }

  createHeightInputContainer() {
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

  createHeightInput() {
    const label = document.createElement('label');
    label.textContent = 'Height: ';
    label.style.color = 'white';
    label.style.marginRight = '5px';

    const input = document.createElement('input');
    Object.assign(input, {
      type: 'number',
      step: '0.01',
      min: '0.01',
      style: { width: '60px' }
    });

    return { label, input };
  }

  appendUIElements() {
    this.heightInputContainer.appendChild(this.heightInput.label);
    this.heightInputContainer.appendChild(this.heightInput.input);
    this.parentElement.appendChild(this.heightInputContainer);
  }

  show(height) {
    this.heightInput.input.value = height.toFixed(1);
    this.heightInputContainer.style.display = 'block';
  }

  hide() {
    this.heightInputContainer.style.display = 'none';
  }

  setHeightChangeHandler(handler) {
    this.heightInput.input.addEventListener('change', (event) => {
      const newHeight = parseFloat(event.target.value);
      if (!isNaN(newHeight) && newHeight >= 0.01) {
        handler(newHeight);
      }
    });
  }

  dispose() {
    if (this.heightInputContainer?.parentElement) {
      this.heightInputContainer.parentElement.removeChild(this.heightInputContainer);
    }
  }
}
