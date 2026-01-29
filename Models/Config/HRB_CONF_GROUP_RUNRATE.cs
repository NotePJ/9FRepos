using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_GROUP_RUNRATE")]
    public class HRB_CONF_GROUP_RUNRATE
    {
        [Key]
        [Column("RUN_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RunId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("RUNRATE_CODE")]
        [StringLength(50)]
        public string RunRateCode { get; set; } = string.Empty;

        [Column("RUNRATE_NAME")]
        [StringLength(100)]
        public string? RunRateName { get; set; }

        [Column("RUNRATE_VALUE", TypeName = "decimal(5,2)")]
        public decimal? RunRateValue { get; set; }

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
