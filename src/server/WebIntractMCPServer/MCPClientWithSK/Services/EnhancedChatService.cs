namespace MCPClientWithSK.Services;

public class EnhancedChatService : IChatService
{
    private readonly IAgentService _agentService;
    private readonly ILogger<EnhancedChatService> _logger;

    public EnhancedChatService(IAgentService agentService, ILogger<EnhancedChatService> logger)
    {
        _agentService = agentService;
        _logger = logger;
    }

    public async Task<string> GetResponseAsync(string message)
    {
        try
        {
            _logger.LogInformation("Processing enhanced chat message: {Message}", message);
            
            // Use session ID from request context or generate one
            // In a real implementation, you'd get this from the HTTP context or user session
            var sessionId = "default-session"; // This should be extracted from the request
            
            var response = await _agentService.ProcessMessageAsync(message, sessionId);
            
            _logger.LogInformation("Generated enhanced response for user message");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in enhanced chat service for message: {Message}", message);
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
