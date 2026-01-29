namespace HCBPCoreUI_Backend.DTOs.Summary
{
    /// <summary>
    /// PE by COBU/Format DTO for Block C - Horizontal Bar Chart
    /// Reference: Section 9.8.3 (API Endpoint Validation)
    /// API Endpoint: GET /api/summary/pe-by-cobu
    /// </summary>
    public class PEByCobuDto
    {
        /// <summary>
        /// COBU/Format name (from COBU field)
        /// BJC: Business Unit (e.g., HQ, Regional)
        /// Big C: Store Format (e.g., Big C, Mini Big C, Big C Market)
        /// Shows "Unassigned" if NULL
        /// Reference: Section 5.3 (SQL Query)
        /// </summary>
        public string Cobu { get; set; } = string.Empty;

        /// <summary>
        /// Total Headcount in this COBU/Format
        /// Calculation: COUNT(*) grouped by COBU
        /// Reference: Section 5.3
        /// </summary>
        public int TotalHC { get; set; }

        /// <summary>
        /// Total Personnel Expense in this COBU/Format
        /// Calculation: SUM(ISNULL(PE_YEAR, 0)) grouped by COBU
        /// Reference: Section 5.3
        /// </summary>
        public decimal TotalPE { get; set; }

        /// <summary>
        /// Average PE per Headcount in this COBU/Format
        /// Calculation: TotalPE / TotalHC (returns 0 if TotalHC = 0)
        /// Reference: Section 5.3
        /// </summary>
        public decimal AvgPEPerHC { get; set; }
    }
}
