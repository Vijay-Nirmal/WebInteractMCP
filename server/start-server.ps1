# WebInteract MCP Server - Quick Start Script (PowerShell)
# This script helps you quickly deploy the WebInteract MCP Server using Docker

param(
    [switch]$Preview,
    [string]$Port = "8080",
    [string]$ClientUrl = "http://localhost:4200",
    [switch]$Help
)

if ($Help) {
    Write-Host "🐳 WebInteract MCP Server - Quick Start" -ForegroundColor Cyan
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Usage: .\start-server.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Preview         Use preview image instead of latest"
    Write-Host "  -Port PORT       Port to run the server on (default: 8080)"
    Write-Host "  -ClientUrl URL   Client application URL for CORS (default: http://localhost:4200)"
    Write-Host "  -Help            Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\start-server.ps1                                    # Run latest stable version"
    Write-Host "  .\start-server.ps1 -Preview                          # Run preview version"
    Write-Host "  .\start-server.ps1 -Port 8081                        # Run on port 8081"
    Write-Host "  .\start-server.ps1 -ClientUrl https://myapp.com       # Configure CORS for production"
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "🐳 WebInteract MCP Server - Quick Start" -ForegroundColor Cyan
Write-Host "======================================"
Write-Host ""

# Set variables based on parameters
$ImageTag = if ($Preview) { "preview" } else { "latest" }
$ContainerName = if ($Preview) { "web-interact-mcp-server-preview" } else { "web-interact-mcp-server" }
$ImageName = "vijaynirmalpon/web-interact-mcp-server:$ImageTag"

Write-Host "Configuration:"
Write-Host "  Image: $ImageName"
Write-Host "  Port: $Port"
Write-Host "  Client URL: $ClientUrl"
Write-Host "  Container Name: $ContainerName"
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if container already exists
$existingContainer = docker ps -a --format "table {{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($existingContainer) {
    Write-Host "⚠️  Container '$ContainerName' already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and create a new one? (y/N)"
    if ($response -match "^[Yy]$") {
        Write-Host "🗑️  Removing existing container..." -ForegroundColor Yellow
        try {
            docker stop $ContainerName 2>$null | Out-Null
        } catch {}
        try {
            docker rm $ContainerName 2>$null | Out-Null
        } catch {}
    } else {
        Write-Host "ℹ️  Exiting without changes." -ForegroundColor Blue
        exit 0
    }
}

# Pull the latest image
Write-Host "📥 Pulling Docker image..." -ForegroundColor Green
docker pull $ImageName

# Set environment based on image tag
$Environment = if ($Preview) { "Development" } else { "Production" }
$DetailedLogging = if ($Preview) { "true" } else { "false" }

# Run the container
Write-Host "🚀 Starting WebInteract MCP Server..." -ForegroundColor Green
docker run -d `
    --name $ContainerName `
    -p "${Port}:8080" `
    -e ASPNETCORE_ENVIRONMENT=$Environment `
    -e McpInteract__Cors__AllowedOrigins__0=$ClientUrl `
    -e McpInteract__Tool__EnableDetailedErrorLogging=$DetailedLogging `
    $ImageName

# Wait a moment for the container to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if container is running
$runningContainer = docker ps --format "table {{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($runningContainer) {
    Write-Host "✅ WebInteract MCP Server is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Server Information:" -ForegroundColor Cyan
    Write-Host "  Health Check: http://localhost:$Port/health"
    Write-Host "  MCP Endpoint: http://localhost:$Port/mcp"
    Write-Host "  SignalR Hub:  http://localhost:$Port/mcptools"
    Write-Host ""
    Write-Host "📋 Container Management:" -ForegroundColor Cyan
    Write-Host "  View logs:    docker logs $ContainerName"
    Write-Host "  Stop server:  docker stop $ContainerName"
    Write-Host "  Start server: docker start $ContainerName"
    Write-Host "  Remove:       docker rm $ContainerName"
    Write-Host ""
    
    # Test health endpoint
    Write-Host "🩺 Testing health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Health check failed. Server may still be starting up." -ForegroundColor Yellow
        Write-Host "   Check logs with: docker logs $ContainerName"
    }
} else {
    Write-Host "❌ Failed to start WebInteract MCP Server" -ForegroundColor Red
    Write-Host "Check logs with: docker logs $ContainerName"
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup complete! Your WebInteract MCP Server is ready to use." -ForegroundColor Green
