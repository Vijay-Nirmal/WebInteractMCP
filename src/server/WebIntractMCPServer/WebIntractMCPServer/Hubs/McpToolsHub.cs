using Microsoft.AspNetCore.SignalR;
using ModelContextProtocol.Protocol;
using System.Collections.Concurrent;
using System.Text.Json;

namespace WebIntractMCPServer.Hubs
{
    public class McpToolsHub : Hub
    {
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<CallToolResponse>> _pendingRequests = new();

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public Task SendToolResponse(string requestId, CallToolResponse response)
        {
            if (_pendingRequests.TryRemove(requestId, out var tcs))
            {
                tcs.SetResult(response);
            }
            return Task.CompletedTask;
        }

        public static async Task<CallToolResponse> InvokeToolOnClient(IHubContext<McpToolsHub> hubContext, string toolName, object? arguments)
        {
            var requestId = Guid.NewGuid().ToString();
            var tcs = new TaskCompletionSource<CallToolResponse>();
            _pendingRequests[requestId] = tcs;

            try
            {
                await hubContext.Clients.All.SendAsync("InvokeTool", requestId, toolName, arguments);
                
                // Wait for response with timeout
                using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
                var result = await tcs.Task.WaitAsync(cts.Token);
                return result;
            }
            catch (OperationCanceledException)
            {
                _pendingRequests.TryRemove(requestId, out _);
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
                _pendingRequests.TryRemove(requestId, out _);
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
