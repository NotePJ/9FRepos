using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// Request DTO สำหรับ Cut Transaction
    /// ลด HC ออกจากระบบ
    /// </summary>
    public class CutRequest
    {
        /// <summary>
        /// PeId ของ PE Management record
        /// </summary>
        [Required(ErrorMessage = "PeId is required")]
        public int PeId { get; set; }

        /// <summary>
        /// จำนวน Headcount ที่ลด
        /// </summary>
        [Required(ErrorMessage = "HC is required")]
        [Range(1, int.MaxValue, ErrorMessage = "HC must be greater than 0")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่ลด
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
