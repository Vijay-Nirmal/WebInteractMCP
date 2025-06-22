using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;

namespace MCPClientWithSK.Plugins;

/// <summary>
/// Plugin for task planning and management
/// </summary>
public class PlannerPlugin
{
    [KernelFunction("create_task_plan")]
    [Description("Create a detailed task plan with steps, dependencies, and timeline for any goal or objective")]
    public async Task<string> CreateTaskPlanAsync(
        [Description("The main goal or objective to plan for")] string goal,
        [Description("Available resources or constraints (optional)")] string resources = "",
        [Description("Timeline or deadline (optional)")] string timeline = "")
    {
        await Task.Delay(300);
        
        var plan = new
        {
            Goal = goal,
            Resources = resources,
            Timeline = timeline,
            CreatedAt = DateTime.UtcNow,
            Steps = new[]
            {
                new { Step = 1, Task = "Research and gather requirements", Duration = "2 hours", Dependencies = new string[0] },
                new { Step = 2, Task = "Create initial design/outline", Duration = "1 hour", Dependencies = new[] { "Step 1" } },
                new { Step = 3, Task = "Develop/implement solution", Duration = "4 hours", Dependencies = new[] { "Step 2" } },
                new { Step = 4, Task = "Test and validate", Duration = "2 hours", Dependencies = new[] { "Step 3" } },
                new { Step = 5, Task = "Review and finalize", Duration = "1 hour", Dependencies = new[] { "Step 4" } }
            },
            EstimatedTotalTime = "10 hours",
            Risks = new[]
            {
                "Resource availability",
                "Technical complexity", 
                "Timeline constraints"
            },
            Mitigation = new[]
            {
                "Prepare backup resources",
                "Break down complex tasks",
                "Build in buffer time"
            }
        };
        
        return JsonSerializer.Serialize(plan, new JsonSerializerOptions { WriteIndented = true });
    }

    [KernelFunction("simple_plan")]
    [Description("Create a simple plan for testing purposes")]
    public async Task<string> SimplePlanAsync(
        [Description("What to plan for")] string task)
    {
        await Task.Delay(100);
        return $"Simple plan for: {task}\n1. Start planning\n2. Execute plan\n3. Complete task";
    }

    [KernelFunction("track_progress")]
    [Description("Track progress on a task or project")]
    public async Task<string> TrackProgressAsync(
        [Description("The task or project being tracked")] string task,
        [Description("Current status (not_started, in_progress, completed, blocked)")] string status,
        [Description("Percentage complete (0-100)")] int percentComplete = 0)
    {
        await Task.Delay(100);
        
        var progress = new
        {
            Task = task,
            Status = status,
            PercentComplete = percentComplete,
            LastUpdated = DateTime.UtcNow,
            NextActions = status switch
            {
                "not_started" => new[] { "Begin initial research", "Set up workspace", "Gather requirements" },
                "in_progress" => new[] { "Continue current work", "Update stakeholders", "Address any blockers" },
                "blocked" => new[] { "Identify blocking issues", "Escalate if needed", "Find alternative approaches" },
                "completed" => new[] { "Document lessons learned", "Archive project files", "Share results" },
                _ => new[] { "Update status", "Define next steps" }
            }
        };
        
        return JsonSerializer.Serialize(progress, new JsonSerializerOptions { WriteIndented = true });
    }

    [KernelFunction("prioritize_tasks")]
    [Description("Prioritize a list of tasks based on urgency and importance")]
    public async Task<string> PrioritizeTasksAsync(
        [Description("Comma-separated list of tasks")] string tasks,
        [Description("Prioritization criteria (deadline, importance, effort)")] string criteria = "importance")
    {
        await Task.Delay(200);
        
        var taskList = tasks.Split(',').Select(t => t.Trim()).ToArray();
        var prioritizedTasks = taskList.Select((task, index) => new
        {
            Priority = index + 1,
            Task = task,
            Criteria = criteria,
            Recommendation = $"Complete by {DateTime.UtcNow.AddDays(index + 1):yyyy-MM-dd}",
            EstimatedEffort = $"{(index + 1) * 2} hours"
        }).ToArray();
        
        return JsonSerializer.Serialize(new { Criteria = criteria, Tasks = prioritizedTasks }, 
            new JsonSerializerOptions { WriteIndented = true });
    }
}
