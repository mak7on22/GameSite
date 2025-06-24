using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Google;
using GameSite.Models;

namespace GameSite.Services
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly SignInManager<ApplicationUser> _signInManager;

        public GoogleAuthService(SignInManager<ApplicationUser> signInManager)
        {
            _signInManager = signInManager;
        }

        public AuthenticationProperties ConfigureExternalAuthenticationProperties(string redirectUrl)
        {
            return _signInManager.ConfigureExternalAuthenticationProperties(GoogleDefaults.AuthenticationScheme, redirectUrl);
        }
    }
}
