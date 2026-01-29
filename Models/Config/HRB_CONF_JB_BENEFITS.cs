using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
    [Table("HRB_CONF_JB_BENEFITS")]
    public class HRB_CONF_JB_BENEFITS
    {
        [Key]
        [Column("BENF_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BenfId { get; set; }

        [Required]
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        [Column("JOB_BAND")]
        [StringLength(10)]
        public string? JobBand { get; set; }

        [Column("PROVIDENTFUND_PERCENT", TypeName = "decimal(5,2)")]
        public decimal? ProvidentFundPercent { get; set; }

        [Column("MEDICAL_EMP_LIMIT", TypeName = "decimal(15,2)")]
        public decimal? MedicalEmpLimit { get; set; }

        [Column("MEDICAL_EMP_TOTAL", TypeName = "decimal(15,2)")]
        public decimal? MedicalEmpTotal { get; set; }

        [Column("MEDICAL_FAM_LIMIT", TypeName = "decimal(15,2)")]
        public decimal? MedicalFamLimit { get; set; }

        [Column("MEDICAL_FAM_TOTAL", TypeName = "decimal(15,2)")]
        public decimal? MedicalFamTotal { get; set; }

        [Column("MEDICAL_GRAND_TOTAL", TypeName = "decimal(15,2)")]
        public decimal? MedicalGrandTotal { get; set; }

        [Column("LIFE_INSURANCE", TypeName = "decimal(10,5)")]
        public decimal? LifeInsurance { get; set; }

        [Column("ACCIDENT_INSURANCE", TypeName = "decimal(10,5)")]
        public decimal? AccidentInsurance { get; set; }

        [Column("DISABILITY_INSURANCE", TypeName = "decimal(10,5)")]
        public decimal? DisabilityInsurance { get; set; }

        [Column("INSURANCE_TOTAL", TypeName = "decimal(10,5)")]
        public decimal? InsuranceTotal { get; set; }

        [Column("CAR_ALLOWANCE", TypeName = "decimal(15,2)")]
        public decimal? CarAllowance { get; set; }

        [Column("IS_ACTIVE")]
        public bool? IsActive { get; set; } = true;

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}
