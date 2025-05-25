
using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly BusManagementContext _context;

        public PaymentRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .ToListAsync();
        }

        public async Task<Payment> GetPaymentByIdAsync(int id)
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.PaymentId == id);
        }

        public async Task<Payment> GetPaymentByTransactionIdAsync(string transactionId)
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
        }

        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            payment.CreatedAt = DateTime.UtcNow;
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment> GetPaymentByBookingIdAsync(int bookingId)
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);
        }


        public async Task UpdatePaymentAsync(Payment payment)
        {
            _context.Entry(payment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeletePaymentAsync(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment != null)
            {
                _context.Payments.Remove(payment);
                await _context.SaveChangesAsync();
            }
        }
    }
}
