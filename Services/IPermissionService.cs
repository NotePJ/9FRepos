using HCBPCoreUI_Backend.DTOs.Auth;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Permission Service Interface
    /// จัดการ Permissions
    /// </summary>
    public interface IPermissionService
    {
        // ═══════════════════════════════════════════════════════════════
        // Permission CRUD
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get all permissions
        /// </summary>
        Task<List<PermissionDto>> GetAllAsync(bool includeInactive = false);

        /// <summary>
        /// Get permission by ID
        /// </summary>
        Task<PermissionDto?> GetByIdAsync(int permissionId);

        /// <summary>
        /// Get permission by code
        /// </summary>
        Task<PermissionDto?> GetByCodeAsync(string permissionCode);

        /// <summary>
        /// Get permissions by category
        /// </summary>
        Task<List<PermissionDto>> GetByCategoryAsync(string category);

        /// <summary>
        /// Get permissions by module
        /// </summary>
        Task<List<PermissionDto>> GetByModuleAsync(string module);

        /// <summary>
        /// Create new permission
        /// </summary>
        Task<PermissionDto> CreateAsync(PermissionCreateDto dto);

        /// <summary>
        /// Update permission
        /// </summary>
        Task<PermissionDto?> UpdateAsync(int permissionId, PermissionCreateDto dto);

        /// <summary>
        /// Delete permission
        /// </summary>
        Task<bool> DeleteAsync(int permissionId);

        // ═══════════════════════════════════════════════════════════════
        // Permission Checks
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Check if user has specific permission
        /// </summary>
        Task<bool> UserHasPermissionAsync(int userId, string permissionCode);

        /// <summary>
        /// Check if user has any of the specified permissions
        /// </summary>
        Task<bool> UserHasAnyPermissionAsync(int userId, params string[] permissionCodes);

        /// <summary>
        /// Check if user has all of the specified permissions
        /// </summary>
        Task<bool> UserHasAllPermissionsAsync(int userId, params string[] permissionCodes);

        /// <summary>
        /// Get all permissions for a user (from all roles)
        /// </summary>
        Task<List<string>> GetUserPermissionsAsync(int userId);

        // ═══════════════════════════════════════════════════════════════
        // Category/Module
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get all unique categories
        /// </summary>
        Task<List<string>> GetCategoriesAsync();

        /// <summary>
        /// Get all unique modules
        /// </summary>
        Task<List<string>> GetModulesAsync();

        /// <summary>
        /// Get permissions grouped by category
        /// </summary>
        Task<Dictionary<string, List<PermissionDto>>> GetGroupedByCategoryAsync();

        /// <summary>
        /// Get permissions grouped by module
        /// </summary>
        Task<Dictionary<string, List<PermissionDto>>> GetGroupedByModuleAsync();
    }

    /// <summary>
    /// Permission Create/Update DTO
    /// </summary>
    public class PermissionCreateDto
    {
        public string PermissionCode { get; set; } = string.Empty;
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionNameTh { get; set; }
        public string? Description { get; set; }
        public string Category { get; set; } = "BUTTON";
        public string? Module { get; set; }
        public int SortOrder { get; set; } = 0;
    }
}
