using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.DTOs
{
    public class LoginDto
    {
        [Required]
        public string? Username { get; set; }//it can be null as we can get a bad request and then we validate it using DataAnnotations

        [Required]
        public string? Password { get; set; }//it can be null as we can get a bad request and then we validate it using DataAnnotations
    }
}
