using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Permission Service Implementation
    /// จัดการ Permissions
    /// </summary>
    public class PermissionService : IPermissionService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<PermissionService> _logger;

        public PermissionService(HRBudgetDbContext context, ILogger<PermissionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════
        // Permission CRUD
        // ═══════════════════════════════════════════════════════════════

        public async Task<List<PermissionDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.HRB_PERMISSION.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            var permissions = await query
                .OrderBy(p => p.Category)
                .ThenBy(p => p.SortOrder)
                .ThenBy(p => p.PermissionName)
                .ToListAsync();

            return permissions.Select(MapToDto).ToList();
        }

        public async Task<PermissionDto?> GetByIdAsync(int permissionId)
        {
            var permission = await _context.HRB_PERMISSION.FindAsync(permissionId);
            return permission == null ? null : MapToDto(permission);
        }

        public async Task<PermissionDto?> GetByCodeAsync(string permissionCode)
        {
            var permission = await _context.HRB_PERMISSION
                .FirstOrDefaultAsync(p => p.PermissionCode == permissionCode);
            return permission == null ? null : MapToDto(permission);
        }

        public async Task<List<PermissionDto>> GetByCategoryAsync(string category)
        {
            var permissions = await _context.HRB_PERMISSION
                .Where(p => p.Category == category && p.IsActive)
                .OrderBy(p => p.SortOrder)
                .ThenBy(p => p.PermissionName)
                .ToListAsync();

            return permissions.Select(MapToDto).ToList();
        }

        public async Task<List<PermissionDto>> GetByModuleAsync(string module)
        {
            var permissions = await _context.HRB_PERMISSION
                .Where(p => p.Module == module && p.IsActive)
                .OrderBy(p => p.Category)
                .ThenBy(p => p.SortOrder)
                .ToListAsync();

            return permissions.Select(MapToDto).ToList();
        }

        public async Task<PermissionDto> CreateAsync(PermissionCreateDto dto)
        {
            var permission = new HRB_PERMISSION
            {
                PermissionCode = dto.PermissionCode,
                PermissionName = dto.PermissionName,
                PermissionNameTh = dto.PermissionNameTh,
                Description = dto.Description,
                Category = dto.Category,
                Module = dto.Module,
                SortOrder = dto.SortOrder,
                IsActive = true,
                CreatedDate = DateTime.Now
            };

            _context.HRB_PERMISSION.Add(permission);
            await _context.SaveChangesAsync();

            return MapToDto(permission);
        }

        public async Task<PermissionDto?> UpdateAsync(int permissionId, PermissionCreateDto dto)
        {
            var permission = await _context.HRB_PERMISSION.FindAsync(permissionId);
            if (permission == null) return null;

            permission.PermissionCode = dto.PermissionCode;
            permission.PermissionName = dto.PermissionName;
            permission.PermissionNameTh = dto.PermissionNameTh;
            permission.Description = dto.Description;
            permission.Category = dto.Category;
            permission.Module = dto.Module;
            permission.SortOrder = dto.SortOrder;

            await _context.SaveChangesAsync();

            return MapToDto(permission);
        }

        public async Task<bool> DeleteAsync(int permissionId)
        {
            var permission = await _context.HRB_PERMISSION.FindAsync(permissionId);
            if (permission == null) return false;

            // Soft delete
            permission.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // Permission Checks
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> UserHasPermissionAsync(int userId, string permissionCode)
        {
            // Get user's role IDs
            var roleIds = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            if (!roleIds.Any()) return false;

            // Check if user has ADMIN role (full access)
            var hasAdminRole = await _context.HRB_ROLE
                .AnyAsync(r => roleIds.Contains(r.RoleId) &&
                              r.RoleCode.ToUpper() == "ADMIN" &&
                              r.IsActive);

            if (hasAdminRole) return true;

            // Get permission IDs for user's roles
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => roleIds.Contains(rp.RoleId) && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .Distinct()
                .ToListAsync();

            // Check if permission exists
            return await _context.HRB_PERMISSION
                .AnyAsync(p => permissionIds.Contains(p.PermissionId) &&
                              p.PermissionCode == permissionCode &&
                              p.IsActive);
        }

        public async Task<bool> UserHasAnyPermissionAsync(int userId, params string[] permissionCodes)
        {
            foreach (var code in permissionCodes)
            {
                if (await UserHasPermissionAsync(userId, code))
                    return true;
            }
            return false;
        }

        public async Task<bool> UserHasAllPermissionsAsync(int userId, params string[] permissionCodes)
        {
            foreach (var code in permissionCodes)
            {
                if (!await UserHasPermissionAsync(userId, code))
                    return false;
            }
            return true;
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            // Get user's role IDs
            var roleIds = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            if (!roleIds.Any()) return new List<string>();

            // Check if user has ADMIN role
            var hasAdminRole = await _context.HRB_ROLE
                .AnyAsync(r => roleIds.Contains(r.RoleId) &&
                              r.RoleCode.ToUpper() == "ADMIN" &&
                              r.IsActive);

            if (hasAdminRole)
            {
                // Return all permissions for admin
                return await _context.HRB_PERMISSION
                    .Where(p => p.IsActive)
                    .Select(p => p.PermissionCode)
                    .ToListAsync();
            }

            // Get permission IDs for user's roles
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => roleIds.Contains(rp.RoleId) && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .Distinct()
                .ToListAsync();

            return await _context.HRB_PERMISSION
                .Where(p => permissionIds.Contains(p.PermissionId) && p.IsActive)
                .Select(p => p.PermissionCode)
                .ToListAsync();
        }

        // ═══════════════════════════════════════════════════════════════
        // Category/Module
        // ═══════════════════════════════════════════════════════════════

        public async Task<List<string>> GetCategoriesAsync()
        {
            return await _context.HRB_PERMISSION
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }

        public async Task<List<string>> GetModulesAsync()
        {
            return await _context.HRB_PERMISSION
                .Where(p => p.IsActive && p.Module != null)
                .Select(p => p.Module!)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();
        }

        public async Task<Dictionary<string, List<PermissionDto>>> GetGroupedByCategoryAsync()
        {
            var permissions = await GetAllAsync();
            return permissions
                .GroupBy(p => p.Category)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        public async Task<Dictionary<string, List<PermissionDto>>> GetGroupedByModuleAsync()
        {
            var permissions = await GetAllAsync();
            return permissions
                .Where(p => !string.IsNullOrEmpty(p.Module))
                .GroupBy(p => p.Module!)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        // ═══════════════════════════════════════════════════════════════
        // Private Methods
        // ═══════════════════════════════════════════════════════════════

        private PermissionDto MapToDto(HRB_PERMISSION permission)
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
