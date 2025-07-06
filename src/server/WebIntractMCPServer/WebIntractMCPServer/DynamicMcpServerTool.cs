using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using Microsoft.AspNetCore.SignalR;
using WebIntractMCPServer.Hubs;

namespace WebIntractMCPServer;

public class DynamicMcpServerTool : McpServerTool
{
    public override ModelContextProtocol.Protocol.Tool ProtocolTool { get; }
    private readonly IHubContext<McpToolsHub> _hubContext;
    private readonly string _sessionId;

    public DynamicMcpServerTool(ModelContextProtocol.Protocol.Tool tool, IHubContext<McpToolsHub> hubContext, string sessionId)
    {
        ArgumentNullException.ThrowIfNull(tool, nameof(tool));
        ArgumentNullException.ThrowIfNull(hubContext, nameof(hubContext));
        ArgumentNullException.ThrowIfNull(sessionId, nameof(sessionId));
        ProtocolTool = tool;
        _hubContext = hubContext;
        _sessionId = sessionId;
    }

    public override async ValueTask<CallToolResponse> InvokeAsync(RequestContext<CallToolRequestParams> request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request.Params, nameof(request.Params));
        var toolName = request.Params.Name;
        var arguments = request.Params.Arguments;

        try
        {
            return await McpToolsHub.InvokeToolOnClient(_hubContext, _sessionId, toolName, arguments);
        }
        catch (Exception ex)
        {
            var response = new CallToolResponse
            {
                IsError = true,
                Content = [ new Content { Type = "text", Text = $"Error invoking tool '{toolName}': {ex.Message}" }]
            };
            
            return response;
        }
    }
}
