namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// DTO สำหรับแสดงประวัติ Transaction ของ Cost Center
    /// </summary>
    public class MovementHistoryDto
    {
        public int Id { get; set; }
        public int? PeMovId { get; set; }
        public int? Seq { get; set; }

        /// <summary>
        /// ประเภท Transaction: MoveIn, MoveOut, Additional, Cut
        /// </summary>
        public string? MovementType { get; set; }

        // Movement Values
        public int? MoveInHc { get; set; }
        public decimal? MoveInBaseWage { get; set; }
        public int? MoveOutHc { get; set; }
        public decimal? MoveOutBaseWage { get; set; }
        public int? AdditionalHc { get; set; }
        public decimal? AdditionalBaseWage { get; set; }
        public int? CutHc { get; set; }
        public decimal? CutBaseWage { get; set; }

        // Cost Center Info (for Move In/Out)
        public string? FromCostCenterCode { get; set; }
        public string? FromCostCenterName { get; set; }
        public string? ToCostCenterCode { get; set; }
        public string? ToCostCenterName { get; set; }

        // Remark & Status
        public string? Remark { get; set; }
        public string? Status { get; set; }

        // Approval Workflow
        /// <summary>
        /// สถานะการอนุมัติ: PENDING, APPROVED, REJECTED
        /// </summary>
        public string? ApprovalStatus { get; set; }

        /// <summary>
        /// เหตุผลที่ Reject (ถ้ามี)
        /// </summary>
        public string? RejectedReason { get; set; }

        /// <summary>
        /// EmpCode ของผู้ที่ต้อง Approve (สำหรับตรวจสอบว่า current user มีสิทธิ์ Approve หรือไม่)
        /// </summary>
        public string? PendingEmpCode { get; set; }

        // Audit Info
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }

        // Attached Files count
        public int AttachedFilesCount { get; set; }
    }

    /// <summary>
    /// Response DTO สำหรับ API ที่ return list
    /// </summary>
    public class PEManagementListResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public List<PEManagementDto>? Data { get; set; }
        public int TotalCount { get; set; }
    }

    /// <summary>
    /// Response DTO สำหรับ API ที่ return single item
    /// </summary>
    public class PEManagementResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public PEManagementDto? Data { get; set; }
    }

    /// <summary>
    /// Response DTO สำหรับ Movement Transaction
    /// </summary>
    public class MovementResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? MovementId { get; set; }
    }

    /// <summary>
    /// Filter DTO สำหรับ query PE Management data
    /// </summary>
    public class PEManagementFilter
    {
        public int? CompanyId { get; set; }
        public int? PeMonth { get; set; }
        public int? PeYear { get; set; }
        public string? CostCenterCode { get; set; }
        public string? Division { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }

        /// <summary>
        /// User ID for Data Access Filtering (optional - if null, no filtering applied)
        /// </summary>
        public int? UserId { get; set; }
    }

    /// <summary>
    /// DTO สำหรับ Pending Movement (รอการอนุมัติ)
    /// </summary>
    public class PendingMovementDto
    {
        public int MovementId { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;

        // Source Cost Center (ผู้ส่ง)
        public string? SourceCostCenterCode { get; set; }
        public string? SourceCostCenterName { get; set; }

        // Target Cost Center (ผู้รับ)
        public string? TargetCostCenterCode { get; set; }
        public string? TargetCostCenterName { get; set; }

        // Movement Values
        public int Hc { get; set; }
        public decimal BaseWage { get; set; }

        // Period
        public int PeMonth { get; set; }
        public int PeYear { get; set; }
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }

        // Requester Info
        public string? RequestedBy { get; set; }
        public DateTime? RequestedDate { get; set; }

        // Remark & Attachment
        public string? Remark { get; set; }
        public bool HasAttachment { get; set; }
    }

    /// <summary>
    /// DTO สำหรับไฟล์แนบของ Movement
    /// </summary>
    public class MovementAttachmentDto
    {
        public int UploadId { get; set; }
        public int Seq { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? FileSize { get; set; }
        public string? FileType { get; set; }
        public string? MimeType { get; set; }
        public DateTime? UploadedDate { get; set; }
        public string? UploadedBy { get; set; }
    }
}
