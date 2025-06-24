using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameSite.Data;
using GameSite.Models;

namespace GameSite.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ChatController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }
            var friends = await _context.Friends
                .Include(f => f.FriendUser)
                .Where(f => f.UserId == user.Id)
                .ToListAsync();
            return View(friends);
        }

        public async Task<IActionResult> Panel()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }
            var friends = await _context.Friends
                .Include(f => f.FriendUser)
                .Where(f => f.UserId == user.Id)
                .ToListAsync();

            return PartialView("_Chat", friends);
        }

        public async Task<IActionResult> Window(string friendId)
        {
            if (string.IsNullOrEmpty(friendId))
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }

            var friend = await _userManager.FindByIdAsync(friendId);
            if (friend == null)
            {
                return NotFound();
            }

            var messages = await _context.ChatMessages
                .Where(m => (m.SenderId == user.Id && m.RecipientId == friendId) ||
                            (m.SenderId == friendId && m.RecipientId == user.Id))
                .OrderBy(m => m.Created)
                .ToListAsync();

            var vm = new ChatWindowViewModel
            {
                Friend = friend,
                Messages = messages
            };

            return PartialView("_ChatWindow", vm);
        }

        [HttpPost]
        public async Task<IActionResult> Send(string friendId, string message, IFormFile? image)
        {
            if (string.IsNullOrWhiteSpace(friendId)) return BadRequest();
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var msg = new ChatMessage
            {
                SenderId = user.Id,
                RecipientId = friendId,
                Content = message ?? string.Empty,
                Created = DateTime.UtcNow
            };

            if (image != null && image.Length > 0)
            {
                var uploads = Path.Combine("wwwroot", "uploads");
                Directory.CreateDirectory(uploads);
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploads, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await image.CopyToAsync(stream);
                }
                msg.MediaPath = "/uploads/" + fileName;
            }

            _context.ChatMessages.Add(msg);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Window), new { friendId });
        }
    }
}
