namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Generic Response DTO for Budget Estimation (Cal Button)
    /// Supports both BIGC and BJC company results
    /// </summary>
    /// <typeparam name="T">Result DTO type (BudgetBigcEstimateResultDto or BudgetBjcEstimateResultDto)</typeparam>
    public class BudgetEstimateResponse<T> where T : class
    {
        /// <summary>
        /// Indicates if calculation was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// List of calculated budget data
        /// - For BIGC: BudgetBigcEstimateResultDto (27 fields)
        /// - For BJC: BudgetBjcEstimateResultDto (44 fields)
        /// </summary>
        public List<T>? Data { get; set; }

        /// <summary>
        /// Error or info message (optional)
        /// </summary>
        public string? Message { get; set; }
    }
}
