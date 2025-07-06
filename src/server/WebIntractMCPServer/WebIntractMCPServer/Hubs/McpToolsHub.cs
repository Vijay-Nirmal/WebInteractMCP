using Microsoft.AspNetCore.SignalR;
using ModelContextProtocol.Protocol;

namespace WebIntractMCPServer.Hubs
{
    public class McpToolsHub : Hub
    {
        public static async Task<CallToolResponse> InvokeToolOnClient(IHubContext<McpToolsHub> hubContext, string connectionId, string toolName, object? arguments)
        {
            var cancellationToken = new CancellationTokenSource(TimeSpan.FromMinutes(5)).Token; // TODO: Make the timeout configurable
            try
            {
                // TODO: Make the timeout configurable
                return await hubContext.Clients.Client(connectionId).InvokeAsync<CallToolResponse>("InvokeTool", toolName, arguments, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                return new CallToolResponse
                {
                    Content = new List<Content>
                    {
                        new Content { Type = "text", Text = "Tool execution timeout" }
                    },
                    IsError = true
                };
            }
            catch (Exception ex)
            {
                return new CallToolResponse
                {
                    Content = new List<Content>
                    {
                        new Content { Type = "text", Text = $"Tool execution error: {ex.Message}" }
                    },
                    IsError = true
                };
            }
        }
    }
}
