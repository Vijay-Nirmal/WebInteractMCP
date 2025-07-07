---
title: "Docker Deployment"
order: 1
category: "Deployment"
---

# Docker Deployment

Deploy WebIntract MCP Server using Docker for development, testing, and production environments.

## Quick Start

### Using Pre-built Image

Pull and run the latest WebIntract MCP Server image:

```bash
docker run -d \
  --name webintract-mcp-server \
  -p 8080:8080 \
  -e McpIntract__Client__BaseUrl=http://your-client-app:4200 \
  -e McpIntract__Cors__AllowedOrigins__0=http://your-client-app:4200 \
  webintract-mcp-server:latest
```

Access the server at: http://localhost:8080

### Health Check

Verify the server is running:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "Healthy",
  "timestamp": "2024-01-07T10:30:00Z"
}
```

## Building from Source

### Prerequisites

- Docker 20.10+
- .NET 9 SDK (for local building)
- Git

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/Vijay-Nirmal/AutoBot.git
cd AutoBot/server

# Build the Docker image
docker build -t webintract-mcp-server:local .
```

### Custom Build with Build Args

```bash
docker build \
  --build-arg ASPNETCORE_ENVIRONMENT=Production \
  --build-arg BUILD_CONFIGURATION=Release \
  -t webintract-mcp-server:v1.0.0 .
```

## Environment Configuration

### Basic Configuration

Set essential environment variables:

```bash
docker run -d \
  --name webintract-mcp-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e McpIntract__Client__BaseUrl=https://myapp.example.com \
  -e McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com \
  -e McpIntract__Tool__EnableDetailedErrorLogging=false \
  webintract-mcp-server:latest
```

### Complete Configuration

For production deployments with full configuration:

```bash
docker run -d \
  --name webintract-mcp-server \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e McpIntract__Client__BaseUrl=https://myapp.example.com \
  -e McpIntract__Client__ToolsEndpoint=/api/mcp-tools \
  -e McpIntract__Client__TimeoutSeconds=60 \
  -e McpIntract__Client__CacheTools=true \
  -e McpIntract__Client__CacheDurationMinutes=60 \
  -e McpIntract__Tool__TimeoutMinutes=10 \
  -e McpIntract__Tool__EnableDetailedErrorLogging=false \
  -e McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com \
  -e McpIntract__Cors__AllowCredentials=true \
  webintract-mcp-server:latest
```

## Docker Compose

### Development Setup

Create `docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    container_name: webintract-mcp-dev
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - McpIntract__Client__BaseUrl=http://host.docker.internal:4200
      - McpIntract__Cors__AllowedOrigins__0=http://localhost:4200
      - McpIntract__Cors__AllowedOrigins__1=http://host.docker.internal:4200
      - McpIntract__Tool__EnableDetailedErrorLogging=true
      - McpIntract__Tool__TimeoutMinutes=2
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
      - webintract-mcp-server
```

### Production Setup

Create `docker-compose.prod.yml` for production:

```yaml
version: '3.8'

services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    container_name: webintract-mcp-prod
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - McpIntract__Client__BaseUrl=https://myapp.example.com
      - McpIntract__Client__TimeoutSeconds=60
      - McpIntract__Client__CacheDurationMinutes=60
      - McpIntract__Tool__TimeoutMinutes=10
      - McpIntract__Tool__EnableDetailedErrorLogging=false
      - McpIntract__Cors__AllowedOrigins__0=https://myapp.example.com
      - McpIntract__Cors__AllowCredentials=true
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
    container_name: webintract-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - webintract-mcp-server
    restart: unless-stopped
```

### Running with Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f webintract-mcp-server

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
COPY ["WebIntractMCPServer/WebIntractMCPServer.csproj", "WebIntractMCPServer/"]
RUN dotnet restore "WebIntractMCPServer/WebIntractMCPServer.csproj"

# Copy source code
COPY . .
WORKDIR "/src/WebIntractMCPServer"

# Build application
RUN dotnet build "WebIntractMCPServer.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WebIntractMCPServer.csproj" -c Release -o /app/publish --no-restore

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
ENTRYPOINT ["dotnet", "WebIntractMCPServer.dll"]
```

### Docker Secrets

For sensitive configuration, use Docker secrets:

```yaml
version: '3.8'

services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    environment:
      - McpIntract__Client__BaseUrl_FILE=/run/secrets/client_base_url
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
  webintract-mcp-server:
    image: webintract-mcp-server:latest
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
docker network create webintract-network

# Run container with custom network
docker run -d \
  --name webintract-mcp-server \
  --network webintract-network \
  -p 8080:8080 \
  webintract-mcp-server:latest
```

### Service Discovery

Using Docker Compose with service names:

```yaml
version: '3.8'

services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    networks:
      - webintract-net

  client-app:
    image: client-app:latest
    environment:
      - MCP_SERVER_URL=http://webintract-mcp-server:8080
    networks:
      - webintract-net

networks:
  webintract-net:
    driver: bridge
```

## Monitoring and Logging

### Container Monitoring

Monitor container health and performance:

```bash
# Container stats
docker stats webintract-mcp-server

# Container logs
docker logs -f webintract-mcp-server

# Container inspect
docker inspect webintract-mcp-server
```

### Log Management

Configure structured logging:

```yaml
services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service,environment"
    labels:
      - "service=webintract-mcp-server"
      - "environment=production"
```

### External Log Aggregation

Forward logs to external systems:

```yaml
services:
  webintract-mcp-server:
    image: webintract-mcp-server:latest
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://log-server:514"
        tag: "webintract-mcp-server"
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check container status
docker ps -a

# View container logs
docker logs webintract-mcp-server

# Inspect container configuration
docker inspect webintract-mcp-server
```

**Port binding issues:**
```bash
# Check port usage
docker port webintract-mcp-server

# List listening ports
netstat -tulpn | grep :8080
```

**Memory issues:**
```bash
# Check memory usage
docker stats --no-stream webintract-mcp-server

# Set memory limits
docker run -m 512m webintract-mcp-server:latest
```

### Debug Mode

Run container in debug mode:

```bash
docker run -it \
  --name webintract-mcp-debug \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e McpIntract__Tool__EnableDetailedErrorLogging=true \
  webintract-mcp-server:latest
```

### Shell Access

Access container shell for debugging:

```bash
# Execute bash in running container
docker exec -it webintract-mcp-server /bin/bash

# Run temporary container with shell
docker run -it --entrypoint /bin/bash webintract-mcp-server:latest
```

## Security Best Practices

### Container Security

1. **Use non-root user in container**
2. **Keep base images updated**
3. **Scan images for vulnerabilities**
4. **Use minimal base images**

```bash
# Scan for vulnerabilities
docker scout cves webintract-mcp-server:latest

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
  webintract-mcp-server:
    image: webintract-mcp-server:latest
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
