using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_BUDGET_BONUS")]
    public class HRB_CONF_BUDGET_BONUS
    {
        [Key]
        [Column("BGRATE_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BgrateId { get; set; }

        [Column("COMPANY_ID")]
        public int? CompanyId { get; set; }

        [Column("BUDGET_CATEGORY")]
        [StringLength(100)]
        public string? BudgetCategory { get; set; }

        [Column("BUDGET_YEAR")]
        public int? BudgetYear { get; set; }

        [Column("RATE", TypeName = "decimal(5,2)")]
        public decimal? Rate { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATE_BY")]
        [StringLength(50)]
        public string? UpdateBy { get; set; }

        [Column("UPDATE_DATE")]
        public DateTime? UpdateDate { get; set; } = DateTime.Now;
    }
}
