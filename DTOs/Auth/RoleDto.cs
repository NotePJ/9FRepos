namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// Role DTO for API responses
    /// </summary>
    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleCode { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? RoleNameTh { get; set; }
        public string? Description { get; set; }
        public int RoleLevel { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystem { get; set; }

        // Permissions assigned to this role
        public List<PermissionDto> Permissions { get; set; } = new();
    }

    /// <summary>
    /// Role DTO for create operations
    /// </summary>
    public class RoleCreateDto
    {
        public string RoleCode { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? RoleNameTh { get; set; }
        public string? Description { get; set; }
        public int RoleLevel { get; set; }
        public List<int>? PermissionIds { get; set; }
    }

    /// <summary>
    /// Role DTO for update operations
    /// </summary>
    public class RoleUpdateDto
    {
        public string? RoleCode { get; set; }
        public string? RoleName { get; set; }
        public string? RoleNameTh { get; set; }
        public string? Description { get; set; }
        public int? RoleLevel { get; set; }
        public bool? IsActive { get; set; }
        public List<int>? PermissionIds { get; set; }
    }
}
