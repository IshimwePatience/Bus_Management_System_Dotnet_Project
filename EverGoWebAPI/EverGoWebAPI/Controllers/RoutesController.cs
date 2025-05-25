using EverGoWebAPI.DTOs;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace EverGoWebAPI.Controllers
{
    // Controllers/RoutesController.cs
    [Route("api/[controller]")]
    [ApiController]
    public class RoutesController : ControllerBase
    {
        private readonly IRouteRepository _routeRepository;

        public RoutesController(IRouteRepository routeRepository)
        {
            _routeRepository = routeRepository;
        }

        // GET: api/Routes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RouteDto>>> GetRoutes()
        {
            var routes = await _routeRepository.GetAllRoutesAsync();
            var routesDto = routes.Select(route => new RouteDto
            {
                RouteId = route.RouteId,
                RouteName = route.RouteName,
                StartLocation = route.StartLocation,
                EndLocation = route.EndLocation,
                PickupPoints = JsonSerializer.Deserialize<List<PickupPointDto>>(route.PickupPoints),
                Price = route.Price
            });

            return Ok(routesDto);
        }

        // GET: api/Routes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RouteDto>> GetRoute(int id)
        {
            var route = await _routeRepository.GetRouteByIdAsync(id);

            if (route == null)
            {
                return NotFound();
            }

            var routeDto = new RouteDto
            {
                RouteId = route.RouteId,
                RouteName = route.RouteName,
                StartLocation = route.StartLocation,
                EndLocation = route.EndLocation,
                PickupPoints = JsonSerializer.Deserialize<List<PickupPointDto>>(route.PickupPoints),
                Price = route.Price
            };

            return Ok(routeDto);
        }

        // POST: api/Routes
        [HttpPost]
        public async Task<ActionResult<RouteDto>> CreateRoute(CreateRouteDto createRouteDto)
        {
            var route = new Models.Route
            {
                RouteName = createRouteDto.RouteName,
                StartLocation = createRouteDto.StartLocation,
                EndLocation = createRouteDto.EndLocation,
                PickupPoints = JsonSerializer.Serialize(createRouteDto.PickupPoints),
                Price = (decimal)createRouteDto.Price
            };

            await _routeRepository.CreateRouteAsync(route);

            var routeDto = new RouteDto
            {
                RouteId = route.RouteId,
                RouteName = route.RouteName,
                StartLocation = route.StartLocation,
                EndLocation = route.EndLocation,
                PickupPoints = JsonSerializer.Deserialize<List<PickupPointDto>>(route.PickupPoints)
            };

            return CreatedAtAction(nameof(GetRoute), new { id = route.RouteId }, routeDto);
        }

        // PUT: api/Routes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoute(int id, CreateRouteDto updateRouteDto)
        {
            var route = await _routeRepository.GetRouteByIdAsync(id);
            if (route == null)
            {
                return NotFound();
            }

            route.RouteName = updateRouteDto.RouteName;
            route.StartLocation = updateRouteDto.StartLocation;
            route.EndLocation = updateRouteDto.EndLocation;
            route.PickupPoints = JsonSerializer.Serialize(updateRouteDto.PickupPoints);
            route.Price = (decimal)updateRouteDto.Price;

            await _routeRepository.UpdateRouteAsync(route);

            return NoContent();
        }

        // DELETE: api/Routes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(int id)
        {
            var route = await _routeRepository.GetRouteByIdAsync(id);
            if (route == null)
            {
                return NotFound();
            }

            await _routeRepository.DeleteRouteAsync(id);

            return NoContent();
        }
    }

}