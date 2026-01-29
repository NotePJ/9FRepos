using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models.Auth;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Authentication Service Interface
    /// จัดการการยืนยันตัวตนทั้ง DB และ AD
    /// </summary>
    public interface IAuthService
    {
        // ═══════════════════════════════════════════════════════════════
        // Authentication
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Authenticate user with DB credentials
        /// </summary>
        Task<AuthResult> AuthenticateDBAsync(string username, string password);

        /// <summary>
        /// Verify password for DB user
        /// </summary>
        Task<bool> VerifyPasswordAsync(string username, string password);

        /// <summary>
        /// Hash password using BCrypt
        /// </summary>
        string HashPassword(string password);

        /// <summary>
        /// Verify password hash
        /// </summary>
        bool VerifyPassword(string password, string hash);

        // ═══════════════════════════════════════════════════════════════
        // User Lookup
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get user by username
        /// </summary>
        Task<HRB_USER?> GetUserByUsernameAsync(string username);

        /// <summary>
        /// Get user by EmpCode
        /// </summary>
        Task<HRB_USER?> GetUserByEmpCodeAsync(string empCode);

        /// <summary>
        /// Check if user exists and is DB auth type
        /// </summary>
        Task<bool> IsDBUserAsync(string username);

        // ═══════════════════════════════════════════════════════════════
        // Session Management
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Load user session data (roles, permissions, data access)
        /// </summary>
        Task<UserSessionDto?> LoadUserSessionAsync(int userId);

        /// <summary>
        /// Load user session data by EmpCode
        /// </summary>
        Task<UserSessionDto?> LoadUserSessionByEmpCodeAsync(string empCode);

        // ═══════════════════════════════════════════════════════════════
        // Login Logging
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Log successful login
        /// </summary>
        Task LogLoginAsync(int? userId, string username, string authType, string ipAddress, string? userAgent, string? company);

        /// <summary>
        /// Log failed login attempt
        /// </summary>
        Task LogFailedLoginAsync(string username, string authType, string ipAddress, string? userAgent, string failReason);

        /// <summary>
        /// Log user logout
        /// </summary>
        Task LogLogoutAsync(int userId);

        /// <summary>
        /// Get login history for user
        /// </summary>
        Task<List<LoginLogDto>> GetLoginHistoryAsync(int userId, int count = 10);

        // ═══════════════════════════════════════════════════════════════
        // Password Management
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Change user password
        /// </summary>
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);

        /// <summary>
        /// Reset user password (Admin only)
        /// </summary>
        Task<bool> ResetPasswordAsync(int userId, string newPassword, string resetBy);

        // ═══════════════════════════════════════════════════════════════
        // Account Security
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Increment failed login attempts
        /// </summary>
        Task<int> IncrementFailedAttemptsAsync(int userId);

        /// <summary>
        /// Reset failed login attempts
        /// </summary>
        Task ResetFailedAttemptsAsync(int userId);

        /// <summary>
        /// Lock user account
        /// </summary>
        Task<bool> LockAccountAsync(int userId, string lockedBy);

        /// <summary>
        /// Unlock user account
        /// </summary>
        Task<bool> UnlockAccountAsync(int userId, string unlockedBy);
    }

    /// <summary>
    /// Authentication Result
    /// </summary>
    public class AuthResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public UserSessionDto? UserSession { get; set; }
        public HRB_USER? User { get; set; }

        public static AuthResult Failed(string message) => new() { Success = false, Message = message };
        public static AuthResult Succeeded(UserSessionDto session, HRB_USER user) => new() { Success = true, UserSession = session, User = user };
    }
}
