using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// DTO สำหรับ Budget ของ BJC - รวม fields ที่เฉพาะเจาะจงสำหรับ BJC
    /// </summary>
    public class BudgetBjcDto : BaseBudgetDto
    {
        public override string CompanyType => "BJC";

        // ===== BJC Salary Components =====
        public decimal? SalWithEn { get; set; }           // เงินเดือน + EN
        public decimal? SalWithEnLe { get; set; }         // เงินเดือน + EN (LE)
        public decimal? SalNotEn { get; set; }            // เงินเดือนไม่ + EN
        public decimal? SalNotEnLe { get; set; }          // เงินเดือนไม่ + EN (LE)
        public decimal? SalTemp { get; set; }             // เงินเดือนชั่วคราว
        public decimal? SalTempLe { get; set; }           // เงินเดือนชั่วคราว (LE)

        // ===== BJC Bonus =====
        public string? BonusType { get; set; }            // BJC ใช้ BonusType (ไม่ใช่ BonusTypes)
        public string? BonusTypeLe { get; set; }          // Bonus Type (LE)

        // ===== BJC Performance Components =====
        public decimal? SalesManagementPc { get; set; }   // PC การจัดการขาย
        public decimal? SalesManagementPcLe { get; set; } // PC การจัดการขาย (LE)
        public decimal? ShelfStackingPc { get; set; }     // PC จัดชั้นสินค้า
        public decimal? ShelfStackingPcLe { get; set; }   // PC จัดชั้นสินค้า (LE)
        public decimal? DiligenceAllowancePc { get; set; } // PC เบี้ยขยัน
        public decimal? DiligenceAllowancePcLe { get; set; } // PC เบี้ยขยัน (LE)
        public decimal? PostAllowancePc { get; set; }     // PC เบี้ยตำแหน่ง
        public decimal? PostAllowancePcLe { get; set; }   // PC เบี้ยตำแหน่ง (LE)
        public decimal? PhoneAllowancePc { get; set; }    // PC เบี้ยโทรศัพท์
        public decimal? PhoneAllowancePcLe { get; set; }  // PC เบี้ยโทรศัพท์ (LE)
        public decimal? TransportationPc { get; set; }    // PC คมนาคม
        public decimal? TransportationPcLe { get; set; }  // PC คมนาคม (LE)
        public decimal? SkillAllowancePc { get; set; }    // PC เบี้ยความชำนาญ
        public decimal? SkillAllowancePcLe { get; set; }  // PC เบี้ยความชำนาญ (LE)
        public decimal? OtherAllowancePc { get; set; }    // PC เบี้ยเลี้ยงอื่นๆ
        public decimal? OtherAllowancePcLe { get; set; }  // PC เบี้ยเลี้ยงอื่นๆ (LE)

        // ===== BJC Temporary Staff =====
        public decimal? TemporaryStaffSal { get; set; }   // เงินเดือนพนักงานชั่วคราว
        public decimal? TemporaryStaffSalLe { get; set; } // เงินเดือนพนักงานชั่วคราว (LE)

        // ===== BJC Social Security & Benefits =====
        public decimal? SocialSecurity { get; set; }     // ประกันสังคม
        public decimal? SocialSecurityLe { get; set; }   // ประกันสังคม (LE)
        public decimal? SocialSecurityTmp { get; set; }   // ประกันสังคมชั่วคราว
        public decimal? SocialSecurityTmpLe { get; set; } // ประกันสังคมชั่วคราว (LE)
        public decimal? ProvidentFund { get; set; }       // กองทุนสำรองเลี้ยงชีพ
        public decimal? ProvidentFundLe { get; set; }     // กองทุนสำรองเลี้ยงชีพ (LE)
        public decimal? WorkmenCompensation { get; set; } // เงินทดแทน
        public decimal? WorkmenCompensationLe { get; set; } // เงินทดแทน (LE)

        // ===== BJC Allowances =====
        public decimal? HousingAllowance { get; set; }    // ค่าที่พัก
        public decimal? HousingAllowanceLe { get; set; }  // ค่าที่พัก (LE)
        public decimal? SalesCarAllowance { get; set; }   // เบี้ยเลี้ยงรถขาย
        public decimal? SalesCarAllowanceLe { get; set; } // เบี้ยเลี้ยงรถขาย (LE)
        public decimal? Accommodation { get; set; }       // ค่าที่พัก
        public decimal? AccommodationLe { get; set; }     // ค่าที่พัก (LE)
        public decimal? SouthriskAllowance { get; set; }  // เบี้ยเสี่ยงภาคใต้
        public decimal? SouthriskAllowanceLe { get; set; } // เบี้ยเสี่ยงภาคใต้ (LE)
        public decimal? SouthriskAllowanceTmp { get; set; } // เบี้ยเสี่ยงภาคใต้ชั่วคราว
        public decimal? SouthriskAllowanceTmpLe { get; set; } // เบี้ยเสี่ยงภาคใต้ชั่วคราว (LE)
        public decimal? MealAllowance { get; set; }       // เบี้ยเลี้ยงอาหาร
        public decimal? MealAllowanceLe { get; set; }     // เบี้ยเลี้ยงอาหาร (LE)
        public decimal? CarAllowance { get; set; }        // เบี้ยเลี้ยงรถ
        public decimal? CarAllowanceLe { get; set; }      // เบี้ยเลี้ยงรถ (LE)
        public decimal? LicenseAllowance { get; set; }    // เบี้ยใบอนุญาต
        public decimal? LicenseAllowanceLe { get; set; }  // เบี้ยใบอนุญาต (LE)
        public decimal? OthersSubjectTax { get; set; }    // อื่นๆ ที่ต้องเสียภาษี
        public decimal? OthersSubjectTaxLe { get; set; }  // อื่นๆ ที่ต้องเสียภาษี (LE)

        // ===== BJC Outsource =====
        public decimal? OutsourceWages { get; set; }      // ค่าจ้าง Outsource
        public decimal? OutsourceWagesLe { get; set; }    // ค่าจ้าง Outsource (LE)

        // ===== BJC Car Related =====
        public decimal? CompCarsGas { get; set; }         // น้ำมันรถบริษัท
        public decimal? CompCarsGasLe { get; set; }       // น้ำมันรถบริษัท (LE)
        public decimal? CompCarsOther { get; set; }       // อื่นๆ รถบริษัท
        public decimal? CompCarsOtherLe { get; set; }     // อื่นๆ รถบริษัท (LE)
        public decimal? CarRental { get; set; }           // ค่าเช่ารถ
        public decimal? CarRentalLe { get; set; }         // ค่าเช่ารถ (LE)
        public decimal? CarGasoline { get; set; }         // ค่าน้ำมันรถ
        public decimal? CarGasolineLe { get; set; }       // ค่าน้ำมันรถ (LE)
        public decimal? CarRepair { get; set; }           // ค่าซ่อมรถ
        public decimal? CarRepairLe { get; set; }         // ค่าซ่อมรถ (LE)
        public decimal? CarMaintenance { get; set; }      // ค่าบำรุงรักษารถ
        public decimal? CarMaintenanceLe { get; set; }    // ค่าบำรุงรักษารถ (LE)
        public decimal? CarMaintenanceTmp { get; set; }   // ค่าบำรุงรักษารถชั่วคราว
        public decimal? CarMaintenanceTmpLe { get; set; } // ค่าบำรุงรักษารถชั่วคราว (LE)

        // ===== BJC Medical & Benefits =====
        public decimal? MedicalOutside { get; set; }      // ค่ารักษาพยาบาลนอกสถานที่
        public decimal? MedicalOutsideLe { get; set; }    // ค่ารักษาพยาบาลนอกสถานที่ (LE)
        public decimal? MedicalInhouse { get; set; }      // ค่ารักษาพยาบาลในสถานที่
        public decimal? MedicalInhouseLe { get; set; }    // ค่ารักษาพยาบาลในสถานที่ (LE)
        public decimal? StaffActivities { get; set; }     // กิจกรรมพนักงาน
        public decimal? StaffActivitiesLe { get; set; }   // กิจกรรมพนักงาน (LE)
        public decimal? Uniform { get; set; }             // เครื่องแบบ
        public decimal? UniformLe { get; set; }           // เครื่องแบบ (LE)
        public decimal? LifeInsurance { get; set; }       // ประกันชีวิต
        public decimal? LifeInsuranceLe { get; set; }     // ประกันชีวิต (LE)

        // ===== BJC Other =====
        public decimal? Other { get; set; }               // อื่นๆ
        public decimal? OtherLe { get; set; }             // อื่นๆ (LE)
    }
}
