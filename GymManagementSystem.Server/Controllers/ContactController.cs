using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController(GymDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ContactMessage>> Submit(ContactRequest request)
    {
        var message = new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Message = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();
        return Ok(message);
    }

    [HttpGet]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<List<ContactMessage>>> GetAll() =>
        await db.ContactMessages.OrderByDescending(m => m.CreatedAt).ToListAsync();
}
