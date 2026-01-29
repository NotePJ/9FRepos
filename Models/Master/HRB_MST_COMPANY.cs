using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
    [Table("HRB_MST_COMPANY")]
    public class HRB_MST_COMPANY
    {
        [Key]
        [Column("COMPANY_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CompanyId { get; set; }

        [Required]
        [Column("COMPANY_CODE", TypeName = "varchar(20)")]
        [StringLength(20)]
        public string CompanyCode { get; set; } = string.Empty;

        [Column("COMPANY_NAME")]
        [StringLength(100)]
        public string? CompanyName { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
