using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using GameSite.Models;

namespace GameSite.Services
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IAuthenticationSchemeProvider _schemeProvider;

        public GoogleAuthService(SignInManager<ApplicationUser> signInManager,
            IAuthenticationSchemeProvider schemeProvider)
        {
            _signInManager = signInManager;
            _schemeProvider = schemeProvider;
        }

        public AuthenticationProperties ConfigureExternalAuthenticationProperties(string redirectUrl)
        {
            return _signInManager.ConfigureExternalAuthenticationProperties(GoogleDefaults.AuthenticationScheme, redirectUrl);
        }

        public async Task<bool> IsConfiguredAsync()
        {
            var scheme = await _schemeProvider.GetSchemeAsync(GoogleDefaults.AuthenticationScheme);
            return scheme != null;
        }
    }
}
