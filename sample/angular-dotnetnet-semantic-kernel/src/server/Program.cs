using MCPClientWithSK;
using MCPClientWithSK.Services;
using Microsoft.SemanticKernel;

// Create web application builder
var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Add services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Get OpenRouter configuration early for validation
var openRouterApiKey = builder.Configuration["OpenRouter:ApiKey"] ?? throw new InvalidOperationException("OpenRouter API key not configured");
var openRouterModelId = builder.Configuration["OpenRouter:ModelId"] ?? throw new InvalidOperationException("OpenRouter Model ID not configured");

// Validate configuration
if (openRouterApiKey == "YOUR_OPENROUTER_API_KEY")
{
    throw new InvalidOperationException("Please configure your OpenRouter API key. Use: dotnet user-secrets set \"OpenRouter:ApiKey\" \"your-actual-api-key\"");
}

// Register session-based kernel factory instead of singleton kernel
builder.Services.AddSingleton<ISessionKernelFactory, SessionKernelFactory>();

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

// Add session management endpoints
app.MapDelete("/api/sessions/{sessionId}", async (string sessionId, ISessionKernelFactory kernelFactory) =>
{
    try
    {
        var removed = await kernelFactory.RemoveKernelAsync(sessionId);
        if (removed)
        {
            app.Logger.LogInformation("Session {SessionId} cleaned up successfully", sessionId);
            return Results.Ok(new { message = "Session cleaned up successfully", sessionId });
        }
        else
        {
            app.Logger.LogWarning("Session {SessionId} not found for cleanup", sessionId);
            return Results.NotFound(new { message = "Session not found", sessionId });
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Error cleaning up session {SessionId}", sessionId);
        return Results.Problem("An error occurred while cleaning up the session");
    }
});

// Add chat endpoint
app.MapPost("/api/chat", async (ChatRequest request, IChatService chatService, HttpContext context) =>
{
    try
    {
        // Get session ID from headers
        var sessionId = context.Request.Headers["McpIntract-Session-Id"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(sessionId))
        {
            app.Logger.LogWarning("Chat request received without session ID");
            return Results.BadRequest("Session ID is required. Please provide McpIntract-Session-Id header.");
        }
        
        app.Logger.LogInformation("Processing chat request for session: {SessionId} with message: {Message}", sessionId, request.Message?.Substring(0, Math.Min(50, request.Message?.Length ?? 0)) ?? "");
        
        var response = await chatService.GetResponseAsync(request.Message ?? "", sessionId);
        
        app.Logger.LogInformation("Chat response generated for session: {SessionId}", sessionId);
        return Results.Ok(new ChatResponse(response));
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Error processing chat request");
        return Results.Problem("An error occurred while processing your request");
    }
});

app.Run();

