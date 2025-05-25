using System.Collections.Generic;
using System.Reflection.Emit;
using EverGoWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Data
{
    public class BusManagementContext : DbContext
    {
        public BusManagementContext(DbContextOptions<BusManagementContext> options) : base(options)
        {
        }

        public DbSet<Bus> Buses { get; set; }
        public DbSet<Models.Route> Routes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<BusMaintenance> BusMaintenance { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships

            // Bus to Schedule (one-to-many)
            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Bus)
                .WithMany(b => b.Schedules)
                .HasForeignKey(s => s.BusId);

            // Route to Schedule (one-to-many)
            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Route)
                .WithMany(r => r.Schedules)
                .HasForeignKey(s => s.RouteId);

            // Driver to Schedule (one-to-many)
            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Driver)
                .WithMany(d => d.Schedules)
                .HasForeignKey(s => s.DriverId);

            modelBuilder.Entity<Schedule>()
                .Property(s => s.Status)
                .HasConversion<int>();

            // Schedule to Booking (one-to-many)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Schedule)
                .WithMany(s => s.Bookings)
                .HasForeignKey(b => b.ScheduleId);

            // Booking to Payment (one-to-one)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithOne(b => b.Payment)
                .HasForeignKey<Payment>(p => p.BookingId);

            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentStatus)
                .HasConversion<int>();

            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentMethod)
                .HasConversion<int>();

            // Maintenance Model
            // Bus to Maintenance (one-to-many)
            modelBuilder.Entity<BusMaintenance>()
                .HasOne(m => m.Bus)
                .WithMany(b => b.MaintenanceRecords)
                .HasForeignKey(m => m.BusId);

            modelBuilder.Entity<BusMaintenance>()
                .HasKey(m => m.MaintenanceId);

            modelBuilder.Entity<BusMaintenance>()
                .Property(m => m.Status)
                .HasConversion<int>();

            modelBuilder.Entity<BusMaintenance>()
                .Property(m => m.Cost)
                .HasPrecision(18, 2);

            // Bus model
            modelBuilder.Entity<Bus>()
                .HasIndex(b => b.BusNumber)
                .IsUnique();
            modelBuilder.Entity<Bus>()
                .Property(b => b.Status)
                .HasConversion<int>();

            // Booking Model
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.BookingReference)
                .IsUnique();
            modelBuilder.Entity<Booking>()
                .Property(b => b.BookingStatus)
                .HasConversion<int>();
            modelBuilder.Entity<Booking>()
                .Property(b => b.VerificationStatus)
                .HasConversion<int>();

            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.TicketCode)
                .IsUnique();

            // Payment model
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.TransactionId)
                .IsUnique();

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentStatus)
                .HasConversion<int>();
            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentMethod)
                .HasConversion<int>();

            // User model configurations
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<User>()
                .Property(u => u.DriverStatus)
                .HasConversion<string>();

            modelBuilder.Entity<User>()
                .Property(u => u.LicenseImage)
                .HasColumnType("nvarchar(max)"); // Suitable for base64 strings

            // Add this to prevent EF from trying to create tables
            modelBuilder.Entity<Bus>().ToTable("Buses");
            modelBuilder.Entity<Models.Route>().ToTable("Routes");
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Schedule>().ToTable("Schedules");
            modelBuilder.Entity<Booking>().ToTable("Bookings");
            modelBuilder.Entity<Payment>().ToTable("Payments");
            modelBuilder.Entity<BusMaintenance>().ToTable("BusMaintenance");
        }
    }
}