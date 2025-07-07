---
title: "API Reference"
order: 4
category: "Reference"
---

# API Reference

Complete API documentation for WebIntractMCP.

## WebIntractMCPController

The main controller class for managing MCP sessions and tool execution.

### createWebIntractMCPController(options?)

Creates a new instance of the WebIntractMCP controller.

#### Parameters

- `options` (optional): Configuration options
  - `serverUrl`: MCP server URL (default: 'http://localhost:8080')
  - `enableLogging`: Enable debug logging (default: false)
  - `reconnectAttempts`: Number of reconnection attempts (default: 3)
  - `reconnectDelay`: Delay between reconnection attempts in ms (default: 1000)

#### Returns

`WebIntractMCPController` instance

#### Example

```typescript
import { createWebIntractMCPController } from 'web-intract-mcp';

const controller = createWebIntractMCPController({
  serverUrl: 'https://my-mcp-server.com',
  enableLogging: true,
  reconnectAttempts: 5
});
```

### controller.loadTools(toolsPath)

Loads tool configurations from a JSON file.

#### Parameters

- `toolsPath`: Path to the tools JSON file

#### Returns

`Promise<void>`

#### Example

```typescript
await controller.loadTools('/mcp-tools.json');
```

### controller.createSession(serverUrl?)

Creates a new MCP session with the server.

#### Parameters

- `serverUrl` (optional): Override the default server URL

#### Returns

`Promise<string>` - Session ID

#### Example

```typescript
const sessionId = await controller.createSession();
console.log('Session created:', sessionId);
```

### controller.executeTool(toolId, parameters?)

Executes a specific tool with optional parameters.

#### Parameters

- `toolId`: ID of the tool to execute
- `parameters` (optional): Tool parameters object

#### Returns

`Promise<ToolExecutionResult>`

#### Example

```typescript
const result = await controller.executeTool('click-button', {
  buttonId: 'submit-btn'
});
```

### controller.getAvailableTools()

Gets a list of all available tools.

#### Returns

`Tool[]` - Array of available tools

#### Example

```typescript
const tools = controller.getAvailableTools();
console.log('Available tools:', tools);
```

### controller.disconnect()

Disconnects from the MCP server and cleans up resources.

#### Returns

`Promise<void>`

#### Example

```typescript
await controller.disconnect();
```

## Types

### Tool

Represents an MCP tool configuration.

```typescript
interface Tool {
  toolId: string;
  title: string;
  description: string;
  mode: 'silent' | 'guided' | 'interactive';
  parameters?: ToolParameters;
  steps: ToolStep[];
}
```

### ToolParameters

Schema for tool parameters.

```typescript
interface ToolParameters {
  type: 'object';
  properties: Record<string, ParameterSchema>;
  required?: string[];
}

interface ParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  enum?: string[];
  default?: any;
}
```

### ToolStep

Represents a single step in a tool execution.

```typescript
interface ToolStep {
  targetElement: string;
  action: ToolAction;
  description?: string;
  validation?: ToolValidation;
  condition?: ToolCondition;
}
```

### ToolAction

Defines the action to perform in a tool step.

```typescript
interface ToolAction {
  type: 'click' | 'type' | 'select' | 'wait' | 'custom' | 'highlight';
  element: string;
  value?: string;
  options?: ActionOptions;
}

interface ActionOptions {
  waitForElement?: boolean;
  timeout?: number;
  clearFirst?: boolean;
  typeDelay?: number;
  byValue?: boolean;
  waitFor?: 'appear' | 'disappear';
  script?: string;
}
```

### ToolValidation

Validation rules for tool steps.

```typescript
interface ToolValidation {
  type: 'exists' | 'visible' | 'text' | 'value' | 'count';
  expected: any;
  errorMessage?: string;
}
```

### ToolExecutionResult

Result of tool execution.

```typescript
interface ToolExecutionResult {
  success: boolean;
  toolId: string;
  sessionId: string;
  steps: StepResult[];
  error?: string;
  duration: number;
}

interface StepResult {
  stepIndex: number;
  success: boolean;
  duration: number;
  error?: string;
  screenshot?: string;
}
```

## Events

The controller emits various events during tool execution.

### toolExecutionStarted

Fired when tool execution begins.

```typescript
controller.on('toolExecutionStarted', (event) => {
  console.log('Tool execution started:', event.toolId);
});
```

### toolExecutionCompleted

Fired when tool execution completes.

```typescript
controller.on('toolExecutionCompleted', (result) => {
  console.log('Tool execution completed:', result);
});
```

### stepExecuted

Fired when a tool step is executed.

```typescript
controller.on('stepExecuted', (stepResult) => {
  console.log('Step executed:', stepResult);
});
```

### connectionStateChanged

Fired when the connection state changes.

```typescript
controller.on('connectionStateChanged', (state) => {
  console.log('Connection state:', state);
});
```

## Error Handling

WebIntractMCP provides comprehensive error handling with specific error types.

### MCPConnectionError

Thrown when connection to the MCP server fails.

```typescript
try {
  await controller.createSession();
} catch (error) {
  if (error instanceof MCPConnectionError) {
    console.error('Failed to connect to MCP server:', error.message);
  }
}
```

### ToolExecutionError

Thrown when tool execution fails.

```typescript
try {
  await controller.executeTool('invalid-tool');
} catch (error) {
  if (error instanceof ToolExecutionError) {
    console.error('Tool execution failed:', error.message);
    console.error('Failed step:', error.stepIndex);
  }
}
```

### ValidationError

Thrown when tool validation fails.

```typescript
try {
  await controller.executeTool('form-submit');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  }
}
```

## Advanced Usage

### Custom Action Handlers

Register custom action handlers for specialized functionality.

```typescript
controller.registerActionHandler('customScroll', (element, options) => {
  element.scrollIntoView({ 
    behavior: options.behavior || 'smooth',
    block: options.block || 'center'
  });
});
```

### Middleware

Add middleware to intercept and modify tool execution.

```typescript
controller.use((context, next) => {
  console.log('Executing step:', context.step);
  return next();
});
```

### Session Management

Manage multiple sessions for different users or contexts.

```typescript
const session1 = await controller.createSession();
const session2 = await controller.createSession();

// Execute tools in different sessions
await controller.executeTool('tool1', {}, session1);
await controller.executeTool('tool2', {}, session2);
```

## Configuration Examples

### Complete Tool Configuration

```json
{
  "toolId": "complete-checkout",
  "title": "Complete Checkout Process",
  "description": "Automates the entire e-commerce checkout process",
  "mode": "guided",
  "parameters": {
    "type": "object",
    "properties": {
      "customerInfo": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "description": "Customer email" },
          "firstName": { "type": "string", "description": "First name" },
          "lastName": { "type": "string", "description": "Last name" }
        },
        "required": ["email", "firstName", "lastName"]
      },
      "paymentMethod": {
        "type": "string",
        "enum": ["credit", "debit", "paypal"],
        "description": "Payment method"
      }
    },
    "required": ["customerInfo", "paymentMethod"]
  },
  "steps": [
    {
      "targetElement": "#checkout-btn",
      "action": {
        "type": "click",
        "element": "#checkout-btn",
        "options": { "waitForElement": true, "timeout": 5000 }
      },
      "description": "Proceeding to checkout...",
      "validation": {
        "type": "visible",
        "expected": true,
        "errorMessage": "Checkout page not loaded"
      }
    }
  ],
  "errorHandling": {
    "retries": 3,
    "onError": [
      {
        "action": { "type": "click", "element": ".error-close" }
      }
    ]
  }
}
```

## Server Configuration

### MCP Server Setup

The WebIntractMCP server can be configured via environment variables or configuration files.

#### Environment Variables

```bash
MCP_PORT=8080
MCP_CORS_ORIGINS=https://myapp.com,http://localhost:3000
MCP_LOG_LEVEL=info
MCP_SESSION_TIMEOUT=3600
```

#### Configuration File

```json
{
  "server": {
    "port": 8080,
    "cors": {
      "origins": ["https://myapp.com", "http://localhost:3000"],
      "credentials": true
    },
    "logging": {
      "level": "info",
      "console": true,
      "file": "mcp-server.log"
    },
    "session": {
      "timeout": 3600,
      "cleanupInterval": 300
    }
  }
}
```

## Performance Optimization

### Best Practices

1. **Use specific selectors**: Avoid overly broad CSS selectors
2. **Set appropriate timeouts**: Balance reliability with performance
3. **Minimize DOM queries**: Cache element references when possible
4. **Use efficient validation**: Choose appropriate validation types
5. **Implement error recovery**: Handle failures gracefully

### Monitoring

```typescript
// Enable performance monitoring
const controller = createWebIntractMCPController({
  enableLogging: true,
  performanceTracking: true
});

// Monitor tool execution times
controller.on('toolExecutionCompleted', (result) => {
  console.log(`Tool ${result.toolId} took ${result.duration}ms`);
});
```

## Migration Guide

### From v0.x to v1.x

1. Update import statements
2. Replace deprecated methods
3. Update tool configurations
4. Test thoroughly

See the [Migration Guide](./migration) for detailed instructions.
