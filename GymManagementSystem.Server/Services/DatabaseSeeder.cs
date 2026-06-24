using System.Text.Json;
using GymManagementSystem.Server.Data;
using GymManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Services;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(GymDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        await EnsureMemberAuthColumnsAsync(db);

        if (!db.Members.Any())
        {
            var now = DateTime.UtcNow;
            db.Members.AddRange(
                new Member
                {
                    Name = "Ali Khan",
                    Username = "member",
                    PasswordHash = PasswordHelper.Hash("member123"),
                    Email = "ali@example.com",
                    Phone = "+92 300 0000000",
                    Plan = "Monthly",
                    Status = "Active",
                    JoinedAt = now.AddDays(-45),
                    RenewsAt = now.AddDays(15),
                },
                new Member
                {
                    Name = "Sara Ahmed",
                    Username = "sara",
                    PasswordHash = PasswordHelper.Hash("sara123"),
                    Email = "sara@example.com",
                    Phone = "+92 321 0000000",
                    Plan = "Quarterly",
                    Status = "Active",
                    JoinedAt = now.AddDays(-90),
                    RenewsAt = now.AddDays(1),
                },
                new Member
                {
                    Name = "John Smith",
                    Username = "john",
                    PasswordHash = PasswordHelper.Hash("john123"),
                    Email = "john@example.com",
                    Phone = "+1 555 0100",
                    Plan = "Yearly",
                    Status = "Inactive",
                    JoinedAt = now.AddDays(-400),
                    RenewsAt = now.AddDays(-35),
                });
            await db.SaveChangesAsync();
        }

        var membersList = await db.Members.Select(m => new { m.Name, m.Id }).ToListAsync();
        var memberDict = membersList
            .GroupBy(m => m.Name)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        if (!db.Trainers.Any())
        {
            db.Trainers.AddRange(
                new Trainer
                {
                    Name = "Hassan Raza",
                    Email = "hassan.trainer@example.com",
                    Phone = "+92 333 0000000",
                    Specialty = "Strength",
                    ExperienceYears = 6,
                    Status = "Active",
                    RatePerSession = 2500,
                    Bio = "Focuses on compound lifts, posture, and progressive overload with safe technique.",
                    ShowOnPublicSite = true,
                },
                new Trainer
                {
                    Name = "Maria Khan",
                    Email = "maria.trainer@example.com",
                    Phone = "+92 300 0000000",
                    Specialty = "Yoga",
                    ExperienceYears = 4,
                    Status = "Active",
                    RatePerSession = 2000,
                    Bio = "Improves flexibility, breathing, recovery, and mobility for everyday performance.",
                    ShowOnPublicSite = true,
                },
                new Trainer
                {
                    Name = "David Lee",
                    Email = "david.trainer@example.com",
                    Phone = "+1 555 0123",
                    Specialty = "Cardio",
                    ExperienceYears = 8,
                    Status = "Inactive",
                    RatePerSession = 3000,
                    Bio = "High-energy sessions designed for fat loss, endurance, and sustainable habits.",
                    ShowOnPublicSite = false,
                });
            await db.SaveChangesAsync();
        }

        if (!db.Payments.Any())
        {
            var now = DateTime.UtcNow;
            db.Payments.AddRange(
                new Payment
                {
                    MemberId = memberDict.GetValueOrDefault("Ali Khan", string.Empty),
                    MemberName = "Ali Khan",
                    Amount = 5000,
                    Method = "Cash",
                    Status = "Paid",
                    ForPlan = "Monthly",
                    CreatedAt = now.AddDays(-2),
                    Note = "Front desk",
                },
                new Payment
                {
                    MemberId = memberDict.GetValueOrDefault("Sara Ahmed", string.Empty),
                    MemberName = "Sara Ahmed",
                    Amount = 12000,
                    Method = "Card",
                    Status = "Paid",
                    ForPlan = "Quarterly",
                    CreatedAt = now.AddDays(-16),
                    Note = "Online terminal",
                },
                new Payment
                {
                    MemberId = memberDict.GetValueOrDefault("John Smith", string.Empty),
                    MemberName = "John Smith",
                    Amount = 20000,
                    Method = "Bank transfer",
                    Status = "Pending",
                    ForPlan = "Yearly",
                    CreatedAt = now.AddDays(-1),
                    Note = "Awaiting confirmation",
                });
            await db.SaveChangesAsync();
        }

        if (!db.AttendanceRecords.Any())
        {
            var today = DateTime.UtcNow.Date;
            db.AttendanceRecords.AddRange(
                new AttendanceRecord
                {
                    MemberId = memberDict.GetValueOrDefault("Ali Khan", string.Empty),
                    MemberName = "Ali Khan",
                    Date = today,
                    CheckIn = "08:12",
                    CheckOut = "09:25",
                },
                new AttendanceRecord
                {
                    MemberId = memberDict.GetValueOrDefault("Sara Ahmed", string.Empty),
                    MemberName = "Sara Ahmed",
                    Date = today,
                    CheckIn = "18:02",
                    CheckOut = "19:05",
                    Note = "PT session",
                },
                new AttendanceRecord
                {
                    MemberId = memberDict.GetValueOrDefault("John Smith", string.Empty),
                    MemberName = "John Smith",
                    Date = today.AddDays(-1),
                    CheckIn = "07:40",
                    CheckOut = "08:20",
                });
            await db.SaveChangesAsync();
        }

        if (!db.MembershipPlans.Any())
        {
            db.MembershipPlans.AddRange(
                new MembershipPlan
                {
                    Name = "Monthly Package",
                    Price = 4999,
                    Note = "Best for getting started",
                    FeaturesJson = JsonSerializer.Serialize(new[]
                    {
                        "Gym access",
                        "1 fitness assessment",
                        "Basic schedule access",
                    }),
                    Highlight = false,
                    SortOrder = 1,
                },
                new MembershipPlan
                {
                    Name = "Quarterly Package",
                    Price = 12999,
                    Note = "Most popular",
                    FeaturesJson = JsonSerializer.Serialize(new[]
                    {
                        "Gym access",
                        "Trainer guidance (weekly)",
                        "Full schedule access",
                    }),
                    Highlight = true,
                    SortOrder = 2,
                },
                new MembershipPlan
                {
                    Name = "Yearly Package",
                    Price = 44999,
                    Note = "Best value",
                    FeaturesJson = JsonSerializer.Serialize(new[]
                    {
                        "Gym access",
                        "Priority support",
                        "Monthly progress check-ins",
                    }),
                    Highlight = false,
                    SortOrder = 3,
                });
            await db.SaveChangesAsync();
        }

        if (!db.ScheduleEntries.Any())
        {
            var schedule = new (string Day, string Morning, string Evening)[]
            {
                ("Monday", "6:00–7:00 Cardio", "6:00–7:00 Strength"),
                ("Tuesday", "6:00–7:00 Yoga", "6:00–7:00 HIIT"),
                ("Wednesday", "6:00–7:00 Strength", "6:00–7:00 Mobility"),
                ("Thursday", "6:00–7:00 HIIT", "6:00–7:00 Cardio"),
                ("Friday", "6:00–7:00 Mobility", "6:00–7:00 Strength"),
                ("Saturday", "8:00–9:00 Full Body", "5:00–6:00 Yoga"),
                ("Sunday", "Rest / Open Gym", "Rest / Open Gym"),
            };

            for (var i = 0; i < schedule.Length; i++)
            {
                var row = schedule[i];
                db.ScheduleEntries.Add(new ScheduleEntry
                {
                    Day = row.Day,
                    Morning = row.Morning,
                    Evening = row.Evening,
                    SortOrder = i,
                });
            }
            await db.SaveChangesAsync();
        }

        await RepairIncompleteMemberAccountsAsync(db);
    }

    private static async Task EnsureMemberAuthColumnsAsync(GymDbContext db)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        await using var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();

        await using (var command = connection.CreateCommand())
        {
            command.CommandText = "PRAGMA table_info(Members);";
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                columns.Add(reader.GetString(1));
        }

        if (!columns.Contains("Username"))
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Members ADD COLUMN Username TEXT NOT NULL DEFAULT '';");

        if (!columns.Contains("PasswordHash"))
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Members ADD COLUMN PasswordHash TEXT NOT NULL DEFAULT '';");

        if (!columns.Contains("TrainerId"))
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Members ADD COLUMN TrainerId TEXT NULL;");

        if (!columns.Contains("TrainerName"))
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Members ADD COLUMN TrainerName TEXT NULL;");
    }

    /// <summary>
    /// Legacy rows created before auth columns were wired may have empty credentials.
    /// Give them unique internal usernames so new signups are not blocked by duplicates.
    /// </summary>
    private static async Task RepairIncompleteMemberAccountsAsync(GymDbContext db)
    {
        var incomplete = await db.Members
            .Where(m => m.Username == "" || m.Username == null)
            .ToListAsync();

        foreach (var member in incomplete)
        {
            member.Username = $"legacy_{member.Id[..8]}";
        }

        if (incomplete.Count > 0)
            await db.SaveChangesAsync();
    }
}
