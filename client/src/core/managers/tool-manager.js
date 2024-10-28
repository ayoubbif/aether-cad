import { DrawTool } from '../../tools/draw';
import { SelectTool } from '../../tools/select';
import { ExtrudeTool } from '../../tools/extrude';

export class ToolManager {
  constructor(scene, camera, renderer) {
    this.tools = new Map();
    this.initializeTools(scene, camera, renderer);
    this.setupToolEventListeners(renderer);
  }

  /**
   * Initializes and registers all available tools
   * Each tool is instantiated with required dependencies
   */
  initializeTools(scene, camera, renderer) {
    this.tools.set('select', new SelectTool(scene, camera, renderer));
    this.tools.set('draw', new DrawTool(scene, camera, renderer));
    this.tools.set('extrude', new ExtrudeTool(scene, camera, renderer));
  }

  /**
   * Sets up event listeners for tool-related events
   * Currently handles selection and deletion events
   *
   * NOTE: Events are bound to renderer.domElement as it's the primary interaction surface
   */
  setupToolEventListeners(renderer) {
    renderer.domElement.addEventListener('objectSelected', (event) => {
      console.log('Object selected:', event.detail.object);
    });

    renderer.domElement.addEventListener('objectDeleted', () => {
      console.log('Object deleted');
    });
  }

  /**
   * Deactivates all tools
   * Useful when switching tools or clearing the current tool state
   */
  deactivateAll() {
    for (const tool of this.tools.values()) {
      tool.deactivate();
    }
  }

  /**
   * Retrieves a tool instance by name
   *
   * @param {string} toolName - Name of the tool to retrieve
   */
  get(toolName) {
    return this.tools.get(toolName);
  }
}
