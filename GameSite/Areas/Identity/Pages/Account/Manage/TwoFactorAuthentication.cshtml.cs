using GameSite.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace GameSite.Areas.Identity.Pages.Account.Manage
{
    [Authorize]
    public class TwoFactorAuthenticationModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public bool Is2faEnabled { get; set; }

        public TwoFactorAuthenticationModel(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound("Unable to load user.");
            }

            Is2faEnabled = await _userManager.GetTwoFactorEnabledAsync(user);
            return Page();
        }
    }
}
