using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;

        public PaymentsController(IPaymentRepository paymentRepository, IBookingRepository bookingRepository)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
        }

        // GET: api/Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments()
        {
            var payments = await _paymentRepository.GetAllPaymentsAsync();
            var paymentsDto = payments.Select(payment => new PaymentDto
            {
                PaymentId = payment.PaymentId,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod, // Assign enum directly
                TransactionId = payment.TransactionId,
                PaymentStatus = payment.PaymentStatus // Assign enum directly
            });

            return Ok(paymentsDto);
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            var payment = await _paymentRepository.GetPaymentByIdAsync(id);

            if (payment == null)
            {
                return NotFound();
            }

            var paymentDto = new PaymentDto
            {
                PaymentId = payment.PaymentId,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod, // Assign enum directly
                TransactionId = payment.TransactionId,
                PaymentStatus = payment.PaymentStatus // Assign enum directly
            };

            return Ok(paymentDto);
        }

        // GET: api/Payments/booking/5
        [HttpGet("booking/{bookingId}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentByBooking(int bookingId)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
            if (booking == null)
            {
                return NotFound("Booking not found");
            }

            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            if (payment == null)
            {
                return NotFound("Payment not found");
            }

            var paymentDto = new PaymentDto
            {
                PaymentId = payment.PaymentId,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod, // Assign enum directly
                TransactionId = payment.TransactionId,
                PaymentStatus = payment.PaymentStatus // Assign enum directly
            };

            return Ok(paymentDto);
        }

        // POST: api/Payments (Redirect to /api/Bookings/payments)
        [HttpPost]
        public IActionResult CreatePayment()
        {
            // Redirect to /api/Bookings/payments
            return RedirectToAction("ProcessPayment", "Bookings");
        }

        // PUT: api/Payments/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] string status)
        {
            var payment = await _paymentRepository.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            if (!Enum.TryParse<PaymentStatus>(status, true, out var paymentStatus))
            {
                return BadRequest("Invalid payment status");
            }

            payment.PaymentStatus = paymentStatus;
            await _paymentRepository.UpdatePaymentAsync(payment);

            // Update booking status based on payment status
            var booking = await _bookingRepository.GetBookingByIdAsync(payment.BookingId);
            if (booking != null)
            {
                booking.BookingStatus = paymentStatus == PaymentStatus.Successful ?
                    BookingStatus.Confirmed : BookingStatus.Pending;
                await _bookingRepository.UpdateBookingAsync(booking);
            }

            return NoContent();
        }

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _paymentRepository.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            await _paymentRepository.DeletePaymentAsync(id);

            return NoContent();
        }
    }
}