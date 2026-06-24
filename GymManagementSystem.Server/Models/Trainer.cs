namespace GymManagementSystem.Server.Models;

public class Trainer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Specialty { get; set; } = "Strength";
    public int ExperienceYears { get; set; }
    public string Status { get; set; } = "Active";
    public decimal RatePerSession { get; set; }
    public string? Bio { get; set; }
    public bool ShowOnPublicSite { get; set; } = true;
}
