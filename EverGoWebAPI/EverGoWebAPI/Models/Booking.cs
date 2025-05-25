using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class Booking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookingId { get; set; }
        public int ScheduleId { get; set; }
        public string? PassengerName { get; set; }
        public string? PassengerEmail { get; set; }
        public string? PassengerPhone { get; set; } 
        public string? PickupPoint { get; set; }
        public string? BookingReference { get; set; }
        public string? TicketCode { get; set; }
        public string? QrCodeData { get; set; }
        public int NumberOfSeats { get; set; }
        public BookingStatus BookingStatus { get; set; }
        public VerificationStatus VerificationStatus { get; set; }
        public decimal Amount { get; set; } // Add Amount
        public bool NotificationSent { get; set; }
        public DateTime CreatedAt { get; set; }


        // Navigation properties
        public virtual Schedule? Schedule { get; set; }
        public virtual Payment? Payment { get; set; }
    }

    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Cancelled
    }

    public enum VerificationStatus
    {
        Pending,
        Verified,
        NoShow
    }
}
