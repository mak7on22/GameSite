using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GameSite.Models;

namespace GameSite.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Friend> Friends => Set<Friend>();
        public DbSet<Like> Likes => Set<Like>();
        public DbSet<Post> Posts => Set<Post>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Friends)
                .WithOne(f => f.User)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Friend>()
                .HasOne(f => f.FriendUser)
                .WithMany()
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
