namespace EverGoWebAPI.DTOs
{
    public class BookingDto
    {
        public int BookingId { get; set; }
        public int ScheduleId { get; set; }
        public string? PassengerName { get; set; }
        public string? PassengerEmail { get; set; }
        public string? PassengerPhone { get; set; }
        public string? PickupPoint { get; set; }
        public string? BookingReference { get; set; }
        public string? TicketCode { get; set; }

        public decimal Amount { get; set; } // Add Amount
        public string? QrCodeData { get; set; }
        public int NumberOfSeats { get; set; }
        public string? BookingStatus { get; set; }
        public string? VerificationStatus { get; set; }
        public bool NotificationSent { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public string? CreatedAt { get; set; } // Added to match frontend expectations

    }

    public class CreateBookingDto
    {
        public int ScheduleId { get; set; }
        public string? PassengerName { get; set; }
        public string? PassengerEmail { get; set; }
        public string? PassengerPhone { get; set; }
        public string?  PickupPoint { get; set; }
        public int NumberOfSeats { get; set; }
    }
}