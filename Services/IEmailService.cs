using HCBPCoreUI_Backend.DTOs.Notification;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Email Service Interface สำหรับส่ง Email Notifications
    /// Phase 6: Email Integration
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// ส่ง Email แจ้งเตือนทั่วไป
        /// </summary>
        Task<bool> SendEmailAsync(EmailRequest request);

        /// <summary>
        /// ส่ง Email แจ้งเตือน Movement ใหม่ที่รอการอนุมัติ
        /// </summary>
        Task<bool> SendMovementPendingEmailAsync(MovementEmailRequest request);

        /// <summary>
        /// ส่ง Email แจ้งเตือนผลการอนุมัติ (Approved/Rejected)
        /// </summary>
        Task<bool> SendMovementResultEmailAsync(MovementResultEmailRequest request);

        /// <summary>
        /// Retry ส่ง Email ที่ล้มเหลว
        /// </summary>
        Task<int> RetryFailedEmailsAsync(int maxRetryCount = 3);
    }

    /// <summary>
    /// Email Request DTO
    /// </summary>
    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
        public string? TemplateCode { get; set; }
        public Dictionary<string, string>? TemplateParams { get; set; }
    }

    /// <summary>
    /// Movement Email Request สำหรับแจ้งเตือน Movement ใหม่
    /// </summary>
    public class MovementEmailRequest
    {
        public int MovementId { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public string CostCenterCode { get; set; } = string.Empty;
        public string CostCenterName { get; set; } = string.Empty;
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }
        public string? Remark { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        // Recipients
        public string ApproverEmail { get; set; } = string.Empty;
        public string? CcEmails { get; set; }
    }

    /// <summary>
    /// Movement Result Email สำหรับแจ้งผลการอนุมัติ
    /// </summary>
    public class MovementResultEmailRequest
    {
        public int MovementId { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public string CostCenterCode { get; set; } = string.Empty;
        public string CostCenterName { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty; // Approved / Rejected
        public string? RejectedReason { get; set; }
        public string ApprovedBy { get; set; } = string.Empty;
        public DateTime ApprovedDate { get; set; }

        // Recipients
        public string RequesterEmail { get; set; } = string.Empty;
        public string? CcEmails { get; set; }
    }
}
