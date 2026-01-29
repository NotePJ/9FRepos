using Microsoft.EntityFrameworkCore;
using HCBPCoreUI_Backend.DTOs.PEManagement;
using HCBPCoreUI_Backend.DTOs.Notification;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.PE;
using HCBPCoreUI_Backend.Models.Log;
using HCBPCoreUI_Backend.Helpers;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Service สำหรับจัดการ PE Management
    /// งบประมาณ Headcount (HC) และ Base+Wage
    /// </summary>
    public class PEManagementService : IPEManagementService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<PEManagementService> _logger;
        private readonly INotificationService _notificationService;

        public PEManagementService(HRBudgetDbContext context, ILogger<PEManagementService> logger, INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        #region GET APIs

        /// <summary>
        /// ดึงข้อมูล PE Management ทั้งหมดตาม Filter
        /// รองรับ Data Access Filtering ตาม UserId
        /// </summary>
        public async Task<PEManagementListResponse> GetAllAsync(PEManagementFilter filter)
        {
            try
            {
                var query = _context.HRB_PE_MANAGEMENT.AsQueryable();

                // ═══════════════════════════════════════════════════════════════
                // Data Access Filtering - กรองข้อมูลตามสิทธิ์ของ User
                // ═══════════════════════════════════════════════════════════════
                if (filter.UserId.HasValue && filter.UserId.Value > 0)
                {
                    var accessibleCostCenters = await DataAccessHelper.GetAccessibleCostCentersAsync(
                        _context, filter.UserId.Value, filter.CompanyId);

                    if (accessibleCostCenters.Any())
                    {
                        query = query.Where(x => x.CostCenterCode != null && accessibleCostCenters.Contains(x.CostCenterCode));
                        _logger.LogInformation("[DataAccess] User {UserId} can access {Count} cost centers",
                            filter.UserId.Value, accessibleCostCenters.Count);
                    }
                    else
                    {
                        // User has no data access - return empty
                        _logger.LogWarning("[DataAccess] User {UserId} has no accessible cost centers",
                            filter.UserId.Value);
                        return new PEManagementListResponse
                        {
                            Success = true,
                            Message = "No accessible data for this user",
                            Data = new List<PEManagementDto>(),
                            TotalCount = 0
                        };
                    }
                }

                // Apply other filters
                if (filter.CompanyId.HasValue)
                    query = query.Where(x => x.CompanyId == filter.CompanyId.Value);

                if (filter.PeMonth.HasValue)
                    query = query.Where(x => x.PeMonth == filter.PeMonth.Value);

                if (filter.PeYear.HasValue)
                    query = query.Where(x => x.PeYear == filter.PeYear.Value);

                if (!string.IsNullOrEmpty(filter.CostCenterCode))
                    query = query.Where(x => x.CostCenterCode == filter.CostCenterCode);

                if (!string.IsNullOrEmpty(filter.Division))
                    query = query.Where(x => x.Division == filter.Division);

                if (!string.IsNullOrEmpty(filter.Department))
                    query = query.Where(x => x.Department == filter.Department);

                if (!string.IsNullOrEmpty(filter.Section))
                    query = query.Where(x => x.Section == filter.Section);

                var entities = await query
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.CostCenterCode)
                    .ToListAsync();

                // Get pending movements for each cost center
                var costCenterCodes = entities.Select(x => x.CostCenterCode).Distinct().ToList();
                var pendingMovements = await _context.HRB_PE_MOVEMENT
                    .Where(m => costCenterCodes.Contains(m.MoveOutCostCenterCode)
                             && m.ApprovalStatus == "PENDING"
                             && m.RequiresApproval == true)
                    .ToListAsync();

                var data = entities.Select(x => {
                    var dto = MapToDto(x);
                    // Check if this cost center has pending move-in requests
                    var pendingMoveIn = pendingMovements
                        .FirstOrDefault(m => m.MoveOutCostCenterCode == x.CostCenterCode);
                    if (pendingMoveIn != null)
                    {
                        dto.HasPendingMoveIn = true;
                        dto.PendingMovementId = pendingMoveIn.Id;
                        dto.PendingApprovalStatus = pendingMoveIn.ApprovalStatus;
                    }
                    return dto;
                }).ToList();

                return new PEManagementListResponse
                {
                    Success = true,
                    Message = "Data retrieved successfully",
                    Data = data,
                    TotalCount = data.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PE Management data");
                return new PEManagementListResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}",
                    Data = new List<PEManagementDto>(),
                    TotalCount = 0
                };
            }
        }

        /// <summary>
        /// ดึงข้อมูล PE Management ตาม Cost Center Code
        /// </summary>
        public async Task<PEManagementResponse> GetByCostCenterAsync(string costCenterCode, int? peMonth, int? peYear)
        {
            try
            {
                var query = _context.HRB_PE_MANAGEMENT
                    .Where(x => x.CostCenterCode == costCenterCode && x.IsActive);

                if (peMonth.HasValue)
                    query = query.Where(x => x.PeMonth == peMonth.Value);

                if (peYear.HasValue)
                    query = query.Where(x => x.PeYear == peYear.Value);

                var entity = await query.FirstOrDefaultAsync();

                if (entity == null)
                {
                    return new PEManagementResponse
                    {
                        Success = false,
                        Message = "Cost Center not found",
                        Data = null
                    };
                }

                return new PEManagementResponse
                {
                    Success = true,
                    Message = "Data retrieved successfully",
                    Data = MapToDto(entity)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PE Management by Cost Center: {CostCenterCode}", costCenterCode);
                return new PEManagementResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}",
                    Data = null
                };
            }
        }

        /// <summary>
        /// ดึงข้อมูล Accumulated Data ตามเดือนและปี
        /// </summary>
        public async Task<PEManagementListResponse> GetAccumulatedDataAsync(int peMonth, int peYear)
        {
            try
            {
                var data = await _context.HRB_PE_MANAGEMENT
                    .Where(x => x.PeMonth == peMonth && x.PeYear == peYear && x.IsActive)
                    .OrderBy(x => x.CostCenterCode)
                    .Select(x => MapToDto(x))
                    .ToListAsync();

                return new PEManagementListResponse
                {
                    Success = true,
                    Message = "Accumulated data retrieved successfully",
                    Data = data,
                    TotalCount = data.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accumulated data for Month: {Month}, Year: {Year}", peMonth, peYear);
                return new PEManagementListResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}",
                    Data = new List<PEManagementDto>(),
                    TotalCount = 0
                };
            }
        }

        /// <summary>
        /// ดึงประวัติ Transaction ของ Cost Center
        /// </summary>
        public async Task<List<MovementHistoryDto>> GetTransactionHistoryAsync(string costCenterCode, int? peMonth, int? peYear)
        {
            try
            {
                _logger.LogInformation("🔍 GetTransactionHistory - costCenterCode: {CostCenterCode}, peMonth: {PeMonth}, peYear: {PeYear}",
                    costCenterCode, peMonth, peYear);

                // Debug: Get all movements first to see what's in DB
                var allMovements = await _context.HRB_PE_MOVEMENT.ToListAsync();
                _logger.LogInformation("🔍 Total movements in DB: {Count}", allMovements.Count);

                foreach (var m in allMovements.Take(5))
                {
                    _logger.LogInformation("🔍 Movement: Id={Id}, MoveInCC={MoveInCC}, MoveOutCC={MoveOutCC}, MoveInYear={MoveInYear}, MoveOutYear={MoveOutYear}, Status={Status}",
                        m.Id, m.MoveInCostCenterCode, m.MoveOutCostCenterCode, m.MoveInYear, m.MoveOutYear, m.Status);
                }

                var query = _context.HRB_PE_MOVEMENT
                    .Where(x => x.MoveInCostCenterCode == costCenterCode || x.MoveOutCostCenterCode == costCenterCode);

                var afterCostCenterFilter = await query.ToListAsync();
                _logger.LogInformation("🔍 After CostCenter filter: {Count} records", afterCostCenterFilter.Count);

                if (peMonth.HasValue)
                    query = query.Where(x => x.MoveInMonth == peMonth.ToString() || x.MoveOutMonth == peMonth.ToString());

                if (peYear.HasValue)
                {
                    var yearStr = peYear.ToString();
                    _logger.LogInformation("🔍 Filtering by year string: '{YearStr}'", yearStr);
                    query = query.Where(x => x.MoveInYear == yearStr || x.MoveOutYear == yearStr);
                }

                var movements = await query
                    .OrderByDescending(x => x.UpdatedDate)
                    .ToListAsync();

                _logger.LogInformation("🔍 Final result count: {Count}", movements.Count);

                var result = movements.Select(m => new MovementHistoryDto
                {
                    Id = m.Id,
                    PeMovId = m.PeMovId,
                    Seq = m.Seq,
                    MovementType = DetermineMovementType(m, costCenterCode),
                    MoveInHc = m.MoveInHc,
                    MoveInBaseWage = m.MoveInBaseWage,
                    MoveOutHc = m.MoveOutHc,
                    MoveOutBaseWage = m.MoveOutBaseWage,
                    AdditionalHc = m.AdditionalHc,
                    AdditionalBaseWage = m.AdditionalBaseWage,
                    CutHc = m.CutHc,
                    CutBaseWage = m.CutBaseWage,
                    FromCostCenterCode = m.MoveOutCostCenterCode,  // ต้นทาง (ย้ายออก)
                    ToCostCenterCode = m.MoveInCostCenterCode,      // ปลายทาง (ย้ายเข้า)
                    Remark = m.RemarkMove,
                    Status = m.Status,
                    ApprovalStatus = m.ApprovalStatus,
                    RejectedReason = m.RejectedReason,
                    PendingEmpCode = m.PendingEmpCode,
                    UpdatedBy = m.UpdatedBy,
                    UpdatedDate = m.UpdatedDate,
                    ApprovedBy = m.ApprovedBy,
                    ApprovedDate = m.ApprovedDate,
                    AttachedFilesCount = 0 // Will be updated later
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction history for Cost Center: {CostCenterCode}", costCenterCode);
                return new List<MovementHistoryDto>();
            }
        }

        #endregion

        #region Movement Transaction APIs

        /// <summary>
        /// บันทึก Move In Transaction
        /// </summary>
        public async Task<MovementResponse> MoveInAsync(MoveInRequest request, string updatedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Get target PE Management record
                var targetRecord = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.PeId == request.PeId);

                if (targetRecord == null)
                {
                    return new MovementResponse { Success = false, Message = "PE Management record not found" };
                }

                // Create Movement record
                // MOVE_OUT = ต้นทาง (Source) = Cost Center ที่ย้ายออกมา
                // MOVE_IN = ปลายทาง (Target) = Cost Center ที่ user กำลังทำ MoveIn
                var movement = new HRB_PE_MOVEMENT
                {
                    PeMovId = targetRecord.PeId,  // Link to PE Management record
                    Seq = 1,
                    MoveInHc = request.Hc,
                    MoveInBaseWage = request.BaseWage,
                    MoveOutCostCenterCode = request.FromCostCenterCode,  // ต้นทาง (ย้ายออก)
                    MoveInCostCenterCode = targetRecord.CostCenterCode,  // ปลายทาง (ย้ายเข้า)
                    MoveInMonth = request.PeMonth?.ToString() ?? targetRecord.PeMonth?.ToString(),
                    MoveInYear = request.PeYear?.ToString() ?? targetRecord.PeYear.ToString(),
                    FlagMove = "I",
                    RemarkMove = request.Remark,
                    Status = "Approved",
                    UpdatedBy = updatedBy,
                    UpdatedDate = DateTime.Now
                };

                _context.HRB_PE_MOVEMENT.Add(movement);

                // Update target PE Management - Add Move In values
                targetRecord.MoveInHc = (targetRecord.MoveInHc ?? 0) + request.Hc;
                targetRecord.MoveInBaseWage = AddDecimals(targetRecord.MoveInBaseWage, request.BaseWage);
                targetRecord.UpdatedBy = updatedBy;
                targetRecord.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // Recalculate Accumulated and B1
                await CalculateAccumulatedAsync(targetRecord.CostCenterCode!, targetRecord.PeMonth ?? 0, targetRecord.PeYear!);
                await CalculateB1Async(targetRecord.PeId);

                await transaction.CommitAsync();

                return new MovementResponse
                {
                    Success = true,
                    Message = "Move In transaction saved successfully",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error saving Move In transaction");
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// บันทึก Move Out Transaction
        /// ถ้า Cost Center ปลายทางเป็นของคนอื่น → สร้าง Notification และรอ Approve
        /// ถ้า Cost Center ปลายทางเป็นของตัวเอง หรือไม่มี record → Auto Approve
        /// </summary>
        public async Task<MovementResponse> MoveOutAsync(MoveOutRequest request, string updatedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Get source PE Management record
                var sourceRecord = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.PeId == request.PeId);

                if (sourceRecord == null)
                {
                    return new MovementResponse { Success = false, Message = "PE Management record not found" };
                }

                // Check if target Cost Center requires approval
                // หา PE_MANAGEMENT record ของ Cost Center ปลายทาง ในเดือน/ปีเดียวกัน
                var targetRecord = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.CostCenterCode == request.ToCostCenterCode
                                           && x.PeMonth == (request.PeMonth ?? sourceRecord.PeMonth)
                                           && x.PeYear == (request.PeYear ?? sourceRecord.PeYear)
                                           && x.CompanyId == sourceRecord.CompanyId
                                           && x.IsActive);

                // หา Owner ของ target Cost Center จาก HRB_USER_DATA_ACCESS
                // Owner คือผู้ที่มีสิทธิ์ FULL access ใน Cost Center นั้น
                _logger.LogInformation("🔍 [MoveOut] Looking for owner of CostCenter {ToCostCenter}, CompanyId {CompanyId}",
                    request.ToCostCenterCode, sourceRecord.CompanyId);

                var targetOwner = await _context.HRB_USER_DATA_ACCESS
                    .Include(da => da.User)
                    .Where(da => da.CostCenterCode == request.ToCostCenterCode
                              && da.CompanyId == sourceRecord.CompanyId
                              && da.AccessType == "FULL"
                              && da.IsActive
                              && da.User != null
                              && da.User.IsActive)
                    .Select(da => da.User!.EmpCode)
                    .FirstOrDefaultAsync();

                _logger.LogInformation("🔍 [MoveOut] targetOwner found: '{TargetOwner}', updatedBy: '{UpdatedBy}'",
                    targetOwner ?? "(null)", updatedBy);

                // Determine if approval is required
                // ต้องการ Approval ถ้า:
                // 1. มี target owner และ
                // 2. Owner ไม่ใช่คนเดียวกับผู้ส่ง (updatedBy)
                var requiresApproval = !string.IsNullOrEmpty(targetOwner)
                                     && !targetOwner.Equals(updatedBy, StringComparison.OrdinalIgnoreCase);

                _logger.LogInformation("🔍 [MoveOut] requiresApproval: {RequiresApproval}", requiresApproval);

                var approvalStatus = requiresApproval ? "PENDING" : "AUTO_APPROVED";
                var status = requiresApproval ? "Pending" : "Approved";
                var pendingEmpCode = requiresApproval ? targetOwner : null;
                var pendingCostCenter = requiresApproval ? request.ToCostCenterCode : null;

                // Create Movement record
                // MOVE_OUT = ต้นทาง (Source) = Cost Center ที่ user กำลังทำ MoveOut
                // MOVE_IN = ปลายทาง (Target) = Cost Center ที่จะรับพนักงาน
                var movement = new HRB_PE_MOVEMENT
                {
                    PeMovId = sourceRecord.PeId,  // Link to PE Management record
                    Seq = 1,
                    MoveOutHc = request.Hc,
                    MoveOutBaseWage = request.BaseWage,
                    MoveOutCostCenterCode = sourceRecord.CostCenterCode,  // ต้นทาง (ย้ายออก)
                    MoveInCostCenterCode = request.ToCostCenterCode,      // ปลายทาง (ย้ายเข้า)
                    MoveOutMonth = request.PeMonth?.ToString() ?? sourceRecord.PeMonth?.ToString(),
                    MoveOutYear = request.PeYear?.ToString() ?? sourceRecord.PeYear.ToString(),
                    FlagMove = "O",
                    RemarkMove = request.Remark,
                    Status = status,
                    RequiresApproval = requiresApproval,
                    ApprovalStatus = approvalStatus,
                    PendingCostCenter = pendingCostCenter,
                    PendingEmpCode = pendingEmpCode,
                    UpdatedBy = updatedBy,
                    UpdatedDate = DateTime.Now
                };

                _context.HRB_PE_MOVEMENT.Add(movement);
                await _context.SaveChangesAsync();

                // ถ้าไม่ต้องรอ Approval → อัพเดต B1 ทันที
                if (!requiresApproval)
                {
                    // Update source PE Management - Add Move Out values
                    sourceRecord.MoveOutHc = (sourceRecord.MoveOutHc ?? 0) + request.Hc;
                    sourceRecord.MoveOutBaseWage = AddDecimals(sourceRecord.MoveOutBaseWage, request.BaseWage);
                    sourceRecord.UpdatedBy = updatedBy;
                    sourceRecord.UpdatedDate = DateTime.Now;

                    await _context.SaveChangesAsync();

                    // Recalculate Accumulated and B1
                    await CalculateAccumulatedAsync(sourceRecord.CostCenterCode!, sourceRecord.PeMonth ?? 0, sourceRecord.PeYear!);
                    await CalculateB1Async(sourceRecord.PeId);
                }

                await transaction.CommitAsync();

                // สร้าง Notification ถ้าต้องรอ Approval (ต้องทำหลัง commit เพื่อให้ MovementId ถูกต้อง)
                _logger.LogInformation("🔍 [MoveOut] Creating notification - requiresApproval: {RequiresApproval}, pendingEmpCode: '{PendingEmpCode}'",
                    requiresApproval, pendingEmpCode ?? "(null)");

                if (requiresApproval && !string.IsNullOrEmpty(pendingEmpCode))
                {
                    try
                    {
                        _logger.LogInformation("🔍 [MoveOut] Creating notification for RecipientEmpCode: '{RecipientEmpCode}'", pendingEmpCode);

                        await _notificationService.CreateMovementNotificationAsync(new CreateMovementNotificationRequest
                        {
                            MovementId = movement.Id,
                            NotificationType = "MOVE_IN_REQUEST",
                            NotificationCategory = "PE_MOVEMENT",
                            SenderEmpCode = updatedBy,
                            SenderCostCenter = sourceRecord.CostCenterCode ?? string.Empty,
                            RecipientEmpCode = pendingEmpCode ?? string.Empty,
                            RecipientCostCenter = request.ToCostCenterCode ?? string.Empty,
                            Title = $"Move In Request - {request.Hc} HC",
                            Message = $"Request to move {request.Hc} HC from Cost Center {sourceRecord.CostCenterCode} to your Cost Center {request.ToCostCenterCode}. {request.Remark ?? ""}".Trim(),
                            Hc = request.Hc,
                            BaseWage = request.BaseWage ?? 0,
                            PeMonth = request.PeMonth ?? sourceRecord.PeMonth ?? 0,
                            PeYear = request.PeYear ?? sourceRecord.PeYear,
                            CompanyId = sourceRecord.CompanyId,
                            HasAttachment = false,
                            SendEmail = true
                        });

                        _logger.LogInformation("✅ [MoveOut] Notification created successfully for MovementId: {MovementId}", movement.Id);
                    }
                    catch (Exception notifEx)
                    {
                        // Log error but don't fail the main transaction
                        _logger.LogError(notifEx, "Failed to create notification for movement {MovementId}", movement.Id);
                    }
                }

                var message = requiresApproval
                    ? $"Move Out request sent for approval to Cost Center {request.ToCostCenterCode} owner"
                    : "Move Out transaction saved successfully";

                return new MovementResponse
                {
                    Success = true,
                    Message = message,
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error saving Move Out transaction");
                // Show inner exception for debugging
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return new MovementResponse { Success = false, Message = $"Error: {innerMessage}" };
            }
        }

        /// <summary>
        /// บันทึก Additional Transaction
        /// </summary>
        public async Task<MovementResponse> AdditionalAsync(AdditionalRequest request, string updatedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var record = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.PeId == request.PeId);

                if (record == null)
                {
                    return new MovementResponse { Success = false, Message = "PE Management record not found" };
                }

                // Create Movement record
                var movement = new HRB_PE_MOVEMENT
                {
                    PeMovId = record.PeId,  // Link to PE Management record
                    Seq = 1,
                    AdditionalHc = request.Hc,
                    AdditionalBaseWage = request.BaseWage,
                    MoveInCostCenterCode = record.CostCenterCode,
                    MoveInMonth = request.PeMonth?.ToString() ?? record.PeMonth?.ToString(),
                    MoveInYear = request.PeYear?.ToString() ?? record.PeYear.ToString(),
                    RemarkMove = request.Remark,
                    Status = "Pending", // Additional ต้องรอ Approve
                    UpdatedBy = updatedBy,
                    UpdatedDate = DateTime.Now
                };

                _context.HRB_PE_MOVEMENT.Add(movement);

                // Update PE Management - Add Additional values
                record.AdditionalHc = (record.AdditionalHc ?? 0) + request.Hc;
                record.AdditionalBaseWage = AddDecimals(record.AdditionalBaseWage, request.BaseWage);
                record.UpdatedBy = updatedBy;
                record.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // Recalculate
                await CalculateAccumulatedAsync(record.CostCenterCode!, record.PeMonth ?? 0, record.PeYear!);
                await CalculateB1Async(record.PeId);

                await transaction.CommitAsync();

                return new MovementResponse
                {
                    Success = true,
                    Message = "Additional transaction saved successfully (Pending approval)",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error saving Additional transaction");
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// บันทึก Cut Transaction
        /// </summary>
        public async Task<MovementResponse> CutAsync(CutRequest request, string updatedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var record = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.PeId == request.PeId);

                if (record == null)
                {
                    return new MovementResponse { Success = false, Message = "PE Management record not found" };
                }

                // Create Movement record
                var movement = new HRB_PE_MOVEMENT
                {
                    PeMovId = record.PeId,  // Link to PE Management record
                    Seq = 1,
                    CutHc = request.Hc,
                    CutBaseWage = request.BaseWage,
                    MoveInCostCenterCode = record.CostCenterCode,
                    MoveInMonth = request.PeMonth?.ToString() ?? record.PeMonth?.ToString(),
                    MoveInYear = request.PeYear?.ToString() ?? record.PeYear.ToString(),
                    RemarkMove = request.Remark,
                    Status = "Approved",
                    UpdatedBy = updatedBy,
                    UpdatedDate = DateTime.Now
                };

                _context.HRB_PE_MOVEMENT.Add(movement);

                // Update PE Management - Add Cut values
                record.CutHc = (record.CutHc ?? 0) + request.Hc;
                record.CutBaseWage = AddDecimals(record.CutBaseWage, request.BaseWage);
                record.UpdatedBy = updatedBy;
                record.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // Recalculate
                await CalculateAccumulatedAsync(record.CostCenterCode!, record.PeMonth ?? 0, record.PeYear!);
                await CalculateB1Async(record.PeId);

                await transaction.CommitAsync();

                return new MovementResponse
                {
                    Success = true,
                    Message = "Cut transaction saved successfully",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error saving Cut transaction");
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        #endregion

        #region File Upload APIs

        /// <summary>
        /// Upload ไฟล์แนบสำหรับ Movement Transaction
        /// </summary>
        public async Task<FileUploadResponse> UploadFilesAsync(FileUploadRequest request, string uploadedBy)
        {
            try
            {
                var uploadedFiles = new List<UploadedFileInfo>();
                var allowedTypes = new[] { ".pdf", ".xlsx", ".xls", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
                const int maxFileSize = 4 * 1024 * 1024; // 4 MB

                if (request.Files == null || !request.Files.Any())
                {
                    return new FileUploadResponse { Success = false, Message = "No files provided" };
                }

                // Get max sequence for this movement
                var maxSeq = await _context.HRB_UPLOAD_LOG
                    .Where(x => x.Id == request.MovementId)
                    .MaxAsync(x => (int?)x.Seq) ?? 0;

                foreach (var file in request.Files)
                {
                    var ext = Path.GetExtension(file.FileName).ToLower();
                    if (!allowedTypes.Contains(ext))
                    {
                        continue; // Skip invalid file types
                    }

                    if (file.Length > maxFileSize)
                    {
                        continue; // Skip files exceeding max size
                    }

                    maxSeq++;

                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream);

                    var uploadLog = new HRB_UPLOAD_LOG
                    {
                        Id = request.MovementId,
                        Seq = maxSeq,
                        FileName = file.FileName,
                        FileSize = file.Length.ToString(),
                        FileData = memoryStream.ToArray(),
                        UploadedBy = uploadedBy,
                        UploadedDate = DateTime.Now
                    };

                    _context.HRB_UPLOAD_LOG.Add(uploadLog);

                    uploadedFiles.Add(new UploadedFileInfo
                    {
                        Seq = maxSeq,
                        FileName = file.FileName,
                        FileSize = FormatFileSize(file.Length),
                        UploadedDate = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();

                return new FileUploadResponse
                {
                    Success = true,
                    Message = $"{uploadedFiles.Count} file(s) uploaded successfully",
                    UploadedFiles = uploadedFiles
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading files");
                return new FileUploadResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// ดาวน์โหลดไฟล์แนบ
        /// </summary>
        public async Task<(byte[]? FileData, string? FileName, string? ContentType)> DownloadFileAsync(int movementId, int seq)
        {
            try
            {
                var file = await _context.HRB_UPLOAD_LOG
                    .FirstOrDefaultAsync(x => x.Id == movementId && x.Seq == seq);

                if (file == null || file.FileData == null)
                {
                    return (null, null, null);
                }

                var contentType = GetContentType(file.FileName ?? "file");
                return (file.FileData, file.FileName, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file");
                return (null, null, null);
            }
        }

        #endregion

        #region Update APIs

        /// <summary>
        /// อัปเดต B0 (Budget ต้นปี)
        /// </summary>
        public async Task<PEManagementResponse> UpdateB0Async(int peId, int? b0Hc, decimal? b0BaseWage, string updatedBy)
        {
            try
            {
                var record = await _context.HRB_PE_MANAGEMENT.FirstOrDefaultAsync(x => x.PeId == peId);
                if (record == null)
                {
                    return new PEManagementResponse { Success = false, Message = "Record not found" };
                }

                if (b0Hc.HasValue)
                    record.B0Hc = b0Hc;

                if (b0BaseWage.HasValue)
                    record.B0BaseWage = b0BaseWage;

                record.UpdatedBy = updatedBy;
                record.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // Recalculate B1 and Diff
                await CalculateB1Async(peId);
                await CalculateDiffAsync(peId);

                return new PEManagementResponse
                {
                    Success = true,
                    Message = "B0 updated successfully",
                    Data = MapToDto(record)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating B0 for PeId: {PeId}", peId);
                return new PEManagementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// อนุมัติ/ปฏิเสธ Transaction
        /// </summary>
        public async Task<MovementResponse> ApproveTransactionAsync(int movementId, string status, string approvedBy)
        {
            try
            {
                var movement = await _context.HRB_PE_MOVEMENT
                    .FirstOrDefaultAsync(x => x.Id == movementId);

                if (movement == null)
                {
                    return new MovementResponse { Success = false, Message = "Movement not found" };
                }

                movement.Status = status;
                movement.ApprovedBy = approvedBy;
                movement.ApprovedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return new MovementResponse
                {
                    Success = true,
                    Message = $"Transaction {status} successfully",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving transaction: {MovementId}", movementId);
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        #endregion

        #region Dropdown APIs (B1)

        /// <summary>
        /// ดึงรายการ Company จาก HRB_PE_MANAGEMENT (กรองตาม CompanyAccess)
        /// </summary>
        public async Task<List<PECompanyDto>> GetB1CompaniesAsync(string? companyAccess = null)
        {
            try
            {
                var query = _context.HRB_PE_MANAGEMENT
                    .Where(x => x.IsActive);

                // 🔒 Filter by CompanyAccess (Option C)
                if (!string.IsNullOrEmpty(companyAccess))
                {
                    // Parse CompanyAccess: BJC, BIGC, หรือ BJC,BIGC
                    var allowedCodes = companyAccess.Split(',')
                        .Select(c => c.Trim().ToUpper())
                        .Where(c => !string.IsNullOrEmpty(c))
                        .ToList();

                    // Map CompanyCode to CompanyId
                    // BJC = 1, BIGC = 2
                    var allowedIds = new List<int>();
                    if (allowedCodes.Contains("BJC")) allowedIds.Add(1);
                    if (allowedCodes.Contains("BIGC")) allowedIds.Add(2);

                    if (allowedIds.Any())
                    {
                        query = query.Where(x => allowedIds.Contains(x.CompanyId));
                    }
                    else
                    {
                        // ถ้า CompanyAccess ไม่ตรงกับ BJC/BIGC → return empty
                        return new List<PECompanyDto>();
                    }
                }
                else
                {
                    // ไม่มี companyAccess → return empty (security)
                    return new List<PECompanyDto>();
                }

                return await query
                    .Select(x => new PECompanyDto
                    {
                        CompanyId = x.CompanyId,
                        CompanyName = x.CompanyName
                    })
                    .Distinct()
                    .OrderBy(x => x.CompanyId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting B1 companies");
                return new List<PECompanyDto>();
            }
        }

        /// <summary>
        /// ดึงรายการ Year จาก HRB_PE_MANAGEMENT ตาม Company
        /// </summary>
        public async Task<List<int>> GetB1YearsAsync(int? companyId = null)
        {
            try
            {
                var query = _context.HRB_PE_MANAGEMENT
                    .Where(x => x.IsActive && x.PeYear > 0);

                if (companyId.HasValue)
                    query = query.Where(x => x.CompanyId == companyId);

                return await query
                    .Select(x => x.PeYear)
                    .Distinct()
                    .OrderByDescending(x => x)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting B1 years");
                return new List<int>();
            }
        }

        /// <summary>
        /// ดึงรายการเดือน (Static 1-12)
        /// </summary>
        public async Task<List<PEMonthDto>> GetB1MonthsAsync()
        {
            return await Task.FromResult(Enumerable.Range(1, 12)
                .Select(m => new PEMonthDto
                {
                    Value = m,
                    Text = new DateTime(2000, m, 1).ToString("MMMM"),
                    ShortText = new DateTime(2000, m, 1).ToString("MMM")
                })
                .ToList());
        }

        /// <summary>
        /// ดึงรายการ Cost Center จาก HRB_PE_MANAGEMENT ตาม filters
        /// </summary>
        public async Task<List<PECostCenterDto>> GetB1CostCentersAsync(int? companyId, int? peYear = null)
        {
            try
            {
                var query = _context.HRB_PE_MANAGEMENT.Where(x => x.IsActive);

                if (companyId.HasValue)
                    query = query.Where(x => x.CompanyId == companyId);

                if (peYear.HasValue)
                    query = query.Where(x => x.PeYear == peYear);

                return await query
                    .Select(x => new PECostCenterDto
                    {
                        CostCenterCode = x.CostCenterCode,
                        CostCenterName = x.CostCenterName
                    })
                    .Distinct()
                    .OrderBy(x => x.CostCenterCode)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting B1 cost centers");
                return new List<PECostCenterDto>();
            }
        }

        #endregion

        #region Approval Workflow Methods

        /// <summary>
        /// ดึงรายการ Movement ที่รอการอนุมัติ
        /// </summary>
        public async Task<List<PendingMovementDto>> GetPendingMovementsAsync(string empCode, int? companyId, int? peMonth, int? peYear)
        {
            try
            {
                var query = _context.HRB_PE_MOVEMENT
                    .Where(x => x.RequiresApproval == true && x.ApprovalStatus == "PENDING");

                // Filter by pending employee
                if (!string.IsNullOrEmpty(empCode))
                {
                    query = query.Where(x => x.PendingEmpCode == empCode);
                }

                var movements = await query
                    .OrderByDescending(x => x.UpdatedDate)
                    .ToListAsync();

                return movements.Select(m => new PendingMovementDto
                {
                    MovementId = m.Id,
                    MovementType = m.FlagMove ?? "Unknown",
                    ApprovalStatus = m.ApprovalStatus ?? "PENDING",
                    SourceCostCenterCode = m.MoveOutCostCenterCode,
                    TargetCostCenterCode = m.MoveInCostCenterCode,
                    Hc = m.MoveOutHc ?? m.MoveInHc ?? m.AdditionalHc ?? m.CutHc ?? 0,
                    BaseWage = m.MoveOutBaseWage ?? m.MoveInBaseWage ?? m.AdditionalBaseWage ?? m.CutBaseWage ?? 0,
                    PeMonth = int.TryParse(m.MoveOutMonth ?? m.MoveInMonth, out var month) ? month : 0,
                    PeYear = int.TryParse(m.MoveOutYear ?? m.MoveInYear, out var year) ? year : 0,
                    RequestedBy = m.UpdatedBy,
                    RequestedDate = m.UpdatedDate,
                    Remark = m.RemarkMove,
                    HasAttachment = m.UploadLogId.HasValue
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending movements for {EmpCode}", empCode);
                return new List<PendingMovementDto>();
            }
        }

        /// <summary>
        /// อนุมัติ Movement (Accept)
        /// หลัง Approve จะอัพเดต HRB_PE_MANAGEMENT ทั้ง Source และ Target
        /// พร้อมคำนวณ Accumulated และ B1 ใหม่
        /// </summary>
        public async Task<MovementResponse> ApproveMovementAsync(int movementId, string approvedBy, string? remark)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var movement = await _context.HRB_PE_MOVEMENT.FirstOrDefaultAsync(x => x.Id == movementId);
                if (movement == null)
                    return new MovementResponse { Success = false, Message = "Movement not found" };

                if (movement.ApprovalStatus != "PENDING")
                    return new MovementResponse { Success = false, Message = "Movement is not pending approval" };

                _logger.LogInformation("🔍 [ApproveMovement] Starting approval for MovementId: {MovementId}", movementId);
                _logger.LogInformation("🔍 [ApproveMovement] Source CC: {SourceCC}, Target CC: {TargetCC}",
                    movement.MoveOutCostCenterCode, movement.MoveInCostCenterCode);

                // Parse month/year from movement
                var peMonth = int.TryParse(movement.MoveOutMonth ?? movement.MoveInMonth, out var m) ? m : 0;
                var peYear = int.TryParse(movement.MoveOutYear ?? movement.MoveInYear, out var y) ? y : 0;

                // ═══════════════════════════════════════════════════════════════════
                // 1. อัพเดต Source PE_MANAGEMENT (Cost Center ที่ MoveOut)
                // ═══════════════════════════════════════════════════════════════════
                var sourceRecord = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.CostCenterCode == movement.MoveOutCostCenterCode
                                           && x.PeMonth == peMonth
                                           && x.PeYear == peYear
                                           && x.IsActive);

                if (sourceRecord != null)
                {
                    sourceRecord.MoveOutHc = (sourceRecord.MoveOutHc ?? 0) + (movement.MoveOutHc ?? 0);
                    sourceRecord.MoveOutBaseWage = AddDecimals(sourceRecord.MoveOutBaseWage, movement.MoveOutBaseWage);
                    sourceRecord.UpdatedBy = approvedBy;
                    sourceRecord.UpdatedDate = DateTime.Now;

                    _logger.LogInformation("🔍 [ApproveMovement] Updated Source PE_MANAGEMENT - MoveOutHc: {MoveOutHc}",
                        sourceRecord.MoveOutHc);
                }
                else
                {
                    _logger.LogWarning("⚠️ [ApproveMovement] Source PE_MANAGEMENT not found for CC: {CostCenter}, Month: {Month}, Year: {Year}",
                        movement.MoveOutCostCenterCode, peMonth, peYear);
                }

                // ═══════════════════════════════════════════════════════════════════
                // 2. อัพเดต Target PE_MANAGEMENT (Cost Center ที่ MoveIn/รับพนักงาน)
                // ═══════════════════════════════════════════════════════════════════
                var targetRecord = await _context.HRB_PE_MANAGEMENT
                    .FirstOrDefaultAsync(x => x.CostCenterCode == movement.MoveInCostCenterCode
                                           && x.PeMonth == peMonth
                                           && x.PeYear == peYear
                                           && x.IsActive);

                if (targetRecord != null)
                {
                    // Target รับ MoveIn (ค่าเท่ากับ MoveOut ของ Source)
                    targetRecord.MoveInHc = (targetRecord.MoveInHc ?? 0) + (movement.MoveOutHc ?? 0);
                    targetRecord.MoveInBaseWage = AddDecimals(targetRecord.MoveInBaseWage, movement.MoveOutBaseWage);
                    targetRecord.UpdatedBy = approvedBy;
                    targetRecord.UpdatedDate = DateTime.Now;

                    _logger.LogInformation("🔍 [ApproveMovement] Updated Target PE_MANAGEMENT - MoveInHc: {MoveInHc}",
                        targetRecord.MoveInHc);
                }
                else
                {
                    _logger.LogWarning("⚠️ [ApproveMovement] Target PE_MANAGEMENT not found for CC: {CostCenter}, Month: {Month}, Year: {Year}",
                        movement.MoveInCostCenterCode, peMonth, peYear);
                }

                // ═══════════════════════════════════════════════════════════════════
                // 3. อัพเดตสถานะ Movement
                // ═══════════════════════════════════════════════════════════════════
                movement.ApprovalStatus = "APPROVED";
                movement.Status = "Approved";
                movement.ApprovedBy = approvedBy;
                movement.ApprovedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // ═══════════════════════════════════════════════════════════════════
                // 4. คำนวณ Accumulated และ B1 สำหรับ Source
                // ═══════════════════════════════════════════════════════════════════
                if (sourceRecord != null)
                {
                    await CalculateAccumulatedAsync(sourceRecord.CostCenterCode!, peMonth, peYear);
                    await CalculateB1Async(sourceRecord.PeId);
                    _logger.LogInformation("✅ [ApproveMovement] Recalculated B1 for Source CC: {CostCenter}",
                        sourceRecord.CostCenterCode);
                }

                // ═══════════════════════════════════════════════════════════════════
                // 5. คำนวณ Accumulated และ B1 สำหรับ Target
                // ═══════════════════════════════════════════════════════════════════
                if (targetRecord != null)
                {
                    await CalculateAccumulatedAsync(targetRecord.CostCenterCode!, peMonth, peYear);
                    await CalculateB1Async(targetRecord.PeId);
                    _logger.LogInformation("✅ [ApproveMovement] Recalculated B1 for Target CC: {CostCenter}",
                        targetRecord.CostCenterCode);
                }

                await transaction.CommitAsync();

                _logger.LogInformation("✅ [ApproveMovement] Movement {MovementId} approved by {ApprovedBy}", movementId, approvedBy);

                // NOTE: Notification จะถูกสร้างที่ Controller โดยเรียก CreateApprovalResultNotificationAsync()
                // ไม่ต้องสร้างซ้ำที่นี่

                return new MovementResponse
                {
                    Success = true,
                    Message = "Movement approved successfully",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error approving movement {MovementId}", movementId);
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// ปฏิเสธ Movement (Reject)
        /// </summary>
        public async Task<MovementResponse> RejectMovementAsync(int movementId, string rejectedBy, string reason)
        {
            try
            {
                var movement = await _context.HRB_PE_MOVEMENT.FirstOrDefaultAsync(x => x.Id == movementId);
                if (movement == null)
                    return new MovementResponse { Success = false, Message = "Movement not found" };

                if (movement.ApprovalStatus != "PENDING")
                    return new MovementResponse { Success = false, Message = "Movement is not pending approval" };

                movement.ApprovalStatus = "REJECTED";
                movement.Status = "Rejected";
                movement.RejectedReason = reason;
                movement.ApprovedBy = rejectedBy;
                movement.ApprovedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Movement {MovementId} rejected by {RejectedBy}. Reason: {Reason}",
                    movementId, rejectedBy, reason);

                return new MovementResponse
                {
                    Success = true,
                    Message = "Movement rejected successfully",
                    MovementId = movement.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting movement {MovementId}", movementId);
                return new MovementResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        /// <summary>
        /// ดึงไฟล์แนบของ Movement
        /// </summary>
        public async Task<List<MovementAttachmentDto>> GetMovementAttachmentsAsync(int movementId)
        {
            try
            {
                var movement = await _context.HRB_PE_MOVEMENT.FirstOrDefaultAsync(x => x.Id == movementId);
                if (movement?.UploadLogId == null)
                    return new List<MovementAttachmentDto>();

                var files = await _context.HRB_UPLOAD_LOG
                    .Where(x => x.Id == movement.UploadLogId && x.IsActive)
                    .Select(x => new MovementAttachmentDto
                    {
                        UploadId = x.Id,
                        Seq = x.Seq,
                        FileName = x.FileName ?? "Unknown",
                        FileSize = x.FileSize,
                        FileType = x.FileType,
                        MimeType = x.MimeType,
                        UploadedDate = x.UploadedDate,
                        UploadedBy = x.UploadedBy
                    })
                    .ToListAsync();

                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attachments for movement {MovementId}", movementId);
                return new List<MovementAttachmentDto>();
            }
        }

        #endregion

        #region Calculation Methods

        /// <summary>
        /// คำนวณ B1 (Budget After Adjustment)
        /// สูตร: B1_HC = B0_HC + ACC_MOVE_IN_HC + ACC_ADD_HC - ACC_MOVE_OUT_HC - ACC_CUT_HC
        /// </summary>
        public async Task<bool> CalculateB1Async(int peId)
        {
            try
            {
                var record = await _context.HRB_PE_MANAGEMENT.FirstOrDefaultAsync(x => x.PeId == peId);
                if (record == null) return false;

                // Calculate B1 HC
                record.B1Hc = (record.B0Hc ?? 0)
                    + (record.AccMoveInHc ?? 0)
                    + (record.AccAddHc ?? 0)
                    - (record.AccMoveOutHc ?? 0)
                    - (record.AccCutHc ?? 0);

                // Calculate B1 Base+Wage
                var b0 = record.B0BaseWage ?? 0;
                var accMoveIn = record.AccMoveInBaseWage ?? 0;
                var accAdd = record.AccAddBaseWage ?? 0;
                var accMoveOut = record.AccMoveOutBaseWage ?? 0;
                var accCut = record.AccCutBaseWage ?? 0;

                record.B1BaseWage = b0 + accMoveIn + accAdd - accMoveOut - accCut;

                record.UpdatedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                // Recalculate Diff
                await CalculateDiffAsync(peId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating B1 for PeId: {PeId}", peId);
                return false;
            }
        }

        /// <summary>
        /// คำนวณ Accumulated Data
        /// รวม Transaction ตั้งแต่เดือนที่ 1 ถึงเดือนปัจจุบัน
        /// </summary>
        public async Task<bool> CalculateAccumulatedAsync(string costCenterCode, int peMonth, int peYear)
        {
            try
            {
                // Get all records for this cost center up to current month
                var records = await _context.HRB_PE_MANAGEMENT
                    .Where(x => x.CostCenterCode == costCenterCode
                        && x.PeYear == peYear
                        && x.PeMonth <= peMonth
                        && x.IsActive)
                    .ToListAsync();

                // Calculate accumulated values
                var accMoveInHc = records.Sum(x => x.MoveInHc ?? 0);
                var accMoveOutHc = records.Sum(x => x.MoveOutHc ?? 0);
                var accAddHc = records.Sum(x => x.AdditionalHc ?? 0);
                var accCutHc = records.Sum(x => x.CutHc ?? 0);

                var accMoveInBaseWage = records.Sum(x => x.MoveInBaseWage ?? 0);
                var accMoveOutBaseWage = records.Sum(x => x.MoveOutBaseWage ?? 0);
                var accAddBaseWage = records.Sum(x => x.AdditionalBaseWage ?? 0);
                var accCutBaseWage = records.Sum(x => x.CutBaseWage ?? 0);

                // Update current month record
                var currentRecord = records.FirstOrDefault(x => x.PeMonth == peMonth);
                if (currentRecord != null)
                {
                    currentRecord.AccMoveInHc = accMoveInHc;
                    currentRecord.AccMoveOutHc = accMoveOutHc;
                    currentRecord.AccAddHc = accAddHc;
                    currentRecord.AccCutHc = accCutHc;
                    currentRecord.AccMoveInBaseWage = accMoveInBaseWage;
                    currentRecord.AccMoveOutBaseWage = accMoveOutBaseWage;
                    currentRecord.AccAddBaseWage = accAddBaseWage;
                    currentRecord.AccCutBaseWage = accCutBaseWage;
                    currentRecord.UpdatedDate = DateTime.Now;

                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating accumulated data for Cost Center: {CostCenter}", costCenterCode);
                return false;
            }
        }

        /// <summary>
        /// คำนวณ Diff (Difference)
        /// Diff B0 = B0 - Actual
        /// Diff B1 = B1 - Actual
        /// </summary>
        public async Task<bool> CalculateDiffAsync(int peId)
        {
            try
            {
                var record = await _context.HRB_PE_MANAGEMENT.FirstOrDefaultAsync(x => x.PeId == peId);
                if (record == null) return false;

                // Calculate Diff B0
                record.DiffB0Hc = (record.B0Hc ?? 0) - (record.ActualHc ?? 0);
                record.DiffB0BaseWagePremium = (record.B0BaseWage ?? 0) - (record.ActualBaseWagePremium ?? 0);

                // Calculate Diff B1
                record.DiffB1Hc = (record.B1Hc ?? 0) - (record.ActualHc ?? 0);
                record.DiffB1BaseWagePremium = (record.B1BaseWage ?? 0) - (record.ActualBaseWagePremium ?? 0);

                record.UpdatedDate = DateTime.Now;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating diff for PeId: {PeId}", peId);
                return false;
            }
        }

        #endregion

        #region Helper Methods

        private static PEManagementDto MapToDto(HRB_PE_MANAGEMENT entity)
        {
            return new PEManagementDto
            {
                PeId = entity.PeId,
                CompanyId = entity.CompanyId,
                CompanyName = entity.CompanyName,
                PeMonth = entity.PeMonth,
                PeYear = entity.PeYear,
                CostCenterCode = entity.CostCenterCode,
                CostCenterName = entity.CostCenterName,
                Division = entity.Division,
                Department = entity.Department,
                Section = entity.Section,
                GroupData = entity.GroupData,
                B0Hc = entity.B0Hc,
                B0BaseWage = entity.B0BaseWage,
                MoveInHc = entity.MoveInHc,
                MoveInBaseWage = entity.MoveInBaseWage,
                MoveOutHc = entity.MoveOutHc,
                MoveOutBaseWage = entity.MoveOutBaseWage,
                AdditionalHc = entity.AdditionalHc,
                AdditionalBaseWage = entity.AdditionalBaseWage,
                CutHc = entity.CutHc,
                CutBaseWage = entity.CutBaseWage,
                AccMoveInHc = entity.AccMoveInHc,
                AccMoveInBaseWage = entity.AccMoveInBaseWage,
                AccMoveOutHc = entity.AccMoveOutHc,
                AccMoveOutBaseWage = entity.AccMoveOutBaseWage,
                AccAddHc = entity.AccAddHc,
                AccAddBaseWage = entity.AccAddBaseWage,
                AccCutHc = entity.AccCutHc,
                AccCutBaseWage = entity.AccCutBaseWage,
                B1Hc = entity.B1Hc,
                B1BaseWage = entity.B1BaseWage,
                ActualHc = entity.ActualHc,
                ActualBaseWagePremium = entity.ActualBaseWagePremium,
                DiffB0Hc = entity.DiffB0Hc,
                DiffB0BaseWagePremium = entity.DiffB0BaseWagePremium,
                DiffB1Hc = entity.DiffB1Hc,
                DiffB1BaseWagePremium = entity.DiffB1BaseWagePremium,
                IsActive = entity.IsActive,
                UpdatedBy = entity.UpdatedBy,
                UpdatedDate = entity.UpdatedDate
            };
        }

        private static string DetermineMovementType(HRB_PE_MOVEMENT movement, string costCenterCode)
        {
            // MoveIn: Cost Center นี้เป็นปลายทาง (รับพนักงานเข้ามา)
            // กรณี 1: มี MoveInHc และ MoveInCostCenterCode ตรงกับ costCenterCode
            if (movement.MoveInHc > 0 && movement.MoveInCostCenterCode == costCenterCode)
                return "MoveIn";

            // MoveOut: Cost Center นี้เป็นต้นทาง (ส่งพนักงานออกไป)
            if (movement.MoveOutHc > 0 && movement.MoveOutCostCenterCode == costCenterCode)
                return "MoveOut";

            // MoveIn (จาก MoveOut transaction): Target Cost Center เห็น MoveOut ของคนอื่นเป็น MoveIn ของตัวเอง
            // กรณี 2: มี MoveOutHc แต่ MoveInCostCenterCode ตรงกับ costCenterCode (Target เห็น transaction นี้)
            if (movement.MoveOutHc > 0 && movement.MoveInCostCenterCode == costCenterCode)
                return "MoveIn";

            if (movement.AdditionalHc > 0)
                return "Additional";
            if (movement.CutHc > 0)
                return "Cut";
            return "Unknown";
        }

        private static decimal AddDecimals(decimal? value1, decimal? value2)
        {
            return (value1 ?? 0) + (value2 ?? 0);
        }

        private static string FormatFileSize(long bytes)
        {
            if (bytes >= 1048576)
                return $"{bytes / 1048576.0:N2} MB";
            if (bytes >= 1024)
                return $"{bytes / 1024.0:N2} KB";
            return $"{bytes} bytes";
        }

        private static string GetContentType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLower();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls" => "application/vnd.ms-excel",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                _ => "application/octet-stream"
            };
        }

        #endregion
    }
}
