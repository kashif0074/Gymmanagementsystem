using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AuthorizeRoles("admin")]
public class DashboardController(GymDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var today = DateTime.UtcNow.Date;
        var totalMembers = await db.Members.CountAsync();
        var activeMembers = await db.Members.CountAsync(m => m.Status == "Active");
        var totalTrainers = await db.Trainers.CountAsync();
        var pendingPayments = await db.Payments.CountAsync(p => p.Status == "Pending");
        var totalRevenue = await db.Payments.Where(p => p.Status == "Paid").SumAsync(p => p.Amount);
        var todayAttendance = await db.AttendanceRecords.CountAsync(a => a.Date == today);

        return new DashboardStatsDto(
            totalMembers,
            activeMembers,
            totalTrainers,
            pendingPayments,
            totalRevenue,
            todayAttendance);
    }
}
