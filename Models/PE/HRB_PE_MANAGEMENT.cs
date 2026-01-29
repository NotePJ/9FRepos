using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.PE
{
    /// <summary>
    /// PE Management - ข้อมูลบริหาร Headcount และ Budget
    /// </summary>
    [Table("HRB_PE_MANAGEMENT")]
    public class HRB_PE_MANAGEMENT
    {
        /// <summary>
        /// Primary Key - PE ID
        /// </summary>
        [Key]
        [Column("PE_ID")]
        public int PeId { get; set; }

        /// <summary>
        /// Company ID (Required)
        /// </summary>
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        /// <summary>
        /// Company Name
        /// </summary>
        [Column("COMPANY_NAME")]
        [StringLength(100)]
        public string? CompanyName { get; set; }

        /// <summary>
        /// เดือน PE (1-12)
        /// </summary>
        [Column("PE_MONTH")]
        public int? PeMonth { get; set; }

        /// <summary>
        /// ปี PE
        /// </summary>
        [Column("PE_YEAR")]
        public int PeYear { get; set; }

        /// <summary>
        /// รหัส Cost Center
        /// </summary>
        [Column("COST_CENTER_CODE")]
        [StringLength(50)]
        public string? CostCenterCode { get; set; }

        /// <summary>
        /// ชื่อ Cost Center
        /// </summary>
        [Column("COST_CENTER_NAME")]
        [StringLength(100)]
        public string? CostCenterName { get; set; }

        /// <summary>
        /// Division
        /// </summary>
        [Column("DIVISION")]
        [StringLength(100)]
        public string? Division { get; set; }

        /// <summary>
        /// Department
        /// </summary>
        [Column("DEPARTMENT")]
        [StringLength(100)]
        public string? Department { get; set; }

        /// <summary>
        /// Section
        /// </summary>
        [Column("SECTION")]
        [StringLength(100)]
        public string? Section { get; set; }

        /// <summary>
        /// Group Data
        /// </summary>
        [Column("GROUP_DATA")]
        [StringLength(100)]
        public string? GroupData { get; set; }

        // ===== B0 (Budget ต้นปี) =====

        /// <summary>
        /// B0 Headcount
        /// </summary>
        [Column("B0_HC")]
        public int? B0Hc { get; set; }

        /// <summary>
        /// B0 Base+Wage
        /// </summary>
        [Column("B0_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? B0BaseWage { get; set; }

        // ===== Movement Data (รายเดือน) =====

        /// <summary>
        /// Move In HC (ย้ายเข้า)
        /// </summary>
        [Column("MOVE_IN_HC")]
        public int? MoveInHc { get; set; }

        /// <summary>
        /// Move In Base+Wage
        /// </summary>
        [Column("MOVE_IN_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? MoveInBaseWage { get; set; }

        /// <summary>
        /// Move Out HC (ย้ายออก)
        /// </summary>
        [Column("MOVE_OUT_HC")]
        public int? MoveOutHc { get; set; }

        /// <summary>
        /// Move Out Base+Wage
        /// </summary>
        [Column("MOVE_OUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? MoveOutBaseWage { get; set; }

        /// <summary>
        /// Additional HC (เพิ่มใหม่)
        /// </summary>
        [Column("ADDITIONAL_HC")]
        public int? AdditionalHc { get; set; }

        /// <summary>
        /// Additional Base+Wage
        /// </summary>
        [Column("ADDITIONAL_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AdditionalBaseWage { get; set; }

        /// <summary>
        /// Cut HC (ลดออก)
        /// </summary>
        [Column("CUT_HC")]
        public int? CutHc { get; set; }

        /// <summary>
        /// Cut Base+Wage
        /// </summary>
        [Column("CUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? CutBaseWage { get; set; }

        // ===== Accumulated Data (สะสม) =====

        /// <summary>
        /// Accumulated Move In HC
        /// </summary>
        [Column("ACC_MOVE_IN_HC")]
        public int? AccMoveInHc { get; set; }

        /// <summary>
        /// Accumulated Move In Base+Wage
        /// </summary>
        [Column("ACC_MOVE_IN_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AccMoveInBaseWage { get; set; }

        /// <summary>
        /// Accumulated Move Out HC
        /// </summary>
        [Column("ACC_MOVE_OUT_HC")]
        public int? AccMoveOutHc { get; set; }

        /// <summary>
        /// Accumulated Move Out Base+Wage
        /// </summary>
        [Column("ACC_MOVE_OUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AccMoveOutBaseWage { get; set; }

        /// <summary>
        /// Accumulated Additional HC
        /// </summary>
        [Column("ACC_ADD_HC")]
        public int? AccAddHc { get; set; }

        /// <summary>
        /// Accumulated Additional Base+Wage
        /// </summary>
        [Column("ACC_ADD_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AccAddBaseWage { get; set; }

        /// <summary>
        /// Accumulated Cut HC
        /// </summary>
        [Column("ACC_CUT_HC")]
        public int? AccCutHc { get; set; }

        /// <summary>
        /// Accumulated Cut Base+Wage
        /// </summary>
        [Column("ACC_CUT_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? AccCutBaseWage { get; set; }

        // ===== B1 (Budget After Adjustment) =====

        /// <summary>
        /// B1 Headcount = B0 + AccMoveIn + AccAdd - AccMoveOut - AccCut
        /// </summary>
        [Column("B1_HC")]
        public int? B1Hc { get; set; }

        /// <summary>
        /// B1 Base+Wage
        /// </summary>
        [Column("B1_BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal? B1BaseWage { get; set; }

        // ===== Actual Data =====

        /// <summary>
        /// Actual Headcount
        /// </summary>
        [Column("ACTUAL_HC")]
        public int? ActualHc { get; set; }

        /// <summary>
        /// Actual Base+Wage+Premium
        /// </summary>
        [Column("ACTUAL_BASE_WAGE_PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? ActualBaseWagePremium { get; set; }

        // ===== Diff (Difference) =====

        /// <summary>
        /// Diff B0 HC = B0 - Actual
        /// </summary>
        [Column("DIFF_B0_HC")]
        public int? DiffB0Hc { get; set; }

        /// <summary>
        /// Diff B0 Base+Wage+Premium
        /// </summary>
        [Column("DIFF_B0_BASE_WAGE_PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? DiffB0BaseWagePremium { get; set; }

        /// <summary>
        /// Diff B1 HC = B1 - Actual
        /// </summary>
        [Column("DIFF_B1_HC")]
        public int? DiffB1Hc { get; set; }

        /// <summary>
        /// Diff B1 Base+Wage+Premium
        /// </summary>
        [Column("DIFF_B1_BASE_WAGE_PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? DiffB1BaseWagePremium { get; set; }

        // ===== System Fields =====

        /// <summary>
        /// สถานะ Active (Required)
        /// </summary>
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; }

        /// <summary>
        /// ผู้แก้ไขล่าสุด
        /// </summary>
        [Column("UPDATED_BY")]
        [StringLength(100)]
        public string? UpdatedBy { get; set; }

        /// <summary>
        /// วันที่แก้ไขล่าสุด
        /// </summary>
        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
