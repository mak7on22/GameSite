using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameSite.Data;
using GameSite.Models;

namespace GameSite.Controllers
{
    [Authorize]
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public PostController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var posts = await _context.Posts.Include(p => p.User)
                .OrderByDescending(p => p.Created)
                .ToListAsync();
            return View(posts);
        }

        [HttpPost]
        public async Task<IActionResult> Create(string content)
        {
            var user = await _userManager.GetUserAsync(User);
            if (!string.IsNullOrWhiteSpace(content) && user != null)
            {
                _context.Posts.Add(new Post { UserId = user.Id, Content = content, Created = DateTime.UtcNow });
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Like(int postId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                var exists = await _context.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == user.Id);
                if (exists == null)
                {
                    _context.Likes.Add(new Like { PostId = postId, UserId = user.Id });
                    await _context.SaveChangesAsync();
                }
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
