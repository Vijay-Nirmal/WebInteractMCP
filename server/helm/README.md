# WebInteract MCP Server Helm Chart

This Helm chart deploys the WebInteract MCP Server on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.20+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-webinteract-mcp-server`:

```bash
helm install my-webinteract-mcp-server ./helm/webinteract-mcp-server
```

The command deploys WebInteract MCP Server on the Kubernetes cluster in the default configuration.

## Uninstalling the Chart

To uninstall/delete the `my-webinteract-mcp-server` deployment:

```bash
helm delete my-webinteract-mcp-server
```

## Configuration

The following table lists the configurable parameters of the WebInteract MCP Server chart and their default values.

### Basic Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `your-dockerhub-username/webinteract-mcp-server` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `image.tag` | Image tag | `"latest"` |
| `nameOverride` | String to partially override webinteract-mcp-server.fullname | `""` |
| `fullnameOverride` | String to fully override webinteract-mcp-server.fullname | `""` |

### Service Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port | `8080` |
| `service.targetPort` | Target port | `8080` |

### Ingress Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `ingress.enabled` | Enable ingress controller resource | `false` |
| `ingress.className` | IngressClass that will be used | `""` |
| `ingress.annotations` | Ingress annotations | `{}` |
| `ingress.hosts` | Hostnames to your webinteract-mcp-server installation | `[{"host": "webinteract-mcp-server.local", "paths": [{"path": "/", "pathType": "Prefix"}]}]` |
| `ingress.tls` | Ingress TLS configuration | `[]` |

### Application Configuration

All WebInteract MCP Server configuration can be set via environment variables in the `env` section:

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `env.ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment | `"Production"` |
| `env.McpInteract__Client__BaseUrl` | Client application base URL | `"http://localhost:4200"` |
| `env.McpInteract__Client__ToolsEndpoint` | Tools endpoint path | `"/mcp-tools.json"` |
| `env.McpInteract__Tool__TimeoutMinutes` | Tool execution timeout | `"5"` |
| `env.McpInteract__Cors__AllowedOrigins__0` | Allowed CORS origins | `"http://localhost:4200"` |

### Resource Configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `resources` | CPU/Memory resource requests/limits | `{}` |
| `autoscaling.enabled` | Enable Horizontal Pod Autoscaler | `false` |
| `autoscaling.minReplicas` | Minimum number of replicas | `1` |
| `autoscaling.maxReplicas` | Maximum number of replicas | `100` |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage | `80` |

## Example Configurations

### Production Deployment with Ingress and Sticky Sessions

For SignalR to work properly in a multi-replica deployment, sticky sessions are required:

```yaml
# values-production.yaml
replicaCount: 3

image:
  repository: your-dockerhub-username/webinteract-mcp-server
  tag: "v1.0.0"

env:
  ASPNETCORE_ENVIRONMENT: "Production"
  McpInteract__Client__BaseUrl: "https://your-production-client.com"
  McpInteract__Cors__AllowedOrigins__0: "https://your-production-client.com"
  McpInteract__Tool__EnableDetailedErrorLogging: "false"

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # REQUIRED: Sticky sessions for SignalR
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/affinity-mode: "persistent"
    nginx.ingress.kubernetes.io/session-cookie-name: "webinteract-mcp-server"
    nginx.ingress.kubernetes.io/session-cookie-expires: "86400"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "86400"
    nginx.ingress.kubernetes.io/session-cookie-path: "/"
    # REQUIRED: WebSocket support for SignalR
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/websocket-services: "webinteract-mcp-server"
  hosts:
    - host: mcp-server.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webinteract-mcp-server-tls
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
```

Deploy with:
```bash
helm install webinteract-mcp-server ./helm/webinteract-mcp-server -f values-production.yaml
```

### Development Deployment

```yaml
# values-development.yaml
env:
  ASPNETCORE_ENVIRONMENT: "Development"
  McpInteract__Tool__EnableDetailedErrorLogging: "true"
  McpInteract__Client__BaseUrl: "http://localhost:4200"
```

Deploy with:
```bash
helm install webinteract-mcp-server-dev ./helm/webinteract-mcp-server -f values-development.yaml
```

### With Redis Support

```yaml
# values-redis.yaml
redis:
  enabled: true
  connectionString: "localhost:6379"

env:
  McpInteract__Tool__EnableDetailedErrorLogging: "false"
```

## SignalR and Load Balancing Considerations

The WebInteract MCP Server uses SignalR for real-time bidirectional communication. When deploying with multiple replicas, special configuration is required:

### Sticky Sessions
SignalR connections must remain connected to the same pod throughout their lifetime. Configure your ingress controller with sticky sessions:

**For NGINX Ingress Controller:**
```yaml
annotations:
  nginx.ingress.kubernetes.io/affinity: "cookie"
  nginx.ingress.kubernetes.io/affinity-mode: "persistent"
  nginx.ingress.kubernetes.io/session-cookie-name: "webinteract-mcp-server"
  nginx.ingress.kubernetes.io/session-cookie-expires: "86400"
```

**For Traefik:**
```yaml
annotations:
  traefik.ingress.kubernetes.io/service.sticky.cookie: "true"
  traefik.ingress.kubernetes.io/service.sticky.cookie.name: "webinteract-server"
```

### WebSocket Support
Ensure your ingress controller supports WebSockets and has appropriate timeouts:

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
  nginx.ingress.kubernetes.io/websocket-services: "webinteract-mcp-server"
```

### Alternative: Redis Backplane
For true scalability without sticky sessions, consider implementing a Redis backplane for SignalR (requires code changes):

```yaml
redis:
  enabled: true
  connectionString: "your-redis-cluster-connection-string"

env:
  ConnectionStrings__Redis: "your-redis-cluster-connection-string"
```

## Health Checks

The chart includes health checks for the application:

- **Liveness Probe**: Checks `/health` endpoint every 30 seconds
- **Readiness Probe**: Checks `/health` endpoint every 10 seconds

## Monitoring

To monitor the application, you can use tools like Prometheus. The application exposes standard ASP.NET Core metrics.

## Upgrading

To upgrade the deployment:

```bash
helm upgrade my-webinteract-mcp-server ./helm/webinteract-mcp-server
```

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -l app.kubernetes.io/name=webinteract-mcp-server
```

### View Logs
```bash
kubectl logs -l app.kubernetes.io/name=webinteract-mcp-server
```

### Check Service
```bash
kubectl get svc -l app.kubernetes.io/name=webinteract-mcp-server
```

### Test Health Endpoint
```bash
kubectl port-forward svc/my-webinteract-mcp-server 8080:8080
curl http://localhost:8080/health
```
