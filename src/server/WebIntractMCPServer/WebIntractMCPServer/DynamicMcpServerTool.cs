using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;

namespace WebIntractMCPServer
{
    public class DynamicMcpServerTool : McpServerTool
    {
        public override ModelContextProtocol.Protocol.Tool ProtocolTool { get; }

        public DynamicMcpServerTool(ModelContextProtocol.Protocol.Tool tool)
        {
            ArgumentNullException.ThrowIfNull(tool, nameof(tool));
            ProtocolTool = tool;
        }

        public override ValueTask<CallToolResponse> InvokeAsync(RequestContext<CallToolRequestParams> request, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(request.Params, nameof(request.Params));
            var tool = request.Params.Name;
            var arguments = request.Params.Arguments;

            // TODO: Send SignalR request to the client with the tool name and the arguments

            // TODO: Get the response from the client and return it
            throw new NotImplementedException();
        }
    }
}
