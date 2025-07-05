using Microsoft.AspNetCore.SignalR;
using ModelContextProtocol.Protocol;
using System.Collections.Concurrent;
using System.Text.Json;

namespace WebIntractMCPServer.Hubs
{
    public class McpToolsHub : Hub
    {
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<CallToolResponse>> _pendingRequests = new();
        private static readonly ConcurrentDictionary<string, string> _registeredSessions = new();

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task RegisterSession(string sessionId)
        {
            _registeredSessions[sessionId] = Context.ConnectionId;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"session_{sessionId}");
            Console.WriteLine($"Session registered: {sessionId} with connection {Context.ConnectionId}");
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Clean up session on disconnect
            var sessionToRemove = _registeredSessions.FirstOrDefault(kvp => kvp.Value == Context.ConnectionId);
            if (!sessionToRemove.Equals(default(KeyValuePair<string, string>)))
            {
                _registeredSessions.TryRemove(sessionToRemove.Key, out _);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session_{sessionToRemove.Key}");
                Console.WriteLine($"Session {sessionToRemove.Key} unregistered due to disconnect");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public Task SendToolResponse(string requestId, CallToolResponse response)
        {
            if (_pendingRequests.TryRemove(requestId, out var tcs))
            {
                tcs.SetResult(response);
            }
            return Task.CompletedTask;
        }

        public static async Task<CallToolResponse> InvokeToolOnClient(IHubContext<McpToolsHub> hubContext, string connectionId, string toolName, object? arguments)
        {
            var requestId = Guid.NewGuid().ToString();
            var tcs = new TaskCompletionSource<CallToolResponse>();
            _pendingRequests[requestId] = tcs;

            try
            {
                await hubContext.Clients.Client(connectionId).SendAsync("InvokeTool", requestId, toolName, arguments);
                
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

        public static async Task<CallToolResponse> InvokeToolOnSession(IHubContext<McpToolsHub> hubContext, string sessionId, string toolName, object? arguments)
        {
            var requestId = Guid.NewGuid().ToString();
            var tcs = new TaskCompletionSource<CallToolResponse>();
            _pendingRequests[requestId] = tcs;

            try
            {
                await hubContext.Clients.Group($"session_{sessionId}").SendAsync("InvokeTool", requestId, toolName, arguments);
                
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
