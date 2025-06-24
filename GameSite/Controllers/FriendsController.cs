using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameSite.Data;
using GameSite.Models;

namespace GameSite.Controllers
{
    [Authorize]
    public class FriendsController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public FriendsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            var friends = await _context.Friends.Include(f => f.FriendUser)
                .Where(f => f.UserId == user!.Id)
                .ToListAsync();
            return View(friends);
        }

        [HttpPost]
        public async Task<IActionResult> Add(string friendId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (!string.IsNullOrEmpty(friendId) && user != null)
            {
                var exists = await _context.Friends.FirstOrDefaultAsync(f => f.UserId == user.Id && f.FriendId == friendId);
                if (exists == null)
                {
                    _context.Friends.Add(new Friend { UserId = user.Id, FriendId = friendId });
                    await _context.SaveChangesAsync();
                }
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Remove(int id)
        {
            var friend = await _context.Friends.FindAsync(id);
            if (friend != null)
            {
                _context.Friends.Remove(friend);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
