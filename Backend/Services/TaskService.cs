using Microsoft.EntityFrameworkCore;
using Project_Manager_Api.Data;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Models;

namespace Project_Manager_Api.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _context;

        public TaskService(AppDbContext context)
        {
            _context = context;
        }

        // Create a new task inside a project (user must own the project)
        public async Task<TaskResponseDto> CreateTaskAsync(int projectId, TaskCreateDto dto, int userId)
        {
            try
            {
                // Ensure the project exists and belongs to the user
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

                if (project == null)
                    throw new ApplicationException("Project not found or access denied.");

                if (string.IsNullOrWhiteSpace(dto.Title))
                    throw new ArgumentNullException(nameof(dto.Title), "Task title is required.");

                var task = new TaskItem
                {
                    Title = dto.Title!,
                    DueDate = dto.DueDate,
                    IsCompleted = dto.IsCompleted,
                    ProjectId = projectId
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                // Return DTO to the client
                return new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    DueDate = task.DueDate,
                    IsCompleted = task.IsCompleted,
                    ProjectId = task.ProjectId,
                    CreatedAt = task.CreatedAt
                };
            }
            catch (ArgumentNullException ex)
            {
                throw new ApplicationException("Missing required field for task.", ex);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to create task.", ex);
            }
        }

        // Update an existing task (only if user owns the parent project)
        public async Task<TaskResponseDto?> UpdateTaskAsync(int taskId, TaskCreateDto dto, int userId)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.Project != null && t.Project.UserId == userId);

                if (task == null)
                    return null;

                // Update fields
                if (!string.IsNullOrWhiteSpace(dto.Title))
                    task.Title = dto.Title!;
                if (dto.DueDate != null)
                    task.DueDate = dto.DueDate;
                task.IsCompleted = dto.IsCompleted;

                await _context.SaveChangesAsync();

                return new TaskResponseDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    DueDate = task.DueDate,
                    IsCompleted = task.IsCompleted,
                    ProjectId = task.ProjectId,
                    CreatedAt = task.CreatedAt
                };
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to update task.", ex);
            }
        }

        // Delete a task (only if user owns the parent project)
        public async Task<bool> DeleteTaskAsync(int taskId, int userId)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.Project != null && t.Project.UserId == userId);

                if (task == null)
                    return false;

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to delete task.", ex);
            }
        }


            public IQueryable<TaskItem> GetQueryableTasks(int projectId, int userId)//its not async because the controller use tolistAsync() method after the filter ans sort
            {
                return _context.Tasks
                     .Where(t => t.ProjectId == projectId && t.Project != null && t.Project.UserId == userId);
         }

    }
}
