using System;
using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public DateTime? DueDate { get; set; }// Nullable for optional due dates
        public bool IsCompleted { get; set; }
        [Required]
        public required int ProjectId { get; set; }// Foreign key to Project
        public Project? Project { get; set; }// Navigation property to Project so its only a reference and can be null
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
