using System;

namespace HCBPCoreUI_Backend.DTOs.Employee
{
    public class EmployeeExpenseDto
    {
        // ===== Common Fields (ทุก Company) =====
        public int ExpenseId { get; set; }
        public int Year { get; set; }
        public string EmpCode { get; set; } = string.Empty;

        // Basic Payroll (Common)
        public decimal? Payroll { get; set; }
        public decimal? Premium { get; set; }
        public string? BonusType { get; set; }
        public decimal? Bonus { get; set; }

        // Common Benefits
        public decimal? SocialSecurity { get; set; }
        public decimal? ProvidentFund { get; set; }
        public decimal? CarAllowance { get; set; }
        public decimal? LicenseAllowance { get; set; }
        public decimal? HousingAllowance { get; set; }
        public decimal? MedicalExpense { get; set; }
        public decimal? MedicalInhouse { get; set; }

        // ===== BJC Specific Fields =====
        public decimal? SalTemp { get; set; }
        public decimal? SocialSecurityTmp { get; set; }
        public decimal? SouthriskAllowanceTmp { get; set; }
        public decimal? CarMaintenanceTmp { get; set; }

        // BJC Performance Components
        public decimal? SalesManagementPc { get; set; }
        public decimal? ShelfStackingPc { get; set; }
        public decimal? DiligenceAllowancePc { get; set; }
        public decimal? PostAllowancePc { get; set; }
        public decimal? PhoneAllowancePc { get; set; }
        public decimal? TransportationPc { get; set; }
        public decimal? SkillAllowancePc { get; set; }
        public decimal? OtherAllowancePc { get; set; }

        // BJC Benefits
        public decimal? TemporaryStaffSal { get; set; }
        public decimal? WorkmenCompensation { get; set; }
        public decimal? SalesCarAllowance { get; set; }
        public decimal? Accommodation { get; set; }
        public decimal? CarMaintenance { get; set; }
        public decimal? SouthriskAllowance { get; set; }
        public decimal? MealAllowance { get; set; }
        public decimal? Other { get; set; }
        public decimal? OthersSubjectTax { get; set; }
        public decimal? OutsourceWages { get; set; }
        public decimal? CompCarsGas { get; set; }
        public decimal? CompCarsOther { get; set; }
        public decimal? CarRental { get; set; }
        public decimal? CarGasoline { get; set; }
        public decimal? CarRepair { get; set; }
        public decimal? MedicalOutside { get; set; }
        public decimal? StaffActivities { get; set; }
        public decimal? Uniform { get; set; }
        public decimal? LifeInsurance { get; set; }

        // ===== BIGC Specific Fields =====
        public decimal? FleetCardPe { get; set; }
        public decimal? GasolineAllowance { get; set; }
        public decimal? WageStudent { get; set; }
        public decimal? CarRentalPe { get; set; }
        public decimal? SkillPayAllowance { get; set; }
        public decimal? OtherAllowance { get; set; }
        public decimal? LaborFundFee { get; set; }
        public decimal? OtherStaffBenefit { get; set; }
        public decimal? EmployeeWelfare { get; set; }
        public decimal? Provision { get; set; }
        public decimal? Interest { get; set; }
        public decimal? StaffInsurance { get; set; }
        public decimal? Training { get; set; }
        public decimal? LongService { get; set; }

        // Audit Fields
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Company Identifier
        /// <summary>
        /// บ่งบอกว่าข้อมูลมาจาก Company ไหน: "BJC" หรือ "BIGC"
        /// </summary>
        public string CompanyType { get; set; } = string.Empty;

        // Helper Properties
        /// <summary>
        /// รวมค่าใช้จ่ายทั้งหมด (ตามแต่ละ company)
        /// </summary>
        public decimal TotalExpense => CompanyType switch
        {
            "BJC" => CalculateBjcTotalExpense(),
            "BIGC" => CalculateBigcTotalExpense(),
            _ => 0
        };

        private decimal CalculateBjcTotalExpense()
        {
            return (Payroll ?? 0) + (Premium ?? 0) + (Bonus ?? 0) +
                   (SalTemp ?? 0) + (SalesManagementPc ?? 0) + (ShelfStackingPc ?? 0) +
                   (DiligenceAllowancePc ?? 0) + (PostAllowancePc ?? 0) +
                   (PhoneAllowancePc ?? 0) + (TransportationPc ?? 0) +
                   (SkillAllowancePc ?? 0) + (OtherAllowancePc ?? 0) +
                   (TemporaryStaffSal ?? 0) + (SocialSecurity ?? 0) +
                   (ProvidentFund ?? 0) + (WorkmenCompensation ?? 0) +
                   (HousingAllowance ?? 0) + (SalesCarAllowance ?? 0) +
                   (Accommodation ?? 0) + (CarMaintenance ?? 0) +
                   (SouthriskAllowance ?? 0) + (MealAllowance ?? 0) +
                   (Other ?? 0) + (OthersSubjectTax ?? 0) +
                   (CarAllowance ?? 0) + (LicenseAllowance ?? 0) +
                   (OutsourceWages ?? 0) + (CompCarsGas ?? 0) +
                   (CompCarsOther ?? 0) + (CarRental ?? 0) +
                   (CarGasoline ?? 0) + (CarRepair ?? 0) +
                   (MedicalOutside ?? 0) + (MedicalInhouse ?? 0) +
                   (StaffActivities ?? 0) + (Uniform ?? 0) +
                   (LifeInsurance ?? 0);
        }

        private decimal CalculateBigcTotalExpense()
        {
            return (Payroll ?? 0) + (Premium ?? 0) + (Bonus ?? 0) +
                   (FleetCardPe ?? 0) + (CarAllowance ?? 0) +
                   (LicenseAllowance ?? 0) + (HousingAllowance ?? 0) +
                   (GasolineAllowance ?? 0) + (WageStudent ?? 0) +
                   (CarRentalPe ?? 0) + (SkillPayAllowance ?? 0) +
                   (OtherAllowance ?? 0) + (SocialSecurity ?? 0) +
                   (LaborFundFee ?? 0) + (OtherStaffBenefit ?? 0) +
                   (ProvidentFund ?? 0) + (EmployeeWelfare ?? 0) +
                   (Provision ?? 0) + (Interest ?? 0) +
                   (StaffInsurance ?? 0) + (MedicalExpense ?? 0) +
                   (MedicalInhouse ?? 0) + (Training ?? 0) +
                   (LongService ?? 0);
        }
    }
}
