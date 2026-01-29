namespace HCBPCoreUI_Backend.DTOs.Summary
{
    /// <summary>
    /// Paged result for Cost Center data (Block D Table)
    /// Reference: Section 9.8.4 (API Endpoint Validation)
    /// API Endpoint: GET /api/summary/cost-centers
    /// </summary>
    public class CostCenterPagedResultDto
    {
        /// <summary>
        /// List of cost center summary records for current page
        /// Reference: Section 6.4 (Table Features - Pagination)
        /// </summary>
        public List<CostCenterSummaryDto> Data { get; set; } = new List<CostCenterSummaryDto>();

        /// <summary>
        /// Total number of records (before pagination)
        /// Used for pagination controls
        /// Reference: Section 6.4
        /// </summary>
        public int TotalRecords { get; set; }

        /// <summary>
        /// Current page number (1-based)
        /// Reference: Section 6.4
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Number of records per page
        /// Options: 20, 50, 100, All
        /// Default: 20
        /// Reference: Section 6.4
        /// </summary>
        public int PageSize { get; set; }
    }
}
