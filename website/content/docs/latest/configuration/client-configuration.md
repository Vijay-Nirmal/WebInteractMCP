---
title: "Client Configuration"
order: 1
category: "Configuration"
---

# Client Configuration

Configure the WebIntractMCP client library with essential options.

## Complete Configuration Reference

| Property | Type | Default | Possible Values | Description |
|----------|------|---------|-----------------|-------------|
| `logLevel` | `LogLevel` | `LogLevel.WARN` | TRACE(0), DEBUG(1), INFO(2), WARN(3), ERROR(4), FATAL(5), OFF(6) | Logging verbosity level |
| `serverUrl` | `string` | `'http://localhost:8080'` | Valid URLs (http/https) | MCP server endpoint URL |
| `enableVisualFeedback` | `boolean` | `true` | true/false | Enable visual feedback for automated actions |
| `transport.hubPath` | `string` | `'/mcptools'` | Valid paths | SignalR hub endpoint path |
| `transport.maxRetryAttempts` | `number` | `10` | 1-100 | Maximum connection retry attempts |
| `transport.baseRetryDelayMs` | `number` | `1000` | 100-30000 | Base retry delay in milliseconds |
| `transport.enableLogging` | `boolean` | `false` | true/false | Enable detailed SignalR logging |
| `transport.logLevel` | `LogLevel` | `LogLevel.INFO` | TRACE(0), DEBUG(1), INFO(2), WARN(3), ERROR(4), FATAL(5), OFF(6) | SignalR specific log level |
| `transport.transportTypes` | `TransportType` | `WebSockets \| ServerSentEvents \| LongPolling` | WebSockets(1), ServerSentEvents(2), LongPolling(4) | Allowed transport types (can be combined with \|) |

## WebIntractMCPOptions (Simplified View)

For quick reference, the main configuration properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logLevel` | `LogLevel` | `LogLevel.WARN` | Logging level |
| `serverUrl` | `string` | `'http://localhost:8080'` | MCP server URL |
| `enableVisualFeedback` | `boolean` | `true` | Enable visual feedback for actions |
| `transport` | `TransportOptions` | `undefined` | SignalR transport settings |

## Basic Setup

```typescript
import { WebIntractMCPController, LogLevel } from 'web-intract-mcp';

const controller = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,
  serverUrl: 'http://localhost:8080',
  enableVisualFeedback: true
});
```

## Environment Examples

**Development:**
```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.DEBUG,
  serverUrl: 'http://localhost:8080',
  enableVisualFeedback: true
});
```

**Production:**
```typescript
const controller = new WebIntractMCPController({
  logLevel: LogLevel.WARN,
  serverUrl: 'https://api.myapp.com',
  enableVisualFeedback: false
});
```

## Custom Shepherd.js Options

```typescript
const shepherdOptions = {
  useModalOverlay: false,
  defaultStepOptions: {
    arrow: false,
    buttons: [
      { text: 'Skip', action: () => tour.complete() },
      { text: 'Next', action: () => tour.next() }
    ]
  }
};

const controller = new WebIntractMCPController(
  { logLevel: LogLevel.INFO },
  shepherdOptions
);
```

## Initialization

```typescript
try {
  await controller.initialize();
  console.log('Controller ready');
} catch (error) {
  console.error('Initialization failed:', error);
}
```
