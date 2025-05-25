using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class BusMaintenance
    {
        [Key] // Add this attribute
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Add this if you want auto-increment
        public int MaintenanceId { get; set; }
        [ForeignKey("Bus")]
        public int BusId { get; set; }
        [Column(TypeName = "date")]
        public DateTime MaintenanceDate { get; set; }
        [Column(TypeName = "nvarchar(MAX)")]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Cost { get; set; }
        public MaintenanceStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Bus? Bus { get; set; }
    }

    public enum MaintenanceStatus
    {
        Scheduled,
        InProgress,
        Completed
    }
}