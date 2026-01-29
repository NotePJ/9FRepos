using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// DTO สำหรับ Budget ของ BIGC - ตาม HRB_BUDGET_BIGC model
    /// </summary>
    public class BudgetBigcDto : BaseBudgetDto
    {
        public override string CompanyType => "BIGC";

        // ===== BIGC Specific Fields (not in base class) =====

        // ===== LE (Last Estimate) Fields =====
        public decimal? TotalPayrollLe { get; set; }
        public decimal? FleetCardPeLe { get; set; }
        public decimal? CarAllowanceLe { get; set; }
        public decimal? LicenseAllowanceLe { get; set; }
        public decimal? HousingAllowanceLe { get; set; }
        public decimal? GasolineAllowanceLe { get; set; }
        public decimal? WageStudentLe { get; set; }
        public decimal? CarRentalPeLe { get; set; }
        public decimal? SkillPayAllowanceLe { get; set; }
        public decimal? OtherAllowanceLe { get; set; }
        public decimal? SocialSecurityLe { get; set; }
        public decimal? LaborFundFeeLe { get; set; }
        public decimal? OtherStaffBenefitLe { get; set; }
        public decimal? ProvidentFundLe { get; set; }
        public decimal? EmployeeWelfareLe { get; set; }
        public decimal? ProvisionLe { get; set; }
        public decimal? InterestLe { get; set; }
        public decimal? StaffInsuranceLe { get; set; }
        public decimal? MedicalExpenseLe { get; set; }
        public decimal? MedicalInhouseLe { get; set; }
        public decimal? TrainingLe { get; set; }
        public decimal? LongServiceLe { get; set; }

        // ===== Budget Fields (Current Year) =====
        public decimal? TotalPayroll { get; set; }
        public string? BonusTypes { get; set; }
        public decimal? FleetCardPe { get; set; }
        public decimal? CarAllowance { get; set; }
        public decimal? LicenseAllowance { get; set; }
        public decimal? HousingAllowance { get; set; }
        public decimal? GasolineAllowance { get; set; }
        public decimal? WageStudent { get; set; }
        public decimal? CarRentalPe { get; set; }
        public decimal? SkillPayAllowance { get; set; }
        public decimal? OtherAllowance { get; set; }
        public decimal? SocialSecurity { get; set; }
        public decimal? LaborFundFee { get; set; }
        public decimal? OtherStaffBenefit { get; set; }
        public decimal? ProvidentFund { get; set; }
        public decimal? EmployeeWelfare { get; set; }
        public decimal? Provision { get; set; }
        public decimal? Interest { get; set; }
        public decimal? StaffInsurance { get; set; }
        public decimal? MedicalExpense { get; set; }
        public decimal? MedicalInhouse { get; set; }
        public decimal? Training { get; set; }
        public decimal? LongService { get; set; }
    }
}
