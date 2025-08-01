using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.DTOs
{
    public class ProjectCreateDto
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string? Title { get; set; }//no required as it can be null if we get a bad request and then we validate it using DataAnnotations

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
