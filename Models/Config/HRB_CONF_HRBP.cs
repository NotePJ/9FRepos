using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_HRBP")]
    public class HRB_CONF_HRBP
    {
        [Key]
        [Column("HRBP_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HrbpId { get; set; }

        [Required]
        [Column("HRBP_EMP_CODE")]
        [StringLength(10)]
        public string HrbpEmpCode { get; set; } = string.Empty;

        [Required]
        [Column("FULLNAME_TH")]
        [StringLength(200)]
        public string FullnameTh { get; set; } = string.Empty;

        [Required]
        [Column("FULLNAME_EN")]
        [StringLength(200)]
        public string FullnameEn { get; set; } = string.Empty;

        [Required]
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
