using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Models.Dashboard.BusManagementApi.Models.Dashboard;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class AlertRepository : IAlertRepository
    {
        private readonly BusManagementContext _context;

        public AlertRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<List<AlertDto>> GetAlertsAsync()
        {
            var alerts = new List<AlertDto>();

            // Maintenance Alerts
            var busesNeedingMaintenance = await _context.Buses
                .Where(b => b.Status == BusStatus.Maintenance)
                .ToListAsync();
            foreach (var bus in busesNeedingMaintenance)
            {
                alerts.Add(new AlertDto
                {
                    Type = "maintenance",
                    Message = $"Request for maintenance: Bus {bus.BusNumber} requires assistance."
                });
            }

            var busesOutOfService = await _context.Buses
                .Where(b => b.Status == BusStatus.OutOfService)
                .ToListAsync();
            foreach (var bus in busesOutOfService)
            {
                alerts.Add(new AlertDto
                {
                    Type = "OutOfService",
                    Message = $"Bus Out Of Service: Bus {bus.BusNumber} is  Out of Service."
                });
            }

            // Trip Notifications
            var todaySchedules = await _context.Schedules
                .Where(s => s.TripDate.Date == DateTime.Today)
                .Include(s => s.Route)
                .ToListAsync();

            var completedTrips = todaySchedules
                .Where(s => s.TripDate.Date + s.DepartureTime < DateTime.UtcNow)
                .Take(2);

            foreach (var trip in completedTrips)
            {
                alerts.Add(new AlertDto
                {
                    Type = "trip",
                    Message = $"Trip Notification: Trip for route #{trip.Route?.RouteName} arrived at the destination."
                });
            }

            return alerts;
        }
    }
}
