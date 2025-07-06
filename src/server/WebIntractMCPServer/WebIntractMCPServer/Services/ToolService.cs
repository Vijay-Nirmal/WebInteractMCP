using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Protocol;
using WebIntractMCPServer.Abstractions;
using WebIntractMCPServer.Configuration;
using WebIntractMCPServer.Hubs;

namespace WebIntractMCPServer.Services;

/// <summary>
/// Service implementation for managing tool operations with the client
/// </summary>
internal sealed class ToolService : IToolService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHubContext<McpToolsHub> _hubContext;
    private readonly IOptionsMonitor<McpIntractOptions> _options;
    private readonly ILogger<ToolService> _logger;
    private readonly ConcurrentDictionary<string, CacheEntry> _toolsCache = [];

    public ToolService(
        IHttpClientFactory httpClientFactory,
        IHubContext<McpToolsHub> hubContext,
        IOptionsMonitor<McpIntractOptions> options,
        ILogger<ToolService> logger)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Tool>> GetToolsAsync(CancellationToken cancellationToken = default)
    {
        var options = _options.CurrentValue;
        var cacheKey = $"{options.Client.BaseUrl}{options.Client.ToolsEndpoint}";

        if (options.Client.CacheTools && _toolsCache.TryGetValue(cacheKey, out var cacheEntry))
        {
            if (DateTime.UtcNow - cacheEntry.Timestamp < TimeSpan.FromMinutes(options.Client.CacheDurationMinutes))
            {
                _logger.LogDebug("Returning cached tools for key: {CacheKey}", cacheKey);
                return cacheEntry.Tools;
            }

            // Remove expired cache entry
            _toolsCache.TryRemove(cacheKey, out _);
        }

        try
        {
            using var httpClient = _httpClientFactory.CreateClient("McpIntractClient");
            httpClient.Timeout = TimeSpan.FromSeconds(options.Client.TimeoutSeconds);

            var toolsUrl = $"{options.Client.BaseUrl.TrimEnd('/')}{options.Client.ToolsEndpoint}";
            _logger.LogDebug("Fetching tools from: {ToolsUrl}", toolsUrl);

            var tools = await httpClient.GetFromJsonAsync<List<Tool>>(toolsUrl, Constants.JsonSerializerOptions, cancellationToken);

            if (tools is null)
            {
                _logger.LogWarning("Received null response when fetching tools from {ToolsUrl}", toolsUrl);
                return [];
            }

            var toolsList = tools.AsReadOnly();

            if (options.Client.CacheTools)
            {
                _toolsCache.TryAdd(cacheKey, new CacheEntry(toolsList, DateTime.UtcNow));
                _logger.LogDebug("Cached {ToolCount} tools for key: {CacheKey}", toolsList.Count, cacheKey);
            }

            _logger.LogInformation("Successfully retrieved {ToolCount} tools from client", toolsList.Count);
            return toolsList;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error occurred while fetching tools from client");
            throw new InvalidOperationException("Failed to fetch tools from client due to network error", ex);
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Request to fetch tools from client timed out");
            throw new InvalidOperationException("Request to fetch tools from client timed out", ex);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize tools response from client");
            throw new InvalidOperationException("Failed to parse tools response from client", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while fetching tools from client");
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

    private sealed record CacheEntry(IReadOnlyList<Tool> Tools, DateTime Timestamp);
}
