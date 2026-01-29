using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Employee
{
    [Table("HRB_EMP_EXPENSE_BIGC")]
    public class HRB_EMP_EXPENSE_BIGC
    {
        [Key]
        [Column("EXPENSE_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExpenseId { get; set; }

        [Required]
        [Column("YEAR")]
        public int Year { get; set; }

        [Required]
        [Column("EMP_CODE")]
        [StringLength(10)]
        public string EmpCode { get; set; } = string.Empty;

        [Column("PAYROLL", TypeName = "decimal(18,2)")]
        public decimal? Payroll { get; set; }

        [Column("PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? Premium { get; set; }

        [Column("BONUS", TypeName = "decimal(18,2)")]
        public decimal? Bonus { get; set; }

        [Column("FLEET_CARD_PE", TypeName = "decimal(18,2)")]
        public decimal? FleetCardPe { get; set; }

        [Column("CAR_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? CarAllowance { get; set; }

        [Column("LICENSE_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? LicenseAllowance { get; set; }

        [Column("HOUSING_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? HousingAllowance { get; set; }

        [Column("GASOLINE_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? GasolineAllowance { get; set; }

        [Column("WAGE_STUDENT", TypeName = "decimal(18,2)")]
        public decimal? WageStudent { get; set; }

        [Column("CAR_RENTAL_PE", TypeName = "decimal(18,2)")]
        public decimal? CarRentalPe { get; set; }

        [Column("SKILL_PAY_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? SkillPayAllowance { get; set; }

        [Column("OTHER_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? OtherAllowance { get; set; }

        [Column("SOCIAL_SECURITY", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurity { get; set; }

        [Column("LABOR_FUND_FEE", TypeName = "decimal(18,2)")]
        public decimal? LaborFundFee { get; set; }

        [Column("OTHER_STAFF_BENEFIT", TypeName = "decimal(18,2)")]
        public decimal? OtherStaffBenefit { get; set; }

        [Column("PROVIDENT_FUND", TypeName = "decimal(18,2)")]
        public decimal? ProvidentFund { get; set; }

        [Column("EMPLOYEE_WELFARE", TypeName = "decimal(18,2)")]
        public decimal? EmployeeWelfare { get; set; }

        [Column("PROVISION", TypeName = "decimal(18,2)")]
        public decimal? Provision { get; set; }

        [Column("INTEREST", TypeName = "decimal(18,2)")]
        public decimal? Interest { get; set; }

        [Column("STAFF_INSURANCE", TypeName = "decimal(18,2)")]
        public decimal? StaffInsurance { get; set; }

        [Column("MEDICAL_EXPENSE", TypeName = "decimal(18,2)")]
        public decimal? MedicalExpense { get; set; }

        [Column("MEDICAL_INHOUSE", TypeName = "decimal(18,2)")]
        public decimal? MedicalInhouse { get; set; }

        [Column("TRAINING", TypeName = "decimal(18,2)")]
        public decimal? Training { get; set; }

        [Column("LONG_SERVICE", TypeName = "decimal(18,2)")]
        public decimal? LongService { get; set; }

        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
