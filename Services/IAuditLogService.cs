using HCBPCoreUI_Backend.DTOs.AuditLog;
using Microsoft.AspNetCore.Http;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Audit Log Service Interface
    /// สำหรับดึงข้อมูล Log ประเภทต่างๆ และบันทึก Activity Log
    /// </summary>
    public interface IAuditLogService
    {
        // ═══════════════════════════════════════════════════════════════════
        // Existing Log Methods (Login, Email, Upload)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// ดึงข้อมูล Login Logs แบบ Paginated
        /// </summary>
        Task<AuditLogPagedResult<LoginLogDto>> GetLoginLogsAsync(AuditLogQueryRequest request);

        /// <summary>
        /// ดึงข้อมูล Email Logs แบบ Paginated
        /// </summary>
        Task<AuditLogPagedResult<EmailLogDto>> GetEmailLogsAsync(AuditLogQueryRequest request);

        /// <summary>
        /// ดึงข้อมูล Upload Logs แบบ Paginated
        /// </summary>
        Task<AuditLogPagedResult<UploadLogDto>> GetUploadLogsAsync(AuditLogQueryRequest request);

        // ═══════════════════════════════════════════════════════════════════
        // Activity Log Methods (Phase 2 - All Modules)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// ดึงข้อมูล Activity Logs (Client-side pagination by AG Grid)
        /// </summary>
        Task<AuditLogPagedResult<ActivityLogDto>> GetActivityLogsAsync(ActivityLogQueryRequest request);

        /// <summary>
        /// บันทึก Activity Log (Async - Fire and Forget)
        /// </summary>
        /// <param name="request">ข้อมูล Activity Log</param>
        /// <param name="context">HttpContext สำหรับดึง User Info, IP, UserAgent</param>
        Task LogActivityAsync(CreateActivityLogRequest request, HttpContext context);

        /// <summary>
        /// Helper Method สำหรับบันทึก Activity Log อย่างง่าย
        /// </summary>
        /// <param name="moduleName">ชื่อโมดูล (ใช้ ActivityModules constants)</param>
        /// <param name="action">ประเภทการกระทำ (ใช้ ActivityActions constants)</param>
        /// <param name="targetId">PK ของข้อมูล</param>
        /// <param name="targetType">ประเภท Entity</param>
        /// <param name="oldValue">ข้อมูลเดิม</param>
        /// <param name="newValue">ข้อมูลใหม่</param>
        /// <param name="context">HttpContext</param>
        /// <param name="status">สถานะ (default: SUCCESS)</param>
        /// <param name="errorMessage">Error message กรณี FAILED</param>
        Task LogAsync(
            string moduleName,
            string action,
            string? targetId,
            string? targetType,
            object? oldValue,
            object? newValue,
            HttpContext context,
            string status = "SUCCESS",
            string? errorMessage = null);

        /// <summary>
        /// ดึงรายการ Module ทั้งหมดที่มี Log (สำหรับ Dropdown Filter)
        /// </summary>
        Task<List<string>> GetDistinctModulesAsync();

        /// <summary>
        /// ดึงรายการ Action ทั้งหมดที่มี Log (สำหรับ Dropdown Filter)
        /// </summary>
        Task<List<string>> GetDistinctActionsAsync();
    }
}
