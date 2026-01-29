using System;
using HCBPCoreUI_Backend.DTOs.Budget;

namespace HCBPCoreUI_Backend.Exceptions
{
    /// <summary>
    /// Custom Exception สำหรับ Duplicate Budget Entry
    ///
    /// SA Answer Q6: Option B (Pre-check duplicate)
    /// - ตรวจสอบข้อมูลซ้ำก่อน save
    /// - Error message เป็นภาษาไทยชัดเจน
    /// - เก็บ context สำหรับ debugging
    ///
    /// Unique Key: EMP_CODE + BUDGET_YEAR + COST_CENTER_CODE
    /// </summary>
    public class DuplicateBudgetException : Exception
    {
        /// <summary>
        /// รหัสพนักงานที่ซ้ำ
        /// </summary>
        public string EmpCode { get; set; } = string.Empty;

        /// <summary>
        /// ปีงบประมาณที่ซ้ำ
        /// </summary>
        public int BudgetYear { get; set; }

        /// <summary>
        /// Cost Center Code ที่ซ้ำ
        /// </summary>
        public string CostCenterCode { get; set; } = string.Empty;

        /// <summary>
        /// ลำดับแถวใน batch ที่เกิด error (0-based)
        /// </summary>
        public int RowIndex { get; set; }

        /// <summary>
        /// ข้อมูลที่ส่งมา (สำหรับ debugging)
        /// </summary>
        public BudgetResponseDto? SubmittedData { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public DuplicateBudgetException() : base()
        {
        }

        /// <summary>
        /// Constructor with message (ภาษาไทย)
        /// </summary>
        /// <param name="message">Error message เป็นภาษาไทย</param>
        public DuplicateBudgetException(string message) : base(message)
        {
        }

        /// <summary>
        /// Constructor with message and inner exception
        /// </summary>
        public DuplicateBudgetException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// สร้าง error message เป็นภาษาไทย
        /// </summary>
        public static string FormatMessage(string empCode, int budgetYear, string costCenterCode)
        {
            return $"พบข้อมูลซ้ำ: พนักงาน {empCode} ปีงบประมาณ {budgetYear} Cost Center {costCenterCode}";
        }
    }
}
