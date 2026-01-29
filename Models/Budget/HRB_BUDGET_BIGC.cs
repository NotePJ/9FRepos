using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Budget
{
    [Table("HRB_BUDGET_BIGC")]
    public class HRB_BUDGET_BIGC
    {
        [Key]
        [Column("BUDGET_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BudgetId { get; set; }

        [Required]
        [Column("BUDGET_YEAR")]
        public int BudgetYear { get; set; }

        [Column("BUDGET_YEAR_LE")]
        public int? BudgetYearLe { get; set; }

        [Column("COMPANY_ID")]
        public int? CompanyId { get; set; }

        [Column("COMPANY_CODE")]
        [StringLength(50)]
        public string? CompanyCode { get; set; }

        [Column("BU")]
        [StringLength(50)]
        public string? Bu { get; set; }

        [Column("COBU")]
        [StringLength(50)]
        public string? Cobu { get; set; }

        [Column("DIVISION")]
        [StringLength(255)]
        public string? Division { get; set; }

        [Column("DEPARTMENT")]
        [StringLength(255)]
        public string? Department { get; set; }

        [Column("SECTION")]
        [StringLength(255)]
        public string? Section { get; set; }

        [Column("STORE_NAME")]
        [StringLength(255)]
        public string? StoreName { get; set; }

        [Column("ORG_UNIT_CODE")]
        [StringLength(50)]
        public string? OrgUnitCode { get; set; }

        [Column("ORG_UNIT_NAME")]
        [StringLength(100)]
        public string? OrgUnitName { get; set; }

        [Required]
        [Column("EMP_CODE")]
        [StringLength(10)]
        public string EmpCode { get; set; } = string.Empty;

        [Column("EMP_STATUS")]
        [StringLength(50)]
        public string? EmpStatus { get; set; }

        [Column("TITLE_TH")]
        [StringLength(50)]
        public string? TitleTh { get; set; }

        [Column("FNAME_TH")]
        [StringLength(255)]
        public string? FnameTh { get; set; }

        [Column("LNAME_TH")]
        [StringLength(255)]
        public string? LnameTh { get; set; }

        [Column("TITLE_EN")]
        [StringLength(50)]
        public string? TitleEn { get; set; }

        [Column("FNAME_EN")]
        [StringLength(255)]
        public string? FnameEn { get; set; }

        [Column("LNAME_EN")]
        [StringLength(255)]
        public string? LnameEn { get; set; }

        [Required]
        [Column("COST_CENTER_CODE")]
        [StringLength(50)]
        public string CostCenterCode { get; set; } = string.Empty;

        [Column("COST_CENTER_NAME")]
        [StringLength(255)]
        public string? CostCenterName { get; set; }

        [Column("POSITION_CODE")]
        [StringLength(50)]
        public string? PositionCode { get; set; }

        [Column("POSITION_NAME")]
        [StringLength(255)]
        public string? PositionName { get; set; }

        [Column("JOB_BAND")]
        [StringLength(50)]
        public string? JobBand { get; set; }

        [Column("JOIN_DATE")]
        public DateTime? JoinDate { get; set; }

        [Column("YOS_CURR_YEAR")]
        public int? YosCurrYear { get; set; }

        [Column("YOS_NEXT_YEAR")]
        public int? YosNextYear { get; set; }

        [Column("EMP_TYPE_CODE")]
        [StringLength(10)]
        public string? EmpTypeCode { get; set; }

        [Column("NEW_HC_CODE")]
        [StringLength(10)]
        public string? NewHcCode { get; set; }

        [Column("NEW_VAC_PERIOD")]
        [StringLength(10)]
        public string? NewVacPeriod { get; set; }

        [Column("NEW_VAC_LE")]
        [StringLength(10)]
        public string? NewVacLe { get; set; }

        [Column("REASON")]
        [StringLength(255)]
        public string? Reason { get; set; }

        [Column("GROUP_NAME")]
        [StringLength(255)]
        public string? GroupName { get; set; }

        [Column("GROUP_LEVEL_1")]
        [StringLength(255)]
        public string? GroupLevel1 { get; set; }

        [Column("GROUP_LEVEL_2")]
        [StringLength(255)]
        public string? GroupLevel2 { get; set; }

        [Column("GROUP_LEVEL_3")]
        [StringLength(255)]
        public string? GroupLevel3 { get; set; }

        [Column("HRBP_EMP_CODE")]
        [StringLength(10)]
        public string? HrbpEmpCode { get; set; }

        [Column("LE_OF_MONTH")]
        public int? LeOfMonth { get; set; }

        [Column("NO_OF_MONTH")]
        public int? NoOfMonth { get; set; }

        // LE (Last Estimate) Fields
        [Column("PAYROLL_LE", TypeName = "decimal(18,2)")]
        public decimal? PayrollLe { get; set; }

        [Column("PREMIUM_LE", TypeName = "decimal(18,2)")]
        public decimal? PremiumLe { get; set; }

        [Column("TOTAL_PAYROLL_LE", TypeName = "decimal(18,2)")]
        public decimal? TotalPayrollLe { get; set; }

        [Column("BONUS_LE", TypeName = "decimal(18,2)")]
        public decimal? BonusLe { get; set; }

        [Column("FLEET_CARD_PE_LE", TypeName = "decimal(18,2)")]
        public decimal? FleetCardPeLe { get; set; }

        [Column("CAR_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? CarAllowanceLe { get; set; }

        [Column("LICENSE_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? LicenseAllowanceLe { get; set; }

        [Column("HOUSING_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? HousingAllowanceLe { get; set; }

        [Column("GASOLINE_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? GasolineAllowanceLe { get; set; }

        [Column("WAGE_STUDENT_LE", TypeName = "decimal(18,2)")]
        public decimal? WageStudentLe { get; set; }

        [Column("CAR_RENTAL_PE_LE", TypeName = "decimal(18,2)")]
        public decimal? CarRentalPeLe { get; set; }

        [Column("SKILL_PAY_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? SkillPayAllowanceLe { get; set; }

        [Column("OTHER_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? OtherAllowanceLe { get; set; }

        [Column("SOCIAL_SECURITY_LE", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurityLe { get; set; }

        [Column("LABOR_FUND_FEE_LE", TypeName = "decimal(18,2)")]
        public decimal? LaborFundFeeLe { get; set; }

        [Column("OTHER_STAFF_BENEFIT_LE", TypeName = "decimal(18,2)")]
        public decimal? OtherStaffBenefitLe { get; set; }

        [Column("PROVIDENT_FUND_LE", TypeName = "decimal(18,2)")]
        public decimal? ProvidentFundLe { get; set; }

        [Column("EMPLOYEE_WELFARE_LE", TypeName = "decimal(18,2)")]
        public decimal? EmployeeWelfareLe { get; set; }

        [Column("PROVISION_LE", TypeName = "decimal(18,2)")]
        public decimal? ProvisionLe { get; set; }

        [Column("INTEREST_LE", TypeName = "decimal(18,2)")]
        public decimal? InterestLe { get; set; }

        [Column("STAFF_INSURANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? StaffInsuranceLe { get; set; }

        [Column("MEDICAL_EXPENSE_LE", TypeName = "decimal(18,2)")]
        public decimal? MedicalExpenseLe { get; set; }

        [Column("MEDICAL_INHOUSE_LE", TypeName = "decimal(18,2)")]
        public decimal? MedicalInhouseLe { get; set; }

        [Column("TRAINING_LE", TypeName = "decimal(18,2)")]
        public decimal? TrainingLe { get; set; }

        [Column("LONG_SERVICE_LE", TypeName = "decimal(18,2)")]
        public decimal? LongServiceLe { get; set; }

        [Column("PE_SB_MTH_LE", TypeName = "decimal(18,2)")]
        public decimal? PeSbMthLe { get; set; }

        [Column("PE_SB_YEAR_LE", TypeName = "decimal(18,2)")]
        public decimal? PeSbYearLe { get; set; }

        // Budget Fields (Current Year)
        [Column("PAYROLL", TypeName = "decimal(18,2)")]
        public decimal? Payroll { get; set; }

        [Column("PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? Premium { get; set; }

        [Column("TOTAL_PAYROLL", TypeName = "decimal(18,2)")]
        public decimal? TotalPayroll { get; set; }

        [Column("BONUS", TypeName = "decimal(18,2)")]
        public decimal? Bonus { get; set; }

        [Column("BONUS_TYPES")]
        [StringLength(50)]
        public string? BonusTypes { get; set; }

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

        [Column("PE_SB_MTH", TypeName = "decimal(18,2)")]
        public decimal? PeSbMth { get; set; }

        [Column("PE_SB_YEAR", TypeName = "decimal(18,2)")]
        public decimal? PeSbYear { get; set; }

        // Additional Fields
        [Column("COST_CENTER_PLAN")]
        [StringLength(50)]
        public string? CostCenterPlan { get; set; }

        [Column("SALARY_STRUCTURE")]
        [StringLength(50)]
        public string? SalaryStructure { get; set; }

        [Column("PE_MTH_LE", TypeName = "decimal(18,2)")]
        public decimal? PeMthLe { get; set; }

        [Column("PE_YEAR_LE", TypeName = "decimal(18,2)")]
        public decimal? PeYearLe { get; set; }

        [Column("PE_MTH", TypeName = "decimal(18,2)")]
        public decimal? PeMth { get; set; }

        [Column("PE_YEAR", TypeName = "decimal(18,2)")]
        public decimal? PeYear { get; set; }

        [Column("RUNRATE_CODE")]
        [StringLength(50)]
        public string? RunrateCode { get; set; }

        [Column("DISCOUNT")]
        [StringLength(50)]
        public string? Discount { get; set; }

        [Column("EXECUTIVE")]
        [StringLength(50)]
        public string? Executive { get; set; }

        [Column("FOCUS_HC")]
        [StringLength(1)]
        public string? FocusHc { get; set; }

        [Column("FOCUS_PE")]
        [StringLength(1)]
        public string? FocusPe { get; set; }

        [Column("JOIN_PVF")]
        [StringLength(1)]
        public string? JoinPvf { get; set; }

        [Column("PVF")]
        [StringLength(1)]
        public string? Pvf { get; set; }

        [Column("UPDATED_BY")]
        [StringLength(100)]
        public string? UpdatedBy { get; set; }

        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
    }
}
