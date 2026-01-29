using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    public class BudgetDto
    {
        // ===== Common Fields (ทุก Company) =====
        public int BudgetId { get; set; }
        public int BudgetYear { get; set; }
        public int? BudgetYearLe { get; set; }
        public int? CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string? Bu { get; set; }
        public string? Cobu { get; set; }
        public string? Division { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }
        public string? StoreName { get; set; }

        // Employee Information (Common)
        public string EmpCode { get; set; } = string.Empty;
        public string? EmpStatus { get; set; }
        public string? TitleTh { get; set; }
        public string? FnameTh { get; set; }
        public string? LnameTh { get; set; }
        public string? TitleEn { get; set; }
        public string? FnameEn { get; set; }
        public string? LnameEn { get; set; }

        // Position Information (Common)
        public string CostCenterCode { get; set; } = string.Empty;
        public string? CostCenterName { get; set; }
        public string? PositionCode { get; set; }
        public string? PositionName { get; set; }
        public string? JobBand { get; set; }
        public DateTime? JoinDate { get; set; }

        // Budget Configuration (Common)
        public int? LeOfMonth { get; set; }
        public int? NoOfMonth { get; set; }

        // Basic Payroll (Common)
        public decimal? Payroll { get; set; }
        public decimal? Premium { get; set; }
        public decimal? TotalPayroll { get; set; }
        public decimal? Bonus { get; set; }
        public string? BonusTypes { get; set; }

        // ===== BJC Specific Fields (nullable สำหรับ BIGC) =====
        public decimal? SalWithEn { get; set; }           // เงินเดือน + EN
        public decimal? SalNotEn { get; set; }            // เงินเดือนไม่ + EN
        public decimal? SalTemp { get; set; }             // เงินเดือนชั่วคราว
        public decimal? SocialSecurityTmp { get; set; }   // ประกันสังคมชั่วคราว
        public decimal? SouthriskAllowanceTmp { get; set; } // เบี้ยเสี่ยงภาคใต้ชั่วคราว

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
        public decimal? SouthriskAllowance { get; set; }
        public decimal? MealAllowance { get; set; }
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

        // ===== BIGC Specific Fields (nullable สำหรับ BJC) =====
        public decimal? FleetCardPe { get; set; }         // Fleet Card Performance
        public decimal? GasolineAllowance { get; set; }   // ค่าน้ำมัน
        public decimal? WageStudent { get; set; }         // ค่าจ้างนักเรียน
        public decimal? CarRentalPe { get; set; }         // ค่าเช่ารถ PE
        public decimal? LaborFundFee { get; set; }        // ค่ากองทุนแรงงาน
        public decimal? OtherStaffBenefit { get; set; }   // สวัสดิการอื่นๆ
        public decimal? EmployeeWelfare { get; set; }     // สวัสดิการพนักงาน
        public decimal? Provision { get; set; }           // สำรองจ่าย
        public decimal? Interest { get; set; }            // ดอกเบี้ย
        public decimal? StaffInsurance { get; set; }      // ประกันพนักงาน
        public decimal? Training { get; set; }            // ฝึกอบรม
        public decimal? LongService { get; set; }         // บำเหน็จ

        // ===== Common Fields ต่อ =====
        // Car & Housing Allowances (ทั้ง 2 company มี)
        public decimal? CarAllowance { get; set; }
        public decimal? LicenseAllowance { get; set; }
        public decimal? HousingAllowance { get; set; }

        // Medical & Benefits (ทั้ง 2 company มี)
        public decimal? MedicalExpense { get; set; }
        public decimal? MedicalInhouse { get; set; }
        public decimal? SocialSecurity { get; set; }
        public decimal? ProvidentFund { get; set; }

        // PE (Performance Evaluation) Fields
        public decimal? PeMth { get; set; }
        public decimal? PeYear { get; set; }
        public decimal? PeSbMth { get; set; }
        public decimal? PeSbYear { get; set; }

        // Additional Configuration
        public string? CostCenterPlan { get; set; }
        public string? SalaryStructure { get; set; }
        public string? RunrateCode { get; set; }
        public string? Discount { get; set; }
        public string? Executive { get; set; }
        public string? FocusHc { get; set; }
        public string? FocusPe { get; set; }
        public string? JoinPvf { get; set; }
        public string? Pvf { get; set; }

        // Audit Fields
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // ===== Company Identifier =====
        /// <summary>
        /// บ่งบอกว่าข้อมูลมาจาก Company ไหน: "BJC" หรือ "BIGC"
        /// </summary>
        public string CompanyType { get; set; } = string.Empty;

        // ===== Last Estimate (LE) Fields - สำหรับทั้ง 2 company =====
        public decimal? PayrollLe { get; set; }
        public decimal? PremiumLe { get; set; }
        public decimal? TotalPayrollLe { get; set; }
        public decimal? BonusLe { get; set; }
        public decimal? PeMthLe { get; set; }
        public decimal? PeYearLe { get; set; }
        public decimal? PeSbMthLe { get; set; }
        public decimal? PeSbYearLe { get; set; }

        // Helper Properties
        /// <summary>
        /// ชื่อเต็มภาษาไทย
        /// </summary>
        public string FullNameTh => $"{TitleTh} {FnameTh} {LnameTh}".Trim();

        /// <summary>
        /// ชื่อเต็มภาษาอังกฤษ
        /// </summary>
        public string FullNameEn => $"{TitleEn} {FnameEn} {LnameEn}".Trim();

        /// <summary>
        /// รวมเงินเดือนทั้งหมด (ตามแต่ละ company)
        /// </summary>
        public decimal? TotalSalary => CompanyType switch
        {
            "BJC" => (SalWithEn ?? 0) + (SalNotEn ?? 0) + (SalTemp ?? 0),
            "BIGC" => (Payroll ?? 0) + (Premium ?? 0),
            _ => Payroll ?? 0
        };
    }
}
