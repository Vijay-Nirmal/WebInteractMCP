namespace MCPClientWithSK.Services;

public interface IAgentService
{
    Task<string> ProcessMessageAsync(string message, string? sessionId = null, CancellationToken cancellationToken = default);
    Task ClearSessionAsync(string sessionId);
}

public interface IMemoryService
{
    Task SaveConversationAsync(string sessionId, string userMessage, string assistantResponse);
    Task<IEnumerable<ConversationEntry>> GetConversationHistoryAsync(string sessionId, int maxEntries = 10);
    Task<string> GetRelevantContextAsync(string sessionId, string query);
    Task ClearSessionMemoryAsync(string sessionId);
}

public record ConversationEntry(string UserMessage, string AssistantResponse, DateTime Timestamp);
