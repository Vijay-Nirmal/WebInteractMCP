using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace MCPClientWithSK.Services;

public class AgenticSemanticKernelService : IAgentService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletion;
    private readonly IMemoryService _memoryService;
    private readonly ILogger<AgenticSemanticKernelService> _logger;

    
    public AgenticSemanticKernelService(
        Kernel kernel, 
        IMemoryService memoryService,
        ILogger<AgenticSemanticKernelService> logger)
    {
        _kernel = kernel;
        _chatCompletion = kernel.GetRequiredService<IChatCompletionService>();
        _memoryService = memoryService;
        _logger = logger;
    }
    
    public async Task<string> ProcessMessageAsync(string message, string? sessionId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            sessionId ??= Guid.NewGuid().ToString();
            _logger.LogInformation("Processing message for session {SessionId}", sessionId);

            var context = await _memoryService.GetRelevantContextAsync(sessionId, message);

            // Create chat history with context
            var chatHistory = new ChatHistory();
            
            // Add conversation history
            var history = await _memoryService.GetConversationHistoryAsync(sessionId, 5);
            foreach (var entry in history)
            {
                chatHistory.AddUserMessage(entry.UserMessage);
                chatHistory.AddAssistantMessage(entry.AssistantResponse);
            }

            // Add current user message
            chatHistory.AddUserMessage(message);

            // Configure execution settings for function calling
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(autoInvoke: true),
                // ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                MaxTokens = 2000
            };

            // Get response from the model with retry logic
            var response = await _chatCompletion.GetChatMessageContentAsync(
                    chatHistory,
                    executionSettings,
                    _kernel,
                    cancellationToken);
            var responseText = response?.Content ?? "I apologize, but I couldn't generate a response.";

            // Save conversation to memory
            await _memoryService.SaveConversationAsync(sessionId, message, responseText);

            return responseText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message: {Message}", message);
            return "Error occurred when processing the message";
        }
    }

    public async Task ClearSessionAsync(string sessionId)
    {
        await _memoryService.ClearSessionMemoryAsync(sessionId);
        _logger.LogInformation("Cleared session {SessionId}", sessionId);
    }
}
