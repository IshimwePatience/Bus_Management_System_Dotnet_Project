namespace EverGoWebAPI.Models.Dashboard
{
    namespace BusManagementApi.Models.Dashboard
    {
        public class StatsDto
        {
            public int ActiveBuses { get; set; }
            public int TodaysBookings { get; set; }
            public int TotalRoutes { get; set; }
            public int RegisteredDrivers { get; set; }
        }

        public class AlertDto
        {
            public string Type { get; set; } // "maintenance" or "trip"
            public string Message { get; set; }
        }
    }
}
