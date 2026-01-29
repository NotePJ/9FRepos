using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Result DTO for BIGC Budget Estimation (fn_BudgetEstimate)
    /// Contains 57 calculated fields specific to BIGC company (27 LE + 25 Budget + 5 Summary)
    /// Property names match Frontend naming convention (camelCase from budget.plan.log.md)
    /// Uses [Column] attribute to map camelCase properties to UPPER_CASE database columns
    /// </summary>
    public class BudgetBigcEstimateResultDto
    {
        // ═══════════════════════════════════════════════════════════════
        // LE FIELDS (26 fields) - Column names from fn_BudgetEstimate
        // Frontend mapping: mainRow.payrollLe, mainRow.premiumLe, etc.
        // ═══════════════════════════════════════════════════════════════

        /// <summary>1. Base salary (LE)</summary>
        [Column("PAYROLL_LE")]
        public decimal? payrollLe { get; set; }

        /// <summary>2. Premium (LE)</summary>
        [Column("PREMIUM_LE")]
        public decimal? premiumLe { get; set; }

        /// <summary>3. Total Payroll (Base+Premium) [GL: 60105000] (LE)</summary>
        [Column("PAYROLL_TOT_LE")]
        public decimal? totalPayrollLe { get; set; }

        /// <summary>4. Bonus [GL: 60125000] (LE)</summary>
        [Column("BONUS_LE")]
        public decimal? bonusLe { get; set; }

        /// <summary>5. Fleet Card - PE [GL: 60126300] (LE)</summary>
        [Column("FLEET_CARD_PE_LE")]
        public decimal? fleetCardPeLe { get; set; }

        /// <summary>6. Car Allowance [GL: 60126500] (LE)</summary>
        [Column("CAR_ALLOWANCE_LE")]
        public decimal? carAllowanceLe { get; set; }

        /// <summary>7. License Allowance [GL: 60127000] (LE)</summary>
        [Column("LICENSE_ALLOWANCE_LE")]
        public decimal? licenseAllowanceLe { get; set; }

        /// <summary>8. Housing Allowance [GL: 60126900] (LE)</summary>
        [Column("HOUSING_ALLOWANCE_LE")]
        public decimal? housingAllowanceLe { get; set; }

        /// <summary>9. Gasoline Allowance [GL: 60126800] (LE)</summary>
        [Column("GASOLINE_ALLOWANCE_LE")]
        public decimal? gasolineAllowanceLe { get; set; }

        /// <summary>10. Wage - Student [GL: 60127400] (LE)</summary>
        [Column("WAGE_STUDENT_LE")]
        public decimal? wageStudentLe { get; set; }

        /// <summary>11. Car Rental - PE [GL: 60127600] (LE)</summary>
        [Column("CAR_RENTAL_PE_LE")]
        public decimal? carRentalPeLe { get; set; }

        /// <summary>12. Skill Pay Allowance [GL: 60127100] (LE)</summary>
        [Column("SKILL_PAY_ALLOWANCE_LE")]
        public decimal? skillPayAllowanceLe { get; set; }

        /// <summary>13. Other Allowance [GL: 60127300] (LE)</summary>
        [Column("OTHER_ALLOWANCE_LE")]
        public decimal? otherAllowanceLe { get; set; }

        /// <summary>14. Social security [GL: 60141050] (LE)</summary>
        [Column("SOCIAL_SECURITY_LE")]
        public decimal? socialSecurityLe { get; set; }

        /// <summary>15. Labor fund fee [GL: 60141100] (LE)</summary>
        [Column("LABOR_FUND_FEE_LE")]
        public decimal? laborFundFeeLe { get; set; }

        /// <summary>16. Other Staff benefit [GL: 60141560] (LE)</summary>
        [Column("OTHER_STAFF_BENEFIT_LE")]
        public decimal? otherStaffBenefitLe { get; set; }

        /// <summary>17. Provident fund [GL: 60142000] (LE)</summary>
        [Column("PROVIDENT_FUND_LE")]
        public decimal? providentFundLe { get; set; }

        /// <summary>18. Provision [GL: 60143150] (LE)</summary>
        [Column("PROVISION_LE")]
        public decimal? provisionLe { get; set; }

        /// <summary>19. Interest [GL: 63325150] (LE)</summary>
        [Column("INTEREST_LE")]
        public decimal? interestLe { get; set; }

        /// <summary>20. Staff insurance [GL: 60141150] (LE)</summary>
        [Column("STAFF_INSURANCE_LE")]
        public decimal? staffInsuranceLe { get; set; }

        /// <summary>21. Medical expense [GL: 60141250] (LE)</summary>
        [Column("MEDICAL_EXPENSE_LE")]
        public decimal? medicalExpenseLe { get; set; }

        /// <summary>22. Medical - In House [GL: 60144200] (LE)</summary>
        [Column("MEDICAL_INHOUSE_LE")]
        public decimal? medicalInhouseLe { get; set; }

        /// <summary>23. Training [GL: 60144172] (LE)</summary>
        [Column("TRAINING_LE")]
        public decimal? trainingLe { get; set; }

        /// <summary>24. Long service [GL: 60144400] (LE)</summary>
        [Column("LONG_SERVICE_LE")]
        public decimal? longServiceLe { get; set; }

        /// <summary>25. PE + SB (Mth) (LE)</summary>
        [Column("PE_SB_MTH_LE")]
        public decimal? peSbMthLe { get; set; }

        /// <summary>26. PE + SB LE (Sep. - Dec.) (LE)</summary>
        [Column("PE_SB_LE")]
        public decimal? peSbYearLe { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // BUDGET YEAR FIELDS (25 fields) - Column names from fn_BudgetEstimate
        // Frontend mapping: mainRow.payroll, mainRow.premium, etc.
        // ═══════════════════════════════════════════════════════════════

        /// <summary>1. Base salary (Budget Year)</summary>
        [Column("PAYROLL")]
        public decimal? payroll { get; set; }

        /// <summary>2. Premium (Budget Year)</summary>
        [Column("PREMIUM")]
        public decimal? premium { get; set; }

        /// <summary>3. Total Payroll (Base+Premium) [GL: 60105000] (Budget Year)</summary>
        [Column("PAYROLL_TOT")]
        public decimal? totalPayroll { get; set; }

        /// <summary>4. Bonus [GL: 60125000] (Budget Year)</summary>
        [Column("BONUS")]
        public decimal? bonus { get; set; }

        /// <summary>6. Fleet Card - PE [GL: 60126300] (Budget Year)</summary>
        [Column("FLEET_CARD_PE")]
        public decimal? fleetCardPe { get; set; }

        /// <summary>7. Car Allowance [GL: 60126500] (Budget Year)</summary>
        [Column("CAR_ALLOWANCE")]
        public decimal? carAllowance { get; set; }

        /// <summary>8. License Allowance [GL: 60127000] (Budget Year)</summary>
        [Column("LICENSE_ALLOWANCE")]
        public decimal? licenseAllowance { get; set; }

        /// <summary>9. Housing Allowance [GL: 60126900] (Budget Year)</summary>
        [Column("HOUSING_ALLOWANCE")]
        public decimal? housingAllowance { get; set; }

        /// <summary>10. Gasoline Allowance [GL: 60126800] (Budget Year)</summary>
        [Column("GASOLINE_ALLOWANCE")]
        public decimal? gasolineAllowance { get; set; }

        /// <summary>11. Wage - Student [GL: 60127400] (Budget Year)</summary>
        [Column("WAGE_STUDENT")]
        public decimal? wageStudent { get; set; }

        /// <summary>12. Car Rental - PE [GL: 60127600] (Budget Year)</summary>
        [Column("CAR_RENTAL_PE")]
        public decimal? carRentalPe { get; set; }

        /// <summary>13. Skill Pay Allowance [GL: 60127100] (Budget Year)</summary>
        [Column("SKILL_PAY_ALLOWANCE")]
        public decimal? skillPayAllowance { get; set; }

        /// <summary>14. Other Allowance [GL: 60127300] (Budget Year)</summary>
        [Column("OTHER_ALLOWANCE")]
        public decimal? otherAllowance { get; set; }

        /// <summary>15. Social security [GL: 60141050] (Budget Year)</summary>
        [Column("SOCIAL_SECURITY")]
        public decimal? socialSecurity { get; set; }

        /// <summary>16. Labor fund fee [GL: 60141100] (Budget Year)</summary>
        [Column("LABOR_FUND_FEE")]
        public decimal? laborFundFee { get; set; }

        /// <summary>17. Other Staff benefit [GL: 60141560] (Budget Year)</summary>
        [Column("OTHER_STAFF_BENEFIT")]
        public decimal? otherStaffBenefit { get; set; }

        /// <summary>18. Provident fund [GL: 60142000] (Budget Year)</summary>
        [Column("PROVIDENT_FUND")]
        public decimal? providentFund { get; set; }

        /// <summary>19. Provision [GL: 60143150] (Budget Year)</summary>
        [Column("PROVISION")]
        public decimal? provision { get; set; }

        /// <summary>20. Interest [GL: 63325150] (Budget Year)</summary>
        [Column("INTEREST")]
        public decimal? interest { get; set; }

        /// <summary>21. Staff insurance [GL: 60141150] (Budget Year)</summary>
        [Column("STAFF_INSURANCE")]
        public decimal? staffInsurance { get; set; }

        /// <summary>22. Medical expense [GL: 60141250] (Budget Year)</summary>
        [Column("MEDICAL_EXPENSE")]
        public decimal? medicalExpense { get; set; }

        /// <summary>23. Medical - In House [GL: 60144200] (Budget Year)</summary>
        [Column("MEDICAL_INHOUSE")]
        public decimal? medicalInhouse { get; set; }

        /// <summary>24. Training [GL: 60144172] (Budget Year)</summary>
        [Column("TRAINING")]
        public decimal? training { get; set; }

        /// <summary>25. Long service [GL: 60144400] (Budget Year)</summary>
        [Column("LONG_SERVICE")]
        public decimal? longService { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // SUMMARY FIELDS (6 fields) - Column names from fn_BudgetEstimate
        // Frontend mapping: mainRow.peSbMth, mainRow.peSbYear, etc.
        // ═══════════════════════════════════════════════════════════════

        /// <summary>PE + SB (Mth) (Budget Year)</summary>
        [Column("PE_SB_MTH")]
        public decimal? peSbMth { get; set; }

        /// <summary>PE + SB Year (Budget Year)</summary>
        [Column("PE_SB_YEAR")]
        public decimal? peSbYear { get; set; }

        /// <summary>PE Monthly (LE)</summary>
        [Column("PE_MTH_LE")]
        public decimal? peMthLe { get; set; }

        /// <summary>PE Annual (LE)</summary>
        [Column("PE_YEAR_LE")]
        public decimal? peYearLe { get; set; }

        /// <summary>PE Monthly (Budget Year)</summary>
        [Column("PE_MTH")]
        public decimal? peMth { get; set; }

        /// <summary>PE Annual (Budget Year)</summary>
        [Column("PE_YEAR")]
        public decimal? peYear { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // METADATA (Optional - for debugging)
        // ═══════════════════════════════════════════════════════════════

        /// <summary>Main Cost Center (Y/N) - from fn_BudgetEstimate</summary>
        // [Column("MAIN_COST_CENTER")]
        // public string? mainCostCenter { get; set; }

        /// <summary>Cost Center Code - from fn_BudgetEstimate</summary>
        // [Column("COST_CENTER")]
        // public string? costCenter { get; set; }
    }
}
