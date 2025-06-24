using System;

namespace GameSite.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Created { get; set; }
    }
}
