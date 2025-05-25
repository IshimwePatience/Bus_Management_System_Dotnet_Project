using EverGoWebAPI.Models;

namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IScheduleRepository
    {
        Task<IEnumerable<Schedule>> GetAllSchedulesAsync();
        Task<Schedule> GetScheduleByIdAsync(int id);
        Task<IEnumerable<Schedule>> GetSchedulesByRouteAsync(int routeId);
        Task<IEnumerable<Schedule>> GetSchedulesByBusAsync(int busId);
        Task<IEnumerable<Schedule>> GetSchedulesByDriverAsync(int driverId);
        Task<IEnumerable<Schedule>> GetSchedulesByDateAsync(DateTime date);
        Task<Schedule> CreateScheduleAsync(Schedule schedule);
        Task UpdateScheduleAsync(Schedule schedule);
        Task DeleteScheduleAsync(int id);
        Task<List<Schedule>> GetRecentCompletedTripsAsync();
        Task<IEnumerable<Schedule>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}