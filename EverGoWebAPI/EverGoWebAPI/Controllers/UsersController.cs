using EverGoWebAPI.DTOs;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using EverGoWebAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;

namespace EverGoWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private static readonly ConcurrentDictionary<string, string> OtpStore = new();

        public UsersController(
            IUserRepository userRepository,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            var usersDto = users.Select(user => new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            });

            return Ok(usersDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            };

            return Ok(userDto);
        }

        [HttpGet("drivers")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetDrivers()
        {
            var users = await _userRepository.GetUsersByRoleAsync(UserRole.Driver);
            var usersDto = users.Select(user => new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            });

            return Ok(usersDto);
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token.");
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            };

            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
        {
            if (!Enum.TryParse<UserRole>(createUserDto.Role, true, out var role))
            {
                return BadRequest("Invalid user role");
            }

            var user = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                Phone = createUserDto.Phone,
                Password = (role != UserRole.Customer || !createUserDto.IsGuest) ? HashPassword(createUserDto.Password) : null,
                Role = role,
                IsGuest = createUserDto.IsGuest,
                LicenseNumber = role == UserRole.Driver ? createUserDto.LicenseNumber : null,
                LicenseImage = role == UserRole.Driver ? createUserDto.LicenseImage : null,
                LicenseExpiry = role == UserRole.Driver ? createUserDto.LicenseExpiry : null,
                DriverStatus = role == UserRole.Driver ? Models.DriverStatus.Inactive : null,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, userDto);
        }

        [HttpPost("register-driver")]
        public async Task<ActionResult<UserDto>> RegisterDriver(CreateUserDto createUserDto)
        {
            if (!Enum.TryParse<UserRole>("Driver", true, out var role))
            {
                return BadRequest("Invalid role for driver registration");
            }

            var user = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                Phone = createUserDto.Phone,
                Password = createUserDto.Password != null ? HashPassword(createUserDto.Password) : null,
                Role = role,
                IsGuest = false,
                LicenseNumber = createUserDto.LicenseNumber,
                LicenseImage = createUserDto.LicenseImage,
                LicenseExpiry = createUserDto.LicenseExpiry,
                DriverStatus = DriverStatus.Inactive,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                IsGuest = user.IsGuest,
                LicenseNumber = user.LicenseNumber,
                LicenseImage = user.LicenseImage,
                LicenseExpiry = user.LicenseExpiry,
                DriverStatus = user.DriverStatus?.ToString()
            };

            return Ok(new { message = "Driver registration successful. Awaiting admin approval.", user = userDto });
        }

        [HttpPost("login-step1")]
        public async Task<ActionResult> LoginStep1([FromBody] LoginDto loginDto)
        {
            Console.WriteLine($"Login attempt for email: {loginDto.Email} at {DateTime.UtcNow}");
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);
            if (user == null)
            {
                Console.WriteLine("User not found.");
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!VerifyPassword(loginDto.Password, user.Password))
            {
                Console.WriteLine("Password verification failed.");
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (user.Role == UserRole.Driver && user.DriverStatus != DriverStatus.Active)
            {
                return Unauthorized(new { message = "Your account is not active. Please contact the admin." });
            }

            CleanUpExpiredOtps();

            string otp = GenerateOtp();
            OtpStore[loginDto.Email] = otp;
            OtpStore[loginDto.Email + "_Expiry"] = DateTime.UtcNow.AddMinutes(5).ToString();

            try
            {
                await _emailService.SendVerificationEmailAsync(loginDto.Email, user.Name ?? loginDto.Email, otp);
                Console.WriteLine($"Sent OTP for {loginDto.Email}: {otp} at {DateTime.UtcNow}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
                return StatusCode(500, new { message = "Failed to send OTP. Please try again later." });
            }

            return Ok(new { message = "OTP sent to your email. Please verify." });
        }

        [HttpPost("verify-otp")]
        public async Task<ActionResult> VerifyOtp([FromBody] OtpVerificationDto otpVerificationDto)
        {
            Console.WriteLine($"Verifying OTP for email: {otpVerificationDto.Email} at {DateTime.UtcNow}");
            CleanUpExpiredOtps();

            string storedOtp = OtpStore.GetValueOrDefault(otpVerificationDto.Email);
            string expiry = OtpStore.GetValueOrDefault(otpVerificationDto.Email + "_Expiry");

            if (string.IsNullOrEmpty(storedOtp) || string.IsNullOrEmpty(expiry) || DateTime.UtcNow > DateTime.Parse(expiry))
            {
                Console.WriteLine("OTP is invalid or expired.");
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            if (storedOtp != otpVerificationDto.Otp)
            {
                Console.WriteLine($"OTP mismatch. Provided: {otpVerificationDto.Otp}, Stored: {storedOtp}");
                return BadRequest(new { message = "Incorrect OTP." });
            }

            var user = await _userRepository.GetUserByEmailAsync(otpVerificationDto.Email);
            if (user == null)
            {
                Console.WriteLine("User not found during OTP verification.");
                return Unauthorized(new { message = "User not found." });
            }

            var token = GenerateJwtToken(user);
            OtpStore.TryRemove(otpVerificationDto.Email, out _);
            OtpStore.TryRemove(otpVerificationDto.Email + "_Expiry", out _);

            Console.WriteLine($"Generated JWT for {user.Email}: {token}");
            return Ok(new { token });
        }

        [HttpPost("verify")]
        public IActionResult VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            return BadRequest("Email verification is no longer required.");
        }

        [HttpGet("approve-driver")]
        public IActionResult ApproveDriver(string token, int userId)
        {
            return BadRequest("Admin approval is no longer required.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                // Log the incoming data for debugging
                Console.WriteLine($"Received update data for user {id}: {Newtonsoft.Json.JsonConvert.SerializeObject(updateUserDto)}");

                // Check model validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    Console.WriteLine($"Model validation failed: {string.Join(", ", errors)}");
                    return BadRequest(new { message = "Validation failed", errors });
                }

                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"User with ID {id} not found.");
                    return NotFound("User not found");
                }

                if (!Enum.TryParse<UserRole>(updateUserDto.Role, true, out var role))
                {
                    Console.WriteLine($"Invalid user role: {updateUserDto.Role}");
                    return BadRequest(new { message = "Invalid user role" });
                }

                // Validation for Driver role
                if (role == UserRole.Driver)
                {
                    if (string.IsNullOrEmpty(updateUserDto.LicenseNumber))
                    {
                        Console.WriteLine("LicenseNumber is required for Driver role.");
                        return BadRequest(new { message = "LicenseNumber is required for Driver role." });
                    }
                    // Optionally enforce LicenseImage for Driver role
                    // if (string.IsNullOrEmpty(updateUserDto.LicenseImage))
                    // {
                    //     Console.WriteLine("LicenseImage is required for Driver role.");
                    //     return BadRequest(new { message = "LicenseImage is required for Driver role." });
                    // }
                }

                user.Name = updateUserDto.Name;
                user.Email = updateUserDto.Email;
                user.Phone = updateUserDto.Phone;
                user.Role = role;
                user.IsGuest = updateUserDto.IsGuest;
                user.LicenseNumber = role == UserRole.Driver ? updateUserDto.LicenseNumber : null;
                user.LicenseImage = role == UserRole.Driver ? updateUserDto.LicenseImage : null;
                user.LicenseExpiry = role == UserRole.Driver ? updateUserDto.LicenseExpiry : null;

                await _userRepository.UpdateUserAsync(user);
                Console.WriteLine($"User {id} updated successfully.");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user {id}: {ex.Message} - StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = $"Update failed: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/driverstatus")]
        public async Task<IActionResult> UpdateDriverStatus(int id, [FromBody] string status)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null || user.Role != UserRole.Driver)
            {
                return NotFound("Driver not found");
            }

            if (!Enum.TryParse<Models.DriverStatus>(status, true, out var driverStatus))
            {
                return BadRequest("Invalid driver status");
            }

            user.DriverStatus = driverStatus;
            await _userRepository.UpdateUserAsync(user);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            await _userRepository.DeleteUserAsync(id);

            return NoContent();
        }

        private string GenerateOtp()
        {
            Random random = new();
            return random.Next(100000, 999999).ToString();
        }

        private void CleanUpExpiredOtps()
        {
            var expiredKeys = OtpStore
                .Where(kvp => kvp.Key.EndsWith("_Expiry") && DateTime.UtcNow > DateTime.Parse(kvp.Value))
                .Select(kvp => kvp.Key.Replace("_Expiry", ""))
                .ToList();
            foreach (var key in expiredKeys)
            {
                OtpStore.TryRemove(key, out _);
                OtpStore.TryRemove(key + "_Expiry", out _);
            }
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                Console.WriteLine("JWT Key is missing in configuration.");
                throw new InvalidOperationException("JWT Key is not configured.");
            }

            var claims = new[]
            {
                new Claim("id", user.UserId.ToString()),
                new Claim("email", user.Email ?? ""),
                new Claim("name", user.Name ?? ""),
                new Claim("role", user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "DefaultIssuer",
                audience: _configuration["Jwt:Audience"] ?? "DefaultAudience",
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class OtpVerificationDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }

    public class VerifyEmailDto
    {
        public string Email { get; set; }
        public string Token { get; set; }
    }

    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public string Role { get; set; }

        public bool IsGuest { get; set; }

        public string? LicenseNumber { get; set; }
        public string? LicenseImage { get; set; }
        public DateTime? LicenseExpiry { get; set; }
    }
}