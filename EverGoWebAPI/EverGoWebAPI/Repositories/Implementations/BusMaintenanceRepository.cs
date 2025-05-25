
using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class BusMaintenanceRepository : IBusMaintenanceRepository
    {
        private readonly BusManagementContext _context;

        public BusMaintenanceRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BusMaintenance>> GetAllMaintenanceRecordsAsync()
        {
            return await _context.BusMaintenance
                .Include(m => m.Bus)
                .ToListAsync();
        }

        public async Task<BusMaintenance> GetMaintenanceRecordByIdAsync(int id)
        {
            return await _context.BusMaintenance
                .Include(m => m.Bus)
                .FirstOrDefaultAsync(m => m.MaintenanceId == id);
        }

        public async Task<IEnumerable<BusMaintenance>> GetMaintenanceRecordsByBusAsync(int busId)
        {
            return await _context.BusMaintenance
                .Where(m => m.BusId == busId)
                .ToListAsync();
        }

        public async Task<BusMaintenance> CreateMaintenanceRecordAsync(BusMaintenance maintenance)
        {
            maintenance.CreatedAt = DateTime.UtcNow;
            _context.BusMaintenance.Add(maintenance);
            await _context.SaveChangesAsync();
            return maintenance;
        }

        public async Task UpdateMaintenanceRecordAsync(BusMaintenance maintenance)
        {
            _context.Entry(maintenance).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMaintenanceRecordAsync(int id)
        {
            var maintenance = await _context.BusMaintenance.FindAsync(id);
            if (maintenance != null)
            {
                _context.BusMaintenance.Remove(maintenance);
                await _context.SaveChangesAsync();
            }
        }
    }
}
