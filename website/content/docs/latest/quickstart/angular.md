---
title: "Angular Quick Start"
order: 3
category: "Quick Start Guides"
---

# Angular Quick Start

## Installation

```bash
npm install @web-intract-mcp/client
```

## Basic Setup

### 1. Create Angular Service

```typescript
// services/@web-intract-mcp/client.service.ts
import { Injectable } from '@angular/core';
import { createWebIntractMCPController, WebIntractMCPController } from '@web-intract-mcp/client';

@Injectable({
  providedIn: 'root'
})
export class WebIntractMCPService {
  private controller: WebIntractMCPController | null = null;
  
  async initialize(serverUrl: string = 'http://localhost:8080'): Promise<void> {
    try {
      this.controller = createWebIntractMCPController();
      await this.controller.loadTools('/assets/mcp-tools.json');
      await this.controller.createSession(serverUrl);
    } catch (error) {
      console.error('Failed to initialize WebIntractMCP:', error);
      throw error;
    }
  }

  getController(): WebIntractMCPController | null {
    return this.controller;
  }
}
```

### 2. Initialize in App Component

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { WebIntractMCPService } from './services/@web-intract-mcp/client.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <h1>My Angular App with WebIntractMCP</h1>
      <button data-cy="submit-btn">Click Me</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private webIntractMCPService: WebIntractMCPService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.webIntractMCPService.initialize(); // Connect to WebIntractMCPServer
    } catch (error) {
      console.error('Failed to initialize WebIntractMCP:', error);
    }
  }
}
```

### 3. Create MCP Tools Configuration

Create `src/assets/mcp-tools.json`:

```json
[
  {
    "toolId": "angular-click-demo",
    "title": "Angular Click Demo",
    "description": "Demonstrates clicking a button in Angular",
    "mode": "silent",
    "steps": [
      {
        "targetElement": "[data-cy='submit-btn']",
        "action": {
          "type": "click",
          "element": "[data-cy='submit-btn']"
        }
      }
    ]
  }
]
```

## Docker Configuration (WebIntractMCPServer)

If using Docker deployment, update server URL:

```typescript
// Use Docker container URL
async initialize(): Promise<void> {
  const serverUrl = 'http://localhost:8080'; // Docker mapped port
  // ... rest of initialization
}
```

## Next Steps

- [React Quick Start](./react) - React integration guide
- [Vue Quick Start](./vue) - Vue.js integration guide
- [API Reference](../api-reference) - Complete API documentation
