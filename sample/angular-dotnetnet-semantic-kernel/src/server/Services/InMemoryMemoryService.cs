using System.Collections.Concurrent;

namespace MCPClientWithSK.Services;

public class InMemoryMemoryService : IMemoryService
{
    private readonly ConcurrentDictionary<string, List<ConversationEntry>> _sessionMemories = new();
    private readonly ILogger<InMemoryMemoryService> _logger;

    public InMemoryMemoryService(ILogger<InMemoryMemoryService> logger)
    {
        _logger = logger;
    }

    public Task SaveConversationAsync(string sessionId, string userMessage, string assistantResponse)
    {
        var entry = new ConversationEntry(userMessage, assistantResponse, DateTime.UtcNow);
        
        _sessionMemories.AddOrUpdate(sessionId, 
            new List<ConversationEntry> { entry },
            (key, existing) =>
            {
                existing.Add(entry);
                // Keep only last 50 entries per session
                if (existing.Count > 50)
                {
                    existing.RemoveRange(0, existing.Count - 50);
                }
                return existing;
            });

        _logger.LogDebug("Saved conversation entry for session {SessionId}", sessionId);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<ConversationEntry>> GetConversationHistoryAsync(string sessionId, int maxEntries = 10)
    {
        if (_sessionMemories.TryGetValue(sessionId, out var entries))
        {
            var result = entries.TakeLast(maxEntries).ToList();
            return Task.FromResult<IEnumerable<ConversationEntry>>(result);
        }

        return Task.FromResult<IEnumerable<ConversationEntry>>(Array.Empty<ConversationEntry>());
    }

    public Task<string> GetRelevantContextAsync(string sessionId, string query)
    {
        if (!_sessionMemories.TryGetValue(sessionId, out var entries))
        {
            return Task.FromResult("No previous conversation context available.");
        }

        // Simple keyword-based relevance matching
        var keywords = ExtractKeywords(query.ToLower());
        var relevantEntries = entries
            .Where(entry => keywords.Any(keyword => 
                entry.UserMessage.ToLower().Contains(keyword) || 
                entry.AssistantResponse.ToLower().Contains(keyword)))
            .TakeLast(5)
            .ToList();

        if (!relevantEntries.Any())
        {
            return Task.FromResult("No relevant previous context found.");
        }

        var context = string.Join("\n\n", relevantEntries.Select(entry =>
            $"Previous Context:\nUser: {entry.UserMessage}\nAssistant: {TruncateText(entry.AssistantResponse, 200)}"));

        return Task.FromResult(context);
    }

    public Task ClearSessionMemoryAsync(string sessionId)
    {
        _sessionMemories.TryRemove(sessionId, out _);
        _logger.LogDebug("Cleared memory for session {SessionId}", sessionId);
        return Task.CompletedTask;
    }

    private static string[] ExtractKeywords(string text)
    {
        // Simple keyword extraction - remove common words and extract meaningful terms
        var commonWords = new HashSet<string> { "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "what", "how", "why", "when", "where", "who" };
        
        return text.Split(new[] { ' ', '\t', '\n', '\r', '.', ',', ';', ':', '!', '?' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(word => word.Length > 2 && !commonWords.Contains(word.ToLower()))
            .Take(10)
            .ToArray();
    }

    private static string TruncateText(string text, int maxLength)
    {
        if (text.Length <= maxLength) return text;
        return text.Substring(0, maxLength) + "...";
    }
}
