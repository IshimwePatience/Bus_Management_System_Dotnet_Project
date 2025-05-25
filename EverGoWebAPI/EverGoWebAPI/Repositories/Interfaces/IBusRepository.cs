using EverGoWebAPI.Models;


namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IBusRepository
    {
        Task<IEnumerable<Bus>> GetAllBusesAsync();
        Task<Bus> GetBusByIdAsync(int id);
        Task<Bus> CreateBusAsync(Bus bus);
        Task UpdateBusAsync(Bus bus);
        Task DeleteBusAsync(int id);
        Task<IEnumerable<Bus>> GetAvailableBusesAsync(DateTime date);
        Task<int> GetActiveBusCountAsync();
    }
}