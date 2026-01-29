using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.PE
{
    [Table("HRB_PE_MOVEMENT")]
    public class HRB_PE_MOVEMENT
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Column("PE_MOV_ID")]
        public int? PeMovId { get; set; }

        [Column("SEQ")]
        public int? Seq { get; set; }

        [Column("MOVE_IN_HC")]
        public int? MoveInHc { get; set; }

        [Column("MOVE_IN_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? MoveInBaseWage { get; set; }

        [Column("MOVE_OUT_HC")]
        public int? MoveOutHc { get; set; }

        [Column("MOVE_OUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? MoveOutBaseWage { get; set; }

        [Column("ADDITIONAL_HC")]
        public int? AdditionalHc { get; set; }

        [Column("ADDITIONAL_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AdditionalBaseWage { get; set; }

        [Column("CUT_HC")]
        public int? CutHc { get; set; }

        [Column("CUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? CutBaseWage { get; set; }

        [Column("MOVE_IN_COMP")]
        [StringLength(50)]
        public string? MoveInComp { get; set; }

        [Column("MOVE_OUT_COMP")]
        [StringLength(50)]
        public string? MoveOutComp { get; set; }

        [Column("MOVE_IN_MONTH")]
        [StringLength(50)]
        public string? MoveInMonth { get; set; }

        [Column("MOVE_OUT_MONTH")]
        [StringLength(50)]
        public string? MoveOutMonth { get; set; }

        [Column("MOVE_IN_YEAR")]
        [StringLength(50)]
        public string? MoveInYear { get; set; }

        [Column("MOVE_OUT_YEAR")]
        [StringLength(50)]
        public string? MoveOutYear { get; set; }

        [Column("MOVE_IN_COST_CENTER_CODE")]
        [StringLength(50)]
        public string? MoveInCostCenterCode { get; set; }

        [Column("MOVE_OUT_COST_CENTER_CODE")]
        [StringLength(50)]
        public string? MoveOutCostCenterCode { get; set; }

        [Column("MOVE_IN_DIV")]
        [StringLength(100)]
        public string? MoveInDiv { get; set; }

        [Column("MOVE_OUT_DIV")]
        [StringLength(100)]
        public string? MoveOutDiv { get; set; }

        [Column("MOVE_IN_DEPT")]
        [StringLength(100)]
        public string? MoveInDept { get; set; }

        [Column("MOVE_OUT_DEPT")]
        [StringLength(100)]
        public string? MoveOutDept { get; set; }

        [Column("MOVE_IN_SECT")]
        [StringLength(100)]
        public string? MoveInSect { get; set; }

        [Column("MOVE_OUT_SECT")]
        [StringLength(100)]
        public string? MoveOutSect { get; set; }

        [Column("FLAG_MOVE")]
        [StringLength(50)]
        public string? FlagMove { get; set; }

        [Column("REMARK_MOVE")]
        [StringLength(500)]
        public string? RemarkMove { get; set; }

        [Column("STATUS")]
        [StringLength(50)]
        public string? Status { get; set; }

        [Column("UPDATED_BY")]
        [StringLength(100)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }

        [Column("APPROVED_BY")]
        [StringLength(100)]
        public string? ApprovedBy { get; set; }

        [Column("APPROVED_DATE")]
        public DateTime? ApprovedDate { get; set; }

        // ===== Approval Workflow Fields =====

        /// <summary>
        /// สถานะการอนุมัติ: PENDING, APPROVED, REJECTED, AUTO_APPROVED
        /// </summary>
        [Column("APPROVAL_STATUS")]
        [StringLength(50)]
        public string? ApprovalStatus { get; set; }

        /// <summary>
        /// ต้องรอการอนุมัติหรือไม่
        /// </summary>
        [Column("REQUIRES_APPROVAL")]
        public bool? RequiresApproval { get; set; } = false;

        /// <summary>
        /// Cost Center ที่รอการอนุมัติ
        /// </summary>
        [Column("PENDING_COST_CENTER")]
        [StringLength(50)]
        public string? PendingCostCenter { get; set; }

        /// <summary>
        /// User ที่ต้องอนุมัติ (Employee Code)
        /// </summary>
        [Column("PENDING_EMP_CODE")]
        [StringLength(100)]
        public string? PendingEmpCode { get; set; }

        /// <summary>
        /// เหตุผลที่ Reject
        /// </summary>
        [Column("REJECTED_REASON")]
        [StringLength(500)]
        public string? RejectedReason { get; set; }

        /// <summary>
        /// FK to HRB_UPLOAD_LOG.Id (สำหรับ Attachment)
        /// </summary>
        [Column("UPLOAD_LOG_ID")]
        public int? UploadLogId { get; set; }
    }
}
