using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Request DTO สำหรับ Batch Budget Entry Save
    /// ใช้สำหรับส่งข้อมูล budget หลายแถวพร้อมกันจาก Frontend
    ///
    /// SA Answers Applied:
    /// - Q1: All or nothing (TransactionScope)
    /// - Q2: ไม่จำกัดจำนวนแถว (no batch limit)
    /// - Q3: Reject duplicate
    /// - Q4: JWT Token (comment ไว้ก่อน)
    /// - Q6: Pre-check duplicate
    /// </summary>
    public class BatchBudgetRequest
    {
        /// <summary>
        /// รายการ Budget ที่ต้องการบันทึก (จาก batchData array)
        /// Q2: ไม่จำกัดจำนวนแถว
        /// </summary>
        [Required(ErrorMessage = "Budgets list is required")]
        [MinLength(1, ErrorMessage = "At least one budget entry is required")]
        public List<BudgetResponseDto> Budgets { get; set; } = new List<BudgetResponseDto>();

        /// <summary>
        /// ผู้ใช้ที่ทำการบันทึก
        /// Q4: จะได้จาก JWT Token เมื่อ Auth เสร็จ (ตอนนี้ใช้ "DevUser")
        /// </summary>
        [Required(ErrorMessage = "CreatedBy is required")]
        [MaxLength(50)]
        public string CreatedBy { get; set; } = string.Empty;
    }
}
