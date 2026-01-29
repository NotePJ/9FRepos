using System;

namespace HCBPCoreUI_Backend.DTOs.AuditLog
{
    /// <summary>
    /// DTO สำหรับ Login Log
    /// </summary>
    public class LoginLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; }
        public DateTime? LogoutTime { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string AuthType { get; set; } = "AD";
        public string LoginStatus { get; set; } = "SUCCESS";
        public string? FailReason { get; set; }
        public string? Company { get; set; }
    }

    /// <summary>
    /// DTO สำหรับ Email Log
    /// </summary>
    public class EmailLogDto
    {
        public int EmailId { get; set; }
        public string? EmailRefId { get; set; }
        public string? EmailType { get; set; }
        public string? ToEmail { get; set; }
        public string? CcEmail { get; set; }
        public string? Subject { get; set; }
        public string? SendStatus { get; set; }
        public string? ResponseMessage { get; set; }
        public DateTime? SentDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public string? RefType { get; set; }
        public int? RefId { get; set; }
        public string? TemplateCode { get; set; }
        public int RetryCount { get; set; }
        public int MaxRetry { get; set; }
    }

    /// <summary>
    /// DTO สำหรับ Upload Log
    /// </summary>
    public class UploadLogDto
    {
        public int Id { get; set; }
        public int Seq { get; set; }
        public string? FileName { get; set; }
        public string? FileSize { get; set; }
        public string? UploadedBy { get; set; }
        public DateTime? UploadedDate { get; set; }
        public string? RefType { get; set; }
        public int? RefId { get; set; }
        public string? FileType { get; set; }
    }

    /// <summary>
    /// Request DTO สำหรับ Paginated Query
    /// </summary>
    public class AuditLogQueryRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortField { get; set; }
        public string SortOrder { get; set; } = "desc";
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Status { get; set; }
        public string? Username { get; set; }
        public string? SearchText { get; set; }
    }

    /// <summary>
    /// Response DTO สำหรับ Paginated Result
    /// </summary>
    /// <typeparam name="T">Type of data</typeparam>
    public class AuditLogPagedResult<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => Page > 1;
        public bool HasNextPage => Page < TotalPages;
    }

    // ═══════════════════════════════════════════════════════════════════
    // Activity Log DTOs (Phase 2 - Activity Logging for All Modules)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// DTO สำหรับ Activity Log Response
    /// </summary>
    public class ActivityLogDto
    {
        public long LogId { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? UserRole { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? TargetId { get; set; }
        public string? TargetType { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? RequestUrl { get; set; }
        public string Status { get; set; } = "SUCCESS";
        public string? ErrorMessage { get; set; }
        public int? DurationMs { get; set; }

        // Computed properties for display
        public string TimestampDisplay => Timestamp.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
        public string ActionDisplay => GetActionDisplay(Action);
        public string StatusDisplay => Status == "SUCCESS" ? "✅ สำเร็จ" : "❌ ล้มเหลว";
        public bool HasChanges => !string.IsNullOrEmpty(OldValue) || !string.IsNullOrEmpty(NewValue);

        private static string GetActionDisplay(string action)
        {
            return action?.ToUpper() switch
            {
                "CREATE" => "สร้าง",
                "UPDATE" => "แก้ไข",
                "DELETE" => "ลบ",
                "VIEW" => "ดู",
                "EXPORT" => "ส่งออก",
                "IMPORT" => "นำเข้า",
                "APPROVE" => "อนุมัติ",
                "REJECT" => "ปฏิเสธ",
                "MOVE_IN" => "Move In",
                "MOVE_OUT" => "Move Out",
                "ADDITIONAL" => "เพิ่มเติม",
                "CUT" => "ตัดงบ",
                "ASSIGN_ROLE" => "กำหนด Role",
                "ASSIGN_PERMISSION" => "กำหนด Permission",
                "LOGIN" => "เข้าสู่ระบบ",
                "LOGOUT" => "ออกจากระบบ",
                _ => action ?? "-"
            };
        }
    }

    /// <summary>
    /// Request DTO สำหรับสร้าง Activity Log
    /// </summary>
    public class CreateActivityLogRequest
    {
        /// <summary>
        /// ชื่อเมนู/โมดูล (ใช้ ActivityModules constants)
        /// </summary>
        public string ModuleName { get; set; } = string.Empty;

        /// <summary>
        /// ประเภทการกระทำ (ใช้ ActivityActions constants)
        /// </summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>
        /// PK ของข้อมูลที่ถูกกระทำ
        /// </summary>
        public string? TargetId { get; set; }

        /// <summary>
        /// ประเภท Entity: 'Movement', 'User', 'Role', 'MasterData'
        /// </summary>
        public string? TargetType { get; set; }

        /// <summary>
        /// ข้อมูลเดิมก่อนแก้ไข (object จะถูก serialize เป็น JSON)
        /// </summary>
        public object? OldValue { get; set; }

        /// <summary>
        /// ข้อมูลใหม่หลังแก้ไข (object จะถูก serialize เป็น JSON)
        /// </summary>
        public object? NewValue { get; set; }

        /// <summary>
        /// สถานะความสำเร็จ: SUCCESS, FAILED (default: SUCCESS)
        /// </summary>
        public string Status { get; set; } = "SUCCESS";

        /// <summary>
        /// Error Message กรณีที่ล้มเหลว
        /// </summary>
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// ระยะเวลาในการทำงาน (milliseconds)
        /// </summary>
        public int? DurationMs { get; set; }
    }

    /// <summary>
    /// Request DTO สำหรับ Query Activity Log
    /// </summary>
    public class ActivityLogQueryRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortField { get; set; }
        public string SortOrder { get; set; } = "desc";
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? ModuleName { get; set; }
        public string? Action { get; set; }
        public string? UserId { get; set; }
        public string? Status { get; set; }
        public string? SearchText { get; set; }
    }

    // ═══════════════════════════════════════════════════════════════════
    // Constants for Activity Logging
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Module Names สำหรับ Activity Logging
    /// </summary>
    public static class ActivityModules
    {
        // Main Modules
        public const string Dashboard = "Dashboard";
        public const string HeadCountPlanning = "Head Count Planning";
        public const string PEBonus = "PE Bonus";
        public const string PEHeadCount = "PE Head Count";
        public const string PEManagement = "PE Management";

        // Settings Modules
        public const string UserManagement = "User Management";
        public const string RoleManagement = "Role Management";
        public const string MasterData = "Master Data";
        public const string AuditLogs = "Audit Logs";
        public const string Settings = "Settings";
    }

    /// <summary>
    /// Action Types สำหรับ Activity Logging
    /// </summary>
    public static class ActivityActions
    {
        // Standard CRUD
        public const string View = "VIEW";
        public const string Create = "CREATE";
        public const string Update = "UPDATE";
        public const string Delete = "DELETE";

        // Import/Export
        public const string Export = "EXPORT";
        public const string Import = "IMPORT";

        // Approval Workflow
        public const string Approve = "APPROVE";
        public const string Reject = "REJECT";

        // PE Management Specific
        public const string MoveIn = "MOVE_IN";
        public const string MoveOut = "MOVE_OUT";
        public const string Additional = "ADDITIONAL";
        public const string Cut = "CUT";

        // User/Role Management
        public const string AssignRole = "ASSIGN_ROLE";
        public const string AssignPermission = "ASSIGN_PERMISSION";

        // Auth
        public const string Login = "LOGIN";
        public const string Logout = "LOGOUT";
    }
}
