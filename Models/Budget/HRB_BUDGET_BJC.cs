using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Budget
{
    [Table("HRB_BUDGET_BJC")]
    public class HRB_BUDGET_BJC
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

        // LE (Last Estimate) Fields - BJC Specific
        [Column("PAYROLL_LE", TypeName = "decimal(18,2)")]
        public decimal? PayrollLe { get; set; }

        [Column("PREMIUM_LE", TypeName = "decimal(18,2)")]
        public decimal? PremiumLe { get; set; }

        [Column("SAL_WITH_EN_LE", TypeName = "decimal(18,2)")]
        public decimal? SalWithEnLe { get; set; }

        [Column("SAL_NOT_EN_LE", TypeName = "decimal(18,2)")]
        public decimal? SalNotEnLe { get; set; }

        [Column("BONUS_TYPE_LE")]
        [StringLength(50)]
        public string? BonusTypeLe { get; set; }

        [Column("BONUS_LE", TypeName = "decimal(18,2)")]
        public decimal? BonusLe { get; set; }

        [Column("SAL_TEMP_LE", TypeName = "decimal(18,2)")]
        public decimal? SalTempLe { get; set; }

        [Column("SOCIAL_SECURITY_TMP_LE", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurityTmpLe { get; set; }

        [Column("SOUTHRISK_ALLOWANCE_TMP_LE", TypeName = "decimal(18,2)")]
        public decimal? SouthriskAllowanceTmpLe { get; set; }

        [Column("CAR_MAINTENANCE_TMP_LE", TypeName = "decimal(18,2)")]
        public decimal? CarMaintenanceTmpLe { get; set; }

        [Column("SALES_MANAGEMENT_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? SalesManagementPcLe { get; set; }

        [Column("SHELF_STACKING_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? ShelfStackingPcLe { get; set; }

        [Column("DILIGENCE_ALLOWANCE_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? DiligenceAllowancePcLe { get; set; }

        [Column("POST_ALLOWANCE_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? PostAllowancePcLe { get; set; }

        [Column("PHONE_ALLOWANCE_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? PhoneAllowancePcLe { get; set; }

        [Column("TRANSPORTATION_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? TransportationPcLe { get; set; }

        [Column("SKILL_ALLOWANCE_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? SkillAllowancePcLe { get; set; }

        [Column("OTHER_ALLOWANCE_PC_LE", TypeName = "decimal(18,2)")]
        public decimal? OtherAllowancePcLe { get; set; }

        [Column("TEMPORARY_STAFF_SAL_LE", TypeName = "decimal(18,2)")]
        public decimal? TemporaryStaffSalLe { get; set; }

        [Column("SOCIAL_SECURITY_LE", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurityLe { get; set; }

        [Column("PROVIDENT_FUND_LE", TypeName = "decimal(18,2)")]
        public decimal? ProvidentFundLe { get; set; }

        [Column("WORKMEN_COMPENSATION_LE", TypeName = "decimal(18,2)")]
        public decimal? WorkmenCompensationLe { get; set; }

        [Column("HOUSING_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? HousingAllowanceLe { get; set; }

        [Column("SALES_CAR_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? SalesCarAllowanceLe { get; set; }

        [Column("ACCOMMODATION_LE", TypeName = "decimal(18,2)")]
        public decimal? AccommodationLe { get; set; }

        [Column("CAR_MAINTENANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? CarMaintenanceLe { get; set; }

        [Column("SOUTHRISK_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? SouthriskAllowanceLe { get; set; }

        [Column("MEAL_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? MealAllowanceLe { get; set; }

        [Column("OTHER_LE", TypeName = "decimal(18,2)")]
        public decimal? OtherLe { get; set; }

        [Column("OTHERS_SUBJECT_TAX_LE", TypeName = "decimal(18,2)")]
        public decimal? OthersSubjectTaxLe { get; set; }

        [Column("CAR_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? CarAllowanceLe { get; set; }

        [Column("LICENSE_ALLOWANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? LicenseAllowanceLe { get; set; }

        [Column("OUTSOURCE_WAGES_LE", TypeName = "decimal(18,2)")]
        public decimal? OutsourceWagesLe { get; set; }

        [Column("COMP_CARS_GAS_LE", TypeName = "decimal(18,2)")]
        public decimal? CompCarsGasLe { get; set; }

        [Column("COMP_CARS_OTHER_LE", TypeName = "decimal(18,2)")]
        public decimal? CompCarsOtherLe { get; set; }

        [Column("CAR_RENTAL_LE", TypeName = "decimal(18,2)")]
        public decimal? CarRentalLe { get; set; }

        [Column("CAR_GASOLINE_LE", TypeName = "decimal(18,2)")]
        public decimal? CarGasolineLe { get; set; }

        [Column("CAR_REPAIR_LE", TypeName = "decimal(18,2)")]
        public decimal? CarRepairLe { get; set; }

        [Column("MEDICAL_OUTSIDE_LE", TypeName = "decimal(18,2)")]
        public decimal? MedicalOutsideLe { get; set; }

        [Column("MEDICAL_INHOUSE_LE", TypeName = "decimal(18,2)")]
        public decimal? MedicalInhouseLe { get; set; }

        [Column("STAFF_ACTIVITIES_LE", TypeName = "decimal(18,2)")]
        public decimal? StaffActivitiesLe { get; set; }

        [Column("UNIFORM_LE", TypeName = "decimal(18,2)")]
        public decimal? UniformLe { get; set; }

        [Column("LIFE_INSURANCE_LE", TypeName = "decimal(18,2)")]
        public decimal? LifeInsuranceLe { get; set; }

        [Column("PE_SB_MTH_LE", TypeName = "decimal(18,2)")]
        public decimal? PeSbMthLe { get; set; }

        [Column("PE_SB_YEAR_LE", TypeName = "decimal(18,2)")]
        public decimal? PeSbYearLe { get; set; }

        // Current Year Budget Fields - BJC Specific
        [Column("PAYROLL", TypeName = "decimal(18,2)")]
        public decimal? Payroll { get; set; }

        [Column("PREMIUM", TypeName = "decimal(18,2)")]
        public decimal? Premium { get; set; }

        [Column("SAL_WITH_EN", TypeName = "decimal(18,2)")]
        public decimal? SalWithEn { get; set; }

        [Column("SAL_NOT_EN", TypeName = "decimal(18,2)")]
        public decimal? SalNotEn { get; set; }

        [Column("BONUS_TYPE")]
        [StringLength(50)]
        public string? BonusType { get; set; }

        [Column("BONUS", TypeName = "decimal(18,2)")]
        public decimal? Bonus { get; set; }

        [Column("SAL_TEMP", TypeName = "decimal(18,2)")]
        public decimal? SalTemp { get; set; }

        [Column("SOCIAL_SECURITY_TMP", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurityTmp { get; set; }

        [Column("SOUTHRISK_ALLOWANCE_TMP", TypeName = "decimal(18,2)")]
        public decimal? SouthriskAllowanceTmp { get; set; }

        [Column("CAR_MAINTENANCE_TMP", TypeName = "decimal(18,2)")]
        public decimal? CarMaintenanceTmp { get; set; }

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

        [Column("TEMPORARY_STAFF_SAL", TypeName = "decimal(18,2)")]
        public decimal? TemporaryStaffSal { get; set; }

        [Column("SOCIAL_SECURITY", TypeName = "decimal(18,2)")]
        public decimal? SocialSecurity { get; set; }

        [Column("PROVIDENT_FUND", TypeName = "decimal(18,2)")]
        public decimal? ProvidentFund { get; set; }

        [Column("WORKMEN_COMPENSATION", TypeName = "decimal(18,2)")]
        public decimal? WorkmenCompensation { get; set; }

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
