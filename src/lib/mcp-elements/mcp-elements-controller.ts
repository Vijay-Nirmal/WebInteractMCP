/**
 * @file mcp-elements-controller.ts
 * @description The main controller for managing and running MCP Elements Tools
 */

import { Tour, ShepherdBase } from 'shepherd.js';
import { ToolRegistry } from './tool-registry';
import { ToolConfiguration, ToolStartConfig, MCPElementsEvent, ToolStep, ToolAction, MCPElementsOptions, CustomFunction, CustomFunctionContext, CustomFunctionImplementation, VisualEffectStyles, ToolParameterSchema, ParameterDefinition, ReturnValueProviderFunction, ReturnValueProvider, ExecutionResult, ReturnValueContext, SuccessfulExecutionResult, FailedExecutionResult } from './types';

/**
 * The main controller for managing and running MCP Elements Tools.
 */
export class MCPElementsController {
  private registry: ToolRegistry;
  private shepherdTour: Tour | null = null;
  private activeTool: ToolConfiguration | null = null;
  private toolQueue: ToolStartConfig[] = [];
  private eventListeners: Map<MCPElementsEvent, Function[]> = new Map();
  private currentStepIndex: number = 0;
  private globalOptions: MCPElementsOptions;
  private customFunctions: Map<string, CustomFunction> = new Map();
  private returnValueProviders: Map<string, ReturnValueProviderFunction> = new Map();
  private stepReturnValues: ExecutionResult[] = [];
  private customStyles: VisualEffectStyles = {};
  private styleElementId: string = 'mcp-visual-feedback-styles';

  /**
   * Creates a new MCPElementsController instance.
   * @param shepherdOptions - Default options to pass to the Shepherd.Tour constructor.
   * @param options - Global configuration options for the controller.
   */
 constructor(private shepherdOptions: any = {}, options: Partial<MCPElementsOptions> = {}) {
    this.registry = new ToolRegistry();

    // Set default options
    this.globalOptions = {
      enableVisualFeedback: true,
      debugMode: false,
      stopOnFailure: false,
      elementTimeout: 5000,
      highlightDuration: 2000,
      focusEffectDuration: 1000,
      clickEffectDuration: 600,
      actionDelay: 500,
      defaultButtonlessDelay: 3000,
      ...options
    };

    // Initialize custom styles from options
    if (options.visualEffectStyles) {
      this.customStyles = { ...options.visualEffectStyles };
    }

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
   * Gets the current global options.
   * @returns The current global options.
   */
  getGlobalOptions(): MCPElementsOptions {
    return { ...this.globalOptions };
  }
 /**
   * Updates global options.
   * @param options - Partial options to update.
   */
  updateGlobalOptions(options: Partial<MCPElementsOptions>): void {
    this.globalOptions = { ...this.globalOptions, ...options };
    
    // Update custom styles if provided
    if (options.visualEffectStyles) {
      this.customStyles = { ...this.customStyles, ...options.visualEffectStyles };
    }
    
    if (options.enableVisualFeedback === true) {
      this.injectVisualFeedbackStyles();
    }
  }

  /**
   * Updates the visual effect styles and regenerates the CSS.
   * @param styles - Partial visual effect styles to update.
   */
  updateVisualEffectStyles(styles: Partial<VisualEffectStyles>): void {
    this.customStyles = { ...this.customStyles, ...styles };
    this.injectVisualFeedbackStyles();
    this.debugLog('Updated visual effect styles:', this.customStyles);
  }

  /**
   * Gets the current visual effect styles.
   * @returns The current visual effect styles.
   */
  getVisualEffectStyles(): VisualEffectStyles {
    return { ...this.customStyles };
  }

  /**
   * Resets visual effect styles to default values.
   */
  resetVisualEffectStyles(): void {
    this.customStyles = {};
    this.injectVisualFeedbackStyles();
    this.debugLog('Reset visual effect styles to defaults');
  }

  /**
   * Sets a specific style property for a visual effect.
   * @param effect - The visual effect to modify.
   * @param property - The property to set.
   * @param value - The value to set.
   */
  setVisualEffectProperty(effect: keyof VisualEffectStyles, property: string, value: any): void {
    if (!this.customStyles[effect]) {
      this.customStyles[effect] = {};
    }
    (this.customStyles[effect] as any)[property] = value;
    this.injectVisualFeedbackStyles();
    this.debugLog(`Set ${effect}.${property} to:`, value);
  }

  /**
   * Registers a custom function that can be called from tool steps.
   * @param customFunction - The custom function configuration.
   */
  registerCustomFunction(customFunction: CustomFunction): void {
    this.customFunctions.set(customFunction.name, customFunction);
    this.debugLog(`Registered custom function: ${customFunction.name}`);
  }

  /**
   * Registers multiple custom functions.
   * @param functions - Array of custom function configurations.
   */
  registerCustomFunctions(functions: CustomFunction[]): void {
    functions.forEach(func => this.registerCustomFunction(func));
  }

  /**
   * Unregisters a custom function.
   * @param functionName - The name of the function to unregister.
   */
  unregisterCustomFunction(functionName: string): void {
    this.customFunctions.delete(functionName);
    this.debugLog(`Unregistered custom function: ${functionName}`);
  }

  /**
   * Gets a registered custom function.
   * @param functionName - The name of the function to retrieve.
   * @returns The custom function configuration or undefined if not found.
   */
  getCustomFunction(functionName: string): CustomFunction | undefined {
    return this.customFunctions.get(functionName);
  }  /**
   * Gets all registered custom functions.
   * @returns Map of all registered custom functions.
   */
  getAllCustomFunctions(): Map<string, CustomFunction> {
    return new Map(this.customFunctions);
  }

  /**
   * Registers a return value provider function that can be called from tool steps.
   * @param provider - The return value provider configuration.
   */
  registerReturnValueProvider(provider: ReturnValueProviderFunction): void {
    this.returnValueProviders.set(provider.name, provider);
    this.debugLog(`Registered return value provider: ${provider.name}`);
  }

  /**
   * Registers multiple return value provider functions.
   * @param providers - Array of return value provider configurations.
   */
  registerReturnValueProviders(providers: ReturnValueProviderFunction[]): void {
    providers.forEach(provider => this.registerReturnValueProvider(provider));
  }

  /**
   * Unregisters a return value provider function.
   * @param providerName - The name of the provider to unregister.
   */
  unregisterReturnValueProvider(providerName: string): void {
    this.returnValueProviders.delete(providerName);
    this.debugLog(`Unregistered return value provider: ${providerName}`);
  }

  /**
   * Gets a registered return value provider function.
   * @param providerName - The name of the provider to retrieve.
   * @returns The return value provider configuration or undefined if not found.
   */
  getReturnValueProvider(providerName: string): ReturnValueProviderFunction | undefined {
    return this.returnValueProviders.get(providerName);
  }

  /**
   * Gets all registered return value provider functions.
   * @returns Map of all registered return value providers.
   */
  getAllReturnValueProviders(): Map<string, ReturnValueProviderFunction> {
    return new Map(this.returnValueProviders);
  }


  /**
   * Gets the effective options for a tool (merges global and tool-specific options).
   * @private
   * @param tool - The tool configuration.
   * @returns The effective options for the tool.
   */
  private getEffectiveOptions(tool: ToolConfiguration): MCPElementsOptions {
    return { ...this.globalOptions, ...tool.options };
  }

  /**
   * Logs a debug message if debug mode is enabled.
   * @private
   * @param message - The message to log.
   * @param data - Optional data to log.
   */
  private debugLog(message: string, ...data: any[]): void {
    if (this.globalOptions.debugMode) {
      console.log(`[MCP Debug] ${message}`, ...data);
    }
  }

  /**
   * Starts a sequence of Tools.
   * @param toolsToStart - An array of objects, each with a toolId and optional parameters to pass to the tool.
   * @returns Promise that resolves with an array of ExecutionResult from each tool execution.
   */
  async start(toolsToStart: ToolStartConfig[]): Promise<ExecutionResult[]> {
    if (!Array.isArray(toolsToStart) || toolsToStart.length === 0) {
      console.warn('No tools provided to start');
      return [];
    }

    // Validate parameters for all tools before starting
    for (const toolConfig of toolsToStart) {
      const validation = this.validateToolParameters(toolConfig.toolId, toolConfig.params || {});
      if (!validation.isValid) {
        const errorMsg = `Parameter validation failed for tool '${toolConfig.toolId}': ${validation.errors.join(', ')}`;
        console.error(errorMsg);
        this.emit('cancel', { 
          tool: this.registry.getToolById(toolConfig.toolId), 
          error: errorMsg,
          validationErrors: validation.errors 
        });
        return [{ 
          success: false, 
          error: new Error(errorMsg), 
          returnValue: undefined, 
          allReturnValues: [] 
        }];
      }
      if (validation.warnings.length > 0) {
        console.warn(`Parameter validation warnings for tool '${toolConfig.toolId}':`, validation.warnings);
      }

      // Apply default values to parameters
      toolConfig.params = this.applyParameterDefaults(toolConfig.toolId, toolConfig.params || {});
    }

    // Stop any currently running tool
    this.stop();

    // Queue the tools
    this.toolQueue = [...toolsToStart];

    this.debugLog('Starting tool sequence', toolsToStart.map(t => t.toolId));

    const results: ExecutionResult[] = [];
    while (this.toolQueue.length > 0) {
      const { toolId, params = {} } = this.toolQueue.shift()!;
      const result = await this.executeTool(toolId, params);
      results.push(result);
    }

    return results;
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
  private async executeNextTool(): Promise<void> {
    if (this.toolQueue.length === 0) {
      return;
    }

    const { toolId, params = {} } = this.toolQueue.shift()!;
    await this.executeTool(toolId, params);
  }

  /**
   * Executes a single tool.
   * @private
   * @param toolId - The ID of the tool to execute.
   * @param params - Optional parameters to pass to the tool.
   * @returns Promise that resolves with the tool execution result.
   */
  private async executeTool(toolId: string, params: Record<string, any> = {}): Promise<ExecutionResult> {
    this.debugLog(`Looking for tool: ${toolId}`);
    const tool = this.registry.getToolById(toolId);
    if (!tool) {
      console.error(`Tool with ID '${toolId}' not found`);
      this.debugLog('Available tools:', Array.from(this.registry.getAllTools().keys()));
      const error = new Error(`Tool with ID '${toolId}' not found`);
      return { success: false, error, returnValue: undefined, allReturnValues: [] };
    }

    this.activeTool = tool;
    this.currentStepIndex = 0;
    this.stepReturnValues = []; // Reset step return values for new tool

    this.debugLog(`Starting tool: ${tool.title} (${tool.mode} mode)`, { params });
    this.emit('start', { tool, params });

    try {
      let result: ExecutionResult;
      switch (tool.mode) {
        case 'normal':
          result = await this.executeNormalMode(tool, params);
          break;
        case 'buttonless':
          result = await this.executeButtonlessMode(tool, params);
          break;
        case 'silent':
          result = await this.executeSilentMode(tool, params);
          break;
        default:
          const error = new Error(`Unknown tool mode: ${tool.mode}`);
          console.error(error.message);
          this.emit('cancel', { tool, error });
          return { success: false, error, returnValue: undefined, allReturnValues: [] };
      }
      return result;
    } catch (error) {
      console.error('Error executing tool:', error);
      this.emit('cancel', { tool, error });
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)), 
        returnValue: undefined,
        allReturnValues: [...this.stepReturnValues]
      };
    }
  }
  /**
   * Executes a tool in normal mode (with buttons).
   * @private
   */
  private async executeNormalMode(tool: ToolConfiguration, params: Record<string, any>): Promise<ExecutionResult> {
    const steps = this.prepareSteps(tool, params);

    return new Promise((resolve) => {
      this.shepherdTour = new (new ShepherdBase()).Tour({
        useModalOverlay: true,
        ...this.shepherdOptions
      }) as Tour;

      steps.forEach((step, index) => {
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

      // Set up event handlers with return value support
      this.setupTourEventHandlersWithReturnValues(resolve);
      this.shepherdTour!.start();
    });
  }

  /**
   * Executes a tool in buttonless mode (auto-advancing).
   * @private
   */
  private async executeButtonlessMode(tool: ToolConfiguration, params: Record<string, any>): Promise<ExecutionResult> {
    const steps = this.prepareSteps(tool, params);
    const effectiveOptions = this.getEffectiveOptions(tool);

    return new Promise((resolve) => {
      this.shepherdTour = new (new ShepherdBase()).Tour({
        useModalOverlay: true,
        ...this.shepherdOptions
      }) as Tour;

      steps.forEach((step, index) => {
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

      // Set up auto-advance with delays and return value calculation
      this.shepherdTour!.on('show', async (event: any) => {
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

          // Calculate return value for the current step
          const stepReturnValue = await this.calculateStepReturnValue(step, params, stepIndex, undefined);
          this.stepReturnValues[stepIndex] = stepReturnValue;

          const delay = step.delay || effectiveOptions.defaultButtonlessDelay;

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

      this.setupTourEventHandlersWithReturnValues(resolve);
      this.shepherdTour.start();
    });
  }
  /**
   * Executes a tool in silent mode (no UI, automated actions).
   * @private
   */
  private async executeSilentMode(tool: ToolConfiguration, params: Record<string, any>): Promise<ExecutionResult> {
    const steps = this.prepareSteps(tool, params);
    const effectiveOptions = this.getEffectiveOptions(tool);

    this.debugLog('Executing silent mode tool:', tool.title, 'with', steps.length, 'steps');

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        this.currentStepIndex = i;

        this.debugLog(`Executing step ${i + 1}/${steps.length}:`, step);
        this.emit('step:show', { step, index: i, tool });

        let stepResult: ExecutionResult = { success: true, allReturnValues: [] };
        let actionResult: any = undefined;

        if (step.action) {
          this.debugLog('Performing action for step', i + 1);
          try {
            actionResult = await this.performAction(step.action, step.targetElement, params);
            stepResult.returnValue = actionResult;
            stepResult.success = true;
          } catch (stepError) {
            const errorMessage = stepError instanceof Error ? stepError.message : String(stepError);
            console.error(`Error in step ${i + 1}:`, stepError);
            stepResult.success = false;
            stepResult.error = stepError instanceof Error ? stepError : new Error(errorMessage);

            // Check if we should stop on failure (step-level or tool-level)
            const shouldStop = step.stopOnFailure !== undefined ? step.stopOnFailure : effectiveOptions.stopOnFailure;
            if (shouldStop) {
              throw new Error(`Step ${i + 1} failed and stopOnFailure is enabled: ${errorMessage}`);
            }
            // Continue with next step if stopOnFailure is false
            this.debugLog(`Step ${i + 1} failed but continuing due to stopOnFailure=false`);
          }
        } else {
          this.debugLog('No action defined for step', i + 1);
        }

        // Calculate step return value
        const stepReturnValue = await this.calculateStepReturnValue(step, params, i, actionResult, stepResult);
        this.stepReturnValues.push(stepReturnValue);

        this.debugLog(`Step ${i + 1} completed with return value:`, stepReturnValue);

        // Delay between actions to ensure DOM updates (configurable)
        const actionDelay = step.action?.delay || effectiveOptions.actionDelay;
        await new Promise(resolve => setTimeout(resolve, actionDelay));
      }

      this.debugLog('Silent mode tool completed successfully');
      
      const toolResult = await this.calculateToolReturnValue(tool, params, steps.length, true);
      
      this.emit('complete', { tool, result: toolResult });
      return toolResult;
    } catch (error) {
      console.error('Error executing silent mode tool:', error);
      
      const toolResult = await this.calculateToolReturnValue(tool, params, this.currentStepIndex + 1, false, error instanceof Error ? error : new Error(String(error)));
      
      this.emit('cancel', { tool, error, result: toolResult });
      return toolResult;
    }
  }

  /**
   * Calculates the return value for a step based on its configuration.
   * @private
   * @param step - The step configuration.
   * @param toolParams - Tool-level parameters.
   * @param stepIndex - The current step index.
   * @returns The calculated return value.
   */
  private async calculateStepReturnValue(
    step: ToolStep,
    toolParams: Record<string, any>, 
    stepIndex: number,
    actionResult?: any,
    currentResult: ExecutionResult = SuccessfulExecutionResult
  ): Promise<ExecutionResult> {
    if (currentResult.success === false) {
      return currentResult;
    }

    if (step.action?.type === 'executeFunction' && !step.returnValue) {
      return { success: true, returnValue: actionResult, allReturnValues: [] };
    }

    if (!step.returnValue) {
      return SuccessfulExecutionResult;
    }

    const returnValueConfig = step.returnValue;

    // If there's a hardcoded value, return it
    if (returnValueConfig.value !== undefined) {
      return { success: true, returnValue: this.substituteParams(returnValueConfig.value, toolParams), allReturnValues: this.stepReturnValues };
    }

    // If there's a provider function, call it
    if (returnValueConfig.provider || returnValueConfig.providerName) {
      const provider = returnValueConfig.provider || 
                     (returnValueConfig.providerName ? 
                      this.returnValueProviders.get(returnValueConfig.providerName)?.implementation : 
                      undefined);

      if (!provider) {
        console.warn(`Return value provider not found: ${returnValueConfig.providerName}`);
        return FailedExecutionResult();
      }

      const targetElement = await this.waitForElement(step.targetElement);
      if (!targetElement) {
        console.warn(`Target element not found for return value calculation: ${step.targetElement}`);
        return FailedExecutionResult();
      }

      const context: ReturnValueContext = {
        element: targetElement,
        stepParams: returnValueConfig.providerParams || {},
        toolParams,
        controller: this,
        debugLog: this.debugLog.bind(this),
        activeTool: this.activeTool,
        currentStepIndex: stepIndex,
        previousStepReturnValue: stepIndex > 0 ? this.stepReturnValues[stepIndex - 1] : undefined,
        actionResult: actionResult
      };

      try {
        const result = await provider(context);
        return { success: true, returnValue: result, allReturnValues: this.stepReturnValues };
      } catch (error) {
        console.error('Error executing return value provider:', error);
        return FailedExecutionResult(error instanceof Error ? error : new Error(String(error)));
      }
    }

    return SuccessfulExecutionResult;
  }

  /**
   * Calculates the tool-level return value based on the tool configuration.
   * @private
   * @param tool - The tool configuration.
   * @param toolParams - Tool-level parameters.
   * @param stepsExecuted - Number of steps executed.
   * @param toolExecutionSuccess - Whether the tool executed successfully.
   * @param toolExecutionError - Any error that occurred during tool execution.
   * @returns The calculated tool-level return value.
   */
  private async calculateToolReturnValue(
    tool: ToolConfiguration, 
    toolParams: Record<string, any>, 
    stepsExecuted: number,
    toolExecutionSuccess: boolean,
    toolExecutionError?: Error
  ): Promise<ExecutionResult> {
    if (!tool.returnValue) {
      // No tool-level return value specified, use last step's return value
      return this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : SuccessfulExecutionResult;
    }

    const returnValueConfig = tool.returnValue;

    // If there's a hardcoded value, return it
    if (returnValueConfig.value !== undefined) {
      return { success: true, returnValue: this.substituteParams(returnValueConfig.value, toolParams), allReturnValues: this.stepReturnValues };
    }

    // If there's a provider function, call it
    if (returnValueConfig.provider || returnValueConfig.providerName) {
      const provider = returnValueConfig.provider || 
                     (returnValueConfig.providerName ? 
                      this.returnValueProviders.get(returnValueConfig.providerName)?.implementation : 
                      undefined);

      if (!provider) {
        console.warn(`Tool return value provider not found: ${returnValueConfig.providerName}`);
        // Fallback to last step's return value
        return this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : SuccessfulExecutionResult;
      }

      const context: ReturnValueContext = {
        toolParams,
        controller: this,
        debugLog: this.debugLog.bind(this),
        activeTool: tool,
        stepsExecuted,
        allStepReturnValues: [...this.stepReturnValues],
        lastStepReturnValue: this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : SuccessfulExecutionResult,
        toolExecutionSuccess,
        toolExecutionError
      };

      try {
        const result = await provider(context);
        this.debugLog('Tool return value provider result:', result);
        return { success: true, returnValue: result, allReturnValues: this.stepReturnValues };
      } catch (error) {
        console.error('Error executing tool return value provider:', error);
        // Fallback to last step's return value
        return this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : SuccessfulExecutionResult;
      }
    }

    // Fallback to last step's return value
    return this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : SuccessfulExecutionResult;
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
   * Sets up event handlers for the Shepherd tour with return value support.
   * @private
   */
  private setupTourEventHandlersWithReturnValues(resolve: (result: ExecutionResult) => void): void {
    if (!this.shepherdTour) return;

    this.shepherdTour.on('show', async (event: any) => {
      this.emit('step:show', {
        step: this.activeTool?.steps[this.currentStepIndex],
        index: this.currentStepIndex,
        tool: this.activeTool
      });

      // For normal mode, calculate return value when step is shown
      if (this.activeTool?.mode === 'normal') {
        const step = this.activeTool.steps[this.currentStepIndex];
        if (step) {
          const stepReturnValue = await this.calculateStepReturnValue(step, {}, this.currentStepIndex, undefined);
          this.stepReturnValues[this.currentStepIndex] = stepReturnValue;
        }
      }
    });

    this.shepherdTour.on('complete', async () => {
      // Calculate tool-level return value (might override last step's return value)
      const toolReturnValue = await this.calculateToolReturnValue(
        this.activeTool!, 
        {}, // Tool params not available in Shepherd context, could be enhanced
        this.stepReturnValues.length, 
        true
      );
      
      const toolResult: ExecutionResult = {
        success: true,
        returnValue: toolReturnValue,
        allReturnValues: [...this.stepReturnValues]
      };

      this.emit('complete', { tool: this.activeTool, result: toolResult });
      this.activeTool = null;
      this.shepherdTour = null;
      resolve(toolResult);
    });

    this.shepherdTour.on('cancel', async () => {
      // Calculate tool-level return value even on cancel
      const toolReturnValue = await this.calculateToolReturnValue(
        this.activeTool!, 
        {}, // Tool params not available in Shepherd context
        this.stepReturnValues.length, 
        false,
        new Error('Tool cancelled by user')
      );
      
      const toolResult: ExecutionResult = {
        success: false,
        error: new Error('Tool cancelled by user'),
        returnValue: toolReturnValue,
        allReturnValues: [...this.stepReturnValues]
      };

      this.emit('cancel', { tool: this.activeTool, result: toolResult });
      this.activeTool = null;
      this.shepherdTour = null;
      this.toolQueue = []; // Clear queue on cancel
      resolve(toolResult);
    });
  }

  /**
   * Performs an automated action on a DOM element.
   * @private
   * @returns The result of the action (e.g., clicked element, filled value, function return value).
   */
  private async performAction(action: ToolAction, targetElement: string, params: Record<string, any>): Promise<any> {
    const effectiveOptions = this.activeTool ? this.getEffectiveOptions(this.activeTool) : this.globalOptions;

    this.debugLog('Performing action:', action.type, 'on element:', targetElement);

    // Wait for element to be available
    const element = await this.waitForElement(targetElement, effectiveOptions.elementTimeout);
    if (!element) {
      throw new Error(`Element not found: ${targetElement}`);
    }

    this.debugLog('Element found:', element);

    // Highlight the target element before performing action
    this.highlightElement(element, effectiveOptions.highlightDuration, effectiveOptions);

    let actionResult: any = undefined;

    switch (action.type) {
      case 'click':
        this.debugLog('Clicking element...');
        // Show visual click effect before actual click
        this.showClickEffect(element, effectiveOptions);
        // Small delay to let visual effect show
        await new Promise(resolve => setTimeout(resolve, 200));
        element.click();
        actionResult = { clicked: true, element: targetElement };
        break;

      case 'fillInput':
        this.debugLog('Filling input with value:', action.value);
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          // Use typing animation for visual feedback
          await this.showTypingEffect(element, action.value || '', effectiveOptions);
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          actionResult = { filled: true, value: action.value, element: targetElement };
        } else {
          console.error('Element is not an input or textarea:', element);
          throw new Error(`Element ${targetElement} is not an input or textarea`);
        }
        break;

      case 'selectOption':
        this.debugLog('Selecting option with value:', action.value);
        if (element instanceof HTMLSelectElement) {
          // Show focus effect before selection
          this.showFocusEffect(element, effectiveOptions.focusEffectDuration, effectiveOptions);
          element.focus();
          await new Promise(resolve => setTimeout(resolve, 300));

          element.value = action.value || '';
          element.dispatchEvent(new Event('change', { bubbles: true }));
          actionResult = { selected: true, value: action.value, element: targetElement };
        } else {
          console.error('Element is not a select:', element);
          throw new Error(`Element ${targetElement} is not a select element`);
        }
        break;

      case 'navigate':
        this.debugLog('Navigating to:', action.value);
        // Show click effect if element is clickable (like a link)
        this.showClickEffect(element, effectiveOptions);
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = action.value || '';
        actionResult = { navigated: true, url: action.value };
        break;

      case 'executeFunction':
        this.debugLog('Executing custom function:', action.functionName || 'inline function');
        actionResult = await this.executeCustomFunction(action, element, params);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Add a small delay after each action (configurable)
    await new Promise(resolve => setTimeout(resolve, effectiveOptions.actionDelay));
    
    return actionResult;
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
   * Executes a custom function as part of a tool action.
   * @private
   * @returns The return value from the custom function.
   */
  private async executeCustomFunction(action: ToolAction, targetElement: HTMLElement, toolParams: Record<string, any>): Promise<any> {
    let functionToExecute: CustomFunctionImplementation | undefined;
    
    // Check if function is provided directly
    if (action.function) {
      functionToExecute = action.function as CustomFunctionImplementation;
      this.debugLog('Using inline function');
    } 
    // Check if function name is provided and exists in registry
    else if (action.functionName) {
      const customFunction = this.customFunctions.get(action.functionName);
      if (customFunction) {
        functionToExecute = customFunction.implementation;
        this.debugLog(`Using registered function: ${action.functionName}`);
      } else {
        throw new Error(`Custom function '${action.functionName}' not found in registry`);
      }
    } else {
      throw new Error('No function or functionName provided for executeFunction action');
    }

    if (!functionToExecute) {
      throw new Error('Function to execute is undefined');
    }

    try {
      // Prepare function context with proper typing
      const context: CustomFunctionContext = {
        element: targetElement,
        params: action.functionParams || {},
        toolParams: toolParams,
        controller: this,
        debugLog: this.debugLog.bind(this),
        activeTool: this.activeTool,
        currentStepIndex: this.currentStepIndex,
        previousStepReturnValue: this.currentStepIndex > 0 ? this.stepReturnValues[this.currentStepIndex - 1] : undefined
      };

      // Execute the function with context
      const result = await Promise.resolve(functionToExecute.call(context, context));
      
      this.debugLog('Custom function executed successfully:', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.debugLog('Error executing custom function:', errorMessage);
      throw new Error(`Custom function execution failed: ${errorMessage}`);
    }
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
    if (!this.globalOptions.enableVisualFeedback) return;

    // Remove existing styles if they exist
    const existingStyle = document.getElementById(this.styleElementId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Get style values with defaults
    const clickRipple = {
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      size: 20,
      duration: 0.6,
      borderRadius: '50%',
      ...this.customStyles.clickRipple
    };

    const highlight = {
      primaryColor: 'rgba(59, 130, 246, 0.5)',
      secondaryColor: 'rgba(59, 130, 246, 0.8)',
      tertiaryColor: 'rgba(59, 130, 246, 0.6)',
      duration: 2,
      primaryBlur: 5,
      secondaryBlur: 20,
      tertiaryBlur: 30,
      ...this.customStyles.highlight
    };

    const pulse = {
      duration: 1,
      scale: 1.05,
      opacity: 0.8,
      ...this.customStyles.pulse
    };

    const typing = {
      shimmerGradient: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
      duration: 1.5,
      opacity: 0.2,
      ...this.customStyles.typing
    };

    const focusRing = {
      color: 'rgba(59, 130, 246, 0.8)',
      width: 2,
      offset: 2,
      borderRadius: 4,
      ...this.customStyles.focusRing
    };

    const style = document.createElement('style');
    style.id = this.styleElementId;
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
          box-shadow: 0 0 ${highlight.primaryBlur}px ${highlight.primaryColor}; 
        }
        50% { 
          box-shadow: 0 0 ${highlight.secondaryBlur}px ${highlight.secondaryColor}, 0 0 ${highlight.tertiaryBlur}px ${highlight.tertiaryColor}; 
        }
      }

      @keyframes mcpPulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(${pulse.scale});
          opacity: ${pulse.opacity};
        }
      }

      @keyframes mcpTypingShimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .mcp-click-ripple {
        position: absolute;
        border-radius: ${clickRipple.borderRadius};
        background: ${clickRipple.backgroundColor};
        animation: mcpClickRipple ${clickRipple.duration}s ease-out;
        pointer-events: none;
        z-index: 9999;
        width: ${clickRipple.size}px;
        height: ${clickRipple.size}px;
        margin-left: -${clickRipple.size / 2}px;
        margin-top: -${clickRipple.size / 2}px;
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
        background: ${typing.shimmerGradient};
        animation: mcpTypingShimmer ${typing.duration}s infinite;
        pointer-events: none;
      }

      .mcp-highlight {
        animation: mcpGlow ${highlight.duration}s ease-in-out infinite;
        transition: all 0.3s ease;
      }

      .mcp-pulse {
        animation: mcpPulse ${pulse.duration}s ease-in-out infinite;
      }

      .mcp-focus-ring {
        outline: ${focusRing.width}px solid ${focusRing.color};
        outline-offset: ${focusRing.offset}px;
        border-radius: ${focusRing.borderRadius}px;
      }
    `;
    document.head.appendChild(style);

    this.debugLog('Injected visual feedback styles with custom configuration');
  }  /**
   * Shows a click visual effect on an element.
   * @private
   */
  private showClickEffect(element: HTMLElement, options?: MCPElementsOptions): void {
    const effectiveOptions = options || this.globalOptions;
    if (!effectiveOptions.enableVisualFeedback) return;

    const clickRipple = {
      size: 20,
      duration: 0.6,
      ...this.customStyles.clickRipple
    };

    const pulse = {
      duration: 1,
      ...this.customStyles.pulse
    };

    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'mcp-click-ripple';
    ripple.style.left = (rect.left + rect.width / 2) + 'px';
    ripple.style.top = (rect.top + rect.height / 2) + 'px';

    document.body.appendChild(ripple);

    // Add pulse effect to the target element
    element.classList.add('mcp-pulse');

    // Use custom duration for cleanup
    const cleanupDuration = Math.max(clickRipple.duration * 1000, pulse.duration * 1000);
    setTimeout(() => {
      ripple.remove();
      element.classList.remove('mcp-pulse');
    }, cleanupDuration);
  }
  
  /**
   * Shows typing animation on an input element.
   * @private
   */
  private async showTypingEffect(element: HTMLInputElement | HTMLTextAreaElement, text: string, options?: MCPElementsOptions): Promise<void> {
    const effectiveOptions = options || this.globalOptions;
    if (!effectiveOptions.enableVisualFeedback) {
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

      // Random typing speed between 50-150ms per character
      const delay = Math.random() * 100 + 50;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Remove typing effects
    element.classList.remove('mcp-typing-indicator', 'mcp-focus-ring');
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }  /**
   * Highlights an element temporarily.
   * @private
   */
  private highlightElement(element: HTMLElement, duration: number = 2000, options?: MCPElementsOptions): void {
    const effectiveOptions = options || this.globalOptions;
    if (!effectiveOptions.enableVisualFeedback) return;

    // Use custom highlight duration if specified
    const highlight = {
      duration: 2,
      ...this.customStyles.highlight
    };
    const effectiveDuration = duration || (highlight.duration * 1000);

    element.classList.add('mcp-highlight');
    setTimeout(() => {
      element.classList.remove('mcp-highlight');
    }, effectiveDuration);
  }  /**
   * Shows a focus effect on an element.
   * @private
   */
  private showFocusEffect(element: HTMLElement, duration: number = 1000, options?: MCPElementsOptions): void {
    const effectiveOptions = options || this.globalOptions;
    if (!effectiveOptions.enableVisualFeedback) return;

    element.classList.add('mcp-focus-ring');
    setTimeout(() => {
      element.classList.remove('mcp-focus-ring');
    }, duration);
  }
  /**
   * Sets whether visual feedback is enabled.
   */
  public setVisualFeedbackEnabled(enabled: boolean): void {
    this.globalOptions.enableVisualFeedback = enabled;
    if (enabled) {
      this.injectVisualFeedbackStyles();
    }
  }

  /**
   * Gets whether visual feedback is enabled.
   */
  public isVisualFeedbackEnabled(): boolean {
    return this.globalOptions.enableVisualFeedback;
  }

  /**
   * Applies a predefined theme to the visual effects.
   * @param theme - The theme name to apply.
   */
  applyVisualEffectTheme(theme: 'default' | 'dark' | 'success' | 'warning' | 'error' | 'custom'): void {
    let themeStyles: VisualEffectStyles = {};

    switch (theme) {
      case 'dark':
        themeStyles = {
          clickRipple: {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          highlight: {
            primaryColor: 'rgba(156, 163, 175, 0.5)',
            secondaryColor: 'rgba(156, 163, 175, 0.8)',
            tertiaryColor: 'rgba(156, 163, 175, 0.6)',
          },
          focusRing: {
            color: 'rgba(156, 163, 175, 0.8)',
          },
          typing: {
            shimmerGradient: 'linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.2), transparent)',
          }
        };
        break;

      case 'success':
        themeStyles = {
          clickRipple: {
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
          },
          highlight: {
            primaryColor: 'rgba(34, 197, 94, 0.5)',
            secondaryColor: 'rgba(34, 197, 94, 0.8)',
            tertiaryColor: 'rgba(34, 197, 94, 0.6)',
          },
          focusRing: {
            color: 'rgba(34, 197, 94, 0.8)',
          },
          typing: {
            shimmerGradient: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent)',
          }
        };
        break;

      case 'warning':
        themeStyles = {
          clickRipple: {
            backgroundColor: 'rgba(251, 191, 36, 0.6)',
          },
          highlight: {
            primaryColor: 'rgba(251, 191, 36, 0.5)',
            secondaryColor: 'rgba(251, 191, 36, 0.8)',
            tertiaryColor: 'rgba(251, 191, 36, 0.6)',
          },
          focusRing: {
            color: 'rgba(251, 191, 36, 0.8)',
          },
          typing: {
            shimmerGradient: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent)',
          }
        };
        break;

      case 'error':
        themeStyles = {
          clickRipple: {
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
          },
          highlight: {
            primaryColor: 'rgba(239, 68, 68, 0.5)',
            secondaryColor: 'rgba(239, 68, 68, 0.8)',
            tertiaryColor: 'rgba(239, 68, 68, 0.6)',
          },
          focusRing: {
            color: 'rgba(239, 68, 68, 0.8)',
          },
          typing: {
            shimmerGradient: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.2), transparent)',
          }
        };
        break;

      case 'default':
      default:
        // Reset to default styles (empty object will use defaults)
        themeStyles = {};
        break;
    }

    this.updateVisualEffectStyles(themeStyles);
    this.debugLog(`Applied ${theme} theme to visual effects`);
  }

  /**
   * Gets a list of available predefined themes.
   * @returns Array of available theme names.
   */
  getAvailableThemes(): string[] {
    return ['default', 'dark', 'success', 'warning', 'error'];
  }

  /**
   * Gets the parameter schema for a specific tool.
   * @param toolId - The ID of the tool.
   * @returns The parameter schema or undefined if the tool doesn't exist or has no schema.
   */
  getToolParameterSchema(toolId: string): ToolParameterSchema | undefined {
    const tool = this.registry.getToolById(toolId);
    return tool?.parameterSchema;
  }

  /**
   * Validates parameters against a tool's parameter schema.
   * @param toolId - The ID of the tool.
   * @param params - The parameters to validate.
   * @returns Validation result with success flag and error messages.
   */
  validateToolParameters(toolId: string, params: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const tool = this.registry.getToolById(toolId);
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!tool) {
      result.isValid = false;
      result.errors.push(`Tool with ID '${toolId}' not found`);
      return result;
    }

    if (!tool.parameterSchema) {
      // No schema defined, assume all parameters are valid
      this.debugLog(`Tool '${toolId}' has no parameter schema defined`);
      return result;
    }

    const schema = tool.parameterSchema;

    // Check required parameters
    if (schema.required) {
      for (const requiredParam of schema.required) {
        if (!(requiredParam in params)) {
          result.isValid = false;
          result.errors.push(`Required parameter '${requiredParam}' is missing`);
        }
      }
    }

    // Validate each provided parameter
    for (const [paramName, paramValue] of Object.entries(params)) {
      const paramDef = schema.parameters[paramName];
      
      if (!paramDef) {
        result.warnings.push(`Parameter '${paramName}' is not defined in the schema`);
        continue;
      }

      const validationResult = this.validateParameterValue(paramName, paramValue, paramDef);
      if (!validationResult.isValid) {
        result.isValid = false;
        result.errors.push(...validationResult.errors);
      }
      if (validationResult.warnings.length > 0) {
        result.warnings.push(...validationResult.warnings);
      }
    }

    // Check for missing required parameters defined in individual parameter definitions
    for (const [paramName, paramDef] of Object.entries(schema.parameters)) {
      if (paramDef.required && !(paramName in params)) {
        if (paramDef.defaultValue !== undefined) {
          result.warnings.push(`Required parameter '${paramName}' is missing but has a default value`);
        } else {
          result.isValid = false;
          result.errors.push(`Required parameter '${paramName}' is missing`);
        }
      }
    }

    this.debugLog(`Parameter validation for tool '${toolId}':`, result);
    return result;
  }

  /**
   * Validates a single parameter value against its definition.
   * @private
   * @param paramName - The name of the parameter.
   * @param value - The value to validate.
   * @param definition - The parameter definition.
   * @returns Validation result.
   */
  private validateParameterValue(paramName: string, value: any, definition: ParameterDefinition): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== definition.type) {
      result.isValid = false;
      result.errors.push(`Parameter '${paramName}' expected type '${definition.type}' but got '${actualType}'`);
      return result; // No point in further validation if type is wrong
    }

    // String-specific validations
    if (definition.type === 'string' && typeof value === 'string') {
      if (definition.minLength !== undefined && value.length < definition.minLength) {
        result.isValid = false;
        result.errors.push(`Parameter '${paramName}' must be at least ${definition.minLength} characters long`);
      }
      if (definition.maxLength !== undefined && value.length > definition.maxLength) {
        result.isValid = false;
        result.errors.push(`Parameter '${paramName}' must be at most ${definition.maxLength} characters long`);
      }
      if (definition.pattern) {
        if (Array.isArray(definition.pattern)) {
          if (!definition.pattern.includes(value)) {
            result.isValid = false;
            result.errors.push(`Parameter '${paramName}' must be one of: ${definition.pattern.join(', ')}`);
          }
        } else if (typeof definition.pattern === 'string') {
          const regex = new RegExp(definition.pattern);
          if (!regex.test(value)) {
            result.isValid = false;
            result.errors.push(`Parameter '${paramName}' must match pattern: ${definition.pattern}`);
          }
        }
      }
    }

    // Number-specific validations
    if (definition.type === 'number' && typeof value === 'number') {
      if (definition.minimum !== undefined && value < definition.minimum) {
        result.isValid = false;
        result.errors.push(`Parameter '${paramName}' must be at least ${definition.minimum}`);
      }
      if (definition.maximum !== undefined && value > definition.maximum) {
        result.isValid = false;
        result.errors.push(`Parameter '${paramName}' must be at most ${definition.maximum}`);
      }
    }

    // Array-specific validations
    if (definition.type === 'array' && Array.isArray(value)) {
      if (definition.items) {
        for (let i = 0; i < value.length; i++) {
          const itemResult = this.validateParameterValue(`${paramName}[${i}]`, value[i], definition.items);
          if (!itemResult.isValid) {
            result.isValid = false;
            result.errors.push(...itemResult.errors);
          }
          result.warnings.push(...itemResult.warnings);
        }
      }
    }

    // Object-specific validations
    if (definition.type === 'object' && typeof value === 'object' && value !== null) {
      if (definition.properties) {
        for (const [propName, propDef] of Object.entries(definition.properties)) {
          if (propName in value) {
            const propResult = this.validateParameterValue(`${paramName}.${propName}`, value[propName], propDef);
            if (!propResult.isValid) {
              result.isValid = false;
              result.errors.push(...propResult.errors);
            }
            result.warnings.push(...propResult.warnings);
          } else if ((propDef as any).required) {
            result.isValid = false;
            result.errors.push(`Required property '${propName}' is missing from parameter '${paramName}'`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Gets all available tools with their parameter schemas for MCP server discovery.
   * @returns Map of tool configurations with parameter schemas.
   */
  getToolsWithParameterSchemas(): Map<string, { tool: ToolConfiguration; hasParameters: boolean }> {
    const tools = this.registry.getAllTools();
    const result = new Map<string, { tool: ToolConfiguration; hasParameters: boolean }>();

    for (const [toolId, tool] of tools) {
      result.set(toolId, {
        tool,
        hasParameters: tool.parameterSchema !== undefined && Object.keys(tool.parameterSchema.parameters).length > 0
      });
    }

    return result;
  }

  /**
   * Applies default values to parameters based on the tool's parameter schema.
   * @param toolId - The ID of the tool.
   * @param params - The input parameters.
   * @returns Parameters with default values applied.
   */
  applyParameterDefaults(toolId: string, params: Record<string, any>): Record<string, any> {
    const tool = this.registry.getToolById(toolId);
    if (!tool?.parameterSchema) {
      return { ...params };
    }

    const result = { ...params };
    const schema = tool.parameterSchema;

    for (const [paramName, paramDef] of Object.entries(schema.parameters)) {
      if (!(paramName in result) && paramDef.defaultValue !== undefined) {
        result[paramName] = paramDef.defaultValue;
        this.debugLog(`Applied default value for parameter '${paramName}':`, paramDef.defaultValue);
      }
    }

    return result;
  }

  /**
   * Gets the return values from the last executed tool.
   * @returns Array of return values from each step of the last tool.
   */
  getLastToolReturnValues(): ExecutionResult[] {
    return [...this.stepReturnValues];
  }

  /**
   * Gets the return value from the last step of the last executed tool.
   * @returns The return value from the last step, or undefined if no steps were executed.
   */
  getLastStepReturnValue(): ExecutionResult | undefined {
    return this.stepReturnValues.length > 0 ? this.stepReturnValues[this.stepReturnValues.length - 1] : undefined;
  }
}
