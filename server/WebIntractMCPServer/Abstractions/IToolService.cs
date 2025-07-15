using ModelContextProtocol.Protocol;

namespace WebInteractMCPServer.Abstractions;

/// <summary>
/// Service for managing tool operations with the client
/// </summary>
public interface IToolService
{
    /// <summary>
    /// Retrieves available tools from the client
    /// </summary>
    /// <param name="sessionId">Session identifier for the client connection</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of available tools</returns>
    Task<IReadOnlyList<Tool>> GetToolsAsync(string sessionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a tool on the client
    /// </summary>
    /// <param name="sessionId">Session identifier</param>
    /// <param name="toolName">Name of the tool to execute</param>
    /// <param name="arguments">Tool arguments</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Tool execution response</returns>
    Task<CallToolResponse> ExecuteToolAsync(string sessionId, string toolName, object? arguments, CancellationToken cancellationToken = default);
}
