using Microsoft.Extensions.Options;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebIntractMCPServer;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddMcpServer()
    .WithHttpTransport();
    // .WithWebIntractMcpTools();
builder.Services.AddHostedService<McpServerInitilizer>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapMcp();

app.Run();

public sealed class McpServerInitilizer : BackgroundService
{
    private static readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
    {
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
        PropertyNameCaseInsensitive = true
    };
    private readonly IOptions<McpServerOptions> _serverOptions;
    private readonly IOptions<HttpServerTransportOptions> _transportOptions;

    public McpServerInitilizer(IOptions<McpServerOptions> serverOptions, IOptions<HttpServerTransportOptions> transportOptions)
    {
        _serverOptions = serverOptions;
        _transportOptions = transportOptions;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _serverOptions.Value.Capabilities ??= new ServerCapabilities();
        _serverOptions.Value.Capabilities.Tools ??= new ToolsCapability();
        _serverOptions.Value.Capabilities.Tools.ToolCollection ??= new McpServerPrimitiveCollection<McpServerTool>();

        var httpClient = new HttpClient();
        var tools = await httpClient.GetFromJsonAsync<List<WebIntractMCPServer.Tool>>("http://localhost:4200/mcp-tools.json", _jsonSerializerOptions);

        if (tools == null || !tools.Any())
        {
            return;
        }

        foreach (var item in tools)
        {
            _serverOptions.Value.Capabilities.Tools.ToolCollection?.Add(new DynamicMcpServerTool(new ModelContextProtocol.Protocol.Tool
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
            }));
        }
    }
}
