using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public required string Username { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        public ICollection<Project>? Projects { get; set; }// Navigation property to Projects, can be null if no projects are associated with the user
    }
}
