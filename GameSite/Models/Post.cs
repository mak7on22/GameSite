using System;
using System.ComponentModel.DataAnnotations;

namespace GameSite.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public DateTime Created { get; set; }

        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}
