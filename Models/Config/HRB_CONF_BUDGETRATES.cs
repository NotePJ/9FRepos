using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_BUDGETRATES")]
    [Index(nameof(Id), nameof(CompanyId), Name = "IX_HRB_CONF_BUDGETRATES")]
    public class HRB_CONF_BUDGETRATES
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }
        [Key]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }
        [Column("BUDGET_CATEGORY")]
        public string? BudgetCategory { get; set; }
        [Column("BUDGET_YEAR")]
        public int? BudgetYear { get; set; }
        [Column("RATE")]
        public decimal? Rate { get; set; }
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; }
        [Column("UPDATE_BY")]
        public string? UpdateBy { get; set; }
        [Column("UPDATE_DATE")]
        public DateTime UpdateDate { get; set; }
    }
}
