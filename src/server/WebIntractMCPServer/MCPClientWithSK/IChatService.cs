namespace MCPClientWithSK;

// Models
public record ChatRequest(string Message);
public record ChatResponse(string Response);

// Chat service interface
public interface IChatService
{
    Task<string> GetResponseAsync(string message, string? sessionId = null);
}
