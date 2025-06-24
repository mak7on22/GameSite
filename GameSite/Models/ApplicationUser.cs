using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace GameSite.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string UniqueId { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8);
        public string? AvatarPath { get; set; }
        public decimal Balance { get; set; }
        public DateTime RegistrationDate { get; set; }
        public UserStatus Status { get; set; } = UserStatus.Offline;
        public int Rank { get; set; }
        public int XP { get; set; }

        public ICollection<Friend>? Friends { get; set; }
        public ICollection<Like>? Likes { get; set; }

        public Role Role { get; set; } = Role.User;
    }
}
