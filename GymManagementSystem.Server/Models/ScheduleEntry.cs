namespace GymManagementSystem.Server.Models;

public class ScheduleEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Day { get; set; } = string.Empty;
    public string Morning { get; set; } = string.Empty;
    public string Evening { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
