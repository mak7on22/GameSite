using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GameSite.Models;

namespace GameSite.Services
{
    public class CustomPasswordValidator : IPasswordValidator<ApplicationUser>
    {
        private static readonly Regex _allowed = new Regex("^[A-Za-z0-9]{4,16}$");

        public Task<IdentityResult> ValidateAsync(UserManager<ApplicationUser> manager, ApplicationUser user, string? password)
        {
            if (password == null || !_allowed.IsMatch(password))
            {
                return Task.FromResult(IdentityResult.Failed(new IdentityError
                {
                    Description = "Password must be 4-16 characters long and contain only letters or digits."
                }));
            }

            return Task.FromResult(IdentityResult.Success);
        }
    }
}
