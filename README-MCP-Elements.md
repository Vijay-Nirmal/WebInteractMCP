# MCP Elements

**A powerful TypeScript library that transforms ShepherdJS tours into configurable "Tools" for Mission Control Platform (MCP) servers to guide users and automate front-end tasks with stunning visual feedback.**

## 🚀 Introduction

MCP Elements is a revolutionary library that bridges the gap between guided user tours and automated task execution. Built on top of ShepherdJS, it allows you to create sophisticated, configurable tools that can:

- **Guide users** through complex workflows with interactive tours
- **Automate repetitive tasks** with silent background execution and visual feedback
- **Provide contextual help** with auto-advancing tutorials
- **Integrate seamlessly** with Mission Control Platform (MCP) servers
- **Show visual interactions** with animated effects for clicks, typing, and element highlighting

### What Problems Does It Solve?

1. **Complex UI Onboarding**: Transform complicated interfaces into step-by-step guided experiences
2. **Task Automation**: Automate repetitive user actions with realistic visual feedback
3. **Contextual Help**: Provide just-in-time assistance based on user location and needs
4. **Backend Integration**: Enable server-side systems to trigger front-end actions and guidance
5. **Configuration-Driven Workflows**: Create reusable tools through simple JSON configuration
6. **User Engagement**: Make automated actions visible and engaging with smooth animations

## ✨ Features

- **🎯 Three Execution Modes**: Normal (interactive), Buttonless (auto-advancing), Silent (automated)
- **🎬 Visual Feedback System**: Animated effects for clicks, typing, highlighting, and focus
- **⚙️ Configuration-Driven**: Define tools using simple JSON configurations
- **🔗 Dynamic Loading**: Load tools from arrays, URLs, or async functions
- **🌐 Page-Aware**: Tools can be global or page-specific with URL matching
- **🤖 MCP-Ready**: Built for integration with Mission Control Platform servers
- **📱 Parameter Support**: Dynamic tool execution with runtime parameters
- **🎛️ Event System**: Comprehensive event handling for integration
- **🛡️ Type-Safe**: Full TypeScript support with comprehensive type definitions
- **🎨 Customizable Animations**: Toggle visual effects on/off, customize animation styles

## 📦 Installation

```bash
npm install mcp-elements shepherd.js
```

## 🏗️ Configuration Schema

### ToolConfiguration

The core configuration object that defines a complete tool:

```typescript
interface ToolConfiguration {
  toolId: string;           // Unique identifier for the tool
  title: string;            // Human-readable title
  description: string;      // Detailed description for MCP servers
  mode: ToolMode;          // 'normal' | 'buttonless' | 'silent'
  pageMatcher?: string | RegExp;  // URL matching for availability
  global?: boolean;        // Available on all pages if true
  steps: ToolStep[];       // Array of tool steps
}
```

### ToolStep

Individual step configuration:

```typescript
interface ToolStep {
  targetElement: string;    // CSS selector for target element
  content: string;         // Text content for popups
  delay?: number;          // Auto-advance delay (buttonless mode)
  action?: ToolAction;     // Automated action (silent mode)
  shepherdOptions?: any;   // Additional ShepherdJS options
}
```

### ToolAction

Automated action configuration:

```typescript
interface ToolAction {
  type: 'click' | 'fillInput' | 'navigate' | 'selectOption';
  element: string;         // CSS selector for target
  value?: any;            // Action value (supports parameters)
}
```

### ToolMode

Three execution modes:

- **`normal`**: Standard ShepherdJS tour with next/back buttons
- **`buttonless`**: No buttons, steps advance automatically after specified delay
- **`silent`**: No UI popups, performs automated actions in background

## 📖 Usage Guide

### Basic Setup

```typescript
import { MCPElementsController, ToolConfiguration } from 'mcp-elements';

// Create controller instance with visual feedback enabled
const mcpController = new MCPElementsController({
  useModalOverlay: true,
  defaultStepOptions: {
    scrollTo: true
  }
}, true); // Enable visual feedback for automated actions

// Access the tool registry
const registry = mcpController.getRegistry();

// Control visual feedback
mcpController.setVisualFeedbackEnabled(true);  // Enable animations
mcpController.setVisualFeedbackEnabled(false); // Disable animations
```

### Loading Tools

#### From Local Array

```typescript
const tools: ToolConfiguration[] = [
  {
    toolId: 'welcome-tour',
    title: 'Welcome Tour',
    description: 'Introduces new users to the platform',
    mode: 'normal',
    global: true,
    steps: [
      {
        targetElement: '.header',
        content: 'Welcome to our platform! This is the main navigation.'
      },
      {
        targetElement: '.sidebar',
        content: 'Use this sidebar to access different sections.'
      }
    ]
  }
];

await registry.loadTools(tools);
```

#### From Remote URL

```typescript
// Load from JSON endpoint
await registry.loadTools('https://api.example.com/tools.json');
```

#### From Async Function

```typescript
await registry.loadTools(async () => {
  const response = await fetch('/api/dynamic-tools');
  return await response.json();
});
```

### Starting Tools

#### Single Tool

```typescript
mcpController.start([{ toolId: 'welcome-tour' }]);
```

#### Tool Sequence

```typescript
mcpController.start([
  { toolId: 'welcome-tour' },
  { toolId: 'feature-demo' },
  { toolId: 'completion-survey' }
]);
```

#### With Parameters

```typescript
mcpController.start([{
  toolId: 'user-onboarding',
  params: {
    userName: 'John Doe',
    userRole: 'admin'
  }
}]);

// Tool steps can use parameters like: "Welcome {{userName}}!"
```

### Event Handling

```typescript
mcpController.on('start', (data) => {
  console.log('Tool started:', data.tool.title);
});

mcpController.on('complete', (data) => {
  console.log('Tool completed:', data.tool.title);
});

mcpController.on('step:show', (data) => {
  console.log(`Step ${data.index + 1}: ${data.step.content}`);
});

mcpController.on('cancel', (data) => {
  console.log('Tool cancelled:', data.tool?.title);
});
```

## 📝 Examples

### Normal Mode Example

Interactive tour with navigation buttons:

```typescript
const normalTool: ToolConfiguration = {
  toolId: 'interactive-demo',
  title: 'Interactive Demo',
  description: 'Guided tour with user control',
  mode: 'normal',
  pageMatcher: '/dashboard',
  steps: [
    {
      targetElement: '.dashboard-header',
      content: 'This is your dashboard overview. Click Next to continue.',
      shepherdOptions: {
        attachTo: { on: 'bottom' }
      }
    },
    {
      targetElement: '.stats-widget',
      content: 'Here you can view your key metrics and statistics.'
    }
  ]
};
```

### Buttonless Mode Example

Auto-advancing tutorial:

```typescript
const buttonlessTool: ToolConfiguration = {
  toolId: 'auto-tour',
  title: 'Automatic Tour',
  description: 'Self-advancing presentation',
  mode: 'buttonless',
  steps: [
    {
      targetElement: '.feature-1',
      content: 'This feature helps you manage tasks efficiently.',
      delay: 4000
    },
    {
      targetElement: '.feature-2',
      content: 'Advanced analytics provide deep insights.',
      delay: 3000
    }
  ]
};
```

### Silent Mode Example

Automated task execution:

```typescript
const silentTool: ToolConfiguration = {
  toolId: 'auto-form-fill',
  title: 'Automatic Form Completion',
  description: 'Fills out forms automatically with provided data',
  mode: 'silent',
  steps: [
    {
      targetElement: '#name-input',
      content: '', // Not used in silent mode
      action: {
        type: 'fillInput',
        element: '#name-input',
        value: '{{userName}}'
      }
    },
    {
      targetElement: '#email-input',
      content: '',
      action: {
        type: 'fillInput',
        element: '#email-input',
        value: '{{userEmail}}'
      }
    },
    {
      targetElement: '#submit-btn',
      content: '',
      action: {
        type: 'click',
        element: '#submit-btn'
      }
    }
  ]
};
```

## 🔧 API Reference

### MCPElementsController

Main controller class for managing tools:

#### Methods

- `getRegistry(): ToolRegistry` - Access the tool registry
- `start(tools: ToolStartConfig[]): void` - Start tool sequence
- `stop(): void` - Stop current tool and clear queue
- `next(): void` - Advance to next step (normal mode)
- `back(): void` - Go to previous step (normal mode)
- `on(event: MCPElementsEvent, handler: Function): void` - Register event listener
- `off(event: MCPElementsEvent, handler: Function): void` - Remove event listener

### ToolRegistry

Manages tool configurations:

#### Methods

- `loadTools(source): Promise<void>` - Load tools from source
- `getToolById(toolId: string): ToolConfiguration | undefined` - Get specific tool
- `getAvailableTools(url: string): Map<string, ToolConfiguration>` - Get page-specific tools
- `getGlobalTools(): Map<string, ToolConfiguration>` - Get global tools
- `getAllTools(): Map<string, ToolConfiguration>` - Get all tools

## 🎬 Visual Feedback System

MCP Elements includes a comprehensive visual feedback system that makes automated interactions engaging and easy to follow.

### Visual Effects

#### Click Effects
- **Ripple Animation**: Expanding blue circle animation at click point
- **Element Pulse**: Target element briefly scales and pulses
- **Duration**: 600ms animation with smooth easing

#### Typing Effects
- **Character-by-character**: Text appears progressively like real typing
- **Realistic Speed**: Random delays between 50-150ms per character
- **Shimmer Effect**: Sliding shimmer overlay during typing
- **Focus Ring**: Visual focus indicator on input fields

#### Element Highlighting
- **Glow Animation**: Pulsing blue glow around target elements
- **Focus Ring**: Outline effect for interactive elements
- **Duration**: Customizable highlight duration (default: 2000ms)

### CSS Classes Applied

```css
.mcp-click-ripple    /* Ripple effect for clicks */
.mcp-typing-indicator /* Shimmer effect during typing */
.mcp-highlight       /* Glowing border animation */
.mcp-pulse          /* Scaling pulse animation */
.mcp-focus-ring     /* Focus outline effect */
```

### Controlling Visual Feedback

```typescript
// Enable/disable visual feedback
mcpController.setVisualFeedbackEnabled(true);

// Check current state
const isEnabled = mcpController.isVisualFeedbackEnabled();

// Constructor option
const controller = new MCPElementsController(options, true); // Enable by default
```

### Action-Specific Effects

| Action Type | Visual Effects |
|-------------|----------------|
| `click` | Ripple + Pulse + Highlight |
| `fillInput` | Typing Animation + Focus Ring + Highlight |
| `selectOption` | Focus Ring + Highlight |
| `navigate` | Click Effect + Highlight |

### Events

- `start` - Tool execution started
- `complete` - Tool execution completed
- `cancel` - Tool execution cancelled
- `step:show` - Step displayed (all modes)

## 🔗 Backend Integration

### MCP Server Integration

MCP servers can discover and execute tools through the registry:

```typescript
// Discovery endpoint
app.get('/api/tools', (req, res) => {
  const registry = mcpController.getRegistry();
  const allTools = registry.getAllTools();
  const toolsArray = Array.from(allTools.values());
  res.json(toolsArray);
});

// Execution endpoint
app.post('/api/tools/execute', (req, res) => {
  const { toolId, params } = req.body;
  
  // Validate tool exists
  const tool = registry.getToolById(toolId);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  
  // Send execution command to frontend
  webSocketConnection.send({
    type: 'execute-tool',
    toolId,
    params
  });
  
  res.json({ status: 'executing', toolId });
});
```

### Page-Specific Discovery

```typescript
// Get tools available for current page
app.get('/api/tools/available', (req, res) => {
  const { url } = req.query;
  const registry = mcpController.getRegistry();
  const availableTools = registry.getAvailableTools(url);
  const toolsArray = Array.from(availableTools.values());
  res.json(toolsArray);
});
```

### WebSocket Integration

```typescript
// Real-time tool execution
webSocket.on('message', (message) => {
  const { type, toolId, params } = JSON.parse(message);
  
  if (type === 'execute-tool') {
    mcpController.start([{ toolId, params }]);
  }
});

// Forward events to server
mcpController.on('complete', (data) => {
  webSocket.send(JSON.stringify({
    type: 'tool-complete',
    toolId: data.tool.toolId,
    timestamp: Date.now()
  }));
});
```

## 🛠️ Advanced Features

### Custom Shepherd Options

```typescript
const controller = new MCPElementsController({
  useModalOverlay: true,
  classPrefix: 'custom-shepherd',
  defaultStepOptions: {
    scrollTo: true,
    popperOptions: {
      modifiers: [{ name: 'offset', options: { offset: [0, 20] } }]
    }
  }
});
```

### Parameter Substitution

Tools support dynamic parameter substitution using `{{paramName}}` syntax:

```typescript
const tool: ToolConfiguration = {
  // ... other config
  steps: [
    {
      targetElement: '.welcome-message',
      content: 'Welcome {{userName}}! Your role is {{userRole}}.',
      action: {
        type: 'fillInput',
        element: '#greeting-input',
        value: 'Hello {{userName}}, welcome to {{companyName}}!'
      }
    }
  ]
};
```

### Conditional Tool Loading

```typescript
await registry.loadTools(async () => {
  const userRole = getCurrentUserRole();
  const tools = await fetchToolsForRole(userRole);
  return tools.filter(tool => tool.permissions.includes(userRole));
});
```

## 🎯 Real-World Examples

### Example 1: Auto-Fill Form with Visual Feedback

```typescript
const autoFillTool: ToolConfiguration = {
  toolId: 'auto-fill-demo',
  title: 'Auto Fill Question Form',
  description: 'Demonstrates automated form filling with visual effects',
  mode: 'silent',
  pageMatcher: '/ask',
  steps: [
    {
      targetElement: '#question-title',
      content: 'Filling in the question title...',
      action: {
        type: 'fillInput',
        element: '#question-title',
        value: '{{questionTitle}}'
      }
    },
    {
      targetElement: '#question-body',
      content: 'Adding question details...',
      delay: 1000, // Wait 1 second between actions
      action: {
        type: 'fillInput',
        element: '#question-body',
        value: '{{questionBody}}'
      }
    },
    {
      targetElement: '#question-tags',
      content: 'Adding relevant tags...',
      delay: 800,
      action: {
        type: 'fillInput',
        element: '#question-tags',
        value: '{{tags}}'
      }
    }
  ]
};

// Execute with visual feedback
await mcpController.start([{
  toolId: 'auto-fill-demo',
  params: {
    questionTitle: 'How to implement TypeScript interfaces?',
    questionBody: 'I need help with TypeScript interface design...',
    tags: 'typescript,interfaces,best-practices'
  }
}]);
```

**Visual Effects**: Each input field will be highlighted, focused, and filled with realistic typing animation.

### Example 2: Interactive Tour with Buttonless Mode

```typescript
const guidedTour: ToolConfiguration = {
  toolId: 'platform-introduction',
  title: 'Platform Introduction Tour',
  description: 'Auto-advancing tour of key features',
  mode: 'buttonless',
  global: true,
  steps: [
    {
      targetElement: '.main-navigation',
      content: 'This is your main navigation. It helps you move between different sections.',
      delay: 4000,
      shepherdOptions: {
        attachTo: { on: 'bottom' }
      }
    },
    {
      targetElement: '.search-bar',
      content: 'Use the search bar to quickly find what you need.',
      delay: 3500,
      shepherdOptions: {
        attachTo: { on: 'bottom' }
      }
    },
    {
      targetElement: '.user-menu',
      content: 'Access your profile and settings from the user menu.',
      delay: 3000,
      shepherdOptions: {
        attachTo: { on: 'left' }
      }
    }
  ]
};
```

**Visual Effects**: Elements are highlighted as the tour progresses, with smooth transitions between steps.

### Example 3: Angular Service Integration

```typescript
// angular-mcp.service.ts
import { Injectable } from '@angular/core';
import { MCPElementsController } from 'mcp-elements';

@Injectable({
  providedIn: 'root'
})
export class AngularMCPService {
  private mcpController: MCPElementsController;

  constructor() {
    this.mcpController = new MCPElementsController({
      useModalOverlay: true,
      classPrefix: 'app-shepherd'
    }, true); // Enable visual feedback
    
    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    await this.mcpController.getRegistry().loadTools('/assets/tools.json');
  }

  // Enable/disable visual effects
  toggleVisualEffects(enabled: boolean): void {
    this.mcpController.setVisualFeedbackEnabled(enabled);
  }

  // Execute tool with parameters
  async executeAutoDemo(demoData: any): Promise<void> {
    await this.mcpController.start([{
      toolId: 'auto-demo',
      params: demoData
    }]);
  }

  private setupEventListeners(): void {
    this.mcpController.on('start', (data) => {
      console.log('Tool started:', data.tool.title);
    });

    this.mcpController.on('complete', (data) => {
      console.log('Tool completed:', data.tool.title);
    });
  }
}
```

### Example 4: Custom Visual Effects

```typescript
// Custom CSS for enhanced visual feedback
const customStyles = `
  .mcp-click-ripple {
    background: rgba(34, 197, 94, 0.6); /* Green ripple */
    animation-duration: 0.8s;
  }
  
  .mcp-highlight {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.8); /* Green glow */
  }
  
  .mcp-typing-indicator::after {
    background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent);
  }
`;

// Inject custom styles
const styleElement = document.createElement('style');
styleElement.textContent = customStyles;
document.head.appendChild(styleElement);
```

## 🔧 Troubleshooting

### Common Issues

#### Visual Effects Not Working
- Ensure visual feedback is enabled: `mcpController.setVisualFeedbackEnabled(true)`
- Check that CSS styles are properly injected
- Verify elements exist in DOM when actions execute

#### Tool Not Found Errors
- Check file path for JSON tool configurations
- Ensure JSON syntax is valid
- Verify tool IDs match exactly (case-sensitive)

#### Buttonless Mode Step Timing Issues
- Add explicit `delay` properties to steps
- Ensure `step.delay` is defined (defaults to 3000ms)
- Check console for step parsing errors

#### Element Targeting Problems
- Use specific CSS selectors
- Wait for dynamic elements with `waitForElement`
- Test selectors in browser console first

### Debug Mode

```typescript
// Enable debug logging
mcpController.on('step:show', (data) => {
  console.log('Step shown:', data.step.content);
  console.log('Target element:', data.step.targetElement);
});

// Check tool loading
const debugInfo = mcpController.getRegistry().getAllTools();
console.log('Loaded tools:', Array.from(debugInfo.keys()));
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 🐛 Issues

Found a bug or have a feature request? Please create an issue on our GitHub repository.
