using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

// Load configuration
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: false)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>(optional: true)
    .Build();

// Configure logging
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddConsole();
    builder.SetMinimumLevel(LogLevel.Information);
});
var logger = loggerFactory.CreateLogger("SemanticKernel");

// Get OpenRouter configuration
var openRouterApiKey = configuration["OpenRouter:ApiKey"];
var openRouterModelId = configuration["OpenRouter:ModelId"];

if (string.IsNullOrEmpty(openRouterApiKey) || openRouterApiKey == "YOUR_OPENROUTER_API_KEY")
{
    logger.LogError("Please set your OpenRouter API key in appsettings.json");
    return;
}

if (string.IsNullOrEmpty(openRouterModelId))
{
    logger.LogError("Please set your OpenRouter Model ID in appsettings.json");
    return;
}

logger.LogInformation("Initializing Semantic Kernel with OpenRouter...");

try
{
    // Create the kernel with OpenRouter integration
    var kernel = Kernel.CreateBuilder()
        .AddOpenAIChatCompletion(
            modelId: openRouterModelId,
            apiKey: openRouterApiKey,
            serviceId: "OpenRouter",
            httpClient: new HttpClient { BaseAddress = new Uri("https://openrouter.ai/api/v1/") }
        )
        .Build();

    logger.LogInformation("Semantic Kernel initialized successfully.");
    logger.LogInformation($"Using model: {openRouterModelId}");

    // Example: Simple completion
    logger.LogInformation("Sending a test prompt to OpenRouter...");
    var prompt = "Explain what Semantic Kernel is in one short paragraph.";
    
    var result = await kernel.InvokePromptAsync(prompt);

    logger.LogInformation("Response received:");
    logger.LogInformation(result.ToString());
}
catch (Exception ex)
{
    logger.LogError(ex, "An error occurred while using Semantic Kernel with OpenRouter");
}

logger.LogInformation("Press any key to exit...");
Console.ReadKey();
