using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebIntractMCPServer;

/// <summary>
/// Application-wide constants and configuration values
/// </summary>
internal static class Constants
{
    /// <summary>
    /// JSON serializer options configured for MCP protocol communication
    /// </summary>
    public static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
}
