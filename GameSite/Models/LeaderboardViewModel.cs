using System.Collections.Generic;

namespace GameSite.Models
{
    public class LeaderboardViewModel
    {
        public List<ApplicationUser> TopXP { get; set; } = new();
        public List<ApplicationUser> TopRank { get; set; } = new();
        public List<ApplicationUser> TopBalance { get; set; } = new();
    }
}
