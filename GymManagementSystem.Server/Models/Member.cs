using System.Text.Json.Serialization;

namespace GymManagementSystem.Server.Models;

public class Member
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Plan { get; set; } = "Monthly";
    public string Status { get; set; } = "Active";
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RenewsAt { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public string? TrainerId { get; set; }
    public string? TrainerName { get; set; }
}
