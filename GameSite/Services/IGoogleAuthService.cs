using Microsoft.AspNetCore.Authentication;
namespace GameSite.Services
{
    public interface IGoogleAuthService
    {
        AuthenticationProperties ConfigureExternalAuthenticationProperties(string redirectUrl);
        Task<bool> IsConfiguredAsync();
    }
}
