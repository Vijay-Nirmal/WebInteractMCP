/**
 * @file types.ts
 * @description Core TypeScript type definitions for MCP Elements library
 */

/**
 * Optional annotations for the client. The client can use annotations to inform how objects are used or displayed
 */
export interface Annotations {
  /**
   * Describes who the intended customer of this object or data is.
   *
   * It can include multiple entries to indicate content useful for multiple audiences (e.g., `["user", "assistant"]`).
   */
  audience?: Role[];

  /**
   * Describes how important this data is for operating the server.
   *
   * A value of 1 means "most important," and indicates that the data is
   * effectively required, while 0 means "least important," and indicates that
   * the data is entirely optional.
   *
   * @TJS-type number
   * @minimum 0
   * @maximum 1
   */
  priority?: number;

  /**
   * The moment the resource was last modified, as an ISO 8601 formatted string.
   *
   * Should be an ISO 8601 formatted string (e.g., "2025-01-12T15:00:58Z").
   *
   * Examples: last activity timestamp in an open file, timestamp when the resource
   * was attached, etc.
   */
  lastModified?: string;
}

/**
 * Role types for annotations
 */
export type Role = 'user' | 'assistant';

/**
 * Text provided to or from an LLM.
 */
export interface TextContent {
  type: "text";

  /**
   * The text content of the message.
   */
  text: string;

  /**
   * Optional annotations for the client.
   */
  annotations?: Annotations;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

/**
 * An image provided to or from an LLM.
 */
export interface ImageContent {
  type: "image";

  /**
   * The base64-encoded image data.
   *
   * @format byte
   */
  data: string;

  /**
   * The MIME type of the image. Different providers may support different image types.
   */
  mimeType: string;

  /**
   * Optional annotations for the client.
   */
  annotations?: Annotations;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

/**
 * Audio provided to or from an LLM.
 */
export interface AudioContent {
  type: "audio";

  /**
   * The base64-encoded audio data.
   *
   * @format byte
   */
  data: string;

  /**
   * The MIME type of the audio. Different providers may support different audio types.
   */
  mimeType: string;

  /**
   * Optional annotations for the client.
   */
  annotations?: Annotations;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

/**
 * The contents of a specific resource or sub-resource.
 */
export interface ResourceContents {
  /**
   * The URI of this resource.
   *
   * @format uri
   */
  uri: string;
  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

export interface TextResourceContents extends ResourceContents {
  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  text: string;
}

export interface BlobResourceContents extends ResourceContents {
  /**
   * A base64-encoded string representing the binary data of the item.
   *
   * @format byte
   */
  blob: string;
}

/**
 * A resource, which can have various types.
 */
export interface Resource {
  /**
   * The URI of this resource.
   *
   * @format uri
   */
  uri: string;

  /**
   * A human-readable name for this resource.
   */
  name?: string;

  /**
   * A description of what this resource represents.
   */
  description?: string;

  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 *
 * Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
 */
export interface ResourceLink extends Resource {
  type: "resource_link";
}

/**
 * The contents of a resource, embedded into a prompt or tool call result.
 *
 * It is up to the client how best to render embedded resources for the benefit
 * of the LLM and/or the user.
 */
export interface EmbeddedResource {
  type: "resource";
  resource: TextResourceContents | BlobResourceContents;

  /**
   * Optional annotations for the client.
   */
  annotations?: Annotations;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
}

export type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | ResourceLink
  | EmbeddedResource;

/**
 * The server's response to a tool call.
 */
export interface CallToolResult {
  /**
   * A list of content objects that represent the unstructured result of the tool call.
   */
  content: ContentBlock[];

  /**
   * An optional JSON object that represents the structured result of the tool call.
   */
  structuredContent?: { [key: string]: unknown };

  /**
   * Whether the tool call ended in an error.
   *
   * If not set, this is assumed to be false (the call was successful).
   *
   * Any errors that originate from the tool SHOULD be reported inside the result
   * object, with `isError` set to true, _not_ as an MCP protocol-level error
   * response. Otherwise, the LLM would not be able to see that an error occurred
   * and self-correct.
   *
   * However, any errors in _finding_ the tool, an error indicating that the
   * server does not support tool calls, or any other exceptional conditions,
   * should be reported as an MCP error response.
   */
  isError?: boolean;

  /**
   * See [specification/draft/basic/index#general-fields] for notes on _meta usage.
   */
  _meta?: { [key: string]: unknown };
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
  defaultValue?: any;
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
  examples?: any[];
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
 * - `silent`: No UI popups. The tool runs in the background to perform a series of automated actions.
 */
export type ToolMode = 'normal' | 'buttonless' | 'silent';

/**
 * Represents an automated action that can be performed on a web element.
 */
export interface ToolAction {
  /** The type of action to perform */
  type: 'click' | 'fillInput' | 'navigate' | 'selectOption' | 'executeFunction';
  /** The CSS selector for the target element */
  element: string;
  /** The value to use for the action (e.g., text for 'fillInput'). Can be parameterized. */
  value?: any;
  /** Delay in milliseconds before performing this action (for 'silent' mode) */
  delay?: number;
  /** For 'executeFunction' type: the function to execute */
  function?: CustomFunctionImplementation;
  /** For 'executeFunction' type: the name of a registered function to execute */
  functionName?: string;
  /** Parameters to pass to the function */
  functionParams?: Record<string, any>;
}

/**
 * Represents a single step within a Tool. It's an extension of a ShepherdJS step.
 */
export interface ToolStep {
  /** CSS selector for the element to highlight */
  targetElement: string;
  /** The text to display in the popup for 'normal' and 'buttonless' modes */
  content: string;
  /** Delay in milliseconds before auto-advancing in 'buttonless' mode */
  delay?: number;
  /** The automated action to perform in 'silent' mode */
  action?: ToolAction;
  /** An object to pass any additional ShepherdJS step options directly */
  shepherdOptions?: any;
  /** Whether to stop execution if this step fails (default: false) */
  stopOnFailure?: boolean;
  /** Configuration for the return value from this step */
  returnValue?: ReturnValue;
}

/**
 * The complete configuration for a single Tool. This is the core object for our library.
 */
export interface ToolConfiguration {
  /** A unique identifier for the Tool */
  toolId: string;
  /** A human-readable title for the Tool */
  title: string;
  /** A detailed description of what the Tool does. Useful for the MCP server. */
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
  options?: Partial<MCPElementsOptions>;
  /** Parameter schema for MCP server integration - defines expected parameters and their types */
  parameterSchema?: ToolParameterSchema;
  /** Configuration for the tool-level return value (overrides last step's return value) */
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
 * Global configuration options for MCP Elements Controller
 */
export interface MCPElementsOptions {
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
}

/**
 * Event types that can be emitted by the MCP Elements Controller
 */
export type MCPElementsEvent = 'start' | 'complete' | 'cancel' | 'step:show';

/**
 * Configuration for tools to start
 */
export interface ToolStartConfig {
  /** The ID of the tool to start */
  toolId: string;
  /** Optional parameters to pass to the tool */
  params?: Record<string, any>;
}

/**
 * Context object passed to custom functions during execution
 */
export interface CustomFunctionContext {
  /** The target DOM element */
  element: HTMLElement;
  /** Parameters passed via functionParams in the action */
  params: Record<string, any>;
  /** Tool-level parameters passed when starting the tool */
  toolParams: Record<string, any>;
  /** Reference to the MCPElementsController instance */
  controller: any; // Using any to avoid circular dependency
  /** Debug logging function */
  debugLog: (message: string, ...data: any[]) => void;
  /** Currently active tool configuration */
  activeTool: ToolConfiguration | null;
  /** Current step index in the tool execution */
  currentStepIndex: number;
  /** Return value from the previous step (if any) */
  previousStepReturnValue?: CallToolResult;
}

/**
 * Type definition for custom function implementations
 */
export type CustomFunctionImplementation = (context: CustomFunctionContext) => CallToolResult | Promise<CallToolResult>;

/**
 * Represents a custom function that can be executed as part of a tool step
 */
export interface CustomFunction {
  /** The name of the function */
  name: string;
  /** The function implementation */
  implementation: CustomFunctionImplementation;
  /** Expected parameters for the function */
  parameters?: Record<string, any>;
}

/**
 * Context object passed to return value provider functions
 * Contains all available information from both step and tool execution contexts
 */
export interface ReturnValueContext {
  /** Tool-level parameters passed when starting the tool */
  toolParams: Record<string, any>;
  /** Reference to the MCPElementsController instance */
  controller: any; // Using any to avoid circular dependency
  /** Debug logging function */
  debugLog: (message: string, ...data: any[]) => void;
  /** Currently active tool configuration */
  activeTool: ToolConfiguration | null;
  
  // Step-level context (available when called from a step)
  /** The target DOM element (available for step-level providers) */
  element?: HTMLElement;
  /** Parameters passed to the current step (available for step-level providers) */
  stepParams?: Record<string, any>;
  /** Current step index in the tool execution (available for step-level providers) */
  currentStepIndex?: number;
  /** Return value from the previous step (available for step-level providers) */
  previousStepReturnValue?: CallToolResult;
  /** Action result from the current step (available for step-level providers) */
  actionResult?: CallToolResult;
  
  // Tool-level context (available when called from tool completion)
  /** Total number of steps executed (available for tool-level providers) */
  stepsExecuted?: number;
  /** Return value from the last step (available for tool-level providers) */
  lastStepReturnValue?: CallToolResult;
  /** Whether the tool executed successfully (available for tool-level providers) */
  toolExecutionSuccess?: boolean;
  /** Any error that occurred during tool execution (available for tool-level providers) */
  toolExecutionError?: Error;
}

/**
 * Type definition for return value provider functions
 * Unified type that works for both step-level and tool-level providers
 */
export type ReturnValueProvider = (context: ReturnValueContext) => CallToolResult | Promise<CallToolResult>;

/**
 * Represents a return value provider function that can be registered and used in steps or tools
 */
export interface ReturnValueProviderFunction {
  /** The name of the provider function */
  name: string;
  /** The provider function implementation */
  implementation: ReturnValueProvider;
  /** Expected parameters for the provider function */
  parameters?: Record<string, any>;
  /** Whether this provider is intended for step-level or tool-level use (optional metadata) */
  scope?: 'step' | 'tool' | 'both';
}

/**
 * Configuration for return values (used by both steps and tools)
 */
export interface ReturnValue {
  /** Static/hardcoded return value */
  value?: any;
  /** Function to compute the return value dynamically */
  provider?: ReturnValueProvider;
  /** Name of a registered function to compute the return value */
  providerName?: string;
  /** Parameters to pass to the provider function */
  providerParams?: Record<string, any>;
}

/**
 * Helper function to create a successful CallToolResult
 */
export const createSuccessResult = (content?: string | ContentBlock[], structuredContent?: { [key: string]: unknown }): CallToolResult => {
  let contentArray: ContentBlock[];
  
  if (!content) {
    contentArray = [{ type: "text", text: "Operation completed successfully" }];
  } else if (typeof content === 'string') {
    contentArray = [{ type: "text", text: content }];
  } else {
    contentArray = content;
  }
  
  return {
    content: contentArray,
    structuredContent,
    isError: false
  };
};

/**
 * Helper function to create an error CallToolResult
 */
export const createErrorResult = (error: Error | string, structuredContent?: { [key: string]: unknown }): CallToolResult => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorDetails = error instanceof Error ? { 
    name: error.name, 
    message: error.message, 
    stack: error.stack 
  } : { message: errorMessage };
  
  return {
    content: [{ type: "text", text: `Error: ${errorMessage}` }],
    structuredContent: structuredContent || { error: errorDetails },
    isError: true
  };
};

/**
 * Default successful result constant
 */
export const SuccessfulCallToolResult: CallToolResult = createSuccessResult();

/**
 * Helper function to create a failed result
 */
export const FailedCallToolResult = (error?: Error | unknown): CallToolResult => {
  const errorObj = error instanceof Error ? error : new Error(String(error || 'Operation failed'));
  return createErrorResult(errorObj);
};
