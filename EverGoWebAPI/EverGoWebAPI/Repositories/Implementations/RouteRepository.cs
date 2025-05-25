using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using EverGoWebAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class RouteRepository : IRouteRepository
    {
        private readonly BusManagementContext _context;

        public RouteRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Models.Route>> GetAllRoutesAsync()
        {
            return await _context.Routes.ToListAsync();
        }

        public async Task<Models.Route> GetRouteByIdAsync(int id)
        {
            return await _context.Routes.FindAsync(id);
        }

        public async Task<Models.Route> CreateRouteAsync(Models.Route route)
        {
            route.CreatedAt = DateTime.UtcNow;
            _context.Routes.Add(route);
            await _context.SaveChangesAsync();
            return route;
        }

        public async Task UpdateRouteAsync(Models.Route route)
        {
            _context.Entry(route).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRouteAsync(int id)
        {
            var route = await _context.Routes.FindAsync(id);
            if (route != null)
            {
                _context.Routes.Remove(route);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetTotalRouteCountAsync()
        {
            return await _context.Routes.CountAsync();
        }

    }
}
