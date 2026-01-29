using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Cost
{
    [Table("HRB_COST_GROUP_RUNRATE")]
    public class HRB_COST_GROUP_RUNRATE
    {
        [Key]
        [Column("MAP_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MapId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("COST_CENTER_CODE")]
        [StringLength(20)]
        public string CostCenterCode { get; set; } = string.Empty;

        [Column("GROUPING")]
        [StringLength(100)]
        public string? Grouping { get; set; }

        [Required]
        [Column("RUN_ID")]
        public int RunId { get; set; }

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
