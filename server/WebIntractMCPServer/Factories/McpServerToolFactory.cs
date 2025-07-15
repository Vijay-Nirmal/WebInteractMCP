using WebInteractMCPServer.Abstractions;

namespace WebInteractMCPServer.Factories;

/// <summary>
/// Factory for creating MCP server tool instances
/// </summary>
public interface IMcpServerToolFactory
{
    /// <summary>
    /// Creates a dynamic MCP server tool instance
    /// </summary>
    /// <param name="tool">The protocol tool definition</param>
    /// <param name="sessionId">Session identifier</param>
    /// <returns>A new MCP server tool instance</returns>
    DynamicMcpServerTool CreateDynamicTool(ModelContextProtocol.Protocol.Tool tool, string sessionId);
}

/// <summary>
/// Factory implementation for creating MCP server tool instances
/// </summary>
internal sealed class McpServerToolFactory(IServiceProvider serviceProvider) : IMcpServerToolFactory
{
    /// <inheritdoc />
    public DynamicMcpServerTool CreateDynamicTool(ModelContextProtocol.Protocol.Tool tool, string sessionId)
    {
        ArgumentNullException.ThrowIfNull(tool);
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionId);
        ArgumentNullException.ThrowIfNull(serviceProvider);

        var toolService = serviceProvider.GetRequiredService<IToolService>();
        var logger = serviceProvider.GetRequiredService<ILogger<DynamicMcpServerTool>>();

        return new DynamicMcpServerTool(tool, toolService, sessionId, logger);
    }
}
