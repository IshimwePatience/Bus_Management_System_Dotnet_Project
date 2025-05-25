using EverGoWebAPI.Data;
using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;
using System.Threading.Tasks;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IEmailService _emailService;
        private readonly IPaymentRepository _paymentRepository;
        private readonly BusManagementContext _context;

        public BookingsController(
            IBookingRepository bookingRepository,
            IScheduleRepository scheduleRepository,
            IEmailService emailService,
            IPaymentRepository paymentRepository,
            BusManagementContext context)
        {
            _bookingRepository = bookingRepository;
            _scheduleRepository = scheduleRepository;
            _emailService = emailService;
            _paymentRepository = paymentRepository;
            _context = context;
        }

        // [Rest of the methods remain unchanged]
        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var bookings = await _bookingRepository.GetAllBookingsAsync();
            var bookingsDto = await MapBookingsToDto(bookings);

            return Ok(bookingsDto);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(id);

            if (booking == null)
            {
                return NotFound();
            }

            var bookingsDto = await MapBookingToDto(booking);
            return Ok(bookingsDto);
        }

        // GET: api/Bookings/reference/{reference}
        [HttpGet("reference/{reference}")]
        public async Task<ActionResult<BookingDto>> GetBookingByReference(string reference)
        {
            var booking = await _bookingRepository.GetBookingByReferenceAsync(reference);

            if (booking == null)
            {
                return NotFound();
            }

            var bookingDto = await MapBookingToDto(booking);
            return Ok(bookingDto);
        }

        // GET: api/Bookings/schedule/{scheduleId}
        [HttpGet("schedule/{scheduleId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsBySchedule(int scheduleId)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(scheduleId);
            if (schedule == null)
            {
                return NotFound("Schedule not found");
            }

            var bookings = await _bookingRepository.GetBookingsByScheduleAsync(scheduleId);
            var bookingsDto = await MapBookingsToDto(bookings);

            return Ok(bookingsDto);
        }

        // NEW: GET: api/Bookings/date-range?start=2025-01-01&end=2025-05-25
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByDateRange([FromQuery] string start, [FromQuery] string end)
        {
            try
            {
                if (!DateTime.TryParseExact(start, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var startDate) ||
                    !DateTime.TryParseExact(end, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var endDate))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD format (e.g., 2025-01-01).");
                }

                if (startDate > endDate)
                {
                    return BadRequest("Start date must be before end date.");
                }

                var bookings = await _bookingRepository.GetBookingsByDateRangeAsync(startDate, endDate);
                var bookingsDto = await MapBookingsToDto(bookings);
                return Ok(bookingsDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching bookings.", detail = ex.Message });
            }
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto createBookingDto)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(createBookingDto.ScheduleId);
            if (schedule == null)
            {
                return BadRequest("Invalid schedule ID");
            }

            string bookingReference = GenerateBookingReference();
            string ticketCode = GenerateTicketCode();
            string qrCodeData = $"booking:{bookingReference}|ticket:{ticketCode}";
            decimal amount = schedule.Price * createBookingDto.NumberOfSeats;

            var booking = new Booking
            {
                ScheduleId = createBookingDto.ScheduleId,
                PassengerName = createBookingDto.PassengerName,
                PassengerEmail = createBookingDto.PassengerEmail,
                PassengerPhone = createBookingDto.PassengerPhone,
                PickupPoint = createBookingDto.PickupPoint,
                BookingReference = bookingReference,
                TicketCode = ticketCode,
                QrCodeData = qrCodeData,
                NumberOfSeats = createBookingDto.NumberOfSeats,
                BookingStatus = BookingStatus.Pending,
                VerificationStatus = VerificationStatus.Pending,
                Amount = amount,
                NotificationSent = false,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.CreateBookingAsync(booking);

            var bookingDto = await MapBookingToDto(booking);
            return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingId }, bookingDto);
        }

        // POST: api/Bookings/payments
        [HttpPost("payments")]
        public async Task<ActionResult<PaymentDto>> ProcessPayment(CreatePaymentDto paymentDto)
        {
            Console.WriteLine("Processing payment for BookingId: " + paymentDto.BookingId);

            var booking = await _bookingRepository.GetBookingByIdAsync(paymentDto.BookingId);
            if (booking == null)
            {
                Console.WriteLine("Booking not found for BookingId: " + paymentDto.BookingId);
                return NotFound(new { message = "Booking not found", detail = $"BookingId {paymentDto.BookingId} does not exist" });
            }

            // Validate payment amount
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(booking.ScheduleId);
            decimal expectedAmount = schedule.Price * booking.NumberOfSeats;
            //if (paymentDto.Amount != expectedAmount)
            //{
            //    Console.WriteLine("Invalid payment amount: " + paymentDto.Amount + ", Expected: " + expectedAmount);
            //    return BadRequest(new { message = "Invalid payment amount", detail = $"Expected: {expectedAmount}, Received: {paymentDto.Amount}" });
            //}

            // Validate payment method  
            if (!Enum.TryParse<PaymentMethod>(paymentDto.PaymentMethod, true, out var paymentMethod))
            {
                Console.WriteLine("Invalid payment method: " + paymentDto.PaymentMethod);
                return BadRequest(new { message = "Invalid payment method", detail = $"Received: {paymentDto.PaymentMethod}, Expected: CreditCard or MobileMoney" });
            }

            // Check if payment already exists
            var existingPayment = await _paymentRepository.GetPaymentByBookingIdAsync(paymentDto.BookingId);
            if (existingPayment != null)
            {
                return BadRequest(new { message = "Payment already exists", detail = $"A payment already exists for BookingId {paymentDto.BookingId}" });
            }

            // Update booking status to Confirmed
            booking.Amount = paymentDto.Amount;
            booking.BookingStatus = BookingStatus.Confirmed;
            await _bookingRepository.UpdateBookingAsync(booking);

            // Prepare BookingDto for email
            var bookingDto = await MapBookingToDto(booking);
            if (string.IsNullOrEmpty(bookingDto.QrCodeData))
            {
                Console.WriteLine("QrCodeData is missing for BookingId: " + booking.BookingId);
                // Proceed without email, but log the issue
            }
            else
            {
                Console.WriteLine("Preparing to send email to: " + booking.PassengerEmail + " with QrCodeData: " + bookingDto.QrCodeData);
                try
                {
                    await _emailService.SendBookingConfirmationEmailAsync(booking.PassengerEmail, booking.PassengerName, bookingDto);
                    booking.NotificationSent = true;
                    Console.WriteLine("Email sent successfully to: " + booking.PassengerEmail);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Email sending failed for BookingId " + booking.BookingId + ": " + ex.Message);
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine("Inner exception: " + ex.InnerException.Message);
                    }
                    // Continue even if email fails
                }
            }

            // Create payment record with enums
            var payment = new Payment
            {
                BookingId = paymentDto.BookingId,
                Amount = paymentDto.Amount,
                PaymentMethod = paymentMethod,
                TransactionId = paymentDto.TransactionId,
                PaymentStatus = PaymentStatus.Successful, // Set as enum
                CreatedAt = DateTime.UtcNow
            };
            await _paymentRepository.CreatePaymentAsync(payment);

            await _bookingRepository.UpdateBookingAsync(booking); // Update NotificationSent

            // Return payment response
            var paymentResponse = new PaymentDto
            {
                PaymentId = payment.PaymentId,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod, // Assign enum directly
                TransactionId = payment.TransactionId,
                PaymentStatus = payment.PaymentStatus // Assign enum directly
            };

            return Ok(paymentResponse);
        }

        // PUT: api/Bookings/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] string status)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            if (!Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
            {
                return BadRequest("Invalid booking status");
            }

            booking.BookingStatus = bookingStatus;
            await _bookingRepository.UpdateBookingAsync(booking);

            return NoContent();
        }

        // PUT: api/Bookings/5/verify
        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyBooking(int id)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            booking.VerificationStatus = VerificationStatus.Verified;
            await _bookingRepository.UpdateBookingAsync(booking);

            return NoContent();
        }

        // PUT: api/Bookings/5/noshow
        [HttpPut("{id}/noshow")]
        public async Task<IActionResult> MarkNoShow(int id)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            booking.VerificationStatus = VerificationStatus.NoShow;
            await _bookingRepository.UpdateBookingAsync(booking);

            return NoContent();
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            await _bookingRepository.DeleteBookingAsync(id);

            return NoContent();
        }

        // Helper methods
        private async Task<BookingDto> MapBookingToDto(Booking booking)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(booking.ScheduleId);

            return new BookingDto
            {
                BookingId = booking.BookingId,
                ScheduleId = booking.ScheduleId,
                PassengerName = booking.PassengerName,
                PassengerEmail = booking.PassengerEmail,
                PassengerPhone = booking.PassengerPhone,
                PickupPoint = booking.PickupPoint,
                BookingReference = booking.BookingReference,
                TicketCode = booking.TicketCode,
                QrCodeData = booking.QrCodeData,
                NumberOfSeats = booking.NumberOfSeats,
                BookingStatus = booking.BookingStatus.ToString(),
                VerificationStatus = booking.VerificationStatus.ToString(),
                NotificationSent = booking.NotificationSent,
                Schedule = schedule != null ? new ScheduleDto
                {
                    ScheduleId = schedule.ScheduleId,
                    RouteId = schedule.RouteId,
                    BusId = schedule.BusId,
                    DriverId = schedule.DriverId,
                    DepartureTime = schedule.DepartureTime.ToString(),
                    TripDate = schedule.TripDate.ToString("yyyy-MM-dd"),
                    Status = schedule.Status.ToString(),
                    Price = schedule.Price
                } : null,
                Amount = booking.Amount
            };
        }

        private async Task<List<BookingDto>> MapBookingsToDto(IEnumerable<Booking> bookings)
        {
            var bookingsDto = new List<BookingDto>();
            foreach (var booking in bookings)
            {
                bookingsDto.Add(await MapBookingToDto(booking));
            }
            return bookingsDto;
        }

        private string GenerateBookingReference()
        {
            return "BK-" + new Random().Next(10000000, 99999999).ToString();
        }

        private string GenerateTicketCode()
        {
            return "TKT-" + Guid.NewGuid().ToString().Substring(0, 14).ToUpper();
        }
    }
}