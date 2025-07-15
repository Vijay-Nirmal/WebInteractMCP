---
title: "Docker Deployment"
order: 1
category: "Deployment"
---

# Docker Deployment

Deploy WebInteract MCP Server using Docker for development, testing, and production environments.

## Quick Start

### Using Pre-built Image

Pull and run the latest WebInteract MCP Server image:

```bash
docker run -d \
  --name webinteract-mcp-server \
  -p 8080:8080 \
  -e McpInteract__Client__BaseUrl=http://your-client-app:4200 \
  -e McpInteract__Cors__AllowedOrigins__0=http://your-client-app:4200 \
  webinteract-mcp-server:latest
```

Access the server at: http://localhost:8080

### Health Check

Verify the server is running:

```bash
curl http://localhost:8080/health
```

Expected response:
```
Healthy
```

## Building from Source

### Prerequisites

- Docker 20.10+
- .NET 9 SDK (for local building)
- Git

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/Vijay-Nirmal/WebInteractMCP.git
cd WebInteractMCP/server

# Build the Docker image
docker build -t webinteract-mcp-server:local .
```

### Custom Build with Build Args

```bash
docker build \
  --build-arg ASPNETCORE_ENVIRONMENT=Production \
  --build-arg BUILD_CONFIGURATION=Release \
  -t webinteract-mcp-server:1.0.0 .
```

## Environment Configuration

### Basic Configuration

Set essential environment variables:

```bash
docker run -d \
  --name webinteract-mcp-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e McpInteract__Client__BaseUrl=https://myapp.example.com \
  -e McpInteract__Cors__AllowedOrigins__0=https://myapp.example.com \
  -e McpInteract__Tool__EnableDetailedErrorLogging=false \
  webinteract-mcp-server:latest
```

### Complete Configuration

For production deployments with full configuration:

```bash
docker run -d \
  --name webinteract-mcp-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e McpInteract__Client__BaseUrl=https://myapp.example.com \
  -e McpInteract__Client__ToolsEndpoint=/api/mcp-tools \
  -e McpInteract__Client__TimeoutSeconds=60 \
  -e McpInteract__Client__CacheTools=true \
  -e McpInteract__Client__CacheDurationMinutes=60 \
  -e McpInteract__Tool__TimeoutMinutes=10 \
  -e McpInteract__Tool__EnableDetailedErrorLogging=false \
  -e McpInteract__Cors__AllowedOrigins__0=https://myapp.example.com \
  webinteract-mcp-server:latest
```

## Docker Compose

### Development Setup

Create `docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    container_name: webinteract-mcp-dev
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - McpInteract__Client__BaseUrl=http://host.docker.internal:4200
      - McpInteract__Cors__AllowedOrigins__0=http://localhost:4200
      - McpInteract__Cors__AllowedOrigins__1=http://host.docker.internal:4200
      - McpInteract__Tool__EnableDetailedErrorLogging=true
      - McpInteract__Tool__TimeoutMinutes=2
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Include your client application
  client-app:
    image: node:18-alpine
    container_name: client-app-dev
    working_dir: /app
    ports:
      - "4200:4200"
    volumes:
      - ../client:/app
    command: npm run dev
    depends_on:
      - webinteract-mcp-server
```

### Production Setup

Create `docker-compose.prod.yml` for production:

```yaml
version: '3.8'

services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    container_name: webinteract-mcp-prod
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - McpInteract__Client__BaseUrl=https://myapp.example.com
      - McpInteract__Client__TimeoutSeconds=60
      - McpInteract__Client__CacheDurationMinutes=60
      - McpInteract__Tool__TimeoutMinutes=10
      - McpInteract__Tool__EnableDetailedErrorLogging=false
      - McpInteract__Cors__AllowedOrigins__0=https://myapp.example.com
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  # Reverse proxy (optional)
  nginx:
    image: nginx:alpine
    container_name: webinteract-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - webinteract-mcp-server
    restart: unless-stopped
```

### Running with Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f webinteract-mcp-server

# Stop services
docker-compose down
```

## Advanced Docker Configuration

### Multi-stage Dockerfile

Create an optimized Dockerfile:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["WebInteractMCPServer/WebInteractMCPServer.csproj", "WebInteractMCPServer/"]
RUN dotnet restore "WebInteractMCPServer/WebInteractMCPServer.csproj"

# Copy source code
COPY . .
WORKDIR "/src/WebInteractMCPServer"

# Build application
RUN dotnet build "WebInteractMCPServer.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WebInteractMCPServer.csproj" -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

# Copy published application
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Configure health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Set entry point
ENTRYPOINT ["dotnet", "WebInteractMCPServer.dll"]
```

### Docker Secrets

For sensitive configuration, use Docker secrets:

```yaml
version: '3.8'

services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    environment:
      - McpInteract__Client__BaseUrl_FILE=/run/secrets/client_base_url
    secrets:
      - client_base_url
    deploy:
      replicas: 2

secrets:
  client_base_url:
    external: true
```

Create secrets:

```bash
# Create secret
echo "https://myapp.example.com" | docker secret create client_base_url -

# List secrets
docker secret ls
```

### Resource Limits

Set resource limits for production:

```yaml
services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Networking

### Custom Networks

Create isolated networks:

```bash
# Create custom network
docker network create webinteract-network

# Run container with custom network
docker run -d \
  --name webinteract-mcp-server \
  --network webinteract-network \
  -p 8080:8080 \
  webinteract-mcp-server:latest
```

### Service Discovery

Using Docker Compose with service names:

```yaml
version: '3.8'

services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    networks:
      - webinteract-net

  client-app:
    image: client-app:latest
    environment:
      - MCP_SERVER_URL=http://webinteract-mcp-server:8080
    networks:
      - webinteract-net

networks:
  webinteract-net:
    driver: bridge
```

## Monitoring and Logging

### Container Monitoring

Monitor container health and performance:

```bash
# Container stats
docker stats webinteract-mcp-server

# Container logs
docker logs -f webinteract-mcp-server

# Container inspect
docker inspect webinteract-mcp-server
```

### Log Management

Configure structured logging:

```yaml
services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service,environment"
    labels:
      - "service=webinteract-mcp-server"
      - "environment=production"
```

### External Log Aggregation

Forward logs to external systems:

```yaml
services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://log-server:514"
        tag: "webinteract-mcp-server"
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check container status
docker ps -a

# View container logs
docker logs webinteract-mcp-server

# Inspect container configuration
docker inspect webinteract-mcp-server
```

**Port binding issues:**
```bash
# Check port usage
docker port webinteract-mcp-server

# List listening ports
netstat -tulpn | grep :8080
```

**Memory issues:**
```bash
# Check memory usage
docker stats --no-stream webinteract-mcp-server

# Set memory limits
docker run -m 512m webinteract-mcp-server:latest
```

### Debug Mode

Run container in debug mode:

```bash
docker run -it \
  --name webinteract-mcp-debug \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e McpInteract__Tool__EnableDetailedErrorLogging=true \
  webinteract-mcp-server:latest
```

### Shell Access

Access container shell for debugging:

```bash
# Execute bash in running container
docker exec -it webinteract-mcp-server /bin/bash

# Run temporary container with shell
docker run -it --entrypoint /bin/bash webinteract-mcp-server:latest
```

## Security Best Practices

### Container Security

1. **Use non-root user in container**
2. **Keep base images updated**
3. **Scan images for vulnerabilities**
4. **Use minimal base images**

```bash
# Scan for vulnerabilities
docker scout cves webinteract-mcp-server:latest

# Update base image
docker pull mcr.microsoft.com/dotnet/aspnet:9.0
```

### Environment Security

1. **Use secrets for sensitive data**
2. **Enable TLS for all connections**
3. **Configure proper CORS origins**
4. **Use strong authentication**

## Performance Optimization

### Image Optimization

1. **Use multi-stage builds**
2. **Minimize layer count**
3. **Use .dockerignore**
4. **Optimize base image selection**

### Runtime Optimization

```yaml
services:
  webinteract-mcp-server:
    image: webinteract-mcp-server:latest
    environment:
      - ASPNETCORE_URLS=http://+:8080
      - DOTNET_gcServer=1
      - DOTNET_gcConcurrent=1
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

## Next Steps

- [Kubernetes Deployment](./kubernetes) - Deploy with Kubernetes and Helm
- [Configuration Reference](../configuration/server-configuration) - Detailed configuration options
- [Monitoring Setup](../monitoring) - Set up monitoring and alerting
