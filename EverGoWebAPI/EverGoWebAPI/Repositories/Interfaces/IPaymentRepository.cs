using EverGoWebAPI.Models;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<Payment> GetPaymentByIdAsync(int id);
        Task<Payment> GetPaymentByTransactionIdAsync(string transactionId);
        Task<Payment> CreatePaymentAsync(Payment payment);
        Task UpdatePaymentAsync(Payment payment);
        Task DeletePaymentAsync(int id);
        Task<Payment> GetPaymentByBookingIdAsync(int bookingId);
    }
}
