using System.Collections.Generic;

namespace GameSite.Models
{
    public class UserProfileViewModel
    {
        public ApplicationUser User { get; set; } = null!;
        public IEnumerable<Friend> Friends { get; set; } = new List<Friend>();
        public bool IsSelf { get; set; }
        public IEnumerable<Post> Posts { get; set; } = new List<Post>();
    }
}

