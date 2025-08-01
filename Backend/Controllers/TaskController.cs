using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Project_Manager_Api.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize] // Require JWT for all actions
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        // Helper to get user id from JWT claims
        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        // POST /api/projects/{projectId}/tasks
        [HttpPost("projects/{projectId}/tasks")]
        public async Task<IActionResult> CreateTask(int projectId, [FromBody] TaskCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
             // Validate that the projectId in the route matches the one in the DTO   
             if (dto.ProjectId != 0 && dto.ProjectId != projectId)
            {
                return BadRequest(new { error = "ProjectId in body does not match ProjectId in route." });
            }    

            try
            {
                var userId = GetUserId();
                // Use the projectId from route, not from the DTO
                var task = await _taskService.CreateTaskAsync(projectId, dto, userId);
                return CreatedAtAction(nameof(GetTasks), new { projectId }, task);

            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/tasks/{taskId}
        [HttpPut("tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, [FromBody] TaskCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var task = await _taskService.UpdateTaskAsync(taskId, dto, userId);
                if (task == null)
                    return NotFound(new { error = "Task not found or access denied." });
                return Ok(task);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/tasks/{taskId}
        [HttpDelete("tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _taskService.DeleteTaskAsync(taskId, userId);
                if (!success)
                    return NotFound(new { error = "Task not found or access denied." });
                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/projects/{projectId}/tasks
        [HttpGet("projects/{projectId}/tasks")]
public async Task<IActionResult> GetTasks(// Use the projectId from route
    int projectId,
    [FromQuery] bool? completed = null,// Filter by completion status
    [FromQuery] string? sort = null)// Sort by due date or title
{
    try
    {
        var userId = GetUserId();

        var query = _taskService.GetQueryableTasks(projectId, userId);// Get the queryable tasks for the project and user

        if (completed.HasValue)
            query = query.Where(t => t.IsCompleted == completed.Value);// Filter tasks by completion status

        query = sort switch// Sort tasks based on the query parameter
        {
            "duedate" => query.OrderBy(t => t.DueDate),
            "title" => query.OrderBy(t => t.Title),
            _ => query.OrderBy(t => t.Id)
        };

        var tasks = await query.ToListAsync();// Execute the query asynchronously

        var dtos = tasks.Select(t => new TaskResponseDto
        {
            Id = t.Id,
            Title = t.Title,
            DueDate = t.DueDate,
            IsCompleted = t.IsCompleted,
            ProjectId = t.ProjectId,
            CreatedAt = t.CreatedAt
        });// Map to DTOs

        return Ok(dtos);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = "Failed to get tasks", details = ex.Message });
    }
}

    }
}
