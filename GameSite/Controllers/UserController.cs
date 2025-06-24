using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GameSite.Models;
using GameSite.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;

namespace GameSite.Controllers
{
    [Authorize]
    public class UserController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UserController(UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            IWebHostEnvironment env)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _env = env;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction("Index", "Home");
            }

            var friends = await _context.Friends
                .Include(f => f.FriendUser)
                .Where(f => f.UserId == user.Id)
                .ToListAsync();

            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Where(p => p.UserId == user.Id)
                .OrderByDescending(p => p.Created)
                .ToListAsync();

            var model = new UserProfileViewModel
            {
                User = user,
                Friends = friends,
                IsSelf = true,
                Posts = posts
            };

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Details(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return RedirectToAction(nameof(Index));
            }

            var current = await _userManager.GetUserAsync(User);
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var friends = await _context.Friends
                .Include(f => f.FriendUser)
                .Where(f => f.UserId == user.Id)
                .ToListAsync();

            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Where(p => p.UserId == user.Id)
                .OrderByDescending(p => p.Created)
                .ToListAsync();

            var model = new UserProfileViewModel
            {
                User = user,
                Friends = friends,
                IsSelf = current != null && current.Id == user.Id,
                Posts = posts
            };

            return View("Index", model);
        }

        [HttpGet]
        public async Task<IActionResult> Edit()
        {
            var user = await _userManager.GetUserAsync(User);
            return View(user);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(ApplicationUser model, IFormFile? avatarFile)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction(nameof(Index));
            }

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            if (avatarFile != null && avatarFile.Length > 0)
            {
                if (!avatarFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    ModelState.AddModelError("avatarFile", "Only image files are allowed.");
                    return View(model);
                }
                var uploads = Path.Combine(_env.WebRootPath, "avatars");
                Directory.CreateDirectory(uploads);
                var fileName = user.Id + Path.GetExtension(avatarFile.FileName);
                var path = Path.Combine(uploads, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await avatarFile.CopyToAsync(stream);
                }
                user.AvatarPath = "/avatars/" + fileName;
            }
            else
            {
                if (!string.IsNullOrEmpty(model.AvatarPath) && Uri.IsWellFormedUriString(model.AvatarPath, UriKind.Absolute))
                {
                    try
                    {
                        using var httpClient = new HttpClient();
                        using var request = new HttpRequestMessage(HttpMethod.Head, model.AvatarPath);
                        var response = await httpClient.SendAsync(request);
                        if (!response.IsSuccessStatusCode || response.Content.Headers.ContentType?.MediaType?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) != true)
                        {
                            ModelState.AddModelError("AvatarPath", "Avatar URL must point to an image.");
                            return View(model);
                        }
                    }
                    catch
                    {
                        ModelState.AddModelError("AvatarPath", "Invalid Avatar URL.");
                        return View(model);
                    }
                }
                user.AvatarPath = model.AvatarPath;
            }

            if (!string.Equals(user.UserName, model.UserName, StringComparison.Ordinal))
            {
                if (new EmailAddressAttribute().IsValid(model.UserName))
                {
                    ModelState.AddModelError("UserName", "Username cannot be an email address.");
                    return View(model);
                }

                bool wasEmail = string.Equals(user.UserName, user.Email, StringComparison.OrdinalIgnoreCase);

                var setNameResult = await _userManager.SetUserNameAsync(user, model.UserName);
                if (!setNameResult.Succeeded)
                {
                    foreach (var error in setNameResult.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                    return View(model);
                }

                if (wasEmail)
                {
                    user.Balance += 100;
                }
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View(model);
            }

            await _signInManager.RefreshSignInAsync(user);

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> UpdateStatus(UserStatus status)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                user.Status = status;
                await _userManager.UpdateAsync(user);
                await _signInManager.RefreshSignInAsync(user);
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
