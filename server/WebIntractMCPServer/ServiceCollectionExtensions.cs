using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using WebIntractMCPServer.Abstractions;
using WebIntractMCPServer.Configuration;
using WebIntractMCPServer.Factories;
using WebIntractMCPServer.Services;

namespace WebIntractMCPServer;

/// <summary>
/// Extension methods for configuring MCP Intract services
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds MCP Intract services to the service collection
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configuration">The configuration instance</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddMcpIntract(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        // Register configuration
        services.Configure<McpIntractOptions>(configuration.GetSection(McpIntractOptions.SectionName));
        services.AddSingleton<IValidateOptions<McpIntractOptions>, McpIntractOptionsValidator>();

        // Register core services
        services.AddHttpClient("McpIntractClient");
        services.AddMcpServer().WithHttpTransport();
        services.AddSignalR();

        // Register application services
        services.AddSingleton<IToolService, ToolService>();
        services.AddSingleton<IMcpServerToolFactory, McpServerToolFactory>();

        // Configure HTTP server transport
        services.Configure<HttpServerTransportOptions>(options =>
        {
            options.ConfigureSessionOptions = async (context, sessionOptions, cancellationToken) =>
            {
                await ConfigureSessionAsync(context, sessionOptions, cancellationToken, context.RequestServices);
            };
        });

        return services;
    }

    /// <summary>
    /// Configures the MCP session with available tools from the client
    /// </summary>
    /// <param name="context">HTTP context</param>
    /// <param name="options">Server capabilities options</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <param name="serviceProvider">Service provider for dependency injection</param>
    private static async Task ConfigureSessionAsync(
        HttpContext context, 
        McpServerOptions options, 
        CancellationToken cancellationToken,
        IServiceProvider serviceProvider)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(options);

        var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
        var logger = loggerFactory?.CreateLogger("McpIntractSession");

        try
        {
            // Validate session header
            if (!context.Request.Headers.TryGetValue("McpIntract-Session-Id", out var sessionHeader) || 
                string.IsNullOrWhiteSpace(sessionHeader))
            {
                const string errorMessage = "McpIntract-Session-Id header is missing or empty. Ensure to initialize a new session from the client and pass the session ID as the McpIntract-Session-Id header.";
                logger?.LogError(errorMessage);
                throw new InvalidOperationException(errorMessage);
            }

            var sessionId = sessionHeader.ToString();
            logger?.LogInformation("Configuring session for session ID: {SessionId}", sessionId);

            // Get required services
            var toolService = serviceProvider.GetRequiredService<IToolService>();
            var toolFactory = serviceProvider.GetRequiredService<IMcpServerToolFactory>();

            // Fetch tools from client
            var clientTools = await toolService.GetToolsAsync(cancellationToken);

            if (!clientTools.Any())
            {
                logger?.LogWarning("No tools found from the client for session {SessionId}", sessionId);
                return;
            }

            // Initialize capabilities
            options.Capabilities ??= new ServerCapabilities();
            options.Capabilities.Tools ??= new ToolsCapability();
            options.Capabilities.Tools.ToolCollection ??= new McpServerPrimitiveCollection<McpServerTool>();

            Debug.Assert(options.Capabilities.Tools.ToolCollection.IsEmpty, 
                "ToolCollection should be empty before adding tools.");

            // Convert client tools to MCP protocol tools and add to capabilities
            foreach (var clientTool in clientTools)
            {
                try
                {
                    var protocolTool = ConvertToProtocolTool(clientTool);
                    var mcpServerTool = toolFactory.CreateDynamicTool(protocolTool, sessionId);
                    options.Capabilities.Tools.ToolCollection.Add(mcpServerTool);

                    logger?.LogDebug("Added tool {ToolName} for session {SessionId}", clientTool.ToolId, sessionId);
                }
                catch (Exception ex)
                {
                    logger?.LogWarning(ex, "Failed to add tool {ToolName} for session {SessionId}", clientTool.ToolId, sessionId);
                }
            }

            logger?.LogInformation("Successfully configured {ToolCount} tools for session {SessionId}", 
                options.Capabilities.Tools.ToolCollection.Count, sessionId);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Failed to configure session");
            throw;
        }
    }

    /// <summary>
    /// Converts a client tool to an MCP protocol tool
    /// </summary>
    /// <param name="clientTool">The client tool to convert</param>
    /// <returns>The converted MCP protocol tool</returns>
    private static ModelContextProtocol.Protocol.Tool ConvertToProtocolTool(Tool clientTool)
    {
        return new ModelContextProtocol.Protocol.Tool
        {
            Name = clientTool.ToolId,
            Description = clientTool.Description,
            InputSchema = JsonSerializer.SerializeToElement(new InputSchema
            {
                Type = "object",
                Properties = clientTool.ParameterSchema?.Parameters
                    .ToDictionary(k => k.Key, v => new PropertySchema 
                    { 
                        Type = v.Value.Type, 
                        Description = v.Value.Description, 
                        DefaultValue = v.Value.DefaultValue 
                    }) ?? [],
                Required = clientTool.ParameterSchema?.Required ?? []
            }),
            Annotations = new ToolAnnotations
            {
                Title = clientTool.Title,
                IdempotentHint = clientTool.Idempotent,
                DestructiveHint = clientTool.Destructive,
                OpenWorldHint = clientTool.OpenWorld,
                ReadOnlyHint = clientTool.ReadOnly
            }
        };
    }
}

/// <summary>
/// Validator for MCP Intract options
/// </summary>
internal sealed class McpIntractOptionsValidator : IValidateOptions<McpIntractOptions>
{
    public ValidateOptionsResult Validate(string? name, McpIntractOptions options)
    {
        List<string> failures = [];

        if (string.IsNullOrWhiteSpace(options.Client.BaseUrl))
        {
            failures.Add($"{nameof(McpIntractOptions.Client)}.{nameof(ClientConfiguration.BaseUrl)} is required");
        }
        else if (!Uri.TryCreate(options.Client.BaseUrl, UriKind.Absolute, out _))
        {
            failures.Add($"{nameof(McpIntractOptions.Client)}.{nameof(ClientConfiguration.BaseUrl)} must be a valid URL");
        }

        if (string.IsNullOrWhiteSpace(options.Client.ToolsEndpoint))
        {
            failures.Add($"{nameof(McpIntractOptions.Client)}.{nameof(ClientConfiguration.ToolsEndpoint)} is required");
        }

        if (options.Client.TimeoutSeconds <= 0)
        {
            failures.Add($"{nameof(McpIntractOptions.Client)}.{nameof(ClientConfiguration.TimeoutSeconds)} must be greater than 0");
        }

        if (options.Client.CacheDurationMinutes <= 0)
        {
            failures.Add($"{nameof(McpIntractOptions.Client)}.{nameof(ClientConfiguration.CacheDurationMinutes)} must be greater than 0");
        }

        if (options.Tool.TimeoutMinutes <= 0)
        {
            failures.Add($"{nameof(McpIntractOptions.Tool)}.{nameof(ToolConfiguration.TimeoutMinutes)} must be greater than 0");
        }

        if (!options.Cors.AllowAnyOrigin && (options.Cors.AllowedOrigins is null || !options.Cors.AllowedOrigins.Any()))
        {
            failures.Add($"Either {nameof(McpIntractOptions.Cors)}.{nameof(CorsConfiguration.AllowAnyOrigin)} must be true or {nameof(McpIntractOptions.Cors)}.{nameof(CorsConfiguration.AllowedOrigins)} must contain at least one origin");
        }

        return failures.Any() 
            ? ValidateOptionsResult.Fail(failures) 
            : ValidateOptionsResult.Success;
    }
}
