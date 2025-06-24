using System.Diagnostics;
using GameSite.Data;
using GameSite.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameSite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var model = new LeaderboardViewModel
            {
                TopXP = await _context.Users
                    .OrderByDescending(u => u.XP)
                    .Take(10)
                    .ToListAsync(),
                TopRank = await _context.Users
                    .OrderByDescending(u => u.Rank)
                    .Take(10)
                    .ToListAsync(),
                TopBalance = await _context.Users
                    .OrderByDescending(u => u.Balance)
                    .Take(10)
                    .ToListAsync()
            };
            return View(model);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
