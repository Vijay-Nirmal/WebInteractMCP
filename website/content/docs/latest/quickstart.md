---
title: "Quick Start"
order: 2
category: "Quick Start Guides"
--## Vue.js Integration

```bash
npm install @web-intract-mcp/client
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <h1>My Vue App with WebIntractMCP</h1>
    <button data-testid="submit-btn">Click Me</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { createWebIntractMCPController } from '@web-intract-mcp/client';pecific Quick Start Guides

Choose your framework and get started in minutes with minimal setup!

## React Integration

```bash
npm install @web-intract-mcp/client
```

```tsx
// App.tsx
import React, { useEffect } from 'react';
import { createWebIntractMCPController } from '@web-intract-mcp/client';

function App() {
  useEffect(() => {
    const initMCP = async () => {
      const controller = createWebIntractMCPController();
      await controller.loadTools('/mcp-tools.json');
      await controller.createSession('http://localhost:8080'); // Connect to WebIntractMCPServer
    };
    initMCP();
  }, []);

  return (
    <div className="App">
      <h1>My React App with WebIntractMCP</h1>
      <button data-testid="submit-btn">Click Me</button>
    </div>
  );
}
```

[**→ Full React Guide**](./react)

## Angular Integration

```bash
npm install @web-intract-mcp/client
```

```typescript
// mcp.service.ts
import { Injectable } from '@angular/core';
import { createWebIntractMCPController } from '@web-intract-mcp/client';

@Injectable({ providedIn: 'root' })
export class McpService {
  async initialize() {
    const controller = createWebIntractMCPController();
    await controller.loadTools('/assets/mcp-tools.json');
    await controller.createSession('http://localhost:8080'); // Connect to WebIntractMCPServer
  }
}

// app.component.ts
export class AppComponent implements OnInit {
  constructor(private mcpService: McpService) {}
  async ngOnInit() { await this.mcpService.initialize(); }
}
```

[**→ Full Angular Guide**](./angular)

## Vue.js Integration

```bash
npm install web-intract-mcp
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <h1>My Vue App with WebIntractMCP</h1>
    <button data-testid="submit-btn">Click Me</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { createWebIntractMCPController } from 'web-intract-mcp';

onMounted(async () => {
  const controller = createWebIntractMCPController();
  await controller.loadTools('/mcp-tools.json');
  await controller.createSession('http://localhost:8080'); // Connect to WebIntractMCPServer
});
</script>
```

[**→ Full Vue Guide**](./vue)

## Basic MCP Tools Configuration

Create your tools configuration file:

**React/Vue:** `public/mcp-tools.json`  
**Angular:** `src/assets/mcp-tools.json`

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
REACT_APP_MCP_SERVER_URL=http://localhost:8080    # React
VITE_MCP_SERVER_URL=http://localhost:8080         # Vue
# Angular: use environment.ts
```

## Next Steps

- [React Quick Start](./react) - Complete React integration
- [Angular Quick Start](./angular) - Complete Angular integration  
- [Vue Quick Start](./vue) - Complete Vue.js integration
- [API Reference](../api-reference) - Complete API documentation
