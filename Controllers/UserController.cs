using Microsoft.AspNetCore.Mvc;
using HCBPCoreUI_Backend.Attributes;
using HCBPCoreUI_Backend.Services;
using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.DTOs.AuditLog;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// User Management API Controller
    /// สำหรับ Admin จัดการ Users
    /// ต้องการ Permission: PAGE_USER_MANAGEMENT
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [RequireAuth]
    [RequirePermission("PAGE_USER_MANAGEMENT")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserService userService,
            IAuditLogService auditLogService,
            ILogger<UserController> logger)
        {
            _userService = userService;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Get all users
        /// GET /api/User/GetAll
        /// </summary>
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาดในการดึงข้อมูล" });
            }
        }

        /// <summary>
        /// Get user by ID
        /// GET /api/User/Get/{id}
        /// </summary>
        [HttpGet("Get/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "ไม่พบผู้ใช้" });
                }
                return Ok(new { success = true, data = user });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Create new user
        /// POST /api/User/Create
        /// </summary>
        [HttpPost("Create")]
        [RequirePermission("BTN_CREATE")]
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "ข้อมูลไม่ถูกต้อง" });
                }

                var createdBy = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";
                var user = await _userService.CreateAsync(dto, createdBy);
                if (user != null)
                {
                    _logger.LogInformation("User created: {EmpCode} by {Admin}",
                        dto.EmpCode, HttpContext.Session.GetString("EmployeeNo"));

                    // Activity Log
                    _ = _auditLogService.LogAsync(
                        ActivityModules.UserManagement,
                        ActivityActions.Create,
                        user.UserId.ToString(),
                        "User",
                        null,
                        new { dto.EmpCode, dto.Username, dto.FullName, dto.Email, dto.RoleIds },
                        HttpContext);

                    return Ok(new { success = true, message = "สร้างผู้ใช้สำเร็จ", data = user });
                }
                return BadRequest(new { success = false, message = "ไม่สามารถสร้างผู้ใช้ได้" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาดในการสร้างผู้ใช้" });
            }
        }

        /// <summary>
        /// Update user
        /// PUT /api/User/Update/{id}
        /// </summary>
        [HttpPut("Update/{id}")]
        [RequirePermission("BTN_EDIT")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
        {
            try
            {
                // Get old data for audit log
                var oldUser = await _userService.GetByIdAsync(id);

                dto.UserId = id;
                var updatedBy = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";
                var user = await _userService.UpdateAsync(dto, updatedBy);
                if (user != null)
                {
                    _logger.LogInformation("User updated: {UserId} by {Admin}",
                        id, HttpContext.Session.GetString("EmployeeNo"));

                    // Activity Log
                    _ = _auditLogService.LogAsync(
                        ActivityModules.UserManagement,
                        ActivityActions.Update,
                        id.ToString(),
                        "User",
                        oldUser != null ? new { oldUser.EmpCode, oldUser.Username, oldUser.FullName, oldUser.Email, oldUser.IsActive } : null,
                        new { dto.FullName, dto.Email, dto.IsActive, dto.RoleIds },
                        HttpContext);

                    return Ok(new { success = true, message = "อัปเดตผู้ใช้สำเร็จ", data = user });
                }
                return BadRequest(new { success = false, message = "ไม่สามารถอัปเดตผู้ใช้ได้" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาดในการอัปเดต" });
            }
        }

        /// <summary>
        /// Delete user (soft delete)
        /// DELETE /api/User/Delete/{id}
        /// </summary>
        [HttpDelete("Delete/{id}")]
        [RequirePermission("BTN_DELETE")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Get old data for audit log
                var oldUser = await _userService.GetByIdAsync(id);

                var success = await _userService.DeleteAsync(id);
                if (success)
                {
                    _logger.LogInformation("User deleted: {UserId} by {Admin}",
                        id, HttpContext.Session.GetString("EmployeeNo"));

                    // Activity Log
                    _ = _auditLogService.LogAsync(
                        ActivityModules.UserManagement,
                        ActivityActions.Delete,
                        id.ToString(),
                        "User",
                        oldUser != null ? new { oldUser.EmpCode, oldUser.Username, oldUser.FullName } : null,
                        null,
                        HttpContext);

                    return Ok(new { success = true, message = "ลบผู้ใช้สำเร็จ" });
                }
                return BadRequest(new { success = false, message = "ไม่สามารถลบผู้ใช้ได้" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาดในการลบ" });
            }
        }

        /// <summary>
        /// Assign roles to user
        /// POST /api/User/AssignRoles/{userId}
        /// </summary>
        [HttpPost("AssignRoles/{userId}")]
        [RequireRole("ADMIN", "SUPER_USER")]
        public async Task<IActionResult> AssignRoles(int userId, [FromBody] int[] roleIds)
        {
            try
            {
                // Get old roles for audit log
                var oldRoles = await _userService.GetUserRolesAsync(userId);

                var assignedBy = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";
                foreach (var roleId in roleIds)
                {
                    await _userService.AssignRoleAsync(userId, roleId, assignedBy);
                }
                _logger.LogInformation("Roles assigned to user {UserId}: [{Roles}] by {Admin}",
                    userId, string.Join(",", roleIds), assignedBy);

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.UserManagement,
                    ActivityActions.AssignRole,
                    userId.ToString(),
                    "User",
                    new { OldRoleIds = oldRoles?.Select(r => r.RoleId).ToArray() },
                    new { NewRoleIds = roleIds },
                    HttpContext);

                return Ok(new { success = true, message = "กำหนด Role สำเร็จ" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning roles to user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Get user roles
        /// GET /api/User/GetRoles/{userId}
        /// </summary>
        [HttpGet("GetRoles/{userId}")]
        public async Task<IActionResult> GetRoles(int userId)
        {
            try
            {
                var roles = await _userService.GetUserRolesAsync(userId);
                return Ok(new { success = true, data = roles });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Get user permissions (derived from roles)
        /// GET /api/User/GetPermissions/{userId}
        /// </summary>
        [HttpGet("GetPermissions/{userId}")]
        public async Task<IActionResult> GetPermissions(int userId)
        {
            try
            {
                var permissions = await _userService.GetUserPermissionsAsync(userId);
                return Ok(new { success = true, data = permissions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }
    }
}
