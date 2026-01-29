using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
    [Table("HRB_MST_STATUS")]
    public class HRB_MST_STATUS
    {
        [Key]
        [Column("STATUS_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StatusId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Required]
        [Column("STATUS_CODE")]
        [StringLength(20)]
        public string StatusCode { get; set; } = string.Empty;

        [Column("STATUS_NAME")]
        [StringLength(100)]
        public string? StatusName { get; set; }

        [Column("STATUS_TYPE")]
        [StringLength(50)]
        public string? StatusType { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
