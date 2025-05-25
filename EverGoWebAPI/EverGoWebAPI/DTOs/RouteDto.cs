namespace EverGoWebAPI.DTOs
{
    public class RouteDto
    {
        public int RouteId { get; set; }
        public string? RouteName { get; set; }
        public string? StartLocation { get; set; }
        public string? EndLocation { get; set; }
        public List<PickupPointDto>? PickupPoints { get; set; }
        public decimal? Price { get; set; }

    }

    public class CreateRouteDto
    {
        public string? RouteName { get; set; }
        public string? StartLocation { get; set; }
        public string? EndLocation { get; set; }
        public List<PickupPointDto>? PickupPoints { get; set; }
        public decimal? Price { get; set; }

    }

    public class PickupPointDto
    {
        public string?  Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
