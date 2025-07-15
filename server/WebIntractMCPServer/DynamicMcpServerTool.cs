using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using WebInteractMCPServer.Abstractions;

namespace WebInteractMCPServer;

/// <summary>
/// Dynamic MCP server tool that delegates execution to the client via SignalR
/// </summary>
public sealed class DynamicMcpServerTool(
    ModelContextProtocol.Protocol.Tool tool,
    IToolService toolService,
    string sessionId,
    ILogger<DynamicMcpServerTool> logger) : McpServerTool
{
    /// <inheritdoc />
    public override ModelContextProtocol.Protocol.Tool ProtocolTool { get; } = tool ?? throw new ArgumentNullException(nameof(tool));

    /// <summary>
    /// Invokes the tool asynchronously
    /// </summary>
    /// <param name="request">The tool invocation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The tool execution response</returns>
    /// <exception cref="ArgumentNullException">Thrown when request or request parameters are null</exception>
    public override async ValueTask<CallToolResponse> InvokeAsync(
        RequestContext<CallToolRequestParams> request, 
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request?.Params);
        ArgumentNullException.ThrowIfNull(toolService);
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionId);
        ArgumentNullException.ThrowIfNull(logger);

        var toolName = request.Params.Name;
        var arguments = request.Params.Arguments;

        logger.LogDebug("Invoking tool {ToolName} with session {SessionId}", toolName, sessionId);

        try
        {
            return await toolService.ExecuteToolAsync(sessionId, toolName, arguments, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error invoking tool {ToolName} for session {SessionId}", toolName, sessionId);
            
            return new CallToolResponse
            {
                IsError = true,
                Content = [new() { Type = "text", Text = $"Error invoking tool '{toolName}': {ex.Message}" }]
            };
        }
    }
}
