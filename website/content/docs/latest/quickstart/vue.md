---
title: "Vue Quick Start"
order: 4
category: "Quick Start Guides"
---

# Vue Quick Start

## Installation

```bash
npm install @web-interact-mcp/client
```

## Basic Setup

### 1. Create Vue Composable

```typescript
// composables/use-@web-interact-mcp/client.ts
import { ref, onMounted } from 'vue';
import { createWebInteractMCPController, WebInteractMCPController } from '@web-interact-mcp/client';

export function useWebInteractMCP(serverUrl: string = 'http://localhost:8080') {
  const controller = ref<WebInteractMCPController | null>(null);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      controller.value = createWebInteractMCPController();
      await controller.value.loadTools('/mcp-tools.json');
      await controller.value.createSession(serverUrl);
      isConnected.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to initialize WebInteractMCP:', err);
    }
  });

  return {
    controller: controller.value,
    isConnected,
    error
  };
}
```

### 2. Use in Vue Component

```vue
<!-- App.vue -->
<template>
  <div class="app-container">
    <h1>My Vue App with WebInteractMCP</h1>
    <button data-cy="submit-btn">Click Me</button>
    
    <div v-if="error" class="error">
      Error: {{ error }}
    </div>
    <div v-else-if="isConnected" class="success">
      Connected to WebInteractMCPServer
    </div>
    <div v-else class="loading">
      Connecting...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWebInteractMCP } from './composables/use-@web-interact-mcp/client';

const { controller, isConnected, error } = useWebInteractMCP(); // Connect to WebInteractMCPServer
</script>
```

### 3. Create MCP Tools Configuration

Create `public/mcp-tools.json`:

```json
[
  {
    "toolId": "vue-click-demo",
    "title": "Vue Click Demo", 
    "description": "Demonstrates clicking a button in Vue",
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
const { controller, isConnected, error } = useWebInteractMCP('http://localhost:8080'); // Docker mapped port
```

## Next Steps

- [React Quick Start](./react) - React integration guide
- [Angular Quick Start](./angular) - Angular integration guide  
- [API Reference](../api-reference) - Complete API documentation
