using System.Collections.Generic;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Response DTO สำหรับ Batch Budget Entry Save
    ///
    /// SA Answers Applied:
    /// - Q1: All or nothing - ถ้า error 1 แถว จะ rollback ทั้งหมด
    ///   * TotalSuccess = 0 หรือ TotalSubmitted (ไม่มี partial)
    /// - Q3: Reject duplicate - จะอยู่ใน FailedSaves
    /// - Q6: Pre-check - error message เป็นภาษาไทย
    /// </summary>
    public class BatchBudgetResponse
    {
        /// <summary>
        /// บันทึกสำเร็จหรือไม่ (true = สำเร็จทั้งหมด, false = ล้มเหลว)
        /// Q1: All or nothing - จะเป็น true เฉพาะเมื่อบันทึกสำเร็จ 100%
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// ข้อความสรุปผลลัพธ์
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// จำนวนแถวที่ส่งมาทั้งหมด
        /// </summary>
        public int TotalSubmitted { get; set; }

        /// <summary>
        /// จำนวนแถวที่บันทึกสำเร็จ
        /// Q1: All or nothing - จะเป็น 0 หรือ TotalSubmitted เท่านั้น
        /// </summary>
        public int TotalSuccess { get; set; }

        /// <summary>
        /// จำนวนแถวที่ล้มเหลว
        /// Q1: All or nothing - จะเป็น 0 หรือ TotalSubmitted เท่านั้น
        /// </summary>
        public int TotalFailed { get; set; }

        /// <summary>
        /// รายการที่บันทึกสำเร็จ (Q1: จะมีค่าเฉพาะเมื่อสำเร็จทั้งหมด)
        /// </summary>
        public List<BudgetSaveResult> SuccessfulSaves { get; set; } = new List<BudgetSaveResult>();

        /// <summary>
        /// รายการที่ล้มเหลว พร้อมรายละเอียด error
        /// Q3: Reject duplicate - จะมี error message "พบข้อมูลซ้ำ"
        /// Q6: Pre-check - error message เป็นภาษาไทย
        /// </summary>
        public List<BudgetSaveError> FailedSaves { get; set; } = new List<BudgetSaveError>();
    }

    /// <summary>
    /// ข้อมูลแถวที่บันทึกสำเร็จ
    /// </summary>
    public class BudgetSaveResult
    {
        /// <summary>
        /// ลำดับแถวใน batch (0-based index)
        /// </summary>
        public int RowIndex { get; set; }

        /// <summary>
        /// BUDGET_ID ที่ได้จาก database หลัง insert
        /// </summary>
        public int BudgetId { get; set; }

        /// <summary>
        /// รหัสพนักงาน (EMP_CODE)
        /// </summary>
        public string EmpCode { get; set; } = string.Empty;

        /// <summary>
        /// ปีงบประมาณ (BUDGET_YEAR)
        /// </summary>
        public int BudgetYear { get; set; }

        /// <summary>
        /// Cost Center Code
        /// </summary>
        public string CostCenterCode { get; set; } = string.Empty;

        /// <summary>
        /// Company ID (1=BJC, 2=BIGC)
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// ข้อความสำเร็จ
        /// </summary>
        public string Message { get; set; } = "บันทึกสำเร็จ";
    }

    /// <summary>
    /// ข้อมูลแถวที่ล้มเหลว พร้อม error details
    /// Q3: Reject duplicate - จะมี errorMessage เป็นภาษาไทย
    /// Q6: Pre-check - error message มาจาก DuplicateBudgetException
    /// </summary>
    public class BudgetSaveError
    {
        /// <summary>
        /// ลำดับแถวใน batch (0-based index)
        /// -1 = error ทั้ง batch (ไม่ระบุแถวเฉพาะ)
        /// </summary>
        public int RowIndex { get; set; }

        /// <summary>
        /// รหัสพนักงาน (ถ้ามี)
        /// </summary>
        public string? EmpCode { get; set; }

        /// <summary>
        /// ปีงบประมาณ (ถ้ามี)
        /// </summary>
        public int? BudgetYear { get; set; }

        /// <summary>
        /// Cost Center Code (ถ้ามี)
        /// </summary>
        public string? CostCenterCode { get; set; }

        /// <summary>
        /// ข้อความ error หลัก (ภาษาไทย)
        /// Q6: Pre-check - "พบข้อมูลซ้ำ: พนักงาน {EmpCode} ปีงบประมาณ {BudgetYear} Cost Center {CostCenter}"
        /// </summary>
        public string ErrorMessage { get; set; } = string.Empty;

        /// <summary>
        /// รายละเอียด error เพิ่มเติม
        /// </summary>
        public string? ErrorDetails { get; set; }

        /// <summary>
        /// ข้อมูลที่ส่งมา (สำหรับ debugging)
        /// </summary>
        public BudgetResponseDto? SubmittedData { get; set; }
    }
}
