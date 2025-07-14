# WebIntract MCP Server

A Model Context Protocol (MCP) server that converts client web applications into MCP servers with robust two-way communication using the @web-intract-mcp/client npm library

## Overview

WebIntract MCP Server enables client web applications to expose their functionality as MCP tools. It acts as a bridge between MCP clients and web applications, allowing tools registered in web applications to be invoked through the MCP protocol.

## Architecture

```mermaid
graph TB
    subgraph "MCP Client"
        A[MCP Client Application]
    end
    
    subgraph "WebIntract MCP Server"
        B[MCP Protocol Handler]
        C[Tool Registry Service]
        D[Communication Hub]
        E[Configuration Manager]
    end
    
    subgraph "Client Web Application"
        F[Tool Registration]
        G[Tool Execution]
        H[Communication Interface]
    end
    
    A -->|MCP Protocol| B
    B --> C
    C --> D
    D -->|Robust 2-way Connection| H
    H --> F
    H --> G
    F --> C
    G --> D
    E --> B
    E --> C
    E --> D
```

## Features

- **Robust Communication**: Real-time bidirectional communication with client web applications
- **Tool Registration**: Dynamic registration of tools from client applications
- **Tool Execution**: Secure execution of tools with proper error handling and timeout management
- **Configuration Management**: Comprehensive configuration using the IOptions pattern
- **Caching**: Intelligent caching of tools to improve performance
- **CORS Support**: Configurable CORS policies for secure cross-origin requests
- **Logging**: Structured logging with configurable levels
- **Error Handling**: Robust error handling with detailed logging options
- **Concurrency Control**: Configurable limits on concurrent tool executions

## Configuration

The application uses the `McpIntract` section in `appsettings.json` for configuration. All settings can also be configured using environment variables.

### Configuration Reference

| Setting | Environment Variable | Default Value | Type | Range/Options | Description |
|---------|---------------------|---------------|------|---------------|-------------|
| **Tool Configuration** |
| `McpIntract:Tool:TimeoutMinutes` | `McpIntract__Tool__TimeoutMinutes` | `5` | integer | 1-60 | Tool execution timeout in minutes |
| `McpIntract:Tool:EnableDetailedErrorLogging` | `McpIntract__Tool__EnableDetailedErrorLogging` | `false` | boolean | true/false | Whether to enable detailed error logging |
| **CORS Configuration** |
| `McpIntract:Cors:AllowedOrigins` | `McpIntract__Cors__AllowedOrigins` | `["http://localhost:4200"]` | array | Valid URLs | Array of allowed origins for CORS |
| `McpIntract:Cors:AllowAnyOrigin` | `McpIntract__Cors__AllowAnyOrigin` | `true` | boolean | true/false | Whether to allow any origin (use with caution in production) |

> **Migration Note**: As of version 1.0, the server uses **SignalR for tool discovery** instead of HTTP requests. Client configuration properties have been removed.

### Example Configuration

```json
{
  "McpIntract": {
    "Tool": {
      "TimeoutMinutes": 5,
      "EnableDetailedErrorLogging": false
    },
    "Cors": {
      "AllowedOrigins": ["http://localhost:4200"],
      "AllowAnyOrigin": false
    }
  }
}
```

## Environment-Specific Configuration

### Development
```json
{
  "McpIntract": {
    "Tool": {
      "EnableDetailedErrorLogging": true
    }
  }
}
```

### Production
- Set `EnableDetailedErrorLogging` to `false`
- Configure specific allowed origins instead of `AllowAnyOrigin`
- Use HTTPS for all URLs
- Configure appropriate timeout values
- Set up proper logging levels

## API Endpoints

- `POST /mcp` - MCP protocol endpoint
- `GET /mcp` - MCP capabilities endpoint
- `/mcptools` - Communication hub endpoint

## Implementation Details

### Communication Architecture

The server uses SignalR for robust bidirectional communication with client web applications. This enables real-time tool registration and execution.

```mermaid
sequenceDiagram
    participant MCP as MCP Client
    participant Server as WebIntract Server
    participant WebApp as Client Web App
    
    Note over WebApp,Server: Connection Setup
    WebApp->>Server: Connect to /mcptools hub
    Server->>WebApp: Connection established
    
    Note over MCP,WebApp: Tool Registration
    WebApp->>Server: Register tools via /mcp-tools.json
    Server->>Server: Cache tools
    
    Note over MCP,WebApp: Tool Execution
    MCP->>Server: POST /mcp (tool execution request)
    Server->>WebApp: InvokeTool(toolId, parameters)
    WebApp->>WebApp: Execute tool
    WebApp->>Server: Return result
    Server->>MCP: Return MCP response
```

### Client Requirements

Client web applications must:
1. Connect to the communication hub at `/mcptools`
2. Provide a `McpIntract-Session-Id` header when making MCP requests
3. Implement the `InvokeTool` method to handle tool execution requests
4. Expose tools at the configured `ToolsEndpoint`

### Tool Schema

Tools should be exposed as a JSON array at the configured endpoint:

```json
[
  {
    "toolId": "unique-tool-id",
    "title": "Tool Display Name",
    "description": "Tool description",
    "mode": "execution-mode",
    "parameterSchema": {
      "parameters": {
        "param1": {
          "type": "string",
          "description": "Parameter description",
          "defaultValue": "default"
        }
      },
      "required": ["param1"]
    },
    "destructive": false,
    "idempotent": true,
    "openWorld": false,
    "readOnly": true
  }
]
```

## Deployment

The WebIntract MCP Server supports multiple deployment options for different environments and requirements.

### Kubernetes Deployment with Helm

The recommended production deployment method is using Kubernetes with Helm charts.

#### Prerequisites

- Kubernetes 1.20+
- Helm 3.2.0+
- kubectl configured for your cluster

#### Quick Start

1. **Install the Helm chart:**
```bash
helm install webintract-mcp-server ./helm/webintract-mcp-server
```

2. **Configure for production:**
```bash
# Create values-production.yaml
cat > values-production.yaml << EOF
replicaCount: 3

image:
  repository: your-dockerhub-username/webintract-mcp-server
  tag: "v1.0.0"

env:
  ASPNETCORE_ENVIRONMENT: "Production"
  McpIntract__Cors__AllowedOrigins__0: "https://your-production-client.com"
  McpIntract__Tool__EnableDetailedErrorLogging: "false"

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # Sticky sessions for SignalR
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/affinity-mode: "persistent"
    nginx.ingress.kubernetes.io/session-cookie-name: "webintract-mcp-server"
    nginx.ingress.kubernetes.io/session-cookie-expires: "86400"
    # WebSocket support for SignalR
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
  hosts:
    - host: mcp-server.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webintract-mcp-server-tls
      hosts:
        - mcp-server.yourdomain.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
EOF

# Deploy with production configuration
helm install webintract-mcp-server ./helm/webintract-mcp-server -f values-production.yaml
```

3. **Verify deployment:**
```bash
# Check pod status
kubectl get pods -l app.kubernetes.io/name=webintract-mcp-server

# Check service
kubectl get svc -l app.kubernetes.io/name=webintract-mcp-server

# Test health endpoint
kubectl port-forward svc/webintract-mcp-server 8080:8080
curl http://localhost:8080/health
```

#### Helm Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Docker image repository | `your-dockerhub-username/webintract-mcp-server` |
| `image.tag` | Docker image tag | `"latest"` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.annotations` | Ingress annotations for sticky sessions | See values.yaml |
| `autoscaling.enabled` | Enable horizontal pod autoscaling | `false` |
| `resources` | CPU/Memory limits and requests | `{}` |

#### SignalR and Sticky Sessions

Since the server uses SignalR for real-time communication, sticky sessions are crucial for proper operation:

```yaml
ingress:
  annotations:
    # Required for SignalR sticky sessions
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/affinity-mode: "persistent"
    nginx.ingress.kubernetes.io/session-cookie-name: "webintract-mcp-server"
    nginx.ingress.kubernetes.io/session-cookie-expires: "86400"
    # WebSocket support
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
```

#### Upgrading

```bash
# Upgrade the deployment
helm upgrade webintract-mcp-server ./helm/webintract-mcp-server -f values-production.yaml

# Check rollout status
kubectl rollout status deployment/webintract-mcp-server
```

#### Uninstalling

```bash
helm uninstall webintract-mcp-server
```

### Docker Compose Deployment

For development and testing environments, Docker Compose provides a simpler deployment option.

#### Quick Start

```bash
# Production deployment
docker-compose up -d

# Development deployment with enhanced logging
docker-compose -f docker-compose.dev.yml up -d
```

See [DOCKER.md](DOCKER.md) for detailed Docker deployment instructions.

### Docker Hub Deployment

The WebIntract MCP Server is available as a pre-built Docker image on DockerHub.

**Docker Hub Repository:** [`vijaynirmalpon/web-intract-mcp-server`](https://hub.docker.com/r/vijaynirmalpon/web-intract-mcp-server)

#### Available Tags

| Tag | Description | Use Case |
|-----|-------------|----------|
| `latest` | Latest stable production release | Production deployments |
| `preview` | Latest preview build from master | Testing new features |
| `vX.Y.Z` | Specific version releases | Version-pinned deployments |
| `vX.Y.Z-preview.N` | Specific preview builds | Testing specific builds |

#### Quick Start with DockerHub

1. **Pull and run the latest stable version:**
```bash
docker run -d \
  --name web-intract-mcp-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e McpIntract__Cors__AllowedOrigins__0=http://localhost:4200 \
  vijaynirmalpon/web-intract-mcp-server:latest
```

2. **Or run preview version for testing:**
```bash
docker run -d \
  --name web-intract-mcp-server-preview \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e McpIntract__Tool__EnableDetailedErrorLogging=true \
  vijaynirmalpon/web-intract-mcp-server:preview
```

3. **Using Docker Compose with published image:**
```bash
# Use the pre-configured compose file
docker-compose -f docker-compose.published.yml up -d
```

4. **Verify the service is running:**
```bash
curl http://localhost:8080/health
```

#### Quick Start Scripts

For the easiest setup experience, use the provided quick start scripts:

**Linux/macOS:**
```bash
# Run latest stable version
./start-server.sh

# Run preview version
./start-server.sh --preview

# Run on custom port with production URL
./start-server.sh --port 8081 --client-url https://myapp.com
```

**Windows PowerShell:**
```powershell
# Run latest stable version
.\start-server.ps1

# Run preview version
.\start-server.ps1 -Preview

# Run on custom port with production URL
.\start-server.ps1 -Port 8081 -ClientUrl https://myapp.com
```

The scripts will:
- ✅ Check if Docker is running
- ✅ Pull the latest image
- ✅ Handle existing containers
- ✅ Configure environment variables
- ✅ Test the health endpoint
- ✅ Provide management commands

#### Building and Publishing to Docker Hub (For Development)

1. **Build the Docker image:**
```bash
docker build -t vijaynirmalpon/web-intract-mcp-server:latest .
```

2. **Tag for versioning:**
```bash
docker tag vijaynirmalpon/web-intract-mcp-server:latest vijaynirmalpon/web-intract-mcp-server:v0.1.0
```

3. **Push to Docker Hub:**
```bash
docker login
docker push vijaynirmalpon/web-intract-mcp-server:latest
docker push vijaynirmalpon/web-intract-mcp-server:v0.1.0
```

#### Advanced Docker Compose Configuration

For production use with the published image:

```yaml
version: '3.8'
services:
  webintract-mcp-server:
    image: vijaynirmalpon/web-intract-mcp-server:latest
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - McpIntract__Cors__AllowedOrigins__0=https://your-production-app.com
      - McpIntract__Tool__EnableDetailedErrorLogging=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "timeout 3s bash -c '</dev/tcp/localhost/8080' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Environment Configuration for Production

Set the following environment variables when using the Docker image:
```yaml
version: '3.8'
services:
  webintract-mcp-server:
    image: your-dockerhub-username/webintract-mcp-server:latest
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - McpIntract__Cors__AllowedOrigins__0=http://client-app:4200
      - McpIntract__Tool__EnableDetailedErrorLogging=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Environment Configuration for Production

Set the following environment variables for production deployment:

```bash
# Required
ASPNETCORE_ENVIRONMENT=Production
McpIntract__Cors__AllowedOrigins__0=https://your-production-client.com

# Optional but recommended
McpIntract__Tool__EnableDetailedErrorLogging=false
McpIntract__Tool__TimeoutMinutes=10
```

#### Health Check

The container includes a health check endpoint at `/health`. You can verify the service is running:

```bash
curl http://localhost:8080/health
```

## Monitoring and Logging

The application uses structured logging with the following categories:
- `WebIntractMCPServer.Services.ToolService`: Tool-related operations
- `WebIntractMCPServer.Hubs.McpToolsHub`: Communication hub operations
- `Microsoft.AspNetCore`: Framework-level logs

### Logging Configuration

Configure logging levels in `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "WebIntractMCPServer": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Log Analysis

```mermaid
graph TD
    subgraph "Log Sources"
        A[Application Logs]
        B[Tool Execution Logs]
        C[Communication Logs]
        D[Error Logs]
    end
    
    subgraph "Log Aggregation"
        E[Docker Logs]
        F[Structured Logging]
        G[External Logging Service]
    end
    
    subgraph "Monitoring"
        H[Performance Metrics]
        I[Error Tracking]
        J[Usage Analytics]
    end
    
    A --> E
    B --> F
    C --> F
    D --> G
    
    E --> H
    F --> I
    G --> J
```

## Security Considerations

1. **CORS Configuration**: Always configure specific allowed origins in production
2. **HTTPS**: Use HTTPS for all communication in production
3. **Authentication**: Implement proper authentication for the MCP endpoint
4. **Rate Limiting**: Consider implementing rate limiting for tool executions
5. **Session Management**: Implement proper session validation
6. **Input Validation**: Validate all tool parameters

## Troubleshooting

### Common Issues

1. **Tools not loading**: Check the client URL and tools endpoint configuration
2. **CORS errors**: Verify CORS configuration matches client origin
3. **Communication connection issues**: Check firewall settings and connection strings
4. **Tool execution timeouts**: Adjust timeout configurations

### Diagnostic Flow

```mermaid
flowchart TD
    A[Issue Reported] --> B{Service Running?}
    B -->|No| C[Check Docker Container Status]
    B -->|Yes| D{Client Connected?}
    
    C --> C1[docker ps]
    C1 --> C2[docker logs container-name]
    C2 --> C3[Check Environment Variables]
    
    D -->|No| E[Check CORS Configuration]
    D -->|Yes| F{Tools Loading?}
    
    E --> E1[Verify AllowedOrigins]
    E1 --> E2[Check SignalR Connection]
    
    F -->|No| G[Check SignalR Hub]
    F -->|Yes| H{Tool Execution Working?}
    
    G --> G1[Verify /mcp-tools-hub accessible]
    G1 --> G2[Check Client SignalR Connection]
    
    H -->|No| I[Check Timeouts & Errors]
    H -->|Yes| J[System Healthy]
    
    I --> I1[Review Logs]
    I1 --> I2[Check Tool Implementation]
```

### Diagnostic Commands

```bash
# Check application health
curl http://localhost:8080/health

# Test MCP capabilities
curl http://localhost:8080/mcp

# Check Docker container status
docker ps | grep webintract-mcp-server

# View container logs
docker logs webintract-mcp-server

# Check environment variables
docker exec webintract-mcp-server env | grep McpIntract

# Test SignalR hub endpoint (should return 404 for GET, but confirms endpoint exists)
curl http://localhost:8080/mcp-tools-hub
```

## Contributing

1. Follow C# coding conventions
2. Add XML documentation for public APIs
3. Include unit tests for new features
4. Update configuration documentation
5. Test with different client configurations

## License

[Your License Here]
