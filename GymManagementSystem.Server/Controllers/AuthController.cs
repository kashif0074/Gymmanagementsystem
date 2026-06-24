using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(GymDbContext db) : ControllerBase
{
    private const string AdminUsername = "admin";
    private const string AdminPassword = "admin123";

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        if (request.Username is null || request.Password is null || request.Mode is null)
            return BadRequest(new LoginResponse(false, "Username, password, and mode are required.", null, null));

        var username = request.Username.Trim();
        var password = request.Password;
        var mode = request.Mode.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return BadRequest(new LoginResponse(false, "Username and password are required.", null, null));

        if (mode == "admin")
        {
            if (!string.Equals(username, AdminUsername, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new LoginResponse(false, "Invalid username or password.", null, null, null));

            var settings = await db.GymSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
            if (settings?.AdminPinEnabled == true)
            {
                if (string.IsNullOrEmpty(settings.AdminPin) || password != settings.AdminPin)
                    return Unauthorized(new LoginResponse(false, "Invalid admin PIN.", null, null, null));
            }
            else if (password != AdminPassword)
            {
                return Unauthorized(new LoginResponse(false, "Invalid username or password.", null, null, null));
            }

            var adminToken = TokenHelper.CreateToken(AdminUsername, "admin");
            return new LoginResponse(true, "Logged in as admin.", "admin", "Administrator", adminToken);
        }

        if (mode != "member")
            return BadRequest(new LoginResponse(false, "Invalid login mode.", null, null, null));

        var lowered = username.ToLowerInvariant();
        var member = await db.Members.FirstOrDefaultAsync(m => m.Username.ToLower() == lowered);

        if (member is null || string.IsNullOrEmpty(member.PasswordHash) ||
            !PasswordHelper.Verify(password, member.PasswordHash))
        {
            return Unauthorized(new LoginResponse(false, "Invalid username or password.", null, null, null));
        }

        var memberToken = TokenHelper.CreateToken(member.Username, "member");
        return new LoginResponse(true, "Member login successful.", "member", member.Name, memberToken);
    }
}
