
using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly BusManagementContext _context;
        private readonly ILogger<ScheduleRepository> _logger;

        public ScheduleRepository(BusManagementContext context, ILogger<ScheduleRepository> logger)
        {
            _context = context;
            _logger = logger; // Allow null logger as a fallback

        }

        public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync()
        {
            return await _context.Schedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .Include(s => s.Driver)
                .ToListAsync();
        }

        public async Task<Schedule> GetScheduleByIdAsync(int id)
        {
            return await _context.Schedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .Include(s => s.Driver)
                .FirstOrDefaultAsync(s => s.ScheduleId == id);
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByRouteAsync(int routeId)
        {
            return await _context.Schedules.Where(s => s.RouteId == routeId).ToListAsync();
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByBusAsync(int busId)
        {
            return await _context.Schedules.Where(s => s.BusId == busId).ToListAsync();
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByDriverAsync(int driverId)
        {
            return await _context.Schedules.Where(s => s.DriverId == driverId).ToListAsync();
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByDateAsync(DateTime date)
        {
            return await _context.Schedules.Where(s => s.TripDate.Date == date.Date).ToListAsync();
        }

        public async Task<Schedule> CreateScheduleAsync(Schedule schedule)
        {
            schedule.CreatedAt = DateTime.UtcNow;
            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task UpdateScheduleAsync(Schedule schedule)
        {
            _context.Entry(schedule).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteScheduleAsync(int id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule != null)
            {
                _context.Schedules.Remove(schedule);
                await _context.SaveChangesAsync();
            }
        }

        
        public async Task<List<Schedule>> GetRecentCompletedTripsAsync()
        {
            return await _context.Schedules
                .Where(s => s.TripDate.Date == DateTime.Today && s.TripDate.Date + s.DepartureTime < DateTime.Now)
                .Include(s => s.Route)
                .Take(2)
                .ToListAsync();
        }

        public async Task<IEnumerable<Schedule>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (_logger != null) _logger.LogInformation("Fetching schedules for date range: {StartDate} to {EndDate}", startDate, endDate);
            try
            {
                var schedules = await _context.Schedules
                    .Include(s => s.Route)
                    .Include(s => s.Bus)
                    .Include(s => s.Driver)
                    .Where(s => s.TripDate.Date >= startDate.Date && s.TripDate.Date <= endDate.Date)
                    .ToListAsync();

                if (_logger != null) _logger.LogInformation("Found {Count} schedules", schedules.Count);
                return schedules;
            }
            catch (Exception ex)
            {
                if (_logger != null) _logger.LogError(ex, "Error fetching schedules by date range: {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}
