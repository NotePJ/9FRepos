namespace HCBPCoreUI_Backend.DTOs.Summary
{
    /// <summary>
    /// Cost Center Summary DTO for Block D - Data Table
    /// Reference: Section 9.8.4 (API Endpoint Validation)
    /// API Endpoint: GET /api/summary/cost-centers
    /// </summary>
    public class CostCenterSummaryDto
    {
        /// <summary>
        /// Rank by Total PE (descending)
        /// Calculation: ROW_NUMBER() OVER (ORDER BY TotalPE DESC)
        /// Reference: Section 6.3 (SQL Query)
        /// </summary>
        public int Rank { get; set; }

        /// <summary>
        /// Cost Center Code (from COST_CENTER_CODE field)
        /// Required field, NOT NULL
        /// Reference: Section 6.2.2
        /// </summary>
        public string CostCenterCode { get; set; } = string.Empty;

        /// <summary>
        /// Cost Center Name (from COST_CENTER_NAME field)
        /// Nullable, may be empty
        /// Reference: Section 6.2.3
        /// </summary>
        public string? CostCenterName { get; set; }

        /// <summary>
        /// Division name (from DIVISION field)
        /// Reference: Section 6.2.4
        /// </summary>
        public string? Division { get; set; }

        /// <summary>
        /// COBU/Format name (from COBU field)
        /// Reference: Section 6.2.5
        /// </summary>
        public string? Cobu { get; set; }

        /// <summary>
        /// Total Headcount (All statuses)
        /// Calculation: COUNT(*) grouped by COST_CENTER_CODE
        /// Reference: Section 6.2.6
        /// </summary>
        public int TotalHC { get; set; }

        /// <summary>
        /// Active Headcount
        /// Calculation: SUM(CASE WHEN EMP_STATUS = 'Active' THEN 1 ELSE 0 END)
        /// Reference: Section 6.2.7
        /// </summary>
        public int ActiveHC { get; set; }

        /// <summary>
        /// Vacancy Headcount
        /// Calculation: SUM(CASE WHEN EMP_STATUS = 'Vacancy' THEN 1 ELSE 0 END)
        /// Reference: Section 6.2.8
        /// </summary>
        public int VacancyHC { get; set; }

        /// <summary>
        /// New Join Headcount (optional, not in main spec but included for completeness)
        /// Calculation: SUM(CASE WHEN EMP_STATUS = 'New Join' THEN 1 ELSE 0 END)
        /// </summary>
        public int NewJoinHC { get; set; }

        /// <summary>
        /// On Process Headcount (optional, not in main spec but included for completeness)
        /// Calculation: SUM(CASE WHEN EMP_STATUS = 'On Process' THEN 1 ELSE 0 END)
        /// </summary>
        public int OnProcessHC { get; set; }

        /// <summary>
        /// Total Personnel Expense
        /// Calculation: SUM(ISNULL(PE_YEAR, 0)) grouped by COST_CENTER_CODE
        /// Reference: Section 6.2.9
        /// </summary>
        public decimal TotalPE { get; set; }

        /// <summary>
        /// Average PE per Headcount
        /// Calculation: TotalPE / TotalHC (returns 0 if TotalHC = 0)
        /// Reference: Section 6.2.10
        /// </summary>
        public decimal AvgPEPerHC { get; set; }

        /// <summary>
        /// Percentage of Total PE
        /// Calculation: (TotalPE / Company_Total_PE) * 100
        /// Reference: Section 6.2.11
        /// </summary>
        public decimal PercentOfTotal { get; set; }
    }
}
