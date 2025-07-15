---
title: "Kubernetes Deployment"
order: 2
category: "Deployment"
---

# Kubernetes Deployment

Deploy WebInteract MCP Server on Kubernetes with high availability, auto-scaling, and production-ready configuration.

## Quick Start

### Prerequisites

- Kubernetes 1.20+
- kubectl configured
- Helm 3.0+ (optional)
- Docker registry access

### Simple Deployment

Deploy WebInteract MCP Server with basic configuration:

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webinteract-mcp-server
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webinteract-mcp-server
  template:
    metadata:
      labels:
        app: webinteract-mcp-server
    spec:
      containers:
      - name: webinteract-mcp-server
        image: webinteract-mcp-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: McpInteract__Client__BaseUrl
          value: "https://myapp.example.com"
---
apiVersion: v1
kind: Service
metadata:
  name: webinteract-mcp-service
  namespace: default
spec:
  selector:
    app: webinteract-mcp-server
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
EOF
```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployments

# Check pods
kubectl get pods -l app=webinteract-mcp-server

# Check service
kubectl get services

# View logs
kubectl logs -l app=webinteract-mcp-server
```

## Helm Deployment

### Using the Official Helm Chart

```bash
# Add Helm repository (replace with actual repo)
helm repo add webinteract https://charts.webinteract.com
helm repo update

# Install with default values
helm install webinteract-mcp webinteract/webinteract-mcp-server

# Install with custom values
helm install webinteract-mcp webinteract/webinteract-mcp-server \
  --set image.tag=v1.0.0 \
  --set replicaCount=3 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=mcp.example.com
```

### Custom Helm Values

Create `values.yaml` for customization:

```yaml
# values.yaml
replicaCount: 3

image:
  repository: webinteract-mcp-server
  tag: "latest"
  pullPolicy: IfNotPresent

nameOverride: ""
fullnameOverride: ""

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: mcp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webinteract-mcp-tls
      hosts:
        - mcp.example.com

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
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

config:
  mcpInteract:
    client:
      baseUrl: "https://myapp.example.com"
      timeoutSeconds: 60
      cacheDurationMinutes: 60
    tool:
      timeoutMinutes: 10
      enableDetailedErrorLogging: false
    cors:
      allowedOrigins:
        - "https://myapp.example.com"

nodeSelector: {}
tolerations: []
affinity: {}

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}
podSecurityContext:
  fsGroup: 1001

securityContext:
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1001

livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
```

Deploy with custom values:

```bash
helm install webinteract-mcp webinteract/webinteract-mcp-server -f values.yaml
```

## Production Deployment

### Complete Production Manifest

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: webinteract-mcp
  labels:
    name: webinteract-mcp
---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webinteract-mcp-config
  namespace: webinteract-mcp
data:
  appsettings.json: |
    {
      "McpInteract": {
        "Client": {
          "BaseUrl": "https://myapp.example.com",
          "TimeoutSeconds": 60,
          "CacheDurationMinutes": 60
        },
        "Tool": {
          "TimeoutMinutes": 10,
          "EnableDetailedErrorLogging": false
        },
        "Cors": {
          "AllowedOrigins": ["https://myapp.example.com"]
        }
      },
      "Logging": {
        "LogLevel": {
          "Default": "Information",
          "Microsoft.AspNetCore": "Warning"
        }
      }
    }
---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: webinteract-mcp-secrets
  namespace: webinteract-mcp
type: Opaque
data:
  # Base64 encoded secrets
  api-key: <base64-encoded-api-key>
  client-secret: <base64-encoded-client-secret>
---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webinteract-mcp-server
  namespace: webinteract-mcp
  labels:
    app: webinteract-mcp-server
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: webinteract-mcp-server
  template:
    metadata:
      labels:
        app: webinteract-mcp-server
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: webinteract-mcp-sa
      securityContext:
        fsGroup: 1001
        runAsNonRoot: true
        runAsUser: 1001
      containers:
      - name: webinteract-mcp-server
        image: webinteract-mcp-server:1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ASPNETCORE_URLS
          value: "http://+:8080"
        - name: DOTNET_gcServer
          value: "1"
        envFrom:
        - secretRef:
            name: webinteract-mcp-secrets
        volumeMounts:
        - name: config-volume
          mountPath: /app/appsettings.json
          subPath: appsettings.json
          readOnly: true
        - name: tmp-volume
          mountPath: /tmp
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
      volumes:
      - name: config-volume
        configMap:
          name: webinteract-mcp-config
      - name: tmp-volume
        emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - webinteract-mcp-server
              topologyKey: kubernetes.io/hostname
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: webinteract-mcp-service
  namespace: webinteract-mcp
  labels:
    app: webinteract-mcp-server
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: webinteract-mcp-server
---
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: webinteract-mcp-sa
  namespace: webinteract-mcp
  labels:
    app: webinteract-mcp-server
---
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webinteract-mcp-hpa
  namespace: webinteract-mcp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webinteract-mcp-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webinteract-mcp-ingress
  namespace: webinteract-mcp
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  tls:
  - hosts:
    - mcp.example.com
    secretName: webinteract-mcp-tls
  rules:
  - host: mcp.example.com
    http:
      paths:
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: webinteract-mcp-service
            port:
              number: 80
```

Deploy the complete stack:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f serviceaccount.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml
```

## Monitoring and Observability

### Prometheus Integration

Add monitoring with Prometheus and Grafana:

```yaml
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: webinteract-mcp-monitor
  namespace: webinteract-mcp
  labels:
    app: webinteract-mcp-server
spec:
  selector:
    matchLabels:
      app: webinteract-mcp-server
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

### Grafana Dashboard

Create Grafana dashboard configuration:

```json
{
  "dashboard": {
    "title": "WebInteract MCP Server",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"webinteract-mcp-service\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\"webinteract-mcp-service\"}[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"webinteract-mcp-service\",status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## Security Configuration

### RBAC Setup

```yaml
# rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: webinteract-mcp
  name: webinteract-mcp-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: webinteract-mcp-rolebinding
  namespace: webinteract-mcp
subjects:
- kind: ServiceAccount
  name: webinteract-mcp-sa
  namespace: webinteract-mcp
roleRef:
  kind: Role
  name: webinteract-mcp-role
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

```yaml
# networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: webinteract-mcp-netpol
  namespace: webinteract-mcp
spec:
  podSelector:
    matchLabels:
      app: webinteract-mcp-server
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

### Pod Security Standards

```yaml
# podsecuritypolicy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: webinteract-mcp-psp
  namespace: webinteract-mcp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAs'
    ranges:
      - min: 1001
        max: 1001
  runAsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1001
        max: 1001
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1001
        max: 1001
  seLinux:
    rule: 'RunAsAny'
```

## Persistent Storage

### StatefulSet with Persistent Volumes

```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: webinteract-mcp-server
  namespace: webinteract-mcp
spec:
  serviceName: webinteract-mcp-service
  replicas: 3
  selector:
    matchLabels:
      app: webinteract-mcp-server
  template:
    metadata:
      labels:
        app: webinteract-mcp-server
    spec:
      containers:
      - name: webinteract-mcp-server
        image: webinteract-mcp-server:latest
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
        - name: logs-volume
          mountPath: /app/logs
  volumeClaimTemplates:
  - metadata:
      name: data-volume
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "fast-ssd"
      resources:
        requests:
          storage: 10Gi
  - metadata:
      name: logs-volume
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "standard"
      resources:
        requests:
          storage: 5Gi
```

## Multi-Environment Setup

### Development Environment

```bash
# dev-values.yaml
replicaCount: 1

image:
  tag: "dev"

config:
  aspnetcoreEnvironment: "Development"
  mcpInteract:
    tool:
      enableDetailedErrorLogging: true

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
```

### Staging Environment

```bash
# staging-values.yaml
replicaCount: 2

image:
  tag: "staging"

config:
  aspnetcoreEnvironment: "Staging"

ingress:
  hosts:
    - host: mcp-staging.example.com

resources:
  limits:
    cpu: 300m
    memory: 384Mi
  requests:
    cpu: 150m
    memory: 192Mi
```

### Production Environment

```bash
# prod-values.yaml
replicaCount: 3

image:
  tag: "v1.0.0"

config:
  aspnetcoreEnvironment: "Production"

ingress:
  hosts:
    - host: mcp.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
```

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
# Check pod status
kubectl get pods -n webinteract-mcp

# Describe pod for events
kubectl describe pod <pod-name> -n webinteract-mcp

# Check logs
kubectl logs <pod-name> -n webinteract-mcp

# Check previous container logs
kubectl logs <pod-name> -n webinteract-mcp --previous
```

**Service connectivity issues:**
```bash
# Test service connectivity
kubectl exec -it <pod-name> -n webinteract-mcp -- curl http://webinteract-mcp-service

# Check service endpoints
kubectl get endpoints webinteract-mcp-service -n webinteract-mcp

# Port forward for testing
kubectl port-forward service/webinteract-mcp-service 8080:80 -n webinteract-mcp
```

**Ingress issues:**
```bash
# Check ingress status
kubectl get ingress -n webinteract-mcp

# Describe ingress for events
kubectl describe ingress webinteract-mcp-ingress -n webinteract-mcp

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Debug Tools

**Interactive debugging:**
```bash
# Run debug pod
kubectl run debug-pod --image=nicolaka/netshoot -it --rm -n webinteract-mcp

# Execute commands in existing pod
kubectl exec -it <pod-name> -n webinteract-mcp -- /bin/bash

# Copy files from pod
kubectl cp <pod-name>:/app/logs/app.log ./app.log -n webinteract-mcp
```

### Performance Troubleshooting

**Resource monitoring:**
```bash
# Check resource usage
kubectl top pods -n webinteract-mcp

# Check node resource usage
kubectl top nodes

# Check HPA status
kubectl get hpa -n webinteract-mcp

# Describe HPA for scaling events
kubectl describe hpa webinteract-mcp-hpa -n webinteract-mcp
```

## Best Practices

### Resource Management

1. **Set resource requests and limits**
2. **Use horizontal pod autoscaling**
3. **Configure pod disruption budgets**
4. **Use node affinity and anti-affinity**

### Security

1. **Run as non-root user**
2. **Use read-only root filesystem**
3. **Drop all capabilities**
4. **Implement network policies**

### High Availability

1. **Deploy across multiple nodes**
2. **Use pod anti-affinity**
3. **Configure proper health checks**
4. **Implement graceful shutdown**

### Monitoring

1. **Expose metrics endpoint**
2. **Configure service monitoring**
3. **Set up alerting rules**
4. **Monitor resource usage**

## Next Steps

- [Docker Deployment](./docker) - Container deployment options
- [Configuration Reference](../configuration/server-configuration) - Detailed configuration
- [Monitoring Setup](../monitoring) - Monitoring and alerting
- [Backup and Recovery](../operations/backup) - Data protection strategies
