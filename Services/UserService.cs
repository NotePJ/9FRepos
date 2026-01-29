using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// User Service Implementation
    /// </summary>
    public class UserService : IUserService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(HRBudgetDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════
        // User CRUD
        // ═══════════════════════════════════════════════════════════════

        public async Task<UserDto?> GetByIdAsync(int userId)
        {
            var user = await _context.HRB_USER
                .Where(u => u.UserId == userId)
                .FirstOrDefaultAsync();

            return user == null ? null : await MapToUserDto(user);
        }

        public async Task<UserDto?> GetByEmpCodeAsync(string empCode)
        {
            var user = await _context.HRB_USER
                .Where(u => u.EmpCode == empCode)
                .FirstOrDefaultAsync();

            return user == null ? null : await MapToUserDto(user);
        }

        public async Task<UserDto?> GetByUsernameAsync(string username)
        {
            var user = await _context.HRB_USER
                .Where(u => u.Username == username)
                .FirstOrDefaultAsync();

            return user == null ? null : await MapToUserDto(user);
        }

        public async Task<List<UserDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.HRB_USER.AsQueryable();

            if (!includeInactive)
                query = query.Where(u => u.IsActive);

            var users = await query.OrderBy(u => u.Username).ToListAsync();
            var result = new List<UserDto>();

            foreach (var user in users)
            {
                result.Add(await MapToUserDto(user));
            }

            return result;
        }

        public async Task<UserDto> CreateAsync(UserCreateDto dto, string createdBy)
        {
            var user = new HRB_USER
            {
                EmpCode = dto.EmpCode,
                Username = dto.Username,
                FullName = dto.FullName,
                Email = dto.Email,
                AuthType = dto.AuthType,
                CompanyAccess = dto.CompanyAccess,
                IsActive = true,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now
            };

            if (!string.IsNullOrEmpty(dto.Password) && dto.AuthType == "DB")
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12);
            }

            _context.HRB_USER.Add(user);
            await _context.SaveChangesAsync();

            // Assign roles
            if (dto.RoleIds?.Any() == true)
            {
                foreach (var roleId in dto.RoleIds)
                {
                    await AssignRoleAsync(user.UserId, roleId, createdBy);
                }
            }

            _logger.LogInformation("Created user {Username} by {CreatedBy}", user.Username, createdBy);
            return (await MapToUserDto(user))!;
        }

        public async Task<UserDto> UpdateAsync(UserUpdateDto dto, string updatedBy)
        {
            var user = await _context.HRB_USER.FindAsync(dto.UserId);
            if (user == null)
                throw new KeyNotFoundException($"User {dto.UserId} not found");

            if (dto.FullName != null) user.FullName = dto.FullName;
            if (dto.Email != null) user.Email = dto.Email;
            if (dto.CompanyAccess != null) user.CompanyAccess = dto.CompanyAccess;
            if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

            user.UpdatedBy = updatedBy;
            user.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            // Update roles if provided
            if (dto.RoleIds != null)
            {
                // Revoke all current roles
                var currentRoles = await _context.HRB_USER_ROLE
                    .Where(ur => ur.UserId == dto.UserId && ur.IsActive)
                    .ToListAsync();

                foreach (var ur in currentRoles)
                {
                    ur.IsActive = false;
                    ur.RevokedBy = updatedBy;
                    ur.RevokedDate = DateTime.Now;
                }

                // Assign new roles
                foreach (var roleId in dto.RoleIds)
                {
                    await AssignRoleAsync(dto.UserId, roleId, updatedBy);
                }
            }

            _logger.LogInformation("Updated user {UserId} by {UpdatedBy}", dto.UserId, updatedBy);
            return (await MapToUserDto(user))!;
        }

        public async Task<bool> DeleteAsync(int userId)
        {
            var user = await _context.HRB_USER.FindAsync(userId);
            if (user == null) return false;

            _context.HRB_USER.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetActiveAsync(int userId, bool isActive, string updatedBy)
        {
            var user = await _context.HRB_USER.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = isActive;
            user.UpdatedBy = updatedBy;
            user.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // Role Assignment
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> AssignRoleAsync(int userId, int roleId, string assignedBy, int? companyId = null)
        {
            // Check if already assigned
            var existing = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.RoleId == roleId && ur.CompanyId == companyId)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                if (existing.IsActive) return true; // Already active
                existing.IsActive = true;
                existing.AssignedBy = assignedBy;
                existing.AssignedDate = DateTime.Now;
                existing.RevokedBy = null;
                existing.RevokedDate = null;
            }
            else
            {
                _context.HRB_USER_ROLE.Add(new HRB_USER_ROLE
                {
                    UserId = userId,
                    RoleId = roleId,
                    CompanyId = companyId,
                    IsActive = true,
                    AssignedBy = assignedBy,
                    AssignedDate = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeRoleAsync(int userId, int roleId, string revokedBy)
        {
            var userRole = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.RoleId == roleId && ur.IsActive)
                .FirstOrDefaultAsync();

            if (userRole == null) return false;

            userRole.IsActive = false;
            userRole.RevokedBy = revokedBy;
            userRole.RevokedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<RoleDto>> GetUserRolesAsync(int userId)
        {
            return await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Include(ur => ur.Role)
                .Select(ur => new RoleDto
                {
                    RoleId = ur.Role!.RoleId,
                    RoleCode = ur.Role.RoleCode,
                    RoleName = ur.Role.RoleName,
                    RoleNameTh = ur.Role.RoleNameTh,
                    RoleLevel = ur.Role.RoleLevel,
                    IsActive = ur.Role.IsActive,
                    IsSystem = ur.Role.IsSystem
                })
                .ToListAsync();
        }

        // ═══════════════════════════════════════════════════════════════
        // Permissions
        // ═══════════════════════════════════════════════════════════════

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            // Get all role IDs for user
            var roleIds = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            if (!roleIds.Any()) return new List<string>();

            // Get all permissions for those roles
            return await _context.HRB_ROLE_PERMISSION
                .Where(rp => roleIds.Contains(rp.RoleId) && rp.IsActive)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission!.PermissionCode)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> HasPermissionAsync(int userId, string permissionCode)
        {
            var permissions = await GetUserPermissionsAsync(userId);
            return permissions.Contains(permissionCode);
        }

        // ═══════════════════════════════════════════════════════════════
        // Session Helper
        // ═══════════════════════════════════════════════════════════════

        public async Task<UserSessionDto?> GetUserSessionAsync(string empCode)
        {
            var user = await _context.HRB_USER
                .Where(u => u.EmpCode == empCode || u.Username == empCode)
                .FirstOrDefaultAsync();

            if (user == null) return null;

            var roles = await GetUserRolesAsync(user.UserId);
            var permissions = await GetUserPermissionsAsync(user.UserId);

            return new UserSessionDto
            {
                UserId = user.UserId,
                EmpCode = user.EmpCode,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                AuthType = user.AuthType,
                CompanyAccess = user.CompanyAccess,
                Roles = roles.Select(r => r.RoleCode).ToList(),
                Permissions = permissions
            };
        }

        // ═══════════════════════════════════════════════════════════════
        // Private Helpers
        // ═══════════════════════════════════════════════════════════════

        private async Task<UserDto> MapToUserDto(HRB_USER user)
        {
            var roles = await GetUserRolesAsync(user.UserId);
            var permissions = await GetUserPermissionsAsync(user.UserId);

            return new UserDto
            {
                UserId = user.UserId,
                EmpCode = user.EmpCode,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                AuthType = user.AuthType,
                CompanyAccess = user.CompanyAccess,
                IsActive = user.IsActive,
                IsLocked = user.IsLocked,
                LastLoginDate = user.LastLoginDate,
                Roles = roles,
                Permissions = permissions
            };
        }
    }
}
