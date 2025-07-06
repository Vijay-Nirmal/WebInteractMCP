using System.Text.Json.Serialization;

namespace WebIntractMCPServer;

/// <summary>
/// Schema definition for tool input parameters
/// </summary>
internal sealed class InputSchema
{
    /// <summary>
    /// The type of the schema (typically "object")
    /// </summary>
    [JsonPropertyName("type")]
    public required string Type { get; set; }

    /// <summary>
    /// Property definitions for the schema
    /// </summary>
    [JsonPropertyName("properties")]
    public Dictionary<string, PropertySchema> Properties { get; set; } = [];

    /// <summary>
    /// List of required property names
    /// </summary>
    [JsonPropertyName("required")]
    public List<string> Required { get; set; } = [];
}

/// <summary>
/// Schema definition for a single property
/// </summary>
internal sealed class PropertySchema
{
    /// <summary>
    /// The data type of the property
    /// </summary>
    [JsonPropertyName("type")]
    public required string Type { get; set; }

    /// <summary>
    /// Human-readable description of the property
    /// </summary>
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    /// <summary>
    /// Default value for the property, if any
    /// </summary>
    [JsonPropertyName("defaultValue")]
    public object? DefaultValue { get; set; }
}

/// <summary>
/// Represents a tool definition from the client
/// </summary>
public sealed class Tool
{
    /// <summary>
    /// Unique identifier for the tool
    /// </summary>
    [JsonPropertyName("toolId")]
    public required string ToolId { get; set; }

    /// <summary>
    /// Display title for the tool
    /// </summary>
    [JsonPropertyName("title")]
    public required string Title { get; set; }

    /// <summary>
    /// Detailed description of what the tool does
    /// </summary>
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    /// <summary>
    /// Parameter schema definition for the tool
    /// </summary>
    [JsonPropertyName("parameterSchema")]
    public ToolParameters? ParameterSchema { get; set; } = new();

    /// <summary>
    /// Indicates if the tool performs destructive operations
    /// </summary>
    [JsonPropertyName("destructive")]
    public bool? Destructive { get; set; }

    /// <summary>
    /// Indicates if the tool is idempotent (safe to run multiple times)
    /// </summary>
    [JsonPropertyName("idempotent")]
    public bool? Idempotent { get; set; }

    /// <summary>
    /// Indicates if the tool operates in an open-world context
    /// </summary>
    [JsonPropertyName("openWorld")]
    public bool? OpenWorld { get; set; }

    /// <summary>
    /// Indicates if the tool only performs read operations
    /// </summary>
    [JsonPropertyName("readOnly")]
    public bool? ReadOnly { get; set; }
}

/// <summary>
/// Represents a parameter definition for a tool
/// </summary>
public sealed class ToolParameter
{
    /// <summary>
    /// Data type of the parameter
    /// </summary>
    [JsonPropertyName("type")]
    public required string Type { get; set; }

    /// <summary>
    /// Description of the parameter
    /// </summary>
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    /// <summary>
    /// Whether this parameter is required (default: false)
    /// </summary>
    [JsonPropertyName("required")]
    public bool? Required { get; set; }

    /// <summary>
    /// Default value for the parameter
    /// </summary>
    [JsonPropertyName("defaultValue")]
    public object? DefaultValue { get; set; }

    /// <summary>
    /// For string types: minimum length
    /// </summary>
    [JsonPropertyName("minLength")]
    public int? MinLength { get; set; }

    /// <summary>
    /// For string types: maximum length
    /// </summary>
    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; set; }

    /// <summary>
    /// For string/array types: pattern or allowed values
    /// </summary>
    [JsonPropertyName("pattern")]
    public object? Pattern { get; set; } // Can be string or string[]

    /// <summary>
    /// For number types: minimum value
    /// </summary>
    [JsonPropertyName("minimum")]
    public double? Minimum { get; set; }

    /// <summary>
    /// For number types: maximum value
    /// </summary>
    [JsonPropertyName("maximum")]
    public double? Maximum { get; set; }

    /// <summary>
    /// For array types: type of array items
    /// </summary>
    [JsonPropertyName("items")]
    public ToolParameter? Items { get; set; }

    /// <summary>
    /// For object types: properties definition
    /// </summary>
    [JsonPropertyName("properties")]
    public Dictionary<string, ToolParameter>? Properties { get; set; }

    /// <summary>
    /// Example value(s) for documentation
    /// </summary>
    [JsonPropertyName("examples")]
    public List<object>? Examples { get; set; }
}

/// <summary>
/// Metadata information for tools
/// </summary>
public sealed class Metadata
{
    /// <summary>
    /// Version of the tool
    /// </summary>
    [JsonPropertyName("version")]
    public string? Version { get; set; }

    /// <summary>
    /// Author of the tool
    /// </summary>
    [JsonPropertyName("author")]
    public string? Author { get; set; }
}


/// <summary>
/// Collection of parameters for a tool
/// </summary>
public sealed class ToolParameters
{
    /// <summary>
    /// Dictionary of parameter definitions
    /// </summary>
    [JsonPropertyName("parameters")]
    public Dictionary<string, ToolParameter> Parameters { get; set; } = [];

    /// <summary>
    /// List of required parameter names
    /// </summary>
    [JsonPropertyName("required")]
    public List<string> Required { get; set; } = [];

    /// <summary>
    /// Metadata for the tool parameters
    /// </summary>
    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }
}
