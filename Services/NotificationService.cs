using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.PE;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            HRBudgetDbContext context,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Query Methods

        public async Task<int> GetUnreadCountAsync(string empCode)
        {
            return await _context.HRB_PE_NOTIFICATION
                .CountAsync(n => n.RecipientEmpCode == empCode
                              && !n.IsRead
                              && n.IsActive);
        }

        public async Task<NotificationCountDto> GetCountByCategoryAsync(string empCode)
        {
            var counts = await _context.HRB_PE_NOTIFICATION
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive)
                .GroupBy(n => n.NotificationCategory)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            return new NotificationCountDto
            {
                TotalUnread = counts.Sum(c => c.Count),
                PeMovement = counts.FirstOrDefault(c => c.Category == "PE_MOVEMENT")?.Count ?? 0,
                PeAdditional = counts.FirstOrDefault(c => c.Category == "PE_ADDITIONAL")?.Count ?? 0,
                BudgetApproval = counts.FirstOrDefault(c => c.Category == "BUDGET_APPROVAL")?.Count ?? 0,
                System = counts.FirstOrDefault(c => c.Category == "SYSTEM")?.Count ?? 0
            };
        }

        public async Task<NotificationListResponse> GetNotificationsAsync(string empCode, NotificationFilterDto filter)
        {
            var query = _context.HRB_PE_NOTIFICATION
                .Where(n => n.RecipientEmpCode == empCode && n.IsActive);

            // Filter by category
            if (!string.IsNullOrEmpty(filter.Category) && filter.Category != "ALL")
            {
                query = query.Where(n => n.NotificationCategory == filter.Category);
            }

            // Filter by read status
            if (filter.IsRead.HasValue)
            {
                query = query.Where(n => n.IsRead == filter.IsRead.Value);
            }

            var totalCount = await query.CountAsync();
            var unreadCount = await query.CountAsync(n => !n.IsRead);

            var items = await query
                .OrderByDescending(n => n.CreatedDate)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    MovementId = n.MovementId,
                    NotificationType = n.NotificationType,
                    NotificationCategory = n.NotificationCategory,
                    SenderEmpCode = n.SenderEmpCode,
                    SenderCostCenter = n.SenderCostCenter,
                    Title = n.Title,
                    Message = n.Message,
                    Hc = n.Hc,
                    BaseWage = n.BaseWage,
                    PeMonth = n.PeMonth,
                    PeYear = n.PeYear,
                    CompanyId = n.CompanyId,
                    ActionUrl = n.ActionUrl,
                    IsRead = n.IsRead,
                    HasAttachment = n.HasAttachment,
                    EmailSent = n.EmailSent,
                    CreatedDate = n.CreatedDate,
                    TimeAgo = GetTimeAgo(n.CreatedDate)
                })
                .ToListAsync();

            // Get count by category (filter out null categories to avoid dictionary key error)
            var categoryGroups = await _context.HRB_PE_NOTIFICATION
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive && n.NotificationCategory != null)
                .GroupBy(n => n.NotificationCategory!)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            var countByCategory = categoryGroups.ToDictionary(x => x.Category, x => x.Count);

            return new NotificationListResponse
            {
                Items = items,
                TotalCount = totalCount,
                UnreadCount = unreadCount,
                CountByCategory = countByCategory
            };
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int notificationId)
        {
            var n = await _context.HRB_PE_NOTIFICATION
                .FirstOrDefaultAsync(x => x.NotificationId == notificationId);

            if (n == null) return null;

            return new NotificationDto
            {
                NotificationId = n.NotificationId,
                MovementId = n.MovementId,
                NotificationType = n.NotificationType,
                NotificationCategory = n.NotificationCategory,
                SenderEmpCode = n.SenderEmpCode,
                SenderCostCenter = n.SenderCostCenter,
                Title = n.Title,
                Message = n.Message,
                Hc = n.Hc,
                BaseWage = n.BaseWage,
                PeMonth = n.PeMonth,
                PeYear = n.PeYear,
                CompanyId = n.CompanyId,
                ActionUrl = n.ActionUrl,
                IsRead = n.IsRead,
                HasAttachment = n.HasAttachment,
                EmailSent = n.EmailSent,
                CreatedDate = n.CreatedDate,
                TimeAgo = GetTimeAgo(n.CreatedDate)
            };
        }

        #endregion

        #region Action Methods

        public async Task<bool> MarkAsReadAsync(int notificationId, string empCode)
        {
            var notification = await _context.HRB_PE_NOTIFICATION
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId
                                       && n.RecipientEmpCode == empCode);

            if (notification == null) return false;

            notification.IsRead = true;
            notification.ReadDate = DateTime.Now;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> MarkAllAsReadAsync(string empCode)
        {
            var notifications = await _context.HRB_PE_NOTIFICATION
                .Where(n => n.RecipientEmpCode == empCode && !n.IsRead && n.IsActive)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
                n.ReadDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return notifications.Count;
        }

        #endregion

        #region Create Methods

        public async Task<int> CreateMovementNotificationAsync(CreateMovementNotificationRequest request)
        {
            var notification = new HRB_PE_NOTIFICATION
            {
                MovementId = request.MovementId,
                NotificationType = request.NotificationType,
                NotificationCategory = request.NotificationCategory,
                SenderEmpCode = request.SenderEmpCode,
                SenderCostCenter = request.SenderCostCenter,
                RecipientEmpCode = request.RecipientEmpCode,
                RecipientCostCenter = request.RecipientCostCenter,
                Title = request.Title,
                Message = request.Message,
                Hc = request.Hc,
                BaseWage = request.BaseWage,
                PeMonth = request.PeMonth,
                PeYear = request.PeYear,
                CompanyId = request.CompanyId,
                HasAttachment = request.HasAttachment,
                UploadLogId = request.UploadLogId,
                ActionUrl = $"/Home/BudgetPEManagement?movementId={request.MovementId}&highlight=true",
                CreatedDate = DateTime.Now,
                CreatedBy = request.SenderEmpCode
            };

            _context.HRB_PE_NOTIFICATION.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created notification {NotificationId} for movement {MovementId}",
                notification.NotificationId, request.MovementId);

            return notification.NotificationId;
        }

        public async Task<int> CreateApprovalResultNotificationAsync(int movementId, bool approved, string? reason = null)
        {
            var movement = await _context.HRB_PE_MOVEMENT.FindAsync(movementId);
            if (movement == null)
                throw new ArgumentException("Movement not found", nameof(movementId));

            var notificationType = approved ? "MOVE_APPROVED" : "MOVE_REJECTED";
            var title = approved
                ? "Move In Request Approved"
                : "Move In Request Rejected";
            var message = approved
                ? "Your move request has been approved."
                : $"Your move request has been rejected. Reason: {reason}";

            // ดึง CompanyId จาก HRB_PE_MANAGEMENT โดยใช้ Source Cost Center
            var peYear = int.TryParse(movement.MoveOutYear ?? movement.MoveInYear ?? "0", out var y) ? y : 0;
            var peMonth = int.TryParse(movement.MoveOutMonth ?? movement.MoveInMonth ?? "0", out var m) ? m : 0;

            var companyId = await _context.HRB_PE_MANAGEMENT
                .Where(x => x.CostCenterCode == movement.MoveOutCostCenterCode
                         && x.PeYear == peYear
                         && x.IsActive)
                .Select(x => x.CompanyId)
                .FirstOrDefaultAsync();

            var notification = new HRB_PE_NOTIFICATION
            {
                MovementId = movementId,
                NotificationType = notificationType,
                NotificationCategory = "PE_MOVEMENT",
                SenderEmpCode = movement.ApprovedBy ?? "SYSTEM",
                SenderCostCenter = movement.MoveInCostCenterCode,      // Target (ผู้อนุมัติ)
                RecipientEmpCode = movement.UpdatedBy ?? string.Empty,
                RecipientCostCenter = movement.MoveOutCostCenterCode,  // Source (ผู้ขอ)
                Title = title,
                Message = message,
                Hc = movement.MoveOutHc ?? movement.MoveInHc ?? 0,
                BaseWage = movement.MoveOutBaseWage ?? movement.MoveInBaseWage ?? 0,
                PeMonth = peMonth,
                PeYear = peYear,
                CompanyId = companyId,
                ActionUrl = $"/Home/BudgetPEManagement?movementId={movementId}",
                CreatedDate = DateTime.Now,
                CreatedBy = movement.ApprovedBy ?? "SYSTEM"
            };

            _context.HRB_PE_NOTIFICATION.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created approval result notification {NotificationId} for movement {MovementId}, approved: {Approved}",
                notification.NotificationId, movementId, approved);

            return notification.NotificationId;
        }

        #endregion

        #region Helper Methods

        private static string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
            if (timeSpan.TotalDays < 365)
                return $"{(int)(timeSpan.TotalDays / 30)} months ago";

            return $"{(int)(timeSpan.TotalDays / 365)} years ago";
        }

        #endregion
    }
}
