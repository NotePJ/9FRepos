using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Role Service Implementation
    /// จัดการ Roles และ Role-Permission Mapping
    /// </summary>
    public class RoleService : IRoleService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<RoleService> _logger;

        public RoleService(HRBudgetDbContext context, ILogger<RoleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════
        // Role CRUD
        // ═══════════════════════════════════════════════════════════════

        public async Task<List<RoleDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.HRB_ROLE.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(r => r.IsActive);
            }

            var roles = await query.OrderBy(r => r.RoleLevel).ToListAsync();

            var result = new List<RoleDto>();
            foreach (var role in roles)
            {
                var dto = MapToDto(role);
                dto.Permissions = await GetRolePermissionsAsync(role.RoleId);
                result.Add(dto);
            }

            return result;
        }

        public async Task<RoleDto?> GetByIdAsync(int roleId)
        {
            var role = await _context.HRB_ROLE.FindAsync(roleId);
            if (role == null) return null;

            var dto = MapToDto(role);
            dto.Permissions = await GetRolePermissionsAsync(roleId);
            return dto;
        }

        public async Task<RoleDto?> GetByNameAsync(string roleName)
        {
            var role = await _context.HRB_ROLE
                .FirstOrDefaultAsync(r => r.RoleName == roleName || r.RoleCode == roleName);

            if (role == null) return null;

            var dto = MapToDto(role);
            dto.Permissions = await GetRolePermissionsAsync(role.RoleId);
            return dto;
        }

        public async Task<RoleDto> CreateAsync(RoleCreateDto dto, string createdBy)
        {
            var role = new HRB_ROLE
            {
                RoleCode = dto.RoleCode,
                RoleName = dto.RoleName,
                RoleNameTh = dto.RoleNameTh,
                Description = dto.Description,
                RoleLevel = dto.RoleLevel,
                IsActive = true,
                IsSystem = false,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now
            };

            _context.HRB_ROLE.Add(role);
            await _context.SaveChangesAsync();

            // Assign permissions if provided
            if (dto.PermissionIds != null && dto.PermissionIds.Any())
            {
                await UpdatePermissionsAsync(role.RoleId, dto.PermissionIds, createdBy);
            }

            return (await GetByIdAsync(role.RoleId))!;
        }

        public async Task<RoleDto?> UpdateAsync(int roleId, RoleCreateDto dto, string updatedBy)
        {
            var role = await _context.HRB_ROLE.FindAsync(roleId);
            if (role == null) return null;

            role.RoleCode = dto.RoleCode;
            role.RoleName = dto.RoleName;
            role.RoleNameTh = dto.RoleNameTh;
            role.Description = dto.Description;
            role.RoleLevel = dto.RoleLevel;
            role.UpdatedBy = updatedBy;
            role.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            // Update permissions if provided
            if (dto.PermissionIds != null)
            {
                await UpdatePermissionsAsync(roleId, dto.PermissionIds, updatedBy);
            }

            return await GetByIdAsync(roleId);
        }

        public async Task<bool> DeleteAsync(int roleId)
        {
            var role = await _context.HRB_ROLE.FindAsync(roleId);
            if (role == null) return false;

            // Cannot delete system roles
            if (role.IsSystem)
            {
                _logger.LogWarning("Attempted to delete system role {RoleId}", roleId);
                return false;
            }

            // Soft delete
            role.IsActive = false;
            role.UpdatedDate = DateTime.Now;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsSystemRoleAsync(int roleId)
        {
            var role = await _context.HRB_ROLE.FindAsync(roleId);
            return role?.IsSystem ?? false;
        }

        // ═══════════════════════════════════════════════════════════════
        // Permission Assignment
        // ═══════════════════════════════════════════════════════════════

        public async Task<List<PermissionDto>> GetRolePermissionsAsync(int roleId)
        {
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => rp.RoleId == roleId && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            var permissions = await _context.HRB_PERMISSION
                .Where(p => permissionIds.Contains(p.PermissionId) && p.IsActive)
                .OrderBy(p => p.Category)
                .ThenBy(p => p.SortOrder)
                .ToListAsync();

            return permissions.Select(MapPermissionToDto).ToList();
        }

        public async Task<List<string>> GetRolePermissionCodesAsync(int roleId)
        {
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => rp.RoleId == roleId && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            return await _context.HRB_PERMISSION
                .Where(p => permissionIds.Contains(p.PermissionId) && p.IsActive)
                .Select(p => p.PermissionCode)
                .ToListAsync();
        }

        public async Task<bool> AssignPermissionAsync(int roleId, int permissionId, string assignedBy)
        {
            try
            {
                // Check if already assigned
                var existing = await _context.HRB_ROLE_PERMISSION
                    .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

                if (existing != null)
                {
                    if (!existing.IsActive)
                    {
                        existing.IsActive = true;
                        await _context.SaveChangesAsync();
                    }
                    return true;
                }

                var rolePermission = new HRB_ROLE_PERMISSION
                {
                    RoleId = roleId,
                    PermissionId = permissionId,
                    IsActive = true,
                    CreatedBy = assignedBy,
                    CreatedDate = DateTime.Now
                };

                _context.HRB_ROLE_PERMISSION.Add(rolePermission);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission {PermissionId} to role {RoleId}", permissionId, roleId);
                return false;
            }
        }

        public async Task<bool> RevokePermissionAsync(int roleId, int permissionId, string revokedBy)
        {
            try
            {
                var rolePermission = await _context.HRB_ROLE_PERMISSION
                    .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

                if (rolePermission == null) return true;

                rolePermission.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking permission {PermissionId} from role {RoleId}", permissionId, roleId);
                return false;
            }
        }

        public async Task<bool> UpdatePermissionsAsync(int roleId, List<int> permissionIds, string updatedBy)
        {
            try
            {
                // Get current permissions
                var currentPermissions = await _context.HRB_ROLE_PERMISSION
                    .Where(rp => rp.RoleId == roleId)
                    .ToListAsync();

                // Deactivate removed permissions
                foreach (var current in currentPermissions)
                {
                    if (!permissionIds.Contains(current.PermissionId))
                    {
                        current.IsActive = false;
                    }
                    else
                    {
                        current.IsActive = true;
                    }
                }

                // Add new permissions
                var currentIds = currentPermissions.Select(cp => cp.PermissionId).ToList();
                var newIds = permissionIds.Where(id => !currentIds.Contains(id)).ToList();

                foreach (var newId in newIds)
                {
                    _context.HRB_ROLE_PERMISSION.Add(new HRB_ROLE_PERMISSION
                    {
                        RoleId = roleId,
                        PermissionId = newId,
                        IsActive = true,
                        CreatedBy = updatedBy,
                        CreatedDate = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permissions for role {RoleId}", roleId);
                return false;
            }
        }

        public async Task<bool> HasPermissionAsync(int roleId, string permissionCode)
        {
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => rp.RoleId == roleId && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            return await _context.HRB_PERMISSION
                .AnyAsync(p => permissionIds.Contains(p.PermissionId) &&
                              p.PermissionCode == permissionCode &&
                              p.IsActive);
        }

        // ═══════════════════════════════════════════════════════════════
        // User Count
        // ═══════════════════════════════════════════════════════════════

        public async Task<int> GetUserCountAsync(int roleId)
        {
            return await _context.HRB_USER_ROLE
                .CountAsync(ur => ur.RoleId == roleId && ur.IsActive);
        }

        public async Task<List<UserDto>> GetUsersWithRoleAsync(int roleId)
        {
            var userIds = await _context.HRB_USER_ROLE
                .Where(ur => ur.RoleId == roleId && ur.IsActive)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var users = await _context.HRB_USER
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            return users.Select(u => new UserDto
            {
                UserId = u.UserId,
                EmpCode = u.EmpCode,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                AuthType = u.AuthType,
                IsActive = u.IsActive,
                IsLocked = u.IsLocked,
                LastLoginDate = u.LastLoginDate
            }).ToList();
        }

        // ═══════════════════════════════════════════════════════════════
        // Private Methods
        // ═══════════════════════════════════════════════════════════════

        private RoleDto MapToDto(HRB_ROLE role)
        {
            return new RoleDto
            {
                RoleId = role.RoleId,
                RoleCode = role.RoleCode,
                RoleName = role.RoleName,
                RoleNameTh = role.RoleNameTh,
                Description = role.Description,
                RoleLevel = role.RoleLevel,
                IsActive = role.IsActive,
                IsSystem = role.IsSystem
            };
        }

        private PermissionDto MapPermissionToDto(HRB_PERMISSION permission)
        {
            return new PermissionDto
            {
                PermissionId = permission.PermissionId,
                PermissionCode = permission.PermissionCode,
                PermissionName = permission.PermissionName,
                PermissionNameTh = permission.PermissionNameTh,
                Description = permission.Description,
                Category = permission.Category,
                Module = permission.Module,
                IsActive = permission.IsActive
            };
        }
    }
}
