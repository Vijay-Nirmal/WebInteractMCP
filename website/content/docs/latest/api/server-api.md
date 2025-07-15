---
title: "Server API Reference"
order: 2
category: "API Reference"
---

# Server API Reference

Complete REST API and SignalR hub reference for the WebInteract MCP Server, including endpoints, request/response formats, and integration patterns.

## Base URL

All API endpoints are relative to your server's base URL:

```
https://your-mcp-server.com/api
```

## Authentication

The server supports multiple authentication methods:

### Bearer Token
```http
Authorization: Bearer <your-jwt-token>
```

### API Key
```http
X-API-Key: <your-api-key>
```

### Basic Authentication
```http
Authorization: Basic <base64(username:password)>
```

## REST API Endpoints

### Health Check

Check server health and status.

#### `GET /health`

**Response:**
```json
{
  "status": "Healthy" | "Degraded" | "Unhealthy",
  "timestamp": "2024-01-07T10:30:00Z",
  "version": "1.0.0",
  "uptime": "2d 14h 30m",
  "details": {
    "database": "Healthy",
    "signalr": "Healthy",
    "memory": {
      "used": 256,
      "total": 512,
      "unit": "MB"
    },
    "activeConnections": 42
  }
}
```

**Status Codes:**
- `200` - Server is healthy
- `503` - Server is unhealthy

### Tools Management

#### `GET /api/mcp-tools`

Get list of available MCP tools.

**Query Parameters:**
- `category` (optional) - Filter by tool category
- `search` (optional) - Search tool names and descriptions
- `limit` (optional) - Maximum number of tools to return
- `offset` (optional) - Number of tools to skip

**Example Request:**
```http
GET /api/mcp-tools?category=web&limit=10&offset=0
```

**Response:**
```json
[
  {
    "name": "web_search",
    "description": "Search the web for information",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query",
          "minLength": 1,
          "maxLength": 500
        },
        "max_results": {
          "type": "integer",
          "description": "Maximum number of results",
          "minimum": 1,
          "maximum": 50,
          "default": 10
        }
      },
      "required": ["query"]
    },
    "metadata": {
      "category": "web",
      "version": "1.0.0",
      "author": "WebInteract",
      "tags": ["search", "web", "information"]
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `401` - Unauthorized
- `500` - Server error

#### `GET /api/mcp-tools/{toolName}`

Get details for a specific tool.

**Path Parameters:**
- `toolName` - Name of the tool

**Response:**
```json
{
  "name": "web_search",
  "description": "Search the web for information",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      }
    },
    "required": ["query"]
  },
  "metadata": {
    "category": "web",
    "version": "1.0.0",
    "usage": {
      "totalCalls": 1234,
      "avgExecutionTime": 850,
      "lastUsed": "2024-01-07T10:25:00Z"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Tool not found
- `401` - Unauthorized
- `500` - Server error

### Tool Execution

#### `POST /api/mcp-tools/call`

Execute an MCP tool.

**Request Body:**
```json
{
  "name": "web_search",
  "arguments": {
    "query": "TypeScript best practices",
    "max_results": 5
  },
  "metadata": {
    "requestId": "req_1234567890",
    "timeout": 30000,
    "priority": "high"
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "json",
      "data": {
        "results": [
          {
            "title": "TypeScript Best Practices",
            "url": "https://example.com/typescript-best-practices",
            "snippet": "Learn the best practices for TypeScript development...",
            "relevance": 0.95
          }
        ],
        "totalResults": 1250000,
        "searchTime": 0.234
      }
    }
  ],
  "isError": false,
  "metadata": {
    "executionTime": 1234,
    "requestId": "req_1234567890",
    "toolVersion": "1.0.0",
    "cacheHit": false,
    "timestamp": "2024-01-07T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Invalid search query: Query cannot be empty"
    }
  ],
  "isError": true,
  "metadata": {
    "executionTime": 45,
    "requestId": "req_1234567890",
    "errorCode": "INVALID_ARGUMENTS",
    "timestamp": "2024-01-07T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Success (check `isError` field for tool-level errors)
- `400` - Invalid request format
- `401` - Unauthorized
- `404` - Tool not found
- `408` - Request timeout
- `429` - Rate limit exceeded
- `500` - Server error

#### `POST /api/mcp-tools/validate`

Validate tool arguments without execution.

**Request Body:**
```json
{
  "name": "web_search",
  "arguments": {
    "query": "",
    "max_results": 100
  }
}
```

**Response:**
```json
{
  "isValid": false,
  "errors": [
    {
      "path": "query",
      "message": "String cannot be empty",
      "expected": "non-empty string",
      "actual": ""
    }
  ],
  "warnings": [
    {
      "path": "max_results",
      "message": "Value exceeds recommended limit of 50"
    }
  ]
}
```

**Status Codes:**
- `200` - Validation completed
- `400` - Invalid request format
- `404` - Tool not found

### Batch Operations

#### `POST /api/mcp-tools/batch`

Execute multiple tools in a single request.

**Request Body:**
```json
{
  "requests": [
    {
      "name": "web_search",
      "arguments": {
        "query": "TypeScript"
      }
    },
    {
      "name": "file_read",
      "arguments": {
        "path": "/tmp/data.txt"
      }
    }
  ],
  "options": {
    "mode": "parallel",
    "continueOnError": true,
    "timeout": 60000
  }
}
```

**Response:**
```json
{
  "responses": [
    {
      "content": [
        {
          "type": "json",
          "data": {
            "results": ["..."]
          }
        }
      ],
      "isError": false
    },
    {
      "content": [
        {
          "type": "text",
          "text": "File not found: /tmp/data.txt"
        }
      ],
      "isError": true
    }
  ],
  "metadata": {
    "totalTime": 2340,
    "successCount": 1,
    "errorCount": 1,
    "completedCount": 2
  }
}
```

### Analytics and Metrics

#### `GET /api/analytics/tools`

Get tool usage analytics.

**Query Parameters:**
- `period` - Time period (`hour`, `day`, `week`, `month`)
- `start` - Start date (ISO 8601)
- `end` - End date (ISO 8601)
- `tool` - Specific tool name (optional)

**Response:**
```json
{
  "period": "day",
  "start": "2024-01-01T00:00:00Z",
  "end": "2024-01-07T23:59:59Z",
  "metrics": {
    "totalCalls": 5234,
    "uniqueTools": 45,
    "avgExecutionTime": 1250,
    "errorRate": 0.023
  },
  "toolUsage": [
    {
      "name": "web_search",
      "calls": 1234,
      "avgExecutionTime": 890,
      "errorRate": 0.012
    }
  ],
  "timeline": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "calls": 234,
      "errors": 3
    }
  ]
}
```

#### `GET /api/analytics/performance`

Get server performance metrics.

**Response:**
```json
{
  "timestamp": "2024-01-07T10:30:00Z",
  "cpu": {
    "usage": 45.7,
    "cores": 8
  },
  "memory": {
    "used": 256,
    "total": 512,
    "percentage": 50.0
  },
  "connections": {
    "active": 42,
    "total": 1234,
    "peak": 89
  },
  "requestMetrics": {
    "requestsPerSecond": 12.5,
    "avgResponseTime": 245,
    "errorRate": 0.015
  }
}
```

## SignalR Hub

### Connection

Connect to the SignalR hub at `/mcpToolsHub`.

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/mcpToolsHub")
  .build();

await connection.start();
```

### Server Methods

Methods you can call on the server:

#### `CallMcpTool(request)`

Execute an MCP tool via SignalR.

**Parameters:**
```javascript
const request = {
  name: "web_search",
  arguments: {
    query: "TypeScript best practices"
  },
  metadata: {
    requestId: "req_1234567890"
  }
};

await connection.invoke("CallMcpTool", request);
```

#### `JoinGroup(groupName)`

Join a specific group for targeted broadcasts.

```javascript
await connection.invoke("JoinGroup", "analytics");
```

#### `LeaveGroup(groupName)`

Leave a group.

```javascript
await connection.invoke("LeaveGroup", "analytics");
```

#### `GetConnectionInfo()`

Get information about your connection.

```javascript
const info = await connection.invoke("GetConnectionInfo");
// Returns: { connectionId: "abc123", groups: ["analytics"], connectedAt: "2024-01-07T10:30:00Z" }
```

### Client Methods

Methods the server can call on your client:

#### `ToolCallResponse(response)`

Receive tool execution results.

```javascript
connection.on("ToolCallResponse", (response) => {
  console.log("Tool response:", response);
  // Response format same as REST API
});
```

#### `ToolCallProgress(progress)`

Receive progress updates for long-running tools.

```javascript
connection.on("ToolCallProgress", (progress) => {
  console.log("Progress:", progress);
  // { requestId: "req_123", percentage: 45, message: "Processing..." }
});
```

#### `ToolsUpdated(tools)`

Receive notifications when available tools change.

```javascript
connection.on("ToolsUpdated", (tools) => {
  console.log("Tools updated:", tools.length);
});
```

#### `ServerNotification(notification)`

Receive server notifications.

```javascript
connection.on("ServerNotification", (notification) => {
  console.log("Notification:", notification);
  // { type: "info|warning|error", message: "...", timestamp: "..." }
});
```

#### `MetricsUpdate(metrics)`

Receive real-time metrics updates (if subscribed to analytics group).

```javascript
connection.on("MetricsUpdate", (metrics) => {
  console.log("Metrics:", metrics);
  // Real-time performance and usage metrics
});
```

### Connection Lifecycle

```javascript
connection.onclose((error) => {
  console.log("Connection closed:", error);
});

connection.onreconnecting((error) => {
  console.log("Reconnecting:", error);
});

connection.onreconnected((connectionId) => {
  console.log("Reconnected with ID:", connectionId);
});
```

## WebSocket API

For applications that prefer WebSocket over SignalR:

### Connection

```javascript
const ws = new WebSocket('wss://your-server.com/ws/mcp-tools');
```

### Message Format

All messages use JSON format:

```json
{
  "type": "request|response|notification",
  "id": "unique-message-id",
  "timestamp": "2024-01-07T10:30:00Z",
  "data": {
    // Message-specific data
  }
}
```

### Request Types

#### Tool Call Request
```json
{
  "type": "request",
  "id": "req_123",
  "data": {
    "action": "callTool",
    "payload": {
      "name": "web_search",
      "arguments": {
        "query": "TypeScript"
      }
    }
  }
}
```

#### Get Tools Request
```json
{
  "type": "request",
  "id": "req_124",
  "data": {
    "action": "getTools",
    "payload": {
      "category": "web"
    }
  }
}
```

### Response Types

#### Tool Call Response
```json
{
  "type": "response",
  "id": "req_123",
  "data": {
    "success": true,
    "payload": {
      "content": [...],
      "isError": false,
      "metadata": {...}
    }
  }
}
```

#### Error Response
```json
{
  "type": "response",
  "id": "req_123",
  "data": {
    "success": false,
    "error": {
      "code": "TOOL_NOT_FOUND",
      "message": "Tool 'invalid_tool' not found"
    }
  }
}
```

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 408 | Request Timeout | Request took too long |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server temporarily unavailable |

### Tool Error Codes

| Code | Description |
|------|-------------|
| `TOOL_NOT_FOUND` | Requested tool does not exist |
| `INVALID_ARGUMENTS` | Tool arguments validation failed |
| `EXECUTION_TIMEOUT` | Tool execution exceeded timeout |
| `EXECUTION_ERROR` | Tool execution failed |
| `RESOURCE_UNAVAILABLE` | Required resource not available |
| `RATE_LIMITED` | Tool usage rate limit exceeded |
| `PERMISSION_DENIED` | Insufficient permissions for tool |

## Rate Limiting

The server implements rate limiting to ensure fair usage:

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1704628800
X-RateLimit-Window: 3600
```

### Limits

Default rate limits (configurable):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/mcp-tools` | 100 requests | 1 hour |
| `/api/mcp-tools/call` | 1000 requests | 1 hour |
| `/api/mcp-tools/batch` | 50 requests | 1 hour |
| SignalR connections | 10 per IP | 1 minute |

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "details": {
      "limit": 1000,
      "window": 3600,
      "resetAt": "2024-01-07T11:00:00Z"
    }
  }
}
```

## Configuration API

For administrators to manage server configuration:

### `GET /api/admin/config`

Get current server configuration.

**Requires:** Admin authentication

**Response:**
```json
{
  "mcpInteract": {
    "client": {
      "baseUrl": "http://localhost:4200",
      "timeoutSeconds": 30
    },
    "tool": {
      "timeoutMinutes": 10,
      "enableDetailedErrorLogging": false
    },
    "cors": {
      "allowedOrigins": ["http://localhost:4200"]
    }
  },
  "logging": {
    "logLevel": {
      "default": "Information"
    }
  }
}
```

### `PUT /api/admin/config`

Update server configuration.

**Requires:** Admin authentication

**Request Body:**
```json
{
  "mcpInteract": {
    "tool": {
      "timeoutMinutes": 15
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "restartRequired": false
}
```

### `POST /api/admin/tools/reload`

Reload available tools from sources.

**Requires:** Admin authentication

**Response:**
```json
{
  "success": true,
  "message": "Tools reloaded successfully",
  "toolsCount": 42,
  "newTools": 3,
  "updatedTools": 1,
  "removedTools": 0
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';

class McpServerClient {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.http = axios.create({
      baseURL: `${baseUrl}/api`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getTools() {
    const response = await this.http.get('/mcp-tools');
    return response.data;
  }

  async callTool(name, arguments) {
    const response = await this.http.post('/mcp-tools/call', {
      name,
      arguments
    });
    return response.data;
  }

  async connectSignalR() {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/mcpToolsHub`, {
        accessTokenFactory: () => this.authToken
      })
      .build();

    await this.connection.start();
    
    this.connection.on('ToolCallResponse', (response) => {
      this.onToolResponse?.(response);
    });
  }
}
```

### Python

```python
import asyncio
import aiohttp
import signalrcore

class McpServerClient:
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.auth_token = auth_token
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_tools(self):
        async with self.session.get(f'{self.base_url}/api/mcp-tools') as response:
            return await response.json()
    
    async def call_tool(self, name: str, arguments: dict):
        data = {'name': name, 'arguments': arguments}
        async with self.session.post(f'{self.base_url}/api/mcp-tools/call', json=data) as response:
            return await response.json()

# Usage
async def main():
    async with McpServerClient('http://localhost:8080', 'your-token') as client:
        tools = await client.get_tools()
        result = await client.call_tool('web_search', {'query': 'Python async'})
        print(result)
```

### C#

```csharp
using Microsoft.AspNetCore.SignalR.Client;
using System.Text.Json;

public class McpServerClient : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private HubConnection? _hubConnection;

    public McpServerClient(string baseUrl, string authToken)
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
    }

    public async Task<McpTool[]> GetToolsAsync()
    {
        var response = await _httpClient.GetStringAsync($"{_baseUrl}/api/mcp-tools");
        return JsonSerializer.Deserialize<McpTool[]>(response);
    }

    public async Task<ToolCallResponse> CallToolAsync(string name, object arguments)
    {
        var request = new { name, arguments };
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync($"{_baseUrl}/api/mcp-tools/call", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonSerializer.Deserialize<ToolCallResponse>(responseJson);
    }

    public async Task ConnectSignalRAsync()
    {
        _hubConnection = new HubConnectionBuilder()
            .WithUrl($"{_baseUrl}/mcpToolsHub", options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_authToken);
            })
            .Build();

        _hubConnection.On<ToolCallResponse>("ToolCallResponse", OnToolResponse);
        await _hubConnection.StartAsync();
    }

    private void OnToolResponse(ToolCallResponse response)
    {
        // Handle tool response
    }

    public void Dispose()
    {
        _hubConnection?.DisposeAsync();
        _httpClient?.Dispose();
    }
}
```

This comprehensive Server API reference provides developers with all the information needed to integrate with the WebInteract MCP Server using REST APIs, SignalR, or WebSocket connections.

## Next Steps

- [Client Library API](./client-library) - Client-side API documentation
- [Tool Development](../development/tool-development) - Creating custom tools
- [Integration Examples](../examples) - Real-world integration examples
- [Authentication Guide](../security/authentication) - Detailed authentication setup
