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

    public async Task<string> GetResponseAsync(string message, string? sessionId = null)
    {
        try
        {
            _logger.LogInformation("Processing enhanced chat message: {Message} for session: {SessionId}", message, sessionId ?? "none");
            
            // Use provided session ID or fallback to default
            var effectiveSessionId = sessionId ?? "default-session";
            
            var response = await _agentService.ProcessMessageAsync(message, effectiveSessionId);
            
            _logger.LogInformation("Generated enhanced response for user message (session: {SessionId})", effectiveSessionId);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in enhanced chat service for message: {Message} (session: {SessionId})", message, sessionId ?? "none");
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
