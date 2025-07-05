using Microsoft.AspNetCore.SignalR;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using System.Diagnostics;
using System.Text.Json;
using WebIntractMCPServer.Hubs;

namespace WebIntractMCPServer;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMcpIntract(this IServiceCollection services)
    {
        services.AddHttpClient();
        services.AddMcpServer().WithHttpTransport();
        services.AddSignalR();

        services.Configure<HttpServerTransportOptions>(options =>
        {
            options.ConfigureSessionOptions = async (context, options, cancellationToken) =>
            {
                // get McpIntract-Session-Id header
                if (!context.Request.Headers.TryGetValue("McpIntract-Session-Id", out var session) || string.IsNullOrEmpty(session))
                {
                    throw new InvalidOperationException("McpIntract-Session-Id header is not present. Makesure to initizate a new session from the client and pass the session Id as the McpIntract-Session-Id header");
                }

                var serviceProvider = context.RequestServices;

                var clientFactor = serviceProvider.GetService<IHttpClientFactory>();
                if (clientFactor is null)
                {
                    throw new UnreachableException("Can't reach this code as this can only happenen if AddHttpClient is not called in ServiceCollection");
                }

                var hub = serviceProvider.GetService<IHubContext<McpToolsHub>>();
                if (hub is null)
                {
                    throw new UnreachableException("Can't reach this code as this can only happenen if AddSignalR is not called in ServiceCollection");
                }

                var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
                ILogger? logger = null;
                if (loggerFactory is not null)
                {
                    logger = loggerFactory.CreateLogger("ConfigureSession");
                }

                var httpClient = clientFactor.CreateClient("McpIntractClient");
                // TODO: Make the URL configurable
                // TODO: Should get the tools once from the client and cache them
                // TODO: Get the current available tools from the client and add them to the server capabilities instead of all the tools
                var tools = await httpClient.GetFromJsonAsync<List<Tool>>("http://localhost:4200/mcp-tools.json", Constants.JsonSerializerOptions);

                if (tools == null || !tools.Any())
                {
                    logger?.LogWarning("No tools found from the client");
                    return;
                }

                options.Capabilities ??= new ServerCapabilities();
                options.Capabilities.Tools ??= new ToolsCapability();
                options.Capabilities.Tools.ToolCollection ??= new McpServerPrimitiveCollection<McpServerTool>();

                Debug.Assert(options.Capabilities.Tools.ToolCollection.IsEmpty == true, "ToolCollection should be empty before adding tools.");

                foreach (var item in tools)
                {
                    options.Capabilities.Tools.ToolCollection?.Add(new DynamicMcpServerTool(new ModelContextProtocol.Protocol.Tool
                    {
                        Name = item.ToolId,
                        Description = item.Description,
                        InputSchema = JsonSerializer.SerializeToElement(new InputSchema
                        {
                            Type = "object",
                            Properties = item.ParameterSchema?.Parameters.ToDictionary(k => k.Key, v => new PropertySchema { Type = v.Value.Type, Description = v.Value.Description, DefaultValue = v.Value.DefaultValue }) ?? [],
                            Required = item.ParameterSchema?.Required ?? []
                        }),
                        Annotations = new ToolAnnotations
                        {
                            Title = item.Title,
                            IdempotentHint = item.Idempotent,
                            DestructiveHint = item.Destructive,
                            OpenWorldHint = item.OpenWorld,
                            ReadOnlyHint = item.ReadOnly
                        }
                    }, hub, session.ToString()));
                }
            };
        });

        return services;
    }
}
