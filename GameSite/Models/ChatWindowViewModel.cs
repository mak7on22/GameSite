using System.Collections.Generic;

namespace GameSite.Models
{
    public class ChatWindowViewModel
    {
        public ApplicationUser Friend { get; set; } = null!;
        public List<ChatMessage> Messages { get; set; } = new();
    }
}
