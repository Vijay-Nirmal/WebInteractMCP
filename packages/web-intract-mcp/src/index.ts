/**
 * @fileoverview Main entry point for the Web Intract MCP library
 * @description Production-ready TypeScript library for transforming web applications into MCP servers
 * @version 1.0.0
 * @author Vijay Nirmal
 */

// Export main classes
export { ToolRegistry } from './tool-registry';
export { WebIntractMCPController } from './controller';
export { WebIntractSignalRService } from './signalr.service';

// Export types
export type {
  // Core types
  Role,
  Annotations,
  TextContent,
  ImageContent,
  AudioContent,
  Resource,
  ResourceContents,
  TextResourceContents,
  BlobResourceContents,
  ResourceLink,
  EmbeddedResource,
  ContentBlock,
  CallToolResult,
  
  // Parameter and schema types
  ParameterDefinition,
  ToolParameterSchema,
  
  // Configuration types
  VisualEffectStyles,
  ToolMode,
  ToolAction,
  ReturnValue,
  ToolStep,
  ToolConfiguration,
  WebIntractMCPOptions,
  TransportOptions,
  WebIntractMCPEvent,
  ToolStartConfig,
  
  // Function types
  CustomFunctionContext,
  CustomFunctionImplementation,
  CustomFunction,
  ReturnValueContext,
  ReturnValueProvider,
  ReturnValueProviderFunction,
  
  // Service types
  ConnectionStatus
} from './types';

// Export utility functions
export {
  createSuccessResult,
  createErrorResult,
  createFailedResult,
  SuccessfulCallToolResult
} from './types';

// Export additional interfaces from tool registry
export type { ToolSummary } from './tool-registry';

// Export SignalR service interfaces
export type { 
  WebIntractMCPController as IWebIntractMCPController,
} from './signalr.service';

// Import types for function signatures
import type { 
    WebIntractMCPOptions
} from './types';
import type { ToolRegistry } from './tool-registry';
import { WebIntractMCPController } from './controller';

/**
 * Create a new WebIntractMCPController instance with custom options
 * @param shepherdOptions - Default options to pass to the Shepherd.Tour constructor
 * @param options - Global configuration options
 * @returns A new WebIntractMCPController instance
 */
export function createWebIntractMCPController(
  shepherdOptions?: unknown, 
  options?: Partial<WebIntractMCPOptions>
): WebIntractMCPController {
  return new WebIntractMCPController(shepherdOptions, options);
}

/**
 * Create a new ToolRegistry instance
 * @param enableLogging - Whether to enable console logging
 * @returns A new ToolRegistry instance
 */
export function createToolRegistry(enableLogging = false): ToolRegistry {
  const { ToolRegistry } = require('./tool-registry');
  return new ToolRegistry(enableLogging);
}

/**
 * Library version
 */
export const VERSION = '1.0.0';

/**
 * Library information
 */
export const LIBRARY_INFO = {
  name: 'web-intract-mcp',
  version: VERSION,
  description: 'A production-ready TypeScript library that transforms web applications into MCP servers with robust two-way communication',
  author: 'GitHub Copilot',
  license: 'MIT'
} as const;
