using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
    [Table("HRB_MST_POSITION")]
    public class HRB_MST_POSITION
    {
        [Key]
        [Column("POS_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PosId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("POSITION_CODE")]
        [StringLength(50)]
        public string PositionCode { get; set; } = string.Empty;

        [Required]
        [Column("POSITION_NAME")]
        [StringLength(255)]
        public string? PositionName { get; set; }

        [Required]
        [Column("JOB_BAND")]
        [StringLength(50)]
        public string? JobBand { get; set; }

        [Required]
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        [Required]
        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Required]
        [Column("UPDATED_DATE")]
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
