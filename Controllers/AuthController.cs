using Microsoft.AspNetCore.Mvc;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Services;

namespace Project_Manager_Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)// Constructor injection for the authentication service
        {
            _authService = authService;
        }

        [HttpPost("register")]// Endpoint for user registration
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)//check if the model state is valid
                return BadRequest(ModelState);

            try
            {
                await _authService.RegisterAsync(dto);
                return StatusCode(StatusCodes.Status201Created, new { message = "Registration successful" });// Use StatusCode(201) instead of CreatedAtAction since we don't expose a public user resource or return a Location header after registration.


            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);//check if the model state is valid by checking all the data annotations in the DTO

            try
            {
                var token = await _authService.LoginAsync(dto);
                return Ok(new { token });
            }
            catch (ApplicationException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
    }
}
