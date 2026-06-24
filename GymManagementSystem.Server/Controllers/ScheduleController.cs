using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ScheduleEntry>>> GetAll() =>
        await db.ScheduleEntries.AsNoTracking().OrderBy(s => s.SortOrder).ToListAsync();

    [HttpPut("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<ScheduleEntry>> Update(string id, ScheduleEntry entry)
    {
        var existing = await db.ScheduleEntries.FindAsync(id);
        if (existing is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(entry.Day))
            existing.Day = entry.Day.Trim();
        if (entry.Morning is not null)
            existing.Morning = entry.Morning;
        if (entry.Evening is not null)
            existing.Evening = entry.Evening;
        if (entry.SortOrder >= 0)
            existing.SortOrder = entry.SortOrder;

        await db.SaveChangesAsync();
        return existing;
    }
}
