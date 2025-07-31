namespace Project_Manager_Api.DTOs
{
    public class ProjectResponseDto//all the fields besides description are required as this DTO is after we create the project thats why we don't need to use [Required] attribute
    {
        public int Id { get; set; }//int cant be null, so we don't need to use required 
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
