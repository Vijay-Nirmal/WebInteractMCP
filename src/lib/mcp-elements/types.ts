/**
 * @file types.ts
 * @description Core TypeScript type definitions for MCP Elements library
 */

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
  type: 'click' | 'fillInput' | 'navigate' | 'selectOption';
  /** The CSS selector for the target element */
  element: string;
  /** The value to use for the action (e.g., text for 'fillInput'). Can be parameterized. */
  value?: any;
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
  /** A URL string or regex to determine if the Tool is available on the current page */
  pageMatcher?: string | RegExp;
  /** If true, this Tool can be invoked from any page */
  global?: boolean;
  /** An array of steps that make up the Tool */
  steps: ToolStep[];
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
