using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// Request DTO สำหรับ Additional Transaction
    /// เพิ่ม HC ใหม่เข้าระบบ (ต้องได้รับอนุมัติจาก Management)
    /// </summary>
    public class AdditionalRequest
    {
        /// <summary>
        /// PeId ของ PE Management record
        /// </summary>
        [Required(ErrorMessage = "PeId is required")]
        public int PeId { get; set; }

        /// <summary>
        /// จำนวน Headcount ที่เพิ่ม
        /// </summary>
        [Required(ErrorMessage = "HC is required")]
        [Range(1, int.MaxValue, ErrorMessage = "HC must be greater than 0")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่เพิ่ม
        /// </summary>
        [Required(ErrorMessage = "Base+Wage is required")]
        public decimal? BaseWage { get; set; }

        /// <summary>
        /// หมายเหตุ (เหตุผลในการขอเพิ่ม HC)
        /// </summary>
        [Required(ErrorMessage = "Remark is required for Additional request")]
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
