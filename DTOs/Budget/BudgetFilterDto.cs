using System;
using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    public class BudgetFilterDto
    {
        /// <summary>
        /// Company ID - กำหนดว่าจะดึงข้อมูลจาก table ไหน
        /// 1 = BJC (HRB_BUDGET_BJC), 2 = BIGC (HRB_BUDGET_BIGC)
        /// </summary>
        [Required(ErrorMessage = "CompanyID is required")]
        public string CompanyID { get; set; } = string.Empty;

        /// <summary>
        /// ปีงบประมาณ
        /// </summary>
        public string? BudgetYear { get; set; }

        /// <summary>
        /// รหัสพนักงาน
        /// </summary>
        public string? EmpCode { get; set; }

        /// <summary>
        /// รหัส Cost Center
        /// </summary>
        public string? CostCenterCode { get; set; }

        /// <summary>
        /// หน่วยงาน/แผนก
        /// </summary>
        public string? Department { get; set; }

        /// <summary>
        /// ส่วนงาน
        /// </summary>
        public string? Division { get; set; }

        /// <summary>
        /// หมวด/เซคชั่น
        /// </summary>
        public string? Section { get; set; }

        /// <summary>
        /// Business Unit
        /// </summary>
        public string? Bu { get; set; }

        /// <summary>
        /// Company Business Unit
        /// </summary>
        public string? Cobu { get; set; }

        /// <summary>
        /// ชื่อร้าน/สาขา
        /// </summary>
        public string? StoreName { get; set; }

        /// <summary>
        /// รหัสตำแหน่ง
        /// </summary>
        public string? PositionCode { get; set; }

        /// <summary>
        /// Job Band
        /// </summary>
        public string? JobBand { get; set; }

        /// <summary>
        /// สถานะพนักงาน
        /// </summary>
        public string? EmpStatus { get; set; }

        /// <summary>
        /// รหัส HRBP ผู้ดูแล
        /// </summary>
        public string? HrbpEmpCode { get; set; }

        /// <summary>
        /// รหัส Runrate
        /// </summary>
        public string? RunrateCode { get; set; }

        /// <summary>
        /// Focus HC (Y/N)
        /// </summary>
        public string? FocusHc { get; set; }

        /// <summary>
        /// Focus PE (Y/N)
        /// </summary>
        public string? FocusPe { get; set; }

        /// <summary>
        /// เข้าร่วม PVF (Y/N)
        /// </summary>
        public string? JoinPvf { get; set; }

        /// <summary>
        /// Executive (Y/N)
        /// </summary>
        public string? Executive { get; set; }

        // Date Range Filters
        /// <summary>
        /// วันที่เริ่มงานจาก
        /// </summary>
        public DateTime? JoinDateFrom { get; set; }

        /// <summary>
        /// วันที่เริ่มงานถึง
        /// </summary>
        public DateTime? JoinDateTo { get; set; }

        /// <summary>
        /// วันที่อัพเดทจาก
        /// </summary>
        public DateTime? UpdatedDateFrom { get; set; }

        /// <summary>
        /// วันที่อัพเดทถึง
        /// </summary>
        public DateTime? UpdatedDateTo { get; set; }

        // Pagination
        /// <summary>
        /// หน้าที่ต้องการ (เริ่มจาก 1)
        /// </summary>
        public int Page { get; set; } = 1;

        /// <summary>
        /// จำนวนรายการต่อหน้า
        /// </summary>
        public int PageSize { get; set; } = 50;

        /// <summary>
        /// ฟิลด์ที่ต้องการเรียงลำดับ
        /// </summary>
        public string? SortBy { get; set; }

        /// <summary>
        /// ทิศทางการเรียงลำดับ (asc/desc)
        /// </summary>
        public string SortDirection { get; set; } = "asc";

        // Search
        /// <summary>
        /// คำค้นหาทั่วไป (ชื่อ, รหัสพนักงาน, แผนก)
        /// </summary>
        public string? SearchTerm { get; set; }

        /// <summary>
        /// User ID for Data Access Filtering (optional - if null, no filtering applied)
        /// </summary>
        public int? UserId { get; set; }

        // Helper Properties
        /// <summary>
        /// Company Type ที่แปลงจาก CompanyID
        /// </summary>
        public string CompanyType => CompanyID switch
        {
            "1" => "BJC",
            "2" => "BIGC",
            _ => "UNKNOWN"
        };

        /// <summary>
        /// ตรวจสอบว่าเป็น BJC หรือไม่
        /// </summary>
        public bool IsBjc => CompanyID == "1";

        /// <summary>
        /// ตรวจสอบว่าเป็น BIGC หรือไม่
        /// </summary>
        public bool IsBigc => CompanyID == "2";

        /// <summary>
        /// คำนวณ Skip สำหรับ pagination
        /// </summary>
        public int Skip => (Page - 1) * PageSize;

        /// <summary>
        /// Validate filter values
        /// </summary>
        public bool IsValid()
        {
            // ตรวจสอบ CompanyID
            if (string.IsNullOrEmpty(CompanyID) || (CompanyID != "1" && CompanyID != "2"))
                return false;

            // ตรวจสอบ Page และ PageSize
            if (Page < 1 || PageSize < 1 || PageSize > 1000)
                return false;

            // ตรวจสอบ BudgetYear format
            if (!string.IsNullOrEmpty(BudgetYear) && !int.TryParse(BudgetYear, out _))
                return false;

            return true;
        }

        /// <summary>
        /// Get validation error message
        /// </summary>
        public string GetValidationError()
        {
            if (string.IsNullOrEmpty(CompanyID))
                return "CompanyID is required";

            if (CompanyID != "1" && CompanyID != "2")
                return "CompanyID must be 1 (BJC) or 2 (BIGC)";

            if (Page < 1)
                return "Page must be greater than 0";

            if (PageSize < 1 || PageSize > 1000)
                return "PageSize must be between 1 and 1000";

            if (!string.IsNullOrEmpty(BudgetYear) && !int.TryParse(BudgetYear, out _))
                return "BudgetYear must be a valid year";

            return string.Empty;
        }
    }
}
