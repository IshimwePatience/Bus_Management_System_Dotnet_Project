using EverGoWebAPI.Data;
using EverGoWebAPI.Models.Dashboard.BusManagementApi.Models.Dashboard;
using EverGoWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using EverGoWebAPI.Repositories.Interfaces;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IBusRepository _busRepository;
        private readonly IRouteRepository _routeRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAlertRepository _alertRepository;

        public DashboardController(
            IBusRepository busRepository,
            IRouteRepository routeRepository,
            IBookingRepository bookingRepository,
            IUserRepository userRepository,
            IAlertRepository alertRepository)
        {
            _busRepository = busRepository;
            _routeRepository = routeRepository;
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
            _alertRepository = alertRepository;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<StatsDto>> GetStats()
        {
            try
            {
                var stats = new StatsDto
                {
                    ActiveBuses = await _busRepository.GetActiveBusCountAsync(),
                    TodaysBookings = await _bookingRepository.GetTodaysBookingCountAsync(),
                    TotalRoutes = await _routeRepository.GetTotalRouteCountAsync(),
                    RegisteredDrivers = await _userRepository.GetRegisteredDriverCountAsync()
                };
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard stats", error = ex.Message });
            }
        }

        [HttpGet("alerts")]
        public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlerts()
        {
            try
            {
                var alerts = await _alertRepository.GetAlertsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving alerts", error = ex.Message });
            }
        }

        [HttpGet("latest-bookings")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetLatestBookings()
        {
            try
            {
                var bookings = await _bookingRepository.GetLatestBookingsAsync(5);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving latest bookings", error = ex.Message });
            }
        }
    }
}
