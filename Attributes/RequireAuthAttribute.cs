using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HCBPCoreUI_Backend.Attributes
{
    /// <summary>
    /// Attribute to require user authentication (logged in)
    /// Usage:
    ///   [RequireAuth]  // Simple login check
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireAuthAttribute : TypeFilterAttribute
    {
        public RequireAuthAttribute() : base(typeof(RequireAuthFilter))
        {
        }
    }

    /// <summary>
    /// Filter implementation for RequireAuth attribute
    /// </summary>
    public class RequireAuthFilter : IAuthorizationFilter
    {
        private readonly ILogger<RequireAuthFilter> _logger;

        public RequireAuthFilter(ILogger<RequireAuthFilter> logger)
        {
            _logger = logger;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var employeeNo = context.HttpContext.Session.GetString("EmployeeNo");

            // Check if user is logged in
            if (string.IsNullOrEmpty(employeeNo))
            {
                _logger.LogWarning("Unauthorized access attempt - No session from {IpAddress}",
                    context.HttpContext.Connection.RemoteIpAddress);

                HandleUnauthorized(context);
                return;
            }

            _logger.LogDebug("Auth check passed for {EmployeeNo}", employeeNo);
        }

        private void HandleUnauthorized(AuthorizationFilterContext context)
        {
            var returnUrl = context.HttpContext.Request.Path + context.HttpContext.Request.QueryString;

            if (IsAjaxRequest(context.HttpContext.Request))
            {
                context.Result = new JsonResult(new
                {
                    success = false,
                    error = "กรุณาเข้าสู่ระบบก่อน",
                    redirectUrl = $"/Auth/Index?path={Uri.EscapeDataString(returnUrl)}"
                })
                {
                    StatusCode = 401
                };
            }
            else
            {
                context.Result = new RedirectToActionResult("Index", "Auth",
                    new { path = returnUrl });
            }
        }

        private bool IsAjaxRequest(HttpRequest request)
        {
            return request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                   request.Headers["Accept"].ToString().Contains("application/json");
        }
    }
}
