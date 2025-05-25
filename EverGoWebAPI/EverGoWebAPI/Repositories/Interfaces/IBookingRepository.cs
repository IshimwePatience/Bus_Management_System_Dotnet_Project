using EverGoWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IBookingRepository
    {
        Task<IEnumerable<Booking>> GetAllBookingsAsync();
        Task<Booking> GetBookingByIdAsync(int id);
        Task<Booking> GetBookingByReferenceAsync(string reference);
        Task<IEnumerable<Booking>> GetBookingsByScheduleAsync(int scheduleId);
        Task<Booking> CreateBookingAsync(Booking booking);
        Task UpdateBookingAsync(Booking booking);
        Task DeleteBookingAsync(int id);
        Task<Booking> GetBookingByIdAsync(int? bookingId);
        Task<int> GetTodaysBookingCountAsync();
        Task<List<Booking>> GetLatestBookingsAsync(int count);
        Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate); // New method
    }
}