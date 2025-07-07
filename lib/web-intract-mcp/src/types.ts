/**
 * @fileoverview Core TypeScript type definitions for Web Intract MCP library
 * @description This file contains all the type definitions used throughout the library
 * @version 1.0.0
 * @author Vijay Nirmal
 */

/**
 * Role types for MCP annotations
 */
export type Role = 'user' | 'assistant';

/**
 * Optional annotations for the client. The client can use annotations to inform how objects are used or displayed
 */
export interface Annotations {
  /**
   * Describes who the intended customer of this object or data is.
   * It can include multiple entries to indicate content useful for multiple audiences (e.g., `["user", "assistant"]`).
   */
  audience?: Role[];

  /**
   * Describes how important this data is for operating the server.
   * A value of 1 means "most important," and indicates that the data is
   * effectively required, while 0 means "least important," and indicates that
   * the data is entirely optional.
   */
  priority?: number;

  /**
   * The moment the resource was last modified, as an ISO 8601 formatted string.
   * Should be an ISO 8601 formatted string (e.g., "2025-01-12T15:00:58Z").
   * Examples: last activity timestamp in an open file, timestamp when the resource was attached, etc.
   */
  lastModified?: string;
}

/**
 * Text content provided to or from an LLM
 */
export interface TextContent {
  type: "text";
  /** The text content of the message */
  text: string;
  /** Optional annotations for the client */
  annotations?: Annotations;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Image content provided to or from an LLM
 */
export interface ImageContent {
  type: "image";
  /** The base64-encoded image data */
  data: string;
  /** The MIME type of the image */
  mimeType: string;
  /** Optional annotations for the client */
  annotations?: Annotations;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Audio content provided to or from an LLM
 */
export interface AudioContent {
  type: "audio";
  /** The base64-encoded audio data */
  data: string;
  /** The MIME type of the audio */
  mimeType: string;
  /** Optional annotations for the client */
  annotations?: Annotations;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Base resource interface containing common properties
 */
export interface Resource {
  /** The URI of this resource */
  uri: string;
  /** A human-readable name for this resource */
  name?: string;
  /** A description of what this resource represents */
  description?: string;
  /** The MIME type of this resource, if known */
  mimeType?: string;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * The contents of a specific resource or sub-resource
 */
export interface ResourceContents extends Resource {
  /** The URI of this resource */
  uri: string;
  /** The MIME type of this resource, if known */
  mimeType?: string;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Text-based resource contents
 */
export interface TextResourceContents extends ResourceContents {
  /** The text content of the resource */
  text: string;
}

/**
 * Binary resource contents
 */
export interface BlobResourceContents extends ResourceContents {
  /** A base64-encoded string representing the binary data */
  blob: string;
}

/**
 * A resource link that the server is capable of reading
 */
export interface ResourceLink extends Resource {
  type: "resource_link";
}

/**
 * The contents of a resource, embedded into a prompt or tool call result
 */
export interface EmbeddedResource {
  type: "resource";
  resource: TextResourceContents | BlobResourceContents;
  /** Optional annotations for the client */
  annotations?: Annotations;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Union type for all content block types
 */
export type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | ResourceLink
  | EmbeddedResource;

/**
 * The server's response to a tool call
 */
export interface CallToolResult {
  /** A list of content objects that represent the unstructured result of the tool call */
  content: ContentBlock[];
  /** An optional JSON object that represents the structured result of the tool call */
  structuredContent?: Record<string, unknown>;
  /** Whether the tool call ended in an error (default: false) */
  isError?: boolean;
  /** Additional metadata */
  _meta?: Record<string, unknown>;
}

/**
 * Defines the type and constraints for a tool parameter
 */
export interface ParameterDefinition {
  /** The data type of the parameter */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Human-readable description of what this parameter does */
  description: string;
  /** Whether this parameter is required (default: false) */
  required?: boolean;
  /** Default value for the parameter */
  defaultValue?: unknown;
  /** For string types: minimum length */
  minLength?: number;
  /** For string types: maximum length */
  maxLength?: number;
  /** For string/array types: pattern or allowed values */
  pattern?: string | string[];
  /** For number types: minimum value */
  minimum?: number;
  /** For number types: maximum value */
  maximum?: number;
  /** For array types: type of array items */
  items?: ParameterDefinition;
  /** For object types: properties definition */
  properties?: Record<string, ParameterDefinition>;
  /** Example value(s) for documentation */
  examples?: unknown[];
}

/**
 * Schema definition for tool parameters used by MCP server
 */
export interface ToolParameterSchema {
  /** Map of parameter names to their definitions */
  parameters: Record<string, ParameterDefinition>;
  /** List of required parameter names */
  required?: string[];
  /** Additional metadata about the parameters */
  metadata?: {
    /** Version of the parameter schema */
    version?: string;
  };
}

/**
 * Configuration for customizing visual effect styles
 */
export interface VisualEffectStyles {
  /** Styles for the click ripple effect */
  clickRipple?: {
    /** Background color for the ripple (default: 'rgba(59, 130, 246, 0.6)') */
    backgroundColor?: string;
    /** Size of the ripple in pixels (default: 20) */
    size?: number;
    /** Animation duration in seconds (default: 0.6) */
    duration?: number;
    /** Border radius for the ripple (default: '50%') */
    borderRadius?: string;
  };
  /** Styles for the glow/highlight effect */
  highlight?: {
    /** Primary glow color (default: 'rgba(59, 130, 246, 0.5)') */
    primaryColor?: string;
    /** Secondary glow color (default: 'rgba(59, 130, 246, 0.8)') */
    secondaryColor?: string;
    /** Tertiary glow color (default: 'rgba(59, 130, 246, 0.6)') */
    tertiaryColor?: string;
    /** Animation duration in seconds (default: 2) */
    duration?: number;
    /** Primary blur radius in pixels (default: 5) */
    primaryBlur?: number;
    /** Secondary blur radius in pixels (default: 20) */
    secondaryBlur?: number;
    /** Tertiary blur radius in pixels (default: 30) */
    tertiaryBlur?: number;
  };
  /** Styles for the pulse effect */
  pulse?: {
    /** Animation duration in seconds (default: 1) */
    duration?: number;
    /** Scale factor for the pulse (default: 1.05) */
    scale?: number;
    /** Opacity during pulse (default: 0.8) */
    opacity?: number;
  };
  /** Styles for the typing indicator effect */
  typing?: {
    /** Background gradient for the shimmer effect */
    shimmerGradient?: string;
    /** Animation duration in seconds (default: 1.5) */
    duration?: number;
    /** Shimmer opacity (default: 0.2) */
    opacity?: number;
  };
  /** Styles for the focus ring effect */
  focusRing?: {
    /** Outline color (default: 'rgba(59, 130, 246, 0.8)') */
    color?: string;
    /** Outline width in pixels (default: 2) */
    width?: number;
    /** Outline offset in pixels (default: 2) */
    offset?: number;
    /** Border radius in pixels (default: 4) */
    borderRadius?: number;
  };
}

/**
 * The execution mode for a Tool.
 * - `normal`: Standard ShepherdJS tour with next/back buttons.
 * - `buttonless`: No buttons, steps advance automatically after a specified delay.
 * - `silent`: No UI popups. The tool runs in the background to perform automated actions.
 */
export type ToolMode = 'normal' | 'buttonless' | 'silent';

/**
 * Forward declaration to avoid circular dependency
 */
export interface MCPElementsController {
  // This will be properly defined in the controller file
}

/**
 * Context object passed to custom functions during execution
 */
export interface CustomFunctionContext {
  /** The target DOM element */
  element: HTMLElement;
  /** Parameters passed via functionParams in the action */
  params: Record<string, unknown>;
  /** Tool-level parameters passed when starting the tool */
  toolParams: Record<string, unknown>;
  /** Reference to the MCPElementsController instance */
  controller: MCPElementsController;
  /** Debug logging function */
  debugLog: (message: string, ...data: unknown[]) => void;
  /** Currently active tool configuration */
  activeTool: ToolConfiguration | null;
  /** Current step index in the tool execution */
  currentStepIndex: number;
  /** Return value from the previous step (if any) */
  previousStepReturnValue?: CallToolResult | undefined;
}

/**
 * Type definition for custom function implementations
 */
export type CustomFunctionImplementation = (
  context: CustomFunctionContext
) => CallToolResult | Promise<CallToolResult>;

/**
 * Represents an automated action that can be performed on a web element
 */
export interface ToolAction {
  /** The type of action to perform */
  type: 'click' | 'fillInput' | 'navigate' | 'selectOption' | 'executeFunction';
  /** The CSS selector for the target element */
  element: string;
  /** The value to use for the action (e.g., text for 'fillInput'). Can be parameterized. */
  value?: unknown;
  /** Delay in milliseconds before performing this action (for 'silent' mode) */
  delay?: number;
  /** For 'executeFunction' type: the function to execute */
  function?: CustomFunctionImplementation;
  /** For 'executeFunction' type: the name of a registered function to execute */
  functionName?: string;
  /** Parameters to pass to the function */
  functionParams?: Record<string, unknown>;
}

/**
 * Context object passed to return value provider functions
 */
export interface ReturnValueContext {
  /** Tool-level parameters passed when starting the tool */
  toolParams: Record<string, unknown>;
  /** Reference to the MCPElementsController instance */
  controller: MCPElementsController;
  /** Debug logging function */
  debugLog: (message: string, ...data: unknown[]) => void;
  /** Currently active tool configuration */
  activeTool: ToolConfiguration | null;
  
  // Step-level context (available when called from a step)
  /** The target DOM element (available for step-level providers) */
  element?: HTMLElement;
  /** Parameters passed to the current step (available for step-level providers) */
  stepParams?: Record<string, unknown>;
  /** Current step index in the tool execution (available for step-level providers) */
  currentStepIndex?: number;
  /** Return value from the previous step (available for step-level providers) */
  previousStepReturnValue?: CallToolResult | undefined;
  /** Action result from the current step (available for step-level providers) */
  actionResult?: CallToolResult | undefined;
  
  // Tool-level context (available when called from tool completion)
  /** Total number of steps executed (available for tool-level providers) */
  stepsExecuted?: number;
  /** Return value from the last step (available for tool-level providers) */
  lastStepReturnValue?: CallToolResult | undefined;
  /** Whether the tool executed successfully (available for tool-level providers) */
  toolExecutionSuccess?: boolean | undefined;
  /** Any error that occurred during tool execution (available for tool-level providers) */
  toolExecutionError?: Error | undefined;
}

/**
 * Type definition for return value provider functions
 */
export type ReturnValueProvider = (
  context: ReturnValueContext
) => CallToolResult | Promise<CallToolResult>;

/**
 * Configuration for return values (used by both steps and tools)
 */
export interface ReturnValue {
  /** Static/hardcoded return value */
  value?: unknown;
  /** Function to compute the return value dynamically */
  provider?: ReturnValueProvider;
  /** Name of a registered function to compute the return value */
  providerName?: string;
  /** Parameters to pass to the provider function */
  providerParams?: Record<string, unknown>;
}

/**
 * Represents a single step within a Tool
 */
export interface ToolStep {
  /** CSS selector for the element to highlight */
  targetElement: string;
  /** The text to display in the popup for 'normal' and 'buttonless' modes */
  content: string;
  /** Delay in milliseconds before auto-advancing in 'buttonless' mode */
  delay?: number;
  /** The automated action to perform in 'silent' mode */
  action?: ToolAction | undefined;
  /** An object to pass any additional ShepherdJS step options directly */
  shepherdOptions?: Record<string, unknown>;
  /** Whether to stop execution if this step fails (default: false) */
  stopOnFailure?: boolean;
  /** Configuration for the return value from this step */
  returnValue?: ReturnValue;
}

/**
 * The complete configuration for a single Tool
 */
export interface ToolConfiguration {
  /** A unique identifier for the Tool */
  toolId: string;
  /** A human-readable title for the Tool */
  title: string;
  /** A detailed description of what the Tool does */
  description: string;
  /** The execution mode for the Tool */
  mode: ToolMode;
  /** 
   * A URL string or regex to determine if the Tool is available on the current page.
   * If not specified, the tool is considered global and available on all pages.
   */
  pageMatcher?: string | RegExp;
  /** An array of steps that make up the Tool */
  steps: ToolStep[];
  /** Override global options for this specific tool */
  options?: Partial<WebIntractMCPOptions>;
  /** Parameter schema for MCP server integration */
  parameterSchema?: ToolParameterSchema;
  /** Configuration for the tool-level return value */
  returnValue?: ReturnValue;
  /** Whether the tool performs destructive actions */
  destructive?: boolean;
  /** Whether the tool is idempotent */
  idempotent?: boolean;
  /** Whether the tool operates in an open-world context */
  openWorld?: boolean;
  /** Whether the tool is read-only */
  readOnly?: boolean;
}

/**
 * Global configuration options for Web Intract MCP Controller
 */
export interface WebIntractMCPOptions {
  /** The base server URL (default: 'http://localhost:8080') */
  serverUrl: string;
  /** Whether to show visual feedback for automated actions (default: true) */
  enableVisualFeedback: boolean;
  /** Whether to enable debug mode logging (default: false) */
  debugMode: boolean;
  /** Whether to stop execution if a step fails (default: false) */
  stopOnFailure: boolean;
  /** Timeout in milliseconds for waiting for elements (default: 5000) */
  elementTimeout: number;
  /** Duration in milliseconds for highlighting elements (default: 2000) */
  highlightDuration: number;
  /** Duration in milliseconds for focus effects (default: 1000) */
  focusEffectDuration: number;
  /** Duration in milliseconds for click effects (default: 600) */
  clickEffectDuration: number;
  /** Delay in milliseconds between actions in silent mode (default: 500) */
  actionDelay: number;
  /** Default delay in milliseconds for buttonless mode steps (default: 3000) */
  defaultButtonlessDelay: number;
  /** Custom styling configuration for visual effects */
  visualEffectStyles?: VisualEffectStyles;
  /** Configuration for the SignalR service */
  transport?: TransportOptions | undefined;
}


/**
 * Configuration options for the SignalR service
 */
export interface TransportOptions {
  /** SignalR hub endpoint path (default: '/mcptools') */
  hubPath: string;
  /** Connection retry attempts (default: 10) */
  maxRetryAttempts: number;
  /** Base retry delay in milliseconds (default: 1000) */
  baseRetryDelayMs: number;
  /** Whether to enable detailed logging (default: false) */
  enableLogging: boolean;
  /** SignalR log level (default: Information) */
  logLevel: signalR.LogLevel;
  /** Allowed transport types */
  transportTypes: signalR.HttpTransportType;
}

/**
 * Event types that can be emitted by the Web Intract MCP Controller
 */
export type WebIntractMCPEvent = 'start' | 'complete' | 'cancel' | 'step:show';

/**
 * Configuration for tools to start
 */
export interface ToolStartConfig {
  /** The ID of the tool to start */
  toolId: string;
  /** Optional parameters to pass to the tool */
  params?: Record<string, unknown>;
}

/**
 * Represents a custom function that can be executed as part of a tool step
 */
export interface CustomFunction {
  /** The name of the function */
  name: string;
  /** The function implementation */
  implementation: CustomFunctionImplementation;
  /** Expected parameters for the function */
  parameters?: Record<string, unknown>;
}

/**
 * Represents a return value provider function that can be registered and used in steps or tools
 */
export interface ReturnValueProviderFunction {
  /** The name of the provider function */
  name: string;
  /** The provider function implementation */
  implementation: ReturnValueProvider;
  /** Expected parameters for the provider function */
  parameters?: Record<string, unknown>;
  /** Whether this provider is intended for step-level or tool-level use */
  scope?: 'step' | 'tool' | 'both';
}

/**
 * Connection status information for SignalR
 */
export interface ConnectionStatus {
  /** Whether the connection is active */
  isConnected: boolean;
  /** Current connection state */
  connectionState: string | null;
  /** Current session ID */
  sessionId: string | null;
}

/**
 * Helper function to create a successful CallToolResult
 * @param content - The content for the result (string or ContentBlock array)
 * @param structuredContent - Optional structured data
 * @returns A successful CallToolResult
 */
export function createSuccessResult(
  content?: string | ContentBlock[], 
  structuredContent?: Record<string, unknown>
): CallToolResult {
  let contentArray: ContentBlock[];
  
  if (!content) {
    contentArray = [{ type: "text", text: "Operation completed successfully" }];
  } else if (typeof content === 'string') {
    contentArray = [{ type: "text", text: content }];
  } else {
    contentArray = content;
  }
  
  const result: CallToolResult = {
    content: contentArray,
    isError: false
  };
  
  if (structuredContent !== undefined) {
    result.structuredContent = structuredContent;
  }
  
  return result;
}

/**
 * Helper function to create an error CallToolResult
 * @param error - The error (Error object or string)
 * @param structuredContent - Optional structured data
 * @returns An error CallToolResult
 */
export function createErrorResult(
  error: Error | string, 
  structuredContent?: Record<string, unknown>
): CallToolResult {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorDetails = error instanceof Error ? { 
    name: error.name, 
    message: error.message, 
    stack: error.stack 
  } : { message: errorMessage };
  
  const result: CallToolResult = {
    content: [{ type: "text", text: `Error: ${errorMessage}` }],
    isError: true
  };
  
  if (structuredContent !== undefined) {
    result.structuredContent = structuredContent;
  } else {
    result.structuredContent = { error: errorDetails };
  }
  
  return result;
}

/**
 * Default successful result constant
 */
export const SuccessfulCallToolResult: CallToolResult = createSuccessResult();

/**
 * Helper function to create a failed result
 * @param error - The error that occurred
 * @returns A failed CallToolResult
 */
export function createFailedResult(error?: Error | unknown): CallToolResult {
  const errorObj = error instanceof Error ? error : new Error(String(error || 'Operation failed'));
  return createErrorResult(errorObj);
}
