using System;
using System.ComponentModel.DataAnnotations;

namespace GameSite.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        [Required]
        public string SenderId { get; set; } = null!;

        [Required]
        public string RecipientId { get; set; } = null!;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? MediaPath { get; set; }

        public DateTime Created { get; set; }
    }
}
