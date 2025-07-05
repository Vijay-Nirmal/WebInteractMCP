/**
 * @file mcp-signalr.service.ts
 * @description SignalR service for MCP Elements to communicate with the server
 * Framework-agnostic implementation
 */

import * as signalR from '@microsoft/signalr';
import { MCPElementsController } from './mcp-elements-controller';
import { ToolStartConfig, CallToolResult, createErrorResult } from './types';

/**
 * SignalR service for MCP Elements communication
 * This is a framework-agnostic implementation that can be used with any JavaScript framework
 */
export class MCPSignalRService {
  private connection: signalR.HubConnection | null = null;
  private mcpController: MCPElementsController | null = null;
  private serverUrl: string;

  /**
   * Creates a new MCPSignalRService instance
   * @param serverUrl - The SignalR server URL (default: 'http://localhost:5120/mcptools')
   */
  constructor(serverUrl: string = 'http://localhost:5120') {
    this.serverUrl = serverUrl;
    this.setupConnection();
  }

  /**
   * Sets the MCP Elements Controller instance
   * @param controller - The controller instance to use for tool execution
   */
  setMCPController(controller: MCPElementsController): void {
    this.mcpController = controller;
  }

  /**
   * Setup SignalR connection
   */
  private setupConnection(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(new URL('/mcptools', this.serverUrl).toString(), {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Trace)
      .build();

    // Listen for tool invocation requests from the server
    this.connection.on('InvokeTool', async (requestId: string, toolName: string, toolArguments: any) => {
      console.log(`Received tool invocation request: ${toolName}`, { requestId, arguments: toolArguments });
      
      try {
        const result = await this.invokeTool(toolName, toolArguments);
        await this.sendToolResponse(requestId, result);
      } catch (error) {
        console.error('Error executing tool:', error);
        const errorResult = createErrorResult(error instanceof Error ? error : new Error(String(error)));
        await this.sendToolResponse(requestId, errorResult);
      }
    });

    this.connection.onclose(() => {
      console.log('SignalR connection closed');
      this.reconnect();
    });

    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
    });
  }

  /**
   * Start the SignalR connection
   */
  async start(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
        console.log('SignalR connection started');
      } catch (error) {
        console.error('Error starting SignalR connection:', error);
        // Retry after delay
        setTimeout(() => this.start(), 5000);
      }
    }
  }

  /**
   * Stop the SignalR connection
   */
  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log('SignalR connection stopped');
    }
  }

  /**
   * Send tool response back to the server
   * @param requestId - The request ID
   * @param result - The tool execution result
   */
  private async sendToolResponse(requestId: string, result: CallToolResult): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendToolResponse', requestId, result);
        console.log(`Tool response sent for request ${requestId}`);
      } catch (error) {
        console.error('Error sending tool response:', error);
      }
    } else {
      console.error('SignalR connection not available to send response');
    }
  }

  /**
   * Invoke a tool using the MCP controller
   * @param toolName - The name of the tool to invoke
   * @param params - The parameters for the tool
   * @returns Promise resolving to the tool result
   */
  private async invokeTool(toolName: string, params: any = {}): Promise<CallToolResult> {
    if (!this.mcpController) {
      throw new Error('MCP Controller not set. Call setMCPController() first.');
    }

    const toolConfig: ToolStartConfig = {
      toolId: toolName,
      params: params || {}
    };

    const results = await this.mcpController.start([toolConfig]);
    
    // Return the first result (since we're only starting one tool)
    return results[0] || createErrorResult(new Error('No result returned from tool execution'));
  }

  /**
   * Reconnect with exponential backoff
   */
  private async reconnect(): Promise<void> {
    let retryCount = 0;
    const maxRetries = 10;
    const baseDelay = 1000; // Start with 1 second

    while (retryCount < maxRetries) {
      try {
        await this.start();
        break; // Successfully connected
      } catch (error) {
        retryCount++;
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Reconnection attempt ${retryCount} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (retryCount >= maxRetries) {
      console.error('Failed to reconnect to SignalR after maximum retry attempts');
    }
  }

  /**
   * Get connection state
   */
  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Gets the SignalR connection ID which serves as the session ID.
   * @returns The connection ID or null if not connected.
   */
  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }

  /**
   * Registers the session with the MCP server.
   * @param sessionId - The session ID to register.
   */
  async registerSession(sessionId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('RegisterSession', sessionId);
        console.log(`Session registered with ID: ${sessionId}`);
      } catch (error) {
        console.error('Error registering session:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not available to register session');
    }
  }
}
