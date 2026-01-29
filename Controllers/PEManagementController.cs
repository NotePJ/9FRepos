using Microsoft.AspNetCore.Mvc;
using HCBPCoreUI_Backend.DTOs.PEManagement;
using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.DTOs.AuditLog;
using HCBPCoreUI_Backend.Services;
using HCBPCoreUI_Backend.Attributes;
using HCBPCoreUI_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Controller สำหรับจัดการ PE Management
    /// งบประมาณ Headcount (HC) และ Base+Wage
    /// ต้องการ Permission: PAGE_PE
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [RequireAuth]
    [RequirePermission("PAGE_PE")]
    public class PEManagementController : Controller
    {
        private readonly IPEManagementService _peManagementService;
        private readonly INotificationService _notificationService;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<PEManagementController> _logger;
        private readonly HRBudgetDbContext _context;

        public PEManagementController(
            IPEManagementService peManagementService,
            INotificationService notificationService,
            IAuditLogService auditLogService,
            ILogger<PEManagementController> logger,
            HRBudgetDbContext context)
        {
            _peManagementService = peManagementService;
            _notificationService = notificationService;
            _auditLogService = auditLogService;
            _logger = logger;
            _context = context;
        }

        #region GET APIs

        /// <summary>
        /// ดึงข้อมูล PE Management ทั้งหมดตาม Filter
        /// GET: /api/PEManagement/GetAll?companyId={}&peMonth={}&peYear={}
        /// </summary>
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? companyId,
            [FromQuery] int? peMonth,
            [FromQuery] int? peYear,
            [FromQuery] string? costCenterCode,
            [FromQuery] string? division,
            [FromQuery] string? department,
            [FromQuery] string? section)
        {
            // Get UserId from Session for Data Access Filtering
            var userIdStr = HttpContext.Session.GetString("UserId");
            int? userId = !string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int uid) ? uid : null;

            var filter = new PEManagementFilter
            {
                CompanyId = companyId,
                PeMonth = peMonth,
                PeYear = peYear,
                CostCenterCode = costCenterCode,
                Division = division,
                Department = department,
                Section = section,
                UserId = userId  // Pass UserId for data access filtering
            };

            var result = await _peManagementService.GetAllAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// ดึงข้อมูล PE Management ตาม Cost Center Code
        /// GET: /api/PEManagement/GetByCostCenter/{costCenterCode}
        /// </summary>
        [HttpGet("GetByCostCenter/{costCenterCode}")]
        public async Task<IActionResult> GetByCostCenter(
            string costCenterCode,
            [FromQuery] int? peMonth,
            [FromQuery] int? peYear)
        {
            var result = await _peManagementService.GetByCostCenterAsync(costCenterCode, peMonth, peYear);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// ดึงข้อมูล Accumulated Data ตามเดือนและปี
        /// GET: /api/PEManagement/GetAccumulatedData?peMonth={}&peYear={}
        /// </summary>
        [HttpGet("GetAccumulatedData")]
        public async Task<IActionResult> GetAccumulatedData(
            [FromQuery] int peMonth,
            [FromQuery] int peYear)
        {
            if (peMonth < 1 || peMonth > 12)
            {
                return BadRequest(new { Success = false, Message = "Invalid month (1-12)" });
            }

            if (peYear <= 0)
            {
                return BadRequest(new { Success = false, Message = "Year is required" });
            }

            var result = await _peManagementService.GetAccumulatedDataAsync(peMonth, peYear);
            return Ok(result);
        }

        /// <summary>
        /// ดึงประวัติ Transaction ของ Cost Center
        /// GET: /api/PEManagement/GetTransactionHistory/{costCenterCode}
        /// </summary>
        [HttpGet("GetTransactionHistory/{costCenterCode}")]
        public async Task<IActionResult> GetTransactionHistory(
            string costCenterCode,
            [FromQuery] int? peMonth,
            [FromQuery] int? peYear)
        {
            var result = await _peManagementService.GetTransactionHistoryAsync(costCenterCode, peMonth, peYear);
            return Ok(new { success = true, data = result, message = "Transaction history loaded successfully" });
        }

        #endregion

        #region Movement Transaction APIs

        /// <summary>
        /// บันทึก Move In Transaction
        /// POST: /api/PEManagement/MoveIn
        /// </summary>
        [HttpPost("MoveIn")]
        public async Task<IActionResult> MoveIn([FromBody] MoveInRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user from session
            var updatedBy = GetCurrentUserEmpCode();

            var result = await _peManagementService.MoveInAsync(request, updatedBy);

            // Activity Log
            _ = _auditLogService.LogAsync(
                ActivityModules.PEManagement,
                ActivityActions.MoveIn,
                request.PeId.ToString(),
                "Movement",
                null,
                new { request.FromCostCenterCode, request.Hc, request.BaseWage, request.Remark },
                HttpContext,
                result.Success ? "SUCCESS" : "FAILED",
                result.Success ? null : result.Message);

            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// บันทึก Move Out Transaction
        /// POST: /api/PEManagement/MoveOut
        /// </summary>
        [HttpPost("MoveOut")]
        public async Task<IActionResult> MoveOut([FromBody] MoveOutRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user from session
            var updatedBy = GetCurrentUserEmpCode();

            var result = await _peManagementService.MoveOutAsync(request, updatedBy);

            // Activity Log
            _ = _auditLogService.LogAsync(
                ActivityModules.PEManagement,
                ActivityActions.MoveOut,
                request.PeId.ToString(),
                "Movement",
                null,
                new { request.ToCostCenterCode, request.Hc, request.BaseWage, request.Remark },
                HttpContext,
                result.Success ? "SUCCESS" : "FAILED",
                result.Success ? null : result.Message);

            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// บันทึก Additional Transaction
        /// POST: /api/PEManagement/Additional
        /// </summary>
        [HttpPost("Additional")]
        public async Task<IActionResult> Additional([FromBody] AdditionalRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user from session
            var updatedBy = GetCurrentUserEmpCode();

            var result = await _peManagementService.AdditionalAsync(request, updatedBy);

            // Activity Log
            _ = _auditLogService.LogAsync(
                ActivityModules.PEManagement,
                ActivityActions.Additional,
                request.PeId.ToString(),
                "Movement",
                null,
                new { request.Hc, request.BaseWage, request.Remark },
                HttpContext,
                result.Success ? "SUCCESS" : "FAILED",
                result.Success ? null : result.Message);

            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// บันทึก Cut Transaction
        /// POST: /api/PEManagement/Cut
        /// </summary>
        [HttpPost("Cut")]
        public async Task<IActionResult> Cut([FromBody] CutRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user from session
            var updatedBy = GetCurrentUserEmpCode();

            var result = await _peManagementService.CutAsync(request, updatedBy);

            // Activity Log
            _ = _auditLogService.LogAsync(
                ActivityModules.PEManagement,
                ActivityActions.Cut,
                request.PeId.ToString(),
                "Movement",
                null,
                new { request.Hc, request.BaseWage, request.Remark },
                HttpContext,
                result.Success ? "SUCCESS" : "FAILED",
                result.Success ? null : result.Message);

            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        #endregion

        #region File Upload APIs

        /// <summary>
        /// Upload ไฟล์แนบสำหรับ Movement Transaction
        /// POST: /api/PEManagement/UploadFile
        /// </summary>
        [HttpPost("UploadFile")]
        [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB total limit
        public async Task<IActionResult> UploadFile([FromForm] FileUploadRequest request)
        {
            if (request.Files == null || !request.Files.Any())
            {
                return BadRequest(new { Success = false, Message = "No files provided" });
            }

            var uploadedBy = "DevUser";

            var result = await _peManagementService.UploadFilesAsync(request, uploadedBy);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// ดาวน์โหลดไฟล์แนบ
        /// GET: /api/PEManagement/DownloadFile/{movementId}/{seq}
        /// </summary>
        [HttpGet("DownloadFile/{movementId}/{seq}")]
        public async Task<IActionResult> DownloadFile(int movementId, int seq)
        {
            var (fileData, fileName, contentType) = await _peManagementService.DownloadFileAsync(movementId, seq);

            if (fileData == null)
            {
                return NotFound(new { Success = false, Message = "File not found" });
            }

            return File(fileData, contentType ?? "application/octet-stream", fileName);
        }

        #endregion

        #region Update APIs

        /// <summary>
        /// อัปเดต B0 (Budget ต้นปี)
        /// PUT: /api/PEManagement/UpdateB0/{peId}
        /// </summary>
        [HttpPut("UpdateB0/{peId}")]
        public async Task<IActionResult> UpdateB0(
            int peId,
            [FromBody] UpdateB0Request request)
        {
            var updatedBy = "DevUser";

            var result = await _peManagementService.UpdateB0Async(peId, request.B0Hc, request.B0BaseWage, updatedBy);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// อนุมัติ/ปฏิเสธ Transaction
        /// PUT: /api/PEManagement/ApproveTransaction/{movementId}
        /// </summary>
        [HttpPut("ApproveTransaction/{movementId}")]
        public async Task<IActionResult> ApproveTransaction(
            int movementId,
            [FromBody] ApproveTransactionRequest request)
        {
            if (request.Status != "Approved" && request.Status != "Rejected")
            {
                return BadRequest(new { Success = false, Message = "Status must be 'Approved' or 'Rejected'" });
            }

            var approvedBy = "DevUser";

            var result = await _peManagementService.ApproveTransactionAsync(movementId, request.Status, approvedBy);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        #endregion

        #region Approval Workflow APIs

        /// <summary>
        /// ดึงรายการ Movement ที่รอการอนุมัติ
        /// GET: /api/PEManagement/Pending
        /// </summary>
        [HttpGet("Pending")]
        public async Task<IActionResult> GetPendingMovements(
            [FromQuery] int? companyId = null,
            [FromQuery] int? peMonth = null,
            [FromQuery] int? peYear = null)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var result = await _peManagementService.GetPendingMovementsAsync(empCode, companyId, peMonth, peYear);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending movements");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// อนุมัติ Movement (Accept)
        /// POST: /api/PEManagement/Movement/Approve/{id}
        /// </summary>
        [HttpPost("Movement/Approve/{id}")]
        public async Task<IActionResult> ApproveMovement(int id, [FromBody] ApproveRequest? request)
        {
            try
            {
                var empCode = GetCurrentUserEmpCode();
                var result = await _peManagementService.ApproveMovementAsync(id, empCode, request?.Remark);

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.PEManagement,
                    ActivityActions.Approve,
                    id.ToString(),
                    "Movement",
                    null,
                    new { MovementId = id, ApprovedBy = empCode, Remark = request?.Remark },
                    HttpContext,
                    result.Success ? "SUCCESS" : "FAILED",
                    result.Success ? null : result.Message);

                if (!result.Success)
                    return BadRequest(result);

                // Create notification for requester
                await _notificationService.CreateApprovalResultNotificationAsync(id, true);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving movement {Id}", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// ปฏิเสธ Movement (Reject)
        /// POST: /api/PEManagement/Movement/Reject/{id}
        /// </summary>
        [HttpPost("Movement/Reject/{id}")]
        public async Task<IActionResult> RejectMovement(int id, [FromBody] RejectRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Reason))
                    return BadRequest(new { success = false, message = "Rejection reason is required" });

                var empCode = GetCurrentUserEmpCode();
                var result = await _peManagementService.RejectMovementAsync(id, empCode, request.Reason);

                // Activity Log
                _ = _auditLogService.LogAsync(
                    ActivityModules.PEManagement,
                    ActivityActions.Reject,
                    id.ToString(),
                    "Movement",
                    null,
                    new { MovementId = id, RejectedBy = empCode, Reason = request.Reason },
                    HttpContext,
                    result.Success ? "SUCCESS" : "FAILED",
                    result.Success ? null : result.Message);

                if (!result.Success)
                    return BadRequest(result);

                // Create notification for requester
                await _notificationService.CreateApprovalResultNotificationAsync(id, false, request.Reason);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting movement {Id}", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// ดึงไฟล์แนบของ Movement
        /// GET: /api/PEManagement/Movement/{id}/Attachments
        /// </summary>
        [HttpGet("Movement/{id}/Attachments")]
        public async Task<IActionResult> GetMovementAttachments(int id)
        {
            try
            {
                var result = await _peManagementService.GetMovementAttachmentsAsync(id);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attachments for movement {Id}", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get current user's employee code from session
        /// </summary>
        private string GetCurrentUserEmpCode()
        {
            return HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";
        }

        #endregion

        #region Dropdown APIs (B1)

        /// <summary>
        /// ดึงรายการ Company จาก HRB_PE_MANAGEMENT (กรองตาม CompanyAccess)
        /// GET: /api/PEManagement/B1Companies
        /// </summary>
        [HttpGet("B1Companies")]
        public async Task<IActionResult> GetB1Companies()
        {
            // 🔒 Get CompanyAccess from session
            var empCode = HttpContext.Session.GetString("EmployeeNo");
            string? companyAccess = null;

            if (!string.IsNullOrEmpty(empCode))
            {
                var user = await _context.HRB_USER
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.EmpCode == empCode && u.IsActive);
                companyAccess = user?.CompanyAccess;
            }

            var result = await _peManagementService.GetB1CompaniesAsync(companyAccess);
            return Ok(result);
        }

        /// <summary>
        /// ดึงรายการ Year จาก HRB_PE_MANAGEMENT ตาม Company
        /// GET: /api/PEManagement/B1Years?companyId={}
        /// </summary>
        [HttpGet("B1Years")]
        public async Task<IActionResult> GetB1Years([FromQuery] int? companyId = null)
        {
            var result = await _peManagementService.GetB1YearsAsync(companyId);
            return Ok(result);
        }

        /// <summary>
        /// ดึงรายการเดือน (Static 1-12)
        /// GET: /api/PEManagement/B1Months
        /// </summary>
        [HttpGet("B1Months")]
        public async Task<IActionResult> GetB1Months()
        {
            var result = await _peManagementService.GetB1MonthsAsync();
            return Ok(result);
        }

        /// <summary>
        /// ดึงรายการ Cost Center จาก HRB_PE_MANAGEMENT ตาม filters
        /// GET: /api/PEManagement/B1CostCenters?companyId={}&peYear={}
        /// </summary>
        [HttpGet("B1CostCenters")]
        public async Task<IActionResult> GetB1CostCenters(
            [FromQuery] int? companyId,
            [FromQuery] int? peYear = null)
        {
            var result = await _peManagementService.GetB1CostCentersAsync(companyId, peYear);
            return Ok(result);
        }

        #endregion
    }

    #region Request DTOs for Controller

    /// <summary>
    /// Request DTO สำหรับ Update B0
    /// </summary>
    public class UpdateB0Request
    {
        public int? B0Hc { get; set; }
        public decimal? B0BaseWage { get; set; }
    }

    /// <summary>
    /// Request DTO สำหรับ Approve Transaction
    /// </summary>
    public class ApproveTransactionRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    #endregion
}
