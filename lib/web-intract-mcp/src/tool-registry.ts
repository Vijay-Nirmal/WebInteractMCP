/**
 * @fileoverview Tool Registry for managing Web Interact MCP tool configurations
 * @description Manages the collection of available tools with validation and discovery capabilities
 * @version 1.0.0
 * @author Vijay Nirmal
 */

import { ToolConfiguration, ToolParameterSchema } from './types';

/**
 * Tool summary information for MCP server discovery
 */
export interface ToolSummary {
  toolId: string;
  title: string;
  description: string;
  mode: string;
  hasParameters: boolean;
  parameterCount: number;
  parameterSchema?: ToolParameterSchema;
  destructive?: boolean;
  idempotent?: boolean;
  openWorld?: boolean;
  readOnly?: boolean;
}

/**
 * Manages the collection of all available Tools. 
 * Provides functionality to load configurations from various sources and discover tools based on context.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, ToolConfiguration>();
  private readonly logger: Console;
  private cachedToolsJson: string = '[]';

  /**
   * Creates a new ToolRegistry instance
   * @param enableLogging - Whether to enable console logging (default: false)
   */
  constructor(enableLogging = false) {
    this.logger = enableLogging ? console : this.createSilentLogger();
  }

  /**
   * Loads tool configurations from a source
   * @param source - Array of configurations or URL to a JSON file
   * @throws {Error} When source is invalid or tools fail validation
   */
  async loadTools(source: ToolConfiguration[] | string): Promise<void> {
    let configurations: ToolConfiguration[] = [];

    try {
      if (Array.isArray(source)) {
        configurations = source;
        this.logger.log(`Loading ${configurations.length} tools from array`);
      } else if (typeof source === 'string') {
        this.logger.log(`Loading tools from URL: ${source}`);
        configurations = await this.fetchToolsFromUrl(source);
      } else {
        throw new Error('Invalid source type. Expected array or string (URL).');
      }

      const loadResults = this.validateAndLoadConfigurations(configurations);
      this.logger.log(`Successfully loaded ${loadResults.success} of ${configurations.length} tools`);
      
      if (loadResults.errors.length > 0) {
        this.logger.warn(`${loadResults.errors.length} tools failed validation:`, loadResults.errors);
      }

    } catch (error) {
      this.logger.error('Error loading tools:', error);
      throw error;
    }
  }

  /**
   * Gets a specific tool by its ID
   * @param toolId - The ID of the tool to retrieve
   * @returns The tool configuration or undefined if not found
   */
  getToolById(toolId: string): ToolConfiguration | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Returns a map of all tools available for a given page URL
   * @param url - The URL of the current page
   * @returns Map of available tools for the page
   */
  getAvailableTools(url: string): Map<string, ToolConfiguration> {
    const availableTools = new Map<string, ToolConfiguration>();

    for (const [toolId, tool] of this.tools) {
      if (this.isToolAvailableForPage(tool, url)) {
        availableTools.set(toolId, tool);
      }
    }

    return availableTools;
  }

  /**
   * Returns a map of all global tools (tools without pageMatcher)
   * @returns Map of all global tools
   */
  getGlobalTools(): Map<string, ToolConfiguration> {
    const globalTools = new Map<string, ToolConfiguration>();

    for (const [toolId, tool] of this.tools) {
      if (!tool.pageMatcher) {
        globalTools.set(toolId, tool);
      }
    }

    return globalTools;
  }

  /**
   * Returns all available tools
   * @returns Map of all tools
   */
  getAllTools(): Map<string, ToolConfiguration> {
    return new Map(this.tools);
  }

  /**
   * Gets tools that have parameter schemas defined
   * @returns Map of tools that have parameter schemas
   */
  getToolsWithParameterSchemas(): Map<string, ToolConfiguration> {
    const toolsWithSchemas = new Map<string, ToolConfiguration>();

    for (const [toolId, tool] of this.tools) {
      if (tool.parameterSchema && Object.keys(tool.parameterSchema.parameters).length > 0) {
        toolsWithSchemas.set(toolId, tool);
      }
    }

    return toolsWithSchemas;
  }

  /**
   * Gets parameter schema for a specific tool
   * @param toolId - The ID of the tool
   * @returns The parameter schema or undefined if not found
   */
  getParameterSchema(toolId: string): ToolParameterSchema | undefined {
    const tool = this.tools.get(toolId);
    return tool?.parameterSchema;
  }

  /**
   * Gets all tools as a JSON string for MCP server communication
   * @returns JSON string representation of all tool configurations
   */
  getToolsAsJson(): string {
    return this.cachedToolsJson;
  }

  /**
   * Gets a summary of all tools with their parameter information for MCP server discovery
   * @returns Array of tool summaries including parameter information
   */
  getToolsSummaryForMCP(): ToolSummary[] {
    const summary: ToolSummary[] = [];

    for (const [, tool] of this.tools) {
      const hasParameters = tool.parameterSchema !== undefined;
      const parameterCount = hasParameters && tool.parameterSchema ? Object.keys(tool.parameterSchema.parameters).length : 0;

      const toolSummary: ToolSummary = {
        toolId: tool.toolId,
        title: tool.title,
        description: tool.description,
        mode: tool.mode,
        hasParameters,
        parameterCount
      };

      if (tool.parameterSchema) {
        toolSummary.parameterSchema = tool.parameterSchema;
      }
      if (tool.destructive !== undefined) {
        toolSummary.destructive = tool.destructive;
      }
      if (tool.idempotent !== undefined) {
        toolSummary.idempotent = tool.idempotent;
      }
      if (tool.openWorld !== undefined) {
        toolSummary.openWorld = tool.openWorld;
      }
      if (tool.readOnly !== undefined) {
        toolSummary.readOnly = tool.readOnly;
      }

      summary.push(toolSummary);
    }

    return summary;
  }

  /**
   * Gets the total number of registered tools
   * @returns The count of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Checks if a tool exists by ID
   * @param toolId - The ID of the tool to check
   * @returns True if the tool exists, false otherwise
   */
  hasToolId(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Removes a tool from the registry
   * @param toolId - The ID of the tool to remove
   * @returns True if the tool was removed, false if it didn't exist
   */
  removeTool(toolId: string): boolean {
    return this.tools.delete(toolId);
  }

  /**
   * Clears all tools from the registry
   */
  clearTools(): void {
    this.tools.clear();
    this.cachedToolsJson = '[]';
  }

  /**
   * Fetches tools from a URL
   * @private
   */
  private async fetchToolsFromUrl(url: string): Promise<ToolConfiguration[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tools from ${url}: ${response.statusText}`);
    }
    
    const text = await response.text();
    try {
      const configurations = JSON.parse(text);
      if (!Array.isArray(configurations)) {
        throw new Error('Expected JSON array of tool configurations');
      }
      return configurations;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON from ${url}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  }

  /**
   * Validates and loads multiple configurations
   * @private
   */
  private validateAndLoadConfigurations(configurations: ToolConfiguration[]): {
    success: number;
    errors: Array<{ toolId: string; error: string }>;
  } {
    const results = { success: 0, errors: [] as Array<{ toolId: string; error: string }> };

    for (const config of configurations) {
      try {
        this.validateToolConfiguration(config);
        this.tools.set(config.toolId, config);
        results.success++;
        this.logger.log(`Successfully loaded tool: ${config.toolId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push({ toolId: config.toolId || 'unknown', error: errorMessage });
        this.logger.error(`Failed to validate tool: ${config.toolId}`, error);
      }
    }

    // Pre-calculate JSON representation for MCP server communication
    this.cacheToolsJson();

    return results;
  }

  /**
   * Pre-calculates and caches the JSON representation of all tools
   * @private
   */
  private cacheToolsJson(): void {
    try {
      const toolsArray = Array.from(this.tools.values());
      this.cachedToolsJson = JSON.stringify(toolsArray, null, 0);
      this.logger.log(`Cached JSON representation of ${toolsArray.length} tools`);
    } catch (error) {
      this.logger.error('Error caching tools JSON:', error);
      this.cachedToolsJson = '[]';
    }
  }

  /**
   * Validates a tool configuration
   * @private
   * @throws {Error} When configuration is invalid
   */
  private validateToolConfiguration(config: ToolConfiguration): void {
    // Basic required fields
    if (!config.toolId) {
      throw new Error('Tool configuration must have a toolId');
    }
    if (!config.title) {
      throw new Error(`Tool ${config.toolId} must have a title`);
    }
    if (!config.description) {
      throw new Error(`Tool ${config.toolId} must have a description`);
    }

    // Validate mode
    const validModes = ['normal', 'buttonless', 'silent'] as const;
    if (!validModes.includes(config.mode)) {
      throw new Error(`Tool ${config.toolId} has invalid mode: ${config.mode}. Must be one of: ${validModes.join(', ')}`);
    }

    // Validate steps
    if (!Array.isArray(config.steps) || config.steps.length === 0) {
      throw new Error(`Tool ${config.toolId} must have at least one step`);
    }

    // Validate each step
    config.steps.forEach((step, index) => {
      this.validateToolStep(config.toolId, step, index, config.mode);
    });

    // Validate parameter schema if present
    if (config.parameterSchema) {
      this.validateParameterSchema(config.toolId, config.parameterSchema);
    }
  }

  /**
   * Validates a single tool step
   * @private
   */
  private validateToolStep(toolId: string, step: unknown, index: number, mode: string): void {
    const stepObj = step as Record<string, unknown>;
    
    if (!stepObj['targetElement'] || typeof stepObj['targetElement'] !== 'string') {
      throw new Error(`Tool ${toolId}, step ${index}: targetElement is required and must be a string`);
    }

    if (mode !== 'silent' && (!stepObj['content'] || typeof stepObj['content'] !== 'string')) {
      throw new Error(`Tool ${toolId}, step ${index}: content is required for ${mode} mode`);
    }

    if (mode === 'silent' && !stepObj['action']) {
      throw new Error(`Tool ${toolId}, step ${index}: action is required for silent mode`);
    }

    // Validate action if present
    if (stepObj['action']) {
      this.validateToolAction(toolId, stepObj['action'] as Record<string, unknown>, index);
    }
  }

  /**
   * Validates a tool action
   * @private
   */
  private validateToolAction(toolId: string, action: Record<string, unknown>, stepIndex: number): void {
    const validActionTypes = ['click', 'fillInput', 'navigate', 'selectOption', 'executeFunction'];
    
    if (!action['type'] || !validActionTypes.includes(action['type'] as string)) {
      throw new Error(`Tool ${toolId}, step ${stepIndex}: invalid action type '${action['type']}'. Must be one of: ${validActionTypes.join(', ')}`);
    }

    if (!action['element'] || typeof action['element'] !== 'string') {
      throw new Error(`Tool ${toolId}, step ${stepIndex}: action must have a valid element selector`);
    }

    // Additional validation for executeFunction
    if (action['type'] === 'executeFunction') {
      if (!action['function'] && !action['functionName']) {
        throw new Error(`Tool ${toolId}, step ${stepIndex}: executeFunction action requires either 'function' or 'functionName'`);
      }
    }
  }

  /**
   * Validates a parameter schema
   * @private
   */
  private validateParameterSchema(toolId: string, schema: ToolParameterSchema): void {
    if (!schema.parameters || typeof schema.parameters !== 'object') {
      throw new Error(`Tool ${toolId}: parameterSchema must have a parameters object`);
    }

    for (const [paramName, paramDef] of Object.entries(schema.parameters)) {
      this.validateParameterDefinition(toolId, paramName, paramDef);
    }
  }

  /**
   * Validates a parameter definition
   * @private
   */
  private validateParameterDefinition(toolId: string, paramName: string, paramDef: unknown): void {
    const def = paramDef as Record<string, unknown>;
    const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
    
    if (!def['type'] || !validTypes.includes(def['type'] as string)) {
      throw new Error(`Tool ${toolId}, parameter '${paramName}': invalid type '${def['type']}'. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!def['description'] || typeof def['description'] !== 'string') {
      throw new Error(`Tool ${toolId}, parameter '${paramName}': description is required and must be a string`);
    }
  }

  /**
   * Checks if a tool is available for a specific page URL
   * @private
   */
  private isToolAvailableForPage(tool: ToolConfiguration, url: string): boolean {
    if (!tool.pageMatcher) {
      return true; // No matcher means available everywhere (global tool)
    }

    if (typeof tool.pageMatcher === 'string') {
      return url.includes(tool.pageMatcher);
    } else if (tool.pageMatcher instanceof RegExp) {
      return tool.pageMatcher.test(url);
    }

    return false;
  }

  /**
   * Creates a silent logger that doesn't output anything
   * @private
   */
  private createSilentLogger(): Console {
    const silentFunction = () => {};
    return {
      log: silentFunction,
      error: silentFunction,
      warn: silentFunction,
      info: silentFunction,
      debug: silentFunction,
    } as Console;
  }
}
