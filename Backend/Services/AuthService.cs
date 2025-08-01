using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Project_Manager_Api.Data;
using Project_Manager_Api.DTOs;
using Project_Manager_Api.Models;

namespace Project_Manager_Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;// Dependency injection for database context
        private readonly IConfiguration _config;// Configuration for JWT settings

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        /// <summary>
        /// Registers a new user with the provided registration details and saves it to the database asynchronously.
        /// <param name="dto">The registration details.</param>
        /// <returns>A task that represents the asynchronous operation, containing the registered user.</returns>
        public async Task<User> RegisterAsync(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))// Check if the username already exists
                throw new ApplicationException("Username already exists.");// If it does, throw an exception
            try
            {
                var user = new User
                {
                    Username = dto.Username!,// Use null-forgiving operator as we validated it in the controller

                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)// Hash the password using BCrypt for security
                };
                _context.Users.Add(user);// Add the new user to the DB
                await _context.SaveChangesAsync();// Save changes asynchronously
                return user;
            }
            catch (BCrypt.Net.SaltParseException)
            {
                throw new ApplicationException("An error occurred while hashing the password.");
            }
            catch (OperationCanceledException)
            {
                throw new ApplicationException("An operation was canceled while saving changes to the database.");
            }
            catch (DbUpdateException)
            {
                throw new ApplicationException("An error occurred while saving changes to the database.");
            }
            
            
        }
        /// <summary>
        /// Logs in a user with the provided login details and returns a JWT token if successful.
        /// <param name="dto">The login details.</param>
        /// <returns>A task that represents the asynchronous operation, containing the JWT token.</returns>
        
       public async Task<string> LoginAsync(LoginDto dto)
{
    try
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new ApplicationException("Invalid credentials.");

        return GenerateJwtToken(user);
    }
    catch (ArgumentNullException ex)
    {
       
        throw new ApplicationException("Failed to login due to missing input.", ex);
    }
    catch (OperationCanceledException ex)
    {
        
        throw new ApplicationException("Login was canceled. Please try again.", ex);
    }
   
}


        private string GenerateJwtToken(User user)
        {
            try
            {

                var claims = new[]
                {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };// Create claims for the JWT token for the userid and username

                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "MySuperSecretKeyForDev!!123456789000000"));// Get the JWT key from configuration settings or use a default key for development, can't be null

                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);// Create signing credentials using the key and HMAC SHA256 algorithm, can't be null as well

                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds);

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (ArgumentException)
            {
                throw new ApplicationException("An error occurred while generating the token.");
            }
  

            
        }
    }
}
