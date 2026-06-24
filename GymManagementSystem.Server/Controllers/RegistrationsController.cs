using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrationsController(GymDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Member>> Register(RegistrationRequest request)
    {
        var username = request.Username.Trim();
        var password = request.Password;
        var phone = request.Phone.Trim();
        var phoneKey = NormalizePhone(phone);

        if (username.Length < 3)
            return BadRequest("Username must be at least 3 characters.");

        if (password.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        if (string.Equals(username, "admin", StringComparison.OrdinalIgnoreCase))
            return BadRequest("This username is reserved.");

        var loweredUsername = username.ToLowerInvariant();
        var existingByUsername = await db.Members
            .FirstOrDefaultAsync(m => m.Username.ToLower() == loweredUsername);

        if (existingByUsername is not null)
        {
            if (!string.IsNullOrEmpty(existingByUsername.PasswordHash))
                return BadRequest("Username is already taken.");

            return await SaveMemberAsync(
                existingByUsername,
                request,
                username,
                password,
                phone,
                phoneKey,
                isNew: false);
        }

        var memberEmail = $"{phoneKey}@member.local";
        var existingByPhone = await db.Members
            .FirstOrDefaultAsync(m => m.Email == memberEmail || m.Phone == phone);

        if (existingByPhone is not null)
        {
            if (!string.IsNullOrEmpty(existingByPhone.PasswordHash))
                return BadRequest("This phone number is already registered. Please log in.");

            if (!existingByPhone.Email.EndsWith("@member.local", StringComparison.OrdinalIgnoreCase))
                return BadRequest("This phone number is already on file. Please contact the gym or use a different number.");

            return await SaveMemberAsync(
                existingByPhone,
                request,
                username,
                password,
                phone,
                phoneKey,
                isNew: false);
        }

        var member = new Member();
        return await SaveMemberAsync(member, request, username, password, phone, phoneKey, isNew: true);
    }

    private async Task<ActionResult<Member>> SaveMemberAsync(
        Member member,
        RegistrationRequest request,
        string username,
        string password,
        string phone,
        string phoneKey,
        bool isNew)
    {
        var planLabel = ResolvePlanLabel(request.Plan);
        var renewDays = ResolveRenewDays(request.Plan);

        var planPrice = await db.MembershipPlans
            .Where(p => p.Name.ToLower().Contains(planLabel.ToLower()))
            .Select(p => p.Price)
            .FirstOrDefaultAsync();

        member.Name = request.Name.Trim();
        member.Username = username;
        member.PasswordHash = PasswordHelper.Hash(password);
        member.Email = $"{phoneKey}@member.local";
        member.Phone = phone;
        member.Plan = planLabel;
        member.Status = "Active";
        member.Age = request.Age;
        member.Gender = request.Gender;
        member.RenewsAt = DateTime.UtcNow.AddDays(renewDays);

        if (isNew)
        {
            member.JoinedAt = DateTime.UtcNow;
            db.Members.Add(member);

            db.Payments.Add(new Payment
            {
                MemberId = member.Id,
                MemberName = member.Name,
                Amount = planPrice > 0 ? planPrice : 5000,
                Method = "Pending",
                Status = "Pending",
                ForPlan = planLabel,
                CreatedAt = DateTime.UtcNow,
                Note = "Auto-created from registration",
            });
        }

        await db.SaveChangesAsync();

        if (isNew)
            return CreatedAtAction("GetById", "Members", new { id = member.Id }, member);

        return Ok(member);
    }

    private static string NormalizePhone(string phone) => phone.Replace(" ", "", StringComparison.Ordinal);

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
