namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// User Data Access DTO for API responses
    /// กำหนดสิทธิ์เข้าถึงข้อมูลของ User
    /// </summary>
    public class UserDataAccessDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string AccessType { get; set; } = string.Empty;
        public string AccessCode { get; set; } = string.Empty;
        public string AccessLevel { get; set; } = "READ";
        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// User Data Access DTO for create operations
    /// </summary>
    public class UserDataAccessCreateDto
    {
        public int UserId { get; set; }
        public string AccessType { get; set; } = string.Empty;
        public string AccessCode { get; set; } = string.Empty;
        public string AccessLevel { get; set; } = "READ";
        public int? CompanyId { get; set; }
    }

    /// <summary>
    /// Login Log DTO for API responses
    /// </summary>
    public class LoginLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; }
        public DateTime? LogoutTime { get; set; }
        public string? IPAddress { get; set; }
        public string? AuthType { get; set; }
        public string LoginStatus { get; set; } = string.Empty;
        public string? FailReason { get; set; }
        public string? Company { get; set; }
    }
}
