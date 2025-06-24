using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GameSite.Data;
using GameSite.Models;

namespace GameSite.Controllers
{
    [Authorize]
    public class GameController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public GameController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            return View(user);
        }

        public async Task<IActionResult> Dice()
        {
            var user = await _userManager.GetUserAsync(User);
            return View(user);
        }

        [HttpPost]
        public async Task<IActionResult> AddXp(int amount)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                user.XP += amount;
                await _userManager.UpdateAsync(user);
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> PlayDice(int guess)
        {
            if (guess < 1 || guess > 6)
            {
                return BadRequest();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            if (user.Balance < 1)
            {
                return Json(new { success = false, message = "Not enough coins" });
            }

            user.Balance -= 1;
            user.XP += 1;

            var roll = Random.Shared.Next(1, 7);
            bool win = roll == guess;
            if (win)
            {
                user.Balance += 10;
            }

            await _userManager.UpdateAsync(user);

            var msg = win ? "You guessed right! +10 coins" : $"You rolled {roll}";

            return Json(new
            {
                success = true,
                roll,
                win,
                balance = user.Balance,
                xp = user.XP,
                message = msg
            });
        }
    }
}
