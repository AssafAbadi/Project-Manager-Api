using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.DTOs
{
    public class TaskCreateDto
    {
        [Required]
        public string? Title { get; set; }//no required as it can be null if we get a bad request and then we validate it using DataAnnotations

        public DateTime? DueDate { get; set; }


        [Required]
        public int ProjectId { get; set; }//no need required because int cannot be null that the foreign key to the project

        public bool IsCompleted { get; set; } = false;
    }
}
