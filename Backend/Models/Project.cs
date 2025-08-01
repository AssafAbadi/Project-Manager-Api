using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Project_Manager_Api.Models
{
    public class Project
    {
        public int Id { get; set; }

        [Required, StringLength(100, MinimumLength = 3)]
        public required string Title { get; set; }

        [StringLength(500)]
        public  string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public required int UserId { get; set; }// Foreign key to User so must be required
        public User? User { get; set; }// Navigation property to User so its only a reference and can be null

        public  ICollection<TaskItem>? Tasks { get; set; }// Navigation property to TaskItems, can be null if no tasks are associated with the project
    }
}
