import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MCPElementsService } from '../../services/mcp-elements.service';
import { ToolConfiguration, CustomFunctionContext } from '../../../lib/mcp-elements';

@Component({
  selector: 'app-mcp-controls',
  standalone: true,
  imports: [CommonModule],
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
            </button>            <button 
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
            </button>            <button 
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
  recentEvents: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }> = [];

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
    } catch (error) {
      console.error('Failed to initialize MCP Elements service:', error);
    }
  }

  ngOnDestroy() {
    // Clean up event listeners if needed
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
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
        tags: 'typescript, interfaces, best-practices'
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

  private registerCustomFunctions() {
    // Register sample custom functions
    this.mcpElementsService.registerCustomFunctions([
      {
        name: 'showAlert',
        implementation: function(context: CustomFunctionContext) {
          const message = context.params['message'] || 'Hello from custom function!';
          alert(`Custom Function Alert: ${message}`);
          return { success: true, message: 'Alert shown' };
        },
        parameters: {
          message: 'string - The message to show in the alert'
        }
      },
      {
        name: 'highlightElement',
        implementation: function(context: CustomFunctionContext) {
          const element = context.element;
          const duration = context.params['duration'] || 3000;
          const color = context.params['color'] || '#ff6b6b';
          
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
          
          return { success: true, message: `Element highlighted for ${duration}ms` };
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
          context.debugLog('Custom function collected form data:', formData);
          
          return { success: true, data: formData, message: 'Form data collected' };
        },
        parameters: {}
      }
    ]);
    
    console.log('Custom functions registered successfully');
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
}
