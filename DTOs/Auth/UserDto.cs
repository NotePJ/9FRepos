namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// User DTO for API responses
    /// </summary>
    public class UserDto
    {
        public int UserId { get; set; }
        public string EmpCode { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string AuthType { get; set; } = "AD";
        public string? CompanyAccess { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
        public DateTime? LastLoginDate { get; set; }

        // Roles
        public List<RoleDto> Roles { get; set; } = new();

        // Permissions (flattened from roles)
        public List<string> Permissions { get; set; } = new();
    }

    /// <summary>
    /// User DTO for create/update operations
    /// </summary>
    public class UserCreateDto
    {
        public string EmpCode { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string AuthType { get; set; } = "AD";
        public string? CompanyAccess { get; set; }
        public List<int>? RoleIds { get; set; }
    }

    /// <summary>
    /// User DTO for update operations
    /// </summary>
    public class UserUpdateDto
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? CompanyAccess { get; set; }
        public bool? IsActive { get; set; }
        public List<int>? RoleIds { get; set; }
    }
}
