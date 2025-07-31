using Microsoft.EntityFrameworkCore;
using Project_Manager_Api.Data;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Models;

namespace Project_Manager_Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;//This is the database context that allows us to interact with the database

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto dto, int userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Title))
                    throw new ArgumentNullException(nameof(dto.Title), "Project title is required.");

                var project = new Project
                {
                    Title = dto.Title!,
                    Description = dto.Description ?? string.Empty,
                    UserId = userId
                };
                _context.Projects.Add(project);// Add the new project to the context
                await _context.SaveChangesAsync();//like @Transactional in springboot actually saves the changes to the database

                return new ProjectResponseDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    CreatedAt = project.CreatedAt
                };
            }
            catch (ArgumentNullException ex)
            {
                throw new ApplicationException("Missing required field for project.", ex);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to create project.", ex);
            }
        }

        public async Task<List<ProjectResponseDto>> GetUserProjectsAsync(int userId)
        {
            try
            {
                var projects = await _context.Projects
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                return projects.Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to retrieve projects.", ex);
            }
        }

        public async Task<ProjectResponseDto?> GetProjectByIdAsync(int id, int userId)
        {
            try
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

                if (project == null)
                    return null;

                return new ProjectResponseDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    CreatedAt = project.CreatedAt
                };
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to retrieve project.", ex);
            }
        }

        public async Task<bool> DeleteProjectAsync(int id, int userId)
        {
            try
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

                if (project == null)
                    return false;

                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to delete project.", ex);
            }
        }
    }
}
