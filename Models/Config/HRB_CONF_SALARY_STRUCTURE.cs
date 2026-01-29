using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_SALARY_STRUCTURE")]
    public class HRB_CONF_SALARY_STRUCTURE
    {
        [Key]
        [Column("SS_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SsId { get; set; }

        [Column("COMPANY_ID")]
        public int? CompanyId { get; set; }

        [Required]
        [Column("JOB_BAND", TypeName = "varchar(5)")]
        [StringLength(5)]
        public string JobBand { get; set; } = string.Empty;

        [Required]
        [Column("FUNCTION_NAME", TypeName = "varchar(50)")]
        [StringLength(50)]
        public string FunctionName { get; set; } = string.Empty;

        [Column("MIN_SALARY", TypeName = "decimal(18,2)")]
        public decimal? MinSalary { get; set; }

        [Column("MID_SALARY", TypeName = "decimal(18,2)")]
        public decimal? MidSalary { get; set; }

        [Column("P75_SALARY", TypeName = "decimal(18,2)")]
        public decimal? P75Salary { get; set; }

        [Column("MAX_SALARY", TypeName = "decimal(18,2)")]
        public decimal? MaxSalary { get; set; }

        [Required]
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Required]
        [Column("UPDATED_DATE")]
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
