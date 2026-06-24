using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using GymManagementSystem.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<List<Member>>> GetAll() =>
        await db.Members.OrderByDescending(m => m.JoinedAt).ToListAsync();

    [HttpGet("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<Member>> GetById(string id)
    {
        var member = await db.Members.FindAsync(id);
        return member is null ? NotFound() : member;
    }

    [HttpGet("profile/{username}")]
    [AuthorizeRoles("admin", "member")]
    public async Task<ActionResult<MemberProfileDto>> GetProfile(string username)
    {
        var role = HttpContext.Items["Role"] as string;
        var currentUsername = HttpContext.Items["Username"] as string;

        if (role == "member" && !string.Equals(username, currentUsername, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var lowered = username.Trim().ToLowerInvariant();
        var member = await db.Members.AsNoTracking()
            .FirstOrDefaultAsync(m => m.Username.ToLower() == lowered);

        if (member is null) return NotFound();

        var payments = await db.Payments.AsNoTracking()
            .Where(p => p.MemberId == member.Id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var attendance = await db.AttendanceRecords.AsNoTracking()
            .Where(a => a.MemberId == member.Id)
            .OrderByDescending(a => a.Date)
            .Take(10)
            .ToListAsync();

        return new MemberProfileDto(member, payments, attendance);
    }

    [HttpPost]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<Member>> Create(Member member)
    {
        member.Id = Guid.NewGuid().ToString();
        if (member.JoinedAt == default)
            member.JoinedAt = DateTime.UtcNow;

        if (string.IsNullOrWhiteSpace(member.Username))
        {
            member.Username = $"user_{Guid.NewGuid().ToString()[..8]}";
        }
        if (string.IsNullOrWhiteSpace(member.PasswordHash))
        {
            member.PasswordHash = PasswordHelper.Hash("member123"); // Default password
        }

        db.Members.Add(member);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<Member>> Update(string id, Member member)
    {
        var existing = await db.Members.FindAsync(id);
        if (existing is null) return NotFound();

        var previousName = existing.Name;

        if (!string.IsNullOrWhiteSpace(member.Name))
            existing.Name = member.Name.Trim();
        if (member.Username is not null)
            existing.Username = member.Username.Trim();
        if (!string.IsNullOrWhiteSpace(member.Email))
            existing.Email = member.Email.Trim();
        if (member.Phone is not null)
            existing.Phone = member.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(member.Plan))
            existing.Plan = member.Plan;
        if (!string.IsNullOrWhiteSpace(member.Status))
            existing.Status = member.Status;
        existing.RenewsAt = member.RenewsAt;
        if (member.Age is not null)
            existing.Age = member.Age;
        if (member.Gender is not null)
            existing.Gender = member.Gender;

        if (!string.Equals(previousName, existing.Name, StringComparison.Ordinal))
        {
            var payments = await db.Payments.Where(p => p.MemberId == existing.Id).ToListAsync();
            foreach (var payment in payments)
                payment.MemberName = existing.Name;

            var records = await db.AttendanceRecords.Where(a => a.MemberId == existing.Id).ToListAsync();
            foreach (var record in records)
                record.MemberName = existing.Name;
        }

        await db.SaveChangesAsync();
        return existing;
    }

    [HttpPut("profile")]
    [AuthorizeRoles("member")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var currentUsername = HttpContext.Items["Username"] as string;
        if (string.IsNullOrEmpty(currentUsername)) return Unauthorized();

        var member = await db.Members.FirstOrDefaultAsync(m => m.Username == currentUsername);
        if (member == null) return NotFound();

        var previousName = member.Name;

        if (!string.IsNullOrWhiteSpace(request.Name))
            member.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email))
            member.Email = request.Email.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone))
            member.Phone = request.Phone.Trim();
        if (request.Age.HasValue)
            member.Age = request.Age.Value;
        if (!string.IsNullOrWhiteSpace(request.Gender))
            member.Gender = request.Gender;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
                return BadRequest("Password must be at least 6 characters.");
            member.PasswordHash = PasswordHelper.Hash(request.Password);
        }

        if (!string.Equals(previousName, member.Name, StringComparison.Ordinal))
        {
            var payments = await db.Payments.Where(p => p.MemberId == member.Id).ToListAsync();
            foreach (var payment in payments)
                payment.MemberName = member.Name;

            var records = await db.AttendanceRecords.Where(a => a.MemberId == member.Id).ToListAsync();
            foreach (var record in records)
                record.MemberName = member.Name;
        }

        await db.SaveChangesAsync();
        return Ok(member);
    }

    [HttpDelete("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await db.Members.FindAsync(id);
        if (existing is null) return NotFound();

        db.Members.Remove(existing);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("select-plan")]
    [AuthorizeRoles("member")]
    public async Task<IActionResult> SelectPlan(SelectPlanRequest request)
    {
        var currentUsername = HttpContext.Items["Username"] as string;
        if (string.IsNullOrEmpty(currentUsername)) return Unauthorized();

        var member = await db.Members.FirstOrDefaultAsync(m => m.Username == currentUsername);
        if (member == null) return NotFound();

        var planLabel = ResolvePlanLabel(request.PlanName);
        var renewDays = ResolveRenewDays(request.PlanName);

        var planPrice = await db.MembershipPlans
            .Where(p => p.Name.ToLower().Contains(planLabel.ToLower()))
            .Select(p => p.Price)
            .FirstOrDefaultAsync();

        member.Plan = planLabel;
        member.RenewsAt = DateTime.UtcNow.AddDays(renewDays);

        db.Payments.Add(new Payment
        {
            MemberId = member.Id,
            MemberName = member.Name,
            Amount = planPrice > 0 ? planPrice : 5000,
            Method = "Pending",
            Status = "Pending",
            ForPlan = planLabel,
            CreatedAt = DateTime.UtcNow,
            Note = $"Changed plan to {planLabel}",
        });

        await db.SaveChangesAsync();
        return Ok(member);
    }

    [HttpPost("join-trainer")]
    [AuthorizeRoles("member")]
    public async Task<IActionResult> JoinTrainer(JoinTrainerRequest request)
    {
        var currentUsername = HttpContext.Items["Username"] as string;
        if (string.IsNullOrEmpty(currentUsername)) return Unauthorized();

        var member = await db.Members.FirstOrDefaultAsync(m => m.Username == currentUsername);
        if (member == null) return NotFound();

        var trainer = await db.Trainers.FindAsync(request.TrainerId);
        if (trainer == null) return NotFound("Trainer not found.");

        member.TrainerId = trainer.Id;
        member.TrainerName = trainer.Name;

        db.Payments.Add(new Payment
        {
            MemberId = member.Id,
            MemberName = member.Name,
            Amount = trainer.RatePerSession,
            Method = "Pending",
            Status = "Pending",
            ForPlan = member.Plan,
            CreatedAt = DateTime.UtcNow,
            Note = $"Enrolled in training program with trainer {trainer.Name}",
        });

        await db.SaveChangesAsync();
        return Ok(member);
    }

    private static string ResolvePlanLabel(string plan)
    {
        var planKey = plan.Trim().ToLowerInvariant();
        return planKey switch
        {
            "monthly" => "Monthly",
            "quarterly" => "Quarterly",
            "yearly" => "Yearly",
            _ => string.IsNullOrWhiteSpace(planKey) ? "Monthly" : char.ToUpper(planKey[0]) + planKey[1..],
        };
    }

    private static int ResolveRenewDays(string plan) =>
        plan.Trim().ToLowerInvariant() switch
        {
            "monthly" => 30,
            "quarterly" => 90,
            "yearly" => 365,
            _ => 30,
        };
}
