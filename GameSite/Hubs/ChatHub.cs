using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GameSite.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
    }
}
