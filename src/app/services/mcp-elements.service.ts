import { Injectable } from '@angular/core';
import { MCPElementsController, ToolConfiguration, ToolStartConfig, CustomFunction, ReturnValueProviderFunction, CallToolResult } from '../../lib/mcp-elements';

/**
 * Angular service for integrating MCP Elements with the AutoBot application
 */
@Injectable({
  providedIn: 'root'
})
export class MCPElementsService {
  private mcpController: MCPElementsController;
  private isInitialized = false;
  
  constructor() {
    this.mcpController = new MCPElementsController({
      useModalOverlay: true,
      classPrefix: 'autobot-shepherd',
      defaultStepOptions: {
        scrollTo: true,
        popperOptions: {
          modifiers: [
            { name: 'offset', options: { offset: [0, 20] } }
          ]        }
      }
    }, { enableVisualFeedback: true }); // Enable visual feedback by default

    this.setupEventListeners();
  }
  /**
   * Initialize the MCP Elements service by loading tools
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }    try {
      console.log('Initializing MCP Elements service...');
      
      // First, let's try to load the JSON directly to test
      console.log('Testing direct fetch...');
      const testResponse = await fetch('/mcp-tools.json');
      console.log('Test fetch response status:', testResponse.status);
      const testText = await testResponse.text();
      console.log('Test fetch response length:', testText.length);
      console.log('Test fetch first 200 chars:', testText.substring(0, 200));
      
      try {
        const testParsed = JSON.parse(testText);
        console.log('Test JSON parsing successful, tools count:', testParsed.length);        testParsed.forEach((tool: any, index: number) => {
          console.log(`Test parsed tool ${index + 1}: ${tool.toolId}`);
        });
      } catch (parseError) {
        console.error('Test JSON parsing failed:', parseError);
      }
        // Load tools from the public folder
      await this.mcpController.getRegistry().loadTools('/mcp-tools.json');
      this.isInitialized = true;
      console.log('MCP Elements service initialized successfully');
      
      // Log available tools for debugging
      const allTools = this.mcpController.getRegistry().getAllTools();
      console.log('Loaded tools:', Array.from(allTools.keys()));
    } catch (error) {
      console.error('Failed to initialize MCP Elements service:', error);
      
      // Try loading a fallback configuration
      try {
        console.log('Attempting to load fallback tools...');
        await this.loadFallbackTools();
        this.isInitialized = true;
        console.log('Fallback tools loaded successfully');
      } catch (fallbackError) {
        console.error('Failed to load fallback tools:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Start a welcome tour for new users
   */
  async startWelcomeTour(): Promise<void> {
    await this.ensureInitialized();
    await this.mcpController.start([{ toolId: 'stack-overflow-welcome' }]);
  }

  /**
   * Start the ask question guide
   */
  async startAskQuestionGuide(): Promise<void> {
    await this.ensureInitialized();
    await this.mcpController.start([{ toolId: 'ask-question-guide' }]);
  }

  /**
   * Start user interaction tour
   */
  async startUserInteractionTour(): Promise<void> {
    await this.ensureInitialized();
    await this.mcpController.start([{ toolId: 'user-interaction-tour' }]);
  }

  /**
   * Start search and filter guide
   */
  async startSearchAndFilterGuide(): Promise<void> {
    await this.ensureInitialized();
    await this.mcpController.start([{ toolId: 'search-and-filter' }]);
  }
  /**
   * Demonstrate automatic question creation
   */
  async demonstrateAutoQuestion(questionData: {
    questionTitle: string;
    questionBody: string;
    tags: string;
  }): Promise<void> {
    await this.ensureInitialized();
    
    // Check if tool exists
    const tool = await this.getToolById('auto-question-demo');
    if (!tool) {
      console.error('auto-question-demo tool not found');
      const debugInfo = this.getDebugInfo();
      console.log('Available tools:', debugInfo.toolIds);
      throw new Error('Auto question demo tool not found');
    }
    
    // First navigate to the ask question page if not already there
    if (!window.location.pathname.includes('/ask')) {
      console.log('Navigating to ask question page...');
      window.location.href = '/ask';
      return; // Let the page reload and user can try again
    }
    
    console.log('Starting auto question demo on /ask page');
    await this.mcpController.start([{
      toolId: 'auto-question-demo',
      params: questionData
    }]);
  }

  /**
   * Start a custom tool by ID with optional parameters
   */
  async startTool(toolId: string, params?: Record<string, any>): Promise<CallToolResult[]> {
    await this.ensureInitialized();
    return await this.mcpController.start([{ toolId, params }]);
  }

  /**
   * Start a sequence of tools
   */
  async startToolSequence(tools: ToolStartConfig[]): Promise<void> {
    await this.ensureInitialized();
    await this.mcpController.start(tools);
  }

  /**
   * Start a custom tool by ID with optional parameters and return execution results
   */
  async startToolWithResults(toolId: string, params?: Record<string, any>): Promise<CallToolResult[]> {
    await this.ensureInitialized();
    return await this.mcpController.start([{ toolId, params }]);
  }

  /**
   * Start a sequence of tools and return execution results
   */
  async startToolSequenceWithResults(tools: ToolStartConfig[]): Promise<CallToolResult[]> {
    await this.ensureInitialized();
    return await this.mcpController.start(tools);
  }

  /**
   * Stop any currently running tool
   */
  stopCurrentTool(): void {
    this.mcpController.stop();
  }
  /**
   * Get all available tools for the current page
   */
  async getAvailableTools(): Promise<ToolConfiguration[]> {
    await this.ensureInitialized();
    const currentUrl = window.location.pathname;
    console.log('Getting available tools for URL:', currentUrl);
    
    // For debugging, let's show all tools and mark which are available
    const allTools = this.mcpController.getRegistry().getAllTools();
    const availableTools = this.mcpController.getRegistry().getAvailableTools(currentUrl);
    
    console.log('Total tools:', allTools.size);
    console.log('Available for current page:', availableTools.size);
    console.log('Available tool IDs:', Array.from(availableTools.keys()));
    
    return Array.from(availableTools.values());
  }

  /**
   * Get all global tools
   */
  async getGlobalTools(): Promise<ToolConfiguration[]> {
    await this.ensureInitialized();
    const globalTools = this.mcpController.getRegistry().getGlobalTools();
    return Array.from(globalTools.values());
  }

  /**
   * Get a specific tool by ID
   */
  async getToolById(toolId: string): Promise<ToolConfiguration | undefined> {
    await this.ensureInitialized();
    return this.mcpController.getRegistry().getToolById(toolId);
  }

  /**
   * Register event listeners for tool events
   */
  onToolEvent(eventName: 'start' | 'complete' | 'cancel' | 'step:show', callback: (data: any) => void): void {
    this.mcpController.on(eventName, callback);
  }

  /**
   * Remove event listeners
   */
  offToolEvent(eventName: 'start' | 'complete' | 'cancel' | 'step:show', callback: (data: any) => void): void {
    this.mcpController.off(eventName, callback);
  }

  /**
   * Ensure the service is initialized before performing operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
  /**
   * Set up event listeners for logging and analytics
   */
  private setupEventListeners(): void {
    this.mcpController.on('start', (data: any) => {
      console.log('MCP Tool started:', data.tool.title);
      // Send analytics event
      this.trackEvent('tool_started', {
        tool_id: data.tool.toolId,
        tool_title: data.tool.title,
        tool_mode: data.tool.mode
      });
    });

    this.mcpController.on('complete', (data: any) => {
      console.log('MCP Tool completed:', data.tool.title);
      // Send analytics event
      this.trackEvent('tool_completed', {
        tool_id: data.tool.toolId,
        tool_title: data.tool.title,
        tool_mode: data.tool.mode
      });
    });    this.mcpController.on('cancel', (data: any) => {
      console.log('MCP Tool cancelled:', data?.tool?.title || 'Unknown');
      // Send analytics event
      if (data?.tool) {
        this.trackEvent('tool_cancelled', {
          tool_id: data.tool.toolId,
          tool_title: data.tool.title,
          tool_mode: data.tool.mode
        });
      }
    });

    this.mcpController.on('step:show', (data: any) => {
      console.log(`MCP Tool step ${data.index + 1} shown:`, data.step.content);
      // Send analytics event
      this.trackEvent('tool_step_shown', {
        tool_id: data.tool?.toolId,
        step_index: data.index,
        step_content: data.step.content
      });
    });
  }

  /**
   * Track events for analytics (implement based on your analytics provider)
   */
  private trackEvent(eventName: string, properties: Record<string, any>): void {
    // Implement analytics tracking here
    // Example: gtag('event', eventName, properties);
    // Example: analytics.track(eventName, properties);
    console.log('Analytics event:', eventName, properties);
  }

  /**
   * Load fallback tools if the JSON file fails to load
   */
  private async loadFallbackTools(): Promise<void> {
    const fallbackTools = [
      {
        toolId: 'welcome-tour',
        title: 'Welcome Tour',
        description: 'Basic welcome tour',
        mode: 'normal' as const,
        global: true,
        steps: [
          {
            targetElement: 'body',
            content: 'Welcome to AutoBot! This is a basic tour to get you started.'
          }
        ]
      }
    ];
    
    await this.mcpController.getRegistry().loadTools(fallbackTools);
  }

  /**
   * Reload tools from the JSON file (useful for debugging)
   */
  async reloadTools(): Promise<void> {
    try {
      console.log('Reloading tools...');
      this.isInitialized = false;
      await this.initialize();
      console.log('Tools reloaded successfully');
    } catch (error) {
      console.error('Failed to reload tools:', error);
    }
  }

  /**
   * Get debug information about the service
   */
  getDebugInfo(): any {
    const allTools = this.mcpController.getRegistry().getAllTools();
    return {      isInitialized: this.isInitialized,
      totalTools: allTools.size,      toolIds: Array.from(allTools.keys()),
      tools: Array.from(allTools.values()).map(tool => ({
        id: tool.toolId,
        title: tool.title,
        mode: tool.mode,
        isGlobal: !tool.pageMatcher, // Global if no pageMatcher
        pageMatcher: tool.pageMatcher
      }))
    };
  }

  /**
   * Enable or disable visual feedback for automated actions
   */
  setVisualFeedbackEnabled(enabled: boolean): void {
    this.mcpController.setVisualFeedbackEnabled(enabled);
  }
  /**
   * Check if visual feedback is enabled
   */
  isVisualFeedbackEnabled(): boolean {
    return this.mcpController.isVisualFeedbackEnabled();
  }

  /**
   * Register a custom function that can be called from tool steps
   */
  registerCustomFunction(customFunction: CustomFunction): void {
    this.mcpController.registerCustomFunction(customFunction);
  }

  /**
   * Register multiple custom functions
   */
  registerCustomFunctions(functions: CustomFunction[]): void {
    this.mcpController.registerCustomFunctions(functions);
  }

  /**
   * Get a registered custom function
   */
  getCustomFunction(functionName: string): CustomFunction | undefined {
    return this.mcpController.getCustomFunction(functionName);
  }

  /**
   * Get all registered custom functions
   */
  getAllCustomFunctions(): Map<string, CustomFunction> {
    return this.mcpController.getAllCustomFunctions();
  }

  /**
   * Register a return value provider function
   */
  registerReturnValueProvider(provider: ReturnValueProviderFunction): void {
    this.mcpController.registerReturnValueProvider(provider);
  }

  /**
   * Register multiple return value provider functions
   */
  registerReturnValueProviders(providers: ReturnValueProviderFunction[]): void {
    this.mcpController.registerReturnValueProviders(providers);
  }

  /**
   * Get a registered return value provider function
   */
  getReturnValueProvider(providerName: string): ReturnValueProviderFunction | undefined {
    return this.mcpController.getReturnValueProvider(providerName);
  }

  /**
   * Get all registered return value provider functions
   */
  getAllReturnValueProviders(): Map<string, ReturnValueProviderFunction> {
    return this.mcpController.getAllReturnValueProviders();
  }

  /**
   * Get the return values from the last executed tool
   */
  getLastToolReturnValues(): CallToolResult[] {
    return this.mcpController.getLastToolReturnValues();
  }

  /**
   * Get the return value from the last step of the last executed tool
   */
  getLastStepReturnValue(): CallToolResult | undefined {
    return this.mcpController.getLastStepReturnValue();
  }

  /**
   * Get SignalR connection status
   */
  getSignalRStatus(): { isConnected: boolean; connectionState: string | null; sessionId: string | null } {
    return this.mcpController.getConnectionStatus();
  }

  /**
   * Creates a new session with the MCP Server
   */
  async createSession(serverUrl?: string): Promise<string> {
    return await this.mcpController.createSession(serverUrl);
  }

  /**
   * Closes the current session
   */
  async closeSession(): Promise<void> {
    await this.mcpController.closeSession();
  }

  /**
   * Gets the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.mcpController.getCurrentSessionId();
  }

  /**
   * Checks if a session is currently active
   */
  isSessionActive(): boolean {
    return this.mcpController.isSessionActive();
  }

  /**
   * Cleanup method to stop SignalR connection
   */
  async cleanup(): Promise<void> {
    await this.mcpController.closeSession();
  }
}
