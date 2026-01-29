namespace HCBPCoreUI_Backend.DTOs.Summary
{
    /// <summary>
    /// PE by Division DTO for Block B - Horizontal Bar Chart
    /// Reference: Section 9.8.2 (API Endpoint Validation)
    /// API Endpoint: GET /api/summary/pe-by-division
    /// </summary>
    public class PEByDivisionDto
    {
        /// <summary>
        /// Division name (from DIVISION field)
        /// Shows "Unassigned" if NULL
        /// Reference: Section 4.3 (SQL Query)
        /// </summary>
        public string Division { get; set; } = string.Empty;

        /// <summary>
        /// Total Headcount in this Division
        /// Calculation: COUNT(*) grouped by DIVISION
        /// Reference: Section 4.3
        /// </summary>
        public int TotalHC { get; set; }

        /// <summary>
        /// Total Personnel Expense in this Division
        /// Calculation: SUM(ISNULL(PE_YEAR, 0)) grouped by DIVISION
        /// Reference: Section 4.3
        /// </summary>
        public decimal TotalPE { get; set; }

        /// <summary>
        /// Average PE per Headcount in this Division
        /// Calculation: TotalPE / TotalHC (returns 0 if TotalHC = 0)
        /// Reference: Section 4.3
        /// </summary>
        public decimal AvgPEPerHC { get; set; }
    }
}
