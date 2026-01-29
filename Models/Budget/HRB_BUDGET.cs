using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Budget
{
  [Table("HRB_BUDGET")]
  [Index(nameof(CompanyId), nameof(BudgetYear), nameof(CostCenterCode), Name = "IX_HRB_BUDGET")]
  public class HRB_BUDGET
  {
    [Column("BUDGET_ID")]
    public int BudgetId { get; set; }
    [Key]
    [Column("COMPANY_ID")]
    public int CompanyId { get; set; }
    [Column("EMP_ID")]
    public int EMPId { get; set; }
    [Key]
    [Column("BUDGET_YEAR")]
    public int? BudgetYear { get; set; }
    [Column("LE_BUDGET_YEAR")]
    public int? LeBudgetYear { get; set; }
    [Column("COMPANY_CODE")]
    public string? CompanyCode { get; set; }
    [Column("EMP_FORMAT")]
    public string? EmpFormat { get; set; }
    [Column("ORG_LEVEL_1")]
    public string? OrgLevel1 { get; set; }
    [Column("ORG_LEVEL_2")]
    public string? OrgLevel2 { get; set; }
    [Column("ORG_LEVEL_3")]
    public string? OrgLevel3 { get; set; }
    [Column("ORG_UNIT_NAME")]
    public string? OrgUnitName { get; set; }
    [Column("EMP_STATUS")]
    public string? EmpStatus { get; set; }
    [Column("EMP_CODE")]
    public string? EmpCode { get; set; }
    [Column("TITLE_TH")]
    public string? TitleTh { get; set; }
    [Column("FNAME_TH")]
    public string? FnameTh { get; set; }
    [Column("LNAME_TH")]
    public string? LnameTh { get; set; }
    [Column("TITLE_EN")]
    public string? TitleEn { get; set; }
    [Column("FNAME_EN")]
    public string? FnameEn { get; set; }
    [Column("LNAME_EN")]
    public string? LnameEn { get; set; }
    [Key]
    [Column("COST_CENTER_CODE")]
    public string? CostCenterCode { get; set; }
    [Column("COST_CENTER_NAME")]
    public string? CostCenterName { get; set; }
    [Column("POSITION_CODE")]
    public string? PositionCode { get; set; }
    [Column("POSITION_NAME")]
    public string? PositionName { get; set; }
    [Column("JOB_BAND")]
    public string? JobBand { get; set; }
    [Column("JOIN_DATE")]
    public DateTime? JoinDate { get; set; }
    [Column("YOS_CURR_YEAR")]
    public int? YOSCurrYear { get; set; }
    [Column("YOS_NEXT_YEAR")]
    public int? YOSNextYear { get; set; }
    [Column("EMP_TYPE_CODE")]
    public string? EmpTypeCode { get; set; }
    [Column("NEW_HC_CODE")]
    public string? NewHCCode { get; set; }
    [Column("NEW_VAC_PER")]
    public string? NewVacPer { get; set; }
    [Column("NEW_VAC_LE")]
    public string? NewVacLe { get; set; }
    [Column("REASON")]
    public string? Reason { get; set; }
    [Column("GROUP_NAME")]
    public string? GroupName { get; set; }
    [Column("GROUP_LEVEL_1")]
    public string? GroupLevel1 { get; set; }
    [Column("GROUP_LEVEL_2")]
    public string? GroupLevel2 { get; set; }
    [Column("GROUP_LEVEL_3")]
    public string? GroupLevel3 { get; set; }
    [Column("HR_EMP_CODE")]
    public string? HrEmpCode { get; set; }
    [Column("LE_OF_MONTH")]
    public int? LeOfMonth { get; set; }
    [Column("NO_OF_MONTH")]
    public int? NoOfMonth { get; set; }
    [Column("PAYROLL")]
    public decimal? Payroll { get; set; }
    [Column("BONUS")]
    public decimal? Bonus { get; set; }
    [Column("FLEET_CARD_PE")]
    public decimal? FleetCardPe { get; set; }
    [Column("CAR_ALLOWANCE")]
    public decimal? CarAllowance { get; set; }
    [Column("LICENSE_ALLOWANCE")]
    public decimal? LicenseAllowance { get; set; }
    [Column("HOUSING_ALLOWANCE")]
    public decimal? HousingAllowance { get; set; }
    [Column("GASOLINE_ALLOWANCE")]
    public decimal? GasolineAllowance { get; set; }
    [Column("WAGE_STUDENT")]
    public decimal? WageStudent { get; set; }
    [Column("CAR_RENTAL_PE")]
    public decimal? CarRentalPe { get; set; }
    [Column("SKILL_PAY_ALLOWANCE")]
    public decimal? SkillPayAllowance { get; set; }
    [Column("OTHER_ALLOWANCE")]
    public decimal? OtherAllowance { get; set; }
    [Column("SOCIAL_SECURITY")]
    public decimal? SocialSecurity { get; set; }
    [Column("LABOR_FUND_FEE")]
    public decimal? LaborFundFee { get; set; }
    [Column("OTHER_STAFF_BENEFIT")]
    public decimal? OtherStaffBenefit { get; set; }
    [Column("PROVIDENT_FUND")]
    public decimal? ProvidentFund { get; set; }
    [Column("PROVISION")]
    public decimal? Provision { get; set; }
    [Column("INTEREST")]
    public decimal? Interest { get; set; }
    [Column("STAFF_INSURANCE")]
    public decimal? StaffInsurance { get; set; }
    [Column("MEDICAL_EXPENSE")]
    public decimal? MedicalExpense { get; set; }
    [Column("MEDICAL_INHOUSE")]
    public decimal? MedicalInhouse { get; set; }
    [Column("TRAINING")]
    public decimal? Training { get; set; }
    [Column("LONG_SERVICE")]
    public decimal? LongService { get; set; }
    [Column("PE_SB_MTH")]
    public decimal? PeSbMth { get; set; }
    [Column("PE_SB_LE")]
    public decimal? PeSbLe { get; set; }
    [Column("PAYROLL_NX")]
    public decimal? PayrollNx { get; set; }
    [Column("BONUS_TYPES")]
    public string? BonusTypes { get; set; }
    [Column("BONUS_NX")]
    public decimal? BonusNx { get; set; }
    [Column("FLEET_CARD_PE_NX")]
    public decimal? FleetCardPeNx { get; set; }
    [Column("CAR_ALLOWANCE_NX")]
    public decimal? CarAllowanceNx { get; set; }
    [Column("LICENSE_ALLOWANCE_NX")]
    public decimal? LicenseAllowanceNx { get; set; }
    [Column("HOUSING_ALLOWANCE_NX")]
    public decimal? HousingAllowanceNx { get; set; }
    [Column("GASOLINE_ALLOWANCE_NX")]
    public decimal? GasolineAllowanceNx { get; set; }
    [Column("WAGE_STUDENT_NX")]
    public decimal? WageStudentNx { get; set; }
    [Column("CAR_RENTAL_PE_NX")]
    public decimal? CarRentalPeNx { get; set; }
    [Column("SKILL_PAY_ALLOWANCE_NX")]
    public decimal? SkillPayAllowanceNx { get; set; }
    [Column("OTHER_ALLOWANCE_NX")]
    public decimal? OtherAllowanceNx { get; set; }
    [Column("SOCIAL_SECURITY_NX")]
    public decimal? SocialSecurityNx { get; set; }
    [Column("LABOR_FUND_FEE_NX")]
    public decimal? LaborFundFeeNx { get; set; }
    [Column("OTHER_STAFF_BENEFIT_NX")]
    public decimal? OtherStaffBenefitNx { get; set; }
    [Column("PROVIDENT_FUND_NX")]
    public decimal? ProvidentFundNx { get; set; }
    [Column("PROVISION_NX")]
    public decimal? ProvisionNx { get; set; }
    [Column("INTEREST_NX")]
    public decimal? InterestNx { get; set; }
    [Column("STAFF_INSURANCE_NX")]
    public decimal? StaffInsuranceNx { get; set; }
    [Column("MEDICAL_EXPENSE_NX")]
    public decimal? MedicalExpenseNx { get; set; }
    [Column("MEDICAL_INHOUSE_NX")]
    public decimal? MedicalInhouseNx { get; set; }
    [Column("TRAINING_NX")]
    public decimal? TrainingNx { get; set; }
    [Column("LONG_SERVICE_NX")]
    public decimal? LongServiceNx { get; set; }
    [Column("PE_SB_MTH_NX")]
    public decimal? PeSbMthNx { get; set; }
    [Column("PE_SB_YEAR_NX")]
    public decimal? PeSbYearNx { get; set; }
    [Column("COST_CENTER_PLAN")]
    public string? CostCenterPlan { get; set; }
    [Column("SALARY_STRUCTURE")]
    public string? SalaryStructure { get; set; }
    [Column("PE_MTH_SUM_LE")]
    public decimal? PeMthSumLe { get; set; }
    [Column("PE_YEAR_SUM_LE")]
    public decimal? PeYearSumLe { get; set; }
    [Column("PE_MTH_SUM_NX")]
    public decimal? PeMthSumNx { get; set; }
    [Column("PE_YEAR_SUM_NX")]
    public decimal? PeYearSumNx { get; set; }
    [Column("GROUPING")]
    public string? Grouping { get; set; }
    [Column("RUN_RATE_CODE")]
    public string? RunRateCode { get; set; }
    [Column("RUN_RATE_GROUP")]
    public string? RunRateGroup { get; set; }
    [Column("DISCOUNT")]
    public string? Discount { get; set; }
    [Column("EXECUTIVE")]
    public string? Executive { get; set; }
    [Column("FOCUS_HC")]
    public string? FocusHc { get; set; }
    [Column("FOCUS_PE")]
    public string? FocusPe { get; set; }
    [Column("IS_ACTIVE")]
    public bool IsActive { get; set; }
    [Column("UPDATED_BY")]
    public string? UpdatedBy { get; set; }
    [Column("UPDATED_DATE")]
    public DateTime? UpdatedDate { get; set; }
  }
  public class BudgetFilterDto
  {
    public string CompanyID { get; set; } = null!;  // Required

    public int? BudgetYear { get; set; }
    public string? EmpFormat { get; set; }
    public string? OrgLevel1 { get; set; }
    public string? OrgLevel2 { get; set; }
    public string? OrgLevel3 { get; set; }
    public string? OrgUnitName { get; set; }
    public string? EmpStatus { get; set; }
    public string? CostCenterCode { get; set; }
    public string? PositionCode { get; set; }
    public string? JobBand { get; set; }
  }
}

