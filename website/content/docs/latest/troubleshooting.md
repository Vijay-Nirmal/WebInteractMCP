---
title: "Troubleshooting"
order: 6
category: "Help"
---

# Troubleshooting

Common issues and their solutions when working with WebIntractMCP.

## Installation Issues

### Cannot find module '@web-intract-mcp/client'

**Problem**: Getting module not found error when importing WebIntractMCP.

**Solution**:
1. Ensure the package is installed:
   ```bash
   npm install @web-intract-mcp/client
   ```

2. Check your import statement:
   ```typescript
   // Correct
   import { createWebIntractMCPController } from 'web-intract-mcp';
   
   // Incorrect
   import WebIntractMCP from 'web-intract-mcp';
   ```

3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript Declaration Issues

**Problem**: TypeScript cannot find type declarations.

**Solution**:
1. Ensure TypeScript is properly configured
2. Add to your `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

## Connection Issues

### Cannot connect to MCP server

**Problem**: Connection fails with timeout or network error.

**Solutions**:

1. **Check server URL**:
   ```typescript
   const controller = createWebIntractMCPController({
     serverUrl: 'http://localhost:8080' // Verify this is correct
   });
   ```

2. **Verify server is running**:
   ```bash
   # Check if server is running
   curl http://localhost:8080/health
   
   # Or start the server
   cd server/WebIntractMCPServer
   dotnet run
   ```

3. **Check CORS configuration**:
   - Ensure your web app's domain is allowed in the server's CORS settings
   - For development, temporarily allow all origins (not for production)

4. **Firewall/Network issues**:
   - Check if port 8080 is blocked
   - Try a different port
   - Verify network connectivity

### Connection drops frequently

**Problem**: WebSocket connections are unstable.

**Solutions**:

1. **Increase reconnection attempts**:
   ```typescript
   const controller = createWebIntractMCPController({
     reconnectAttempts: 5,
     reconnectDelay: 2000
   });
   ```

2. **Check network stability**
3. **Use connection event handlers**:
   ```typescript
   controller.on('connectionStateChanged', (state) => {
     console.log('Connection state:', state);
     if (state === 'disconnected') {
       // Handle disconnection
     }
   });
   ```

## Tool Configuration Issues

### Tools not loading

**Problem**: `loadTools()` fails or returns empty array.

**Solutions**:

1. **Check file path**:
   ```typescript
   // Ensure the path is correct relative to your public directory
   await controller.loadTools('/mcp-tools.json');
   ```

2. **Verify JSON syntax**:
   - Use a JSON validator to check your tools file
   - Common issues: trailing commas, unescaped quotes

3. **Check file permissions**:
   - Ensure the tools file is accessible
   - For development, place in `public/` directory

4. **Enable logging for debugging**:
   ```typescript
   const controller = createWebIntractMCPController({
     enableLogging: true
   });
   ```

### Invalid tool configuration

**Problem**: Tools fail validation during loading.

**Solution**: Check your tool configuration against the schema:

```json
{
  "toolId": "required-string",
  "title": "required-string", 
  "description": "required-string",
  "mode": "silent|guided|interactive",
  "steps": [
    {
      "targetElement": "required-css-selector",
      "action": {
        "type": "required-action-type",
        "element": "required-css-selector"
      }
    }
  ]
}
```

## Tool Execution Issues

### Element not found

**Problem**: Tool fails with "Element not found" error.

**Solutions**:

1. **Verify CSS selectors**:
   ```json
   {
     "targetElement": "#button-id", // Use browser dev tools to verify
     "action": { "type": "click", "element": "#button-id" }
   }
   ```

2. **Add wait conditions**:
   ```json
   {
     "action": {
       "type": "click",
       "element": "#dynamic-button",
       "options": {
         "waitForElement": true,
         "timeout": 5000
       }
     }
   }
   ```

3. **Use more specific selectors**:
   ```json
   // Better - more specific
   "targetElement": "[data-testid='submit-button']"
   
   // Avoid - too generic
   "targetElement": ".btn"
   ```

### Tool execution timeout

**Problem**: Tools timeout before completing.

**Solutions**:

1. **Increase timeout values**:
   ```json
   {
     "action": {
       "type": "wait",
       "element": "#slow-loading-element",
       "options": {
         "timeout": 10000
       }
     }
   }
   ```

2. **Break down complex tools**:
   - Split long tools into smaller, focused tools
   - Add intermediate validation steps

3. **Optimize selectors**:
   - Use ID selectors when possible
   - Avoid complex CSS selectors

### Validation failures

**Problem**: Tool steps fail validation checks.

**Solutions**:

1. **Debug validation**:
   ```json
   {
     "validation": {
       "type": "text",
       "expected": "Success", // Check exact text
       "errorMessage": "Custom error message for debugging"
     }
   }
   ```

2. **Use appropriate validation types**:
   ```json
   // For checking element exists
   { "type": "exists", "expected": true }
   
   // For checking text content
   { "type": "text", "expected": "Expected text" }
   
   // For checking element visibility
   { "type": "visible", "expected": true }
   ```

## Framework-Specific Issues

### React Issues

**Problem**: React components re-render causing tool failures.

**Solution**:
```typescript
import { useEffect, useRef } from 'react';

function MyComponent() {
  const controllerRef = useRef(null);
  
  useEffect(() => {
    // Initialize once
    const initMCP = async () => {
      if (!controllerRef.current) {
        controllerRef.current = createWebIntractMCPController();
        await controllerRef.current.loadTools('/mcp-tools.json');
        await controllerRef.current.createSession();
      }
    };
    
    initMCP();
    
    // Cleanup on unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array
}
```

### Angular Issues

**Problem**: Angular routing interferes with tool execution.

**Solution**:
```typescript
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class McpService {
  constructor(private router: Router) {
    // Reinitialize tools after navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.reinitializeTools();
    });
  }
  
  private async reinitializeTools() {
    await this.controller.loadTools('/assets/mcp-tools.json');
  }
}
```

### Vue Issues

**Problem**: Vue reactivity interferes with MCP operations.

**Solution**:
```vue
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const controller = ref(null);

onMounted(async () => {
  await nextTick(); // Wait for DOM to be ready
  controller.value = createWebIntractMCPController();
  await controller.value.loadTools('/mcp-tools.json');
  await controller.value.createSession();
});
</script>
```

## Performance Issues

### Slow tool execution

**Problem**: Tools take too long to execute.

**Solutions**:

1. **Optimize selectors**:
   ```json
   // Fast - ID selector
   "#unique-id"
   
   // Slower - class selector
   ".some-class"
   
   // Slowest - complex selector
   "div > .container .item:nth-child(2)"
   ```

2. **Reduce wait times**:
   ```json
   {
     "action": {
       "type": "type",
       "element": "#input",
       "value": "text",
       "options": {
         "typeDelay": 50 // Reduce from default 100ms
       }
     }
   }
   ```

3. **Use efficient validation**:
   ```json
   // Fast
   { "type": "exists" }
   
   // Slower
   { "type": "text", "expected": "specific text" }
   ```

### Memory leaks

**Problem**: Application memory usage grows over time.

**Solutions**:

1. **Properly disconnect controllers**:
   ```typescript
   // Always call disconnect when done
   await controller.disconnect();
   ```

2. **Remove event listeners**:
   ```typescript
   controller.off('toolExecutionCompleted', handler);
   ```

3. **Avoid creating multiple controllers**:
   ```typescript
   // Create once, reuse
   const globalController = createWebIntractMCPController();
   ```

## Browser Compatibility Issues

### Tool execution fails in specific browsers

**Problem**: Tools work in some browsers but not others.

**Solutions**:

1. **Check browser support**:
   - WebIntractMCP requires modern browsers with WebSocket support
   - Test in target browsers

2. **Use browser-specific selectors**:
   ```json
   {
     "targetElement": "input[type='email']", // More compatible
     "action": { "type": "type", "element": "input[type='email']", "value": "test@example.com" }
   }
   ```

3. **Add browser detection**:
   ```typescript
   if (!window.WebSocket) {
     console.error('WebSocket not supported');
     // Provide fallback or error message
   }
   ```

## Security Issues

### CORS errors

**Problem**: Browser blocks requests due to CORS policy.

**Solutions**:

1. **Configure server CORS**:
   ```json
   {
     "cors": {
       "origins": ["https://yourdomain.com"],
       "credentials": true
     }
   }
   ```

2. **For development only**:
   ```bash
   # Start Chrome with disabled security (development only!)
   chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
   ```

### Content Security Policy (CSP) issues

**Problem**: CSP headers block WebSocket connections.

**Solution**: Update your CSP to allow WebSocket connections:
```html
<meta http-equiv="Content-Security-Policy" 
      content="connect-src 'self' ws://localhost:8080 wss://your-mcp-server.com">
```

## Debugging Tips

### Enable debug logging

```typescript
const controller = createWebIntractMCPController({
  enableLogging: true,
  logLevel: 'debug'
});
```

### Use browser developer tools

1. **Network tab**: Check WebSocket connections
2. **Console**: Look for error messages
3. **Elements tab**: Verify selectors match elements

### Add custom logging

```typescript
controller.on('stepExecuted', (result) => {
  console.log('Step completed:', result);
});

controller.on('toolExecutionCompleted', (result) => {
  console.log('Tool completed:', result);
});
```

### Test tools individually

```typescript
// Test individual tools
await controller.executeTool('single-tool-id');
```

## Getting Help

If you're still experiencing issues:

1. **Check the documentation**: Review the [API Reference](./api-reference) and [Examples](./examples)
2. **Search existing issues**: Look through [GitHub Issues](https://github.com/Vijay-Nirmal/WebIntractMCP/issues)
3. **Create a minimal reproduction**: Isolate the problem to the smallest possible example
4. **Join the community**: Participate in [GitHub Discussions](https://github.com/Vijay-Nirmal/WebIntractMCP/discussions)
5. **Contact support**: Reach out via [email](mailto:me@vijaynirmal.com)

When reporting issues, please include:
- WebIntractMCP version
- Browser and version
- Framework and version (React, Angular, etc.)
- Minimal code example
- Error messages
- Steps to reproduce
