import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.expanded]="isExpanded()">
      <div class="chatbot-header" (click)="toggleChat()">
        <div class="header-content">
          <span class="bot-icon">🤖</span>
          <span class="bot-title">AI Assistant</span>
          <span class="status-indicator" [class.online]="isOnline()"></span>
        </div>
        <button class="toggle-btn" [class.expanded]="isExpanded()">
          {{ isExpanded() ? '−' : '+' }}
        </button>
      </div>
      
      @if (isExpanded()) {
        <div class="chatbot-body">
          <div class="messages-container" #messagesContainer>
            @for (message of messages(); track message.id) {
              <div class="message" [class.user-message]="message.isUser" [class.bot-message]="!message.isUser">
                <div class="message-content">
                  @if (message.isLoading) {
                    <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  } @else {
                    {{ message.content }}
                  }
                </div>
                <div class="message-timestamp">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            }
          </div>          <div class="input-container">
            <div class="quick-actions" *ngIf="!isLoading()">
              <button 
                class="quick-action-btn"
                (click)="sendQuickMessage('Show me available tools')"
                title="View Available Tools"
              >
                🛠️
              </button>
              <button 
                class="quick-action-btn"
                (click)="sendQuickMessage('Help me create a project plan')"
                title="Create Project Plan"
              >
                📋
              </button>
              <button 
                class="quick-action-btn"
                (click)="sendQuickMessage('Analyze some data for me')"
                title="Data Analysis"
              >
                📊
              </button>
              <button 
                class="quick-action-btn"
                (click)="sendQuickMessage('Help me with coding')"
                title="Code Assistance"
              >
                💻
              </button>
            </div>
            <div class="input-row">
              <input 
                type="text" 
                [(ngModel)]="currentMessage" 
                (keyup.enter)="sendMessage()"
                placeholder="Type your message..."
                [disabled]="isLoading()"
                class="message-input"
              />
              <button 
                (click)="sendMessage()" 
                [disabled]="!currentMessage.trim() || isLoading()"
                class="send-button"
              >
                @if (isLoading()) {
                  <span class="loading-spinner"></span>
                } @else {
                  📤
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.3s ease;
      border: 1px solid #e1e5e9;
    }

    .chatbot-container.expanded {
      height: 500px;
      width: 350px;
    }

    .chatbot-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-radius: 12px 12px 0 0;
      user-select: none;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bot-icon {
      font-size: 24px;
    }

    .bot-title {
      font-weight: 600;
      font-size: 16px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff4757;
      transition: background-color 0.3s ease;
    }

    .status-indicator.online {
      background: #2ed573;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chatbot-body {
      height: calc(100% - 64px);
      display: flex;
      flex-direction: column;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.3s ease;
    }

    .user-message {
      align-items: flex-end;
    }

    .bot-message {
      align-items: flex-start;
    }

    .message-content {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }

    .user-message .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bot-message .message-content {
      background: #f8f9fa;
      color: #2c3e50;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 4px;
    }

    .message-timestamp {
      font-size: 11px;
      color: #6c757d;
      margin-top: 4px;
      padding: 0 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }    .input-container {
      padding: 16px;
      border-top: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8f9fa;
      border-radius: 0 0 12px 12px;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .quick-action-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s ease;
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .quick-action-btn:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: scale(1.1);
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    .message-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #dee2e6;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .message-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .message-input:disabled {
      background: #e9ecef;
      cursor: not-allowed;
    }

    .send-button {
      width: 44px;
      height: 44px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    .send-button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .send-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .messages-container::-webkit-scrollbar {
      width: 4px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class ChatbotComponent implements OnInit {
  private http = inject(HttpClient);
  
  isExpanded = signal(false);
  isLoading = signal(false);
  isOnline = signal(false);
  messages = signal<ChatMessage[]>([]);
  currentMessage = '';

  constructor() {
    effect(() => {
      if (this.isExpanded()) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit() {
    this.checkServerStatus();
    this.addWelcomeMessage();
  }
  private async checkServerStatus() {
    try {
      await firstValueFrom(this.http.get('http://localhost:5000/health'));
      this.isOnline.set(true);
    } catch {
      this.isOnline.set(false);
    }
  }
  private addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content: "Hello! I'm your AI assistant powered by Semantic Kernel with advanced agentic capabilities. I can help you with:\n\n🔍 Web search and information retrieval\n💻 Code analysis and generation\n📋 Task planning and management\n📊 Data analysis and visualization\n🌤️ Weather information\n💭 Context-aware conversations\n\nHow can I assist you today?",
      isUser: false,
      timestamp: new Date()
    };
    this.messages.update(msgs => [welcomeMessage]);
  }

  toggleChat() {
    this.isExpanded.update(expanded => !expanded);
  }
  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading()) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    
    const loadingMessage: ChatMessage = {
      id: this.generateId(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };

    this.messages.update(msgs => [...msgs, loadingMessage]);
    this.currentMessage = '';
    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.post<{ response: string }>('http://localhost:5000/api/chat', {
          message: userMessage.content
        })
      );

      this.messages.update(msgs => {
        const updated = [...msgs];
        const loadingIndex = updated.findIndex(msg => msg.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            ...loadingMessage,
            content: response.response,
            isLoading: false
          };
        }
        return updated;
      });

    } catch (error) {
      console.error('Chat error:', error);
      this.messages.update(msgs => {
        const updated = [...msgs];
        const loadingIndex = updated.findIndex(msg => msg.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            ...loadingMessage,
            content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
            isLoading: false
          };
        }
        return updated;
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  sendQuickMessage(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }

  private scrollToBottom() {
    const container = document.querySelector('.messages-container') as HTMLElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
