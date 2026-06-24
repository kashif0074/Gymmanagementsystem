using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using GymManagementSystem.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainersController(GymDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Trainer>>> GetAll([FromQuery] bool publicOnly = false)
    {
        var query = db.Trainers.AsQueryable();
        if (publicOnly)
            query = query.Where(t => t.ShowOnPublicSite && t.Status == "Active");

        return await query.OrderBy(t => t.Name).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Trainer>> GetById(string id)
    {
        var trainer = await db.Trainers.FindAsync(id);
        return trainer is null ? NotFound() : trainer;
    }

    [HttpPost]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<Trainer>> Create(Trainer trainer)
    {
        trainer.Id = Guid.NewGuid().ToString();
        db.Trainers.Add(trainer);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = trainer.Id }, trainer);
    }

    [HttpPut("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<ActionResult<Trainer>> Update(string id, Trainer trainer)
    {
        var existing = await db.Trainers.FindAsync(id);
        if (existing is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(trainer.Name))
            existing.Name = trainer.Name.Trim();
        if (!string.IsNullOrWhiteSpace(trainer.Email))
            existing.Email = trainer.Email.Trim();
        if (trainer.Phone is not null)
            existing.Phone = trainer.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(trainer.Specialty))
            existing.Specialty = trainer.Specialty;
        if (trainer.ExperienceYears >= 0)
            existing.ExperienceYears = trainer.ExperienceYears;
        if (!string.IsNullOrWhiteSpace(trainer.Status))
            existing.Status = trainer.Status;
        if (trainer.RatePerSession >= 0)
            existing.RatePerSession = trainer.RatePerSession;
        if (trainer.Bio is not null)
            existing.Bio = trainer.Bio;
        existing.ShowOnPublicSite = trainer.ShowOnPublicSite;

        await db.SaveChangesAsync();
        return existing;
    }

    [HttpDelete("{id}")]
    [AuthorizeRoles("admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await db.Trainers.FindAsync(id);
        if (existing is null) return NotFound();

        db.Trainers.Remove(existing);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
