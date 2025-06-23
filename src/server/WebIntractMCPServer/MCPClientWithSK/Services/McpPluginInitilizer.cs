using Microsoft.SemanticKernel;
using ModelContextProtocol.Client;

namespace MCPClientWithSK.Services;

public class McpPluginInitilizer : BackgroundService
{
    private readonly Kernel _kernel;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<McpPluginInitilizer> _logger;
    public McpPluginInitilizer(Kernel kernel, IHttpClientFactory httpClientFactory, ILogger<McpPluginInitilizer> logger)
    {
        _kernel = kernel;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            _logger.LogInformation("Initializing MCP plugins...");

#if DEBUG
            await Task.Delay(5000); // Dummy wait time to wait for MCPServer to get started and initilized
#endif

            var clientTransport = new SseClientTransport(new SseClientTransportOptions
            {
                Name = nameof(McpPluginInitilizer),
                Endpoint = new Uri("http://localhost:5120/sse")
            });
            var client = await McpClientFactory.CreateAsync(clientTransport);

            var tools = await client.ListToolsAsync();

            foreach (var tool in tools)
            {
                _logger.LogInformation("Registering tool: {ToolName}; Title: {ToolTitle}", tool.Name, tool.Title);
            }

#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
            _kernel.Plugins.AddFromFunctions("McpServerTools", tools.Select(aiFunction => aiFunction.AsKernelFunction()));
#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

            _logger.LogInformation("MCP plugins initialized successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing MCP plugins: {Message}", ex.Message);
        }
    }
}