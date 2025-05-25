// Repositories/Implementations/BusRepository.cs
using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class BusRepository : IBusRepository
    {
        private readonly BusManagementContext _context;

        public BusRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Bus>> GetAllBusesAsync()
        {
            return await _context.Buses.ToListAsync();
        }

        public async Task<Bus> GetBusByIdAsync(int id)
        {
            return await _context.Buses.FindAsync(id);
        }

        public async Task<Bus> CreateBusAsync(Bus bus)
        {
            bus.CreatedAt = DateTime.UtcNow;
            _context.Buses.Add(bus);
            await _context.SaveChangesAsync();
            return bus;
        }

        public async Task UpdateBusAsync(Bus bus)
        {
            _context.Entry(bus).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBusAsync(int id)
        {
            var bus = await _context.Buses.FindAsync(id);
            if (bus != null)
            {
                _context.Buses.Remove(bus);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Bus>> GetAvailableBusesAsync(DateTime date)
        {
            var busesInUse = await _context.Schedules
                .Where(s => s.TripDate.Date == date.Date &&
                      (s.Status == ScheduleStatus.Scheduled || s.Status == ScheduleStatus.InProgress))
                .Select(s => s.BusId)
                .ToListAsync();

            var busesInMaintenance = await _context.BusMaintenance
                .Where(m => m.MaintenanceDate.Date == date.Date &&
                      (m.Status == MaintenanceStatus.Scheduled || m.Status == MaintenanceStatus.InProgress))
                .Select(m => m.BusId)
                .ToListAsync();

            return await _context.Buses
                .Where(b => b.Status == BusStatus.Active &&
                      !busesInUse.Contains(b.BusId) &&
                      !busesInMaintenance.Contains(b.BusId))
                .ToListAsync();
        }

        public async Task<int> GetActiveBusCountAsync()
        {
            return await _context.Buses.CountAsync(b => b.Status == BusStatus.Active);
        }
    }
}
