using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HCBPCoreUI_Backend.Attributes;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.DTOs.AuditLog;
using HCBPCoreUI_Backend.Services;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Role Management API Controller
    /// สำหรับ Admin จัดการ Roles และ Permissions
    /// ต้องการ Permission: PAGE_ROLE_MANAGEMENT
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [RequireAuth]
    [RequirePermission("PAGE_ROLE_MANAGEMENT")]
    public class RoleController : ControllerBase
    {
        private readonly HRBudgetDbContext _context;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(
            HRBudgetDbContext context,
            IAuditLogService auditLogService,
            ILogger<RoleController> logger)
        {
            _context = context;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Get all roles
        /// GET /api/Role/GetAll
        /// </summary>
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roles = await _context.HRB_ROLE
                    .Where(r => r.IsActive)
                    .OrderBy(r => r.RoleLevel)
                    .Select(r => new RoleDto
                    {
                        RoleId = r.RoleId,
                        RoleCode = r.RoleCode,
                        RoleName = r.RoleName,
                        RoleNameTh = r.RoleNameTh,
                        RoleLevel = r.RoleLevel,
                        IsSystem = r.IsSystem,
                        IsActive = r.IsActive
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = roles });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all roles");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Get roles list for dropdown (simple list)
        /// GET /api/Role/list
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            try
            {
                var roles = await _context.HRB_ROLE
                    .Where(r => r.IsActive)
                    .OrderBy(r => r.RoleLevel)
                    .Select(r => new
                    {
                        r.RoleId,
                        r.RoleCode,
                        r.RoleName,
                        r.RoleNameTh,
                        Description = r.RoleNameTh ?? r.RoleName
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = roles });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles list");
                return StatusCode(500, new { success = false, message = "Error retrieving roles" });
            }
        }

        /// <summary>
        /// Get role by ID with permissions
        /// GET /api/Role/Get/{id}
        /// </summary>
        [HttpGet("Get/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var role = await _context.HRB_ROLE
                    .Where(r => r.RoleId == id)
                    .Select(r => new
                    {
                        r.RoleId,
                        r.RoleCode,
                        r.RoleName,
                        r.RoleNameTh,
                        r.RoleLevel,
                        r.IsSystem,
                        r.IsActive,
                        Permissions = _context.HRB_ROLE_PERMISSION
                            .Where(rp => rp.RoleId == id && rp.IsActive)
                            .Join(_context.HRB_PERMISSION,
                                rp => rp.PermissionId,
                                p => p.PermissionId,
                                (rp, p) => new PermissionDto
                                {
                                    PermissionId = p.PermissionId,
                                    PermissionCode = p.PermissionCode,
                                    PermissionName = p.PermissionName,
                                    PermissionNameTh = p.PermissionNameTh,
                                    Category = p.Category,
                                    IsActive = p.IsActive
                                })
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (role == null)
                {
                    return NotFound(new { success = false, message = "ไม่พบ Role" });
                }

                return Ok(new { success = true, data = role });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role {RoleId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Get all permissions
        /// GET /api/Role/GetPermissions
        /// </summary>
        [HttpGet("GetPermissions")]
        public async Task<IActionResult> GetPermissions()
        {
            try
            {
                var permissions = await _context.HRB_PERMISSION
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Category)
                    .ThenBy(p => p.PermissionCode)
                    .Select(p => new PermissionDto
                    {
                        PermissionId = p.PermissionId,
                        PermissionCode = p.PermissionCode,
                        PermissionName = p.PermissionName,
                        PermissionNameTh = p.PermissionNameTh,
                        Category = p.Category,
                        IsActive = p.IsActive
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = permissions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Create new role (Admin only)
        /// POST /api/Role/Create
        /// </summary>
        [HttpPost("Create")]
        [RequireRole("ADMIN")]
        public async Task<IActionResult> Create([FromBody] RoleCreateDto dto)
        {
            try
            {
                // Check duplicate
                var exists = await _context.HRB_ROLE
                    .AnyAsync(r => r.RoleCode == dto.RoleCode);

                if (exists)
                {
                    return BadRequest(new { success = false, message = $"Role code '{dto.RoleCode}' already exists" });
                }

                var role = new Models.Auth.HRB_ROLE
                {
                    RoleCode = dto.RoleCode,
                    RoleName = dto.RoleName,
                    RoleNameTh = dto.RoleNameTh,
                    RoleLevel = dto.RoleLevel,
                    IsSystem = false,
                    IsActive = true
                };

                _context.HRB_ROLE.Add(role);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Role created: {RoleCode} by {Admin}",
                    dto.RoleCode, HttpContext.Session.GetString("EmployeeNo"));

                // Assign permissions if provided
                if (dto.PermissionIds != null && dto.PermissionIds.Any())
                {
                    var rolePermissions = dto.PermissionIds.Select(pid => new Models.Auth.HRB_ROLE_PERMISSION
                    {
                        RoleId = role.RoleId,
                        PermissionId = pid,
                        IsActive = true
                    });
                    await _context.HRB_ROLE_PERMISSION.AddRangeAsync(rolePermissions);
                    await _context.SaveChangesAsync();
                }

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.RoleManagement,
                    ActivityActions.Create,
                    role.RoleId.ToString(),
                    "Role",
                    null,
                    new { dto.RoleCode, dto.RoleName, dto.RoleNameTh, dto.RoleLevel, dto.PermissionIds },
                    HttpContext);

                return Ok(new { success = true, message = "สร้าง Role สำเร็จ", data = role.RoleId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Update role (Admin only)
        /// PUT /api/Role/Update/{id}
        /// </summary>
        [HttpPut("Update/{id}")]
        [RequireRole("ADMIN")]
        public async Task<IActionResult> Update(int id, [FromBody] RoleUpdateDto dto)
        {
            try
            {
                var role = await _context.HRB_ROLE.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "ไม่พบ Role" });
                }

                // Store old values for audit log
                var oldRole = new { role.RoleCode, role.RoleName, role.RoleNameTh, role.RoleLevel, role.IsActive };

                // Update role properties (except code for system roles)
                if (!role.IsSystem)
                {
                    role.RoleCode = dto.RoleCode ?? role.RoleCode;
                }
                role.RoleName = dto.RoleName ?? role.RoleName;
                role.RoleNameTh = dto.RoleNameTh;
                role.RoleLevel = dto.RoleLevel ?? role.RoleLevel;
                role.IsActive = dto.IsActive ?? role.IsActive;

                // Update permissions if provided
                if (dto.PermissionIds != null)
                {
                    // Remove existing permissions
                    var existingPermissions = await _context.HRB_ROLE_PERMISSION
                        .Where(rp => rp.RoleId == id)
                        .ToListAsync();
                    _context.HRB_ROLE_PERMISSION.RemoveRange(existingPermissions);

                    // Add new permissions
                    var newPermissions = dto.PermissionIds.Select(pid => new Models.Auth.HRB_ROLE_PERMISSION
                    {
                        RoleId = id,
                        PermissionId = pid,
                        IsActive = true
                    });
                    await _context.HRB_ROLE_PERMISSION.AddRangeAsync(newPermissions);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Role updated: {RoleId} by {Admin}",
                    id, HttpContext.Session.GetString("EmployeeNo"));

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.RoleManagement,
                    ActivityActions.Update,
                    id.ToString(),
                    "Role",
                    oldRole,
                    new { dto.RoleCode, dto.RoleName, dto.RoleNameTh, dto.RoleLevel, dto.IsActive, dto.PermissionIds },
                    HttpContext);

                return Ok(new { success = true, message = "อัปเดต Role สำเร็จ" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role {RoleId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Update role permissions (Admin only)
        /// PUT /api/Role/UpdatePermissions/{roleId}
        /// </summary>
        [HttpPut("UpdatePermissions/{roleId}")]
        [RequireRole("ADMIN")]
        public async Task<IActionResult> UpdatePermissions(int roleId, [FromBody] int[] permissionIds)
        {
            try
            {
                var role = await _context.HRB_ROLE.FindAsync(roleId);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "ไม่พบ Role" });
                }

                if (role.IsSystem)
                {
                    return BadRequest(new { success = false, message = "ไม่สามารถแก้ไข System Role ได้" });
                }

                // Get old permissions for audit log
                var oldPermissionIds = await _context.HRB_ROLE_PERMISSION
                    .Where(rp => rp.RoleId == roleId)
                    .Select(rp => rp.PermissionId)
                    .ToArrayAsync();

                // Remove existing permissions
                var existingPermissions = await _context.HRB_ROLE_PERMISSION
                    .Where(rp => rp.RoleId == roleId)
                    .ToListAsync();

                _context.HRB_ROLE_PERMISSION.RemoveRange(existingPermissions);

                // Add new permissions
                var newPermissions = permissionIds.Select(pid => new Models.Auth.HRB_ROLE_PERMISSION
                {
                    RoleId = roleId,
                    PermissionId = pid,
                    IsActive = true
                });

                await _context.HRB_ROLE_PERMISSION.AddRangeAsync(newPermissions);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Role permissions updated: {RoleId} = [{Permissions}] by {Admin}",
                    roleId, string.Join(",", permissionIds), HttpContext.Session.GetString("EmployeeNo"));

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.RoleManagement,
                    ActivityActions.AssignPermission,
                    roleId.ToString(),
                    "Role",
                    new { OldPermissionIds = oldPermissionIds },
                    new { NewPermissionIds = permissionIds },
                    HttpContext);

                return Ok(new { success = true, message = "อัปเดต Permission สำเร็จ" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role permissions");
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }

        /// <summary>
        /// Delete role (Admin only, non-system roles)
        /// DELETE /api/Role/Delete/{id}
        /// </summary>
        [HttpDelete("Delete/{id}")]
        [RequireRole("ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var role = await _context.HRB_ROLE.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { success = false, message = "ไม่พบ Role" });
                }

                if (role.IsSystem)
                {
                    return BadRequest(new { success = false, message = "ไม่สามารถลบ System Role ได้" });
                }

                // Check if role is in use
                var inUse = await _context.HRB_USER_ROLE.AnyAsync(ur => ur.RoleId == id && ur.IsActive);
                if (inUse)
                {
                    return BadRequest(new { success = false, message = "Role นี้กำลังถูกใช้งานอยู่ ไม่สามารถลบได้" });
                }

                // Store old values for audit log
                var oldRole = new { role.RoleCode, role.RoleName, role.RoleNameTh };

                // Soft delete
                role.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Role deleted: {RoleId} by {Admin}",
                    id, HttpContext.Session.GetString("EmployeeNo"));

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.RoleManagement,
                    ActivityActions.Delete,
                    id.ToString(),
                    "Role",
                    oldRole,
                    null,
                    HttpContext);

                return Ok(new { success = true, message = "ลบ Role สำเร็จ" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role {RoleId}", id);
                return StatusCode(500, new { success = false, message = "เกิดข้อผิดพลาด" });
            }
        }
    }
}
