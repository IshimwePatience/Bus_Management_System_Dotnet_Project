using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class Schedule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ScheduleId { get; set; }
        public int RouteId { get; set; }
        public int BusId { get; set; }
        public int DriverId { get; set; }
        public TimeSpan DepartureTime { get; set; }
        public DateTime TripDate { get; set; }
        public decimal Price { get; set; } // Add Price from Route

        public ScheduleStatus Status { get; set; }

        public DateTime? ActualDepartureTime { get; set; }
        public DateTime? ActualArrivalTime { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Route Route { get; set; }
        public virtual Bus Bus { get; set; }
        public virtual User Driver { get; set; }
        public virtual ICollection<Booking> Bookings { get; set; }
    }

    public enum ScheduleStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }
}
