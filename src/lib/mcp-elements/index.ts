/**
 * @file index.ts
 * @description Main entry point for the MCP Elements library
 */

// Export classes first
export { ToolRegistry } from './tool-registry';
export { MCPElementsController } from './mcp-elements-controller';

// Export types
export type {
  ToolMode,
  ToolAction,
  ToolStep,
  ToolConfiguration,
  MCPElementsEvent,
  ToolStartConfig,
  CustomFunction,
  CustomFunctionContext,
  CustomFunctionImplementation,
  MCPElementsOptions
} from './types';

// Import for default instance
import { MCPElementsController } from './mcp-elements-controller';

// Export a default instance for convenience
export const mcpElements = new MCPElementsController();

/**
 * Create a new MCPElementsController instance with custom options
 * @param shepherdOptions - Default options to pass to the Shepherd.Tour constructor
 * @returns A new MCPElementsController instance
 */
export function createMCPElementsController(shepherdOptions?: any): MCPElementsController {
  return new MCPElementsController(shepherdOptions);
}
