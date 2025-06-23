using Microsoft.Extensions.AI;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebIntractMCPServer
{
    public static class McpServerBuilderExtensions
    {
        private static readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
        {
            UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
            PropertyNameCaseInsensitive = true
        };

        public static IMcpServerBuilder WithWebIntractMcpTools(this IMcpServerBuilder builder)
        {
            var httpClient = new HttpClient();
            var tools = httpClient.GetFromJsonAsync<List<Tool>>("http://localhost:4200/mcp-tools.json", _jsonSerializerOptions).GetAwaiter().GetResult();

            if (tools == null || !tools.Any())
            {
                return builder;
            }

            foreach (var item in tools)
            {
                // TODO: Add tools at runtime instead of at startup, might be able to achive this using McpServerOptions.Capabilities.Tools.Add() method and fire chaned event when tools are added.
                builder.Services.AddSingleton<McpServerTool>(provider =>
                {
                    var serializerOptions = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };
                    
                    var tool = new DynamicMcpServerTool(new ModelContextProtocol.Protocol.Tool
                    {
                        Name = item.ToolId,
                        Description = item.Description,
                        InputSchema = JsonSerializer.SerializeToElement(new InputSchema
                        {
                            Type = "object",
                            Properties = item.ParameterSchema.Parameters.ToDictionary(k => k.Key, v => new PropertySchema { Type = v.Value.Type, Description = v.Value.Description, DefaultValue = v.Value.DefaultValue }),
                            Required = item.ParameterSchema?.Required ?? []
                        }),
                        Annotations = new ToolAnnotations
                        {
                            Title = item.Title,
                            IdempotentHint = item.Idempotent,
                            DestructiveHint = item.Destructive,
                            OpenWorldHint = item.OpenWorld,
                            ReadOnlyHint = item.ReadOnly
                        }
                    });
                    return tool;
                });
            }

            return builder;
        }
    }

    public class InputSchema
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
        [JsonPropertyName("properties")]
        public Dictionary<string, PropertySchema> Properties { get; set; } = new Dictionary<string, PropertySchema>();
        [JsonPropertyName("required")]
        public List<string> Required { get; set; } = new List<string>();
    }

    public class PropertySchema
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
        [JsonPropertyName("description")]
        public string Description { get; set; }
        [JsonPropertyName("defaultValue")]
        public object? DefaultValue { get; set; }
    }

    public class Tool
    {
        [JsonPropertyName("toolId")]
        public required string ToolId { get; set; }

        [JsonPropertyName("title")]
        public required string Title { get; set; }

        [JsonPropertyName("description")]
        public required string Description { get; set; }

        [JsonPropertyName("mode")]
        public required string Mode { get; set; }

        [JsonPropertyName("steps")]
        public List<Step> Steps { get; set; } = [];

        [JsonPropertyName("pageMatcher")]
        public string? PageMatcher { get; set; }

        [JsonPropertyName("options")]
        public Options? Options { get; set; }

        [JsonPropertyName("parameterSchema")]
        public ToolParameters? ParameterSchema { get; set; } = new ToolParameters();

        [JsonPropertyName("destructive")]
        public bool? Destructive { get; set; }

        [JsonPropertyName("idempotent")]
        public bool? Idempotent { get; set; }

        [JsonPropertyName("openWorld")]
        public bool? OpenWorld { get; set; }

        [JsonPropertyName("readOnly")]
        public bool? ReadOnly { get; set; }
    }

    public class Action
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("element")]
        public string Element { get; set; }

        [JsonPropertyName("value")]
        public string Value { get; set; }

        [JsonPropertyName("delay")]
        public int? Delay { get; set; }

        [JsonPropertyName("functionName")]
        public string FunctionName { get; set; }

        [JsonPropertyName("functionParams")]
        public ToolParameter FunctionParams { get; set; }
    }

    public class AttachTo
    {
        [JsonPropertyName("on")]
        public string On { get; set; }
    }

    public class ToolParameter
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("defaultValue")]
        public object? DefaultValue { get; set; }
    }

    public class Metadata
    {
        [JsonPropertyName("version")]
        public string Version { get; set; }

        [JsonPropertyName("author")]
        public string Author { get; set; }
    }

    public class Options
    {
        [JsonPropertyName("debugMode")]
        public bool? DebugMode { get; set; }

        [JsonPropertyName("elementTimeout")]
        public int? ElementTimeout { get; set; }

        [JsonPropertyName("actionDelay")]
        public int? ActionDelay { get; set; }

        [JsonPropertyName("highlightDuration")]
        public int? HighlightDuration { get; set; }
    }

    public class ToolParameters
    {
        [JsonPropertyName("parameters")]
        public Dictionary<string, ToolParameter> Parameters { get; set; } = [];

        [JsonPropertyName("required")]
        public List<string> Required { get; set; } = [];

        [JsonPropertyName("metadata")]
        public Metadata Metadata { get; set; }
    }

    public class Step
    {
        [JsonPropertyName("targetElement")]
        public string TargetElement { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }

        [JsonPropertyName("delay")]
        public int? Delay { get; set; }

        [JsonPropertyName("action")]
        public Action Action { get; set; }

        [JsonPropertyName("stopOnFailure")]
        public bool? StopOnFailure { get; set; }
    }
}
