---
title: "Server Configuration"
order: 2
category: "Configuration"
---

# Server Configuration

Configure WebIntract MCP Server via `appsettings.json` or environment variables.

## Complete Configuration Reference

| Environment Variable | JSON Path | Default | Type | Possible Values | Description |
|---------------------|-----------|---------|------|-----------------|-------------|
| `McpIntract__Tool__TimeoutMinutes` | `McpIntract.Tool.TimeoutMinutes` | `5` | integer | 1-60 | Tool execution timeout in minutes |
| `McpIntract__Tool__EnableDetailedErrorLogging` | `McpIntract.Tool.EnableDetailedErrorLogging` | `false` | boolean | true/false | Enable detailed error logging |
| `McpIntract__Cors__AllowedOrigins__0` | `McpIntract.Cors.AllowedOrigins[0]` | `http://localhost:4200` | string | Valid URLs | First allowed origin |
| `McpIntract__Cors__AllowedOrigins__N` | `McpIntract.Cors.AllowedOrigins[N]` | - | string | Valid URLs | Additional allowed origins (replace N with index) |
| `McpIntract__Cors__AllowAnyOrigin` | `McpIntract.Cors.AllowAnyOrigin` | `false` | boolean | true/false | Allow any origin (insecure for production) |
| `McpIntract__Cors__AllowedHeaders__0` | `McpIntract.Cors.AllowedHeaders[0]` | - | string | Valid headers | First additional allowed header |
| `McpIntract__Cors__AllowedHeaders__N` | `McpIntract.Cors.AllowedHeaders[N]` | - | string | Valid headers | Additional allowed headers (replace N with index) |

## Configuration Structure

```json
{
  "McpIntract": {
    "Tool": { /* Tool execution settings */ },
    "Cors": { /* CORS settings */ }
  }
}
```

## Tool Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `TimeoutMinutes` | `5` | Tool execution timeout (1-60 minutes) |
| `EnableDetailedErrorLogging` | `false` | Enable detailed error logging |

**Example:**
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

## CORS Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `AllowedOrigins` | `["http://localhost:4200"]` | Array of allowed origins |
| `AllowAnyOrigin` | `false` | Allow any origin (insecure for production) |
| `AllowedHeaders` | `[]` | Additional allowed headers |

**Example:**
```json
{
  "McpIntract": {
    "Cors": {
      "AllowedOrigins": ["https://myapp.com"],
      "AllowAnyOrigin": false
    }
  }
}
```

## Environment Variables

Use double underscores (`__`) for nested configuration:

```bash
# Tool configuration
McpIntract__Tool__TimeoutMinutes=10
McpIntract__Tool__EnableDetailedErrorLogging=false

# CORS configuration
McpIntract__Cors__AllowedOrigins__0=https://myapp.com
McpIntract__Cors__AllowAnyOrigin=false
```

## Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e McpIntract__Cors__AllowedOrigins__0=https://myapp.com \
  -e McpIntract__Tool__TimeoutMinutes=10 \
  webintract-mcp-server:latest
```

## Health Check

Built-in health endpoint: `/health` returns `200 OK` with "Healthy"

## Testing Configuration

```bash
# Test health
curl http://localhost:8080/health

# Test MCP capabilities
curl http://localhost:8080/mcp
```
