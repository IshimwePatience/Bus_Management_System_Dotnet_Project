using EverGoWebAPI.Models;

namespace EverGoWebAPI.DTOs
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
    }

    public class CreatePaymentDto
    {
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
    }
}