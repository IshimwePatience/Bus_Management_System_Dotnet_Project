using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EverGoWebAPI.Models
{
    public class Bus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Auto-increment
        public int BusId { get; set; }
        public string? BusNumber { get; set; }
        public string? Model { get; set; }
        public int Capacity { get; set; }
        public BusStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Schedule>? Schedules { get; set; }
        public virtual ICollection<BusMaintenance>? MaintenanceRecords { get; set; }
    }

    public enum BusStatus
    {
        Active,
        Maintenance,
        OutOfService
    }
}