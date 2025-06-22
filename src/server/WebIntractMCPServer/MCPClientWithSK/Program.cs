using MCPClientWithSK;
using Microsoft.SemanticKernel;

// Load configuration
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: false)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>(optional: true)
    .Build();

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
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Get OpenRouter configuration
var openRouterApiKey = configuration["OpenRouter:ApiKey"];
var openRouterModelId = configuration["OpenRouter:ModelId"];

builder.Services.AddSingleton<Kernel>(serviceProvider =>
{
    return Kernel.CreateBuilder()
        .AddOpenAIChatCompletion(
            modelId: openRouterModelId,
            apiKey: openRouterApiKey,
            serviceId: "OpenRouter",
            endpoint: new Uri("https://openrouter.ai/api/v1/")
        )
        .Build();
});

builder.Services.AddSingleton<IChatService, SemanticKernelChatService>();

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

app.Logger.LogInformation("Chat server starting...");

app.Run();

