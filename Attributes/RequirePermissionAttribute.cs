using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;

namespace HCBPCoreUI_Backend.Attributes
{
    /// <summary>
    /// Attribute to require specific permission(s) for accessing a Controller or Action
    /// Usage:
    ///   [RequirePermission("PAGE_PE_MANAGEMENT")]
    ///   [RequirePermission("BTN_APPROVE", "BTN_REJECT")]  // Requires ANY of these
    ///   [RequirePermission(new[] {"PERM1", "PERM2"}, RequireAll = true)]  // Requires ALL
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class RequirePermissionAttribute : TypeFilterAttribute
    {
        public RequirePermissionAttribute(params string[] permissions)
            : base(typeof(RequirePermissionFilter))
        {
            Arguments = new object[] { permissions, false };
        }

        public RequirePermissionAttribute(string[] permissions, bool requireAll)
            : base(typeof(RequirePermissionFilter))
        {
            Arguments = new object[] { permissions, requireAll };
        }
    }

    /// <summary>
    /// Filter implementation for RequirePermission attribute
    /// </summary>
    public class RequirePermissionFilter : IAuthorizationFilter
    {
        private readonly string[] _requiredPermissions;
        private readonly bool _requireAll;
        private readonly ILogger<RequirePermissionFilter> _logger;

        public RequirePermissionFilter(
            string[] permissions,
            bool requireAll,
            ILogger<RequirePermissionFilter> logger)
        {
            _requiredPermissions = permissions;
            _requireAll = requireAll;
            _logger = logger;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var employeeNo = context.HttpContext.Session.GetString("EmployeeNo");

            // Check if user is logged in
            if (string.IsNullOrEmpty(employeeNo))
            {
                _logger.LogWarning("Unauthorized access attempt - No session");
                HandleUnauthorized(context, "กรุณาเข้าสู่ระบบก่อน");
                return;
            }

            // Get user permissions from session
            var permissionsJson = context.HttpContext.Session.GetString("UserPermissions");
            var userPermissions = new List<string>();

            if (!string.IsNullOrEmpty(permissionsJson))
            {
                try
                {
                    userPermissions = JsonSerializer.Deserialize<List<string>>(permissionsJson) ?? new List<string>();
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize UserPermissions");
                }
            }

            // Check ADMIN role - bypass permission check
            var isAdmin = context.HttpContext.Session.GetString("IsAdmin");
            if (isAdmin == "True")
            {
                _logger.LogDebug("Admin user {EmployeeNo} bypassing permission check", employeeNo);
                return;
            }

            // Check permissions
            bool hasPermission;
            if (_requireAll)
            {
                // Require ALL permissions
                hasPermission = _requiredPermissions.All(p => userPermissions.Contains(p));
            }
            else
            {
                // Require ANY permission
                hasPermission = _requiredPermissions.Any(p => userPermissions.Contains(p));
            }

            if (!hasPermission)
            {
                var noRole = userPermissions.Count == 0;
                _logger.LogWarning("Access denied for {EmployeeNo}. Required: [{Required}], Has: [{Has}], NoRole: {NoRole}",
                    employeeNo,
                    string.Join(", ", _requiredPermissions),
                    string.Join(", ", userPermissions),
                    noRole);

                HandleForbidden(context, "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", noRole);
                return;
            }

            _logger.LogDebug("Permission granted for {EmployeeNo} to access [{Permissions}]",
                employeeNo, string.Join(", ", _requiredPermissions));
        }

        private void HandleUnauthorized(AuthorizationFilterContext context, string message)
        {
            if (IsAjaxRequest(context.HttpContext.Request))
            {
                context.Result = new JsonResult(new
                {
                    success = false,
                    error = message,
                    redirectUrl = "/Auth/Index"
                })
                {
                    StatusCode = 401
                };
            }
            else
            {
                context.Result = new RedirectToActionResult("Index", "Auth", null);
            }
        }

        private void HandleForbidden(AuthorizationFilterContext context, string message, bool noRole = false)
        {
            if (IsAjaxRequest(context.HttpContext.Request))
            {
                context.Result = new JsonResult(new
                {
                    success = false,
                    error = message,
                    noRole = noRole
                })
                {
                    StatusCode = 403
                };
            }
            else
            {
                // ส่ง NoRole ผ่าน HttpContext.Items
                context.HttpContext.Items["NoRole"] = noRole;

                // Redirect to forbidden page or show error
                context.Result = new ViewResult
                {
                    ViewName = "~/Views/Shared/Forbidden.cshtml",
                    StatusCode = 403
                };
            }
        }

        private bool IsAjaxRequest(HttpRequest request)
        {
            return request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                   request.Headers["Accept"].ToString().Contains("application/json");
        }
    }
}
