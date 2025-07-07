---
title: "Client Library API"
order: 1
category: "API Reference"
---

# Client Library API Reference

Complete API reference for the WebIntract MCP client library, including TypeScript interfaces, classes, and integration patterns.

## Installation

```bash
npm install @webintract/mcp-client
# or
yarn add @webintract/mcp-client
```

## Core Interfaces

### McpTool

Represents an available MCP tool with its schema definition.

```typescript
interface McpTool {
  /** Unique identifier for the tool */
  name: string;
  
  /** Human-readable description of the tool's functionality */
  description: string;
  
  /** JSON schema defining the tool's input parameters */
  input_schema: {
    type: "object";
    properties: Record<string, McpToolProperty>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

interface McpToolProperty {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: any[];
  items?: McpToolProperty;
  properties?: Record<string, McpToolProperty>;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: any;
}
```

**Example:**
```typescript
const tool: McpTool = {
  name: "web_search",
  description: "Search the web for information",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query",
        minLength: 1,
        maxLength: 500
      },
      max_results: {
        type: "integer",
        description: "Maximum number of results",
        minimum: 1,
        maximum: 50,
        default: 10
      }
    },
    required: ["query"]
  }
};
```

### ToolCallRequest

Request structure for calling an MCP tool.

```typescript
interface ToolCallRequest {
  /** Name of the tool to call */
  name: string;
  
  /** Arguments to pass to the tool */
  arguments: Record<string, any>;
  
  /** Optional metadata for the request */
  metadata?: {
    requestId?: string;
    timeout?: number;
    priority?: "low" | "normal" | "high";
    tags?: string[];
  };
}
```

**Example:**
```typescript
const request: ToolCallRequest = {
  name: "web_search",
  arguments: {
    query: "TypeScript best practices",
    max_results: 5
  },
  metadata: {
    requestId: "search-001",
    timeout: 30000,
    priority: "high"
  }
};
```

### ToolCallResponse

Response structure from an MCP tool call.

```typescript
interface ToolCallResponse {
  /** Array of content items returned by the tool */
  content: ToolContent[];
  
  /** Whether the tool call resulted in an error */
  isError: boolean;
  
  /** Optional metadata about the response */
  metadata?: {
    executionTime?: number;
    requestId?: string;
    toolVersion?: string;
    cacheHit?: boolean;
  };
}

interface ToolContent {
  /** Type of content */
  type: "text" | "image" | "json" | "html" | "markdown" | "binary";
  
  /** Text content (for text, html, markdown types) */
  text?: string;
  
  /** Structured data (for json type) */
  data?: any;
  
  /** Binary data (for binary, image types) */
  buffer?: ArrayBuffer;
  
  /** MIME type for binary content */
  mimeType?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}
```

**Example:**
```typescript
const response: ToolCallResponse = {
  content: [
    {
      type: "json",
      data: {
        results: [
          {
            title: "TypeScript Handbook",
            url: "https://www.typescriptlang.org/docs/",
            snippet: "The TypeScript handbook is a comprehensive guide..."
          }
        ],
        totalResults: 1250000
      }
    }
  ],
  isError: false,
  metadata: {
    executionTime: 1234,
    requestId: "search-001",
    cacheHit: false
  }
};
```

### ConnectionState

Represents the current state of the MCP connection.

```typescript
interface ConnectionState {
  /** Whether the connection is currently active */
  isConnected: boolean;
  
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  
  /** Current error message, if any */
  error: string | null;
  
  /** Timestamp of last successful communication */
  lastActivity: Date | null;
  
  /** Connection quality metrics */
  metrics?: {
    latency?: number;
    reconnectAttempts?: number;
    bytesTransferred?: number;
  };
}
```

## Main Client Class

### WebIntractMcpClient

Main client class for interacting with WebIntract MCP Server.

```typescript
class WebIntractMcpClient {
  constructor(options: McpClientOptions);
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionState(): ConnectionState;
  
  // Tool operations
  getAvailableTools(): Promise<McpTool[]>;
  getTool(name: string): Promise<McpTool | null>;
  callTool(request: ToolCallRequest): Promise<ToolCallResponse>;
  
  // Real-time operations
  callToolRealtime(request: ToolCallRequest): Promise<string>;
  subscribeToResults(callback: ToolResultCallback): void;
  unsubscribeFromResults(): void;
  
  // Event handling
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  
  // Utility methods
  validateToolArguments(toolName: string, arguments: Record<string, any>): ValidationResult;
  generateRequestId(): string;
  clearCache(): void;
}
```

### McpClientOptions

Configuration options for the MCP client.

```typescript
interface McpClientOptions {
  /** Base URL of the MCP server */
  baseUrl: string;
  
  /** HTTP client configuration */
  http?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
  };
  
  /** SignalR configuration */
  signalr?: {
    enabled?: boolean;
    hubPath?: string;
    automaticReconnect?: boolean;
    reconnectPolicy?: number[] | ReconnectPolicy;
    logLevel?: LogLevel;
  };
  
  /** Caching configuration */
  cache?: {
    enabled?: boolean;
    ttl?: number;
    maxSize?: number;
    strategy?: "memory" | "localStorage" | "sessionStorage";
  };
  
  /** Authentication configuration */
  auth?: {
    type?: "bearer" | "apikey" | "basic";
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  
  /** Logging configuration */
  logging?: {
    level?: "debug" | "info" | "warn" | "error";
    prefix?: string;
    enabled?: boolean;
  };
}
```

**Example:**
```typescript
const client = new WebIntractMcpClient({
  baseUrl: "https://mcp.example.com",
  http: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      "X-API-Version": "1.0"
    }
  },
  signalr: {
    enabled: true,
    automaticReconnect: true,
    logLevel: LogLevel.Information
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    strategy: "memory"
  },
  auth: {
    type: "bearer",
    token: "your-jwt-token"
  },
  logging: {
    level: "info",
    enabled: true
  }
});
```

## Event System

### Client Events

The MCP client emits various events that you can listen to:

```typescript
// Connection events
client.on("connected", () => {
  console.log("Connected to MCP server");
});

client.on("disconnected", (reason: string) => {
  console.log("Disconnected:", reason);
});

client.on("reconnecting", (attempt: number) => {
  console.log(`Reconnecting (attempt ${attempt})`);
});

client.on("error", (error: Error) => {
  console.error("Client error:", error);
});

// Tool events
client.on("toolsLoaded", (tools: McpTool[]) => {
  console.log(`Loaded ${tools.length} tools`);
});

client.on("toolCallStarted", (request: ToolCallRequest) => {
  console.log(`Tool call started: ${request.name}`);
});

client.on("toolCallCompleted", (response: ToolCallResponse) => {
  console.log("Tool call completed");
});

client.on("toolCallFailed", (error: Error, request: ToolCallRequest) => {
  console.error(`Tool call failed: ${request.name}`, error);
});

// Real-time events
client.on("realtimeResponse", (response: ToolCallResponse) => {
  console.log("Received real-time response");
});
```

### Event Types

```typescript
type ClientEvents = {
  connected: () => void;
  disconnected: (reason: string) => void;
  reconnecting: (attempt: number) => void;
  error: (error: Error) => void;
  toolsLoaded: (tools: McpTool[]) => void;
  toolCallStarted: (request: ToolCallRequest) => void;
  toolCallCompleted: (response: ToolCallResponse) => void;
  toolCallFailed: (error: Error, request: ToolCallRequest) => void;
  realtimeResponse: (response: ToolCallResponse) => void;
  cacheHit: (key: string) => void;
  cacheMiss: (key: string) => void;
};
```

## Validation and Utilities

### ValidationResult

Result of tool argument validation.

```typescript
interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** Array of validation errors */
  errors: ValidationError[];
  
  /** Warnings that don't prevent execution */
  warnings: ValidationWarning[];
}

interface ValidationError {
  /** Path to the invalid property */
  path: string;
  
  /** Error message */
  message: string;
  
  /** Expected value or type */
  expected?: any;
  
  /** Actual value */
  actual?: any;
}

interface ValidationWarning {
  /** Path to the property */
  path: string;
  
  /** Warning message */
  message: string;
}
```

**Example:**
```typescript
const validation = client.validateToolArguments("web_search", {
  query: "", // Invalid: empty string
  max_results: 100 // Warning: exceeds recommended limit
});

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  // Output: [{ path: "query", message: "String cannot be empty", expected: "non-empty string", actual: "" }]
}

if (validation.warnings.length > 0) {
  console.warn("Validation warnings:", validation.warnings);
  // Output: [{ path: "max_results", message: "Value exceeds recommended limit of 50" }]
}
```

### Utility Functions

```typescript
class McpUtils {
  /** Generate a unique request ID */
  static generateRequestId(): string;
  
  /** Validate tool arguments against schema */
  static validateArguments(schema: McpTool["input_schema"], args: Record<string, any>): ValidationResult;
  
  /** Convert tool schema to TypeScript interface string */
  static schemaToTypeScript(schema: McpTool["input_schema"]): string;
  
  /** Extract tool categories from tool names */
  static categorizeTools(tools: McpTool[]): Record<string, McpTool[]>;
  
  /** Format tool response for display */
  static formatResponse(response: ToolCallResponse): string;
  
  /** Check if a tool supports specific argument types */
  static supportsArgumentType(tool: McpTool, argumentType: string): boolean;
  
  /** Create tool call request with validation */
  static createRequest(toolName: string, args: Record<string, any>, metadata?: any): ToolCallRequest;
}
```

**Example:**
```typescript
// Generate request ID
const requestId = McpUtils.generateRequestId();
console.log(requestId); // "req_1234567890_abc123"

// Convert schema to TypeScript
const tsInterface = McpUtils.schemaToTypeScript(tool.input_schema);
console.log(tsInterface);
// Output:
// interface WebSearchArgs {
//   query: string;
//   max_results?: number;
// }

// Categorize tools
const categories = McpUtils.categorizeTools(tools);
console.log(categories);
// Output: { web: [tool1, tool2], file: [tool3], ... }

// Create validated request
const request = McpUtils.createRequest("web_search", {
  query: "TypeScript",
  max_results: 10
});
```

## Error Handling

### Error Types

The client defines specific error types for different scenarios:

```typescript
class McpClientError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = "McpClientError";
  }
}

class McpConnectionError extends McpClientError {
  constructor(message: string, details?: any) {
    super(message, "CONNECTION_ERROR", details);
    this.name = "McpConnectionError";
  }
}

class McpToolError extends McpClientError {
  constructor(message: string, public toolName: string, details?: any) {
    super(message, "TOOL_ERROR", details);
    this.name = "McpToolError";
  }
}

class McpValidationError extends McpClientError {
  constructor(message: string, public validationErrors: ValidationError[], details?: any) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "McpValidationError";
  }
}

class McpTimeoutError extends McpClientError {
  constructor(message: string, public timeoutMs: number, details?: any) {
    super(message, "TIMEOUT_ERROR", details);
    this.name = "McpTimeoutError";
  }
}
```

### Error Handling Patterns

```typescript
try {
  const response = await client.callTool({
    name: "web_search",
    arguments: { query: "TypeScript" }
  });
  
  if (response.isError) {
    console.error("Tool returned error:", response.content);
  } else {
    console.log("Success:", response.content);
  }
} catch (error) {
  if (error instanceof McpConnectionError) {
    console.error("Connection failed:", error.message);
    // Handle connection error
  } else if (error instanceof McpToolError) {
    console.error(`Tool ${error.toolName} failed:`, error.message);
    // Handle tool-specific error
  } else if (error instanceof McpValidationError) {
    console.error("Validation failed:", error.validationErrors);
    // Handle validation error
  } else if (error instanceof McpTimeoutError) {
    console.error(`Request timed out after ${error.timeoutMs}ms`);
    // Handle timeout
  } else {
    console.error("Unknown error:", error);
    // Handle unknown error
  }
}
```

## Advanced Features

### Caching

The client supports multiple caching strategies:

```typescript
interface CacheOptions {
  /** Cache strategy */
  strategy: "memory" | "localStorage" | "sessionStorage" | "indexedDB";
  
  /** Time to live in milliseconds */
  ttl: number;
  
  /** Maximum cache size */
  maxSize: number;
  
  /** Cache key generator */
  keyGenerator?: (request: ToolCallRequest) => string;
  
  /** Cache invalidation rules */
  invalidation?: {
    /** Invalidate on tool list changes */
    onToolsChange?: boolean;
    
    /** Invalidate on connection changes */
    onConnectionChange?: boolean;
    
    /** Custom invalidation function */
    custom?: (key: string, value: any) => boolean;
  };
}

// Enable caching
const client = new WebIntractMcpClient({
  baseUrl: "https://mcp.example.com",
  cache: {
    enabled: true,
    strategy: "memory",
    ttl: 300000, // 5 minutes
    maxSize: 100,
    keyGenerator: (request) => `${request.name}_${JSON.stringify(request.arguments)}`,
    invalidation: {
      onToolsChange: true,
      onConnectionChange: false
    }
  }
});

// Manual cache operations
client.clearCache(); // Clear entire cache
client.invalidateCache("web_search_*"); // Clear specific pattern
```

### Middleware

Add middleware to intercept and modify requests/responses:

```typescript
interface McpMiddleware {
  /** Called before sending request */
  beforeRequest?: (request: ToolCallRequest) => ToolCallRequest | Promise<ToolCallRequest>;
  
  /** Called after receiving response */
  afterResponse?: (response: ToolCallResponse, request: ToolCallRequest) => ToolCallResponse | Promise<ToolCallResponse>;
  
  /** Called on error */
  onError?: (error: Error, request: ToolCallRequest) => void | Promise<void>;
}

// Add middleware
client.use({
  beforeRequest: async (request) => {
    console.log("Sending request:", request.name);
    
    // Add authentication
    request.metadata = {
      ...request.metadata,
      userId: getCurrentUserId()
    };
    
    return request;
  },
  
  afterResponse: async (response, request) => {
    console.log(`Response for ${request.name}:`, response.content.length);
    
    // Log successful calls
    logToolCall(request, response);
    
    return response;
  },
  
  onError: async (error, request) => {
    console.error(`Error in ${request.name}:`, error);
    
    // Report errors
    reportError(error, request);
  }
});
```

### Batch Operations

Execute multiple tool calls efficiently:

```typescript
interface BatchRequest {
  /** Array of tool calls to execute */
  requests: ToolCallRequest[];
  
  /** Execution options */
  options?: {
    /** Execute in parallel or sequence */
    mode?: "parallel" | "sequence";
    
    /** Maximum concurrent requests (for parallel mode) */
    concurrency?: number;
    
    /** Continue on error or stop */
    continueOnError?: boolean;
    
    /** Overall timeout for the batch */
    timeout?: number;
  };
}

interface BatchResponse {
  /** Array of responses in same order as requests */
  responses: (ToolCallResponse | Error)[];
  
  /** Execution metadata */
  metadata: {
    totalTime: number;
    successCount: number;
    errorCount: number;
    completedCount: number;
  };
}

// Execute batch
const batchResponse = await client.callToolsBatch({
  requests: [
    { name: "web_search", arguments: { query: "TypeScript" } },
    { name: "web_search", arguments: { query: "JavaScript" } },
    { name: "file_read", arguments: { path: "/tmp/data.txt" } }
  ],
  options: {
    mode: "parallel",
    concurrency: 2,
    continueOnError: true,
    timeout: 60000
  }
});

console.log(`Completed ${batchResponse.metadata.completedCount} of ${batchResponse.responses.length} requests`);
```

## Framework Integrations

### React Hook

```typescript
import { useEffect, useState, useCallback } from 'react';
import { WebIntractMcpClient } from '@webintract/mcp-client';

export function useWebIntractMcp(options: McpClientOptions) {
  const [client] = useState(() => new WebIntractMcpClient(options));
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handleError = (err: Error) => setError(err);
    const handleToolsLoaded = (loadedTools: McpTool[]) => setTools(loadedTools);

    client.on('connected', handleConnected);
    client.on('disconnected', handleDisconnected);
    client.on('error', handleError);
    client.on('toolsLoaded', handleToolsLoaded);

    return () => {
      client.off('connected', handleConnected);
      client.off('disconnected', handleDisconnected);
      client.off('error', handleError);
      client.off('toolsLoaded', handleToolsLoaded);
    };
  }, [client]);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.connect();
      const availableTools = await client.getAvailableTools();
      setTools(availableTools);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Connection failed'));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const callTool = useCallback(async (request: ToolCallRequest) => {
    return await client.callTool(request);
  }, [client]);

  return {
    client,
    tools,
    isConnected,
    isLoading,
    error,
    connect,
    callTool
  };
}
```

### Vue Composable

```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { WebIntractMcpClient } from '@webintract/mcp-client';

export function useWebIntractMcp(options: McpClientOptions) {
  const client = new WebIntractMcpClient(options);
  const tools = ref<McpTool[]>([]);
  const connectionState = ref<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastActivity: null
  });
  const isLoading = ref(false);

  const isConnected = computed(() => connectionState.value.isConnected);
  const error = computed(() => connectionState.value.error);

  const updateConnectionState = () => {
    connectionState.value = client.getConnectionState();
  };

  const connect = async () => {
    isLoading.value = true;
    try {
      await client.connect();
      const availableTools = await client.getAvailableTools();
      tools.value = availableTools;
    } finally {
      isLoading.value = false;
    }
  };

  const callTool = async (request: ToolCallRequest) => {
    return await client.callTool(request);
  };

  onMounted(() => {
    client.on('connected', updateConnectionState);
    client.on('disconnected', updateConnectionState);
    client.on('error', updateConnectionState);
  });

  onUnmounted(async () => {
    await client.disconnect();
  });

  return {
    client,
    tools: readonly(tools),
    isConnected,
    isLoading: readonly(isLoading),
    error,
    connect,
    callTool
  };
}
```

## Migration Guide

### From v1.x to v2.x

```typescript
// v1.x (deprecated)
import { McpClient } from '@webintract/mcp-client';

const client = new McpClient('http://localhost:8080');
await client.init();
const tools = await client.listTools();
const result = await client.execute('tool_name', { arg: 'value' });

// v2.x (current)
import { WebIntractMcpClient } from '@webintract/mcp-client';

const client = new WebIntractMcpClient({
  baseUrl: 'http://localhost:8080'
});
await client.connect();
const tools = await client.getAvailableTools();
const result = await client.callTool({
  name: 'tool_name',
  arguments: { arg: 'value' }
});
```

### Breaking Changes

1. **Constructor**: Now requires options object instead of URL string
2. **Tool Calling**: Changed from `execute()` to `callTool()` with structured request
3. **Tool Listing**: Changed from `listTools()` to `getAvailableTools()`
4. **Response Format**: Standardized response structure with `content` array
5. **Error Handling**: Specific error types instead of generic errors

This comprehensive API reference covers all aspects of the WebIntract MCP client library, providing developers with everything needed to integrate MCP tools into their applications effectively.

## Next Steps

- [Server API Reference](./server-api) - Server-side API documentation
- [Tool Development](../development/tool-development) - Creating custom tools
- [Integration Examples](../examples) - Real-world integration examples
- [Troubleshooting](../troubleshooting) - Common issues and solutions
