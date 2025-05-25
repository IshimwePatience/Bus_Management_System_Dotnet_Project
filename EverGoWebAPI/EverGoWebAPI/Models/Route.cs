using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class Route
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RouteId { get; set; }
        public string? RouteName { get; set; }
        public string? StartLocation { get; set; }
        public string? EndLocation { get; set; }
        public string? PickupPoints { get; set; } // JSON array of pickup points
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Schedule>? Schedules { get; set; }
    }
}
