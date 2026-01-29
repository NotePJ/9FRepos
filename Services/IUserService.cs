using HCBPCoreUI_Backend.DTOs.Auth;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// User Service Interface
    /// </summary>
    public interface IUserService
    {
        // ═══════════════════════════════════════════════════════════════
        // User CRUD
        // ═══════════════════════════════════════════════════════════════

        Task<UserDto?> GetByIdAsync(int userId);
        Task<UserDto?> GetByEmpCodeAsync(string empCode);
        Task<UserDto?> GetByUsernameAsync(string username);
        Task<List<UserDto>> GetAllAsync(bool includeInactive = false);
        Task<UserDto> CreateAsync(UserCreateDto dto, string createdBy);
        Task<UserDto> UpdateAsync(UserUpdateDto dto, string updatedBy);
        Task<bool> DeleteAsync(int userId);
        Task<bool> SetActiveAsync(int userId, bool isActive, string updatedBy);

        // ═══════════════════════════════════════════════════════════════
        // Role Assignment
        // ═══════════════════════════════════════════════════════════════

        Task<bool> AssignRoleAsync(int userId, int roleId, string assignedBy, int? companyId = null);
        Task<bool> RevokeRoleAsync(int userId, int roleId, string revokedBy);
        Task<List<RoleDto>> GetUserRolesAsync(int userId);

        // ═══════════════════════════════════════════════════════════════
        // Permissions
        // ═══════════════════════════════════════════════════════════════

        Task<List<string>> GetUserPermissionsAsync(int userId);
        Task<bool> HasPermissionAsync(int userId, string permissionCode);

        // ═══════════════════════════════════════════════════════════════
        // Session Helper
        // ═══════════════════════════════════════════════════════════════

        Task<UserSessionDto?> GetUserSessionAsync(string empCode);
    }
}
