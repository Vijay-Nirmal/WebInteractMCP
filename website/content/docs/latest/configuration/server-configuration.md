---
title: "Server Configuration"
order: 2
category: "Configuration"
---

# Server Configuration

Configure WebInteract MCP Server via `appsettings.json` or environment variables.

## Complete Configuration Reference

| Environment Variable | JSON Path | Default | Type | Possible Values | Description |
|---------------------|-----------|---------|------|-----------------|-------------|
| `McpInteract__Tool__TimeoutMinutes` | `McpInteract.Tool.TimeoutMinutes` | `5` | integer | 1-60 | Tool execution timeout in minutes |
| `McpInteract__Tool__EnableDetailedErrorLogging` | `McpInteract.Tool.EnableDetailedErrorLogging` | `false` | boolean | true/false | Enable detailed error logging |
| `McpInteract__Cors__AllowedOrigins__0` | `McpInteract.Cors.AllowedOrigins[0]` | `http://localhost:4200` | string | Valid URLs | First allowed origin |
| `McpInteract__Cors__AllowedOrigins__N` | `McpInteract.Cors.AllowedOrigins[N]` | - | string | Valid URLs | Additional allowed origins (replace N with index) |
| `McpInteract__Cors__AllowAnyOrigin` | `McpInteract.Cors.AllowAnyOrigin` | `false` | boolean | true/false | Allow any origin (insecure for production) |
| `McpInteract__Cors__AllowedHeaders__0` | `McpInteract.Cors.AllowedHeaders[0]` | - | string | Valid headers | First additional allowed header |
| `McpInteract__Cors__AllowedHeaders__N` | `McpInteract.Cors.AllowedHeaders[N]` | - | string | Valid headers | Additional allowed headers (replace N with index) |

## Configuration Structure

```json
{
  "McpInteract": {
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
  "McpInteract": {
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
  "McpInteract": {
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
McpInteract__Tool__TimeoutMinutes=10
McpInteract__Tool__EnableDetailedErrorLogging=false

# CORS configuration
McpInteract__Cors__AllowedOrigins__0=https://myapp.com
McpInteract__Cors__AllowAnyOrigin=false
```

## Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e McpInteract__Cors__AllowedOrigins__0=https://myapp.com \
  -e McpInteract__Tool__TimeoutMinutes=10 \
  webinteract-mcp-server:latest
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
