using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Booking? Booking { get; set; }
    }

    public enum PaymentMethod
    {
        CreditCard,
        MobileMoney,
        Cash
    }

    public enum PaymentStatus
    {
        Successful,
        Failed,
        Pending
    }
}
