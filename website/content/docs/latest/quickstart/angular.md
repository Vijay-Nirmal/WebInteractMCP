---
title: "Angular Quick Start"
order: 3
category: "Quick Start Guides"
---

# Angular Quick Start

## Installation

```bash
npm install @web-interact-mcp/client
```

## Basic Setup

### 1. Create Angular Service

```typescript
// services/@web-interact-mcp/client.service.ts
import { Injectable } from '@angular/core';
import { createWebInteractMCPController, WebInteractMCPController } from '@web-interact-mcp/client';

@Injectable({
  providedIn: 'root'
})
export class WebInteractMCPService {
  private controller: WebInteractMCPController | null = null;
  
  async initialize(serverUrl: string = 'http://localhost:8080'): Promise<void> {
    try {
      this.controller = createWebInteractMCPController();
      await this.controller.loadTools('/assets/mcp-tools.json');
      await this.controller.createSession(serverUrl);
    } catch (error) {
      console.error('Failed to initialize WebInteractMCP:', error);
      throw error;
    }
  }

  getController(): WebInteractMCPController | null {
    return this.controller;
  }
}
```

### 2. Initialize in App Component

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { WebInteractMCPService } from './services/@web-interact-mcp/client.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <h1>My Angular App with WebInteractMCP</h1>
      <button data-cy="submit-btn">Click Me</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private webInteractMCPService: WebInteractMCPService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.webInteractMCPService.initialize(); // Connect to WebInteractMCPServer
    } catch (error) {
      console.error('Failed to initialize WebInteractMCP:', error);
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

## Docker Configuration (WebInteractMCPServer)

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
