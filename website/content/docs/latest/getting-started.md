---
title: "Getting Started"
order: 1
category: "Introduction"
---

# Getting Started

Welcome to WebIntractMCP! This guide will help you get started with transforming your web application into an MCP server.

## What is WebIntractMCP?

WebIntractMCP is an innovative MCP (Model Context Protocol) ecosystem that enables any web application to become an MCP server, allowing chatbots and other MCP clients to control client sessions and complete intended actions on behalf of users.

## Key Components

### 📚 @web-intract-mcp/client
TypeScript library for client-side integration. This framework-agnostic library can be integrated into any JavaScript framework (React, Angular, Vue, etc.).

### 🖥️ WebIntractMCPServer
Ready-to-deploy Docker MCP server for protocol handling. Built with .NET 9 and ASP.NET Core for robust performance.

### 🎯 Sample Implementation
Complete Angular + .NET example demonstrating the full integration workflow.

## Architecture Overview

```mermaid
graph TB
    subgraph "Your Web Application"
        D[Client Web App<br/>Any Framework]
        E[Tools Configuration<br/>JSON File]
    end
    
    subgraph "WebIntractMCP Ecosystem"
        B[WebIntractMCPServer]
        C["@web-intract-mcp/client"<br/>TypeScript Library]
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
npm install @web-intract-mcp/client
```

### 2. Run the MCP Server

```bash
# Using Docker
docker run -p 8080:8080 webintract-mcp-server

# Or build from source
cd server/WebIntractMCPServer
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
import { createWebIntractMCPController } from '@web-intract-mcp/client';

const controller = createWebIntractMCPController();
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
- 🐛 [Report Issues](https://github.com/Vijay-Nirmal/WebIntractMCP/issues)
- 💬 [Discussions](https://github.com/Vijay-Nirmal/WebIntractMCP/discussions)
- 📧 [Contact](mailto:me@vijaynirmal.com)
