using System.Globalization;
using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IBusRepository _busRepository;
        private readonly IRouteRepository _routeRepository;
        private readonly IUserRepository _userRepository;

        public SchedulesController(
            IScheduleRepository scheduleRepository,
            IBusRepository busRepository,
            IRouteRepository routeRepository,
            IUserRepository userRepository)
        {
            _scheduleRepository = scheduleRepository;
            _busRepository = busRepository;
            _routeRepository = routeRepository;
            _userRepository = userRepository;
        }

        // GET: api/Schedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedules()
        {
            var schedules = await _scheduleRepository.GetAllSchedulesAsync();
            var schedulesDto = await MapSchedulesToDto(schedules);
            return Ok(schedulesDto);
        }

        // GET: api/Schedules/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleDto>> GetSchedule(int id)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            var scheduleDto = await MapScheduleToDto(schedule);
            return Ok(scheduleDto);
        }

        // GET: api/Schedules/date?date=2025-05-01
        [HttpGet("date")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedulesByDate([FromQuery] DateTime date)
        {
            var schedules = await _scheduleRepository.GetSchedulesByDateAsync(date);
            var schedulesDto = await MapSchedulesToDto(schedules);
            return Ok(schedulesDto);
        }

        // GET: api/Schedules/date-range?start=2025-01-01&end=2025-05-25
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedulesByDateRange([FromQuery] string start, [FromQuery] string end)
        {
            try
            {
                if (!DateTime.TryParseExact(start, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var startDate) ||
                    !DateTime.TryParseExact(end, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var endDate))
                {
                    return BadRequest("Invalid date format. Use YYYY-MM-DD format (e.g., 2025-01-01).");
                }

                if (startDate > endDate)
                {
                    return BadRequest("Start date must be before end date.");
                }

                var schedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
                var schedulesDto = await MapSchedulesToDto(schedules);
                return Ok(schedulesDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching schedules.", detail = ex.Message });
            }
        }

        // GET: api/Schedules/route/5
        [HttpGet("route/{routeId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedulesByRoute(int routeId)
        {
            var route = await _routeRepository.GetRouteByIdAsync(routeId);
            if (route == null)
            {
                return NotFound("Route not found");
            }

            var schedules = await _scheduleRepository.GetSchedulesByRouteAsync(routeId);
            var schedulesDto = await MapSchedulesToDto(schedules);
            return Ok(schedulesDto);
        }

        // GET: api/Schedules/driver/5
        [HttpGet("driver/{driverId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedulesByDriver(int driverId)
        {
            var driver = await _userRepository.GetUserByIdAsync(driverId);
            if (driver == null || driver.Role != UserRole.Driver)
            {
                return NotFound("Driver not found");
            }

            var schedules = await _scheduleRepository.GetSchedulesByDriverAsync(driverId);
            var schedulesDto = await MapSchedulesToDto(schedules);
            return Ok(schedulesDto);
        }

        // POST: api/Schedules
        [HttpPost]
        public async Task<ActionResult<ScheduleDto>> CreateSchedule(CreateScheduleDto createScheduleDto)
        {
            // Validate input
            var bus = await _busRepository.GetBusByIdAsync(createScheduleDto.BusId);
            if (bus == null)
            {
                return BadRequest("Invalid bus ID");
            }

            var route = await _routeRepository.GetRouteByIdAsync(createScheduleDto.RouteId);
            if (route == null)
            {
                return BadRequest("Invalid route ID");
            }

            var driver = await _userRepository.GetUserByIdAsync(createScheduleDto.DriverId);
            if (driver == null || driver.Role != UserRole.Driver)
            {
                return BadRequest("Invalid driver ID");
            }

            // Parse departure time and trip date
            if (!TimeSpan.TryParse(createScheduleDto.DepartureTime, out var departureTime))
            {
                return BadRequest("Invalid departure time format. Use HH:MM:SS format.");
            }

            if (!DateTime.TryParse(createScheduleDto.TripDate, out var tripDate))
            {
                return BadRequest("Invalid trip date format. Use YYYY-MM-DD format.");
            }

            var schedule = new Schedule
            {
                RouteId = createScheduleDto.RouteId,
                BusId = createScheduleDto.BusId,
                DriverId = createScheduleDto.DriverId,
                DepartureTime = departureTime,
                TripDate = tripDate,
                Status = ScheduleStatus.Scheduled,
                Price = route.Price, // Set Price from Route for new schedules
                CreatedAt = DateTime.UtcNow
            };

            await _scheduleRepository.CreateScheduleAsync(schedule);

            var scheduleDto = await MapScheduleToDto(schedule);
            return CreatedAtAction(nameof(GetSchedule), new { id = schedule.ScheduleId }, scheduleDto);
        }

        // PUT: api/Schedules/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateScheduleDto updateScheduleDto)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            // Validate input
            var bus = await _busRepository.GetBusByIdAsync(updateScheduleDto.BusId);
            if (bus == null)
            {
                return BadRequest("Invalid bus ID");
            }

            var route = await _routeRepository.GetRouteByIdAsync(updateScheduleDto.RouteId);
            if (route == null)
            {
                return BadRequest("Invalid route ID");
            }

            var driver = await _userRepository.GetUserByIdAsync(updateScheduleDto.DriverId);
            if (driver == null || driver.Role != UserRole.Driver)
            {
                return BadRequest("Invalid driver ID");
            }

            // Parse departure time and trip date
            if (!TimeSpan.TryParse(updateScheduleDto.DepartureTime, out var departureTime))
            {
                return BadRequest("Invalid departure time format. Use HH:MM:SS format.");
            }

            if (!DateTime.TryParse(updateScheduleDto.TripDate, out var tripDate))
            {
                return BadRequest("Invalid trip date format. Use YYYY-MM-DD format.");
            }

            if (!Enum.TryParse<ScheduleStatus>(updateScheduleDto.Status, true, out var scheduleStatus))
            {
                return BadRequest("Invalid schedule status");
            }

            // Update schedule properties
            schedule.RouteId = updateScheduleDto.RouteId;
            schedule.BusId = updateScheduleDto.BusId;
            schedule.DriverId = updateScheduleDto.DriverId;
            schedule.DepartureTime = departureTime;
            schedule.TripDate = tripDate;
            schedule.Status = scheduleStatus;
            schedule.Price = route.Price; // Update Price from Route

            // Update actual departure/arrival times based on status (if not already set)
            if (scheduleStatus == ScheduleStatus.InProgress && !schedule.ActualDepartureTime.HasValue)
            {
                schedule.ActualDepartureTime = DateTime.UtcNow;
            }
            else if (scheduleStatus == ScheduleStatus.Completed && !schedule.ActualArrivalTime.HasValue)
            {
                schedule.ActualArrivalTime = DateTime.UtcNow;
            }

            await _scheduleRepository.UpdateScheduleAsync(schedule);

            return NoContent();
        }

        // PUT: api/Schedules/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateScheduleStatus(int id, [FromBody] string status)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            if (!Enum.TryParse<ScheduleStatus>(status, true, out var scheduleStatus))
            {
                return BadRequest("Invalid schedule status");
            }

            schedule.Status = scheduleStatus;

            // Update actual departure/arrival times based on status
            if (scheduleStatus == ScheduleStatus.InProgress && !schedule.ActualDepartureTime.HasValue)
            {
                schedule.ActualDepartureTime = DateTime.UtcNow;
            }
            else if (scheduleStatus == ScheduleStatus.Completed && !schedule.ActualArrivalTime.HasValue)
            {
                schedule.ActualArrivalTime = DateTime.UtcNow;
            }

            await _scheduleRepository.UpdateScheduleAsync(schedule);

            return NoContent();
        }

        // DELETE: api/Schedules/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            await _scheduleRepository.DeleteScheduleAsync(id);

            return NoContent();
        }

        // Helper methods
        private async Task<ScheduleDto> MapScheduleToDto(Schedule schedule)
        {
            var bus = await _busRepository.GetBusByIdAsync(schedule.BusId);
            var route = await _routeRepository.GetRouteByIdAsync(schedule.RouteId);
            var driver = await _userRepository.GetUserByIdAsync(schedule.DriverId);

            return new ScheduleDto
            {
                ScheduleId = schedule.ScheduleId,
                RouteId = schedule.RouteId,
                RouteName = route?.RouteName ?? "N/A",
                BusId = schedule.BusId,
                BusNumber = bus?.BusNumber ?? "N/A",
                DriverId = schedule.DriverId,
                DriverName = driver != null ? driver.Name : "N/A",
                DepartureTime = schedule.DepartureTime.ToString(),
                TripDate = schedule.TripDate.ToString("yyyy-MM-dd"),
                Price = schedule.Price, // Use Schedule.Price instead of Route.Price
                Status = schedule.Status.ToString(),
                ActualDepartureTime = schedule.ActualDepartureTime?.ToString("yyyy-MM-dd HH:mm:ss"),
                ActualArrivalTime = schedule.ActualArrivalTime?.ToString("yyyy-MM-dd HH:mm:ss")
            };
        }

        private async Task<List<ScheduleDto>> MapSchedulesToDto(IEnumerable<Schedule> schedules)
        {
            var schedulesDto = new List<ScheduleDto>();
            foreach (var schedule in schedules)
            {
                schedulesDto.Add(await MapScheduleToDto(schedule));
            }
            return schedulesDto;
        }
    }
}