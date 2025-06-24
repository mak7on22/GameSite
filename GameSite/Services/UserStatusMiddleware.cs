using GameSite.Models;
using Microsoft.AspNetCore.Identity;

namespace GameSite.Services
{
    public class UserStatusMiddleware
    {
        private readonly RequestDelegate _next;

        public UserStatusMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, UserManager<ApplicationUser> userManager)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var user = await userManager.GetUserAsync(context.User);
                if (user != null && user.Status == UserStatus.Offline)
                {
                    user.Status = UserStatus.Online;
                    await userManager.UpdateAsync(user);
                }
            }

            await _next(context);
        }
    }
}
