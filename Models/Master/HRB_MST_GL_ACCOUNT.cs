using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
    [Table("HRB_MST_GL_ACCOUNT")]
    public class HRB_MST_GL_ACCOUNT
    {
        [Key]
        [Column("GL_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GlId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("GL_CODE")]
        [StringLength(20)]
        public string GlCode { get; set; } = string.Empty;

        [Column("GL_NAME")]
        [StringLength(100)]
        public string? GlName { get; set; }

        [Column("GL_TYPE")]
        [StringLength(100)]
        public string? GlType { get; set; }

        [Column("COST_CENTER_FLAG")]
        public bool? CostCenterFlag { get; set; }

        [Column("START_DATE")]
        public DateTime? StartDate { get; set; }

        [Column("END_DATE")]
        public DateTime? EndDate { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
