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
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.Created)
                .ToListAsync();
            return View(posts);
        }

        [HttpPost]
        public async Task<IActionResult> Create(string content, IFormFile? mediaFile, string? link, string? returnUrl)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                var post = new Post
                {
                    UserId = user.Id,
                    Content = content ?? string.Empty,
                    Created = DateTime.UtcNow
                };

                if (mediaFile != null && mediaFile.Length > 0)
                {
                    var uploads = Path.Combine("wwwroot", "posts");
                    Directory.CreateDirectory(uploads);
                    var fileName = Guid.NewGuid().ToString("N") + Path.GetExtension(mediaFile.FileName);
                    var path = Path.Combine(uploads, fileName);
                    using var stream = new FileStream(path, FileMode.Create);
                    await mediaFile.CopyToAsync(stream);
                    post.MediaUrl = "/posts/" + fileName;
                }
                else if (!string.IsNullOrWhiteSpace(link))
                {
                    post.MediaUrl = link;
                }

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();
            }
            if (!string.IsNullOrEmpty(returnUrl))
            {
                return LocalRedirect(returnUrl);
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Like(int postId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                var existing = await _context.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == user.Id);
                if (existing == null)
                {
                    _context.Likes.Add(new Like { PostId = postId, UserId = user.Id });
                }
                else
                {
                    _context.Likes.Remove(existing);
                }
                await _context.SaveChangesAsync();
                bool liked = existing == null;
                int count = await _context.Likes.CountAsync(l => l.PostId == postId);

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { liked, likes = count });
                }
            }
            var referer = Request.Headers["Referer"].ToString();
            if (!string.IsNullOrEmpty(referer))
            {
                return Redirect(referer);
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
