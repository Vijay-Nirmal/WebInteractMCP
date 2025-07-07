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
    "Client": { /* Client configuration */ },
    "Tool": { /* Tool execution configuration */ },
    "Cors": { /* CORS configuration */ }
  }
}
```

## Client Configuration

Configuration for client web application communication.

| Setting | Environment Variable | Default | Type | Range/Options | Description |
|---------|---------------------|---------|------|---------------|-------------|
| `BaseUrl` | `McpIntract__Client__BaseUrl` | `http://localhost:4200` | string | Valid URL | The base URL of the client application |
| `ToolsEndpoint` | `McpIntract__Client__ToolsEndpoint` | `/mcp-tools.json` | string | Valid path | The endpoint path for fetching tools from the client |
| `TimeoutSeconds` | `McpIntract__Client__TimeoutSeconds` | `30` | integer | 1-300 | HTTP client timeout in seconds |
| `CacheTools` | `McpIntract__Client__CacheTools` | `true` | boolean | true/false | Whether to cache tools from the client |
| `CacheDurationMinutes` | `McpIntract__Client__CacheDurationMinutes` | `30` | integer | 1-1440 | Tool cache duration in minutes |

### Client Configuration Examples

**Development Configuration:**
```json
{
  "McpIntract": {
    "Client": {
      "BaseUrl": "http://localhost:4200",
      "ToolsEndpoint": "/mcp-tools.json",
      "TimeoutSeconds": 30,
      "CacheTools": true,
      "CacheDurationMinutes": 5
    }
  }
}
```

**Production Configuration:**
```json
{
  "McpIntract": {
    "Client": {
      "BaseUrl": "https://myapp.example.com",
      "ToolsEndpoint": "/api/mcp-tools",
      "TimeoutSeconds": 60,
      "CacheTools": true,
      "CacheDurationMinutes": 60
    }
  }
}
```

> **Important**: In production, always use HTTPS URLs for the `BaseUrl` to ensure secure communication.

## Tool Configuration

Configuration for tool execution behavior and error handling.

| Setting | Environment Variable | Default | Type | Range/Options | Description |
|---------|---------------------|---------|------|---------------|-------------|
| `TimeoutMinutes` | `McpIntract__Tool__TimeoutMinutes` | `5` | integer | 1-60 | Tool execution timeout in minutes |
| `EnableDetailedErrorLogging` | `McpIntract__Tool__EnableDetailedErrorLogging` | `false` | boolean | true/false | Whether to enable detailed error logging |

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

> **Note**: Enable detailed error logging only in development environments as it may expose sensitive information.

## CORS Configuration

Cross-Origin Resource Sharing (CORS) configuration for secure client access.

| Setting | Environment Variable | Default | Type | Range/Options | Description |
|---------|---------------------|---------|------|---------------|-------------|
| `AllowedOrigins` | `McpIntract__Cors__AllowedOrigins` | `["http://localhost:4200"]` | array | Valid URLs | Array of allowed origins for CORS |
| `AllowAnyOrigin` | `McpIntract__Cors__AllowAnyOrigin` | `false` | boolean | true/false | Whether to allow any origin (use with caution in production) |
| `AllowCredentials` | `McpIntract__Cors__AllowCredentials` | `true` | boolean | true/false | Whether to allow credentials |
| `AllowedHeaders` | `McpIntract__Cors__AllowedHeaders` | `[]` | array | Valid headers | Additional allowed headers |
| `AllowedMethods` | `McpIntract__Cors__AllowedMethods` | `[]` | array | HTTP methods | Additional allowed methods |

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
      "AllowCredentials": true,
      "AllowedHeaders": ["X-Custom-Header"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"]
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
      "AllowCredentials": true,
      "AllowedHeaders": [],
      "AllowedMethods": []
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
    "Client": {
      "BaseUrl": "http://localhost:4200",
      "CacheDurationMinutes": 5
    },
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
    "Client": {
      "BaseUrl": "https://your-production-client.com",
      "TimeoutSeconds": 60,
      "CacheDurationMinutes": 60
    },
    "Tool": {
      "TimeoutMinutes": 10,
      "EnableDetailedErrorLogging": false
    },
    "Cors": {
      "AllowedOrigins": ["https://your-production-client.com"],
      "AllowAnyOrigin": false,
      "AllowCredentials": true
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

### Client Configuration
```bash
McpIntract__Client__BaseUrl=https://myapp.example.com
McpIntract__Client__ToolsEndpoint=/api/mcp-tools
McpIntract__Client__TimeoutSeconds=60
McpIntract__Client__CacheTools=true
McpIntract__Client__CacheDurationMinutes=60
```

### Tool Configuration
```bash
McpIntract__Tool__TimeoutMinutes=10
McpIntract__Tool__EnableDetailedErrorLogging=false
```

### CORS Configuration Envs
```bash
McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com
McpIntract__Cors__AllowedOrigins__1=https://www.myapp.example.com
McpIntract__Cors__AllowAnyOrigin=false
McpIntract__Cors__AllowCredentials=true
```

## Docker Configuration

When running in Docker, set environment variables:

```bash
docker run -d \
  --name webintract-mcp-server \
  -p 8080:8080 \
  -e McpIntract__Client__BaseUrl=https://myapp.example.com \
  -e McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com \
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
  McpIntract__Client__BaseUrl: "https://myapp.example.com"
  McpIntract__Client__ToolsEndpoint: "/api/mcp-tools"
  McpIntract__Client__TimeoutSeconds: "60"
  McpIntract__Tool__TimeoutMinutes: "10"
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

### Invalid URL Format
```
Error: Invalid URL format in McpIntract:Client:BaseUrl
```
**Solution**: Ensure the URL includes the protocol (`http://` or `https://`)

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
3. **Set minimal timeout values appropriate for your use case**
4. **Disable detailed error logging in production**

### Performance
1. **Enable tool caching with appropriate duration**
2. **Set reasonable timeout values**
3. **Use specific CORS origins instead of wildcard**

### Monitoring
1. **Configure appropriate logging levels**
2. **Monitor timeout configurations**
3. **Track cache hit rates**

### Environment-Specific
1. **Use different cache durations for dev/prod**
2. **Enable detailed logging only in development**
3. **Use environment variables for deployment-specific values**

## Troubleshooting Configuration

### Common Issues

**CORS Errors:**
- Check `AllowedOrigins` matches your client URL exactly
- Ensure protocol (http/https) matches
- Verify port numbers if specified

**Connection Timeouts:**
- Increase `TimeoutSeconds` for slow networks
- Check firewall settings
- Verify client application is accessible

**Tool Execution Failures:**
- Increase `TimeoutMinutes` for long-running tools
- Enable `EnableDetailedErrorLogging` to diagnose issues
- Check tool configuration format

### Configuration Testing

Test your configuration:

```bash
# Test client connectivity
curl http://your-client-url/mcp-tools.json

# Test MCP server health
curl http://localhost:8080/health

# Test MCP capabilities
curl http://localhost:8080/mcp
```

## Next Steps

- [Deployment Guide](../deployment) - Learn how to deploy the server
- [Tool Configuration](../tool-configuration) - Configure MCP tools
- [Troubleshooting](../troubleshooting) - Resolve common issues
