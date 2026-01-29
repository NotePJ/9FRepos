using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Request DTO for creating a new budget record
    /// </summary>
    public class CreateBudgetRequest
    {
        /// <summary>
        /// Company ID (1 = BJC, 2 = BIGC)
        /// </summary>
        [Required]
        [Range(1, 2, ErrorMessage = "Company ID must be 1 (BJC) or 2 (BIGC)")]
        public int CompanyId { get; set; }

        /// <summary>
        /// Budget data to create
        /// </summary>
        [Required]
        public BudgetResponseDto Budget { get; set; } = new();
    }
}
