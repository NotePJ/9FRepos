using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// Request DTO สำหรับ Move Out Transaction
    /// ย้าย HC ออกจาก Cost Center นี้ ไปยัง Cost Center อื่น
    /// </summary>
    public class MoveOutRequest
    {
        /// <summary>
        /// PeId ของ PE Management record ต้นทาง (Cost Center ที่ส่ง HC ออก)
        /// </summary>
        [Required(ErrorMessage = "PeId is required")]
        public int PeId { get; set; }

        /// <summary>
        /// Cost Center Code ปลายทาง (ที่ HC ย้ายไป)
        /// </summary>
        [Required(ErrorMessage = "To Cost Center Code is required")]
        public string? ToCostCenterCode { get; set; }

        /// <summary>
        /// จำนวน Headcount ที่ย้ายออก
        /// </summary>
        [Required(ErrorMessage = "HC is required")]
        [Range(1, int.MaxValue, ErrorMessage = "HC must be greater than 0")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่ย้ายออก
        /// </summary>
        [Required(ErrorMessage = "Base+Wage is required")]
        public decimal? BaseWage { get; set; }

        /// <summary>
        /// หมายเหตุ
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// เดือนที่ทำ Transaction
        /// </summary>
        public int? PeMonth { get; set; }

        /// <summary>
        /// ปีที่ทำ Transaction
        /// </summary>
        public int? PeYear { get; set; }
    }
}
