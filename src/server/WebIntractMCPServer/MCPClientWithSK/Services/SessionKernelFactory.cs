using Microsoft.SemanticKernel;
using ModelContextProtocol.Client;
using System.Collections.Concurrent;

namespace MCPClientWithSK.Services;

public class SessionKernelFactory : ISessionKernelFactory
{
    private readonly ConcurrentDictionary<string, Kernel> _sessionKernels = new();
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SessionKernelFactory> _logger;

    public SessionKernelFactory(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<SessionKernelFactory> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<Kernel> GetOrCreateKernelAsync(string sessionId)
    {
        if (_sessionKernels.TryGetValue(sessionId, out var existingKernel))
        {
            _logger.LogDebug("Returning existing kernel for session: {SessionId}", sessionId);
            return existingKernel;
        }

        _logger.LogInformation("Creating new kernel for session: {SessionId}", sessionId);
        
        var kernel = await CreateKernelWithMcpPluginsAsync(sessionId);
        _sessionKernels.TryAdd(sessionId, kernel);
        
        return kernel;
    }

    public Task<bool> RemoveKernelAsync(string sessionId)
    {
        if (_sessionKernels.TryRemove(sessionId, out var kernel))
        {
            _logger.LogInformation("Removed kernel for session: {SessionId}", sessionId);
            // Note: Kernel doesn't implement IDisposable in current SK version
            // If needed, we could implement cleanup here
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public async Task ClearAllKernelsAsync()
    {
        var sessions = _sessionKernels.Keys.ToList();
        foreach (var sessionId in sessions)
        {
            await RemoveKernelAsync(sessionId);
        }
        _logger.LogInformation("Cleared all session kernels");
    }

    private async Task<Kernel> CreateKernelWithMcpPluginsAsync(string sessionId)
    {
        try
        {
            // Get OpenRouter configuration
            var openRouterApiKey = _configuration["OpenRouter:ApiKey"] ?? throw new InvalidOperationException("OpenRouter API key not configured");
            var openRouterModelId = _configuration["OpenRouter:ModelId"] ?? throw new InvalidOperationException("OpenRouter Model ID not configured");

            // Validate configuration
            if (openRouterApiKey == "YOUR_OPENROUTER_API_KEY" || string.IsNullOrEmpty(openRouterApiKey))
            {
                throw new InvalidOperationException("Please configure your OpenRouter API key. Use: dotnet user-secrets set \"OpenRouter:ApiKey\" \"your-actual-api-key\"");
            }

            _logger.LogInformation("Creating Semantic Kernel for session {SessionId} with OpenRouter model: {ModelId}", sessionId, openRouterModelId);
            
            // Create the kernel
            var kernel = Kernel.CreateBuilder()
                .AddOpenAIChatCompletion(
                    modelId: openRouterModelId,
                    apiKey: openRouterApiKey,
                    serviceId: "OpenRouter",
                    endpoint: new Uri("https://openrouter.ai/api/v1"),
                    httpClient: _httpClientFactory.CreateClient()
                )
                .Build();

            // Initialize MCP plugins for this session
            await InitializeMcpPluginsAsync(kernel, sessionId);

            _logger.LogInformation("Kernel with MCP plugins created successfully for session: {SessionId}", sessionId);
            return kernel;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create kernel for session: {SessionId}", sessionId);
            throw;
        }
    }

    private async Task InitializeMcpPluginsAsync(Kernel kernel, string sessionId)
    {
        try
        {
            _logger.LogInformation("Initializing MCP plugins for session: {SessionId}", sessionId);

            var clientTransport = new SseClientTransport(new SseClientTransportOptions
            {
                Name = $"Session_{sessionId}",
                Endpoint = new Uri("http://localhost:5120/sse"),
                AdditionalHeaders = new Dictionary<string, string>
                {
                    { "McpIntract-Session-Id", sessionId }
                },
            });
            
            var client = await McpClientFactory.CreateAsync(clientTransport);
            var tools = await client.ListToolsAsync();

            foreach (var tool in tools)
            {
                _logger.LogDebug("Registering tool for session {SessionId}: {ToolName} - {ToolTitle}", sessionId, tool.Name, tool.Title);
            }

#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
            kernel.Plugins.AddFromFunctions("McpServerTools", tools.Select(aiFunction => aiFunction.AsKernelFunction()));
#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

            _logger.LogInformation("MCP plugins initialized successfully for session: {SessionId}. Tools count: {ToolsCount}", sessionId, tools.Count());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing MCP plugins for session {SessionId}: {Message}", sessionId, ex.Message);
            // Don't rethrow - allow kernel to be created without MCP plugins if needed
        }
    }
}
