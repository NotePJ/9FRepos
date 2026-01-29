using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;

namespace HCBPCoreUI_Backend.Attributes
{
    /// <summary>
    /// Attribute to require specific role(s) for accessing a Controller or Action
    /// Usage:
    ///   [RequireRole("ADMIN")]
    ///   [RequireRole("ADMIN", "SUPER_USER")]  // Requires ANY of these roles
    ///   [RequireRole(new[] {"ADMIN", "MANAGER"}, RequireAll = true)]  // Requires ALL roles
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class RequireRoleAttribute : TypeFilterAttribute
    {
        public RequireRoleAttribute(params string[] roles)
            : base(typeof(RequireRoleFilter))
        {
            Arguments = new object[] { roles, false };
        }

        public RequireRoleAttribute(string[] roles, bool requireAll)
            : base(typeof(RequireRoleFilter))
        {
            Arguments = new object[] { roles, requireAll };
        }
    }

    /// <summary>
    /// Filter implementation for RequireRole attribute
    /// </summary>
    public class RequireRoleFilter : IAuthorizationFilter
    {
        private readonly string[] _requiredRoles;
        private readonly bool _requireAll;
        private readonly ILogger<RequireRoleFilter> _logger;

        public RequireRoleFilter(
            string[] roles,
            bool requireAll,
            ILogger<RequireRoleFilter> logger)
        {
            _requiredRoles = roles;
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

            // Get user roles from session
            var rolesJson = context.HttpContext.Session.GetString("UserRoles");
            var userRoles = new List<string>();

            if (!string.IsNullOrEmpty(rolesJson))
            {
                try
                {
                    userRoles = JsonSerializer.Deserialize<List<string>>(rolesJson) ?? new List<string>();
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize UserRoles");
                }
            }

            // Check roles
            bool hasRole;
            if (_requireAll)
            {
                // Require ALL roles
                hasRole = _requiredRoles.All(r => userRoles.Contains(r));
            }
            else
            {
                // Require ANY role
                hasRole = _requiredRoles.Any(r => userRoles.Contains(r));
            }

            if (!hasRole)
            {
                var noRole = userRoles.Count == 0;
                _logger.LogWarning("Access denied for {EmployeeNo}. Required roles: [{Required}], Has: [{Has}], NoRole: {NoRole}",
                    employeeNo,
                    string.Join(", ", _requiredRoles),
                    string.Join(", ", userRoles),
                    noRole);

                HandleForbidden(context, "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", noRole);
                return;
            }

            _logger.LogDebug("Role granted for {EmployeeNo} to access with roles [{Roles}]",
                employeeNo, string.Join(", ", _requiredRoles));
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

                var viewResult = new ViewResult
                {
                    ViewName = "~/Views/Shared/Forbidden.cshtml",
                    StatusCode = 403
                };
                context.Result = viewResult;
            }
        }

        private bool IsAjaxRequest(HttpRequest request)
        {
            return request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                   request.Headers["Accept"].ToString().Contains("application/json");
        }
    }
}
