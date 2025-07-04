using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using Microsoft.AspNetCore.SignalR;
using WebIntractMCPServer.Hubs;

namespace WebIntractMCPServer
{
    public class DynamicMcpServerTool : McpServerTool
    {
        public override ModelContextProtocol.Protocol.Tool ProtocolTool { get; }
        private readonly IHubContext<McpToolsHub> _hubContext;

        public DynamicMcpServerTool(ModelContextProtocol.Protocol.Tool tool, IHubContext<McpToolsHub> hubContext)
        {
            ArgumentNullException.ThrowIfNull(tool, nameof(tool));
            ArgumentNullException.ThrowIfNull(hubContext, nameof(hubContext));
            ProtocolTool = tool;
            _hubContext = hubContext;
        }

        public override async ValueTask<CallToolResponse> InvokeAsync(RequestContext<CallToolRequestParams> request, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(request.Params, nameof(request.Params));
            var toolName = request.Params.Name;
            var arguments = request.Params.Arguments;

            try
            {
                var result = await McpToolsHub.InvokeToolOnClient(_hubContext, toolName, arguments);

                return result;
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
}
