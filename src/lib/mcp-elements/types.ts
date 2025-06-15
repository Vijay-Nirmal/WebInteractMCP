/**
 * @file types.ts
 * @description Core TypeScript type definitions for MCP Elements library
 */

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
}

/**
 * Type definition for custom function implementations
 */
export type CustomFunctionImplementation = (context: CustomFunctionContext) => any | Promise<any>;

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
