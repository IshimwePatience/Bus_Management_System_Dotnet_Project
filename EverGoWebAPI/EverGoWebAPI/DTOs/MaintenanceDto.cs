namespace EverGoWebAPI.DTOs
{
    public class MaintenanceDto
    {
        public int MaintenanceId { get; set; }
        public int BusId { get; set; }
        public string? BusNumber { get; set; }
        public string? MaintenanceDate { get; set; }
        public string? Description { get; set; }
        public decimal? Cost { get; set; }
        public string? Status { get; set; }
    }

    public class CreateMaintenanceDto
    {
        public int? BusId { get; set; }
        public string? MaintenanceDate { get; set; }
        public string? Description { get; set; }
        public decimal? Cost { get; set; }
    }
}