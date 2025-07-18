# <img src="logo.svg" alt="WebInteractMCP Logo" width="32" height="32" style="vertical-align: middle;"> WebInteractMCP

> Transform any web application into an MCP server with real-time two-way communication

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Development Status](https://img.shields.io/badge/Status-Active%20Development-orange)](https://github.com/Vijay-Nirmal/WebInteractMCP)
[![Version](https://img.shields.io/badge/Version-Pre--1.0-red)](https://github.com/Vijay-Nirmal/WebInteractMCP)

WebInteractMCP is an innovative MCP (Model Context Protocol) ecosystem that enables any web application to become an MCP server, allowing chatbots and other MCP clients to control client sessions and complete intended actions on behalf of users.

> **📢 Check out the preview version available now!** This project is in active development. Expect breaking changes in future releases as we evolve toward version 1.0.

## 🚀 Overview

WebInteractMCP consists of two tightly integrated components that work together to create a seamless MCP experience:

- **📚 [@web-interact-mcp/client](lib/web-interact-mcp)** - TypeScript library for client-side integration
- **🖥️ [WebInteractMCPServer](server/WebInteractMCPServer)** - Ready to deploy Docker MCP server image for protocol handling

## ✨ Key Features

- **🔧 Support full MCP Tool protocol** - including tool discovery, invocation, and all type of response Text, Image, Audio others
- **🔄 Real-time Communication** - Robust bidirectional communication using SignalR which support WebSockets, ServerSentEvents, LongPolling
- **🛠️ Dynamic Tool Registration** - Configure tools with simple JSON files
- **🎯 Session-based Control** - Per-user session management for secure isolation
- **🌐 Framework Agnostic** - Works with any JavaScript framework (React, Angular, Vue, etc.)
- **⚡ Production Ready** - Comprehensive error handling and performance optimization
- **🔧 Simple Configuration** - Easy setup with JSON-based tool definitions
- **📦 Docker Support** - Ready-to-use Docker image for easy deployment
- **📄 Page-specific Tools** - Define tools that can interact with specific pages or elements
- **🎨 Visual Feedback** - Provides visual feedback for tool execution and user actions

## 🎬 Demo

https://github.com/user-attachments/assets/bf9d15a6-fa4a-40a0-8543-cb0fd92bffac

*Click to view the demonstration of WebInteractMCP transforming a web application into an MCP server*

## 🏗️ Architecture

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant W as 🌐 Website
    participant C as 📦 @web-interact-mcp/client
    participant CB as 🤖 MCP Client<br/>(ChatBot Server)
    participant MS as 🖥️ WebInteractMCPServer

    %% Styling
    Note over U,MS: WebInteractMCP Communication Flow
    
    rect rgba(135, 206, 235, 0.1)
        Note over U,MS: 🚀 Session Initialization Phase
        U->>+W: 💬 Opens chat session
        W->>+C: 🔧 Initialize MCP session
        C->>+MS: 🔗 Establish 2-way connection<br/>(SignalR WebSocket)
        MS-->>-C: ✅ Connection established
        C->>+MS: 🛠️ Send tools configuration
        MS-->>-C: 🆔 Return session ID
        C-->>-W: 📋 Provide session ID
        W-->>-U: 🟢 Session ready
    end

    rect rgba(144, 238, 144, 0.1)
        Note over U,MS: 📝 Task Processing Phase
        U->>+W: ⌨️ Enters task/query
        W->>+CB: 📤 Send request with session ID
        CB->>+MS: 🔌 Connect & register tools
        MS-->>-CB: 🛠️ Return available tools
        CB->>CB: 🧠 LLM processes task<br/>& selects tools
    end
    
    rect rgba(255, 182, 193, 0.1)
        Note over U,MS: ⚡ Tool Execution Phase
        CB->>+MS: 🎯 Invoke tool with parameters
        MS->>+C: 📨 Forward tool invocation
        C->>+W: 🖱️ Execute actions<br/>(DOM manipulation, clicks)
        W-->>-C: 📊 Return execution result
        C-->>-MS: 📤 Send tool response
        MS-->>-CB: 📥 Forward response to LLM
        CB->>+W: 🎨 Return processed result
        W-->>-U: 📺 Display response
    end
```

## 🚀 Quick Start

### 1. Install the Client Library

```bash
# Install the stable version (Not available yet)
npm install @web-interact-mcp/client

# Or install the latest preview version
npm install @web-interact-mcp/client@preview
```

### 2. Configure Your Tools

Create a `mcp-tools.json` file:

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

### 3. Initialize in Your Web App

```typescript
import { createWebInteractMCPController } from '@web-interact-mcp/client';

const controller = createWebInteractMCPController();
await controller.loadTools('/mcp-tools.json');
await controller.createSession('http://localhost:8080');
```

### 4. Run the MCP Server

```bash
# Using Docker
docker run -p 8080:8080 webinteract-mcp-server

# Or build from source
cd server/WebInteractMCPServer
dotnet run
```

## 📁 Project Structure

```
WebInteractMCP/
├── lib/web-interact-mcp/           # TypeScript MCP Library
│   ├── src/                       # Source code
│   └── README.md                  # Library documentation
├── server/WebInteractMCPServer/    # .NET MCP Server
│   ├── Program.cs                 # Server entry point
│   └── README.md                  # Server documentation
├── sample/                        # Reference implementations
│   └── angular-dotnetnet-semantic-kernel/
```

## 🎯 Use Cases

- **Automated Testing** - Control web applications for E2E testing
- **User Onboarding** - Create guided tours and tutorials
- **Process Automation** - Automate repetitive web-based tasks
- **Accessibility** - Provide AI-powered navigation assistance
- **Data Entry** - Automate form filling and data collection

## 🔧 Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Client Library** | TypeScript 5.8+, SignalR, Shepherd.js |
| **MCP Server** | .NET 9, ASP.NET Core, SignalR |
| **Sample App** | Angular 20, Semantic Kernel |

## ⚠️ Development Status

**Initial preview version will be published soon. This project is in active development and has not yet reached version 1.0.**

- ✅ Core functionality is working
- ✅ Production-ready components available
- 🚀 Check out the preview version available now
- ⚠️ Breaking changes expected in future releases
- ⚠️ API is subject to change before 1.0 release

Feel free to use it in your projects, but be prepared for potential breaking changes as we approach the initial preview release.

## 📖 Documentation

- [Client Library Guide](lib/web-interact-mcp/README.md) - Complete TypeScript library documentation
- [Server Setup Guide](server/README.md) - MCP server configuration and deployment
- [Sample Implementation](sample/angular-dotnetnet-semantic-kernel/README.md) - Working example with Angular and .NET

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](.github/copilot-instructions.md) for development standards and workflow.

### Development Workflow

```bash
# Setup
npm install
cd lib/web-interact-mcp && npm install
cd sample/angular-dotnetnet-semantic-kernel && npm install

# Start development environment with sample app
cd sample/angular-dotnetnet-semantic-kernel
npm run start:server    # Web Interact MCP server
npm run start:client    # .NET client backend sample app
npm run start           # Angular frontend sample app
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Issues](https://github.com/Vijay-Nirmal/WebInteractMCP/issues) - Report bugs or request features
- [Discussions](https://github.com/Vijay-Nirmal/WebInteractMCP/discussions) - Community discussions

---

**Built with ❤️ for the MCP ecosystem**
