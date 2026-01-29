namespace HCBPCoreUI_Backend.DTOs.Summary
{
    /// <summary>
    /// KPI Overview DTO for Block A - 7 KPI Cards
    /// Reference: Section 9.8.1 (API Endpoint Validation)
    /// API Endpoint: GET /api/summary/kpi-overview
    /// </summary>
    public class KpiOverviewDto
    {
        /// <summary>
        /// Total Headcount (All statuses: Active, Vacancy, New Join, On Process)
        /// Calculation: COUNT(*) WHERE EMP_STATUS IN ('Active','Vacancy','New Join','On Process')
        /// Reference: Section 3.2
        /// </summary>
        public int TotalHC { get; set; }

        /// <summary>
        /// Total Personnel Expense (Annual, excluding S&B)
        /// Calculation: SUM(ISNULL(PE_YEAR, 0))
        /// Reference: Section 3.3
        /// </summary>
        public decimal TotalPE { get; set; }

        /// <summary>
        /// Average PE per Headcount
        /// Calculation: TotalPE / TotalHC (returns 0 if TotalHC = 0)
        /// Reference: Section 3.4
        /// </summary>
        public decimal AvgPEPerHC { get; set; }

        /// <summary>
        /// Active Headcount (Currently working employees)
        /// Calculation: COUNT(*) WHERE EMP_STATUS = 'Active'
        /// Reference: Section 3.5
        /// </summary>
        public int ActiveHC { get; set; }

        /// <summary>
        /// New Join Headcount (Approved new hires, not yet started)
        /// Calculation: COUNT(*) WHERE EMP_STATUS = 'New Join'
        /// Reference: Section 3.6
        /// </summary>
        public int NewJoinHC { get; set; }

        /// <summary>
        /// On Process Headcount (Positions in hiring process)
        /// Calculation: COUNT(*) WHERE EMP_STATUS = 'On Process'
        /// Reference: Section 3.7
        /// </summary>
        public int OnProcessHC { get; set; }

        /// <summary>
        /// Vacancy Headcount (Open positions, not filled)
        /// Calculation: COUNT(*) WHERE EMP_STATUS = 'Vacancy'
        /// Reference: Section 3.8
        /// </summary>
        public int VacancyHC { get; set; }
    }
}
