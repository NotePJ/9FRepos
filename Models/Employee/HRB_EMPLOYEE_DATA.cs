using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Employee
{
    [Table("HRB_EMPLOYEE_DATA")]
    public class HRB_EMPLOYEE_DATA
    {
        [Key]
        [Column("EMP_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmpId { get; set; }

        [Required]
        [Column("YEAR")]
        public int Year { get; set; }

        [Required]
        [Column("EMP_CODE")]
        [StringLength(10)]
        public string EmpCode { get; set; } = string.Empty;

        [Column("COMPANY_ID")]
        public int? CompanyId { get; set; }

        [Column("TITLE_TH")]
        [StringLength(20)]
        public string? TitleTh { get; set; }

        [Column("FNAME_TH")]
        [StringLength(100)]
        public string? FnameTh { get; set; }

        [Column("LNAME_TH")]
        [StringLength(100)]
        public string? LnameTh { get; set; }

        [Column("TITLE_EN")]
        [StringLength(20)]
        public string? TitleEn { get; set; }

        [Column("FNAME_EN")]
        [StringLength(100)]
        public string? FnameEn { get; set; }

        [Column("LNAME_EN")]
        [StringLength(100)]
        public string? LnameEn { get; set; }

        [Column("EMP_TYPE_CODE")]
        [StringLength(50)]
        public string? EmpTypeCode { get; set; }

        [Column("POSITION_CODE")]
        [StringLength(50)]
        public string? PositionCode { get; set; }

        [Column("JOB_BAND")]
        [StringLength(10)]
        public string? JobBand { get; set; }

        [Column("JOIN_DATE")]
        public DateTime? JoinDate { get; set; }

        [Column("EXIT_DATE")]
        public DateTime? ExitDate { get; set; }

        [Column("BU")]
        [StringLength(50)]
        public string? Bu { get; set; }

        [Column("COBU")]
        [StringLength(50)]
        public string? Cobu { get; set; }

        [Column("DIVISION")]
        [StringLength(100)]
        public string? Division { get; set; }

        [Column("DEPARTMENT")]
        [StringLength(100)]
        public string? Department { get; set; }

        [Column("SECTION")]
        [StringLength(100)]
        public string? Section { get; set; }

        [Column("STORE_NAME")]
        [StringLength(100)]
        public string? StoreName { get; set; }

        [Column("COST_CENTER_CODE")]
        [StringLength(100)]
        public string? CostCenterCode { get; set; }

        [Column("ORG_UNIT_CODE")]
        [StringLength(100)]
        public string? OrgUnitCode { get; set; }

        [Column("ORG_UNIT_NAME")]
        [StringLength(100)]
        public string? OrgUnitName { get; set; }

        [Column("BONUS_TYPE")]
        [StringLength(100)]
        public string? BonusType { get; set; }

        [Column("JOIN_PVF")]
        [StringLength(1)]
        public string? JoinPvf { get; set; }

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
