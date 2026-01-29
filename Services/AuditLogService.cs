using HCBPCoreUI_Backend.DTOs.AuditLog;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using HCBPCoreUI_Backend.Models.Log;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Audit Log Service Implementation
    /// สำหรับดึงข้อมูล Log ประเภทต่างๆ และบันทึก Activity Log
    /// </summary>
    public class AuditLogService : IAuditLogService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<AuditLogService> _logger;

        // JSON Serializer Options
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // Sensitive fields to mask
        private static readonly HashSet<string> _sensitiveFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "password", "passwordhash", "passwordsalt", "idcard", "idcardnumber",
            "creditcard", "cvv", "pin", "secret", "token", "apikey"
        };

        public AuditLogService(HRBudgetDbContext context, ILogger<AuditLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════════
        // Activity Log Methods (Phase 2)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// ดึงข้อมูล Activity Logs (Client-side pagination by AG Grid)
        /// </summary>
        public async Task<AuditLogPagedResult<ActivityLogDto>> GetActivityLogsAsync(ActivityLogQueryRequest request)
        {
            try
            {
                var query = _context.HRB_ACTIVITY_LOG.AsNoTracking();

                // Apply filters
                if (request.DateFrom.HasValue)
                {
                    query = query.Where(x => x.Timestamp >= request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    var endDate = request.DateTo.Value.AddDays(1);
                    query = query.Where(x => x.Timestamp < endDate);
                }

                if (!string.IsNullOrEmpty(request.ModuleName) && request.ModuleName != "ALL")
                {
                    query = query.Where(x => x.ModuleName == request.ModuleName);
                }

                if (!string.IsNullOrEmpty(request.Action) && request.Action != "ALL")
                {
                    query = query.Where(x => x.Action == request.Action);
                }

                if (!string.IsNullOrEmpty(request.UserId))
                {
                    query = query.Where(x => x.UserId.Contains(request.UserId) ||
                                            (x.Username != null && x.Username.Contains(request.UserId)));
                }

                if (!string.IsNullOrEmpty(request.Status) && request.Status != "ALL")
                {
                    query = query.Where(x => x.Status == request.Status);
                }

                if (!string.IsNullOrEmpty(request.SearchText))
                {
                    query = query.Where(x =>
                        x.UserId.Contains(request.SearchText) ||
                        (x.Username != null && x.Username.Contains(request.SearchText)) ||
                        x.ModuleName.Contains(request.SearchText) ||
                        x.Action.Contains(request.SearchText) ||
                        (x.TargetId != null && x.TargetId.Contains(request.SearchText)));
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply sorting (default: Timestamp desc)
                query = ApplyActivityLogSorting(query, request.SortField, request.SortOrder ?? "desc");

                // Get all data (AG Grid handles client-side pagination)
                var data = await query
                    .Select(x => new ActivityLogDto
                    {
                        LogId = x.LogId,
                        Timestamp = x.Timestamp,
                        UserId = x.UserId,
                        Username = x.Username,
                        UserRole = x.UserRole,
                        ModuleName = x.ModuleName,
                        Action = x.Action,
                        TargetId = x.TargetId,
                        TargetType = x.TargetType,
                        OldValue = x.OldValue,
                        NewValue = x.NewValue,
                        IpAddress = x.IpAddress,
                        UserAgent = x.UserAgent,
                        RequestUrl = x.RequestUrl,
                        Status = x.Status,
                        ErrorMessage = x.ErrorMessage,
                        DurationMs = x.DurationMs
                    })
                    .ToListAsync();

                return new AuditLogPagedResult<ActivityLogDto>
                {
                    Data = data,
                    TotalCount = totalCount,
                    Page = 1,
                    PageSize = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching activity logs");
                throw;
            }
        }

        /// <summary>
        /// บันทึก Activity Log (Async - Fire and Forget)
        /// </summary>
        public async Task LogActivityAsync(CreateActivityLogRequest request, HttpContext context)
        {
            try
            {
                var (userId, username, userRole) = GetUserInfo(context);

                var activityLog = new HRB_ACTIVITY_LOG
                {
                    Timestamp = DateTime.UtcNow,
                    UserId = userId,
                    Username = username,
                    UserRole = userRole,
                    ModuleName = request.ModuleName,
                    Action = request.Action,
                    TargetId = request.TargetId,
                    TargetType = request.TargetType,
                    OldValue = SerializeAndMask(request.OldValue),
                    NewValue = SerializeAndMask(request.NewValue),
                    IpAddress = GetIpAddress(context),
                    UserAgent = GetUserAgent(context),
                    RequestUrl = GetRequestUrl(context),
                    Status = request.Status,
                    ErrorMessage = request.ErrorMessage,
                    DurationMs = request.DurationMs
                };

                _context.HRB_ACTIVITY_LOG.Add(activityLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Activity logged: {Module}/{Action} by {UserId} on {TargetId}",
                    request.ModuleName, request.Action, userId, request.TargetId);
            }
            catch (Exception ex)
            {
                // Log error but don't throw - Activity logging should not break main flow
                _logger.LogError(ex, "Error logging activity: {Module}/{Action}", request.ModuleName, request.Action);
            }
        }

        /// <summary>
        /// Helper Method สำหรับบันทึก Activity Log อย่างง่าย
        /// </summary>
        public async Task LogAsync(
            string moduleName,
            string action,
            string? targetId,
            string? targetType,
            object? oldValue,
            object? newValue,
            HttpContext context,
            string status = "SUCCESS",
            string? errorMessage = null)
        {
            var request = new CreateActivityLogRequest
            {
                ModuleName = moduleName,
                Action = action,
                TargetId = targetId,
                TargetType = targetType,
                OldValue = oldValue,
                NewValue = newValue,
                Status = status,
                ErrorMessage = errorMessage
            };

            await LogActivityAsync(request, context);
        }

        /// <summary>
        /// ดึงรายการ Module ทั้งหมดที่มี Log
        /// </summary>
        public async Task<List<string>> GetDistinctModulesAsync()
        {
            return await _context.HRB_ACTIVITY_LOG
                .AsNoTracking()
                .Select(x => x.ModuleName)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();
        }

        /// <summary>
        /// ดึงรายการ Action ทั้งหมดที่มี Log
        /// </summary>
        public async Task<List<string>> GetDistinctActionsAsync()
        {
            return await _context.HRB_ACTIVITY_LOG
                .AsNoTracking()
                .Select(x => x.Action)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();
        }

        // ═══════════════════════════════════════════════════════════════════
        // Helper Methods for Activity Log
        // ═══════════════════════════════════════════════════════════════════

        private (string userId, string? username, string? userRole) GetUserInfo(HttpContext context)
        {
            var userId = context.Session.GetString("EmployeeNo") ?? "SYSTEM";
            var username = context.Session.GetString("Username") ?? context.Session.GetString("DisplayName");
            var userRole = context.Session.GetString("UserRole") ?? context.Session.GetString("RoleName");

            return (userId, username, userRole);
        }

        private static string GetIpAddress(HttpContext context)
        {
            // Try to get real IP from X-Forwarded-For header (if behind proxy)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            // Fall back to RemoteIpAddress
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private static string GetUserAgent(HttpContext context)
        {
            var userAgent = context.Request.Headers["User-Agent"].FirstOrDefault();
            // Truncate if too long
            return userAgent?.Length > 500 ? userAgent[..500] : userAgent ?? "Unknown";
        }

        private static string GetRequestUrl(HttpContext context)
        {
            var url = $"{context.Request.Method} {context.Request.Path}{context.Request.QueryString}";
            // Truncate if too long
            return url.Length > 500 ? url[..500] : url;
        }

        private string? SerializeAndMask(object? obj)
        {
            if (obj == null) return null;

            try
            {
                // If already a string (might be JSON), return as-is
                if (obj is string str)
                {
                    return MaskSensitiveDataInJson(str);
                }

                // Serialize to JSON
                var json = JsonSerializer.Serialize(obj, _jsonOptions);

                // Mask sensitive data
                return MaskSensitiveDataInJson(json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error serializing object for activity log");
                return obj.ToString();
            }
        }

        private static string MaskSensitiveDataInJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return json;

            // Simple masking - replace values of sensitive fields
            foreach (var field in _sensitiveFields)
            {
                // Pattern: "fieldName":"value" or "fieldName": "value"
                var pattern = $"\"{field}\"\\s*:\\s*\"[^\"]*\"";
                json = System.Text.RegularExpressions.Regex.Replace(
                    json,
                    pattern,
                    $"\"{field}\":\"***MASKED***\"",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            }

            return json;
        }

        private static IQueryable<HRB_ACTIVITY_LOG> ApplyActivityLogSorting(
            IQueryable<HRB_ACTIVITY_LOG> query, string? sortField, string sortOrder)
        {
            var isDesc = sortOrder?.ToLower() == "desc";

            return sortField?.ToLower() switch
            {
                "userid" => isDesc ? query.OrderByDescending(x => x.UserId) : query.OrderBy(x => x.UserId),
                "username" => isDesc ? query.OrderByDescending(x => x.Username) : query.OrderBy(x => x.Username),
                "modulename" => isDesc ? query.OrderByDescending(x => x.ModuleName) : query.OrderBy(x => x.ModuleName),
                "action" => isDesc ? query.OrderByDescending(x => x.Action) : query.OrderBy(x => x.Action),
                "targetid" => isDesc ? query.OrderByDescending(x => x.TargetId) : query.OrderBy(x => x.TargetId),
                "status" => isDesc ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
                "ipaddress" => isDesc ? query.OrderByDescending(x => x.IpAddress) : query.OrderBy(x => x.IpAddress),
                _ => isDesc ? query.OrderByDescending(x => x.Timestamp) : query.OrderBy(x => x.Timestamp)
            };
        }

        // ═══════════════════════════════════════════════════════════════════
        // Existing Log Methods (Login, Email, Upload)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// ดึงข้อมูล Login Logs (ทั้งหมดตาม filter - AG Grid จัดการ pagination)
        /// </summary>
        public async Task<AuditLogPagedResult<LoginLogDto>> GetLoginLogsAsync(AuditLogQueryRequest request)
        {
            try
            {
                var query = _context.HRB_USER_LOGIN_LOG.AsNoTracking();

                // Apply filters
                if (request.DateFrom.HasValue)
                {
                    query = query.Where(x => x.LoginTime >= request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    var endDate = request.DateTo.Value.AddDays(1); // Include the entire day
                    query = query.Where(x => x.LoginTime < endDate);
                }

                if (!string.IsNullOrEmpty(request.Status) && request.Status != "ALL")
                {
                    query = query.Where(x => x.LoginStatus == request.Status);
                }

                if (!string.IsNullOrEmpty(request.Username))
                {
                    query = query.Where(x => x.Username.Contains(request.Username));
                }

                if (!string.IsNullOrEmpty(request.SearchText))
                {
                    query = query.Where(x =>
                        x.Username.Contains(request.SearchText) ||
                        (x.IPAddress != null && x.IPAddress.Contains(request.SearchText)) ||
                        (x.Company != null && x.Company.Contains(request.SearchText)));
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply sorting (default: LoginTime desc)
                query = ApplyLoginLogSorting(query, request.SortField, request.SortOrder ?? "desc");

                // Get all data (AG Grid handles client-side pagination)
                var data = await query
                    .Select(x => new LoginLogDto
                    {
                        Id = x.Id,
                        UserId = x.UserId,
                        Username = x.Username,
                        LoginTime = x.LoginTime,
                        LogoutTime = x.LogoutTime,
                        IpAddress = x.IPAddress,
                        UserAgent = x.UserAgent,
                        AuthType = x.AuthType,
                        LoginStatus = x.LoginStatus,
                        FailReason = x.FailReason,
                        Company = x.Company
                    })
                    .ToListAsync();

                return new AuditLogPagedResult<LoginLogDto>
                {
                    Data = data,
                    TotalCount = totalCount,
                    Page = 1,
                    PageSize = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching login logs");
                throw;
            }
        }

        /// <summary>
        /// ดึงข้อมูล Email Logs (ทั้งหมดตาม filter - AG Grid จัดการ pagination)
        /// </summary>
        public async Task<AuditLogPagedResult<EmailLogDto>> GetEmailLogsAsync(AuditLogQueryRequest request)
        {
            try
            {
                var query = _context.HRB_EMAIL_LOG.AsNoTracking();

                // Apply filters
                if (request.DateFrom.HasValue)
                {
                    query = query.Where(x => x.SendedDate >= request.DateFrom.Value || x.UpdatedDate >= request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    var endDate = request.DateTo.Value.AddDays(1);
                    query = query.Where(x => x.SendedDate < endDate || x.UpdatedDate < endDate);
                }

                if (!string.IsNullOrEmpty(request.Status) && request.Status != "ALL")
                {
                    query = query.Where(x => x.SendStatus == request.Status);
                }

                if (!string.IsNullOrEmpty(request.SearchText))
                {
                    query = query.Where(x =>
                        (x.ToEmail != null && x.ToEmail.Contains(request.SearchText)) ||
                        (x.SubjectEmail != null && x.SubjectEmail.Contains(request.SearchText)) ||
                        (x.EmailType != null && x.EmailType.Contains(request.SearchText)));
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply sorting (default: SentDate desc)
                query = ApplyEmailLogSorting(query, request.SortField, request.SortOrder ?? "desc");

                // Get all data (AG Grid handles client-side pagination)
                var data = await query
                    .Select(x => new EmailLogDto
                    {
                        EmailId = x.EmailId,
                        EmailRefId = x.EmailRefId,
                        EmailType = x.EmailType,
                        ToEmail = x.ToEmail,
                        CcEmail = x.CcEmail,
                        Subject = x.SubjectEmail,
                        SendStatus = x.SendStatus,
                        ResponseMessage = x.ResponseMessage,
                        SentDate = x.SendedDate,
                        UpdatedDate = x.UpdatedDate,
                        UpdatedBy = x.UpdatedBy,
                        RefType = x.RefType,
                        RefId = x.RefId,
                        TemplateCode = x.TemplateCode,
                        RetryCount = x.RetryCount,
                        MaxRetry = x.MaxRetry
                    })
                    .ToListAsync();

                return new AuditLogPagedResult<EmailLogDto>
                {
                    Data = data,
                    TotalCount = totalCount,
                    Page = 1,
                    PageSize = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching email logs");
                throw;
            }
        }

        /// <summary>
        /// ดึงข้อมูล Upload Logs (ทั้งหมดตาม filter - AG Grid จัดการ pagination)
        /// </summary>
        public async Task<AuditLogPagedResult<UploadLogDto>> GetUploadLogsAsync(AuditLogQueryRequest request)
        {
            try
            {
                var query = _context.HRB_UPLOAD_LOG.AsNoTracking();

                // Apply filters
                if (request.DateFrom.HasValue)
                {
                    query = query.Where(x => x.UploadedDate >= request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    var endDate = request.DateTo.Value.AddDays(1);
                    query = query.Where(x => x.UploadedDate < endDate);
                }

                if (!string.IsNullOrEmpty(request.Username))
                {
                    query = query.Where(x => x.UploadedBy != null && x.UploadedBy.Contains(request.Username));
                }

                if (!string.IsNullOrEmpty(request.SearchText))
                {
                    query = query.Where(x =>
                        (x.FileName != null && x.FileName.Contains(request.SearchText)) ||
                        (x.UploadedBy != null && x.UploadedBy.Contains(request.SearchText)) ||
                        (x.RefType != null && x.RefType.Contains(request.SearchText)));
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply sorting (default: UploadedDate desc)
                query = ApplyUploadLogSorting(query, request.SortField, request.SortOrder ?? "desc");

                // Get all data (AG Grid handles client-side pagination)
                var data = await query
                    .Select(x => new UploadLogDto
                    {
                        Id = x.Id,
                        Seq = x.Seq,
                        FileName = x.FileName,
                        FileSize = x.FileSize,
                        UploadedBy = x.UploadedBy,
                        UploadedDate = x.UploadedDate,
                        RefType = x.RefType,
                        RefId = x.RefId,
                        FileType = x.FileType
                    })
                    .ToListAsync();

                return new AuditLogPagedResult<UploadLogDto>
                {
                    Data = data,
                    TotalCount = totalCount,
                    Page = 1,
                    PageSize = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload logs");
                throw;
            }
        }

        #region Private Helper Methods

        private static IQueryable<HRB_USER_LOGIN_LOG> ApplyLoginLogSorting(
            IQueryable<HRB_USER_LOGIN_LOG> query, string? sortField, string sortOrder)
        {
            var isDesc = sortOrder?.ToLower() == "desc";

            return sortField?.ToLower() switch
            {
                "username" => isDesc ? query.OrderByDescending(x => x.Username) : query.OrderBy(x => x.Username),
                "ipaddress" => isDesc ? query.OrderByDescending(x => x.IPAddress) : query.OrderBy(x => x.IPAddress),
                "authtype" => isDesc ? query.OrderByDescending(x => x.AuthType) : query.OrderBy(x => x.AuthType),
                "loginstatus" => isDesc ? query.OrderByDescending(x => x.LoginStatus) : query.OrderBy(x => x.LoginStatus),
                "company" => isDesc ? query.OrderByDescending(x => x.Company) : query.OrderBy(x => x.Company),
                _ => isDesc ? query.OrderByDescending(x => x.LoginTime) : query.OrderBy(x => x.LoginTime) // Default: LoginTime
            };
        }

        private static IQueryable<HRB_EMAIL_LOG> ApplyEmailLogSorting(
            IQueryable<HRB_EMAIL_LOG> query, string? sortField, string sortOrder)
        {
            var isDesc = sortOrder?.ToLower() == "desc";

            return sortField?.ToLower() switch
            {
                "toemail" => isDesc ? query.OrderByDescending(x => x.ToEmail) : query.OrderBy(x => x.ToEmail),
                "subject" => isDesc ? query.OrderByDescending(x => x.SubjectEmail) : query.OrderBy(x => x.SubjectEmail),
                "sendstatus" => isDesc ? query.OrderByDescending(x => x.SendStatus) : query.OrderBy(x => x.SendStatus),
                "emailtype" => isDesc ? query.OrderByDescending(x => x.EmailType) : query.OrderBy(x => x.EmailType),
                "updateddate" => isDesc ? query.OrderByDescending(x => x.UpdatedDate) : query.OrderBy(x => x.UpdatedDate),
                _ => isDesc ? query.OrderByDescending(x => x.SendedDate) : query.OrderBy(x => x.SendedDate) // Default: SentDate
            };
        }

        private static IQueryable<HRB_UPLOAD_LOG> ApplyUploadLogSorting(
            IQueryable<HRB_UPLOAD_LOG> query, string? sortField, string sortOrder)
        {
            var isDesc = sortOrder?.ToLower() == "desc";

            return sortField?.ToLower() switch
            {
                "filename" => isDesc ? query.OrderByDescending(x => x.FileName) : query.OrderBy(x => x.FileName),
                "uploadedby" => isDesc ? query.OrderByDescending(x => x.UploadedBy) : query.OrderBy(x => x.UploadedBy),
                "filesize" => isDesc ? query.OrderByDescending(x => x.FileSize) : query.OrderBy(x => x.FileSize),
                "reftype" => isDesc ? query.OrderByDescending(x => x.RefType) : query.OrderBy(x => x.RefType),
                "filetype" => isDesc ? query.OrderByDescending(x => x.FileType) : query.OrderBy(x => x.FileType),
                _ => isDesc ? query.OrderByDescending(x => x.UploadedDate) : query.OrderBy(x => x.UploadedDate) // Default: UploadedDate
            };
        }

        #endregion
    }
}
