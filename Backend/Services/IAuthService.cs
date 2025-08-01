using Project_Manager_Api.DTOs;
using Project_Manager_Api.Models;

namespace Project_Manager_Api.Services
{
    /// <summary>
    /// Registers a new user with the provided registration details.
    /// </summary>
    /// <param name="dto">The registration details.</param>
    /// <returns>A task that represents the asynchronous operation, containing the registered user.</returns>
    public interface IAuthService//an interface for authentication service good for extension and testing
    {

        Task<User> RegisterAsync(RegisterDto dto);
        Task<string> LoginAsync(LoginDto dto);
    }
}
