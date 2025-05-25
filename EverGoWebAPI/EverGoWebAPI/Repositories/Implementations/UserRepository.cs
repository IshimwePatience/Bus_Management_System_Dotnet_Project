
using EverGoWebAPI.Data;
using EverGoWebAPI.Models;
using EverGoWebAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EverGoWebAPI.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly BusManagementContext _context;

        public UserRepository(BusManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
        {
            return await _context.Users
                                 .Where(u => u.Role == role)
                                 .ToListAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetRegisteredDriverCountAsync()
        {
            return await _context.Users
                .CountAsync(u => u.Role == UserRole.Driver);
        }
    }
}
