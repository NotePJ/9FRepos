using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Cost
{
    [Table("HRB_COST_GROUP_MAPPING")]
    public class HRB_COST_GROUP_MAPPING
    {
        [Key]
        [Column("GROUP_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GroupId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("COST_CENTER_CODE")]
        [StringLength(20)]
        public string CostCenterCode { get; set; } = string.Empty;

        [Column("GROUP_NAME")]
        [StringLength(100)]
        public string? GroupName { get; set; }

        [Column("GROUP_LEVEL_1")]
        [StringLength(100)]
        public string? GroupLevel1 { get; set; }

        [Column("GROUP_LEVEL_2")]
        [StringLength(100)]
        public string? GroupLevel2 { get; set; }

        [Column("GROUP_LEVEL_3")]
        [StringLength(100)]
        public string? GroupLevel3 { get; set; }

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
