using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Services;
using System.Security.Claims;

namespace Project_Manager_Api.Controllers
{
    [ApiController]
    [Route("api/[controller]s")]
    [Authorize] // Ensure the user is authenticated
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");//we replace null with 0 to avoid null reference exception

        // GET /api/projects
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var userId = GetUserId();
                var projects = await _projectService.GetUserProjectsAsync(userId);
                return Ok(projects);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/projects
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var result = await _projectService.CreateProjectAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/projects/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var userId = GetUserId();
                var project = await _projectService.GetProjectByIdAsync(id, userId);
                if (project == null)
                    return NotFound(new { error = "Project not found or access denied." });

                return Ok(project);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/projects/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _projectService.DeleteProjectAsync(id, userId);
                if (!success)
                    return NotFound(new { error = "Project not found or access denied." });

                return NoContent();
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
