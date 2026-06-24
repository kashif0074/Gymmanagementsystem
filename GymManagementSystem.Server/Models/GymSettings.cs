namespace GymManagementSystem.Server.Models;

public class GymSettings
{
    public int Id { get; set; } = 1;
    public string GymName { get; set; } = "Gym Management System";
    public string ContactEmail { get; set; } = "gym@example.com";
    public string ContactPhone { get; set; } = "+1 (000) 000-0000";
    public string Address { get; set; } = "123 Fitness Street, City Center";
    public string Hours { get; set; } = "Mon–Sat: 6am–10pm";
    public string Currency { get; set; } = "PKR";
    public bool NotifyExpiringMemberships { get; set; } = true;
    public bool NotifyPaymentPending { get; set; } = true;
    public bool AdminPinEnabled { get; set; }
    public string AdminPin { get; set; } = string.Empty;
}
