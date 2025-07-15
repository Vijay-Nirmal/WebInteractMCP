---
title: "React Quick Start"
order: 2
category: "Quick Start Guides"
---

# React Quick Start

## Installation

```bash
npm install @web-interact-mcp/client
```

## Basic Setup

### 1. Create WebInteractMCP Hook

```typescript
// hooks/useWebInteractMCP.ts
import { useState, useCallback } from 'react';
import { createWebInteractMCPController, WebInteractMCPController } from '@web-interact-mcp/client';

export function useWebInteractMCP() {
  const [controller, setController] = useState<WebInteractMCPController | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initialize = useCallback(async (serverUrl: string = 'http://localhost:8080') => {
    try {
      const mcpController = createWebInteractMCPController();
      await mcpController.loadTools('/mcp-tools.json');
      await mcpController.createSession(serverUrl);
      
      setController(mcpController);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize WebInteractMCP:', error);
    }
  }, []);

  return { controller, isConnected, initialize };
}
```

### 2. Initialize in App Component

```typescript
// App.tsx
import React, { useEffect } from 'react';
import { useWebInteractMCP } from './hooks/useWebInteractMCP';

function App() {
  const { initialize, isConnected } = useWebInteractMCP();

  useEffect(() => {
    initialize(); // Connect to WebInteractMCPServer
  }, [initialize]);

  return (
    <div className="App">
      <h1>My React App with WebInteractMCP</h1>
      {isConnected && <span>✅ MCP Connected</span>}
      <button data-testid="submit-btn">Click Me</button>
    </div>
  );
}

export default App;
```

### 3. Create MCP Tools Configuration

Create `public/mcp-tools.json`:

```json
[
  {
    "toolId": "click-button",
    "title": "Click Button",
    "description": "Clicks a button on the page",
    "mode": "silent",
    "steps": [
      {
        "targetElement": "[data-testid='submit-btn']",
        "action": {
          "type": "click",
          "element": "[data-testid='submit-btn']"
        }
      }
    ]
  }
]
```

## Environment Configuration

```bash
# .env
REACT_APP_MCP_SERVER_URL=http://localhost:8080
```

```typescript
// Use in hook
const serverUrl = process.env.REACT_APP_MCP_SERVER_URL || 'http://localhost:8080';
```

## Next Steps

- [Angular Quick Start](./angular) - Angular integration guide
- [Vue Quick Start](./vue) - Vue.js integration guide
- [API Reference](../api-reference) - Complete API documentation
