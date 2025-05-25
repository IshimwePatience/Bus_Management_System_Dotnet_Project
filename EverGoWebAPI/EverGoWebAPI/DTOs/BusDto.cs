namespace EverGoWebAPI.DTOs
{
    public class BusDto
    {
        public int BusId { get; set; }
        public string? BusNumber { get; set; }
        public string? Model { get; set; }
        public int Capacity { get; set; }
        public string? Status { get; set; }
    }

    public class CreateBusDto
    {
        public string? BusNumber { get; set; }
        public string? Model { get; set; }
        public int Capacity { get; set; }
        public string? Status { get; set; }
    }
}
