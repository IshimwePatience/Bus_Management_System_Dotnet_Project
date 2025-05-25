using EverGoWebAPI.Models;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IBusMaintenanceRepository
    {
        Task<IEnumerable<BusMaintenance>> GetAllMaintenanceRecordsAsync();
        Task<BusMaintenance> GetMaintenanceRecordByIdAsync(int id);
        Task<IEnumerable<BusMaintenance>> GetMaintenanceRecordsByBusAsync(int busId);
        Task<BusMaintenance> CreateMaintenanceRecordAsync(BusMaintenance maintenance);
        Task UpdateMaintenanceRecordAsync(BusMaintenance maintenance);
        Task DeleteMaintenanceRecordAsync(int id);
    }
}
