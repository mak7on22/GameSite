using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameSite.Models
{
    public class Friend
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        [Required]
        public string FriendId { get; set; } = null!;

        [ForeignKey(nameof(FriendId))]
        public ApplicationUser? FriendUser { get; set; }
    }
}
