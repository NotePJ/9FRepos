using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_MST_ITEM_CONFIG")]
    public class HRB_MST_ITEM_CONFIG
    {
        [Key]
        [Column("ITEM_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Column("ITEM_CODE", TypeName = "varchar(50)")]
        [StringLength(50)]
        public string? ItemCode { get; set; }

        [Column("ITEM_NAME", TypeName = "varchar(200)")]
        [StringLength(200)]
        public string? ItemName { get; set; }

        [Column("ITEM_VALUE", TypeName = "decimal(10,2)")]
        public decimal? ItemValue { get; set; }

        [Column("ITEM_TYPE", TypeName = "varchar(50)")]
        [StringLength(50)]
        public string? ItemType { get; set; }

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
