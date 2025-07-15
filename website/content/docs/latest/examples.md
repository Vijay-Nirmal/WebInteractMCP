---
title: "Examples"
order: 5
category: "Examples"
---

# Examples

Real-world implementation examples and use cases for WebInteractMCP.

## Basic Examples

### Simple Button Click

```json
{
  "toolId": "simple-click",
  "title": "Simple Button Click",
  "description": "Clicks a button on the page",
  "mode": "silent",
  "steps": [
    {
      "targetElement": "#submit-btn",
      "action": { "type": "click", "element": "#submit-btn" }
    }
  ]
}
```

### Form Filling

```json
{
  "toolId": "fill-contact-form",
  "title": "Fill Contact Form",
  "description": "Fills out a contact form with provided information",
  "mode": "guided",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Contact name" },
      "email": { "type": "string", "description": "Email address" },
      "message": { "type": "string", "description": "Contact message" }
    },
    "required": ["name", "email", "message"]
  },
  "steps": [
    {
      "targetElement": "#name",
      "action": { "type": "type", "element": "#name", "value": "{{name}}" },
      "description": "Entering your name..."
    },
    {
      "targetElement": "#email",
      "action": { "type": "type", "element": "#email", "value": "{{email}}" },
      "description": "Entering your email..."
    },
    {
      "targetElement": "#message",
      "action": { "type": "type", "element": "#message", "value": "{{message}}" },
      "description": "Entering your message..."
    },
    {
      "targetElement": "#submit",
      "action": { "type": "click", "element": "#submit" },
      "description": "Submitting the form..."
    }
  ]
}
```

## E-commerce Examples

### Product Search and Add to Cart

```json
{
  "toolId": "product-search-add-cart",
  "title": "Search and Add Product to Cart",
  "description": "Searches for a product and adds it to the shopping cart",
  "mode": "guided",
  "parameters": {
    "type": "object",
    "properties": {
      "productName": {
        "type": "string",
        "description": "Name of the product to search for"
      },
      "quantity": {
        "type": "number",
        "description": "Quantity to add to cart",
        "default": 1
      }
    },
    "required": ["productName"]
  },
  "steps": [
    {
      "targetElement": "#search-input",
      "action": {
        "type": "type",
        "element": "#search-input",
        "value": "{{productName}}",
        "options": { "clearFirst": true }
      },
      "description": "Searching for {{productName}}..."
    },
    {
      "targetElement": "#search-button",
      "action": { "type": "click", "element": "#search-button" },
      "description": "Executing search..."
    },
    {
      "targetElement": ".search-results",
      "action": { 
        "type": "wait", 
        "element": ".search-results",
        "options": { "timeout": 5000 }
      },
      "description": "Waiting for search results...",
      "validation": {
        "type": "exists",
        "expected": true,
        "errorMessage": "No search results found"
      }
    },
    {
      "targetElement": ".product-item:first-child .add-to-cart",
      "action": { "type": "click", "element": ".product-item:first-child .add-to-cart" },
      "description": "Adding product to cart..."
    },
    {
      "targetElement": ".cart-notification",
      "action": { 
        "type": "wait", 
        "element": ".cart-notification",
        "options": { "timeout": 3000 }
      },
      "description": "Confirming product was added...",
      "validation": {
        "type": "text",
        "expected": "Added to cart",
        "errorMessage": "Product was not added to cart"
      }
    }
  ]
}
```

### Complete Checkout Process

```json
{
  "toolId": "complete-checkout",
  "title": "Complete Checkout Process",
  "description": "Guides user through the entire checkout process",
  "mode": "interactive",
  "parameters": {
    "type": "object",
    "properties": {
      "customerInfo": {
        "type": "object",
        "properties": {
          "firstName": { "type": "string" },
          "lastName": { "type": "string" },
          "email": { "type": "string" },
          "phone": { "type": "string" }
        },
        "required": ["firstName", "lastName", "email"]
      },
      "shippingAddress": {
        "type": "object",
        "properties": {
          "address": { "type": "string" },
          "city": { "type": "string" },
          "state": { "type": "string" },
          "zipCode": { "type": "string" }
        },
        "required": ["address", "city", "state", "zipCode"]
      }
    },
    "required": ["customerInfo", "shippingAddress"]
  },
  "steps": [
    {
      "targetElement": "#cart-icon",
      "action": { "type": "click", "element": "#cart-icon" },
      "description": "Opening shopping cart..."
    },
    {
      "targetElement": "#checkout-btn",
      "action": { "type": "click", "element": "#checkout-btn" },
      "description": "Proceeding to checkout..."
    },
    {
      "targetElement": "#first-name",
      "action": { 
        "type": "type", 
        "element": "#first-name", 
        "value": "{{customerInfo.firstName}}" 
      },
      "description": "Filling in personal information..."
    },
    {
      "targetElement": "#last-name",
      "action": { 
        "type": "type", 
        "element": "#last-name", 
        "value": "{{customerInfo.lastName}}" 
      }
    },
    {
      "targetElement": "#email",
      "action": { 
        "type": "type", 
        "element": "#email", 
        "value": "{{customerInfo.email}}" 
      }
    },
    {
      "targetElement": "#shipping-address",
      "action": { 
        "type": "type", 
        "element": "#shipping-address", 
        "value": "{{shippingAddress.address}}" 
      },
      "description": "Filling in shipping address..."
    },
    {
      "targetElement": "#city",
      "action": { 
        "type": "type", 
        "element": "#city", 
        "value": "{{shippingAddress.city}}" 
      }
    },
    {
      "targetElement": "#state",
      "action": { 
        "type": "select", 
        "element": "#state", 
        "value": "{{shippingAddress.state}}" 
      }
    },
    {
      "targetElement": "#zip-code",
      "action": { 
        "type": "type", 
        "element": "#zip-code", 
        "value": "{{shippingAddress.zipCode}}" 
      }
    },
    {
      "targetElement": "#continue-to-payment",
      "action": { "type": "click", "element": "#continue-to-payment" },
      "description": "Proceeding to payment information..."
    }
  ]
}
```

## Testing Examples

### Automated Login Test

```json
{
  "toolId": "login-test",
  "title": "Automated Login Test",
  "description": "Tests the login functionality with validation",
  "mode": "silent",
  "parameters": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "description": "Test username" },
      "password": { "type": "string", "description": "Test password" },
      "expectedRedirect": { 
        "type": "string", 
        "description": "Expected redirect URL after login",
        "default": "/dashboard"
      }
    },
    "required": ["username", "password"]
  },
  "steps": [
    {
      "targetElement": "#username",
      "action": { 
        "type": "type", 
        "element": "#username", 
        "value": "{{username}}",
        "options": { "clearFirst": true }
      }
    },
    {
      "targetElement": "#password",
      "action": { 
        "type": "type", 
        "element": "#password", 
        "value": "{{password}}",
        "options": { "clearFirst": true }
      }
    },
    {
      "targetElement": "#login-btn",
      "action": { "type": "click", "element": "#login-btn" }
    },
    {
      "targetElement": "body",
      "action": { 
        "type": "wait", 
        "element": "body",
        "options": { "timeout": 5000 }
      },
      "validation": {
        "type": "custom",
        "script": "window.location.pathname === '{{expectedRedirect}}'",
        "errorMessage": "Login failed - not redirected to expected page"
      }
    }
  ]
}
```

### Form Validation Test

```json
{
  "toolId": "form-validation-test",
  "title": "Form Validation Test",
  "description": "Tests form validation by submitting invalid data",
  "mode": "silent",
  "steps": [
    {
      "targetElement": "#email",
      "action": { 
        "type": "type", 
        "element": "#email", 
        "value": "invalid-email"
      }
    },
    {
      "targetElement": "#submit-btn",
      "action": { "type": "click", "element": "#submit-btn" }
    },
    {
      "targetElement": ".error-message",
      "action": { 
        "type": "wait", 
        "element": ".error-message",
        "options": { "timeout": 3000 }
      },
      "validation": {
        "type": "text",
        "expected": "Please enter a valid email address",
        "errorMessage": "Expected validation message not shown"
      }
    }
  ]
}
```

## User Onboarding Examples

### Interactive Tutorial

```json
{
  "toolId": "app-tutorial",
  "title": "App Tutorial",
  "description": "Interactive tutorial for new users",
  "mode": "guided",
  "steps": [
    {
      "targetElement": "#dashboard",
      "action": { "type": "highlight", "element": "#dashboard" },
      "description": "Welcome to your dashboard! This is where you'll find all your important information and quick actions."
    },
    {
      "targetElement": "#navigation-menu",
      "action": { "type": "highlight", "element": "#navigation-menu" },
      "description": "Use this navigation menu to access different sections of the application."
    },
    {
      "targetElement": "#profile-button",
      "action": { "type": "click", "element": "#profile-button" },
      "description": "Click here to access your profile settings and preferences."
    },
    {
      "targetElement": "#notifications",
      "action": { "type": "highlight", "element": "#notifications" },
      "description": "Keep track of important updates and notifications here."
    },
    {
      "targetElement": "#help-center",
      "action": { "type": "highlight", "element": "#help-center" },
      "description": "If you need help, you can always access our help center from here."
    }
  ]
}
```

### Feature Introduction

```json
{
  "toolId": "new-feature-intro",
  "title": "New Feature Introduction",
  "description": "Introduces users to a new feature",
  "mode": "guided",
  "steps": [
    {
      "targetElement": "#new-feature-badge",
      "action": { "type": "highlight", "element": "#new-feature-badge" },
      "description": "We've added a new feature! Let me show you how it works."
    },
    {
      "targetElement": "#feature-button",
      "action": { "type": "click", "element": "#feature-button" },
      "description": "Click here to access the new feature."
    },
    {
      "targetElement": "#feature-panel",
      "action": { "type": "highlight", "element": "#feature-panel" },
      "description": "This panel shows all the new functionality available to you."
    },
    {
      "targetElement": "#try-feature-btn",
      "action": { "type": "highlight", "element": "#try-feature-btn" },
      "description": "Ready to try it out? Click this button to get started!"
    }
  ]
}
```

## Advanced Examples

### Conditional Workflow

```json
{
  "toolId": "conditional-workflow",
  "title": "Conditional Workflow",
  "description": "Workflow that adapts based on page state",
  "mode": "silent",
  "steps": [
    {
      "targetElement": "#user-status",
      "action": { "type": "conditional", "element": "#user-status" },
      "condition": {
        "type": "text",
        "element": "#user-status",
        "expected": "Premium"
      },
      "onTrue": [
        {
          "targetElement": "#premium-features",
          "action": { "type": "click", "element": "#premium-features" }
        }
      ],
      "onFalse": [
        {
          "targetElement": "#upgrade-prompt",
          "action": { "type": "click", "element": "#upgrade-prompt" }
        }
      ]
    }
  ]
}
```

### Loop Example

```json
{
  "toolId": "process-all-items",
  "title": "Process All Items",
  "description": "Processes all items in a list",
  "mode": "silent",
  "steps": [
    {
      "targetElement": ".list-item",
      "action": { "type": "loop", "element": ".list-item" },
      "forEach": {
        "steps": [
          {
            "targetElement": ".item-checkbox",
            "action": { "type": "click", "element": ".item-checkbox" }
          },
          {
            "targetElement": ".process-btn",
            "action": { "type": "click", "element": ".process-btn" }
          }
        ]
      }
    }
  ]
}
```

### Multi-step Wizard

```json
{
  "toolId": "setup-wizard",
  "title": "Setup Wizard",
  "description": "Guides user through multi-step setup process",
  "mode": "interactive",
  "parameters": {
    "type": "object",
    "properties": {
      "preferences": {
        "type": "object",
        "properties": {
          "theme": { "type": "string", "enum": ["light", "dark"] },
          "notifications": { "type": "boolean" },
          "language": { "type": "string", "default": "en" }
        }
      }
    }
  },
  "steps": [
    {
      "targetElement": "#step-1",
      "action": { "type": "highlight", "element": "#step-1" },
      "description": "Let's set up your preferences. First, choose your preferred theme."
    },
    {
      "targetElement": "#theme-{{preferences.theme}}",
      "action": { "type": "click", "element": "#theme-{{preferences.theme}}" },
      "description": "Great choice! Now let's configure notifications."
    },
    {
      "targetElement": "#notifications-toggle",
      "action": { 
        "type": "conditional",
        "condition": {
          "type": "value",
          "expected": "{{preferences.notifications}}"
        },
        "onTrue": [
          { "action": { "type": "click", "element": "#notifications-toggle" } }
        ]
      }
    },
    {
      "targetElement": "#next-step",
      "action": { "type": "click", "element": "#next-step" },
      "description": "Perfect! Let's move to the next step."
    }
  ]
}
```

## Framework-Specific Examples

### React Hook Integration

```typescript
import { useEffect, useRef } from 'react';
import { createWebInteractMCPController } from '@web-interact-mcp/client';

function useMCP() {
  const controllerRef = useRef(null);

  useEffect(() => {
    const initMCP = async () => {
      controllerRef.current = createWebInteractMCPController();
      await controllerRef.current.loadTools('/mcp-tools.json');
      await controllerRef.current.createSession();
    };

    initMCP();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.disconnect();
      }
    };
  }, []);

  const executeTool = async (toolId, parameters) => {
    if (controllerRef.current) {
      return await controllerRef.current.executeTool(toolId, parameters);
    }
  };

  return { executeTool };
}

// Usage in component
function MyComponent() {
  const { executeTool } = useMCP();

  const handleButtonClick = async () => {
    await executeTool('demo-tool', { message: 'Hello World' });
  };

  return (
    <button onClick={handleButtonClick}>
      Execute MCP Tool
    </button>
  );
}
```

### Angular Service Integration

```typescript
import { Injectable, OnDestroy } from '@angular/core';
import { createWebInteractMCPController } from '@web-interact-mcp/client';

@Injectable({
  providedIn: 'root'
})
export class McpService implements OnDestroy {
  private controller: any;

  async initialize() {
    this.controller = createWebInteractMCPController({
      enableLogging: true
    });
    
    await this.controller.loadTools('/assets/mcp-tools.json');
    await this.controller.createSession();
  }

  async executeTool(toolId: string, parameters?: any) {
    if (!this.controller) {
      await this.initialize();
    }
    
    return await this.controller.executeTool(toolId, parameters);
  }

  ngOnDestroy() {
    if (this.controller) {
      this.controller.disconnect();
    }
  }
}

// Usage in component
@Component({
  selector: 'app-demo',
  template: `
    <button (click)="runDemo()">Run Demo</button>
  `
})
export class DemoComponent {
  constructor(private mcpService: McpService) {}

  async runDemo() {
    await this.mcpService.executeTool('guided-tour');
  }
}
```

### Vue Composition API

```vue
<template>
  <div>
    <button @click="runTool">Execute Tool</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createWebInteractMCPController } from '@web-interact-mcp/client';

const controller = ref(null);

onMounted(async () => {
  controller.value = createWebInteractMCPController();
  await controller.value.loadTools('/mcp-tools.json');
  await controller.value.createSession();
});

onUnmounted(() => {
  if (controller.value) {
    controller.value.disconnect();
  }
});

const runTool = async () => {
  if (controller.value) {
    await controller.value.executeTool('example-tool');
  }
};
</script>
```

## Error Handling Examples

### Robust Error Handling

```json
{
  "toolId": "robust-form-submit",
  "title": "Robust Form Submit",
  "description": "Form submission with comprehensive error handling",
  "mode": "silent",
  "errorHandling": {
    "retries": 3,
    "retryDelay": 1000,
    "onError": [
      {
        "action": { "type": "click", "element": ".error-close" }
      },
      {
        "action": { "type": "wait", "options": { "timeout": 1000 } }
      }
    ]
  },
  "steps": [
    {
      "targetElement": "#submit-btn",
      "action": { "type": "click", "element": "#submit-btn" },
      "validation": {
        "type": "exists",
        "element": ".success-message",
        "timeout": 5000,
        "errorMessage": "Form submission failed"
      },
      "onError": [
        {
          "action": { "type": "click", "element": "#retry-btn" }
        }
      ]
    }
  ]
}
```

## Performance Examples

### Optimized Selectors

```json
{
  "toolId": "optimized-selectors",
  "title": "Optimized Selectors",
  "description": "Uses efficient selectors for better performance",
  "mode": "silent",
  "steps": [
    {
      "targetElement": "[data-testid='submit-button']",
      "action": { "type": "click", "element": "[data-testid='submit-button']" }
    },
    {
      "targetElement": "#unique-id",
      "action": { "type": "type", "element": "#unique-id", "value": "test" }
    },
    {
      "targetElement": ".js-specific-class",
      "action": { "type": "click", "element": ".js-specific-class" }
    }
  ]
}
```

These examples demonstrate the flexibility and power of WebInteractMCP across various use cases and frameworks. Each example can be adapted to your specific needs and requirements.
