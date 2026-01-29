using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// DTO สำหรับ API Response ที่รวมทุก fields จาก BJC และ BIGC
    /// เพื่อให้ Frontend ใช้งานร่วมกันได้โดยไม่ต้องแก้ไขมาก
    /// </summary>
    public class BudgetResponseDto : BaseBudgetDto
    {
        public override string CompanyType => "UNIFIED";

        // ===== Common Salary Components (ทั้ง BJC/BIGC) =====
        public decimal? SalWithEn { get; set; }           // เงินเดือน + EN (BJC)
        public decimal? SalWithEnLe { get; set; }         // เงินเดือน + EN (LE) (BJC)
        public decimal? SalNotEn { get; set; }            // เงินเดือนไม่ + EN (BJC)
        public decimal? SalNotEnLe { get; set; }          // เงินเดือนไม่ + EN (LE) (BJC)
        public decimal? SalTemp { get; set; }             // เงินเดือนชั่วคราว (BJC)
        public decimal? SalTempLe { get; set; }           // เงินเดือนชั่วคราว (LE) (BJC)

        public decimal? WageStudent { get; set; }         // ค่าจ้างนักเรียนฝึกงาน (BIGC)
        public decimal? WageStudentLe { get; set; }       // ค่าจ้างนักเรียนฝึกงาน (LE) (BIGC)

        // ===== Bonus (Different field names) =====
        public string? BonusType { get; set; }            // BJC ใช้ BonusType
        public string? BonusTypeLe { get; set; }          // Bonus Type (LE) (BJC)
        public string? BonusTypes { get; set; }           // BIGC ใช้ BonusTypes

        // ===== Performance Components (ทั้ง BJC/BIGC) =====
        public decimal? SalesManagementPc { get; set; }   // PC การจัดการขาย (BJC)
        public decimal? SalesManagementPcLe { get; set; } // PC การจัดการขาย (LE) (BJC)
        public decimal? ShelfStackingPc { get; set; }     // PC จัดชั้นสินค้า (BJC)
        public decimal? ShelfStackingPcLe { get; set; }   // PC จัดชั้นสินค้า (LE) (BJC)

        public decimal? DiligenceAllowancePc { get; set; } // PC เบี้ยขยัน (ทั้งคู่)
        public decimal? DiligenceAllowancePcLe { get; set; } // PC เบี้ยขยัน (LE) (ทั้งคู่)
        public decimal? PostAllowancePc { get; set; }     // PC เบี้ยตำแหน่ง (ทั้งคู่)
        public decimal? PostAllowancePcLe { get; set; }   // PC เบี้ยตำแหน่ง (LE) (ทั้งคู่)
        public decimal? PhoneAllowancePc { get; set; }    // PC เบี้ยโทรศัพท์ (ทั้งคู่)
        public decimal? PhoneAllowancePcLe { get; set; }  // PC เบี้ยโทรศัพท์ (LE) (ทั้งคู่)
        public decimal? TransportationPc { get; set; }    // PC คมนาคม (ทั้งคู่)
        public decimal? TransportationPcLe { get; set; }  // PC คมนาคม (LE) (ทั้งคู่)
        public decimal? SkillAllowancePc { get; set; }    // PC เบี้ยความชำนาญ (BJC)
        public decimal? SkillAllowancePcLe { get; set; }  // PC เบี้ยความชำนาญ (LE) (BJC)
        public decimal? OtherAllowancePc { get; set; }    // PC เบี้ยเลี้ยงอื่นๆ (BJC)
        public decimal? OtherAllowancePcLe { get; set; }  // PC เบี้ยเลี้ยงอื่นๆ (LE) (BJC)

        // ===== Fleet Card & Allowances =====
        public decimal? HousingAllowance { get; set; }    // ค่าที่พักอาศัย (ทั้งคู่)
        public decimal? HousingAllowanceLe { get; set; }  // ค่าที่พักอาศัย (LE) (ทั้งคู่)
        public decimal? CarAllowance { get; set; }        // ค่ารถ (ทั้งคู่)
        public decimal? CarAllowanceLe { get; set; }      // ค่ารถ (LE) (ทั้งคู่)
        public decimal? LicenseAllowance { get; set; }    // ค่าใบอนุญาต (ทั้งคู่)
        public decimal? LicenseAllowanceLe { get; set; }  // ค่าใบอนุญาต (LE) (ทั้งคู่)
        public decimal? FleetCardPe { get; set; }         // Fleet Card PE (BIGC)
        public decimal? FleetCardPeLe { get; set; }       // Fleet Card PE (LE) (BIGC)
        public decimal? SkillPayAllowance { get; set; }   // เบี้ยเลี้ยงความชำนาญ (BIGC)
        public decimal? SkillPayAllowanceLe { get; set; } // เบี้ยเลี้ยงความชำนาญ (LE) (BIGC)

        // ===== Temporary Staff =====
        public decimal? TemporaryStaffSal { get; set; }   // เงินเดือนพนักงานชั่วคราว (BJC)
        public decimal? TemporaryStaffSalLe { get; set; } // เงินเดือนพนักงานชั่วคราว (LE) (BJC)

        // ===== Social Security & Benefits =====
        public decimal? SocialSecurity { get; set; }      // ประกันสังคม (ทั้งคู่)
        public decimal? SocialSecurityLe { get; set; }    // ประกันสังคม (LE) (ทั้งคู่)
        public decimal? ProvidentFund { get; set; }       // กองทุนสำรองเลี้ยงชีพ (ทั้งคู่)
        public decimal? ProvidentFundLe { get; set; }     // กองทุนสำรองเลี้ยงชีพ (LE) (ทั้งคู่)
        public decimal? SocialSecurityTmp { get; set; }   // ประกันสังคมชั่วคราว (ทั้งคู่)
        public decimal? SocialSecurityTmpLe { get; set; } // ประกันสังคมชั่วคราว (LE) (ทั้งคู่)
        public decimal? WorkmenCompensation { get; set; } // เงินทดแทน (ทั้งคู่)
        public decimal? WorkmenCompensationLe { get; set; } // เงินทดแทน (LE) (ทั้งคู่)

        // ===== BIGC-Specific Benefits =====
        public decimal? LaborFundFee { get; set; }        // ค่ากองทุนแรงงาน (BIGC)
        public decimal? LaborFundFeeLe { get; set; }      // ค่ากองทุนแรงงาน (LE) (BIGC)
        public decimal? OtherStaffBenefit { get; set; }   // สวัสดิการพนักงานอื่นๆ (BIGC)
        public decimal? OtherStaffBenefitLe { get; set; } // สวัสดิการพนักงานอื่นๆ (LE) (BIGC)
        public decimal? EmployeeWelfare { get; set; }     // สวัสดิการพนักงาน (BIGC)
        public decimal? EmployeeWelfareLe { get; set; }   // สวัสดิการพนักงาน (LE) (BIGC)
        public decimal? Provision { get; set; }           // ค่าเผื่อ (BIGC)
        public decimal? ProvisionLe { get; set; }         // ค่าเผื่อ (LE) (BIGC)
        public decimal? Interest { get; set; }            // ดอกเบี้ย (BIGC)
        public decimal? InterestLe { get; set; }          // ดอกเบี้ย (LE) (BIGC)
        public decimal? StaffInsurance { get; set; }      // ประกันพนักงาน (BIGC)
        public decimal? StaffInsuranceLe { get; set; }    // ประกันพนักงาน (LE) (BIGC)
        public decimal? MedicalExpense { get; set; }      // ค่ารักษาพยาบาล (BIGC)
        public decimal? MedicalExpenseLe { get; set; }    // ค่ารักษาพยาบาล (LE) (BIGC)
        public decimal? Training { get; set; }            // การฝึกอบรม (BIGC)
        public decimal? TrainingLe { get; set; }          // การฝึกอบรม (LE) (BIGC)
        public decimal? LongService { get; set; }         // บำเหน็จอายุงาน (BIGC)
        public decimal? LongServiceLe { get; set; }       // บำเหน็จอายุงาน (LE) (BIGC)
        public decimal? CarRentalPe { get; set; }         // ค่าเช่ารถ PE (BIGC)
        public decimal? CarRentalPeLe { get; set; }       // ค่าเช่ารถ PE (LE) (BIGC)
        public decimal? GasolineAllowance { get; set; }   // ค่าน้ำมัน (BIGC)
        public decimal? GasolineAllowanceLe { get; set; } // ค่าน้ำมัน (LE) (BIGC)
        public decimal? OtherAllowance { get; set; }      // เบี้ยเลี้ยงอื่นๆ (BIGC)
        public decimal? OtherAllowanceLe { get; set; }    // เบี้ยเลี้ยงอื่นๆ (LE) (BIGC)

        // ===== Car Related (ทั้งคู่) =====
        public decimal? CompCarsGas { get; set; }         // น้ำมันรถบริษัท
        public decimal? CompCarsGasLe { get; set; }       // น้ำมันรถบริษัท (LE)
        public decimal? CompCarsOther { get; set; }       // อื่นๆ รถบริษัท (BJC)
        public decimal? CompCarsOtherLe { get; set; }     // อื่นๆ รถบริษัท (LE) (BJC)
        public decimal? CarRental { get; set; }           // ค่าเช่ารถ (BJC)
        public decimal? CarRentalLe { get; set; }         // ค่าเช่ารถ (LE) (BJC)
        public decimal? CarGasoline { get; set; }         // ค่าน้ำมันรถ (ทั้งคู่)
        public decimal? CarGasolineLe { get; set; }       // ค่าน้ำมันรถ (LE) (ทั้งคู่)
        public decimal? CarRepair { get; set; }           // ค่าซ่อมรถ (ทั้งคู่)
        public decimal? CarRepairLe { get; set; }         // ค่าซ่อมรถ (LE) (ทั้งคู่)
        public decimal? CarMaintenance { get; set; }      // ค่าบำรุงรักษารถ (ทั้งคู่)
        public decimal? CarMaintenanceLe { get; set; }    // ค่าบำรุงรักษารถ (LE) (ทั้งคู่)
        public decimal? CarMaintenanceTmp { get; set; }   // ค่าบำรุงรักษารถชั่วคราว (BJC)
        public decimal? CarMaintenanceTmpLe { get; set; } // ค่าบำรุงรักษารถชั่วคราว (LE) (BJC)

        // ===== Medical & Health =====
        public decimal? MedicalOutside { get; set; }      // ค่ารักษาพยาบาลนอกสถานที่ (ทั้งคู่)
        public decimal? MedicalOutsideLe { get; set; }    // ค่ารักษาพยาบาลนอกสถานที่ (LE) (ทั้งคู่)
        public decimal? MedicalInHouse { get; set; }      // ค่ารักษาพยาบาลในสถานที่ (ทั้งคู่)
        public decimal? MedicalInHouseLe { get; set; }    // ค่ารักษาพยาบาลในสถานที่ (LE) (ทั้งคู่)

        // ===== Staff Activities & Equipment =====
        public decimal? StaffActivities { get; set; }     // กิจกรรมพนักงาน (ทั้งคู่)
        public decimal? StaffActivitiesLe { get; set; }   // กิจกรรมพนักงาน (LE) (ทั้งคู่)
        public decimal? Uniform { get; set; }             // เครื่องแบบ (ทั้งคู่)
        public decimal? UniformLe { get; set; }           // เครื่องแบบ (LE) (ทั้งคู่)
        public decimal? LifeInsurance { get; set; }       // ประกันชีวิต (ทั้งคู่)
        public decimal? LifeInsuranceLe { get; set; }     // ประกันชีวิต (LE) (ทั้งคู่)

        // ===== Outsource & Contract =====
        public decimal? OutsourceWages { get; set; }      // ค่าจ้าง Outsource (ทั้งคู่)
        public decimal? OutsourceWagesLe { get; set; }    // ค่าจ้าง Outsource (LE) (ทั้งคู่)

        // ===== Accommodation & Travel =====
        public decimal? Accommodation { get; set; }       // ค่าที่พัก (ทั้งคู่)
        public decimal? AccommodationLe { get; set; }     // ค่าที่พัก (LE) (ทั้งคู่)
        public decimal? MealAllowance { get; set; }       // เบี้ยเลี้ยงอาหาร (ทั้งคู่)
        public decimal? MealAllowanceLe { get; set; }     // เบี้ยเลี้ยงอาหาร (LE) (ทั้งคู่)

        // ===== Special Allowances (BJC) =====
        public decimal? SalesCarAllowance { get; set; }   // เบี้ยเลี้ยงรถขาย (BJC)
        public decimal? SalesCarAllowanceLe { get; set; } // เบี้ยเลี้ยงรถขาย (LE) (BJC)
        public decimal? SouthriskAllowance { get; set; }  // เบี้ยเสี่ยงภาคใต้ (BJC)
        public decimal? SouthriskAllowanceLe { get; set; } // เบี้ยเสี่ยงภาคใต้ (LE) (BJC)
        public decimal? SouthriskAllowanceTmp { get; set; } // เบี้ยเสี่ยงภาคใต้ชั่วคราว (BJC)
        public decimal? SouthriskAllowanceTmpLe { get; set; } // เบี้ยเสี่ยงภาคใต้ชั่วคราว (LE) (BJC)

        // ===== Tax & Others =====
        public decimal? OthersSubjectTax { get; set; }    // อื่นๆ ที่ต้องเสียภาษี (ทั้งคู่)
        public decimal? OthersSubjectTaxLe { get; set; }  // อื่นๆ ที่ต้องเสียภาษี (LE) (ทั้งคู่)
        public decimal? Other { get; set; }               // อื่นๆ (ทั้งคู่)
        public decimal? OtherLe { get; set; }             // อื่นๆ (LE) (ทั้งคู่)

        // ===== Company-Specific Fields =====

        // BIGC Totals
        public decimal? TotalPayroll { get; set; }        // Total Payroll (BIGC)
        public decimal? TotalPayrollLe { get; set; }      // Total Payroll LE (BIGC)
    }
}
