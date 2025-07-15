import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MCPElementsService } from '../../services/mcp-elements.service';
import { ToolConfiguration, CustomFunctionContext, createSuccessResult, ReturnValueContext } from '@web-interact-mcp/client';

function refReplacer() {
  let m = new Map(), v= new Map(), init: any = null;

  // in TypeScript add "this: any" param to avoid compliation errors - as follows
  //    return function (this: any, field: any, value: any) {
  return function(this: any, field: any, value: any) {
    let p= m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field); 
    let isComplex= value===Object(value)
    
    if (isComplex) m.set(value, p);  
    
    let pp = v.get(value)||'';
    let path = p.replace(/undefined\.\.?/,'');
    let val = pp ? `#REF:${pp[0]=='[' ? '$':'$.'}${pp}` : value;
    
    !init ? (init=value) : (val===init ? val="#REF:$" : 0);
    if(!pp && isComplex) v.set(value, path);
   
    return val;
  }
}

@Component({
  selector: 'app-mcp-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mcp-controls-panel" [class.expanded]="isPanelExpanded">
      <div class="mcp-header" (click)="togglePanel()">
        <h3>
          <span class="mcp-icon">🤖</span>
          MCP Elements Demo
        </h3>
        <button class="toggle-btn" [class.rotated]="isPanelExpanded">
          ▼
        </button>
      </div>
      
      <div class="mcp-content" *ngIf="isPanelExpanded">
        <div class="mcp-section">
          <h4>Quick Tours</h4>
          <div class="button-group">
            <button 
              class="mcp-btn primary" 
              (click)="startWelcomeTour()"
              [disabled]="isLoading">
              Welcome Tour
            </button>
            <button 
              class="mcp-btn secondary" 
              (click)="startUserInteractionTour()"
              [disabled]="isLoading">
              User Interaction
            </button>
            <button 
              class="mcp-btn secondary" 
              (click)="startSearchGuide()"
              [disabled]="isLoading">
              Search Guide
            </button>
          </div>
        </div>        <div class="mcp-section">
          <h4>Demo Actions</h4>
          <div class="button-group">
            <button 
              class="mcp-btn demo" 
              (click)="demonstrateAutoQuestion()"
              [disabled]="isLoading">
              Auto Fill Question
            </button>
            <button 
              class="mcp-btn demo" 
              (click)="demonstrateCustomFunction()"
              [disabled]="isLoading">
              Custom Function Demo
            </button>
            <button 
              class="mcp-btn demo" 
              (click)="demonstrateReturnValues()"
              [disabled]="isLoading">
              Return Values Demo
            </button>
            <button 
              class="mcp-btn demo" 
              (click)="demonstrateToolLevelReturnValues()"
              [disabled]="isLoading">
              Tool-Level Return Demo
            </button>
            <button 
              class="mcp-btn secondary" 
              (click)="runDebugTest()"
              [disabled]="isLoading">
              Debug Test
            </button>
            <button 
              class="mcp-btn secondary" 
              (click)="showDebugInfo()"
              [disabled]="isLoading">
              Debug Info
            </button>
            <button 
              class="mcp-btn secondary" 
              (click)="reloadTools()"
              [disabled]="isLoading">
              Reload Tools
            </button>
            <button 
              class="mcp-btn danger" 
              (click)="stopCurrentTool()"
              [disabled]="isLoading">
              Stop Current Tool
            </button>
          </div>
        </div>

        <div class="mcp-section">
          <h4>Visual Effects</h4>
          <div class="button-group">
            <label class="mcp-toggle">
              <input 
                type="checkbox" 
                [checked]="visualFeedbackEnabled"
                (change)="toggleVisualFeedback($event)">
              <span class="toggle-slider"></span>
              <span class="toggle-label">Show Interaction Effects</span>
            </label>
            <p class="toggle-description">
              Enable visual effects for clicks, typing, and other automated interactions in silent/buttonless modes.
            </p>
          </div>
        </div>

        <div class="mcp-section" *ngIf="availableTools.length > 0">
          <h4>Available Tools ({{ availableTools.length }})</h4>
          <div class="tools-list">
            <div 
              *ngFor="let tool of availableTools" 
              class="tool-item"
              (click)="startTool(tool.toolId)">
              <div class="tool-title">{{ tool.title }}</div>
              <div class="tool-description">{{ tool.description }}</div>
              <div class="tool-mode">{{ tool.mode }} mode</div>
            </div>
          </div>
        </div>        <div class="mcp-section">
          <h4>Chat Test</h4>
          <div class="chat-container">
            <div class="session-status">
              <span class="status-indicator" [class]="isSessionActive ? 'active' : 'inactive'">
                {{ isSessionActive ? '🟢 Session Active' : '🔴 Starting Session...' }}
              </span>
            </div>
            <div class="chat-input-group">
              <input 
                type="text" 
                class="chat-input" 
                placeholder="{{ isSessionActive ? 'Type a message to test chat with session...' : 'Session auto-starting...' }}"
                [(ngModel)]="chatMessage"
                (keyup.enter)="sendChatMessage()"
                [disabled]="isLoading || !isSessionActive">
              <button 
                class="mcp-btn primary" 
                (click)="sendChatMessage()"
                [disabled]="isLoading || !chatMessage.trim() || !isSessionActive">
                Send
              </button>
            </div>
            <div class="chat-response" *ngIf="lastChatResponse">
              <strong>Response:</strong> {{ lastChatResponse }}
            </div>
          </div>
        </div>

        <div class="mcp-section">
          <h4>Tool Status</h4>
          <div class="status-info">
            <div class="status-item">
              <span class="status-label">Service Status:</span>
              <span class="status-value" [class]="serviceStatus">
                {{ serviceStatus === 'ready' ? '✅ Ready' : '⏳ Loading' }}
              </span>
            </div>
            <div class="status-item" *ngIf="currentTool">
              <span class="status-label">Active Tool:</span>
              <span class="status-value">{{ currentTool }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Events:</span>
              <span class="status-value">{{ eventCount }} events fired</span>
            </div>
            <div class="status-item">
              <span class="status-label">Loaded Tools Count:</span>
              <span class="status-value">{{ debugInfo?.totalTools || 0 }}</span>
            </div>
            <div class="status-item" *ngIf="debugInfo?.toolIds?.length">
              <span class="status-label">Tool IDs:</span>
              <span class="status-value">{{ debugInfo.toolIds.join(', ') }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">SignalR Status:</span>
              <span class="status-value" [class]="signalRStatus.isConnected ? 'ready' : 'loading'">
                {{ signalRStatus.isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
              </span>
            </div>
            <div class="status-item" *ngIf="signalRStatus.connectionState">
              <span class="status-label">Connection State:</span>
              <span class="status-value">{{ signalRStatus.connectionState }}</span>
            </div>
            <div class="status-item" *ngIf="signalRStatus.sessionId">
              <span class="status-label">Session ID:</span>
              <span class="status-value">{{ signalRStatus.sessionId }}</span>
            </div>
          </div>
        </div>

        <div class="mcp-section">
          <h4>Event Log</h4>
          <div class="event-log">
            <div 
              *ngFor="let event of recentEvents | slice:0:5" 
              class="event-item"
              [class]="'event-' + event.type">
              <span class="event-time">{{ event.timestamp | date:'HH:mm:ss' }}</span>
              <span class="event-message">{{ event.message }}</span>
            </div>
            <div *ngIf="recentEvents.length === 0" class="no-events">
              No events yet
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mcp-controls-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: #fff;
      border: 1px solid #e0e7ff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: all 0.3s ease;
    }

    .mcp-controls-panel:not(.expanded) {
      width: 200px;
    }

    .mcp-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }

    .mcp-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mcp-icon {
      font-size: 18px;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .toggle-btn.rotated {
      transform: rotate(180deg);
    }

    .mcp-content {
      max-height: 80vh;
      overflow-y: auto;
      padding: 0;
    }

    .mcp-section {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .mcp-section:last-child {
      border-bottom: none;
    }

    .mcp-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mcp-btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .mcp-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mcp-btn.primary {
      background: #3b82f6;
      color: white;
    }

    .mcp-btn.primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .mcp-btn.secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .mcp-btn.secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .mcp-btn.demo {
      background: #10b981;
      color: white;
    }

    .mcp-btn.demo:hover:not(:disabled) {
      background: #059669;
    }

    .mcp-btn.danger {
      background: #ef4444;
      color: white;
    }

    .mcp-btn.danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .tools-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .tool-item {
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tool-item:hover {
      background: #f9fafb;
      border-color: #3b82f6;
    }

    .tool-title {
      font-weight: 600;
      font-size: 13px;
      color: #111827;
      margin-bottom: 4px;
    }

    .tool-description {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .tool-mode {
      font-size: 11px;
      padding: 2px 6px;
      background: #e5e7eb;
      color: #374151;
      border-radius: 3px;
      display: inline-block;
    }

    .status-info {
      font-size: 12px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .status-label {
      color: #6b7280;
    }

    .status-value {
      font-weight: 500;
    }

    .status-value.ready {
      color: #10b981;
    }

    .status-value.loading {
      color: #f59e0b;
    }

    .event-log {
      max-height: 120px;
      overflow-y: auto;
      font-size: 11px;
    }

    .event-item {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .event-time {
      color: #6b7280;
      min-width: 50px;
      font-family: monospace;
    }

    .event-message {
      flex: 1;
      color: #374151;
    }

    .event-start {
      background: #ecfdf5;
    }

    .event-complete {
      background: #f0f9ff;
    }

    .event-cancel {
      background: #fef2f2;
    }

    .event-step {
      background: #fefce8;
    }

    .no-events {
      padding: 20px;
      text-align: center;
      color: #9ca3af;
      font-style: italic;
    }

    /* Scrollbar styling */
    .mcp-content::-webkit-scrollbar,
    .tools-list::-webkit-scrollbar,
    .event-log::-webkit-scrollbar {
      width: 4px;
    }

    .mcp-content::-webkit-scrollbar-track,
    .tools-list::-webkit-scrollbar-track,
    .event-log::-webkit-scrollbar-track {
      background: #f1f1f1;
    }    .mcp-content::-webkit-scrollbar-thumb,
    .tools-list::-webkit-scrollbar-thumb,
    .event-log::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2px;
    }

    /* Toggle switch styles */
    .mcp-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      margin-bottom: 8px;
    }

    .mcp-toggle input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 44px;
      height: 24px;
      background: #d1d5db;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .mcp-toggle input:checked + .toggle-slider {
      background: #667eea;
    }

    .mcp-toggle input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    .toggle-label {
      font-weight: 500;
    }

    .toggle-description {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }

    /* Chat interface styles */
    .chat-container {
      background: #f9fafb;
      border-radius: 6px;
      padding: 12px;
      margin-top: 8px;
    }

    .session-status {
      margin-bottom: 12px;
      padding: 8px;
      background: #fff;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }

    .status-indicator {
      font-size: 12px;
      font-weight: 500;
    }

    .status-indicator.active {
      color: #059669;
    }

    .status-indicator.inactive {
      color: #dc2626;
    }

    .chat-input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .chat-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
    }

    .chat-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .chat-response {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 12px;
      font-size: 13px;
      line-height: 1.4;
      max-height: 100px;
      overflow-y: auto;
    }
  `]
})
export class MCPControlsComponent implements OnInit, OnDestroy {
  isPanelExpanded = false;
  isLoading = false;
  serviceStatus: 'loading' | 'ready' = 'loading';
  availableTools: ToolConfiguration[] = [];
  currentTool: string | null = null;
  eventCount = 0;
  debugInfo: any = null;
  visualFeedbackEnabled = true;
  signalRStatus: { isConnected: boolean; connectionState: string | null; sessionId: string | null } = { isConnected: false, connectionState: null, sessionId: null };
  recentEvents: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }> = [];
  
  // Chat properties
  chatMessage: string = '';
  lastChatResponse: string = '';

  constructor(private mcpElementsService: MCPElementsService) {}  async ngOnInit() {
    try {
      await this.mcpElementsService.initialize();
      this.serviceStatus = 'ready';
      
      // Register custom functions early in the lifecycle
      this.registerCustomFunctions();
      
      await this.loadAvailableTools();
      this.setupEventListeners();
      this.refreshDebugInfo();
      
      // Initialize visual feedback state
      this.visualFeedbackEnabled = this.mcpElementsService.isVisualFeedbackEnabled();
      
      // Update SignalR status
      this.updateSignalRStatus();
      
      // Set up a timer to periodically update SignalR status
      setInterval(() => {
        this.updateSignalRStatus();
      }, 5000);
    } catch (error) {
      console.error('Failed to initialize MCP Elements service:', error);
    }
  }

  private updateSignalRStatus(): void {
    this.signalRStatus = this.mcpElementsService.getSignalRStatus();
  }

  ngOnDestroy() {
    // Clean up session when component is destroyed
    if (this.isSessionActive) {
      this.closeSession();
    }
    // Clean up event listeners if needed
  }

  async togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
    
    try {
      if (this.isPanelExpanded) {
        // Auto-create session when panel is opened
        if (!this.isSessionActive) {
          await this.createSession();
        }
      } else {
        // Auto-close session when panel is closed
        if (this.isSessionActive) {
          await this.closeSession();
        }
      }
    } catch (error) {
      console.error('Error managing session during panel toggle:', error);
      this.addEvent('error', `Session management error: ${error}`);
    }
  }

  async startWelcomeTour() {
    this.isLoading = true;
    try {
      await this.mcpElementsService.startWelcomeTour();
    } finally {
      this.isLoading = false;
    }
  }

  async startUserInteractionTour() {
    this.isLoading = true;
    try {
      await this.mcpElementsService.startUserInteractionTour();
    } finally {
      this.isLoading = false;
    }
  }

  async startSearchGuide() {
    this.isLoading = true;
    try {
      await this.mcpElementsService.startSearchAndFilterGuide();
    } finally {
      this.isLoading = false;
    }
  }  async demonstrateAutoQuestion() {
    this.isLoading = true;
    try {
      // First navigate to the ask question page if not already there
      if (!window.location.pathname.includes('/ask')) {
        console.log('Navigating to ask question page...');
        window.location.href = '/ask';
        return; // Let the page reload and user can try again
      }
      
      const questionData = {
        questionTitle: 'How to implement TypeScript interfaces effectively?',
        questionBody: 'I am working on a TypeScript project and want to understand the best practices for implementing interfaces. What are the key considerations for designing clean and maintainable interfaces?',
        tags: 'typescript,interfaces,best-practices'
      };
      
      console.log('Starting auto question demo with data:', questionData);
      await this.mcpElementsService.demonstrateAutoQuestion(questionData);
    } catch (error) {
      console.error('Error in demonstrateAutoQuestion:', error);
    } finally {
      this.isLoading = false;
    }
  }
  async demonstrateCustomFunction() {
    this.isLoading = true;
    try {
      // Custom functions are already registered in ngOnInit
      console.log('Starting custom function demo...');
      await this.mcpElementsService.startTool('custom-function-demo');
    } catch (error) {
      console.error('Error in custom function demo:', error);
      this.addEvent('error', `Custom function demo error: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  async demonstrateReturnValues() {
    this.isLoading = true;
    try {
      console.log('Starting return values demo...');
      
      // Register return value provider functions first
      this.registerReturnValueProviders();
      
      // Start the return value demo tool
      await this.mcpElementsService.startTool('return-value-demo', {
        initialValue: 'Demo Starting!'
      });
      
      // After a short delay, show the return values
      setTimeout(() => {
        const lastToolReturnValues = this.mcpElementsService.getLastToolReturnValues();
        const lastStepReturnValue = this.mcpElementsService.getLastStepReturnValue();

        console.log('All step return values:', lastToolReturnValues);
        console.log('Last step return value:', lastStepReturnValue);

        alert(`Return Values Demo Completed!\n\nAll step return values: ${JSON.stringify(lastToolReturnValues, refReplacer(), 2)}\n\nLast step return value: ${lastStepReturnValue ? JSON.stringify(lastStepReturnValue, refReplacer(), 2) : 'undefined'}\n\nCheck console for detailed output.`);
      }, 3000);
      
    } catch (error) {
      console.error('Error in return values demo:', error);
      this.addEvent('error', `Return values demo error: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  async demonstrateToolLevelReturnValues() {
    this.isLoading = true;
    try {
      console.log('Starting tool-level return values demo...');
      
      // Register both step-level and tool-level return value providers
      this.registerReturnValueProviders();
      this.registerToolLevelReturnValueProviders();
      
      // Start the tool-level return value demo tool
      const result = await this.mcpElementsService.startTool('tool-level-return-demo', {
        toolName: 'Tool Level Demo Example',
        priority: 5
      });
      
      alert(`Tool-Level Return Values Demo Completed!\n\nResult: ${JSON.stringify(result.map(x => ({ isError: x.isError, content: x.content, structuredContent: x.structuredContent })), null, 2)}\n\nCheck console for detailed output.`);
    } catch (error) {
      console.error('Error in tool-level return values demo:', error);
      this.addEvent('error', `Tool-level return values demo error: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  private registerCustomFunctions() {
    // Register sample custom functions
    this.mcpElementsService.registerCustomFunctions([
      {
        name: 'showAlert',
        implementation: function(context: CustomFunctionContext) {
          const message = context.params['message'] || 'Hello from custom function!';
          alert(`Custom Function Alert: ${message}`);
          return createSuccessResult('Alert shown successfully', { message });
        },
        parameters: {
          message: 'string - The message to show in the alert'
        }
      },
      {
        name: 'highlightElement',
        implementation: function(context: CustomFunctionContext) {
          const element = context.element;
          const duration = Number(context.params['duration']) || 3000;
          const color = String(context.params['color']) || '#ff6b6b';
          
          // Store original styles
          const originalStyle = element.style.cssText;
          
          // Apply highlight
          element.style.background = color;
          element.style.transition = 'all 0.3s ease';
          element.style.transform = 'scale(1.05)';
          element.style.boxShadow = `0 0 20px ${color}`;
          
          // Remove highlight after duration
          setTimeout(() => {
            element.style.cssText = originalStyle;
          }, duration);
          
          return createSuccessResult(`Element highlighted for ${duration}ms`, { 
            duration, 
            color, 
            elementTag: element.tagName 
          });
        },
        parameters: {
          duration: 'number - Duration in milliseconds (default: 3000)',
          color: 'string - Highlight color (default: "#ff6b6b")'
        }
      },
      {
        name: 'collectFormData',
        implementation: function(context: CustomFunctionContext) {
          const formData: any = {};
          const form = context.element.closest('form') || document;
          
          // Collect input data
          const inputs = form.querySelectorAll('input, textarea, select');
          inputs.forEach((input: any) => {
            if (input.name || input.id) {
              const key = input.name || input.id;
              formData[key] = input.value;
            }
          });
          
          console.log('Collected form data:', formData);
          context.logger.debug('Custom function collected form data:', formData);
          
          return createSuccessResult('Form data collected successfully', formData);
        },
        parameters: {}
      },
      {
        name: 'logMessage',
        implementation: function(context: CustomFunctionContext) {
          const message = context.params['message'] || 'Log message';
          const timestamp = new Date().toISOString();
          
          console.log(`[${timestamp}] ${message}`);
          context.logger.debug('logMessage function called:', message);
          
          return createSuccessResult('Message logged successfully', { 
            message: message,
            timestamp: timestamp,
            stepIndex: context.currentStepIndex
          });
        },
        parameters: {
          message: 'string - The message to log'
        }
      },
      {
        name: 'processData',
        implementation: function(context: CustomFunctionContext) {
          const inputData = String(context.params['inputData']) || 'default data';
          const previousValue = context.previousStepReturnValue;
          
          const processed = {
            original: inputData,
            processed: inputData.toUpperCase() + '_PROCESSED',
            previousStep: previousValue,
            processedAt: new Date().toISOString()
          };
          
          console.log('processData function result:', processed);
          context.logger.debug('processData function called with:', { inputData, previousValue });
          
          // This return value will be used as the step's return value
          return createSuccessResult('Data processed successfully', processed);
        },
        parameters: {
          inputData: 'string - The data to process'
        }
      }
    ]);
    
    console.log('Custom functions registered successfully');
  }

  private registerReturnValueProviders() {
    // Register return value provider functions
    this.mcpElementsService.registerReturnValueProviders([
      {
        name: 'calculateNextValue',
        implementation: function(context: ReturnValueContext) {
          const multiplier = context.stepParams?.['multiplier'] || 1;
          const previousValue = context.previousStepReturnValue || 'No previous value';
          const result = `Calculated: ${previousValue} * ${multiplier}`;
          
          console.log('calculateNextValue provider called:', {
            multiplier,
            previousValue,
            result
          });
          
          return createSuccessResult(result, { 
            calculation: { 
              multiplier, 
              previousValue: previousValue, 
              result 
            } 
          });
        },
        parameters: {
          multiplier: 'number - Multiplier for the calculation'
        }
      },
      {
        name: 'combineAllValues',
        implementation: function(context: ReturnValueContext) {
          // Get all previous step return values from the service (since context.controller is the service wrapper)
          const service = (context as any).mcpElementsService;
          const allValues = service ? service.getLastToolReturnValues() : [];
          const combined = {
            summary: 'All steps completed',
            stepCount: allValues.length,
            values: allValues,
            timestamp: new Date().toISOString()
          };
          
          console.log('combineAllValues provider called:', combined);
          return createSuccessResult('All step values combined successfully', combined);
        },
        parameters: {}
      }
    ]);
    
    console.log('Return value providers registered successfully');
  }

  private registerToolLevelReturnValueProviders() {
    // Register tool-level return value provider functions
    this.mcpElementsService.registerReturnValueProviders([
      {
        name: 'generateToolSummary',
        implementation: function(context: ReturnValueContext) {
          const includeMetrics = context.toolParams['includeMetrics'] || false;
          const format = context.toolParams['format'] || 'simple';
          
          // Get all step return values from the service (since context.controller is the service wrapper)
          const service = (context as any).mcpElementsService;
          const allStepReturnValues = service ? service.getLastToolReturnValues() : [];
          
          const summary: any = {
            toolName: context.activeTool?.title || 'Unknown Tool',
            toolId: context.activeTool?.toolId || 'unknown',
            executionSummary: {
              success: context.toolExecutionSuccess,
              stepsExecuted: context.stepsExecuted,
              totalSteps: context.activeTool?.steps.length || 0,
              error: context.toolExecutionError?.message
            },
            stepResults: allStepReturnValues,
            lastStepResult: context.lastStepReturnValue,
            timestamp: new Date().toISOString(),
            format: format
          };
          
          if (includeMetrics) {
            summary.metrics = {
              successRate: context.toolExecutionSuccess ? 100 : 0,
              completionPercentage: context.activeTool?.steps.length ? 
                Math.round(((context.stepsExecuted || 0) / context.activeTool.steps.length) * 100) : 0,
              hasStepResults: allStepReturnValues.length > 0
            };
          }
          
          console.log('generateToolSummary provider called:', summary);
          return createSuccessResult('Tool summary generated successfully', summary);
        },
        parameters: {
          includeMetrics: 'boolean - Whether to include execution metrics',
          format: 'string - Format of the summary (simple|detailed)'
        }
      },
      {
        name: 'combineToolResults',
        implementation: function(context: ReturnValueContext) {
          // Get all step return values from the service (since context.controller is the service wrapper)
          const service = (context as any).mcpElementsService;
          const allStepReturnValues = service ? service.getLastToolReturnValues() : [];
          
          const result = {
            message: 'Tool execution completed with custom tool-level return value',
            originalLastStepValue: context.lastStepReturnValue,
            allStepValues: allStepReturnValues,
            toolOverride: true,
            executionInfo: {
              toolId: context.activeTool?.toolId,
              success: context.toolExecutionSuccess,
              stepsExecuted: context.stepsExecuted,
              timestamp: new Date().toISOString()
            }
          };
          
          console.log('combineToolResults provider called:', result);
          return createSuccessResult('Tool results combined successfully', result);
        },
        parameters: {}
      }
    ]);
    
    console.log('Tool-level return value providers registered successfully');
  }

  async startTool(toolId: string) {
    this.isLoading = true;
    try {
      await this.mcpElementsService.startTool(toolId);
    } finally {
      this.isLoading = false;
    }
  }

  stopCurrentTool() {
    this.mcpElementsService.stopCurrentTool();
    this.currentTool = null;
  }

  async runDebugTest() {
    this.isLoading = true;
    try {
      console.log('Running debug test...');
      await this.mcpElementsService.startTool('debug-test');
    } catch (error) {
      console.error('Error in debug test:', error);
    } finally {
      this.isLoading = false;
    }
  }
  async showDebugInfo() {
    this.refreshDebugInfo();
    const debugInfo = this.mcpElementsService.getDebugInfo();
    console.log('MCP Elements Debug Info:', debugInfo);
    alert(`Debug Info:\n\nInitialized: ${debugInfo.isInitialized}\nTotal Tools: ${debugInfo.totalTools}\nTool IDs: ${debugInfo.toolIds.join(', ')}\n\nCheck console for full details.`);
  }
  async reloadTools() {
    this.isLoading = true;
    try {
      await this.mcpElementsService.reloadTools();
      await this.loadAvailableTools();
      this.refreshDebugInfo();
    } catch (error) {
      console.error('Error reloading tools:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAvailableTools() {
    try {
      this.availableTools = await this.mcpElementsService.getAvailableTools();
    } catch (error) {
      console.error('Failed to load available tools:', error);
    }
  }

  private setupEventListeners() {
    this.mcpElementsService.onToolEvent('start', (data: any) => {
      this.currentTool = data.tool.title;
      this.addEvent('start', `Started: ${data.tool.title}`);
    });

    this.mcpElementsService.onToolEvent('complete', (data: any) => {
      this.currentTool = null;
      this.addEvent('complete', `Completed: ${data.tool.title}`);
    });    this.mcpElementsService.onToolEvent('cancel', (data: any) => {
      this.currentTool = null;
      this.addEvent('cancel', `Cancelled: ${data?.tool?.title || 'Unknown tool'}`);
    });

    this.mcpElementsService.onToolEvent('step:show', (data: any) => {
      this.addEvent('step', `Step ${data.index + 1}: ${data.step.content.slice(0, 30)}...`);
    });
  }
  private addEvent(type: string, message: string) {
    this.eventCount++;
    this.recentEvents.unshift({
      type,
      message,
      timestamp: new Date()
    });

    // Keep only the last 10 events
    if (this.recentEvents.length > 10) {
      this.recentEvents = this.recentEvents.slice(0, 10);
    }
  }
  refreshDebugInfo() {
    this.debugInfo = this.mcpElementsService.getDebugInfo();
    console.log('Debug info refreshed:', this.debugInfo);
  }

  toggleVisualFeedback(event: Event) {
    const target = event.target as HTMLInputElement;
    this.visualFeedbackEnabled = target.checked;
    this.mcpElementsService.setVisualFeedbackEnabled(this.visualFeedbackEnabled);
    console.log('Visual feedback toggled:', this.visualFeedbackEnabled);
  }

  /**
   * Creates a new session with the MCP Server
   */
  private async createSession(): Promise<void> {
    this.isLoading = true;
    try {
      const sessionId = await this.mcpElementsService.createSession();
      this.addEvent('session', `Session created with ID: ${sessionId}`);
      this.updateSignalRStatus();
      console.log('Session created successfully:', sessionId);
    } catch (error) {
      console.error('Error creating session:', error);
      this.addEvent('error', `Session creation failed: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Closes the current session
   */
  private async closeSession(): Promise<void> {
    this.isLoading = true;
    try {
      const sessionId = this.mcpElementsService.getCurrentSessionId();
      
      // Close the SignalR connection
      await this.mcpElementsService.closeSession();
      
      // Also clean up the server-side session if we have a session ID
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:8080/api/sessions/${sessionId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            console.log('Server-side session cleaned up successfully');
          } else {
            console.warn('Failed to clean up server-side session:', response.statusText);
          }
        } catch (error) {
          console.warn('Error cleaning up server-side session:', error);
        }
      }
      
      this.addEvent('session', 'Session closed and cleaned up');
      this.updateSignalRStatus();
      console.log('Session closed successfully');
    } catch (error) {
      console.error('Error closing session:', error);
      this.addEvent('error', `Session closure failed: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Checks if a session is currently active
   */
  get isSessionActive(): boolean {
    return this.mcpElementsService.isSessionActive();
  }

  /**
   * Sends a chat message using the current session
   */
  async sendChatMessage(): Promise<void> {
    if (!this.chatMessage.trim() || !this.isSessionActive) {
      return;
    }

    this.isLoading = true;
    try {
      const sessionId = this.mcpElementsService.getCurrentSessionId();
      if (!sessionId) {
        throw new Error('No active session found');
      }

      // Make HTTP request to chat endpoint with session ID header
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'McpInteract-Session-Id': sessionId
        },
        body: JSON.stringify({ message: this.chatMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.lastChatResponse = data.response || 'No response received';
      this.addEvent('chat', `Chat message sent: "${this.chatMessage.substring(0, 30)}..."`);
      this.chatMessage = '';
    } catch (error) {
      console.error('Error sending chat message:', error);
      this.lastChatResponse = `Error: ${error}`;
      this.addEvent('error', `Chat error: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }
}
