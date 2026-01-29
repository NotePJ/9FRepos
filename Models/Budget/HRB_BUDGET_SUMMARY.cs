using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Budget
{
    [Table("HRB_BUDGET_SUMMARY", Schema = "HRBUDGET")]
    [Index(nameof(SumId), nameof(BudgetId), Name = "IX_HRB_BUDGET_SUMMARY")]
    public class HRB_BUDGET_SUMMARY
    {
        [Key]
        [Column("SUM_ID")]
        public int SumId { get; set; }
        [Key]
        [Column("BUDGET_ID")]
        public int BudgetId { get; set; }
        [Column("BUDGET_YEAR")]
        public int BudgetYear { get; set; }
        [Column("PE_SB_MTH")]
        public decimal? PeSbMth { get; set; }
        [Column("PE_SB_YEAR")]
        public decimal? PeSbYear { get; set; }
        [Column("PE_SUM_MTH")]
        public decimal? PeSumMth { get; set; }
        [Column("PE_SUM_YEAR")]
        public decimal? PeSumYear { get; set; }
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; }
        [Column("UPDATED_BY")]
        public string? UpdatedBy { get; set; }
        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
