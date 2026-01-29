using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// DTO สำหรับ Response จาก UpdateBudget API
    /// ใช้กับ PUT /api/Budget/UpdateBudget endpoint
    ///
    /// ส่งกลับสถานะการอัปเดต, ข้อมูลที่อัปเดตแล้ว, และ error messages (ถ้ามี)
    /// </summary>
    public class UpdateBudgetResponse
    {
        /// <summary>
        /// สถานะการอัปเดต (true = สำเร็จ, false = ล้มเหลว)
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// ข้อความแจ้งผลการอัปเดต
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// ข้อมูล Budget ที่อัปเดตแล้ว (ถ้าสำเร็จ)
        /// </summary>
        public BudgetResponseDto? Data { get; set; }

        /// <summary>
        /// ข้อความ error แบบละเอียด (สำหรับ debugging)
        /// </summary>
        public string? ErrorMessage { get; set; }
    }
}
