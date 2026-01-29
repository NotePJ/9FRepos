namespace HCBPCoreUI_Backend.DTOs.Notification
{
    /// <summary>
    /// DTO สำหรับแสดง Notification
    /// </summary>
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int MovementId { get; set; }
        public string NotificationType { get; set; } = string.Empty;
        public string NotificationCategory { get; set; } = string.Empty;

        // Sender Info
        public string SenderEmpCode { get; set; } = string.Empty;
        public string? SenderName { get; set; }
        public string? SenderCostCenter { get; set; }

        // Content
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }

        // Movement Details
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }
        public int PeMonth { get; set; }
        public int PeYear { get; set; }
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }

        // Action
        public string? ActionUrl { get; set; }

        // Status
        public bool IsRead { get; set; }
        public bool HasAttachment { get; set; }
        public bool EmailSent { get; set; }

        // Timestamps
        public DateTime CreatedDate { get; set; }
        public string? TimeAgo { get; set; }  // "5 minutes ago", "2 hours ago"
    }

    /// <summary>
    /// DTO สำหรับ Filter Notification
    /// </summary>
    public class NotificationFilterDto
    {
        public string? Category { get; set; }  // PE_MOVEMENT, PE_ADDITIONAL, ALL
        public bool? IsRead { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    /// <summary>
    /// Response สำหรับ List Notifications
    /// </summary>
    public class NotificationListResponse
    {
        public List<NotificationDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public Dictionary<string, int> CountByCategory { get; set; } = new();
    }

    /// <summary>
    /// DTO สำหรับ Count by Category
    /// </summary>
    public class NotificationCountDto
    {
        public int TotalUnread { get; set; }
        public int PeMovement { get; set; }
        public int PeAdditional { get; set; }
        public int BudgetApproval { get; set; }
        public int System { get; set; }
    }

    /// <summary>
    /// Request สำหรับ Reject Movement
    /// </summary>
    public class RejectRequest
    {
        public int MovementId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request สำหรับ Approve Movement
    /// </summary>
    public class ApproveRequest
    {
        public int MovementId { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// Request สำหรับสร้าง Movement Notification
    /// </summary>
    public class CreateMovementNotificationRequest
    {
        public int MovementId { get; set; }
        public string NotificationType { get; set; } = string.Empty;  // MOVE_IN_REQUEST, ADDITIONAL_REQUEST
        public string NotificationCategory { get; set; } = string.Empty;  // PE_MOVEMENT, PE_ADDITIONAL
        public string SenderEmpCode { get; set; } = string.Empty;
        public string SenderCostCenter { get; set; } = string.Empty;
        public string RecipientEmpCode { get; set; } = string.Empty;
        public string RecipientCostCenter { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }
        public int PeMonth { get; set; }
        public int PeYear { get; set; }
        public int CompanyId { get; set; }
        public bool HasAttachment { get; set; }
        public int? UploadLogId { get; set; }
        public bool SendEmail { get; set; } = true;
    }
}
