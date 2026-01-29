namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Request DTO for Budget Estimation (Cal Button)
    /// Supports both BJC (19 params) and BIGC (12 params) calculations
    /// </summary>
    public class BudgetEstimateRequest
    {
        /// <summary>
        /// Budget Year (from budgetYearSelect dropdown)
        /// </summary>
        public int Year { get; set; }

        /// <summary>
        /// Year LE (Year - 1)
        /// </summary>
        public int YearLe { get; set; }

        /// <summary>
        /// Salary Structure (from batch-salary-structure field)
        /// REQUIRED for calculation
        /// </summary>
        public decimal Salary { get; set; }

        /// <summary>
        /// Premium Amount (from batch-premium field)
        /// </summary>
        public decimal PremiumAmt { get; set; }

        /// <summary>
        /// Job Band (from batch-job-band field)
        /// RECOMMENDED for accurate calculation
        /// </summary>
        public string? JobBand { get; set; }

        /// <summary>
        /// Company ID: 2 = BIGC, 1 = BJC
        /// Forced by backend based on endpoint
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// LE of Month (from batch-le-no-month field)
        /// Number of months in LE period
        /// </summary>
        public int LeOfMonth { get; set; }

        /// <summary>
        /// Number of Month (from batch-no-month field)
        /// Number of months in budget year
        /// </summary>
        public int NoOfMonth { get; set; }

        /// <summary>
        /// Bonus Type (from batch-bonus-type field)
        /// REQUIRED: e.g., "4M", "HO", "6M"
        /// </summary>
        public string BonusType { get; set; } = string.Empty;

        /// <summary>
        /// Company Name (from batch-compstore field)
        /// e.g., "BJC (BKK)", "BIGC"
        /// </summary>
        public string? CompanyName { get; set; }

        /// <summary>
        /// Cost Center (from batch-cost-center field)
        /// e.g., "3410000000", "90091"
        /// </summary>
        public string? CostCenter { get; set; }

        /// <summary>
        /// Allocate JSON (NULL for Batch Entry mode)
        /// Used only in Individual Entry mode
        /// </summary>
        public string? AllocateJson { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // 🆕 BJC-SPECIFIC PARAMETERS (fn_BudgetEstimate_BJC)
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Employee Type (BJC only)
        /// e.g., "FT" (Full Time), "PT" (Part Time)
        /// </summary>
        public string? EmpType { get; set; }

        /// <summary>
        /// Bonus Type LE (BJC only)
        /// Bonus type for Latest Estimate year
        /// e.g., "4M", "Commission", "Temp"
        /// </summary>
        public string? BonusTypeLe { get; set; }

        /// <summary>
        /// Position Name (BJC only)
        /// e.g., "Store Manager", "Sales Staff"
        /// </summary>
        public string? PositionName { get; set; }

        /// <summary>
        /// Years of Service LE (BJC only)
        /// Years of service in Latest Estimate year
        /// </summary>
        public int? YosLe { get; set; }

        /// <summary>
        /// Years of Service (BJC only)
        /// Years of service in Budget year
        /// </summary>
        public int? Yos { get; set; }

        /// <summary>
        /// Department Name (BJC only)
        /// e.g., "HORECA", "Retail"
        /// </summary>
        public string? DeptName { get; set; }

        /// <summary>
        /// Business Unit (BJC only)
        /// e.g., "HB" (Home & Business)
        /// </summary>
        public string? Bu { get; set; }

        /// <summary>
        /// COBU (BJC only)
        /// Company Business Unit code
        /// </summary>
        public string? Cobu { get; set; }
    }
}
