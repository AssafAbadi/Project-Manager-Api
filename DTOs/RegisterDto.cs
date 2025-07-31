using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.DTOs
{
    public class RegisterDto
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string? Username { get; set; }//it can be null as we can get a bad request and then we validate it using DataAnnotations

        [Required, StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }//it can be null as we can get a bad request and then we validate it using DataAnnotations
    }
}
