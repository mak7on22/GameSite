using System.ComponentModel.DataAnnotations;

namespace GameSite.Models
{
    public class Like
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }

        [Required]
        public int PostId { get; set; }
    }
}
