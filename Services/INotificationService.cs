using HCBPCoreUI_Backend.DTOs.Notification;

namespace HCBPCoreUI_Backend.Services
{
    public interface INotificationService
    {
        // ===== Query Methods =====

        /// <summary>
        /// ดึงจำนวน Notification ที่ยังไม่อ่าน
        /// </summary>
        Task<int> GetUnreadCountAsync(string empCode);

        /// <summary>
        /// ดึงจำนวน Notification แยกตาม Category
        /// </summary>
        Task<NotificationCountDto> GetCountByCategoryAsync(string empCode);

        /// <summary>
        /// ดึงรายการ Notification
        /// </summary>
        Task<NotificationListResponse> GetNotificationsAsync(string empCode, NotificationFilterDto filter);

        /// <summary>
        /// ดึง Notification ตาม ID
        /// </summary>
        Task<NotificationDto?> GetNotificationByIdAsync(int notificationId);

        // ===== Action Methods =====

        /// <summary>
        /// Mark notification as read
        /// </summary>
        Task<bool> MarkAsReadAsync(int notificationId, string empCode);

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        Task<int> MarkAllAsReadAsync(string empCode);

        // ===== Create Methods =====

        /// <summary>
        /// สร้าง Notification สำหรับ Movement Request
        /// </summary>
        Task<int> CreateMovementNotificationAsync(CreateMovementNotificationRequest request);

        /// <summary>
        /// สร้าง Notification สำหรับ Approval Result
        /// </summary>
        Task<int> CreateApprovalResultNotificationAsync(int movementId, bool approved, string? reason = null);
    }
}
