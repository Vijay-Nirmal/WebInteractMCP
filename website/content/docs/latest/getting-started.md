---
title: "Getting Started"
order: 1
category: "Introduction"
---

# Getting Started

Welcome to WebInteractMCP! This guide will help you get started with transforming your web application into an MCP server.

## What is WebInteractMCP?

WebInteractMCP is an innovative MCP (Model Context Protocol) ecosystem that enables any web application to become an MCP server, allowing chatbots and other MCP clients to control client sessions and complete intended actions on behalf of users.

## Key Components

### 📚 [@web-interact-mcp/client](https://www.npmjs.com/package/@web-interact-mcp/client)
TypeScript library for client-side integration. This framework-agnostic library can be integrated into any JavaScript framework (React, Angular, Vue, etc.).

### 🖥️ [WebInteractMCPServer](https://hub.docker.com/r/vijaynirmalpon/web-interact-mcp-server)
Ready-to-deploy Docker MCP server for protocol handling. Built with .NET 9 and ASP.NET Core for robust performance.

## Architecture Overview

```mermaid
graph TB
    subgraph "Your Web Application"
        D[Client Web App<br/>Any Framework]
        E[Tools Configuration<br/>JSON File]
    end
    
    subgraph "WebInteractMCP Ecosystem"
        B[WebInteractMCPServer]
        C["@web-interact-mcp/client"<br/>TypeScript Library]
    end
    
    subgraph "MCP Client (Chatbot/AI)"
        A[MCP Client Application]
    end
    
    D -->|Initiates Request| A
    A -->|MCP Protocol| B
    B -->|Real-time Communication| C
    C -->|Integrate| D
    E -->|Configure| C
```

## Quick Installation

### 1. Install the Client Library

```bash
npm install @web-interact-mcp/client
```

### 2. Run the MCP Server

```bash
# Using Docker
docker run -p 8080:8080 webinteract-mcp-server

# Or build from source
cd server/WebInteractMCPServer
dotnet run
```

### 3. Configure Your Tools

Create a `mcp-tools.json` file in your web application's public directory:

```json
[
  {
    "toolId": "click-button",
    "title": "Click Button",
    "description": "Clicks a specific button on the page",
    "mode": "silent",
    "steps": [
      {
        "targetElement": "#submit-btn",
        "action": { "type": "click", "element": "#submit-btn" }
      }
    ]
  }
]
```

### 4. Initialize in Your Web App

```typescript
import { createWebInteractMCPController } from '@web-interact-mcp/client';

const controller = createWebInteractMCPController();
await controller.loadTools('/mcp-tools.json');
await controller.createSession('http://localhost:8080');
```

## Next Steps

- [Framework-specific Quick Start Guides](./quickstart) for React, Angular, Vue, and more
- [Tool Configuration](./tool-configuration) to learn about creating powerful MCP tools
- [API Reference](./api-reference) for complete documentation
- [Examples](./examples) to see real-world implementations

## Development Status

⚠️ **This project is in active development and has not yet reached version 1.0.**

- ✅ Core functionality is working
- ✅ Production-ready components available
- ⚠️ Breaking changes may occur frequently
- ⚠️ API is subject to change before 1.0 release

Feel free to use it in your projects, but be prepared for potential breaking changes.

## Need Help?

- 📖 [Documentation](./api-reference)
- 🐛 [Report Issues](https://github.com/Vijay-Nirmal/WebInteractMCP/issues)
- 💬 [Discussions](https://github.com/Vijay-Nirmal/WebInteractMCP/discussions)
- 📧 [Contact](mailto:me@vijaynirmal.com)
