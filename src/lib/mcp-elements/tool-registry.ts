/**
 * @file tool-registry.ts
 * @description The ToolRegistry class manages the collection of all available Tools
 */

import { ToolConfiguration } from './types';

/**
 * Manages the collection of all available Tools. It can load configurations
 * from various sources and provides methods to discover tools based on context (e.g., current page).
 */
export class ToolRegistry {
  private tools: Map<string, ToolConfiguration> = new Map();

  constructor() {
    this.tools = new Map();
  }
  /**
   * Loads tool configurations from a source.
   * @param source - The source of the configurations.
   * Can be an array of configurations, a URL to a JSON file.
   */
  async loadTools(source: ToolConfiguration[] | string): Promise<void> {
    let configurations: ToolConfiguration[] = [];

    try {
      if (Array.isArray(source)) {
        // Direct array of configurations
        configurations = source;
        console.log('Loading tools from array:', configurations.length, 'tools');
      } else if (typeof source === 'string') {
        // URL to a JSON file
        console.log('Loading tools from URL:', source);
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch tools from ${source}: ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Received response:', text.substring(0, 200) + '...');
        configurations = JSON.parse(text);
      } else {
        throw new Error('Invalid source type. Expected array or string (URL).');
      }

      console.log('Parsed configurations:', configurations.length, 'tools');      // Validate and store configurations
      for (const config of configurations) {
        console.log('Processing tool:', config.toolId);
        try {
          this.validateToolConfiguration(config);
          this.tools.set(config.toolId, config);
          console.log('Successfully added tool:', config.toolId);
        } catch (validationError) {
          console.error('Failed to validate tool:', config.toolId, validationError);
          // Continue with other tools instead of stopping
        }
      }

      console.log(`Loaded ${configurations.length} tools into registry:`, Array.from(this.tools.keys()));
    } catch (error) {
      console.error('Error loading tools:', error);
      throw error;
    }
  }

  /**
   * Gets a specific tool by its ID.
   * @param toolId - The ID of the tool to retrieve.
   * @returns The tool configuration or undefined if not found.
   */
  getToolById(toolId: string): ToolConfiguration | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Returns a map of all tools available for a given page URL.
   * @param url - The URL of the current page.
   * @returns A map of available tools for the page.
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
   * Returns a map of all global tools.
   * @returns A map of all global tools.
   */
  getGlobalTools(): Map<string, ToolConfiguration> {
    const globalTools = new Map<string, ToolConfiguration>();

    for (const [toolId, tool] of this.tools) {
      if (tool.global) {
        globalTools.set(toolId, tool);
      }
    }

    return globalTools;
  }

  /**
   * Returns the root-level resource mapping all available tools.
   * Useful for an MCP server to discover all possible tools in the system.
   * @returns A map of all tools.
   */
  getAllTools(): Map<string, ToolConfiguration> {
    return new Map(this.tools);
  }

  /**
   * Validates a tool configuration.
   * @private
   * @param config - The tool configuration to validate.
   * @throws Error if the configuration is invalid.
   */
  private validateToolConfiguration(config: ToolConfiguration): void {
    if (!config.toolId) {
      throw new Error('Tool configuration must have a toolId');
    }
    if (!config.title) {
      throw new Error(`Tool ${config.toolId} must have a title`);
    }
    if (!config.description) {
      throw new Error(`Tool ${config.toolId} must have a description`);
    }
    if (!['normal', 'buttonless', 'silent'].includes(config.mode)) {
      throw new Error(`Tool ${config.toolId} has invalid mode: ${config.mode}`);
    }
    if (!Array.isArray(config.steps) || config.steps.length === 0) {
      throw new Error(`Tool ${config.toolId} must have at least one step`);
    }

    // Validate each step
    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      if (!step.targetElement) {
        throw new Error(`Tool ${config.toolId}, step ${i}: targetElement is required`);
      }
      if (!step.content && config.mode !== 'silent') {
        throw new Error(`Tool ${config.toolId}, step ${i}: content is required for ${config.mode} mode`);
      }
      if (config.mode === 'silent' && !step.action) {
        throw new Error(`Tool ${config.toolId}, step ${i}: action is required for silent mode`);
      }
    }
  }

  /**
   * Checks if a tool is available for a specific page URL.
   * @private
   * @param tool - The tool configuration.
   * @param url - The current page URL.
   * @returns True if the tool is available for the page.
   */
  private isToolAvailableForPage(tool: ToolConfiguration, url: string): boolean {
    if (tool.global) {
      return true;
    }

    if (!tool.pageMatcher) {
      return true; // No matcher means available everywhere
    }

    if (typeof tool.pageMatcher === 'string') {
      return url.includes(tool.pageMatcher);
    } else if (tool.pageMatcher instanceof RegExp) {
      return tool.pageMatcher.test(url);
    }

    return false;
  }
}
