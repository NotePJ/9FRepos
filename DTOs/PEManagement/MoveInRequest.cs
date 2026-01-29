using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// Request DTO สำหรับ Move In Transaction
    /// ย้าย HC เข้ามาที่ Cost Center นี้ จาก Cost Center อื่น
    /// </summary>
    public class MoveInRequest
    {
        /// <summary>
        /// PeId ของ PE Management record ปลายทาง (Cost Center ที่รับ HC)
        /// </summary>
        [Required(ErrorMessage = "PeId is required")]
        public int PeId { get; set; }

        /// <summary>
        /// Cost Center Code ต้นทาง (ที่ HC ย้ายมา)
        /// </summary>
        [Required(ErrorMessage = "From Cost Center Code is required")]
        public string? FromCostCenterCode { get; set; }

        /// <summary>
        /// จำนวน Headcount ที่ย้ายเข้า
        /// </summary>
        [Required(ErrorMessage = "HC is required")]
        [Range(1, int.MaxValue, ErrorMessage = "HC must be greater than 0")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่ย้ายเข้า
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
