using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using MCPClientWithSK.Plugins;

namespace MCPClientWithSK.Services;

public class AgenticSemanticKernelService : IAgentService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletion;
    private readonly IMemoryService _memoryService;
    private readonly ILogger<AgenticSemanticKernelService> _logger;

    
    public AgenticSemanticKernelService(
        Kernel kernel, 
        IMemoryService memoryService,
        ILogger<AgenticSemanticKernelService> logger)
    {
        _kernel = kernel;
        _chatCompletion = kernel.GetRequiredService<IChatCompletionService>();
        _memoryService = memoryService;
        _logger = logger;
        _kernel.ImportPluginFromType<PlannerPlugin>("Planner");
    }
    
    public async Task<string> ProcessMessageAsync(string message, string? sessionId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            sessionId ??= Guid.NewGuid().ToString();
            _logger.LogInformation("Processing message for session {SessionId}", sessionId);

            var intent = await AnalyzeUserIntentAsync(message);
            _logger.LogDebug("Detected user intent: {Intent}", intent);

            var context = await _memoryService.GetRelevantContextAsync(sessionId, message);

            // Create chat history with context
            var chatHistory = new ChatHistory();
            
            // Add system message with agent instructions
            chatHistory.AddSystemMessage(GetSystemPrompt(intent, context));
            
            // Add conversation history
            var history = await _memoryService.GetConversationHistoryAsync(sessionId, 5);
            foreach (var entry in history)
            {
                chatHistory.AddUserMessage(entry.UserMessage);
                chatHistory.AddAssistantMessage(entry.AssistantResponse);
            }

            // Add current user message
            chatHistory.AddUserMessage(message);

            // Configure execution settings for function calling
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                Temperature = 0.7,
                MaxTokens = 2000
            };

            // Get response from the model with retry logic
            var response = await _chatCompletion.GetChatMessageContentAsync(
                    chatHistory,
                    executionSettings,
                    _kernel,
                    cancellationToken);
            var responseText = response?.Content ?? "I apologize, but I couldn't generate a response.";

            // Save conversation to memory
            await _memoryService.SaveConversationAsync(sessionId, message, responseText);

            return responseText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message: {Message}", message);
            return "Error occurred when processing the message";
        }
    }

    public async Task<string> ExecutePlanAsync(string goal, string? sessionId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            sessionId ??= Guid.NewGuid().ToString();
            _logger.LogInformation("Creating execution plan for goal: {Goal}", goal);

            var planningPrompt = $@"
You are an AI planning agent. Break down the following goal into a step-by-step plan.
Each step should be actionable and specific. Consider what tools and resources might be needed.

Goal: {goal}

Provide a detailed execution plan with numbered steps. For each step, indicate:
1. What needs to be done
2. What tools or functions might be needed
3. Expected outcomes
4. Dependencies on previous steps

Plan:";

            var chatHistory = new ChatHistory();
            chatHistory.AddSystemMessage("You are an expert AI planning assistant. Create detailed, actionable plans.");
            chatHistory.AddUserMessage(planningPrompt);

            var executionSettings = new OpenAIPromptExecutionSettings
            {
                Temperature = 0.3,
                MaxTokens = 1500
            };

            var response = await _chatCompletion.GetChatMessageContentAsync(
                chatHistory,
                executionSettings,
                _kernel,
                cancellationToken);

            var plan = response.Content ?? "Unable to create execution plan.";

            // Save the planning session
            await _memoryService.SaveConversationAsync(sessionId, $"Create plan for: {goal}", plan);

            return plan;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating execution plan for goal: {Goal}", goal);
            return "I apologize, but I couldn't create an execution plan. Please try again with a more specific goal.";
        }
    }

    public async Task<IEnumerable<string>> GetAvailableToolsAsync()
    {
        await Task.CompletedTask; // Async for future extensibility
          var tools = new List<string>
        {
            "🔍 Web Search - Search the internet for information",
            "🌤️ Weather - Get current weather information",
            "💻 Code Analysis - Analyze code for issues and improvements",
            "⚡ Code Generation - Generate code in various programming languages",
            "🐛 Error Explanation - Explain programming errors and provide solutions",
            "📋 Task Planning - Create detailed execution plans with steps and timelines",
            "📊 Progress Tracking - Track and monitor task progress",
            "🎯 Task Prioritization - Prioritize tasks based on importance and urgency",
            "📈 Data Analysis - Analyze datasets and provide statistical insights",
            "📊 Chart Generation - Create data visualization specifications",
            "🧮 Statistical Calculations - Calculate statistical measures for numerical data",
            "💭 Memory Management - Access conversation history and context"
        };

        return tools;
    }

    public async Task<string> AnalyzeUserIntentAsync(string message)
    {
        try
        {
            var intentPrompt = $@"
Analyze the user's message and categorize their intent. Choose from these categories:
- PLAN: User wants help planning, organizing, creating plans, scheduling, or trip planning (keywords: plan, organize, schedule, trip, project, steps, timeline, itinerary)
- CODE_HELP: User needs help with programming/coding
- SEARCH: User wants to search for information
- GENERATE: User wants to create or generate something (but not plans)
- WEATHER: User wants weather information
- QUESTION: User is asking for information or explanation
- CHAT: General conversation or greeting
- OTHER: Doesn't fit other categories

Examples of PLAN intent:
- ""Plan a trip to Nagercoil""
- ""Help me organize a project""
- ""Create a schedule for my work""
- ""I need to plan my vacation""
- ""How should I organize this task?""

Message: ""{message}""

Respond with just the category name (e.g., PLAN).";

            var chatHistory = new ChatHistory();
            chatHistory.AddSystemMessage("You are an intent classification system. Focus especially on detecting PLAN intent for any planning, organizing, or scheduling requests. Respond only with the category name.");
            chatHistory.AddUserMessage(intentPrompt);

            var executionSettings = new OpenAIPromptExecutionSettings
            {
                Temperature = 0.1,
                MaxTokens = 50
            };

            var response = await _chatCompletion.GetChatMessageContentAsync(
                chatHistory,
                executionSettings,
                _kernel);

            var detectedIntent = response.Content?.Trim().ToUpper() ?? "OTHER";
            _logger.LogInformation("Detected intent '{Intent}' for message: {Message}", detectedIntent, message);
            
            return detectedIntent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing user intent for message: {Message}", message);
            return "OTHER";
        }
    }

    public async Task ClearSessionAsync(string sessionId)
    {
        await _memoryService.ClearSessionMemoryAsync(sessionId);
        _logger.LogInformation("Cleared session {SessionId}", sessionId);
    }

 
    private string GetSystemPrompt(string intent, string context)
    {
        var basePrompt = @"You are an advanced AI assistant with access to planning tools and functions. 

CRITICAL INSTRUCTIONS FOR PLANNING REQUESTS:
When the user asks for any type of planning (trip planning, project planning, task organization, scheduling), you MUST use the create_task_plan function. Do NOT provide planning advice without calling this function first.

Available Planning Tools:
- create_task_plan(goal, resources, timeline): REQUIRED for all planning requests
- simple_plan(task): For simple planning tests

MANDATORY BEHAVIOR:
1. If user mentions 'plan', 'organize', 'schedule', 'trip', 'project' - CALL create_task_plan
2. Always use function calls when available and relevant
3. Do not give planning advice without using the planning tool
4. Be explicit about calling functions

Example: User says ""Plan a trip to Paris"" → You MUST call create_task_plan(goal=""Plan a trip to Paris"", resources="""", timeline="""")
";

        var intentSpecificPrompt = intent switch
        {
            "PLAN" => "\n\nFocus: The user needs planning help. You MUST use the create_task_plan function to generate a proper plan with steps, timeline, and dependencies.",
            "CODE_HELP" => "\n\nFocus: The user needs programming assistance. Provide solutions and code examples.",
            "SEARCH" => "\n\nFocus: The user wants information. Provide comprehensive information.",
            "GENERATE" => "\n\nFocus: The user wants to create something. Be creative and helpful.",
            "WEATHER" => "\n\nFocus: The user wants weather information. Provide weather details.",
            "QUESTION" => "\n\nFocus: The user has a question. Provide comprehensive, well-explained answers.",
            _ => "\n\nFocus: Analyze the request and use appropriate tools if available."
        };

        var contextPrompt = !string.IsNullOrEmpty(context) && context != "No previous conversation context available."
            ? $"\n\nRelevant Context from Previous Conversation:\n{context}"
            : "";

        return basePrompt + intentSpecificPrompt + contextPrompt;
    }

    // Diagnostic method to test plugin functionality
    public async Task<string> TestPlannerPluginAsync()
    {
        try
        {
            _logger.LogInformation("Testing PlannerPlugin functionality");
            
            // List all available functions
            var functions = _kernel.Plugins.SelectMany(p => p.Select(f => $"{p.Name}.{f.Name}")).ToList();
            _logger.LogInformation("Available functions: {Functions}", string.Join(", ", functions));
            
            // Test direct function invocation
            var testResult = await _kernel.InvokeAsync("Planner", "simple_plan", new() { ["task"] = "test task" });
            _logger.LogInformation("Direct function test result: {Result}", testResult);
            
            return $"Plugin test successful. Available functions: {string.Join(", ", functions)}. Test result: {testResult}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plugin test failed");
            return $"Plugin test failed: {ex.Message}";
        }
    }
}
