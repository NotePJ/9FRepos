using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Log;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Email Service Implementation
    /// Phase 6: Email Integration
    ///
    /// Features:
    /// - SMTP Email Sending
    /// - Email Templates
    /// - Logging to HRB_EMAIL_LOG
    /// - Retry Failed Emails
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly HRBudgetDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        // SMTP Settings
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _enableSsl;
        private readonly bool _isEnabled;

        public EmailService(
            HRBudgetDbContext context,
            IConfiguration configuration,
            ILogger<EmailService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;

            // Load SMTP settings from configuration
            var emailSection = _configuration.GetSection("EmailSettings");
            _smtpHost = emailSection["SmtpHost"] ?? "smtp.company.com";
            _smtpPort = int.Parse(emailSection["SmtpPort"] ?? "587");
            _smtpUsername = emailSection["SmtpUsername"] ?? "";
            _smtpPassword = emailSection["SmtpPassword"] ?? "";
            _fromEmail = emailSection["FromEmail"] ?? "noreply@company.com";
            _fromName = emailSection["FromName"] ?? "HR Budget System";
            _enableSsl = bool.Parse(emailSection["EnableSsl"] ?? "true");
            _isEnabled = bool.Parse(emailSection["IsEnabled"] ?? "false");
        }

        /// <summary>
        /// ส่ง Email ทั่วไป
        /// </summary>
        public async Task<bool> SendEmailAsync(EmailRequest request)
        {
            if (!_isEnabled)
            {
                _logger.LogWarning("Email service is disabled. Email not sent to: {To}", request.To);
                return false;
            }

            var emailLog = new HRB_EMAIL_LOG
            {
                ToEmail = request.To,
                CcEmail = request.Cc,
                SubjectEmail = request.Subject,
                BodyEmail = request.Body,
                TemplateCode = request.TemplateCode,
                SendStatus = "Pending",
                UpdatedDate = DateTime.Now,
                RetryCount = 0,
                MaxRetry = 3
            };

            try
            {
                using var client = CreateSmtpClient();
                using var message = CreateMailMessage(request);

                await client.SendMailAsync(message);

                emailLog.SendStatus = "Sent";
                emailLog.SendedDate = DateTime.Now;
                _logger.LogInformation("Email sent successfully to: {To}", request.To);

                await SaveEmailLog(emailLog);
                return true;
            }
            catch (Exception ex)
            {
                emailLog.SendStatus = "Failed";
                emailLog.ResponseMessage = ex.Message;
                _logger.LogError(ex, "Failed to send email to: {To}", request.To);

                await SaveEmailLog(emailLog);
                return false;
            }
        }

        /// <summary>
        /// ส่ง Email แจ้งเตือน Movement ใหม่ที่รอการอนุมัติ
        /// </summary>
        public async Task<bool> SendMovementPendingEmailAsync(MovementEmailRequest request)
        {
            var subject = $"[HR Budget] รอการอนุมัติ - {request.MovementType} ({request.CostCenterCode})";
            var body = GenerateMovementPendingEmailBody(request);

            var emailRequest = new EmailRequest
            {
                To = request.ApproverEmail,
                Cc = request.CcEmails,
                Subject = subject,
                Body = body,
                IsHtml = true,
                TemplateCode = "MOVEMENT_PENDING"
            };

            var result = await SendEmailAsync(emailRequest);

            // Update email log with reference
            if (result)
            {
                await UpdateEmailLogReference("MOVEMENT", request.MovementId);
            }

            return result;
        }

        /// <summary>
        /// ส่ง Email แจ้งเตือนผลการอนุมัติ
        /// </summary>
        public async Task<bool> SendMovementResultEmailAsync(MovementResultEmailRequest request)
        {
            var statusText = request.ApprovalStatus == "Approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ";
            var subject = $"[HR Budget] {statusText} - {request.MovementType} ({request.CostCenterCode})";
            var body = GenerateMovementResultEmailBody(request);

            var emailRequest = new EmailRequest
            {
                To = request.RequesterEmail,
                Cc = request.CcEmails,
                Subject = subject,
                Body = body,
                IsHtml = true,
                TemplateCode = request.ApprovalStatus == "Approved" ? "MOVEMENT_APPROVED" : "MOVEMENT_REJECTED"
            };

            var result = await SendEmailAsync(emailRequest);

            // Update email log with reference
            if (result)
            {
                await UpdateEmailLogReference("MOVEMENT", request.MovementId);
            }

            return result;
        }

        /// <summary>
        /// Retry ส่ง Email ที่ล้มเหลว
        /// </summary>
        public async Task<int> RetryFailedEmailsAsync(int maxRetryCount = 3)
        {
            var failedEmails = await _context.HRB_EMAIL_LOG
                .Where(e => e.SendStatus == "Failed" && e.RetryCount < e.MaxRetry)
                .OrderBy(e => e.UpdatedDate)
                .Take(50) // Process 50 at a time
                .ToListAsync();

            int successCount = 0;

            foreach (var emailLog in failedEmails)
            {
                try
                {
                    var request = new EmailRequest
                    {
                        To = emailLog.ToEmail ?? "",
                        Cc = emailLog.CcEmail,
                        Subject = emailLog.SubjectEmail ?? "",
                        Body = emailLog.BodyEmail ?? "",
                        IsHtml = true,
                        TemplateCode = emailLog.TemplateCode
                    };

                    using var client = CreateSmtpClient();
                    using var message = CreateMailMessage(request);

                    await client.SendMailAsync(message);

                    emailLog.SendStatus = "Sent";
                    emailLog.SendedDate = DateTime.Now;
                    emailLog.RetryCount++;
                    successCount++;

                    _logger.LogInformation("Retry email sent successfully to: {To}", emailLog.ToEmail);
                }
                catch (Exception ex)
                {
                    emailLog.RetryCount++;
                    emailLog.ResponseMessage = ex.Message;
                    emailLog.UpdatedDate = DateTime.Now;

                    if (emailLog.RetryCount >= emailLog.MaxRetry)
                    {
                        emailLog.SendStatus = "MaxRetryReached";
                    }

                    _logger.LogWarning(ex, "Retry failed for email to: {To}, attempt: {Count}/{Max}",
                        emailLog.ToEmail, emailLog.RetryCount, emailLog.MaxRetry);
                }
            }

            await _context.SaveChangesAsync();
            return successCount;
        }

        // ═══════════════════════════════════════════════════════
        // 🔧 PRIVATE HELPER METHODS
        // ═══════════════════════════════════════════════════════

        private SmtpClient CreateSmtpClient()
        {
            var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = _enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            if (!string.IsNullOrEmpty(_smtpUsername))
            {
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
            }

            return client;
        }

        private MailMessage CreateMailMessage(EmailRequest request)
        {
            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = request.Subject,
                Body = request.Body,
                IsBodyHtml = request.IsHtml
            };

            // Add To recipients
            foreach (var email in request.To.Split(';', StringSplitOptions.RemoveEmptyEntries))
            {
                message.To.Add(email.Trim());
            }

            // Add CC recipients
            if (!string.IsNullOrEmpty(request.Cc))
            {
                foreach (var email in request.Cc.Split(';', StringSplitOptions.RemoveEmptyEntries))
                {
                    message.CC.Add(email.Trim());
                }
            }

            return message;
        }

        private async Task SaveEmailLog(HRB_EMAIL_LOG log)
        {
            _context.HRB_EMAIL_LOG.Add(log);
            await _context.SaveChangesAsync();
        }

        private async Task UpdateEmailLogReference(string refType, int refId)
        {
            var lastLog = await _context.HRB_EMAIL_LOG
                .OrderByDescending(e => e.EmailId)
                .FirstOrDefaultAsync();

            if (lastLog != null)
            {
                lastLog.RefType = refType;
                lastLog.RefId = refId;
                await _context.SaveChangesAsync();
            }
        }

        // ═══════════════════════════════════════════════════════
        // 📧 EMAIL TEMPLATES
        // ═══════════════════════════════════════════════════════

        private string GenerateMovementPendingEmailBody(MovementEmailRequest request)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        .info-table td {{ padding: 8px 12px; border-bottom: 1px solid #e9ecef; }}
        .info-table td:first-child {{ font-weight: 600; width: 40%; color: #495057; }}
        .btn {{ display: inline-block; padding: 12px 24px; background: #198754; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }}
        .btn:hover {{ background: #157347; }}
        .footer {{ padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 500; }}
        .badge-warning {{ background: #fff3cd; color: #856404; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'>🔔 รอการอนุมัติ - PE Movement</h2>
        </div>
        <div class='content'>
            <p>เรียน ผู้อนุมัติ,</p>
            <p>มีรายการ PE Movement ใหม่รอการอนุมัติจากท่าน:</p>

            <table class='info-table'>
                <tr>
                    <td>ประเภท</td>
                    <td><span class='badge badge-warning'>{request.MovementType}</span></td>
                </tr>
                <tr>
                    <td>Cost Center</td>
                    <td>{request.CostCenterCode} - {request.CostCenterName}</td>
                </tr>
                <tr>
                    <td>HC</td>
                    <td>{request.Hc:N0}</td>
                </tr>
                <tr>
                    <td>Base+Wage</td>
                    <td>{request.BaseWage:N2}</td>
                </tr>
                <tr>
                    <td>หมายเหตุ</td>
                    <td>{request.Remark ?? "-"}</td>
                </tr>
                <tr>
                    <td>สร้างโดย</td>
                    <td>{request.CreatedBy}</td>
                </tr>
                <tr>
                    <td>วันที่สร้าง</td>
                    <td>{request.CreatedDate:dd/MM/yyyy HH:mm}</td>
                </tr>
            </table>

            <p>กรุณาเข้าสู่ระบบเพื่อตรวจสอบและดำเนินการอนุมัติ:</p>
            <a href='#' class='btn'>เข้าสู่ระบบ HR Budget</a>
        </div>
        <div class='footer'>
            <p>อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            <p>© {DateTime.Now.Year} HR Budget Planning System</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateMovementResultEmailBody(MovementResultEmailRequest request)
        {
            var statusColor = request.ApprovalStatus == "Approved" ? "#198754" : "#dc3545";
            var statusIcon = request.ApprovalStatus == "Approved" ? "✅" : "❌";
            var statusText = request.ApprovalStatus == "Approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ";

            var rejectedReasonHtml = request.ApprovalStatus == "Rejected" && !string.IsNullOrEmpty(request.RejectedReason)
                ? $@"<tr>
                        <td>เหตุผล</td>
                        <td style='color: #dc3545;'>{request.RejectedReason}</td>
                    </tr>"
                : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: {statusColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        .info-table td {{ padding: 8px 12px; border-bottom: 1px solid #e9ecef; }}
        .info-table td:first-child {{ font-weight: 600; width: 40%; color: #495057; }}
        .footer {{ padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }}
        .status-badge {{ display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; background: {statusColor}; color: white; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'>{statusIcon} ผลการอนุมัติ - PE Movement</h2>
        </div>
        <div class='content'>
            <p>เรียน ผู้ขออนุมัติ,</p>
            <p>รายการ PE Movement ของท่านได้รับการพิจารณาแล้ว:</p>

            <div style='text-align: center; margin: 20px 0;'>
                <span class='status-badge'>{statusText}</span>
            </div>

            <table class='info-table'>
                <tr>
                    <td>ประเภท</td>
                    <td>{request.MovementType}</td>
                </tr>
                <tr>
                    <td>Cost Center</td>
                    <td>{request.CostCenterCode} - {request.CostCenterName}</td>
                </tr>
                <tr>
                    <td>อนุมัติโดย</td>
                    <td>{request.ApprovedBy}</td>
                </tr>
                <tr>
                    <td>วันที่อนุมัติ</td>
                    <td>{request.ApprovedDate:dd/MM/yyyy HH:mm}</td>
                </tr>
                {rejectedReasonHtml}
            </table>
        </div>
        <div class='footer'>
            <p>อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            <p>© {DateTime.Now.Year} HR Budget Planning System</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
