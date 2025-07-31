using Project_Manager_Api.DTOs;
using Project_Manager_Api.Models; 

namespace Project_Manager_Api.Services
{
    public interface ITaskService
    {
        // Create a new task in a project (user must own the project)
        Task<TaskResponseDto> CreateTaskAsync(int projectId, TaskCreateDto dto, int userId);

        // Update an existing task (only owner can update)
        Task<TaskResponseDto?> UpdateTaskAsync(int taskId, TaskCreateDto dto, int userId);

        // Delete a task (only owner can delete)
        Task<bool> DeleteTaskAsync(int taskId, int userId);

        IQueryable<TaskItem> GetQueryableTasks(int projectId, int userId);

    }
}
