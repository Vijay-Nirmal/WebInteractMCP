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
            throw new NotImplementedException();
        }
    }
}
