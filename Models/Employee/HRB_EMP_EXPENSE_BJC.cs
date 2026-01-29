using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Employee
{
    [Table("HRB_EMP_EXPENSE_BJC")]
    public class HRB_EMP_EXPENSE_BJC
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

        // Basic Payroll & Bonus
        [Column("PAYROLL", TypeName = "decimal(18,2)")]
        public decimal? Payroll { get; set; }

        [Column("PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? Premium { get; set; }

        [Column("BONUS", TypeName = "decimal(18,2)")]
        public decimal? Bonus { get; set; }

        // Temporary Staff Related
        [Column("SAL_TEMP", TypeName = "decimal(18,2)")]
        public decimal? SalTemp { get; set; }

        [Column("SOCIAL_SECURITY_TMP", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurityTmp { get; set; }

        [Column("SOUTHRISK_ALLOWANCE_TMP", TypeName = "decimal(18,2)")]
        public decimal? SouthriskAllowanceTmp { get; set; }

        [Column("CAR_MAINTENANCE_TMP", TypeName = "decimal(18,2)")]
        public decimal? CarMaintenanceTmp { get; set; }

        // Performance Component (PC) - BJC Specific
        [Column("SALES_MANAGEMENT_PC", TypeName = "decimal(18,2)")]
        public decimal? SalesManagementPc { get; set; }

        [Column("SHELF_STACKING_PC", TypeName = "decimal(18,2)")]
        public decimal? ShelfStackingPc { get; set; }

        [Column("DILIGENCE_ALLOWANCE_PC", TypeName = "decimal(18,2)")]
        public decimal? DiligenceAllowancePc { get; set; }

        [Column("POST_ALLOWANCE_PC", TypeName = "decimal(18,2)")]
        public decimal? PostAllowancePc { get; set; }

        [Column("PHONE_ALLOWANCE_PC", TypeName = "decimal(18,2)")]
        public decimal? PhoneAllowancePc { get; set; }

        [Column("TRANSPORTATION_PC", TypeName = "decimal(18,2)")]
        public decimal? TransportationPc { get; set; }

        [Column("SKILL_ALLOWANCE_PC", TypeName = "decimal(18,2)")]
        public decimal? SkillAllowancePc { get; set; }

        [Column("OTHER_ALLOWANCE_PC", TypeName = "decimal(18,2)")]
        public decimal? OtherAllowancePc { get; set; }

        // Staff Benefits & Security
        [Column("TEMPORARY_STAFF_SAL", TypeName = "decimal(18,2)")]
        public decimal? TemporaryStaffSal { get; set; }

        [Column("SOCIAL_SECURITY", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurity { get; set; }

        [Column("PROVIDENT_FUND", TypeName = "decimal(18,2)")]
        public decimal? ProvidentFund { get; set; }

        [Column("WORKMEN_COMPENSATION", TypeName = "decimal(18,2)")]
        public decimal? WorkmenCompensation { get; set; }

        // Allowances
        [Column("HOUSING_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? HousingAllowance { get; set; }

        [Column("SALES_CAR_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? SalesCarAllowance { get; set; }

        [Column("ACCOMMODATION", TypeName = "decimal(18,2)")]
        public decimal? Accommodation { get; set; }

        [Column("CAR_MAINTENANCE", TypeName = "decimal(18,2)")]
        public decimal? CarMaintenance { get; set; }

        [Column("SOUTHRISK_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? SouthriskAllowance { get; set; }

        [Column("MEAL_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? MealAllowance { get; set; }

        [Column("OTHER", TypeName = "decimal(18,2)")]
        public decimal? Other { get; set; }

        [Column("OTHERS_SUBJECT_TAX", TypeName = "decimal(18,2)")]
        public decimal? OthersSubjectTax { get; set; }

        [Column("CAR_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? CarAllowance { get; set; }

        [Column("LICENSE_ALLOWANCE", TypeName = "decimal(18,2)")]
        public decimal? LicenseAllowance { get; set; }

        // Outsource & Company Cars
        [Column("OUTSOURCE_WAGES", TypeName = "decimal(18,2)")]
        public decimal? OutsourceWages { get; set; }

        [Column("COMP_CARS_GAS", TypeName = "decimal(18,2)")]
        public decimal? CompCarsGas { get; set; }

        [Column("COMP_CARS_OTHER", TypeName = "decimal(18,2)")]
        public decimal? CompCarsOther { get; set; }

        [Column("CAR_RENTAL", TypeName = "decimal(18,2)")]
        public decimal? CarRental { get; set; }

        [Column("CAR_GASOLINE", TypeName = "decimal(18,2)")]
        public decimal? CarGasoline { get; set; }

        [Column("CAR_REPAIR", TypeName = "decimal(18,2)")]
        public decimal? CarRepair { get; set; }

        // Medical & Welfare
        [Column("MEDICAL_OUTSIDE", TypeName = "decimal(18,2)")]
        public decimal? MedicalOutside { get; set; }

        [Column("MEDICAL_INHOUSE", TypeName = "decimal(18,2)")]
        public decimal? MedicalInhouse { get; set; }

        [Column("STAFF_ACTIVITIES", TypeName = "decimal(18,2)")]
        public decimal? StaffActivities { get; set; }

        [Column("UNIFORM", TypeName = "decimal(18,2)")]
        public decimal? Uniform { get; set; }

        [Column("LIFE_INSURANCE", TypeName = "decimal(18,2)")]
        public decimal? LifeInsurance { get; set; }

        // Audit Fields
        [Column("UPDATED_BY")]
        [StringLength(50)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
