using Microsoft.AspNetCore.SignalR;

namespace WebIntractMCPServer.Hubs;

/// <summary>
/// SignalR hub for MCP tools communication with clients
/// </summary>
public sealed class McpToolsHub(ILogger<McpToolsHub>? logger) : Hub
{
    /// <summary>
    /// Called when a client connects to the hub
    /// </summary>
    /// <returns>A task representing the asynchronous operation</returns>
    public override async Task OnConnectedAsync()
    {
        logger?.LogDebug("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    /// <param name="exception">Exception that caused the disconnection, if any</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception is not null)
        {
            logger?.LogWarning(exception, "Client disconnected with error: {ConnectionId}", Context.ConnectionId);
        }
        else
        {
            logger?.LogDebug("Client disconnected: {ConnectionId}", Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
