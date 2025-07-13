using Microsoft.Extensions.Options;
using WebIntractMCPServer;
using WebIntractMCPServer.Configuration;
using WebIntractMCPServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddOpenApi();
builder.Services.AddMcpIntract(builder.Configuration);
builder.Services.AddCors();

var app = builder.Build();

// Configure CORS policy with resolved options
var mcpOptions = app.Services.GetRequiredService<IOptions<McpIntractOptions>>().Value;

app.UseCors(corsBuilder =>
{
    if (mcpOptions.Cors.AllowAnyOrigin)
    {
        corsBuilder.AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .SetIsOriginAllowed((host) => true)
                   .AllowCredentials();

        if (mcpOptions.Cors.AllowedHeaders.Any())
        {
            corsBuilder.WithHeaders(mcpOptions.Cors.AllowedHeaders);
        }
    }
    else
    {
        corsBuilder.WithOrigins(mcpOptions.Cors.AllowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();

        if (mcpOptions.Cors.AllowedHeaders.Any())
        {
            corsBuilder.WithHeaders(mcpOptions.Cors.AllowedHeaders);
        }
    }
});

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Map endpoints
app.MapMcp();
app.MapHub<McpToolsHub>("/mcptools");

app.Run();