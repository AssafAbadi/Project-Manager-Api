namespace Project_Manager_Api.DTOs
{
    public class TaskResponseDto//all the fields besides description are required as this DTO is after we create the project thats why we don't need to use [Required] attribute
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }

        public int ProjectId { get; set; }
        public DateTime CreatedAt { get; set; }


    }
}
