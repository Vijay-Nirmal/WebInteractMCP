using Microsoft.SemanticKernel;

namespace MCPClientWithSK;

public class SemanticKernelChatService : IChatService
{
    private readonly Kernel _kernel;
    private readonly ILogger<SemanticKernelChatService> _logger;

    public SemanticKernelChatService(Kernel kernel, ILogger<SemanticKernelChatService> logger)
    {
        _kernel = kernel;
        _logger = logger;
    }

    public async Task<string> GetResponseAsync(string message)
    {
        try
        {
            _logger.LogInformation("Processing chat message: {Message}", message);
            
            var prompt = $"""
                You are a helpful AI assistant integrated into a Stack Overflow-like application. 
                You can help users with programming questions, provide code examples, explain concepts, 
                and assist with debugging issues. Be concise but helpful in your responses.
                
                User question: {message}
                """;

            var result = await _kernel.InvokePromptAsync(prompt);
            var response = result.ToString();
            
            _logger.LogInformation("Generated response for user message");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating response for message: {Message}", message);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}

// Models
public record ChatRequest(string Message);
public record ChatResponse(string Response);
public record PlanRequest(string Goal, string? SessionId = null);
public record PlanResponse(string Plan);
public record ToolsResponse(IEnumerable<string> Tools);

// Chat service interface
public interface IChatService
{
    Task<string> GetResponseAsync(string message);
}
