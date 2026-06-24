namespace GymManagementSystem.Server.Models;

public class MembershipPlan
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Note { get; set; }
    public string? FeaturesJson { get; set; }
    public bool Highlight { get; set; }
    public int SortOrder { get; set; }
}
