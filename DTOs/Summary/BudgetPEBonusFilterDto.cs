using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.Summary
{
  /// <summary>
  /// Filter DTO for Budget PE Bonus Report
  /// Used to filter data by Company, Year, COBU/Format, and Cost Center
  /// </summary>
  public class BudgetPEBonusFilterDto
  {
    /// <summary>
    /// Company ID (Required)
    /// 1 = BJC, 2 = BIG C
    /// </summary>
    [Required(ErrorMessage = "Company ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Company ID must be greater than 0")]
    public int CompanyId { get; set; }

    /// <summary>
    /// Budget Year (Required)
    /// Example: 2026
    /// </summary>
    [Required(ErrorMessage = "Budget Year is required")]
    [Range(2000, 2100, ErrorMessage = "Budget Year must be between 2000 and 2100")]
    public int BudgetYear { get; set; }

    /// <summary>
    /// COBU/Format (Optional)
    /// Example: "HQ", "Store", etc.
    /// </summary>
    public string? CobuFormat { get; set; }

    /// <summary>
    /// Cost Center Code (Optional)
    /// Example: "02990", "49201"
    /// </summary>
    public string? CostCenterCode { get; set; }
  }
}
