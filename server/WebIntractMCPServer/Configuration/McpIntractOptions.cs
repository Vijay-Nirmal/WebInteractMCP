using System.ComponentModel.DataAnnotations;

namespace WebInteractMCPServer.Configuration;

/// <summary>
/// Configuration options for the MCP Interact server
/// </summary>
public sealed class McpInteractOptions
{
    /// <summary>
    /// Configuration section name
    /// </summary>
    public const string SectionName = "McpInteract";

    /// <summary>
    /// Client connection configuration
    /// </summary>
    public ClientConfiguration Client { get; set; } = new();

    /// <summary>
    /// Tool execution configuration
    /// </summary>
    public ToolConfiguration Tool { get; set; } = new();

    /// <summary>
    /// CORS configuration
    /// </summary>
    public CorsConfiguration Cors { get; set; } = new();
}

/// <summary>
/// Client connection configuration
/// </summary>
public sealed class ClientConfiguration
{
    // Configuration class kept for future extensibility
    // Currently no properties needed since we use SignalR instead of HTTP
}

/// <summary>
/// Tool execution configuration
/// </summary>
public sealed class ToolConfiguration
{
    /// <summary>
    /// Tool execution timeout in minutes
    /// </summary>
    [Range(1, 60)]
    public int TimeoutMinutes { get; set; } = 5;

    /// <summary>
    /// Whether to enable detailed error logging
    /// </summary>
    public bool EnableDetailedErrorLogging { get; set; } = false;
}

/// <summary>
/// CORS configuration
/// </summary>
public sealed class CorsConfiguration
{
    /// <summary>
    /// Allowed origins for CORS
    /// </summary>
    public string[] AllowedOrigins { get; set; } = ["http://localhost:4200"];

    /// <summary>
    /// Whether to allow any origin (use with caution in production)
    /// </summary>
    public bool AllowAnyOrigin { get; set; } = true;

    /// <summary>
    /// Additional allowed headers
    /// </summary>
    public string[] AllowedHeaders { get; set; } = [];
}
