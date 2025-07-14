#!/bin/bash

# WebIntract MCP Server - Quick Start Script
# This script helps you quickly deploy the WebIntract MCP Server using Docker

set -e

echo "🐳 WebIntract MCP Server - Quick Start"
echo "======================================"
echo ""

# Default values
IMAGE_TAG="latest"
PORT="8080"
CLIENT_URL="http://localhost:4200"
CONTAINER_NAME="web-intract-mcp-server"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --preview)
            IMAGE_TAG="preview"
            CONTAINER_NAME="web-intract-mcp-server-preview"
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --client-url)
            CLIENT_URL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --preview        Use preview image instead of latest"
            echo "  --port PORT      Port to run the server on (default: 8080)"
            echo "  --client-url URL Client application URL for CORS (default: http://localhost:4200)"
            echo "  --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run latest stable version"
            echo "  $0 --preview                          # Run preview version"
            echo "  $0 --port 8081                        # Run on port 8081"
            echo "  $0 --client-url https://myapp.com     # Configure CORS for production"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "Configuration:"
echo "  Image: vijaynirmalpon/web-intract-mcp-server:$IMAGE_TAG"
echo "  Port: $PORT"
echo "  Client URL: $CLIENT_URL"
echo "  Container Name: $CONTAINER_NAME"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "⚠️  Container '$CONTAINER_NAME' already exists."
    read -p "Do you want to remove it and create a new one? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing container..."
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
    else
        echo "ℹ️  Exiting without changes."
        exit 0
    fi
fi

# Pull the latest image
echo "📥 Pulling Docker image..."
docker pull "vijaynirmalpon/web-intract-mcp-server:$IMAGE_TAG"

# Set environment based on image tag
if [[ "$IMAGE_TAG" == "preview" ]]; then
    ENVIRONMENT="Development"
    DETAILED_LOGGING="true"
else
    ENVIRONMENT="Production"
    DETAILED_LOGGING="false"
fi

# Run the container
echo "🚀 Starting WebIntract MCP Server..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:8080" \
    -e ASPNETCORE_ENVIRONMENT="$ENVIRONMENT" \
    -e McpIntract__Cors__AllowedOrigins__0="$CLIENT_URL" \
    -e McpIntract__Tool__EnableDetailedErrorLogging="$DETAILED_LOGGING" \
    "vijaynirmalpon/web-intract-mcp-server:$IMAGE_TAG"

# Wait a moment for the container to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if container is running
if docker ps --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "✅ WebIntract MCP Server is running!"
    echo ""
    echo "🔗 Server Information:"
    echo "  Health Check: http://localhost:$PORT/health"
    echo "  MCP Endpoint: http://localhost:$PORT/mcp"
    echo "  SignalR Hub:  http://localhost:$PORT/mcptools"
    echo ""
    echo "📋 Container Management:"
    echo "  View logs:    docker logs $CONTAINER_NAME"
    echo "  Stop server:  docker stop $CONTAINER_NAME"
    echo "  Start server: docker start $CONTAINER_NAME"
    echo "  Remove:       docker rm $CONTAINER_NAME"
    echo ""
    
    # Test health endpoint
    echo "🩺 Testing health endpoint..."
    if curl -s -f "http://localhost:$PORT/health" > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. Server may still be starting up."
        echo "   Check logs with: docker logs $CONTAINER_NAME"
    fi
else
    echo "❌ Failed to start WebIntract MCP Server"
    echo "Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your WebIntract MCP Server is ready to use."
