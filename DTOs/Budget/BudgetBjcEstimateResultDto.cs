using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
  /// <summary>
  /// Result DTO for BJC Budget Estimation (fn_BudgetEstimate)
  /// Contains 44 calculated fields specific to BJC company
  /// Property names match Frontend naming convention (camelCase)
  /// Uses [Column] attribute to map camelCase properties to UPPER_CASE database columns
  /// </summary>
  public class BudgetBjcEstimateResultDto
  {
    // ═══════════════════════════════════════════════════════════════
    // LE FIELDS (44 fields - BJC specific)
    // ═══════════════════════════════════════════════════════════════

    [Column("PAYROLL_LE")] public decimal? payrollLe { get; set; }
    [Column("PREMIUM_LE")] public decimal? premiumLe { get; set; }
    [Column("SAL_WITH_EN_LE")] public decimal? salWithEnLe { get; set; }
    [Column("SAL_NOT_EN_LE")] public decimal? salNotEnLe { get; set; }
    [Column("BONUS_LE")] public decimal? bonusLe { get; set; }
    [Column("SAL_TEMP_LE")] public decimal? salTempLe { get; set; }
    [Column("SOCIAL_SECURITY_TMP_LE")] public decimal? socialSecurityTmpLe { get; set; }
    [Column("SOUTHRISK_ALLOWANCE_TMP_LE")] public decimal? southriskAllowanceTmpLe { get; set; }
    [Column("CAR_MAINTENANCE_TMP_LE")] public decimal? carMaintenanceTmpLe { get; set; }
    [Column("SALES_MANAGEMENT_PC_LE")] public decimal? salesManagementPcLe { get; set; }
    [Column("SHELF_STACKING_PC_LE")] public decimal? shelfStackingPcLe { get; set; }
    [Column("DILIGENCE_ALLOWANCE_PC_LE")] public decimal? diligenceAllowancePcLe { get; set; }
    [Column("POST_ALLOWANCE_PC_LE")] public decimal? postAllowancePcLe { get; set; }
    [Column("PHONE_ALLOWANCE_PC_LE")] public decimal? phoneAllowancePcLe { get; set; }
    [Column("TRANSPORTATION_PC_LE")] public decimal? transportationPcLe { get; set; }
    [Column("SKILL_ALLOWANCE_PC_LE")] public decimal? skillAllowancePcLe { get; set; }
    [Column("OTHER_ALLOWANCE_PC_LE")] public decimal? otherAllowancePcLe { get; set; }
    [Column("TEMPORARY_STAFF_SAL_LE")] public decimal? temporaryStaffSalLe { get; set; }
    [Column("SOCIAL_SECURITY_LE")] public decimal? socialSecurityLe { get; set; }
    [Column("PROVIDENT_FUND_LE")] public decimal? providentFundLe { get; set; }
    [Column("WORKMEN_COMPENSATION_LE")] public decimal? workmenCompensationLe { get; set; }
    [Column("HOUSING_ALLOWANCE_LE")] public decimal? housingAllowanceLe { get; set; }
    [Column("SALES_CAR_ALLOWANCE_LE")] public decimal? salesCarAllowanceLe { get; set; }
    [Column("ACCOMMODATION_LE")] public decimal? accommodationLe { get; set; }
    [Column("CAR_MAINTENANCE_LE")] public decimal? carMaintenanceLe { get; set; }
    [Column("SOUTHRISK_ALLOWANCE_LE")] public decimal? southriskAllowanceLe { get; set; }
    [Column("MEAL_ALLOWANCE_LE")] public decimal? mealAllowanceLe { get; set; }
    [Column("OTHER_LE")] public decimal? otherLe { get; set; }
    [Column("OTHERS_SUBJECT_TAX_LE")] public decimal? othersSubjectTaxLe { get; set; }
    [Column("CAR_ALLOWANCE_LE")] public decimal? carAllowanceLe { get; set; }
    [Column("LICENSE_ALLOWANCE_LE")] public decimal? licenseAllowanceLe { get; set; }
    [Column("OUTSOURCE_WAGES_LE")] public decimal? outsourceWagesLe { get; set; }
    [Column("COMP_CARS_GAS_LE")] public decimal? compCarsGasLe { get; set; }
    [Column("COMP_CARS_OTHER_LE")] public decimal? compCarsOtherLe { get; set; }
    [Column("CAR_RENTAL_LE")] public decimal? carRentalLe { get; set; }
    [Column("CAR_GASOLINE_LE")] public decimal? carGasolineLe { get; set; }
    [Column("CAR_REPAIR_LE")] public decimal? carRepairLe { get; set; }
    [Column("MEDICAL_OUTSIDE_LE")] public decimal? medicalOutsideLe { get; set; }
    [Column("MEDICAL_INHOUSE_LE")] public decimal? medicalInhouseLe { get; set; }
    [Column("STAFF_ACTIVITIES_LE")] public decimal? staffActivitiesLe { get; set; }
    [Column("UNIFORM_LE")] public decimal? uniformLe { get; set; }
    [Column("LIFE_INSURANCE_LE")] public decimal? lifeInsuranceLe { get; set; }
    [Column("PE_SB_MTH_LE")] public decimal? peSbMthLe { get; set; }
    [Column("PE_SB_YEAR_LE")] public decimal? peSbYearLe { get; set; }

    // ═══════════════════════════════════════════════════════════════
    // BUDGET YEAR FIELDS (44 fields - BJC specific)
    // ═══════════════════════════════════════════════════════════════

    [Column("PAYROLL")] public decimal? payroll { get; set; }
    [Column("PREMIUM")] public decimal? premium { get; set; }
    [Column("SAL_WITH_EN")] public decimal? salWithEn { get; set; }
    [Column("SAL_NOT_EN")] public decimal? salNotEn { get; set; }
    [Column("BONUS")] public decimal? bonus { get; set; }
    [Column("SAL_TEMP")] public decimal? salTemp { get; set; }
    [Column("SOCIAL_SECURITY_TMP")] public decimal? socialSecurityTmp { get; set; }
    [Column("SOUTHRISK_ALLOWANCE_TMP")] public decimal? southriskAllowanceTmp { get; set; }
    [Column("CAR_MAINTENANCE_TMP")] public decimal? carMaintenanceTmp { get; set; }
    [Column("SALES_MANAGEMENT_PC")] public decimal? salesManagementPc { get; set; }
    [Column("SHELF_STACKING_PC")] public decimal? shelfStackingPc { get; set; }
    [Column("DILIGENCE_ALLOWANCE_PC")] public decimal? diligenceAllowancePc { get; set; }
    [Column("POST_ALLOWANCE_PC")] public decimal? postAllowancePc { get; set; }
    [Column("PHONE_ALLOWANCE_PC")] public decimal? phoneAllowancePc { get; set; }
    [Column("TRANSPORTATION_PC")] public decimal? transportationPc { get; set; }
    [Column("SKILL_ALLOWANCE_PC")] public decimal? skillAllowancePc { get; set; }
    [Column("OTHER_ALLOWANCE_PC")] public decimal? otherAllowancePc { get; set; }
    [Column("TEMPORARY_STAFF_SAL")] public decimal? temporaryStaffSal { get; set; }
    [Column("SOCIAL_SECURITY")] public decimal? socialSecurity { get; set; }
    [Column("PROVIDENT_FUND")] public decimal? providentFund { get; set; }
    [Column("WORKMEN_COMPENSATION")] public decimal? workmenCompensation { get; set; }
    [Column("HOUSING_ALLOWANCE")] public decimal? housingAllowance { get; set; }
    [Column("SALES_CAR_ALLOWANCE")] public decimal? salesCarAllowance { get; set; }
    [Column("ACCOMMODATION")] public decimal? accommodation { get; set; }
    [Column("CAR_MAINTENANCE")] public decimal? carMaintenance { get; set; }
    [Column("SOUTHRISK_ALLOWANCE")] public decimal? southriskAllowance { get; set; }
    [Column("MEAL_ALLOWANCE")] public decimal? mealAllowance { get; set; }
    [Column("OTHER")] public decimal? other { get; set; }
    [Column("OTHERS_SUBJECT_TAX")] public decimal? othersSubjectTax { get; set; }
    [Column("CAR_ALLOWANCE")] public decimal? carAllowance { get; set; }
    [Column("LICENSE_ALLOWANCE")] public decimal? licenseAllowance { get; set; }
    [Column("OUTSOURCE_WAGES")] public decimal? outsourceWages { get; set; }
    [Column("COMP_CARS_GAS")] public decimal? compCarsGas { get; set; }
    [Column("COMP_CARS_OTHER")] public decimal? compCarsOther { get; set; }
    [Column("CAR_RENTAL")] public decimal? carRental { get; set; }
    [Column("CAR_GASOLINE")] public decimal? carGasoline { get; set; }
    [Column("CAR_REPAIR")] public decimal? carRepair { get; set; }
    [Column("MEDICAL_OUTSIDE")] public decimal? medicalOutside { get; set; }
    [Column("MEDICAL_INHOUSE")] public decimal? medicalInhouse { get; set; }
    [Column("STAFF_ACTIVITIES")] public decimal? staffActivities { get; set; }
    [Column("UNIFORM")] public decimal? uniform { get; set; }
    [Column("LIFE_INSURANCE")] public decimal? lifeInsurance { get; set; }
    [Column("PE_SB_MTH")] public decimal? peSbMth { get; set; }
    [Column("PE_SB_YEAR")] public decimal? peSbYear { get; set; }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY FIELDS (4 fields)
    // ═══════════════════════════════════════════════════════════════

    [Column("PE_MTH_LE")] public decimal? peMthLe { get; set; }
    [Column("PE_YEAR_LE")] public decimal? peYearLe { get; set; }
    [Column("PE_MTH")] public decimal? peMth { get; set; }
    [Column("PE_YEAR")] public decimal? peYear { get; set; }

    // ═══════════════════════════════════════════════════════════════
    // METADATA (Optional - for debugging)
    // ═══════════════════════════════════════════════════════════════

    // [Column("MAIN_COST_CENTER")] public string? mainCostCenter { get; set; }
    // [Column("COST_CENTER")] public string? costCenter { get; set; }
  }
}
