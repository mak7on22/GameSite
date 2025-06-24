using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameSite.Data;

namespace GameSite.Controllers
{
    [Authorize]
    public class FeedController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FeedController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.Created)
                .ToListAsync();
            return View(posts);
        }
    }
}
