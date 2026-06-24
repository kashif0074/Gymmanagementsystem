using System.Text.Json;
using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlansController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PublicPlanDto>>> GetPublicPlans()
    {
        var settings = await db.GymSettings.AsNoTracking().FirstAsync();
        var plans = await db.MembershipPlans.AsNoTracking().OrderBy(p => p.SortOrder).ToListAsync();

        return plans.Select(p => new PublicPlanDto(
            p.Id,
            p.Name,
            FormatPrice(p.Price, settings.Currency),
            p.Note,
            ParseFeatures(p.FeaturesJson),
            p.Highlight)).ToList();
    }

    private static List<string> ParseFeatures(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static string FormatPrice(decimal price, string currency) =>
        currency switch
        {
            "PKR" => $"PKR {price:N0}",
            "USD" => $"${price:N0}",
            "EUR" => $"€{price:N0}",
            "GBP" => $"£{price:N0}",
            _ => $"{currency} {price:N0}",
        };
}
