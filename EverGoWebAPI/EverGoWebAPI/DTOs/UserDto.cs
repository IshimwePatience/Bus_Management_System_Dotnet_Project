namespace EverGoWebAPI.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public bool IsGuest { get; set; }
        // Driver specific properties
        public string? LicenseNumber { get; set; }
        public string? LicenseImage { get; set; }
        public DateTime? LicenseExpiry { get; set; }
        public string? DriverStatus { get; set; }
    }

    public class CreateUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public bool IsGuest { get; set; }
        // Driver specific properties
        public string? LicenseNumber { get; set; }
        public string? LicenseImage { get; set; }
        public DateTime? LicenseExpiry { get; set; }
    }
}