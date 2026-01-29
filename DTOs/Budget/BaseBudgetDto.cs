using System;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Base DTO สำหรับ Budget - รวม fields ที่ใช้ร่วมกันระหว่าง BJC และ BIGC
    /// </summary>
    public abstract class BaseBudgetDto
    {
        // ===== Primary Key =====
        public int BudgetId { get; set; }
        public int BudgetYear { get; set; }
        public int? BudgetYearLe { get; set; }

        // ===== Company Information =====
        public int? CompanyId { get; set; }
        public string? CompanyCode { get; set; }

        // ===== Organization Structure =====
        public string? Bu { get; set; }
        public string? Cobu { get; set; }
        public string? Division { get; set; }
        public string? Department { get; set; }
        public string? Section { get; set; }
        public string? StoreName { get; set; }

        // ===== Employee Information =====
        public string EmpCode { get; set; } = string.Empty;
        public string? EmpStatus { get; set; }
        public string? EmpTypeCode { get; set; }

        // Employee Names (ตามโครงสร้าง Entity)
        public string? TitleTh { get; set; }
        public string? FnameTh { get; set; }
        public string? LnameTh { get; set; }
        public string? TitleEn { get; set; }
        public string? FnameEn { get; set; }
        public string? LnameEn { get; set; }

        // Computed Properties สำหรับ Full Name
        public string? EmpNameTh => $"{TitleTh} {FnameTh} {LnameTh}".Trim();
        public string? EmpNameEn => $"{TitleEn} {FnameEn} {LnameEn}".Trim();

        // ===== Position Information =====
        public string CostCenterCode { get; set; } = string.Empty;
        public string? CostCenterName { get; set; }
        public string? PositionCode { get; set; }
        public string? PositionName { get; set; }
        public string? JobBand { get; set; }
        public DateTime? JoinDate { get; set; }

        // ===== Years of Service =====
        public int? YosCurrYear { get; set; }
        public int? YosNextYear { get; set; }

        // ===== New HC Information =====
        public string? NewHcCode { get; set; }
        public string? NewVacPeriod { get; set; }
        public string? NewVacLe { get; set; }
        public string? Reason { get; set; }

        // ===== Group Information =====
        public string? GroupName { get; set; }
        public string? GroupLevel1 { get; set; }
        public string? GroupLevel2 { get; set; }
        public string? GroupLevel3 { get; set; }

        // ===== Organization Unit (BIGC มี, BJC ไม่มี) =====
        public string? OrgUnitCode { get; set; }
        public string? OrgUnitName { get; set; }

        // ===== Additional Fields จาก Entity =====
        public int? LeOfMonth { get; set; }
        public int? NoOfMonth { get; set; }
        public string? CostCenterPlan { get; set; }
        public string? SalaryStructure { get; set; }
        public string? Discount { get; set; }
        public string? Executive { get; set; }
        public string? FocusHc { get; set; }
        public string? FocusPe { get; set; }
        public string? JoinPvf { get; set; }
        public string? Pvf { get; set; }

        // ===== HR Information =====
        public string? RunrateCode { get; set; }
        public string? HrbpEmpCode { get; set; }

        // ===== Audit Fields (ตาม Entity มีแค่ UpdatedBy/UpdatedDate) =====
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // ===== Financial Fields (Common ตาม Entity) =====
        public decimal? Payroll { get; set; }
        public decimal? PayrollLe { get; set; }
        public decimal? Premium { get; set; }
        public decimal? PremiumLe { get; set; }
        public decimal? Bonus { get; set; }
        public decimal? BonusLe { get; set; }

        // ===== Performance Evaluation Fields =====
        public decimal? PeMthLe { get; set; }
        public decimal? PeYearLe { get; set; }
        public decimal? PeMth { get; set; }
        public decimal? PeYear { get; set; }
        public decimal? PeSbMthLe { get; set; }
        public decimal? PeSbYearLe { get; set; }
        public decimal? PeSbMth { get; set; }
        public decimal? PeSbYear { get; set; }

        // ===== Abstract Property for Company Type =====
        public abstract string CompanyType { get; }
    }
}
