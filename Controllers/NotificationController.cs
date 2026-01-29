using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace HCBPCoreUI_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// GET: api/notification/count
        /// Get unread notification count for current user
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                if (string.IsNullOrEmpty(empCode))
                {
                    // Return 0 if not logged in (for bell icon to work)
                    return Ok(new { success = true, unreadCount = 0 });
                }

                var count = await _notificationService.GetUnreadCountAsync(empCode);
                return Ok(new { success = true, unreadCount = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return Ok(new { success = true, unreadCount = 0 });
            }
        }

        /// <summary>
        /// GET: api/notification/count-by-category
        /// Get notification counts grouped by category
        /// </summary>
        [HttpGet("count-by-category")]
        public async Task<IActionResult> GetCountByCategory()
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                if (string.IsNullOrEmpty(empCode))
                {
                    return Ok(new { success = true, counts = new Dictionary<string, int>() });
                }

                var counts = await _notificationService.GetCountByCategoryAsync(empCode);
                return Ok(new { success = true, counts = counts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting count by category");
                return Ok(new { success = true, counts = new Dictionary<string, int>() });
            }
        }

        /// <summary>
        /// GET: api/notification/list
        /// Get notification list with pagination
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] string? category = null,
            [FromQuery] bool? isRead = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                if (string.IsNullOrEmpty(empCode))
                {
                    return Ok(new { success = true, items = new List<object>(), total = 0, page = 1, pageSize = pageSize });
                }

                var filter = new NotificationFilterDto
                {
                    Category = category,
                    IsRead = isRead,
                    Page = page,
                    PageSize = pageSize
                };

                var result = await _notificationService.GetNotificationsAsync(empCode, filter);
                return Ok(new { success = true, items = result.Items, totalCount = result.TotalCount, unreadCount = result.UnreadCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/notification/{id}
        /// Get single notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(int id)
        {
            try
            {
                var notification = await _notificationService.GetNotificationByIdAsync(id);

                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });

                return Ok(new { success = true, data = notification });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {Id}", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/notification/read/{id}
        /// Mark notification as read
        /// </summary>
        [HttpPost("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                if (string.IsNullOrEmpty(empCode))
                    return Unauthorized(new { success = false, message = "User not authenticated" });

                var result = await _notificationService.MarkAsReadAsync(id, empCode);

                if (!result)
                    return NotFound(new { success = false, message = "Notification not found" });

                return Ok(new { success = true, message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {Id} as read", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/notification/read-all
        /// Mark all notifications as read
        /// </summary>
        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                if (string.IsNullOrEmpty(empCode))
                    return Unauthorized(new { success = false, message = "User not authenticated" });

                var count = await _notificationService.MarkAllAsReadAsync(empCode);
                return Ok(new { success = true, message = $"{count} notifications marked as read", data = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get current user's employee code from session
        /// </summary>
        private string? GetCurrentUserEmpCode()
        {
            return HttpContext.Session.GetString("EmployeeNo");
        }
    }
}
