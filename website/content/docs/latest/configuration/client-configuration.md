---
title: "Client Configuration"
order: 1
category: "Configuration"
---

# Client Configuration

Configure the WebIntractMCP client library for optimal performance and functionality.

## WebIntractMCPOptions

The main configuration interface for the client controller.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logLevel` | `LogLevel` | `LogLevel.WARN` | Set logging level for the controller |
| `serverUrl` | `string` | `'http://localhost:8080'` | MCP server URL |
| `enableVisualFeedback` | `boolean` | `true` | Enable visual feedback for automated actions |
| `transport` | `TransportOptions` | `undefined` | SignalR transport configuration |

## Log Level Configuration

Control logging output with different log levels.

### LogLevel Enum

```typescript
enum LogLevel {
  TRACE = 0,  // Detailed execution traces
  DEBUG = 1,  // Debug information  
  INFO = 2,   // General information
  WARN = 3,   // Warning messages
  ERROR = 4,  // Error messages
  FATAL = 5,  // Fatal errors
  OFF = 6     // Disable all logging
}
```

### TransportType Enum

```typescript
enum TransportType {
  WebSockets = 1,        // WebSocket transport
  ServerSentEvents = 2,  // Server-Sent Events transport
  LongPolling = 4        // Long Polling transport
}
```

### Environment-Specific Logging

#### Development Configuration

```typescript
import { WebIntractMCPController, LogLevel, TransportType } from 'web-intract-mcp';

const controller = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,
  serverUrl: 'http://localhost:8080',
  enableVisualFeedback: true,
  transport: {
    logLevel: LogLevel.DEBUG,
    transportTypes: TransportType.WebSockets
  }
});
```

#### Production Configuration

```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.WARN,
  serverUrl: 'https://api.myapp.com',
  enableVisualFeedback: false,
  transport: {
    logLevel: LogLevel.ERROR,
    transportTypes: TransportType.WebSockets | TransportType.ServerSentEvents | TransportType.LongPolling
  }
});
```

#### Silent Configuration

```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.OFF,
  serverUrl: 'https://api.myapp.com'
});
```

## Migration Guide

### Constructor Parameter Changes

The constructor parameter order has changed to make options the first parameter:

#### Before

```typescript
const controller = new WebIntractMCPController(
  shepherdOptions,  // First parameter
  options           // Second parameter
);
```

#### After

```typescript
const controller = new WebIntractMCPController(
  options,          // First parameter
  shepherdOptions   // Second parameter  
);
```

### debugMode Removal

The deprecated `debugMode` property has been removed:

#### Before

```typescript
const controller = new WebIntractMCPController({
  debugMode: true,  // Removed
  serverUrl: 'http://localhost:8080'
});
```

#### After

```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,  // Use logLevel instead
  serverUrl: 'http://localhost:8080'
});
```

## TransportOptions

Configure SignalR transport settings for real-time communication.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `hubPath` | `string` | `'/mcptools'` | SignalR hub endpoint path |
| `maxRetryAttempts` | `number` | `10` | Connection retry attempts |
| `baseRetryDelayMs` | `number` | `1000` | Base retry delay in milliseconds |
| `enableLogging` | `boolean` | `false` | Enable detailed SignalR logging |
| `logLevel` | `LogLevel` | `LogLevel.INFO` | SignalR log level |
| `transportTypes` | `TransportType` | `WebSockets \| ServerSentEvents \| LongPolling` | Allowed transport types |

### Transport Configuration Examples

```typescript
// Development with detailed logging
const devTransport: TransportOptions = {
  hubPath: '/mcptools',
  maxRetryAttempts: 3,
  baseRetryDelayMs: 1000,
  enableLogging: true,
  logLevel: LogLevel.DEBUG,
  transportTypes: TransportType.WebSockets
};

// Production with fallback transports
const prodTransport: TransportOptions = {
  hubPath: '/mcptools',
  maxRetryAttempts: 10,
  baseRetryDelayMs: 2000,
  enableLogging: false,
  logLevel: LogLevel.ERROR,
  transportTypes: TransportType.WebSockets | TransportType.ServerSentEvents | TransportType.LongPolling
};
```

Configure UI tours with optional Shepherd.js options.

### Default Configuration

When `shepherdOptions` is not provided, the controller uses production-ready defaults:

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

### Custom Shepherd Configuration

```typescript
import { WebIntractMCPController } from 'web-intract-mcp';

const customShepherdOptions = {
  useModalOverlay: false,
  defaultStepOptions: {
    scrollTo: { behavior: 'auto', block: 'nearest' },
    arrow: false,
    buttons: [
      {
        text: 'Skip',
        action: () => tour.complete()
      },
      {
        text: 'Continue',
        action: () => tour.next()
      }
    ]
  }
};

const controller = new WebIntractMCPController(
  { logLevel: LogLevel.INFO },
  'https://api.myapp.com',
  customShepherdOptions
);
```

## Connection Configuration

### SignalR Connection Settings

Configure the SignalR connection for reliable real-time communication.

```typescript
const controller = new WebIntractMCPController({
  serverUrl: 'https://api.myapp.com',
  reconnectAttempts: 5,      // Retry 5 times on connection failure
  reconnectDelay: 2000       // Wait 2 seconds between attempts
});
```

### Connection Security

For production environments, always use HTTPS:

```typescript
// ✅ Secure production configuration
const controller = new WebIntractMCPController({
  serverUrl: 'https://api.myapp.com',  // HTTPS required
  logLevel: LogLevel.WARN
});

// ❌ Insecure - only for development
const controller = new WebIntractMCPController({
  serverUrl: 'http://localhost:5000',  // HTTP only for development
  logLevel: LogLevel.DEBUG
});
```

## Validation and Health Monitoring

### Configuration Validation

The controller automatically validates configuration on initialization:

```typescript
try {
  await controller.initialize();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}

// Manual validation
const validation = controller.validateConfiguration();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
  console.warn('Configuration warnings:', validation.warnings);
}
```

### Health Monitoring

Monitor controller health for production applications:

```typescript
function monitorHealth() {
  const health = controller.getHealthStatus();
  
  if (!health.isHealthy) {
    console.error('Controller unhealthy:', {
      connectionStatus: health.connectionStatus,
      errors: health.errors,
      warnings: health.warnings
    });
  }
  
  console.log('Controller metrics:', {
    uptime: health.uptime,
    connected: health.signalrConnected,
    toolsLoaded: health.toolsLoaded
  });
}

// Check health every 30 seconds
setInterval(monitorHealth, 30000);
```

## Best Practices

### Development Environment

```typescript
const devController = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,           // Verbose logging
  serverUrl: 'http://localhost:5000', // Local server
  reconnectAttempts: 2,               // Quick failure for debugging
  reconnectDelay: 1000                // Fast reconnection
});
```

### Production Environment

```typescript
const prodController = new WebIntractMCPController({
  logLevel: LogLevel.WARN,            // Essential logs only
  serverUrl: 'https://api.myapp.com', // Secure HTTPS endpoint
  reconnectAttempts: 5,               // Resilient reconnection
  reconnectDelay: 2000                // Reasonable retry delay
});
```

### Testing Environment

```typescript
const testController = new WebIntractMCPController({
  logLevel: LogLevel.OFF,             // Silent for tests
  serverUrl: 'http://localhost:5001', // Test server
  reconnectAttempts: 1,               // No retries in tests
  reconnectDelay: 100                 // Fast failure
});
```

## Troubleshooting

### Common Configuration Issues

#### Invalid Server URL

```
Error: Invalid server URL format
```

**Solution**: Ensure the URL includes protocol (`http://` or `https://`)

```typescript
// ❌ Invalid
serverUrl: 'api.myapp.com'

// ✅ Valid
serverUrl: 'https://api.myapp.com'
```

#### Connection Timeout

```
Error: Connection timeout after 3 attempts
```

**Solution**: Increase reconnection attempts or check server availability

```typescript
const controller = new WebIntractMCPController({
  reconnectAttempts: 10,    // Increase attempts
  reconnectDelay: 3000      // Increase delay
});
```

#### Log Level Issues

```
Warning: Invalid log level
```

**Solution**: Use LogLevel enum values

```typescript
// ❌ Invalid
logLevel: 'debug'

// ✅ Valid
logLevel: LogLevel.DEBUG
```

### Debugging Configuration

Enable detailed logging to diagnose configuration issues:

```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.TRACE,  // Maximum verbosity
  serverUrl: 'https://api.myapp.com'
});

// Check configuration manually
const validation = controller.validateConfiguration();
console.log('Configuration validation:', validation);

const health = controller.getHealthStatus();
console.log('Health status:', health);
```

## Next Steps

- [API Reference](../api-reference) - Detailed API documentation
- [Server Configuration](./server-configuration) - Configure the MCP server
- [Tool Configuration](../tool-configuration) - Configure MCP tools
