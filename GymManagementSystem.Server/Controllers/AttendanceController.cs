using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<List<AttendanceRecord>>> GetAll() =>
        await db.AttendanceRecords.OrderByDescending(a => a.Date).ToListAsync();

    [HttpGet("{id}")]
    [AuthorizeRoles("admin", "member")]
    public async Task<ActionResult<AttendanceRecord>> GetById(string id)
    {
        var record = await db.AttendanceRecords.FindAsync(id);
        if (record is null) return NotFound();

        var role = HttpContext.Items["Role"] as string;
        var currentUsername = HttpContext.Items["Username"] as string;

        if (role == "member")
        {
            var member = await db.Members.AsNoTracking().FirstOrDefaultAsync(m => m.Username == currentUsername);
            if (member == null || record.MemberId != member.Id)
                return Forbid();
        }

        return record;
    }

    [HttpPost]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<AttendanceRecord>> Create(AttendanceRecord record)
    {
        record.Id = Guid.NewGuid().ToString();
        
        var member = await db.Members.FindAsync(record.MemberId);
        if (member != null)
        {
            record.MemberName = member.Name;
        }

        db.AttendanceRecords.Add(record);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    [HttpPost("checkin")]
    [AuthorizeRoles("member")]
    public async Task<IActionResult> SelfCheckIn()
    {
        var currentUsername = HttpContext.Items["Username"] as string;
        var member = await db.Members.FirstOrDefaultAsync(m => m.Username == currentUsername);
        if (member == null) return NotFound("Member not found.");

        var today = DateTime.UtcNow.Date;
        var existing = await db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.MemberId == member.Id && a.Date == today && (a.CheckOut == "" || a.CheckOut == null));

        if (existing != null)
            return BadRequest("You are already checked in.");

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid().ToString(),
            MemberId = member.Id,
            MemberName = member.Name,
            Date = today,
            CheckIn = DateTime.Now.ToString("HH:mm"),
            CheckOut = string.Empty,
            Note = "Self Check-In"
        };

        db.AttendanceRecords.Add(record);
        await db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpPost("checkout")]
    [AuthorizeRoles("member")]
    public async Task<IActionResult> SelfCheckOut()
    {
        var currentUsername = HttpContext.Items["Username"] as string;
        var member = await db.Members.FirstOrDefaultAsync(m => m.Username == currentUsername);
        if (member == null) return NotFound("Member not found.");

        var today = DateTime.UtcNow.Date;
        var record = await db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.MemberId == member.Id && a.Date == today && (a.CheckOut == "" || a.CheckOut == null));

        if (record == null)
            return BadRequest("No active check-in found for today.");

        record.CheckOut = DateTime.Now.ToString("HH:mm");
        await db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpPut("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<AttendanceRecord>> Update(string id, AttendanceRecord record)
    {
        var existing = await db.AttendanceRecords.FindAsync(id);
        if (existing is null) return NotFound();

        existing.MemberId = record.MemberId;
        
        var member = await db.Members.FindAsync(record.MemberId);
        if (member != null)
        {
            existing.MemberName = member.Name;
        }
        else
        {
            existing.MemberName = record.MemberName;
        }

        existing.Date = record.Date;
        existing.CheckIn = record.CheckIn;
        existing.CheckOut = record.CheckOut;
        existing.Note = record.Note;

        await db.SaveChangesAsync();
        return existing;
    }

    [HttpDelete("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await db.AttendanceRecords.FindAsync(id);
        if (existing is null) return NotFound();

        db.AttendanceRecords.Remove(existing);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
