using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GameSite.Models;
using System.Linq;

namespace GameSite.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class SearchController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public SearchController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("Users")]
        public IActionResult Users(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Json(Array.Empty<object>());
            }

            var users = _userManager.Users
                .Where(u => u.UserName!.Contains(query) || u.Email!.Contains(query) || u.UniqueId.Contains(query))
                .Select(u => new { u.Id, u.UserName })
                .Take(10)
                .ToList();

            return Json(users);
        }
    }
}
