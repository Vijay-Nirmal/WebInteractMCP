---
title: "Tool Configuration"
order: 3
category: "Configuration"
---

# Tool Configuration

Learn how to configure powerful MCP tools for your web application.

## Tool Structure

Every MCP tool is defined as a JSON object with the following structure:

```json
{
  "toolId": "unique-tool-identifier",
  "title": "Human Readable Title",
  "description": "Description of what this tool does",
  "mode": "silent | guided | interactive",
  "parameters": {
    "type": "object",
    "properties": {
      "paramName": {
        "type": "string",
        "description": "Parameter description"
      }
    }
  },
  "steps": [
    {
      "targetElement": "CSS selector",
      "action": {
        "type": "click | type | select | wait | custom",
        "element": "CSS selector",
        "value": "optional value",
        "options": {}
      },
      "description": "Step description for guided mode",
      "validation": {
        "type": "exists | visible | text | value",
        "expected": "expected value"
      }
    }
  ]
}
```

## Tool Properties

### Basic Properties

- **toolId**: Unique identifier for the tool
- **title**: Human-readable name displayed in MCP clients
- **description**: Detailed description of tool functionality
- **mode**: Execution mode (silent, guided, or interactive)

### Execution Modes

#### Silent Mode
Tool executes without user interaction:

```json
{
  "toolId": "silent-login",
  "title": "Auto Login",
  "description": "Automatically logs in a user",
  "mode": "silent",
  "steps": [
    {
      "targetElement": "#username",
      "action": { "type": "type", "element": "#username", "value": "{{username}}" }
    },
    {
      "targetElement": "#password",
      "action": { "type": "type", "element": "#password", "value": "{{password}}" }
    },
    {
      "targetElement": "#login-btn",
      "action": { "type": "click", "element": "#login-btn" }
    }
  ]
}
```

#### Guided Mode
Tool provides step-by-step guidance:

```json
{
  "toolId": "guided-onboarding",
  "title": "User Onboarding",
  "description": "Guides new users through app features",
  "mode": "guided",
  "steps": [
    {
      "targetElement": "#welcome-modal",
      "action": { "type": "wait", "element": "#welcome-modal" },
      "description": "Welcome! Let's get you started with our app."
    },
    {
      "targetElement": "#next-btn",
      "action": { "type": "click", "element": "#next-btn" },
      "description": "Click Next to continue to the dashboard."
    }
  ]
}
```

#### Interactive Mode
Tool waits for user confirmation at each step:

```json
{
  "toolId": "interactive-form",
  "title": "Form Completion",
  "description": "Helps users complete complex forms",
  "mode": "interactive",
  "steps": [
    {
      "targetElement": "#personal-info",
      "action": { "type": "highlight", "element": "#personal-info" },
      "description": "Please review your personal information"
    }
  ]
}
```

## Action Types

### Click Actions

```json
{
  "action": {
    "type": "click",
    "element": "#submit-btn",
    "options": {
      "waitForElement": true,
      "timeout": 5000
    }
  }
}
```

### Type Actions

```json
{
  "action": {
    "type": "type",
    "element": "#search-input",
    "value": "{{searchTerm}}",
    "options": {
      "clearFirst": true,
      "typeDelay": 100
    }
  }
}
```

### Select Actions

```json
{
  "action": {
    "type": "select",
    "element": "#country-dropdown",
    "value": "{{country}}",
    "options": {
      "byValue": true
    }
  }
}
```

### Wait Actions

```json
{
  "action": {
    "type": "wait",
    "element": "#loading-indicator",
    "options": {
      "waitFor": "disappear",
      "timeout": 10000
    }
  }
}
```

### Custom Actions

```json
{
  "action": {
    "type": "custom",
    "element": "#canvas",
    "options": {
      "script": "element.scrollIntoView({ behavior: 'smooth' })"
    }
  }
}
```

## Parameters

Define dynamic parameters for your tools:

```json
{
  "toolId": "search-products",
  "title": "Search Products",
  "description": "Searches for products with given criteria",
  "parameters": {
    "type": "object",
    "properties": {
      "searchTerm": {
        "type": "string",
        "description": "Product search term"
      },
      "category": {
        "type": "string",
        "description": "Product category",
        "enum": ["electronics", "clothing", "books"]
      },
      "priceRange": {
        "type": "object",
        "properties": {
          "min": { "type": "number" },
          "max": { "type": "number" }
        }
      }
    },
    "required": ["searchTerm"]
  }
}
```

## Validation

Add validation to ensure steps execute correctly:

```json
{
  "targetElement": "#search-results",
  "action": { "type": "wait", "element": "#search-results" },
  "validation": {
    "type": "exists",
    "expected": true,
    "errorMessage": "Search results not found"
  }
}
```

### Validation Types

- **exists**: Check if element exists
- **visible**: Check if element is visible
- **text**: Validate element text content
- **value**: Validate input element value
- **count**: Validate number of matching elements

## Advanced Configurations

### Conditional Steps

```json
{
  "targetElement": "#error-message",
  "action": { "type": "conditional", "element": "#error-message" },
  "condition": {
    "type": "visible",
    "element": "#error-message"
  },
  "onTrue": [
    {
      "action": { "type": "click", "element": "#retry-btn" }
    }
  ],
  "onFalse": [
    {
      "action": { "type": "click", "element": "#continue-btn" }
    }
  ]
}
```

### Loops

```json
{
  "targetElement": ".item",
  "action": { "type": "loop", "element": ".item" },
  "forEach": {
    "steps": [
      {
        "action": { "type": "click", "element": ".item-checkbox" }
      }
    ]
  }
}
```

### Error Handling

```json
{
  "toolId": "robust-form-submit",
  "title": "Robust Form Submit",
  "description": "Submits form with error handling",
  "errorHandling": {
    "retries": 3,
    "onError": [
      {
        "action": { "type": "click", "element": "#error-close" }
      }
    ]
  }
}
```

## Best Practices

### 1. Use Descriptive Tool IDs

```json
// Good
"toolId": "user-registration-flow"

// Bad
"toolId": "tool1"
```

### 2. Provide Clear Descriptions

```json
{
  "description": "Completes the user registration process by filling required fields and submitting the form"
}
```

### 3. Use Robust Selectors

```json
// Good - specific and stable
"targetElement": "[data-testid='submit-button']"

// Less ideal - fragile
"targetElement": ".btn.btn-primary.float-right"
```

### 4. Add Appropriate Timeouts

```json
{
  "action": {
    "type": "wait",
    "element": "#api-response",
    "options": {
      "timeout": 30000
    }
  }
}
```

### 5. Use Validation

```json
{
  "validation": {
    "type": "text",
    "expected": "Success",
    "errorMessage": "Form submission failed"
  }
}
```

## Example: Complete E-commerce Flow

```json
[
  {
    "toolId": "ecommerce-purchase-flow",
    "title": "Complete Purchase",
    "description": "Completes entire purchase flow from search to checkout",
    "mode": "guided",
    "parameters": {
      "type": "object",
      "properties": {
        "productName": {
          "type": "string",
          "description": "Name of product to purchase"
        },
        "quantity": {
          "type": "number",
          "description": "Quantity to purchase",
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
          "value": "{{productName}}"
        },
        "description": "Searching for your product..."
      },
      {
        "targetElement": "#search-btn",
        "action": {
          "type": "click",
          "element": "#search-btn"
        },
        "description": "Initiating search..."
      },
      {
        "targetElement": ".product-item:first-child",
        "action": {
          "type": "click",
          "element": ".product-item:first-child .add-to-cart"
        },
        "description": "Adding product to cart...",
        "validation": {
          "type": "text",
          "element": ".cart-notification",
          "expected": "Added to cart"
        }
      },
      {
        "targetElement": "#cart-icon",
        "action": {
          "type": "click",
          "element": "#cart-icon"
        },
        "description": "Opening cart..."
      },
      {
        "targetElement": "#checkout-btn",
        "action": {
          "type": "click",
          "element": "#checkout-btn"
        },
        "description": "Proceeding to checkout..."
      }
    ]
  }
]
```

## Next Steps

- [API Reference](./api-reference) - Complete API documentation
- [Examples](./examples) - More real-world examples
- [Troubleshooting](./troubleshooting) - Common issues and solutions
