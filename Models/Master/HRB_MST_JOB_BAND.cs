using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
    [Table("HRB_MST_JOB_BAND")]
    public class HRB_MST_JOB_BAND
    {
        [Key]
        [Column("JB_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int JbId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("JB_CODE")]
        [StringLength(50)]
        public string JbCode { get; set; } = string.Empty;

        [Column("JB_NAME")]
        [StringLength(50)]
        public string? JbName { get; set; }

        [Column("IS_EXC")]
        [StringLength(50)]
        public string? IsExc { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
