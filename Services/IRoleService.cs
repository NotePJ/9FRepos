using HCBPCoreUI_Backend.DTOs.Auth;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Role Service Interface
    /// จัดการ Roles และ Role-Permission Mapping
    /// </summary>
    public interface IRoleService
    {
        // ═══════════════════════════════════════════════════════════════
        // Role CRUD
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get all roles
        /// </summary>
        Task<List<RoleDto>> GetAllAsync(bool includeInactive = false);

        /// <summary>
        /// Get role by ID
        /// </summary>
        Task<RoleDto?> GetByIdAsync(int roleId);

        /// <summary>
        /// Get role by name/code
        /// </summary>
        Task<RoleDto?> GetByNameAsync(string roleName);

        /// <summary>
        /// Create new role
        /// </summary>
        Task<RoleDto> CreateAsync(RoleCreateDto dto, string createdBy);

        /// <summary>
        /// Update role
        /// </summary>
        Task<RoleDto?> UpdateAsync(int roleId, RoleCreateDto dto, string updatedBy);

        /// <summary>
        /// Delete role (soft delete)
        /// </summary>
        Task<bool> DeleteAsync(int roleId);

        /// <summary>
        /// Check if role is system role (cannot be deleted)
        /// </summary>
        Task<bool> IsSystemRoleAsync(int roleId);

        // ═══════════════════════════════════════════════════════════════
        // Permission Assignment
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get all permissions for a role
        /// </summary>
        Task<List<PermissionDto>> GetRolePermissionsAsync(int roleId);

        /// <summary>
        /// Get permission codes for a role
        /// </summary>
        Task<List<string>> GetRolePermissionCodesAsync(int roleId);

        /// <summary>
        /// Assign permission to role
        /// </summary>
        Task<bool> AssignPermissionAsync(int roleId, int permissionId, string assignedBy);

        /// <summary>
        /// Revoke permission from role
        /// </summary>
        Task<bool> RevokePermissionAsync(int roleId, int permissionId, string revokedBy);

        /// <summary>
        /// Update all permissions for a role (replace)
        /// </summary>
        Task<bool> UpdatePermissionsAsync(int roleId, List<int> permissionIds, string updatedBy);

        /// <summary>
        /// Check if role has specific permission
        /// </summary>
        Task<bool> HasPermissionAsync(int roleId, string permissionCode);

        // ═══════════════════════════════════════════════════════════════
        // User Count
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get number of users with this role
        /// </summary>
        Task<int> GetUserCountAsync(int roleId);

        /// <summary>
        /// Get users with this role
        /// </summary>
        Task<List<UserDto>> GetUsersWithRoleAsync(int roleId);
    }
}
