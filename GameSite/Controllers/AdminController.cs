using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameSite.Models;

namespace GameSite.Controllers
{
    [Authorize(Roles = "Admin,Operator")]
    public class AdminController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> Index(string? query)
        {
            var q = _userManager.Users.AsQueryable();
            if (!string.IsNullOrWhiteSpace(query))
            {
                query = query.Trim();
                q = q.Where(u => u.Id.Contains(query) ||
                                 (u.UserName != null && u.UserName.Contains(query)) ||
                                 (u.Email != null && u.Email.Contains(query)));
            }

            var users = await q.ToListAsync();
            return View(users);
        }

        [HttpPost]
        public async Task<IActionResult> ResetStats(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            user.Balance = 0;
            user.Rank = 0;
            user.XP = 0;
            await _userManager.UpdateAsync(user);
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            await _userManager.DeleteAsync(user);
            return RedirectToAction(nameof(Index));
        }
    }
}
