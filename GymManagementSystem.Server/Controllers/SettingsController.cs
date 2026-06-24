using System.Text.Json;
using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(GymDbContext db) : ControllerBase
{
    [HttpGet("public")]
    public async Task<ActionResult<PublicSettingsDto>> GetPublic()
    {
        var settings = await db.GymSettings.AsNoTracking().FirstAsync(s => s.Id == 1);
        return new PublicSettingsDto(
            settings.GymName,
            settings.ContactEmail,
            settings.ContactPhone,
            settings.Address,
            settings.Hours,
            settings.Currency);
    }

    [HttpGet]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<SettingsDto>> Get()
    {
        var settings = await db.GymSettings.AsNoTracking().FirstAsync(s => s.Id == 1);
        var plans = await db.MembershipPlans.AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .Select(p => new PlanPriceDto(p.Name, p.Price))
            .ToListAsync();

        return MapToDto(settings, plans);
    }

    [HttpPut]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<SettingsDto>> Update(SettingsDto dto)
    {
        var settings = await db.GymSettings.FirstAsync(s => s.Id == 1);
        settings.GymName = dto.GymName ?? settings.GymName;
        settings.ContactEmail = dto.ContactEmail ?? settings.ContactEmail;
        settings.ContactPhone = dto.ContactPhone ?? settings.ContactPhone;
        settings.Address = dto.Address ?? settings.Address;
        settings.Hours = dto.Hours ?? settings.Hours;
        settings.Currency = dto.Currency ?? settings.Currency;

        if (dto.Notifications is not null)
        {
            settings.NotifyExpiringMemberships = dto.Notifications.ExpiringMemberships;
            settings.NotifyPaymentPending = dto.Notifications.PaymentPending;
        }

        if (dto.Access is not null)
        {
            settings.AdminPinEnabled = dto.Access.AdminPinEnabled;
            settings.AdminPin = dto.Access.AdminPin ?? string.Empty;
        }

        if (dto.MembershipPlans is null || dto.MembershipPlans.Count == 0)
        {
            await db.SaveChangesAsync();
            var unchangedPlans = await db.MembershipPlans.AsNoTracking()
                .OrderBy(p => p.SortOrder)
                .Select(p => new PlanPriceDto(p.Name, p.Price))
                .ToListAsync();
            return MapToDto(settings, unchangedPlans);
        }

        var existingPlans = await db.MembershipPlans.OrderBy(p => p.SortOrder).ToListAsync();
        for (var i = 0; i < dto.MembershipPlans.Count; i++)
        {
            var incoming = dto.MembershipPlans[i];
            if (i < existingPlans.Count)
            {
                existingPlans[i].Name = incoming.Name;
                existingPlans[i].Price = incoming.Price;
            }
            else
            {
                db.MembershipPlans.Add(new MembershipPlan
                {
                    Name = incoming.Name,
                    Price = incoming.Price,
                    FeaturesJson = JsonSerializer.Serialize(new[] { "Gym access" }),
                    SortOrder = i + 1,
                });
            }
        }

        if (existingPlans.Count > dto.MembershipPlans.Count)
        {
            db.MembershipPlans.RemoveRange(existingPlans.Skip(dto.MembershipPlans.Count));
        }

        await db.SaveChangesAsync();

        var plans = await db.MembershipPlans.AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .Select(p => new PlanPriceDto(p.Name, p.Price))
            .ToListAsync();

        return MapToDto(settings, plans);
    }

    private static SettingsDto MapToDto(GymSettings settings, List<PlanPriceDto> plans) =>
        new(
            settings.GymName,
            settings.ContactEmail,
            settings.ContactPhone,
            settings.Address,
            settings.Hours,
            settings.Currency,
            new NotificationSettingsDto(settings.NotifyExpiringMemberships, settings.NotifyPaymentPending),
            new AccessSettingsDto(settings.AdminPinEnabled, settings.AdminPin),
            plans);
}
