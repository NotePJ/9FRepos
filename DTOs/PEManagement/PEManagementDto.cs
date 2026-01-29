namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// DTO สำหรับแสดงข้อมูล PE Management ใน AG Grid
    /// </summary>
    public class PEManagementDto
    {
        // Primary Key
        public int PeId { get; set; }

        // Company Info
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public int? PeMonth { get; set; }
        public int PeYear { get; set; }

        // Cost Center Info
        public string? CostCenterCode { get; set; }
        public string? CostCenterName { get; set; }

        // Organization
        public string? Division { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }
        public string? GroupData { get; set; }

        // B0 - Budget ต้นปี
        public int? B0Hc { get; set; }
        public decimal? B0BaseWage { get; set; }

        // Current Month Movements
        public int? MoveInHc { get; set; }
        public decimal? MoveInBaseWage { get; set; }
        public int? MoveOutHc { get; set; }
        public decimal? MoveOutBaseWage { get; set; }
        public int? AdditionalHc { get; set; }
        public decimal? AdditionalBaseWage { get; set; }
        public int? CutHc { get; set; }
        public decimal? CutBaseWage { get; set; }

        // Accumulated
        public int? AccMoveInHc { get; set; }
        public decimal? AccMoveInBaseWage { get; set; }
        public int? AccMoveOutHc { get; set; }
        public decimal? AccMoveOutBaseWage { get; set; }
        public int? AccAddHc { get; set; }
        public decimal? AccAddBaseWage { get; set; }
        public int? AccCutHc { get; set; }
        public decimal? AccCutBaseWage { get; set; }

        // B1 - Budget After Adjustment
        public int? B1Hc { get; set; }
        public decimal? B1BaseWage { get; set; }

        // Actual
        public int? ActualHc { get; set; }
        public decimal? ActualBaseWagePremium { get; set; }

        // Diff
        public int? DiffB0Hc { get; set; }
        public decimal? DiffB0BaseWagePremium { get; set; }
        public int? DiffB1Hc { get; set; }
        public decimal? DiffB1BaseWagePremium { get; set; }

        // Status
        public bool IsActive { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Approval Workflow - สำหรับแสดง Accept/Reject buttons ใน Grid
        /// <summary>
        /// มี Move-In Request ที่รอการอนุมัติหรือไม่
        /// </summary>
        public bool HasPendingMoveIn { get; set; }

        /// <summary>
        /// Movement ID ที่รอการอนุมัติ (ถ้ามี)
        /// </summary>
        public int? PendingMovementId { get; set; }

        /// <summary>
        /// สถานะ Approval: PENDING, APPROVED, REJECTED (ของ pending movement)
        /// </summary>
        public string? PendingApprovalStatus { get; set; }
    }
}
