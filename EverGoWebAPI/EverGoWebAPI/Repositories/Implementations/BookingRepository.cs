using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class BookingRepository : IBookingRepository
    {
        private readonly BusManagementContext _context;
        private readonly ILogger<BookingRepository> _logger;

        public BookingRepository(BusManagementContext context, ILogger<BookingRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            return await _context.Bookings
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Route)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Bus)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Driver)
                .ToListAsync();
        }

        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Route)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Bus)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Driver)
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task<Booking> GetBookingByReferenceAsync(string reference)
        {
            return await _context.Bookings
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Route)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Bus)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Driver)
                .FirstOrDefaultAsync(b => b.BookingReference == reference);
        }

        public async Task<Booking> GetBookingByIdAsync(int? bookingId)
        {
            return await _context.Bookings
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Route)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Bus)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Driver)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByScheduleAsync(int scheduleId)
        {
            return await _context.Bookings
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Route)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Bus)
                .Include(b => b.Schedule)
                    .ThenInclude(s => s.Driver)
                .Where(b => b.ScheduleId == scheduleId)
                .ToListAsync();
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            booking.CreatedAt = DateTime.UtcNow;
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task UpdateBookingAsync(Booking booking)
        {
            _context.Entry(booking).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBookingAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking != null)
            {
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetTodaysBookingCountAsync()
        {
            return await _context.Bookings
                .CountAsync(b => b.CreatedAt.Date == DateTime.Today);
        }

        public async Task<List<Booking>> GetLatestBookingsAsync(int count)
        {
            return await _context.Bookings
                .OrderByDescending(b => b.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (_logger != null) _logger.LogInformation("Fetching bookings for date range: {StartDate} to {EndDate}", startDate, endDate);
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Route)
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Bus)
                    .Include(b => b.Schedule)
                        .ThenInclude(s => s.Driver)
                    .Where(b => b.CreatedAt.Date >= startDate.Date && b.CreatedAt.Date <= endDate.Date)
                    .ToListAsync();

                if (_logger != null) _logger.LogInformation("Found {Count} bookings", bookings.Count);
                return bookings;
            }
            catch (Exception ex)
            {
                if (_logger != null) _logger.LogError(ex, "Error fetching bookings by date range: {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}