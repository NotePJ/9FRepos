using System.Text.Json.Serialization;

namespace HCBPCoreUI_Backend.DTOs.Summary
{
  /// <summary>
  /// Data DTO for Budget PE HeadCount Report
  /// ✅ DYNAMIC: Supports any year range via JsonExtensionData
  /// - Grouping Info: 5 columns (fixed)
  /// - Historical: Dynamic years (6 years × 4 columns, via AdditionalData)
  /// - Budget Current Year: 9 columns (fixed, no year suffix)
  /// - Legal Entity Current Year: 18 columns (fixed, no year suffix)
  /// - Budget Next Year: 21 columns (fixed, no year suffix)
  /// - Diff columns: 10 columns (fixed)
  ///
  /// Example for Budget Year 2026:
  ///   Historical: ACTUAL_FT_2019, ACTUAL_CT_2019, ACTUAL_PE_2019, ACTUAL_PE_ABS_2019, ..., 2024
  ///
  /// Example for Budget Year 2027:
  ///   Historical: ACTUAL_FT_2020, ACTUAL_CT_2020, ACTUAL_PE_2020, ACTUAL_PE_ABS_2020, ..., 2025
  /// </summary>
  public class BudgetPEHeadCountDataDto
  {
    // Grouping Info
    public string? GROUP_TYPE { get; set; }
    public string? GROUP_TOTAL { get; set; }
    public string? GROUPING_HEAD { get; set; }
    public string? GROUPING { get; set; }
    public string? COST_CENTER { get; set; }

    // Budget Current Year
    public int? BUDGET_CURR_YEAR { get; set; }
    public decimal? BUDGET_CURR_HC_FT { get; set; }
    public decimal? BUDGET_CURR_HC_CT { get; set; }
    public decimal? BUDGET_CURR_HC { get; set; }
    public decimal? BUDGET_CURR_PE { get; set; }
    public decimal? BUDGET_CURR_HC_MOVE_IN { get; set; }
    public decimal? BUDGET_CURR_HC_MOVE_OUT { get; set; }
    public decimal? BUDGET_CURR_HC_ADD { get; set; }
    public decimal? BUDGET_CURR_HC_CUT { get; set; }
    public decimal? BUDGET_CURR_HC_MOVEMENT { get; set; }
    public decimal? BUDGET_CURR_PE_ADJUST { get; set; }

    // Legal Entity (LE) Current Year
    public int? LE_CURR_YEAR { get; set; }
    public decimal? ACTUAL_ACTIVE_HC_FT_LE { get; set; }
    public decimal? ACTUAL_ACTIVE_HC_CT_LE { get; set; }
    public decimal? ACTUAL_ACTIVE_HC_LE { get; set; }
    public decimal? ACTUAL_ACTIVE_PE_LE { get; set; }
    public decimal? LE_ACTIVE_HC_FT_LE { get; set; }
    public decimal? LE_ACTIVE_HC_CT_LE { get; set; }
    public decimal? LE_ACTIVE_HC_LE { get; set; }
    public decimal? LE_ACTIVE_PE_LE { get; set; }
    public decimal? VAC_HC_FT_LE { get; set; }
    public decimal? VAC_HC_CT_LE { get; set; }
    public decimal? VAC_HC_LE { get; set; }
    public decimal? VAC_PE_LE { get; set; }
    public decimal? NEW_HC_FT_LE { get; set; }
    public decimal? NEW_HC_CT_LE { get; set; }
    public decimal? NEW_HC_LE { get; set; }
    public decimal? NEW_PE_LE { get; set; }
    public decimal? OT_LE { get; set; }
    public decimal? EB_LE { get; set; }
    public decimal? TOT_HC_FT_LE { get; set; }
    public decimal? TOT_HC_CT_LE { get; set; }
    public decimal? TOT_HC_LE { get; set; }
    public decimal? TOT_PE_OTEB_LE { get; set; }
    public decimal? TOT_PE_OTOTH_LE { get; set; }

    // Budget Next Year
    public int? BUDGET_NEXT_YEAR { get; set; }
    public decimal? BUDGET_NEXT_HC_MOVE_IN { get; set; }
    public decimal? BUDGET_NEXT_HC_MOVE_OUT { get; set; }
    public decimal? BUDGET_NEXT_HC_CUT { get; set; }
    public decimal? ACTIVE_HC_FT { get; set; }
    public decimal? ACTIVE_HC_CT { get; set; }
    public decimal? ACTIVE_HC { get; set; }
    public decimal? ACTIVE_PE { get; set; }
    public decimal? VAC_HC_FT { get; set; }
    public decimal? VAC_HC_CT { get; set; }
    public decimal? VAC_HC { get; set; }
    public decimal? VAC_PE { get; set; }
    public decimal? CURR_YEAR_NEW_HC_FT_LE { get; set; }
    public decimal? CURR_YEAR_NEW_HC_CT_LE { get; set; }
    public decimal? CURR_YEAR_NEW_HC_LE { get; set; }
    public decimal? CURR_YEAR_NEW_PE_LE { get; set; }
    public decimal? NEW_HC_FT { get; set; }
    public decimal? NEW_HC_CT { get; set; }
    public decimal? NEW_HC { get; set; }
    public decimal? NEW_PE { get; set; }
    public decimal? TOT_HC_FT { get; set; }
    public decimal? TOT_HC_CT { get; set; }
    public decimal? TOT_HC { get; set; }
    public decimal? TOT_PE { get; set; }
    public string? DIFF_B0 { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_FT_B0 { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_CT_B0 { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_B0 { get; set; }  // Changed to string to handle SP output
    public string? DIFF_PE_B0 { get; set; }  // Changed to string to handle SP output
    public string? DIFF_LE { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_FT_LE { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_CT_LE { get; set; }  // Changed to string to handle SP output
    public string? DIFF_HC_LE { get; set; }  // Changed to string to handle SP output
    public string? DIFF_PE_LE { get; set; }  // Changed to string to handle SP output
    public decimal? DIFF_PERCENT_B0 { get; set; }
    public decimal? DIFF_PERCENT_LE { get; set; }
    public string? REMARK { get; set; }

    // ==========================================
    // DYNAMIC YEAR DATA: Historical
    // ==========================================

    /// <summary>
    /// 🔥 Dynamic year data storage using JsonExtensionData
    /// Automatically captures all year-based columns from Stored Procedure:
    ///
    /// Historical Data (6 years × 4 columns):
    ///   - ACTUAL_FT_{year}, ACTUAL_CT_{year}, ACTUAL_PE_{year}, ACTUAL_PE_ABS_{year}
    ///   - Example: ACTUAL_FT_2019, ACTUAL_CT_2019, ACTUAL_PE_2019, ACTUAL_PE_ABS_2019
    ///   - Example: ACTUAL_FT_2024, ACTUAL_CT_2024, ACTUAL_PE_2024, ACTUAL_PE_ABS_2024
    ///
    /// Usage:
    ///   Frontend: row.ACTUAL_FT_2025 (flat JSON access)
    ///   Backend: dto.AdditionalData["ACTUAL_FT_2025"]
    /// </summary>
    [JsonExtensionData]
    public Dictionary<string, object>? AdditionalData { get; set; }

    // ==========================================
    // LEGACY: Backward Compatibility (2019-2024)
    // ==========================================

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2019 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2020 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2021 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2022 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2023 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_FT_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_CT_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_HC_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_2024 { get; set; }

    [Obsolete("Use AdditionalData for dynamic year support. Maintained for backward compatibility only.")]
    public decimal? ACTUAL_PE_ABS_2024 { get; set; }

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

    /// <summary>Get ACTUAL_HC for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualHC(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_HC_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get ACTUAL_PE for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualPE(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_PE_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;

    /// <summary>Get ACTUAL_PE_ABS for specific year from dynamic data</summary>
    /// <param name="year">Year (e.g., 2019, 2020, 2025)</param>
    /// <returns>Value or null if not found</returns>
    public decimal? GetActualPEAbs(int year)
      => AdditionalData?.TryGetValue($"ACTUAL_PE_ABS_{year}", out var val) == true
         ? Convert.ToDecimal(val) : null;
  }
}
