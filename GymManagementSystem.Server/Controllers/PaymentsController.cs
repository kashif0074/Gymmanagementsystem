using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AuthorizeRoles("admin")]
public class PaymentsController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Payment>>> GetAll() =>
        await db.Payments.OrderByDescending(p => p.CreatedAt).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetById(string id)
    {
        var payment = await db.Payments.FindAsync(id);
        return payment is null ? NotFound() : payment;
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> Create(Payment payment)
    {
        payment.Id = Guid.NewGuid().ToString();
        if (payment.CreatedAt == default)
            payment.CreatedAt = DateTime.UtcNow;

        var member = await db.Members.FindAsync(payment.MemberId);
        if (member != null)
        {
            payment.MemberName = member.Name;
        }

        db.Payments.Add(payment);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Payment>> Update(string id, Payment payment)
    {
        var existing = await db.Payments.FindAsync(id);
        if (existing is null) return NotFound();

        existing.MemberId = payment.MemberId;
        
        var member = await db.Members.FindAsync(payment.MemberId);
        if (member != null)
        {
            existing.MemberName = member.Name;
        }
        else
        {
            existing.MemberName = payment.MemberName;
        }

        existing.Amount = payment.Amount;
        existing.Method = payment.Method;
        existing.Status = payment.Status;
        existing.ForPlan = payment.ForPlan;
        existing.CreatedAt = payment.CreatedAt;
        existing.Note = payment.Note;

        await db.SaveChangesAsync();
        return existing;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await db.Payments.FindAsync(id);
        if (existing is null) return NotFound();

        db.Payments.Remove(existing);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
