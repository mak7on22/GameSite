using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using GameSite.Models;
using GameSite.Services;
using System.Security.Claims;

namespace GameSite.Controllers
{
    public class AccountController : Controller
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IGoogleAuthService _googleAuthService;

        public AccountController(SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            IGoogleAuthService googleAuthService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _googleAuthService = googleAuthService;
        }

        public IActionResult Register()
        {
            return RedirectToPage("/Account/Register", new { area = "Identity" });
        }

        public IActionResult Login()
        {
            return RedirectToPage("/Account/Login", new { area = "Identity" });
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        public IActionResult ForgotPassword()
        {
            return RedirectToPage("/Account/ForgotPassword", new { area = "Identity" });
        }

        public IActionResult ChangePassword()
        {
            return RedirectToPage("/Account/Manage/ChangePassword", new { area = "Identity" });
        }

        public IActionResult GoogleLogin(string returnUrl = "/")
        {
            var redirectUrl = Url.Action(nameof(GoogleResponse), "Account", new { ReturnUrl = returnUrl });
            var properties = _googleAuthService.ConfigureExternalAuthenticationProperties(redirectUrl!);
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        public async Task<IActionResult> GoogleResponse(string returnUrl = "/")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return RedirectToAction(nameof(Login));
            }

            var signIn = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
            if (signIn.Succeeded)
            {
                return LocalRedirect(returnUrl);
            }

            var email = info.Principal.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
            if (email != null)
            {
                var user = new ApplicationUser { UserName = email, Email = email, RegistrationDate = DateTime.UtcNow };
                var result = await _userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await _userManager.AddLoginAsync(user, info);
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return LocalRedirect(returnUrl);
                }
            }

            return RedirectToAction(nameof(Login));
        }
    }
}
