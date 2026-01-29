using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Budget
{
    [Table("HRB_BUDGET_DETAIL", Schema = "HRBUDGET")]
    [Index(nameof(DetailId), nameof(BudgetId), Name = "IX_HRB_BUDGET_DETAIL")]
    public class HRB_BUDGET_DETAIL
    {
        [Key]
        [Column("DETAIL_ID")]
        public int DetailId { get; set; }
        [Key]
        [Column("BUDGET_ID")]
        public int BudgetId { get; set; }
        [Column("BUDGET_YEAR")]
        public int? BudgetYear { get; set; }
        [Column("GL_CODE")]
        public string? GlCode { get; set; }
        [Column("AMOUNT")]
        public decimal? Amount { get; set; }
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; }
        [Column("UPDATED_BY")]
        public string? UpdatedBy { get; set; }
        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
