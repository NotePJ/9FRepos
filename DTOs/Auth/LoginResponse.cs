namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// Login Response DTO - returned after successful login
    /// </summary>
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? RedirectUrl { get; set; }

        // User Info
        public UserSessionDto? User { get; set; }
    }

    /// <summary>
    /// User Session DTO - stored in session/returned to frontend
    /// </summary>
    public class UserSessionDto
    {
        public int UserId { get; set; }
        public string EmpCode { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string AuthType { get; set; } = "AD";
        public string Company { get; set; } = string.Empty;
        public string? CompanyAccess { get; set; }

        // Roles (codes only for quick check)
        public List<string> Roles { get; set; } = new();

        // Permissions (codes only for quick check)
        public List<string> Permissions { get; set; } = new();

        // Helper methods
        public bool HasRole(string roleCode) => Roles.Contains(roleCode);
        public bool HasPermission(string permissionCode) => Permissions.Contains(permissionCode);
        public bool IsAdmin => Roles.Contains("ADMIN");
        public bool IsSuperUser => Roles.Contains("SUPER_USER") || IsAdmin;
    }
}
