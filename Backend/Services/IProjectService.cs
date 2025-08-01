using Project_Manager_Api.DTOs;

namespace Project_Manager_Api.Services
{
    public interface IProjectService
    {
        Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto dto, int userId);
        Task<List<ProjectResponseDto>> GetUserProjectsAsync(int userId);
        Task<ProjectResponseDto?> GetProjectByIdAsync(int id, int userId);
        Task<bool> DeleteProjectAsync(int id, int userId);
    }
}
