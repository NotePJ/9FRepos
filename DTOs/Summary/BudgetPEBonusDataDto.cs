using System.Text.Json.Serialization;

namespace HCBPCoreUI_Backend.DTOs.Summary
{
  /// <summary>
  /// Data DTO for Budget PE Bonus Report
  /// ✅ DYNAMIC: Supports any year range via JsonExtensionData
  /// - Organization: 11 columns (fixed)
  /// - Historical: Dynamic years (6 years, via AdditionalData)
  /// - Budget: Dynamic year (via AdditionalData)
  /// - Legal Entity: 17 columns (fixed, no year suffix)
  /// - Company: 17 columns (fixed, no year suffix)
  ///
  /// Example for Budget Year 2026:
  ///   Historical: ACTUAL_FT_2019, ACTUAL_FT_2020, ..., ACTUAL_FT_2024
  ///   Budget: BUDGET_FT_2025, BUDGET_CT_2025, CURRENT_PE_2025, CURRENT_PE_BONUS_2025
  ///
  /// Example for Budget Year 2027:
  ///   Historical: ACTUAL_FT_2020, ACTUAL_FT_2021, ..., ACTUAL_FT_2025
  ///   Budget: BUDGET_FT_2026, BUDGET_CT_2026, CURRENT_PE_2026, CURRENT_PE_BONUS_2026
  /// </summary>
  public class BudgetPEBonusDataDto
  {
    // ==========================================
    // GROUP 1: Organization (11 columns)
    // ==========================================

    /// <summary>BU Head Supervisor</summary>
    public string? BU_HEAD_SUP { get; set; }

    /// <summary>BU Head</summary>
    public string? BU_HEAD { get; set; }

    /// <summary>Business Unit</summary>
    public string? BU { get; set; }

    /// <summary>Company Business Unit</summary>
    public string? COBU { get; set; }

    /// <summary>Department Name</summary>
    public string? DEPARTMENT { get; set; }

    /// <summary>Cost Center Code</summary>
    public string? COST_CENTER { get; set; }

    /// <summary>Cost Center Name (HR Version)</summary>
    public string? COST_CENTER_NAME_HR { get; set; }

    /// <summary>Cost Center Name (FAD Version)</summary>
    public string? COST_CENTER_NAME_FAD { get; set; }

    /// <summary>Grouping</summary>
    public string? GROUPING { get; set; }

    /// <summary>HRBP Code</summary>
    public string? HRBP { get; set; }

    // ==========================================
    // DYNAMIC YEAR DATA: Historical & Budget
    // ==========================================

    /// <summary>
    /// 🔥 Dynamic year data storage using JsonExtensionData
    /// Automatically captures all year-based columns from Stored Procedure:
    ///
    /// Historical Data (6 years):
    ///   - ACTUAL_FT_{year}, ACTUAL_CT_{year}, ACTUAL_PE_{year}
    ///   - Example: ACTUAL_FT_2019, ACTUAL_FT_2020, ..., ACTUAL_FT_2024
    ///
    /// Budget Data (previous year):
    ///   - BUDGET_FT_{year}, BUDGET_CT_{year}
    ///   - CURRENT_PE_{year}, CURRENT_PE_BONUS_{year}
    ///   - Example: BUDGET_FT_2025, CURRENT_PE_2025
    ///
    /// Usage:
    ///   Frontend: row.ACTUAL_FT_2025 (flat JSON access)
    ///   Backend: dto.AdditionalData["ACTUAL_FT_2025"]
    /// </summary>
    [JsonExtensionData]
    public Dictionary<string, object>? AdditionalData { get; set; }

    // ==========================================
    // LEGACY: Backward Compatibility (2019-2025)
    // ==========================================

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? BUDGET_FT_2025 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? BUDGET_CT_2025 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? CURRENT_PE_2025 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? CURRENT_PE_BONUS_2025 { get; set; }

    // ==========================================
    // GROUP 9: Legal Entity (LE) 2026 (17 columns)
    // ==========================================

    /// <summary>Active Full Time LE</summary>
    public decimal? ACTIVE_FT_LE { get; set; }

    /// <summary>Active Contract LE</summary>
    public decimal? ACTIVE_CT_LE { get; set; }

    /// <summary>Active Personnel Expense LE</summary>
    public decimal? ACTIVE_PE_LE { get; set; }

    /// <summary>Vacant Full Time LE</summary>
    public decimal? VAC_FT_LE { get; set; }

    /// <summary>Vacant Contract LE</summary>
    public decimal? VAC_CT_LE { get; set; }

    /// <summary>Vacant Personnel Expense LE</summary>
    public decimal? VAC_PE_LE { get; set; }

    /// <summary>New Full Time LE</summary>
    public decimal? NEW_FT_LE { get; set; }

    /// <summary>New Contract LE</summary>
    public decimal? NEW_CT_LE { get; set; }

    /// <summary>New Personnel Expense LE</summary>
    public decimal? NEW_PE_LE { get; set; }

    /// <summary>Summary Full Time LE</summary>
    public decimal? SUM_FT_LE { get; set; }

    /// <summary>Summary Contract LE</summary>
    public decimal? SUM_CT_LE { get; set; }

    /// <summary>Summary Personnel Expense LE</summary>
    public decimal? SUM_PE_LE { get; set; }

    /// <summary>Overtime LE</summary>
    public decimal? OT_LE { get; set; }

    /// <summary>Employee Benefits LE</summary>
    public decimal? EB_LE { get; set; }

    /// <summary>Summary PE + OT + EB LE</summary>
    public decimal? SUM_PE_OTEB_LE { get; set; }

    /// <summary>Summary PE + OT + Other LE</summary>
    public decimal? SUM_PE_OTOTH_LE { get; set; }

    // ==========================================
    // GROUP 10: Company (Non-LE) 2026 (17 columns)
    // ==========================================

    /// <summary>Active Full Time Company</summary>
    public decimal? ACTIVE_FT { get; set; }

    /// <summary>Active Contract Company</summary>
    public decimal? ACTIVE_CT { get; set; }

    /// <summary>Active Personnel Expense Company</summary>
    public decimal? ACTIVE_PE { get; set; }

    /// <summary>Vacant Full Time Company</summary>
    public decimal? VAC_FT { get; set; }

    /// <summary>Vacant Contract Company</summary>
    public decimal? VAC_CT { get; set; }

    /// <summary>Vacant Personnel Expense Company</summary>
    public decimal? VAC_PE { get; set; }

    /// <summary>New Full Time Company</summary>
    public decimal? NEW_FT { get; set; }

    /// <summary>New Contract Company</summary>
    public decimal? NEW_CT { get; set; }

    /// <summary>New Personnel Expense Company</summary>
    public decimal? NEW_PE { get; set; }

    /// <summary>Summary Full Time Company</summary>
    public decimal? SUM_FT { get; set; }

    /// <summary>Summary Contract Company</summary>
    public decimal? SUM_CT { get; set; }

    /// <summary>Summary Personnel Expense Company</summary>
    public decimal? SUM_PE { get; set; }

    /// <summary>Overtime Company</summary>
    public decimal? OT { get; set; }

    /// <summary>Employee Benefits Company</summary>
    public decimal? EB { get; set; }

    /// <summary>Summary PE + OT + EB Company</summary>
    public decimal? SUM_PE_OTEB { get; set; }

    /// <summary>Summary PE + OT + Other Company</summary>
    public decimal? SUM_PE_OTOTH { get; set; }

    // ==========================================
    // HELPER METHODS: Dynamic Year Access
    // ==========================================

    /// <summary>Get ACTUAL_FT for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualFT(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_FT_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get ACTUAL_CT for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualCT(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_CT_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get ACTUAL_PE for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualPE(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_PE_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get BUDGET_FT for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2025, 2026)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetBudgetFT(int year)
      => AdditionalData?.TryGetValue($"BUDGET_FT_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get BUDGET_CT for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2025, 2026)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetBudgetCT(int year)
      => AdditionalData?.TryGetValue($"BUDGET_CT_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get CURRENT_PE for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2025, 2026)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetCurrentPE(int year)
      => AdditionalData?.TryGetValue($"CURRENT_PE_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get CURRENT_PE_BONUS for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2025, 2026)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetCurrentPEBonus(int year)
      => AdditionalData?.TryGetValue($"CURRENT_PE_BONUS_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;
  }
}
