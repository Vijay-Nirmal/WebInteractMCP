using MCPClientWithSK;
using MCPClientWithSK.Services;
using Microsoft.SemanticKernel;

// Create web application builder
var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Add services
builder.Services.AddHostedService<McpPluginInitilizer>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Get OpenRouter configuration
var openRouterApiKey = builder.Configuration["OpenRouter:ApiKey"] ?? throw new InvalidOperationException("OpenRouter API key not configured");
var openRouterModelId = builder.Configuration["OpenRouter:ModelId"] ?? throw new InvalidOperationException("OpenRouter Model ID not configured");

// Validate configuration
if (openRouterApiKey == "YOUR_OPENROUTER_API_KEY")
{
    throw new InvalidOperationException("Please configure your OpenRouter API key. Use: dotnet user-secrets set \"OpenRouter:ApiKey\" \"your-actual-api-key\"");
}

builder.Services.AddSingleton<Kernel>(serviceProvider =>
{
    var logger = serviceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Configuring Semantic Kernel with OpenRouter");
        logger.LogInformation("Model ID: {ModelId}", openRouterModelId);
        
        return Kernel.CreateBuilder()
            .AddOpenAIChatCompletion(
                modelId: openRouterModelId,
                apiKey: openRouterApiKey,
                serviceId: "OpenRouter",
                endpoint: new Uri("https://openrouter.ai/api/v1"),
                httpClient: new HttpClient()
            )
            .Build();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to configure Semantic Kernel");
        throw;
    }
});

// Register services for the enhanced agentic implementation
builder.Services.AddSingleton<IMemoryService, InMemoryMemoryService>();
builder.Services.AddSingleton<IAgentService, AgenticSemanticKernelService>();
builder.Services.AddSingleton<IChatService, EnhancedChatService>();
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("AllowAngularApp");

// Add health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Add chat endpoint
app.MapPost("/api/chat", async (ChatRequest request, IChatService chatService) =>
{
    try
    {
        var response = await chatService.GetResponseAsync(request.Message);
        return Results.Ok(new ChatResponse(response));
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Error processing chat request");
        return Results.Problem("An error occurred while processing your request");
    }
});

// Add session management endpoint
app.MapDelete("/api/session/{sessionId}", async (string sessionId, IAgentService agentService) =>
{
    try
    {
        await agentService.ClearSessionAsync(sessionId);
        return Results.Ok(new { Message = $"Session {sessionId} cleared successfully" });
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Error clearing session {SessionId}", sessionId);
        return Results.Problem($"An error occurred while clearing session {sessionId}");
    }
});

app.Run();

