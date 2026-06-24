namespace GymManagementSystem.Server.Models;

public record LoginRequest(string Username, string Password, string Mode);

public record LoginResponse(bool Success, string? Message, string? Role, string? DisplayName, string? Token = null);

public record UpdateProfileRequest(
    string Name,
    string Email,
    string Phone,
    int? Age,
    string? Gender,
    string? Password = null);

public record RegistrationRequest(
    string Name,
    string Username,
    string Password,
    int Age,
    string Gender,
    string Phone,
    string Plan);

public record ContactRequest(string Name, string Email, string Message);

public record SettingsDto(
    string GymName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    string Hours,
    string Currency,
    NotificationSettingsDto Notifications,
    AccessSettingsDto Access,
    List<PlanPriceDto> MembershipPlans);

public record NotificationSettingsDto(bool ExpiringMemberships, bool PaymentPending);

public record AccessSettingsDto(bool AdminPinEnabled, string AdminPin);

public record PlanPriceDto(string Name, decimal Price);

public record PublicPlanDto(
    string Id,
    string Title,
    string Price,
    string? Note,
    List<string> Features,
    bool Highlight);

public record PublicTrainerDto(
    string Name,
    string Specialization,
    string Experience,
    string Bio);

public record DashboardStatsDto(
    int TotalMembers,
    int ActiveMembers,
    int TotalTrainers,
    int PendingPayments,
    decimal TotalRevenue,
    int TodayAttendance);

public record MemberProfileDto(
    Member Member,
    List<Payment> Payments,
    List<AttendanceRecord> Attendance);

public record PublicSettingsDto(
    string GymName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    string Hours,
    string Currency);

public record SelectPlanRequest(string PlanName);
public record JoinTrainerRequest(string TrainerId);
