// Repositories/Implementations/BusRepository.cs
using EverGoWebAPI.Models;


namespace EverGoWebAPI.Repositories.Interfaces
{
    public interface IRouteRepository
    {
        Task<IEnumerable<Models.Route>> GetAllRoutesAsync();
        Task<Models.Route> GetRouteByIdAsync(int id);
        Task<Models.Route> CreateRouteAsync(Models.Route route);
        Task UpdateRouteAsync(Models.Route route);
        Task DeleteRouteAsync(int id);
        Task<int> GetTotalRouteCountAsync();
    }
}
