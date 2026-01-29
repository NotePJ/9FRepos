using HCBPCoreUI_Backend.DTOs.PEManagement;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Interface สำหรับ PE Management Service
    /// จัดการงบประมาณ Headcount (HC) และ Base+Wage
    /// </summary>
    public interface IPEManagementService
    {
        // ===== GET APIs =====

        /// <summary>
        /// ดึงข้อมูล PE Management ทั้งหมดตาม Filter
        /// </summary>
        Task<PEManagementListResponse> GetAllAsync(PEManagementFilter filter);

        /// <summary>
        /// ดึงข้อมูล PE Management ตาม Cost Center Code
        /// </summary>
        Task<PEManagementResponse> GetByCostCenterAsync(string costCenterCode, int? peMonth, int? peYear);

        /// <summary>
        /// ดึงข้อมูล Accumulated Data ตามเดือนและปี
        /// </summary>
        Task<PEManagementListResponse> GetAccumulatedDataAsync(int peMonth, int peYear);

        /// <summary>
        /// ดึงประวัติ Transaction ของ Cost Center
        /// </summary>
        Task<List<MovementHistoryDto>> GetTransactionHistoryAsync(string costCenterCode, int? peMonth, int? peYear);

        // ===== Movement Transaction APIs =====

        /// <summary>
        /// บันทึก Move In Transaction
        /// ย้าย HC เข้ามาที่ Cost Center จาก Cost Center อื่น
        /// </summary>
        Task<MovementResponse> MoveInAsync(MoveInRequest request, string updatedBy);

        /// <summary>
        /// บันทึก Move Out Transaction
        /// ย้าย HC ออกจาก Cost Center ไปยัง Cost Center อื่น
        /// </summary>
        Task<MovementResponse> MoveOutAsync(MoveOutRequest request, string updatedBy);

        /// <summary>
        /// บันทึก Additional Transaction
        /// เพิ่ม HC ใหม่เข้าระบบ (ต้องได้รับอนุมัติจาก Management)
        /// </summary>
        Task<MovementResponse> AdditionalAsync(AdditionalRequest request, string updatedBy);

        /// <summary>
        /// บันทึก Cut Transaction
        /// ลด HC ออกจากระบบ
        /// </summary>
        Task<MovementResponse> CutAsync(CutRequest request, string updatedBy);

        // ===== File Upload API =====

        /// <summary>
        /// Upload ไฟล์แนบสำหรับ Movement Transaction
        /// Max size: 4 MB per file
        /// Allowed types: PDF, Excel, Word, Images
        /// </summary>
        Task<FileUploadResponse> UploadFilesAsync(FileUploadRequest request, string uploadedBy);

        /// <summary>
        /// ดาวน์โหลดไฟล์แนบ
        /// </summary>
        Task<(byte[]? FileData, string? FileName, string? ContentType)> DownloadFileAsync(int movementId, int seq);

        // ===== Update APIs =====

        /// <summary>
        /// อัปเดต B0 (Budget ต้นปี)
        /// </summary>
        Task<PEManagementResponse> UpdateB0Async(int peId, int? b0Hc, decimal? b0BaseWage, string updatedBy);

        /// <summary>
        /// อนุมัติ/ปฏิเสธ Transaction
        /// </summary>
        Task<MovementResponse> ApproveTransactionAsync(int movementId, string status, string approvedBy);

        // ===== Approval Workflow APIs =====

        /// <summary>
        /// ดึงรายการ Movement ที่รอการอนุมัติ
        /// </summary>
        Task<List<PendingMovementDto>> GetPendingMovementsAsync(string empCode, int? companyId, int? peMonth, int? peYear);

        /// <summary>
        /// อนุมัติ Movement (Accept)
        /// </summary>
        Task<MovementResponse> ApproveMovementAsync(int movementId, string approvedBy, string? remark);

        /// <summary>
        /// ปฏิเสธ Movement (Reject)
        /// </summary>
        Task<MovementResponse> RejectMovementAsync(int movementId, string rejectedBy, string reason);

        /// <summary>
        /// ดึงไฟล์แนบของ Movement
        /// </summary>
        Task<List<MovementAttachmentDto>> GetMovementAttachmentsAsync(int movementId);

        // ===== Dropdown APIs (B1) =====

        /// <summary>
        /// ดึงรายการ Company จาก HRB_PE_MANAGEMENT (กรองตาม CompanyAccess)
        /// </summary>
        Task<List<PECompanyDto>> GetB1CompaniesAsync(string? companyAccess = null);

        /// <summary>
        /// ดึงรายการ Year จาก HRB_PE_MANAGEMENT ตาม Company
        /// </summary>
        Task<List<int>> GetB1YearsAsync(int? companyId = null);

        /// <summary>
        /// ดึงรายการเดือน (Static 1-12)
        /// </summary>
        Task<List<PEMonthDto>> GetB1MonthsAsync();

        /// <summary>
        /// ดึงรายการ Cost Center จาก HRB_PE_MANAGEMENT ตาม filters
        /// </summary>
        Task<List<PECostCenterDto>> GetB1CostCentersAsync(int? companyId, int? peYear = null);

        // ===== Calculation Methods =====

        /// <summary>
        /// คำนวณ B1 (Budget After Adjustment)
        /// สูตร: B1_HC = B0_HC + ACC_MOVE_IN_HC + ACC_ADD_HC - ACC_MOVE_OUT_HC - ACC_CUT_HC
        /// </summary>
        Task<bool> CalculateB1Async(int peId);

        /// <summary>
        /// คำนวณ Accumulated Data
        /// รวม Transaction ตั้งแต่เดือนที่ 1 ถึงเดือนปัจจุบัน
        /// </summary>
        Task<bool> CalculateAccumulatedAsync(string costCenterCode, int peMonth, int peYear);

        /// <summary>
        /// คำนวณ Diff (Difference)
        /// Diff B0 = B0 - Actual
        /// Diff B1 = B1 - Actual
        /// </summary>
        Task<bool> CalculateDiffAsync(int peId);
    }
}
