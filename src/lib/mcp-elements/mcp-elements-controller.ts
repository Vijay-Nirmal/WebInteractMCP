/**
 * @file mcp-elements-controller.ts
 * @description The main controller for managing and running MCP Elements Tools
 */

import Shepherd from 'shepherd.js';
import { ToolRegistry } from './tool-registry';
import { ToolConfiguration, ToolStartConfig, MCPElementsEvent, ToolStep, ToolAction } from './types';

/**
 * The main controller for managing and running MCP Elements Tools.
 */
export class MCPElementsController {
  private registry: ToolRegistry;
  private shepherdTour: any = null;
  private activeTool: ToolConfiguration | null = null;
  private toolQueue: ToolStartConfig[] = [];
  private eventListeners: Map<MCPElementsEvent, Function[]> = new Map();
  private currentStepIndex: number = 0;
  private currentParams: Record<string, any> = {};
  private visualFeedbackEnabled: boolean = true;

  /**
   * Creates a new MCPElementsController instance.
   * @param shepherdOptions - Default options to pass to the Shepherd.Tour constructor.
   * @param enableVisualFeedback - Whether to show visual feedback for automated actions (default: true).
   */
  constructor(private shepherdOptions: any = {}, enableVisualFeedback: boolean = true) {
    this.registry = new ToolRegistry();
    this.visualFeedbackEnabled = enableVisualFeedback;
    this.initializeEventListeners();
    this.injectVisualFeedbackStyles();
  }

  /**
   * Gets the tool registry instance.
   * @returns The tool registry.
   */
  getRegistry(): ToolRegistry {
    return this.registry;
  }

  /**
   * Starts a sequence of Tools.
   * @param toolsToStart - An array of objects, each with a toolId and optional parameters to pass to the tool.
   */
  start(toolsToStart: ToolStartConfig[]): void {
    if (!Array.isArray(toolsToStart) || toolsToStart.length === 0) {
      console.warn('No tools provided to start');
      return;
    }

    // Stop any currently running tool
    this.stop();

    // Queue the tools
    this.toolQueue = [...toolsToStart];
    
    // Start the first tool
    this.executeNextTool();
  }
  /**
   * Stops the currently active tool and clears the queue.
   */
  stop(): void {
    if (this.shepherdTour) {
      this.shepherdTour.cancel();
      this.shepherdTour = null;
    }
    
    const currentTool = this.activeTool;
    this.activeTool = null;
    this.toolQueue = [];
    this.currentStepIndex = 0;
    this.currentParams = {};
    
    this.emit('cancel', { tool: currentTool });
  }

  /**
   * Manually advances to the next step (for 'normal' mode).
   */
  next(): void {
    if (this.shepherdTour && this.activeTool?.mode === 'normal') {
      this.shepherdTour.next();
    }
  }

  /**
   * Manually goes back to the previous step (for 'normal' mode).
   */
  back(): void {
    if (this.shepherdTour && this.activeTool?.mode === 'normal') {
      this.shepherdTour.back();
    }
  }

  /**
   * Registers an event listener for tool events.
   * @param eventName - The name of the event.
   * @param handler - The callback function.
   */
  on(eventName: MCPElementsEvent, handler: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(handler);
  }

  /**
   * Removes an event listener.
   * @param eventName - The name of the event.
   * @param handler - The callback function to remove.
   */
  off(eventName: MCPElementsEvent, handler: Function): void {
    const handlers = this.eventListeners.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emits an event to all registered listeners.
   * @private
   * @param eventName - The name of the event to emit.
   * @param data - Optional data to pass to the event handlers.
   */
  private emit(eventName: MCPElementsEvent, data?: any): void {
    const handlers = this.eventListeners.get(eventName) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }

  /**
   * Executes the next tool in the queue.
   * @private
   */
  private executeNextTool(): void {
    if (this.toolQueue.length === 0) {
      return;
    }

    const { toolId, params = {} } = this.toolQueue.shift()!;
    this.executeTool(toolId, params);
  }
  /**
   * Executes a single tool.
   * @private
   * @param toolId - The ID of the tool to execute.
   * @param params - Optional parameters to pass to the tool.
   */
  private executeTool(toolId: string, params: Record<string, any> = {}): void {
    console.log(`Looking for tool: ${toolId}`);
    const tool = this.registry.getToolById(toolId);
    if (!tool) {
      console.error(`Tool with ID '${toolId}' not found`);
      console.log('Available tools:', Array.from(this.registry.getAllTools().keys()));
      this.executeNextTool(); // Try next tool in queue
      return;
    }

    this.activeTool = tool;
    this.currentParams = params;
    this.currentStepIndex = 0;

    console.log(`Starting tool: ${tool.title} (${tool.mode} mode)`);
    this.emit('start', { tool, params });

    try {
      switch (tool.mode) {
        case 'normal':
          this.executeNormalMode(tool, params);
          break;
        case 'buttonless':
          this.executeButtonlessMode(tool, params);
          break;
        case 'silent':
          this.executeSilentMode(tool, params);
          break;
        default:
          console.error(`Unknown tool mode: ${tool.mode}`);
          this.executeNextTool();
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      this.emit('cancel', { tool, error });
      this.executeNextTool();
    }
  }
  /**
   * Executes a tool in normal mode (with buttons).
   * @private
   */
  private executeNormalMode(tool: ToolConfiguration, params: Record<string, any>): void {
    const steps = this.prepareSteps(tool, params);
    
    this.shepherdTour = new (Shepherd as any).Tour({
      useModalOverlay: true,
      ...this.shepherdOptions
    });    steps.forEach((step, index) => {
      this.shepherdTour!.addStep({
        id: `step-${index}`, // Explicitly set ID for consistency
        title: tool.title,
        text: step.content,
        attachTo: {
          element: step.targetElement,
          on: 'bottom'
        },
        buttons: this.createStepButtons(index, steps.length),
        ...step.shepherdOptions
      });
    });

    this.setupTourEventHandlers();
    this.shepherdTour.start();
  }
  /**
   * Executes a tool in buttonless mode (auto-advancing).
   * @private
   */
  private executeButtonlessMode(tool: ToolConfiguration, params: Record<string, any>): void {
    const steps = this.prepareSteps(tool, params);
    
    this.shepherdTour = new (Shepherd as any).Tour({
      useModalOverlay: true,
      ...this.shepherdOptions
    });    steps.forEach((step, index) => {
      this.shepherdTour!.addStep({
        id: `step-${index}`, // Explicitly set ID to match index
        title: tool.title,
        text: step.content,
        attachTo: {
          element: step.targetElement,
          on: 'bottom'
        },
        buttons: [], // No buttons in buttonless mode
        ...step.shepherdOptions
      });
    });

    // Set up auto-advance with delays
    this.shepherdTour.on('show', (event: any) => {
      try {
        const currentStep = this.shepherdTour!.getCurrentStep();
        if (!currentStep || !currentStep.id) {
          console.warn('No current step found for buttonless mode');
          return;
        }
        
        // Extract index from step ID (format: "step-0", "step-1", etc.)
        const stepIndexMatch = currentStep.id.match(/step-(\d+)/);
        if (!stepIndexMatch) {
          console.warn('Could not parse step index from ID:', currentStep.id);
          return;
        }
        
        const stepIndex = parseInt(stepIndexMatch[1], 10);
        const step = steps[stepIndex];
        
        if (!step) {
          console.warn('Step not found at index:', stepIndex);
          return;
        }
        
        const delay = step.delay || 3000;

        setTimeout(() => {
          if (this.shepherdTour && this.activeTool) {
            if (stepIndex < steps.length - 1) {
              this.shepherdTour.next();
            } else {
              this.shepherdTour.complete();
            }
          }
        }, delay);
      } catch (error) {
        console.error('Error in buttonless mode auto-advance:', error);
      }
    });

    this.setupTourEventHandlers();
    this.shepherdTour.start();
  }
  /**
   * Executes a tool in silent mode (no UI, automated actions).
   * @private
   */
  private async executeSilentMode(tool: ToolConfiguration, params: Record<string, any>): Promise<void> {
    const steps = this.prepareSteps(tool, params);
    console.log('Executing silent mode tool:', tool.title, 'with', steps.length, 'steps');

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        this.currentStepIndex = i;
        
        console.log(`Executing step ${i + 1}/${steps.length}:`, step);
        this.emit('step:show', { step, index: i, tool });

        if (step.action) {
          console.log('Performing action for step', i + 1);
          await this.performAction(step.action, step.targetElement);
        } else {
          console.log('No action defined for step', i + 1);
        }

        // Delay between actions to ensure DOM updates
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Silent mode tool completed successfully');
      this.emit('complete', { tool });
      this.executeNextTool();
    } catch (error) {
      console.error('Error executing silent mode tool:', error);
      this.emit('cancel', { tool, error });
      this.executeNextTool();
    }
  }

  /**
   * Prepares steps by substituting parameters.
   * @private
   */
  private prepareSteps(tool: ToolConfiguration, params: Record<string, any>): ToolStep[] {
    return tool.steps.map(step => ({
      ...step,
      content: this.substituteParams(step.content, params),
      action: step.action ? {
        ...step.action,
        value: this.substituteParams(step.action.value, params)
      } : undefined
    }));
  }

  /**
   * Substitutes parameters in a string or value.
   * @private
   */
  private substituteParams(value: any, params: Record<string, any>): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
      });
    }
    return value;
  }

  /**
   * Creates buttons for a step in normal mode.
   * @private
   */
  private createStepButtons(stepIndex: number, totalSteps: number): any[] {
    const buttons: any[] = [];

    if (stepIndex > 0) {
      buttons.push({
        text: 'Back',
        action: () => this.shepherdTour?.back()
      });
    }

    if (stepIndex < totalSteps - 1) {
      buttons.push({
        text: 'Next',
        action: () => this.shepherdTour?.next()
      });
    } else {
      buttons.push({
        text: 'Complete',
        action: () => this.shepherdTour?.complete()
      });
    }

    buttons.push({
      text: 'Cancel',
      classes: 'shepherd-button-secondary',
      action: () => this.shepherdTour?.cancel()
    });

    return buttons;
  }

  /**
   * Sets up event handlers for the Shepherd tour.
   * @private
   */
  private setupTourEventHandlers(): void {
    if (!this.shepherdTour) return;    this.shepherdTour.on('show', (event: any) => {
      this.emit('step:show', {
        step: this.activeTool?.steps[this.currentStepIndex],
        index: this.currentStepIndex,
        tool: this.activeTool
      });
    });

    this.shepherdTour.on('complete', () => {
      this.emit('complete', { tool: this.activeTool });
      this.activeTool = null;
      this.shepherdTour = null;
      this.executeNextTool();
    });

    this.shepherdTour.on('cancel', () => {
      this.emit('cancel', { tool: this.activeTool });
      this.activeTool = null;
      this.shepherdTour = null;
      this.toolQueue = []; // Clear queue on cancel
    });
  }
  /**
   * Performs an automated action on a DOM element.
   * @private
   */  private async performAction(action: ToolAction, targetElement: string): Promise<void> {
    console.log('Performing action:', action.type, 'on element:', targetElement);
    
    // Wait for element to be available
    const element = await this.waitForElement(targetElement, 5000);
    if (!element) {
      throw new Error(`Element not found: ${targetElement}`);
    }

    console.log('Element found:', element);

    // Highlight the target element before performing action
    this.highlightElement(element, 1500);

    switch (action.type) {
      case 'click':
        console.log('Clicking element...');
        // Show visual click effect before actual click
        this.showClickEffect(element);
        // Small delay to let visual effect show
        await new Promise(resolve => setTimeout(resolve, 200));
        element.click();
        break;
      
      case 'fillInput':
        console.log('Filling input with value:', action.value);
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          // Use typing animation for visual feedback
          await this.showTypingEffect(element, action.value || '');
          
          // Additional events to ensure Angular detects the change
          element.dispatchEvent(new Event('blur', { bubbles: true }));
        } else {
          console.error('Element is not an input or textarea:', element);
        }
        break;
      
      case 'selectOption':
        console.log('Selecting option with value:', action.value);
        if (element instanceof HTMLSelectElement) {
          // Show focus effect before selection
          this.showFocusEffect(element, 800);
          element.focus();
          await new Promise(resolve => setTimeout(resolve, 300));
          
          element.value = action.value || '';
          element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.error('Element is not a select:', element);
        }
        break;
      
      case 'navigate':
        console.log('Navigating to:', action.value);
        // Show click effect if element is clickable (like a link)
        this.showClickEffect(element);
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = action.value || '';
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
    
    // Add a small delay after each action
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Wait for an element to be available in the DOM
   * @private
   */
  private async waitForElement(selector: string, timeout: number = 5000): Promise<HTMLElement | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error(`Element not found after ${timeout}ms:`, selector);
    return null;
  }
  /**
   * Initializes default event listeners.
   * @private
   */
  private initializeEventListeners(): void {
    // Initialize empty arrays for all event types
    this.eventListeners.set('start', []);
    this.eventListeners.set('complete', []);
    this.eventListeners.set('cancel', []);
    this.eventListeners.set('step:show', []);
  }

  /**
   * Injects CSS styles for visual feedback animations.
   * @private
   */
  private injectVisualFeedbackStyles(): void {
    if (!this.visualFeedbackEnabled) return;

    const styleId = 'mcp-visual-feedback-styles';
    if (document.getElementById(styleId)) return; // Already injected

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes mcpClickRipple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes mcpGlow {
        0%, 100% { 
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); 
        }
        50% { 
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); 
        }
      }

      @keyframes mcpPulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.8;
        }
      }

      .mcp-click-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.6);
        animation: mcpClickRipple 0.6s ease-out;
        pointer-events: none;
        z-index: 9999;
        width: 20px;
        height: 20px;
        margin-left: -10px;
        margin-top: -10px;
      }

      .mcp-typing-indicator {
        position: relative;
        overflow: hidden;
      }

      .mcp-typing-indicator::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
        animation: mcpTypingShimmer 1.5s infinite;
        pointer-events: none;
      }

      @keyframes mcpTypingShimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .mcp-highlight {
        animation: mcpGlow 2s ease-in-out infinite;
        transition: all 0.3s ease;
      }

      .mcp-pulse {
        animation: mcpPulse 1s ease-in-out infinite;
      }

      .mcp-focus-ring {
        outline: 2px solid rgba(59, 130, 246, 0.8);
        outline-offset: 2px;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Shows a click visual effect on an element.
   * @private
   */
  private showClickEffect(element: HTMLElement): void {
    if (!this.visualFeedbackEnabled) return;

    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'mcp-click-ripple';
    ripple.style.left = (rect.left + rect.width / 2) + 'px';
    ripple.style.top = (rect.top + rect.height / 2) + 'px';
    
    document.body.appendChild(ripple);
    
    // Add pulse effect to the target element
    element.classList.add('mcp-pulse');
    
    setTimeout(() => {
      ripple.remove();
      element.classList.remove('mcp-pulse');
    }, 600);
  }

  /**
   * Shows typing animation on an input element.
   * @private
   */
  private async showTypingEffect(element: HTMLInputElement | HTMLTextAreaElement, text: string): Promise<void> {
    if (!this.visualFeedbackEnabled) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // Add typing indicator
    element.classList.add('mcp-typing-indicator', 'mcp-focus-ring');
    element.focus();

    // Clear existing content
    element.value = '';

    // Type character by character
    for (let i = 0; i <= text.length; i++) {
      element.value = text.substring(0, i);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Random typing speed between 50-150ms per character
      const delay = Math.random() * 100 + 50;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Remove typing effects
    element.classList.remove('mcp-typing-indicator', 'mcp-focus-ring');
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Highlights an element temporarily.
   * @private
   */
  private highlightElement(element: HTMLElement, duration: number = 2000): void {
    if (!this.visualFeedbackEnabled) return;

    element.classList.add('mcp-highlight');
    setTimeout(() => {
      element.classList.remove('mcp-highlight');
    }, duration);
  }

  /**
   * Shows a focus effect on an element.
   * @private
   */
  private showFocusEffect(element: HTMLElement, duration: number = 1000): void {
    if (!this.visualFeedbackEnabled) return;

    element.classList.add('mcp-focus-ring');
    setTimeout(() => {
      element.classList.remove('mcp-focus-ring');
    }, duration);
  }

  /**
   * Sets whether visual feedback is enabled.
   */
  public setVisualFeedbackEnabled(enabled: boolean): void {
    this.visualFeedbackEnabled = enabled;
    if (enabled) {
      this.injectVisualFeedbackStyles();
    }
  }

  /**
   * Gets whether visual feedback is enabled.
   */
  public isVisualFeedbackEnabled(): boolean {
    return this.visualFeedbackEnabled;
  }
}
