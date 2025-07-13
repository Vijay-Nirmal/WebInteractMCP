---
title: "Configuration Reference"
order: 2
category: "Configuration"
---

# Configuration Reference

WebIntract MCP Server uses comprehensive configuration options to control its behavior. All settings can be configured through `appsettings.json` or environment variables.

## Configuration Structure

The server uses the `McpIntract` section in `appsettings.json` for all configuration:

```json
{
  "McpIntract": {
    "Client": { /* Reserved for future client-specific settings */ },
    "Tool": { /* Tool execution configuration */ },
    "Cors": { /* CORS configuration */ }
  }
}
```

> **Note**: As of version 1.0, the server uses **SignalR for tool discovery** instead of HTTP requests. The `Client` section is reserved for future extensions but currently unused.

## Architecture Overview

WebIntract MCP Server uses **SignalR for real-time tool discovery and execution**:

1. **Tool Discovery**: Client sends tools via SignalR `GetTools` method
2. **Tool Execution**: Server invokes tools through SignalR `InvokeTool` method  
3. **Session Management**: Each SignalR connection represents a unique session

This eliminates the need for HTTP-based tool discovery and provides better performance and real-time capabilities.

## Client Configuration

**Important**: The `Client` configuration section is **reserved for future use**. Tool discovery is now handled through SignalR connections.

> **Migration Note**: If you're upgrading from a previous version that used HTTP-based tool discovery, you can safely remove all `Client` configuration properties.

## Tool Configuration

Configuration for tool execution behavior and error handling.

| Setting | Environment Variable | Default | Type | Range/Options | Description |
|---------|---------------------|---------|------|---------------|-------------|
| `TimeoutMinutes` | `McpIntract__Tool__TimeoutMinutes` | `5` | integer | 1-60 | Tool execution and discovery timeout in minutes |
| `EnableDetailedErrorLogging` | `McpIntract__Tool__EnableDetailedErrorLogging` | `false` | boolean | true/false | Whether to enable detailed error logging |

> **Note**: The `TimeoutMinutes` setting applies to both tool execution and SignalR-based tool discovery operations.

### Tool Configuration Examples

**Development Configuration:**
```json
{
  "McpIntract": {
    "Tool": {
      "TimeoutMinutes": 2,
      "EnableDetailedErrorLogging": true
    }
  }
}
```

**Production Configuration:**
```json
{
  "McpIntract": {
    "Tool": {
      "TimeoutMinutes": 10,
      "EnableDetailedErrorLogging": false
    }
  }
}
```

> **Critical Error Handling**: If a client doesn't respond to a tool discovery request within the timeout period, the server logs a **critical error** and throws an `InvalidOperationException`.

## CORS Configuration

Cross-Origin Resource Sharing (CORS) configuration for secure client access and SignalR connections.

| Setting | Environment Variable | Default | Type | Range/Options | Description |
|---------|---------------------|---------|------|---------------|-------------|
| `AllowedOrigins` | `McpIntract__Cors__AllowedOrigins` | `["http://localhost:4200"]` | array | Valid URLs | Array of allowed origins for CORS and SignalR |
| `AllowAnyOrigin` | `McpIntract__Cors__AllowAnyOrigin` | `false` | boolean | true/false | Whether to allow any origin (use with caution in production) |
| `AllowedHeaders` | `McpIntract__Cors__AllowedHeaders` | `[]` | array | Valid headers | Additional allowed headers |

### CORS Configuration Examples

**Development Configuration:**
```json
{
  "McpIntract": {
    "Cors": {
      "AllowedOrigins": [
        "http://localhost:4200",
        "http://localhost:3000",
        "https://localhost:5001"
      ],
      "AllowAnyOrigin": false,
      "AllowedHeaders": ["X-Custom-Header"]
    }
  }
}
```

**Production Configuration:**
```json
{
  "McpIntract": {
    "Cors": {
      "AllowedOrigins": [
        "https://myapp.example.com",
        "https://www.myapp.example.com"
      ],
      "AllowAnyOrigin": false,
      "AllowedHeaders": []
    }
  }
}
```

> **Warning**: Never set `AllowAnyOrigin` to `true` in production environments as it poses a security risk.

## Environment-Specific Configuration

### Development Environment

For development, create `appsettings.Development.json`:

```json
{
  "McpIntract": {
    "Tool": {
      "TimeoutMinutes": 2,
      "EnableDetailedErrorLogging": true
    },
    "Cors": {
      "AllowedOrigins": [
        "http://localhost:4200",
        "http://localhost:3000"
      ]
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "WebIntractMCPServer": "Information"
    }
  }
}
```

### Production Environment

For production, ensure these settings in `appsettings.Production.json`:

```json
{
  "McpIntract": {
    "Tool": {
      "TimeoutMinutes": 10,
      "EnableDetailedErrorLogging": false
    },
    "Cors": {
      "AllowedOrigins": ["https://your-production-client.com"],
      "AllowAnyOrigin": false,
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "WebIntractMCPServer": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## Environment Variables

All configuration can be overridden using environment variables. Use double underscores (`__`) to separate nested configuration levels:

### Tool Configuration
```bash
McpIntract__Tool__TimeoutMinutes=10
McpIntract__Tool__EnableDetailedErrorLogging=false
```

### CORS Configuration
```bash
McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com
McpIntract__Cors__AllowedOrigins__1=https://www.myapp.example.com
McpIntract__Cors__AllowAnyOrigin=false
```

## Docker Configuration

When running in Docker, set environment variables:

```bash
docker run -d \
  --name webintract-mcp-server \
  -p 8080:8080 \
  -e McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com \
  -e McpIntract__Tool__TimeoutMinutes=10 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  webintract-mcp-server:latest
```

## Kubernetes Configuration

Use ConfigMaps and Secrets for Kubernetes deployments:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webintract-mcp-config
data:
  McpIntract__Tool__TimeoutMinutes: "10"
  McpIntract__Tool__EnableDetailedErrorLogging: "false"
  McpIntract__SignalR__EnableDetailedErrors: "false"
  McpIntract__Cors__AllowedOrigins__0: "https://myapp.example.com"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webintract-mcp-server
spec:
  template:
    spec:
      containers:
      - name: webintract-mcp-server
        image: webintract-mcp-server:latest
        envFrom:
        - configMapRef:
            name: webintract-mcp-config
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
```

## Configuration Validation

The server validates configuration on startup. Common validation errors:

### Invalid Timeout Values
```
Error: McpIntract:Tool:TimeoutMinutes must be between 1 and 60
```
**Solution**: Set timeout values within the allowed range

### Missing Required Origins
```
Error: At least one origin must be specified in McpIntract:Cors:AllowedOrigins
```
**Solution**: Specify at least one allowed origin or set `AllowAnyOrigin` to `true` (not recommended for production)

## Configuration Best Practices

### Security
1. **Never use `AllowAnyOrigin: true` in production**
2. **Always use HTTPS URLs in production**
3. **Set `EnableDetailedErrors: false` in production**
4. **Disable detailed error logging in production**

### Performance
1. **Configure appropriate SignalR timeout values**
2. **Set reasonable tool execution timeouts**
3. **Use specific CORS origins instead of wildcard**

### Monitoring
1. **Configure appropriate logging levels**
2. **Monitor SignalR connection metrics**
3. **Track tool execution performance**

### Environment-Specific
1. **Use different timeout durations for dev/prod**
2. **Enable detailed SignalR errors only in development**
3. **Use environment variables for deployment-specific values**

## Troubleshooting Configuration

### Common Issues

**CORS Errors:**
- Check `AllowedOrigins` matches your client URL exactly
- Ensure protocol (http/https) matches
- Verify port numbers if specified

**SignalR Connection Issues:**
- Increase `ClientTimeoutInterval` for slow networks
- Check firewall settings for WebSocket traffic
- Verify SignalR hub endpoint is accessible
- Check for proxy/load balancer WebSocket support

**Tool Execution Failures:**
- Increase `TimeoutMinutes` for long-running tools
- Enable `EnableDetailedErrorLogging` to diagnose issues
- Check SignalR connection stability
- Verify client is properly responding to GetTools requests

### Configuration Testing

Test your configuration:

```bash
# Test MCP server health
curl http://localhost:8080/health

# Test MCP capabilities  
curl http://localhost:8080/mcp

# Test SignalR hub (should return 404 for GET, but confirms endpoint exists)
curl http://localhost:8080/mcp-tools-hub
```

**SignalR Connection Testing:**
Use browser developer tools to verify WebSocket connections to `/mcp-tools-hub`

## Next Steps

- [Deployment Guide](../deployment) - Learn how to deploy the server
- [Tool Configuration](../tool-configuration) - Configure MCP tools
- [Troubleshooting](../troubleshooting) - Resolve common issues
