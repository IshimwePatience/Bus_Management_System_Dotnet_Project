// Controllers/BusesController.cs

using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")] // Enable CORS for this controller     
    public class BusesController : ControllerBase
    {
        private readonly IBusRepository _busRepository;

        public BusesController(IBusRepository busRepository)
        {
            _busRepository = busRepository;
        }

        // GET: api/Buses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusDto>>> GetBuses()
        {
            var buses = await _busRepository.GetAllBusesAsync();
            var busesDto = buses.Select(bus => new BusDto
            {
                BusId = bus.BusId,
                BusNumber = bus.BusNumber,
                Model = bus.Model,
                Capacity = bus.Capacity,
                Status = bus.Status.ToString()
            });

            return Ok(busesDto);
        }

        // GET: api/Buses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BusDto>> GetBus(int id)
        {
            var bus = await _busRepository.GetBusByIdAsync(id);

            if (bus == null)
            {
                return NotFound();
            }

            var busDto = new BusDto
            {
                BusId = bus.BusId,
                BusNumber = bus.BusNumber,
                Model = bus.Model,
                Capacity = bus.Capacity,
                Status = bus.Status.ToString()
            };

            return Ok(busDto);
        }

        // GET: api/Buses/available?date=2025-05-01
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<BusDto>>> GetAvailableBuses([FromQuery] DateTime date)
        {
            var buses = await _busRepository.GetAvailableBusesAsync(date);
            var busesDto = buses.Select(bus => new BusDto
            {
                BusId = bus.BusId,
                BusNumber = bus.BusNumber,
                Model = bus.Model,
                Capacity = bus.Capacity,
                Status = bus.Status.ToString()
            });

            return Ok(busesDto);
        }

        // POST: api/Buses
        [HttpPost]
        public async Task<ActionResult<BusDto>> CreateBus(CreateBusDto createBusDto)
        {
            // Validate input
            if (!Enum.TryParse<BusStatus>(createBusDto.Status, true, out var status))
            {
                return BadRequest("Invalid bus status");
            }

            var bus = new Bus
            {
                BusNumber = createBusDto.BusNumber,
                Model = createBusDto.Model,
                Capacity = createBusDto.Capacity,
                Status = status
            };

            await _busRepository.CreateBusAsync(bus);

            var busDto = new BusDto
            {
                BusId = bus.BusId,
                BusNumber = bus.BusNumber,
                Model = bus.Model,
                Capacity = bus.Capacity,
                Status = bus.Status.ToString()
            };

            return CreatedAtAction(nameof(GetBus), new { id = bus.BusId }, busDto);
        }

        // PUT: api/Buses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBus(int id, CreateBusDto updateBusDto)
        {
            var bus = await _busRepository.GetBusByIdAsync(id);
            if (bus == null)
            {
                return NotFound();
            }

            // Validate input
            if (!Enum.TryParse<BusStatus>(updateBusDto.Status, true, out var status))
            {
                return BadRequest("Invalid bus status");
            }

            bus.BusNumber = updateBusDto.BusNumber;
            bus.Model = updateBusDto.Model;
            bus.Capacity = updateBusDto.Capacity;
            bus.Status = status;

            await _busRepository.UpdateBusAsync(bus);

            return NoContent();
        }

        // DELETE: api/Buses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBus(int id)
        {
            var bus = await _busRepository.GetBusByIdAsync(id);
            if (bus == null)
            {
                return NotFound();
            }

            await _busRepository.DeleteBusAsync(id);

            return NoContent();
        }
    }
}