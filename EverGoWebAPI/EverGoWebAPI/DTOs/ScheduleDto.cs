namespace EverGoWebAPI.DTOs
{
    public class ScheduleDto
    {
        public int ScheduleId { get; set; }
        public int RouteId { get; set; }
        public string? RouteName { get; set; }
        public int BusId { get; set; }
        public string? BusNumber { get; set; }
        public int DriverId { get; set; }
        public string? DriverName { get; set; }
        public string? DepartureTime { get; set; }
        public string? TripDate { get; set; }
        public string? Status { get; set; }
        public decimal? Price { get; set; }
        public string? ActualDepartureTime { get; set; }
        public string? ActualArrivalTime { get; set; }
    }

    public class CreateScheduleDto
    {
        public int RouteId { get; set; }
        public int BusId { get; set; }
        public int DriverId { get; set; }
        public string? DepartureTime { get; set; }
        public string? TripDate { get; set; }
    }

    public class UpdateScheduleDto
    {
        public int RouteId { get; set; }
        public int BusId { get; set; }
        public int DriverId { get; set; }
        public string DepartureTime { get; set; }
        public string TripDate { get; set; }
        public string Status { get; set; }
    }
}