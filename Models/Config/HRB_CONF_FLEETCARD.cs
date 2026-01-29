using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_FLEETCARD")]
    public class HRB_CONF_FLEETCARD
    {
        [Key]
        [Column("FC_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FcId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("EMP_CODE")]
        [StringLength(20)]
        public string EmpCode { get; set; } = string.Empty;

        [Column("GL_CODE")]
        [StringLength(20)]
        public string? GlCode { get; set; }

        [Column("FC_AMOUNT", TypeName = "decimal(18,2)")]
        public decimal? FcAmount { get; set; }

        [Required]
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        [Required]
        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string UpdatedBy { get; set; } = string.Empty;

        [Required]
        [Column("UPDATED_DATE")]
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
