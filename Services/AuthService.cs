using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Authentication Service Implementation
    /// จัดการการยืนยันตัวตนทั้ง DB และ AD
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<AuthService> _logger;

        public AuthService(HRBudgetDbContext context, ILogger<AuthService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════
        // Authentication
        // ═══════════════════════════════════════════════════════════════

        public async Task<AuthResult> AuthenticateDBAsync(string username, string password)
        {
            try
            {
                var user = await GetUserByUsernameAsync(username);

                if (user == null)
                {
                    return AuthResult.Failed("ไม่พบผู้ใช้ในระบบ");
                }

                if (!user.IsActive)
                {
                    return AuthResult.Failed("บัญชีผู้ใช้ถูกระงับการใช้งาน");
                }

                if (user.IsLocked)
                {
                    return AuthResult.Failed("บัญชีผู้ใช้ถูกล็อค กรุณาติดต่อผู้ดูแลระบบ");
                }

                if (user.AuthType != "DB")
                {
                    return AuthResult.Failed("ผู้ใช้นี้ต้องเข้าสู่ระบบผ่าน AD");
                }

                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    return AuthResult.Failed("ไม่พบรหัสผ่านในระบบ กรุณาติดต่อผู้ดูแลระบบ");
                }

                // Verify password
                if (!VerifyPassword(password, user.PasswordHash))
                {
                    await IncrementFailedAttemptsAsync(user.UserId);
                    return AuthResult.Failed("รหัสผ่านไม่ถูกต้อง");
                }

                // Reset failed attempts on successful login
                await ResetFailedAttemptsAsync(user.UserId);

                // Update last login
                user.LastLoginDate = DateTime.Now;
                await _context.SaveChangesAsync();

                // Load session data
                var session = await LoadUserSessionAsync(user.UserId);
                if (session == null)
                {
                    return AuthResult.Failed("ไม่สามารถโหลดข้อมูล Session ได้");
                }

                return AuthResult.Succeeded(session, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating user {Username}", username);
                return AuthResult.Failed("เกิดข้อผิดพลาดในการยืนยันตัวตน");
            }
        }

        public async Task<bool> VerifyPasswordAsync(string username, string password)
        {
            var user = await GetUserByUsernameAsync(username);
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
                return false;

            return VerifyPassword(password, user.PasswordHash);
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        public bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // User Lookup
        // ═══════════════════════════════════════════════════════════════

        public async Task<HRB_USER?> GetUserByUsernameAsync(string username)
        {
            return await _context.HRB_USER
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
        }

        public async Task<HRB_USER?> GetUserByEmpCodeAsync(string empCode)
        {
            return await _context.HRB_USER
                .FirstOrDefaultAsync(u => u.EmpCode == empCode && u.IsActive);
        }

        public async Task<bool> IsDBUserAsync(string username)
        {
            var user = await _context.HRB_USER
                .FirstOrDefaultAsync(u => u.Username == username);
            return user != null && user.AuthType == "DB";
        }

        // ═══════════════════════════════════════════════════════════════
        // Session Management
        // ═══════════════════════════════════════════════════════════════

        public async Task<UserSessionDto?> LoadUserSessionAsync(int userId)
        {
            var user = await _context.HRB_USER
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return null;

            // Load roles
            var roleIds = await _context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            var roles = await _context.HRB_ROLE
                .Where(r => roleIds.Contains(r.RoleId) && r.IsActive)
                .ToListAsync();

            var roleNames = roles.Select(r => r.RoleCode).ToList();

            // Load permissions from roles
            var permissionIds = await _context.HRB_ROLE_PERMISSION
                .Where(rp => roleIds.Contains(rp.RoleId) && rp.IsActive)
                .Select(rp => rp.PermissionId)
                .Distinct()
                .ToListAsync();

            var permissions = await _context.HRB_PERMISSION
                .Where(p => permissionIds.Contains(p.PermissionId) && p.IsActive)
                .Select(p => p.PermissionCode)
                .ToListAsync();

            return new UserSessionDto
            {
                UserId = user.UserId,
                EmpCode = user.EmpCode,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                AuthType = user.AuthType,
                Company = user.CompanyAccess ?? string.Empty,
                CompanyAccess = user.CompanyAccess,
                Roles = roleNames,
                Permissions = permissions
            };
        }

        public async Task<UserSessionDto?> LoadUserSessionByEmpCodeAsync(string empCode)
        {
            var user = await GetUserByEmpCodeAsync(empCode);
            if (user == null) return null;
            return await LoadUserSessionAsync(user.UserId);
        }

        // ═══════════════════════════════════════════════════════════════
        // Login Logging
        // ═══════════════════════════════════════════════════════════════

        public async Task LogLoginAsync(int? userId, string username, string authType, string ipAddress, string? userAgent, string? company)
        {
            try
            {
                var log = new HRB_USER_LOGIN_LOG
                {
                    UserId = userId,
                    Username = username,
                    LoginTime = DateTime.Now,
                    AuthType = authType,
                    IPAddress = ipAddress,
                    UserAgent = userAgent?.Length > 500 ? userAgent.Substring(0, 500) : userAgent,
                    LoginStatus = "SUCCESS",
                    Company = company
                };

                _context.Set<HRB_USER_LOGIN_LOG>().Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging login for user {Username}", username);
            }
        }

        public async Task LogFailedLoginAsync(string username, string authType, string ipAddress, string? userAgent, string failReason)
        {
            try
            {
                // Try to get user ID if user exists
                var user = await _context.HRB_USER.FirstOrDefaultAsync(u => u.Username == username);

                var log = new HRB_USER_LOGIN_LOG
                {
                    UserId = user?.UserId,
                    Username = username,
                    LoginTime = DateTime.Now,
                    AuthType = authType,
                    IPAddress = ipAddress,
                    UserAgent = userAgent?.Length > 500 ? userAgent.Substring(0, 500) : userAgent,
                    LoginStatus = "FAILED",
                    FailReason = failReason
                };

                _context.Set<HRB_USER_LOGIN_LOG>().Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging failed login for user {Username}", username);
            }
        }

        public async Task LogLogoutAsync(int userId)
        {
            try
            {
                // Find the last login record for this user
                var lastLogin = await _context.Set<HRB_USER_LOGIN_LOG>()
                    .Where(l => l.UserId == userId && l.LoginStatus == "SUCCESS" && l.LogoutTime == null)
                    .OrderByDescending(l => l.LoginTime)
                    .FirstOrDefaultAsync();

                if (lastLogin != null)
                {
                    lastLogin.LogoutTime = DateTime.Now;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging logout for user {UserId}", userId);
            }
        }

        public async Task<List<LoginLogDto>> GetLoginHistoryAsync(int userId, int count = 10)
        {
            return await _context.Set<HRB_USER_LOGIN_LOG>()
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.LoginTime)
                .Take(count)
                .Select(l => new LoginLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Username = l.Username,
                    LoginTime = l.LoginTime,
                    LogoutTime = l.LogoutTime,
                    IPAddress = l.IPAddress,
                    AuthType = l.AuthType,
                    LoginStatus = l.LoginStatus,
                    FailReason = l.FailReason,
                    Company = l.Company
                })
                .ToListAsync();
        }

        // ═══════════════════════════════════════════════════════════════
        // Password Management
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null || user.AuthType != "DB")
                    return false;

                // Verify current password
                if (string.IsNullOrEmpty(user.PasswordHash) || !VerifyPassword(currentPassword, user.PasswordHash))
                    return false;

                // Update password
                user.PasswordHash = HashPassword(newPassword);
                user.LastPasswordChange = DateTime.Now;
                user.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(int userId, string newPassword, string resetBy)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null || user.AuthType != "DB")
                    return false;

                user.PasswordHash = HashPassword(newPassword);
                user.LastPasswordChange = DateTime.Now;
                user.UpdatedBy = resetBy;
                user.UpdatedDate = DateTime.Now;
                user.FailedLoginAttempts = 0;
                user.IsLocked = false;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for user {UserId}", userId);
                return false;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // Account Security
        // ═══════════════════════════════════════════════════════════════

        public async Task<int> IncrementFailedAttemptsAsync(int userId)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null) return 0;

                user.FailedLoginAttempts++;

                // Lock account after 5 failed attempts
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsLocked = true;
                    _logger.LogWarning("User {UserId} account locked after {Attempts} failed attempts",
                        userId, user.FailedLoginAttempts);
                }

                await _context.SaveChangesAsync();
                return user.FailedLoginAttempts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing failed attempts for user {UserId}", userId);
                return 0;
            }
        }

        public async Task ResetFailedAttemptsAsync(int userId)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null) return;

                user.FailedLoginAttempts = 0;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting failed attempts for user {UserId}", userId);
            }
        }

        public async Task<bool> LockAccountAsync(int userId, string lockedBy)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null) return false;

                user.IsLocked = true;
                user.UpdatedBy = lockedBy;
                user.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                _logger.LogInformation("User {UserId} account locked by {LockedBy}", userId, lockedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error locking account for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UnlockAccountAsync(int userId, string unlockedBy)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(userId);
                if (user == null) return false;

                user.IsLocked = false;
                user.FailedLoginAttempts = 0;
                user.UpdatedBy = unlockedBy;
                user.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                _logger.LogInformation("User {UserId} account unlocked by {UnlockedBy}", userId, unlockedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking account for user {UserId}", userId);
                return false;
            }
        }
    }
}
