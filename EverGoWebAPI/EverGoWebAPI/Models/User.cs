using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Password { get; set; } // Hashed, null for guest users
        public UserRole Role { get; set; }
        public bool IsGuest { get; set; }
        public string? LicenseNumber { get; set; } // For drivers only
        public string? LicenseImage { get; set; } // For drivers only, stores the image as a base64 string
        public DateTime? LicenseExpiry { get; set; } // For drivers only
        public DriverStatus? DriverStatus { get; set; } // For drivers only
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Schedule>? Schedules { get; set; } // For drivers
    }

    public enum UserRole
    {
        Admin,
        Driver,
        Customer
    }

    public enum DriverStatus
    {
        Active,
        OnLeave,
        Inactive
    }
}