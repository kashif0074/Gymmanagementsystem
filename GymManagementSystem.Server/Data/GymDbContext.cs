using GymManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Server.Data;

public class GymDbContext(DbContextOptions<GymDbContext> options) : DbContext(options)
{
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<MembershipPlan> MembershipPlans => Set<MembershipPlan>();
    public DbSet<GymSettings> GymSettings => Set<GymSettings>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<ScheduleEntry> ScheduleEntries => Set<ScheduleEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GymSettings>().HasData(new GymSettings { Id = 1 });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.Property(m => m.Username).HasDefaultValue(string.Empty);
            entity.Property(m => m.PasswordHash).HasDefaultValue(string.Empty);
            entity.HasIndex(m => m.Username).IsUnique();
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasOne<Member>()
                .WithMany()
                .HasForeignKey(p => p.MemberId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AttendanceRecord>(entity =>
        {
            entity.HasOne<Member>()
                .WithMany()
                .HasForeignKey(a => a.MemberId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
