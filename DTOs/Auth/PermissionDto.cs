namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// Permission DTO for API responses
    /// </summary>
    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public string PermissionCode { get; set; } = string.Empty;
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionNameTh { get; set; }
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Module { get; set; }
        public bool IsActive { get; set; }
    }
}
