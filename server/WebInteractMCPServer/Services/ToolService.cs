using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Protocol;
using WebInteractMCPServer.Abstractions;
using WebInteractMCPServer.Configuration;
using WebInteractMCPServer.Hubs;

namespace WebInteractMCPServer.Services;

/// <summary>
/// Service implementation for managing tool operations with the client
/// </summary>
internal sealed class ToolService : IToolService
{
    private readonly IHubContext<McpToolsHub> _hubContext;
    private readonly IOptionsMonitor<McpInteractOptions> _options;
    private readonly ILogger<ToolService> _logger;

    public ToolService(
        IHubContext<McpToolsHub> hubContext,
        IOptionsMonitor<McpInteractOptions> options,
        ILogger<ToolService> logger)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Tool>> GetToolsAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionId);

        var options = _options.CurrentValue;

        try
        {
            _logger.LogDebug("Requesting tools from client session {SessionId}", sessionId);

            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromMinutes(options.Tool.TimeoutMinutes));
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var toolsJson = await _hubContext.Clients.Client(sessionId)
                .InvokeAsync<string>("GetTools", combinedCts.Token);

            if (string.IsNullOrWhiteSpace(toolsJson))
            {
                _logger.LogWarning("Received null or empty tools response from session {SessionId}", sessionId);
                return [];
            }

            var tools = System.Text.Json.JsonSerializer.Deserialize<List<Tool>>(toolsJson, Constants.JsonSerializerOptions);

            if (tools is null)
            {
                _logger.LogWarning("Failed to deserialize tools from session {SessionId}", sessionId);
                return [];
            }

            var toolsList = tools.AsReadOnly();
            _logger.LogInformation("Successfully retrieved {ToolCount} tools from session {SessionId}", toolsList.Count, sessionId);
            return toolsList;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Tool discovery was cancelled for session {SessionId}", sessionId);
            throw new InvalidOperationException("Tool discovery was cancelled");
        }
        catch (OperationCanceledException)
        {
            var errorMessage = $"Tool discovery timed out for session {sessionId}. Client did not respond within {options.Tool.TimeoutMinutes} minutes.";
            _logger.LogCritical("CRITICAL: {ErrorMessage}", errorMessage);
            throw new InvalidOperationException(errorMessage);
        }
        catch (System.Text.Json.JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize tools response from session {SessionId}", sessionId);
            throw new InvalidOperationException("Failed to parse tools response from client", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching tools from session {SessionId}", sessionId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<CallToolResponse> ExecuteToolAsync(string sessionId, string toolName, object? arguments, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionId);
        ArgumentException.ThrowIfNullOrWhiteSpace(toolName);

        var options = _options.CurrentValue;

        try
        {
            _logger.LogDebug("Executing tool {ToolName} for session {SessionId}", toolName, sessionId);

            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromMinutes(options.Tool.TimeoutMinutes));
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var response = await _hubContext.Clients.Client(sessionId)
                .InvokeAsync<CallToolResponse>("InvokeTool", toolName, arguments, combinedCts.Token);

            _logger.LogDebug("Successfully executed tool {ToolName} for session {SessionId}", toolName, sessionId);
            return response;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Tool execution for {ToolName} was cancelled for session {SessionId}", toolName, sessionId);
            return CreateErrorResponse("Tool execution was cancelled");
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Tool execution for {ToolName} timed out for session {SessionId}", toolName, sessionId);
            return CreateErrorResponse("Tool execution timeout");
        }
        catch (Exception ex)
        {
            var errorMessage = $"Tool execution error: {ex.Message}";
            
            if (options.Tool.EnableDetailedErrorLogging)
            {
                _logger.LogError(ex, "Error executing tool {ToolName} for session {SessionId}", toolName, sessionId);
            }
            else
            {
                _logger.LogWarning("Error executing tool {ToolName} for session {SessionId}: {ErrorMessage}", toolName, sessionId, ex.Message);
            }

            return CreateErrorResponse(errorMessage);
        }
    }

    private static CallToolResponse CreateErrorResponse(string message) =>
        new()
        {
            Content = [new() { Type = "text", Text = message }],
            IsError = true
        };
}
