---
title: "API Reference"
order: 4
category: "Reference"
---

# API Reference

Complete API documentation for WebIntractMCP.

## WebIntractMCPController

The main controller class for managing MCP sessions and tool execution.

### Constructor

```typescript
new WebIntractMCPController(
  options: WebIntractMCPOptions,
  shepherdOptions?: ShepherdOptions,
  logger?: ILogger
)
```

#### Parameters

- `options` - Configuration options for the controller  
- `shepherdOptions` (optional) - Shepherd.js configuration for UI tours (defaults to production-ready configuration)
- `logger` (optional) - Custom logger implementation (defaults to ConsoleLogger)

#### WebIntractMCPOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logLevel` | `LogLevel` | `LogLevel.WARN` | Set logging level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF) |
| `serverUrl` | `string` | `'http://localhost:8080'` | MCP server URL |
| `enableVisualFeedback` | `boolean` | `true` | Enable visual feedback for actions |
| `transport` | `TransportOptions` | `undefined` | SignalR transport configuration |

#### Default Shepherd Options

When `shepherdOptions` is not provided, the controller uses these production-ready defaults:

```typescript
{
  useModalOverlay: true,
  defaultStepOptions: {
    scrollTo: { behavior: 'smooth', block: 'center' },
    modalOverlayOpeningPadding: 4,
    modalOverlayOpeningRadius: 4,
    arrow: true,
    buttons: [{
      text: 'Next',
      action: () => tour.next()
    }],
    when: {
      show: function() { document.body.style.pointerEvents = 'none'; },
      hide: function() { document.body.style.pointerEvents = 'auto'; }
    }
  }
}
```

#### Example

```typescript
import { WebIntractMCPController, LogLevel, TransportType } from 'web-intract-mcp';

const controller = new WebIntractMCPController({
  logLevel: LogLevel.INFO,
  serverUrl: 'https://my-mcp-server.com',
  enableVisualFeedback: true,
  transport: {
    hubPath: '/mcptools',
    logLevel: LogLevel.WARN,
    transportTypes: TransportType.WebSockets | TransportType.ServerSentEvents
  }
});
```

### Core Methods

#### `initialize(): Promise<void>`

Initializes the MCP controller and establishes connections.

**Throws:**
- Error if already initialized
- Error if invalid configuration

```typescript
await controller.initialize();
```

#### `dispose(): void`

Cleans up resources and closes connections. Safe to call multiple times.

```typescript
controller.dispose();
```

#### `registerTool(tool: MCPTool): void`

Registers a tool with the MCP system.

**Parameters:**
- `tool` - The tool definition conforming to the MCP Tool schema

**Throws:**
- Error if tool name already exists
- Error if tool schema is invalid

```typescript
const tool: MCPTool = {
  name: 'click-button',
  description: 'Clicks a button element',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'CSS selector for the button' }
    },
    required: ['selector']
  }
};

controller.registerTool(tool);
```

#### `getTool(name: string): MCPTool | undefined`

Retrieves a registered tool by name.

```typescript
const tool = controller.getTool('click-button');
```

#### `getTools(): MCPTool[]`

Returns all registered tools.

```typescript
const allTools = controller.getTools();
```

#### `invokeTool(toolCall: ToolCall): Promise<ToolResult>`

Invokes a tool with the specified parameters.

**Returns:**
- Promise resolving to tool execution result

**Throws:**
- Error if tool not found
- Error if tool execution fails
- Error if parameters are invalid

```typescript
const result = await controller.invokeTool({
  name: 'click-button',
  arguments: { selector: '#submit-btn' }
});
```

#### `updateToolsFile(): Promise<void>`

Updates the tools file with current registered tools.

```typescript
await controller.updateToolsFile();
```

### Production Utilities

#### `getHealthStatus(): HealthStatus`

Returns the current health status of the controller.

```typescript
interface HealthStatus {
  isHealthy: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  lastHeartbeat: Date | null;
  signalrConnected: boolean;
  toolsLoaded: boolean;
  errors: string[];
  warnings: string[];
  uptime: number;
}

const health = controller.getHealthStatus();
console.log('Controller health:', health);
```

#### `validateConfiguration(): ConfigurationValidationResult`

Validates the current configuration and returns validation result.

```typescript
interface ConfigurationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

const validation = controller.validateConfiguration();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

#### `getStatistics(): ControllerStatistics`

Returns operational statistics for monitoring and debugging.

```typescript
interface ControllerStatistics {
  toolsRegistered: number;
  totalInvocations: number;
  successfulInvocations: number;
  failedInvocations: number;
  averageResponseTime: number;
  lastInvocation: Date | null;
  signalrReconnections: number;
  memoryUsage: {
    used: number;
    total: number;
  };
}

const stats = controller.getStatistics();
console.log('Success rate:', stats.successfulInvocations / stats.totalInvocations);
```

### Properties

#### `isInitialized: boolean`

Indicates whether the controller has been initialized.

```typescript
if (controller.isInitialized) {
  console.log('Controller is ready to use');
}
```

#### `tools: MCPTool[]`

Read-only array of registered tools.

```typescript
console.log('Registered tools:', controller.tools.length);
```

#### `version: string`

Returns the current version of the WebIntractMCP library.

```typescript
console.log('Library version:', controller.version);
```

#### `logger: ILogger`

Access to the internal logger instance for custom logging.

```typescript
controller.logger.info('Custom log message');
controller.logger.error('Error occurred', error);
```

### Logging System

The controller includes a comprehensive logging system with multiple log levels.

#### Log Levels

| Level | Description | Production Use |
|-------|-------------|----------------|
| `TRACE` | Detailed execution traces | Development only |
| `DEBUG` | Debug information | Development only |
| `INFO` | General information | Production |
| `WARN` | Warning messages | Production |
| `ERROR` | Error messages | Production |
| `FATAL` | Fatal errors | Production |
| `OFF` | Disable all logging | Special cases |

#### ILogger Interface

```typescript
interface ILogger {
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  fatal(message: string, ...args: any[]): void;
}
```

#### Configuration Examples

```typescript
import { WebIntractMCPController, LogLevel } from 'web-intract-mcp';

// Development configuration
const devController = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,
  serverUrl: 'http://localhost:5000'
});

// Production configuration
const prodController = new WebIntractMCPController({
  logLevel: LogLevel.WARN,
  serverUrl: 'https://api.myapp.com'
});

// Disable all logging
const silentController = new WebIntractMCPController({
  logLevel: LogLevel.OFF
});
```

## Types and Interfaces

### MCPTool

Core MCP tool definition conforming to the Model Context Protocol specification.

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}
```

### ToolCall

Represents a request to invoke a tool.

```typescript
interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}
```

### ToolResult

Result of tool execution.

```typescript
interface ToolResult {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

### LogLevel

Enumeration of available log levels.

```typescript
enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6
}
```

### WebIntractMCPOptions

Configuration options for the controller.

```typescript
interface WebIntractMCPOptions {
  logLevel?: LogLevel;
  debugMode?: boolean; // Deprecated: Use logLevel instead
  serverUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  [key: string]: any;
}
```

### ShepherdOptions

Configuration for Shepherd.js UI tours.

```typescript
interface ShepherdOptions {
  useModalOverlay?: boolean;
  defaultStepOptions?: {
    scrollTo?: ScrollToOptions;
    modalOverlayOpeningPadding?: number;
    modalOverlayOpeningRadius?: number;
    arrow?: boolean;
    buttons?: ShepherdButton[];
    when?: {
      show?: () => void;
      hide?: () => void;
    };
  };
}

interface ShepherdButton {
  text: string;
  action: () => void;
  classes?: string;
}
```

## Events

The controller emits events for monitoring and debugging.

### toolRegistered

Fired when a tool is successfully registered.

```typescript
controller.on('toolRegistered', (tool: MCPTool) => {
  console.log('Tool registered:', tool.name);
});
```

### toolInvoked

Fired when a tool is invoked.

```typescript
controller.on('toolInvoked', (toolCall: ToolCall) => {
  console.log('Tool invoked:', toolCall.name);
});
```

### connectionStateChanged

Fired when SignalR connection state changes.

```typescript
controller.on('connectionStateChanged', (state: string) => {
  console.log('Connection state changed:', state);
});
```

### error

Fired when an error occurs.

```typescript
controller.on('error', (error: Error) => {
  console.error('Controller error:', error.message);
});
```

## Error Handling

The controller provides comprehensive error handling with categorized errors.

### Error Categories

- **Configuration Errors**: Invalid options or setup
- **Connection Errors**: SignalR connectivity issues  
- **Tool Errors**: Tool registration or execution failures
- **Validation Errors**: Parameter or schema validation failures

### Error Examples

```typescript
try {
  await controller.initialize();
} catch (error) {
  if (error.message.includes('configuration')) {
    console.error('Configuration error:', error.message);
  } else if (error.message.includes('connection')) {
    console.error('Connection error:', error.message);
  }
}

try {
  await controller.invokeTool({ name: 'invalid-tool', arguments: {} });
} catch (error) {
  console.error('Tool execution failed:', error.message);
}

try {
  controller.registerTool({
    name: '',
    description: 'Invalid tool',
    inputSchema: { type: 'object', properties: {} }
  });
} catch (error) {
  console.error('Tool registration failed:', error.message);
}
```

### Error Recovery

```typescript
// Automatic reconnection on connection loss
controller.on('connectionStateChanged', (state) => {
  if (state === 'disconnected') {
    console.log('Connection lost, attempting to reconnect...');
    // Controller will automatically attempt reconnection
  }
});

// Graceful error handling
const executeToolSafely = async (toolCall: ToolCall) => {
  try {
    return await controller.invokeTool(toolCall);
  } catch (error) {
    controller.logger.error('Tool execution failed:', error);
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
};
```

## Advanced Usage

### Complete Integration Example

```typescript
import { WebIntractMCPController, LogLevel, MCPTool } from 'web-intract-mcp';

// Create controller with production settings
const controller = new WebIntractMCPController({
  logLevel: LogLevel.INFO,
  serverUrl: 'https://api.myapp.com',
  reconnectAttempts: 5,
  reconnectDelay: 2000
});

// Initialize and register tools
async function setupMCP() {
  try {
    await controller.initialize();
    
    // Register a form submission tool
    const formTool: MCPTool = {
      name: 'submit-form',
      description: 'Submits a form with provided data',
      inputSchema: {
        type: 'object',
        properties: {
          formSelector: { type: 'string', description: 'CSS selector for the form' },
          data: { type: 'object', description: 'Form data to submit' }
        },
        required: ['formSelector', 'data']
      }
    };
    
    controller.registerTool(formTool);
    
    // Set up event listeners
    controller.on('toolInvoked', (toolCall) => {
      console.log(`Executing tool: ${toolCall.name}`);
    });
    
    controller.on('error', (error) => {
      console.error('MCP Error:', error.message);
    });
    
    console.log('MCP Controller initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize MCP:', error);
  }
}

// Execute tool with error handling
async function executeFormSubmission(formData: any) {
  try {
    const result = await controller.invokeTool({
      name: 'submit-form',
      arguments: {
        formSelector: '#checkout-form',
        data: formData
      }
    });
    
    if (result.isError) {
      console.error('Form submission failed:', result.content[0].text);
    } else {
      console.log('Form submitted successfully:', result.content[0].text);
    }
    
    return result;
  } catch (error) {
    console.error('Tool execution error:', error);
    throw error;
  }
}

// Monitor controller health
function monitorHealth() {
  const health = controller.getHealthStatus();
  const stats = controller.getStatistics();
  
  console.log('Health Status:', {
    healthy: health.isHealthy,
    connected: health.signalrConnected,
    uptime: health.uptime,
    successRate: stats.totalInvocations > 0 
      ? (stats.successfulInvocations / stats.totalInvocations * 100).toFixed(2) + '%'
      : 'N/A'
  });
}

// Cleanup on app shutdown
function cleanup() {
  controller.dispose();
  console.log('MCP Controller disposed');
}

// Initialize
setupMCP();

// Monitor health every 30 seconds
setInterval(monitorHealth, 30000);

// Cleanup on process exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

### Custom Logger Implementation

```typescript
import { ILogger, LogLevel } from 'web-intract-mcp';

class CustomLogger implements ILogger {
  private logLevel: LogLevel;
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level;
  }
  
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }
  
  trace(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.TRACE)) {
      console.log(`[TRACE] ${message}`, ...args);
    }
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
  
  fatal(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      console.error(`[FATAL] ${message}`, ...args);
    }
  }
}

// Use custom logger
const controller = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG
});

// Access the logger for custom logging
controller.logger.info('Custom log message');
```

### Production Monitoring

```typescript
// Health monitoring service
class MCPHealthMonitor {
  private controller: WebIntractMCPController;
  private healthCheckInterval: NodeJS.Timeout;
  
  constructor(controller: WebIntractMCPController) {
    this.controller = controller;
  }
  
  startMonitoring(intervalMs = 30000) {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }
  
  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
  
  private performHealthCheck() {
    const health = this.controller.getHealthStatus();
    const stats = this.controller.getStatistics();
    const validation = this.controller.validateConfiguration();
    
    // Log health metrics
    this.controller.logger.info('Health Check', {
      healthy: health.isHealthy,
      connected: health.signalrConnected,
      uptime: health.uptime,
      toolsLoaded: health.toolsLoaded,
      configValid: validation.isValid,
      successRate: stats.totalInvocations > 0 
        ? (stats.successfulInvocations / stats.totalInvocations)
        : 0
    });
    
    // Alert on issues
    if (!health.isHealthy) {
      this.controller.logger.error('Health check failed', {
        errors: health.errors,
        warnings: health.warnings
      });
    }
    
    if (!validation.isValid) {
      this.controller.logger.error('Configuration validation failed', {
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
  }
  
  getMetrics() {
    return {
      health: this.controller.getHealthStatus(),
      statistics: this.controller.getStatistics(),
      validation: this.controller.validateConfiguration()
    };
  }
}

// Usage
const monitor = new MCPHealthMonitor(controller);
monitor.startMonitoring(30000); // Check every 30 seconds
```
