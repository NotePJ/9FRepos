using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Dapper;
using HCBPCoreUI_Backend.DTOs.Summary;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Attributes;
using HCBPCoreUI_Backend.Helpers;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Summary Controller for PE Budget Dashboard Phase 1 and PE Bonus reports
    /// Contains:
    /// - 4 New API Endpoints for Dashboard (KPI, Division, COBU, Cost Centers)
    /// - 2 Existing API Endpoints for PE Bonus by Cost Center (Stored Procedures)
    /// ต้องการ Permission: PAGE_SUMMARY
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [RequireAuth]
    [RequirePermission("PAGE_SUMMARY")]
    public class SummaryController : ControllerBase
    {
    private readonly IConfiguration _configuration;
    private readonly ILogger<SummaryController> _logger;
    private readonly string _connectionString;
    private readonly HRBudgetDbContext _context;

    public SummaryController(
      IConfiguration configuration,
      ILogger<SummaryController> logger,
      HRBudgetDbContext context)
    {
      _configuration = configuration;
      _logger = logger;
      _context = context;

      // 🔐 Decrypt connection string (AES-256 encrypted in appsettings.json)
      var encryptionKey = _configuration["EncryptionSettings:Key"];
      var encryptedConnStr = _configuration.GetConnectionString("HRBudgetDb");
      _connectionString = EncryptionHelper.DecryptAES(encryptedConnStr!, encryptionKey!)
        ?? throw new InvalidOperationException("Connection string 'HRBudgetDb' not found or decryption failed.");
    }

    // ============================================================================
    // HELPER: Get User's Allowed Company IDs from CompanyAccess
    // ============================================================================

    /// <summary>
    /// Get list of CompanyIds that the current user is allowed to access
    /// Based on CompanyAccess field in HRB_USER (e.g., "BJC" → [1], "BIGC" → [2], "BJC,BIGC" → [1,2])
    /// </summary>
    /// <returns>List of allowed CompanyIds, empty if no access</returns>
    private async Task<List<int>> GetUserAllowedCompanyIdsAsync()
    {
        var empCode = HttpContext.Session.GetString("EmployeeNo");
        if (string.IsNullOrEmpty(empCode))
        {
            _logger.LogWarning("GetUserAllowedCompanyIds: No EmployeeNo in session");
            return new List<int>();
        }

        var user = await _context.HRB_USER
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.EmpCode == empCode && u.IsActive);

        if (user == null || string.IsNullOrEmpty(user.CompanyAccess))
        {
            _logger.LogWarning("GetUserAllowedCompanyIds: User not found or no CompanyAccess for EmpCode={EmpCode}", empCode);
            return new List<int>();
        }

        var companyIds = new List<int>();
        var accessParts = user.CompanyAccess.ToUpper().Split(',');

        foreach (var part in accessParts)
        {
            var trimmed = part.Trim();
            if (trimmed == "BJC")
                companyIds.Add(1);
            else if (trimmed == "BIGC")
                companyIds.Add(2);
        }

        _logger.LogInformation("GetUserAllowedCompanyIds: EmpCode={EmpCode}, CompanyAccess={Access}, AllowedIds=[{Ids}]",
            empCode, user.CompanyAccess, string.Join(",", companyIds));

        return companyIds;
    }

    /// <summary>
    /// Check if the requested companyId is allowed for current user
    /// </summary>
    private async Task<bool> IsCompanyAllowedAsync(int? companyId, List<int> allowedIds)
    {
        // If no companyId specified, allowed if user has any access
        if (!companyId.HasValue)
            return allowedIds.Any();

        return allowedIds.Contains(companyId.Value);
    }

    // ============================================================================
    // Dashboard Companies API (with CompanyAccess filtering)
    // ============================================================================

    /// <summary>
    /// Get Companies for Dashboard dropdown (filtered by user's CompanyAccess)
    /// Similar to BudgetController.B0Companies
    /// </summary>
    [HttpGet("DashCompanies")]
    public async Task<IActionResult> GetDashboardCompanies()
    {
        try
        {
            var allowedIds = await GetUserAllowedCompanyIdsAsync();

            if (!allowedIds.Any())
            {
                _logger.LogWarning("GetDashboardCompanies: User has no CompanyAccess");
                return Ok(new List<object>());
            }

            // Get companies from master table filtered by allowed IDs
            var companies = await _context.HRB_MST_COMPANY
                .Where(c => c.IsActive == true && allowedIds.Contains(c.CompanyId))
                .Select(c => new
                {
                    companyId = c.CompanyId,
                    companyCode = c.CompanyCode,
                    companyName = c.CompanyName
                })
                .OrderBy(c => c.companyId)
                .ToListAsync();

            _logger.LogInformation("GetDashboardCompanies: Returning {Count} companies", companies.Count);
            return Ok(companies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetDashboardCompanies");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    // ============================================================================
    // NEW: PE Budget Dashboard Phase 1 API Endpoints (Section 3-6)
    // ============================================================================

    /// <summary>
    /// API Endpoint 1: Get KPI Overview (Block A - 7 KPI Cards)
    /// Reference: Section 3.9, Section 9.8.1
    /// </summary>
    /// <param name="companyId">Company ID filter (1=BJC, 2=Big C, null=Both)</param>
    /// <param name="budgetYear">Budget Year filter (e.g., 2025)</param>
    /// <returns>KPI Overview with 7 metrics</returns>
    [HttpGet("kpi-overview")]
    public async Task<ActionResult<KpiOverviewDto>> GetKpiOverview(
        [FromQuery] int? companyId = null,
        [FromQuery] int? budgetYear = null)
    {
        try
        {
            // 🔒 Company Access Check
            var allowedIds = await GetUserAllowedCompanyIdsAsync();
            if (!allowedIds.Any())
            {
                _logger.LogWarning("GetKpiOverview: User has no CompanyAccess");
                return Ok(new KpiOverviewDto());
            }

            // Validate requested companyId against user's access
            if (companyId.HasValue && !allowedIds.Contains(companyId.Value))
            {
                _logger.LogWarning("GetKpiOverview: User not allowed to access CompanyId={CompanyId}", companyId);
                return Ok(new KpiOverviewDto());
            }

            // Default to current year if not specified
            int year = budgetYear ?? DateTime.Now.Year;

            // Valid EMP_STATUS values (Reference: Section 7.2.1)
            var validStatuses = new[] { "Active", "Vacancy", "New Join", "On Process" };

            // Query BJC data (CompanyId = 1) - only if allowed
            var bjcQuery = _context.HRB_BUDGET_BJC
                .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                .AsQueryable();

            if (companyId.HasValue && companyId.Value == 1)
            {
                bjcQuery = bjcQuery.Where(b => b.CompanyId == 1);
            }

            // Query Big C data (CompanyId = 2) - only if allowed
            var bigcQuery = _context.HRB_BUDGET_BIGC
                .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                .AsQueryable();

            if (companyId.HasValue && companyId.Value == 2)
            {
                bigcQuery = bigcQuery.Where(b => b.CompanyId == 2);
            }

            // Calculate metrics from BJC - only if user has BJC access
            int bjcTotalHC = 0, bjcActiveHC = 0, bjcNewJoinHC = 0, bjcOnProcessHC = 0, bjcVacancyHC = 0;
            decimal bjcTotalPE = 0;

            if (allowedIds.Contains(1) && (!companyId.HasValue || companyId.Value == 1))
            {
                bjcTotalHC = await bjcQuery.CountAsync();
                bjcActiveHC = await bjcQuery.CountAsync(b => b.EmpStatus == "Active");
                bjcNewJoinHC = await bjcQuery.CountAsync(b => b.EmpStatus == "New Join");
                bjcOnProcessHC = await bjcQuery.CountAsync(b => b.EmpStatus == "On Process");
                bjcVacancyHC = await bjcQuery.CountAsync(b => b.EmpStatus == "Vacancy");
                bjcTotalPE = await bjcQuery.SumAsync(b => b.PeYear ?? 0);
            }

            // Calculate metrics from Big C - only if user has BIGC access
            int bigcTotalHC = 0, bigcActiveHC = 0, bigcNewJoinHC = 0, bigcOnProcessHC = 0, bigcVacancyHC = 0;
            decimal bigcTotalPE = 0;

            if (allowedIds.Contains(2) && (!companyId.HasValue || companyId.Value == 2))
            {
                bigcTotalHC = await bigcQuery.CountAsync();
                bigcActiveHC = await bigcQuery.CountAsync(b => b.EmpStatus == "Active");
                bigcNewJoinHC = await bigcQuery.CountAsync(b => b.EmpStatus == "New Join");
                bigcOnProcessHC = await bigcQuery.CountAsync(b => b.EmpStatus == "On Process");
                bigcVacancyHC = await bigcQuery.CountAsync(b => b.EmpStatus == "Vacancy");
                bigcTotalPE = await bigcQuery.SumAsync(b => b.PeYear ?? 0);
            }

            // Combine results
            int totalHC = bjcTotalHC + bigcTotalHC;
            decimal totalPE = bjcTotalPE + bigcTotalPE;

            // Calculate average (prevent division by zero)
            decimal avgPEPerHC = totalHC > 0 ? totalPE / totalHC : 0;

            var result = new KpiOverviewDto
            {
                TotalHC = totalHC,
                TotalPE = totalPE,
                AvgPEPerHC = avgPEPerHC,
                ActiveHC = bjcActiveHC + bigcActiveHC,
                NewJoinHC = bjcNewJoinHC + bigcNewJoinHC,
                OnProcessHC = bjcOnProcessHC + bigcOnProcessHC,
                VacancyHC = bjcVacancyHC + bigcVacancyHC
            };

            _logger.LogInformation("KPI Overview: Year={Year}, Company={Company}, TotalHC={HC}, TotalPE={PE}",
                year, companyId ?? 0, totalHC, totalPE);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetKpiOverview");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// API Endpoint 2: Get PE by Division (Block B - Horizontal Bar Chart)
    /// Reference: Section 4.8, Section 9.8.2
    /// </summary>
    /// <param name="companyId">Company ID filter (1=BJC, 2=Big C, null=Both)</param>
    /// <param name="budgetYear">Budget Year filter (e.g., 2025)</param>
    /// <returns>List of divisions with HC and PE metrics, sorted by PE descending</returns>
    [HttpGet("pe-by-division")]
    public async Task<ActionResult<List<PEByDivisionDto>>> GetPEByDivision(
        [FromQuery] int? companyId = null,
        [FromQuery] int? budgetYear = null)
    {
        try
        {
            // 🔒 Company Access Check
            var allowedIds = await GetUserAllowedCompanyIdsAsync();
            if (!allowedIds.Any())
            {
                _logger.LogWarning("GetPEByDivision: User has no CompanyAccess");
                return Ok(new List<PEByDivisionDto>());
            }

            if (companyId.HasValue && !allowedIds.Contains(companyId.Value))
            {
                _logger.LogWarning("GetPEByDivision: User not allowed to access CompanyId={CompanyId}", companyId);
                return Ok(new List<PEByDivisionDto>());
            }

            int year = budgetYear ?? DateTime.Now.Year;
            var validStatuses = new[] { "Active", "Vacancy", "New Join", "On Process" };

            var bjcData = new List<dynamic>();
            var bigcData = new List<dynamic>();

            // Query BJC - only if user has BJC access
            if (allowedIds.Contains(1) && (!companyId.HasValue || companyId.Value == 1))
            {
                bjcData = (await _context.HRB_BUDGET_BJC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .GroupBy(b => b.Division ?? "Unassigned")
                    .Select(g => new
                    {
                        Division = g.Key,
                        TotalHC = g.Count(),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Query Big C - only if user has BIGC access
            if (allowedIds.Contains(2) && (!companyId.HasValue || companyId.Value == 2))
            {
                bigcData = (await _context.HRB_BUDGET_BIGC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .GroupBy(b => b.Division ?? "Unassigned")
                    .Select(g => new
                    {
                        Division = g.Key,
                        TotalHC = g.Count(),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Combine and aggregate by Division
            var combined = bjcData.Concat(bigcData)
                .GroupBy(x => (string)x.Division)
                .Select(g => new PEByDivisionDto
                {
                    Division = g.Key,
                    TotalHC = g.Sum(x => (int)x.TotalHC),
                    TotalPE = g.Sum(x => (decimal)x.TotalPE),
                    AvgPEPerHC = g.Sum(x => (int)x.TotalHC) > 0
                        ? g.Sum(x => (decimal)x.TotalPE) / g.Sum(x => (int)x.TotalHC)
                        : 0
                })
                .OrderByDescending(x => x.TotalPE)
                .ToList();

            _logger.LogInformation("PE by Division: Year={Year}, Company={Company}, Divisions={Count}",
                year, companyId ?? 0, combined.Count);


            return Ok(combined);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPEByDivision");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// API Endpoint 3: Get PE by COBU/Format (Block C - Horizontal Bar Chart)
    /// Reference: Section 5.8, Section 9.8.3
    /// </summary>
    /// <param name="companyId">Company ID filter (1=BJC, 2=Big C, null=Both)</param>
    /// <param name="budgetYear">Budget Year filter (e.g., 2025)</param>
    /// <returns>List of COBU/Formats with HC and PE metrics, sorted by PE descending</returns>
    [HttpGet("pe-by-cobu")]
    public async Task<ActionResult<List<PEByCobuDto>>> GetPEByCobu(
        [FromQuery] int? companyId = null,
        [FromQuery] int? budgetYear = null)
    {
        try
        {
            // 🔒 Company Access Check
            var allowedIds = await GetUserAllowedCompanyIdsAsync();
            if (!allowedIds.Any())
            {
                _logger.LogWarning("GetPEByCobu: User has no CompanyAccess");
                return Ok(new List<PEByCobuDto>());
            }

            if (companyId.HasValue && !allowedIds.Contains(companyId.Value))
            {
                _logger.LogWarning("GetPEByCobu: User not allowed to access CompanyId={CompanyId}", companyId);
                return Ok(new List<PEByCobuDto>());
            }

            int year = budgetYear ?? DateTime.Now.Year;
            var validStatuses = new[] { "Active", "Vacancy", "New Join", "On Process" };

            var bjcData = new List<dynamic>();
            var bigcData = new List<dynamic>();

            // Query BJC - only if user has BJC access
            if (allowedIds.Contains(1) && (!companyId.HasValue || companyId.Value == 1))
            {
                bjcData = (await _context.HRB_BUDGET_BJC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .GroupBy(b => b.Cobu ?? "Unassigned")
                    .Select(g => new
                    {
                        Cobu = g.Key,
                        TotalHC = g.Count(),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Query Big C - only if user has BIGC access
            if (allowedIds.Contains(2) && (!companyId.HasValue || companyId.Value == 2))
            {
                bigcData = (await _context.HRB_BUDGET_BIGC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .GroupBy(b => b.Cobu ?? "Unassigned")
                    .Select(g => new
                    {
                        Cobu = g.Key,
                        TotalHC = g.Count(),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Combine and aggregate by COBU
            var combined = bjcData.Concat(bigcData)
                .GroupBy(x => (string)x.Cobu)
                .Select(g => new PEByCobuDto
                {
                    Cobu = g.Key,
                    TotalHC = g.Sum(x => (int)x.TotalHC),
                    TotalPE = g.Sum(x => (decimal)x.TotalPE),
                    AvgPEPerHC = g.Sum(x => (int)x.TotalHC) > 0
                        ? g.Sum(x => (decimal)x.TotalPE) / g.Sum(x => (int)x.TotalHC)
                        : 0
                })
                .OrderByDescending(x => x.TotalPE)
                .ToList();

            _logger.LogInformation("PE by COBU: Year={Year}, Company={Company}, COBUs={Count}",
                year, companyId ?? 0, combined.Count);

            return Ok(combined);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPEByCobu");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    /// <summary>
    /// API Endpoint 4: Get Cost Centers (Block D - Data Table with Pagination)
    /// Reference: Section 6.8, Section 9.8.4
    /// </summary>
    /// <param name="companyId">Company ID filter (1=BJC, 2=Big C, null=Both)</param>
    /// <param name="budgetYear">Budget Year filter (e.g., 2025)</param>
    /// <param name="divisionFilter">Division filter (from Block B chart click)</param>
    /// <param name="cobuFilter">COBU filter (from Block C chart click)</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of records per page (20, 50, 100, or 0 for all)</param>
    /// <param name="sortBy">Sort column (default: totalPE)</param>
    /// <param name="sortOrder">Sort direction (asc or desc)</param>
    /// <returns>Paged list of cost centers with ranking and metrics</returns>
    [HttpGet("cost-centers")]
    public async Task<ActionResult<CostCenterPagedResultDto>> GetCostCenters(
        [FromQuery] int? companyId = null,
        [FromQuery] int? budgetYear = null,
        [FromQuery] string? divisionFilter = null,
        [FromQuery] string? cobuFilter = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "totalPE",
        [FromQuery] string sortOrder = "desc")
    {
        try
        {
            // 🔒 Company Access Check
            var allowedIds = await GetUserAllowedCompanyIdsAsync();
            if (!allowedIds.Any())
            {
                _logger.LogWarning("GetCostCenters: User has no CompanyAccess");
                return Ok(new CostCenterPagedResultDto { Data = new List<CostCenterSummaryDto>(), TotalRecords = 0, Page = page, PageSize = pageSize });
            }

            if (companyId.HasValue && !allowedIds.Contains(companyId.Value))
            {
                _logger.LogWarning("GetCostCenters: User not allowed to access CompanyId={CompanyId}", companyId);
                return Ok(new CostCenterPagedResultDto { Data = new List<CostCenterSummaryDto>(), TotalRecords = 0, Page = page, PageSize = pageSize });
            }

            int year = budgetYear ?? DateTime.Now.Year;
            var validStatuses = new[] { "Active", "Vacancy", "New Join", "On Process" };

            var bjcData = new List<dynamic>();
            var bigcData = new List<dynamic>();

            // Query BJC - only if user has BJC access
            if (allowedIds.Contains(1) && (!companyId.HasValue || companyId.Value == 1))
            {
                bjcData = (await _context.HRB_BUDGET_BJC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .Where(b => string.IsNullOrEmpty(divisionFilter) || b.Division == divisionFilter)
                    .Where(b => string.IsNullOrEmpty(cobuFilter) || b.Cobu == cobuFilter)
                    .GroupBy(b => b.CostCenterCode)
                    .Select(g => new
                    {
                        CostCenterCode = g.Key,
                        CostCenterName = g.Max(b => b.CostCenterName),
                        Division = g.Max(b => b.Division),
                        Cobu = g.Max(b => b.Cobu),
                        TotalHC = g.Count(),
                        ActiveHC = g.Count(b => b.EmpStatus == "Active"),
                        VacancyHC = g.Count(b => b.EmpStatus == "Vacancy"),
                        NewJoinHC = g.Count(b => b.EmpStatus == "New Join"),
                        OnProcessHC = g.Count(b => b.EmpStatus == "On Process"),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Query Big C - only if user has BIGC access
            if (allowedIds.Contains(2) && (!companyId.HasValue || companyId.Value == 2))
            {
                bigcData = (await _context.HRB_BUDGET_BIGC
                    .Where(b => b.BudgetYear == year && validStatuses.Contains(b.EmpStatus))
                    .Where(b => string.IsNullOrEmpty(divisionFilter) || b.Division == divisionFilter)
                    .Where(b => string.IsNullOrEmpty(cobuFilter) || b.Cobu == cobuFilter)
                    .GroupBy(b => b.CostCenterCode)
                    .Select(g => new
                    {
                        CostCenterCode = g.Key,
                        CostCenterName = g.Max(b => b.CostCenterName),
                        Division = g.Max(b => b.Division),
                        Cobu = g.Max(b => b.Cobu),
                        TotalHC = g.Count(),
                        ActiveHC = g.Count(b => b.EmpStatus == "Active"),
                        VacancyHC = g.Count(b => b.EmpStatus == "Vacancy"),
                        NewJoinHC = g.Count(b => b.EmpStatus == "New Join"),
                        OnProcessHC = g.Count(b => b.EmpStatus == "On Process"),
                        TotalPE = g.Sum(b => b.PeYear ?? 0)
                    })
                    .ToListAsync()).Cast<dynamic>().ToList();
            }

            // Combine and aggregate by Cost Center
            var combined = bjcData.Concat(bigcData)
                .GroupBy(x => (string)x.CostCenterCode)
                .Select(g => new
                {
                    CostCenterCode = g.Key,
                    CostCenterName = (string)g.First().CostCenterName,
                    Division = (string?)g.First().Division,
                    Cobu = (string?)g.First().Cobu,
                    TotalHC = g.Sum(x => (int)x.TotalHC),
                    ActiveHC = g.Sum(x => (int)x.ActiveHC),
                    VacancyHC = g.Sum(x => (int)x.VacancyHC),
                    NewJoinHC = g.Sum(x => (int)x.NewJoinHC),
                    OnProcessHC = g.Sum(x => (int)x.OnProcessHC),
                    TotalPE = g.Sum(x => (decimal)x.TotalPE),
                    AvgPEPerHC = g.Sum(x => (int)x.TotalHC) > 0
                        ? g.Sum(x => (decimal)x.TotalPE) / g.Sum(x => (int)x.TotalHC)
                        : 0m
                })
                .ToList();

            // Calculate total PE for percentage calculation
            decimal totalPESum = combined.Sum(x => x.TotalPE);

            // Sort
            var sorted = sortBy.ToLower() switch
            {
                "costcentercode" => sortOrder == "asc"
                    ? combined.OrderBy(x => x.CostCenterCode)
                    : combined.OrderByDescending(x => x.CostCenterCode),
                "totalhc" => sortOrder == "asc"
                    ? combined.OrderBy(x => x.TotalHC)
                    : combined.OrderByDescending(x => x.TotalHC),
                "totalpe" => sortOrder == "asc"
                    ? combined.OrderBy(x => x.TotalPE)
                    : combined.OrderByDescending(x => x.TotalPE),
                _ => combined.OrderByDescending(x => x.TotalPE)
            };

            var sortedList = sorted.ToList();

            // Add ranking
            var ranked = sortedList.Select((item, index) => new CostCenterSummaryDto
            {
                Rank = index + 1,
                CostCenterCode = item.CostCenterCode,
                CostCenterName = item.CostCenterName,
                Division = item.Division,
                Cobu = item.Cobu,
                TotalHC = item.TotalHC,
                ActiveHC = item.ActiveHC,
                VacancyHC = item.VacancyHC,
                NewJoinHC = item.NewJoinHC,
                OnProcessHC = item.OnProcessHC,
                TotalPE = item.TotalPE,
                AvgPEPerHC = item.AvgPEPerHC,
                PercentOfTotal = totalPESum > 0 ? (item.TotalPE / totalPESum) * 100 : 0
            }).ToList();

            // Pagination
            int totalRecords = ranked.Count;
            var pagedData = pageSize > 0
                ? ranked.Skip((page - 1) * pageSize).Take(pageSize).ToList()
                : ranked; // pageSize = 0 means "All"

            var result = new CostCenterPagedResultDto
            {
                Data = pagedData,
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };

            _logger.LogInformation("Cost Centers: Year={Year}, Company={Company}, Total={Total}, Page={Page}/{PageSize}",
                year, companyId ?? 0, totalRecords, page, pageSize);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetCostCenters");
            return StatusCode(500, new { error = "Internal server error", message = ex.Message });
        }
    }

    // ============================================================================
    // EXISTING: PE Bonus By Cost Center API Endpoints (Stored Procedures)
    // ============================================================================

    /// <summary>
    /// Get PE Bonus Summary Data by Cost Center
    /// Calls different Stored Procedures based on Company ID:
    /// - Company ID = 2 (BIG C): SP_REP_HC_PE_BY_COSTCENTER
    /// - Company ID = 1 (BJC): SP_REP_HC_PE_BY_COSTCENTER_BJC
    /// </summary>
    /// <param name="filters">Filter criteria (Company, Year, COBU, Cost Center)</param>
    /// <returns>List of Cost Center Summary Data (67 columns)</returns>
    [HttpPost("GetPEBonusByCostCenter")]
    public async Task<IActionResult> GetPEBonusByCostCenter([FromBody] BudgetPEBonusFilterDto filters)
    {
      try
      {
        // 🔒 Company Access Check
        var allowedIds = await GetUserAllowedCompanyIdsAsync();
        if (!allowedIds.Any())
        {
          _logger.LogWarning("GetPEBonusByCostCenter: User has no CompanyAccess");
          return Ok(new List<BudgetPEBonusDataDto>());
        }

        // Validate required filters
        if (filters.CompanyId <= 0)
        {
          return BadRequest(new { error = "Company ID is required" });
        }

        // 🔒 Check if user is allowed to access requested company
        if (!allowedIds.Contains(filters.CompanyId))
        {
          _logger.LogWarning("GetPEBonusByCostCenter: User not allowed to access CompanyId={CompanyId}", filters.CompanyId);
          return Ok(new List<BudgetPEBonusDataDto>());
        }

        if (filters.BudgetYear <= 0)
        {
          return BadRequest(new { error = "Budget Year is required" });
        }

        _logger.LogInformation(
          "GetPEBonusByCostCenter called with CompanyId={CompanyId}, BudgetYear={BudgetYear}, CobuFormat={CobuFormat}, CostCenter={CostCenter}",
          filters.CompanyId, filters.BudgetYear, filters.CobuFormat, filters.CostCenterCode);

        // Calculate dynamic year ranges based on Budget Year
        int budgetYear = filters.BudgetYear;
        int prevBudgetYear = budgetYear - 1;                     // e.g., 2026 → 2025
        int historicalYearCount = 6;                             // Fixed: 6 years of historical data
        int historicalYearTo = prevBudgetYear;                   // e.g., 2026 → 2025
        int historicalYearFrom = historicalYearTo - historicalYearCount; // e.g., 2025 - 6 = 2019

        _logger.LogInformation(
          "Dynamic Year Calculation: BudgetYear={BudgetYear}, PrevBudgetYear={PrevBudgetYear}, HistoricalRange={From}-{To}",
          budgetYear, prevBudgetYear, historicalYearFrom, historicalYearTo);

        // Determine which Stored Procedure to call based on Company ID
        string storedProcedureName = filters.CompanyId == 2
          ? "SP_REP_HC_PE_BY_COSTCENTER"      // BIG C
          : "SP_REP_HC_PE_BY_COSTCENTER_BJC"; // BJC

        using (var connection = new SqlConnection(_connectionString))
        {
          await connection.OpenAsync();

          var parameters = new DynamicParameters();
          parameters.Add("@YearBudget", budgetYear, DbType.Int32);
          parameters.Add("@YearFrom", historicalYearFrom, DbType.Int32);  // Dynamic!
          parameters.Add("@YearTo", historicalYearTo, DbType.Int32);      // Dynamic!
          parameters.Add("@CompanyId", filters.CompanyId, DbType.Int32);
          parameters.Add("@CostCenterLike", null, DbType.String); // Always NULL (not used for filtering)

          _logger.LogInformation(
            "Executing Stored Procedure: {SpName} with parameters: YearBudget={YearBudget}, YearFrom={YearFrom}, YearTo={YearTo}, CompanyId={CompanyId}",
            storedProcedureName, budgetYear, historicalYearFrom, historicalYearTo, filters.CompanyId);

          var results = await connection.QueryAsync<BudgetPEBonusDataDto>(
            storedProcedureName,
            parameters,
            commandType: CommandType.StoredProcedure,
            commandTimeout: 120 // 2 minutes timeout for large datasets
          );

          var resultList = results.ToList();

          // Apply client-side filtering if COBU/Format or Cost Center specified
          if (!string.IsNullOrWhiteSpace(filters.CobuFormat))
          {
            resultList = resultList
              .Where(x => x.COBU != null && x.COBU.Contains(filters.CobuFormat, StringComparison.OrdinalIgnoreCase))
              .ToList();
          }

          if (!string.IsNullOrWhiteSpace(filters.CostCenterCode))
          {
            resultList = resultList
              .Where(x => x.COST_CENTER != null && x.COST_CENTER.Contains(filters.CostCenterCode, StringComparison.OrdinalIgnoreCase))
              .ToList();
          }

          _logger.LogInformation(
            "Stored Procedure {SpName} returned {Count} records (after filtering)",
            storedProcedureName, resultList.Count);

          return Ok(resultList);
        }
      }
      catch (SqlException ex)
      {
        _logger.LogError(ex, "SQL Error in GetPEBonusByCostCenter: {Message}", ex.Message);
        return StatusCode(500, new
        {
          error = "Database error occurred",
          message = ex.Message,
          sqlError = ex.Number
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in GetPEBonusByCostCenter: {Message}", ex.Message);
        return StatusCode(500, new
        {
          error = "An error occurred while fetching data",
          message = ex.Message
        });
      }
    }

    /// <summary>
    /// Calculate Grand Total for PE Bonus By Cost Center
    /// Sums all numeric columns from the result set
    /// </summary>
    /// <param name="filters">Same filter criteria as GetPEBonusByCostCenter</param>
    /// <returns>Grand Total row with summed values</returns>
    [HttpPost("GetPEBonusByCostCenterGrandTotal")]
    public async Task<IActionResult> GetPEBonusByCostCenterGrandTotal([FromBody] BudgetPEBonusFilterDto filters)
    {
      try
      {
        // Reuse GetPEBonusByCostCenter to get data
        var dataResult = await GetPEBonusByCostCenter(filters);

        if (dataResult is not OkObjectResult okResult)
        {
          return dataResult; // Return error if occurred
        }

        var data = okResult.Value as List<BudgetPEBonusDataDto>;
        if (data == null || !data.Any())
        {
          return Ok(new BudgetPEBonusDataDto
          {
            BU_HEAD_SUP = "GRAND TOTAL",
            BU_HEAD = "",
            DEPARTMENT = "",
            COST_CENTER = "",
            COST_CENTER_NAME_HR = "No Data"
          });
        }

        // Calculate dynamic year ranges based on Budget Year
        int budgetYear = filters.BudgetYear;
        int prevBudgetYear = budgetYear - 1;                     // e.g., 2026 → 2025
        int historicalYearCount = 6;                             // Fixed: 6 years of historical data
        int historicalYearTo = prevBudgetYear;                   // e.g., 2026 → 2025
        int historicalYearFrom = historicalYearTo - historicalYearCount; // e.g., 2025 - 6 = 2019

        _logger.LogInformation(
          "Grand Total Year Calculation: BudgetYear={BudgetYear}, PrevBudgetYear={PrevBudgetYear}, HistoricalRange={From}-{To}",
          budgetYear, prevBudgetYear, historicalYearFrom, historicalYearTo);

        // Calculate Grand Total by summing all numeric properties (using Reflection for dynamic years)
        var grandTotal = new BudgetPEBonusDataDto
        {
          BU_HEAD_SUP = "GRAND TOTAL",
          BU_HEAD = "",
          BU = "",
          COBU = "",
          DEPARTMENT = "",
          COST_CENTER = "",
          COST_CENTER_NAME_HR = "",
          COST_CENTER_NAME_FAD = "",
          GROUPING = "",
          HRBP = ""
        };

        var dtoType = typeof(BudgetPEBonusDataDto);

        // Sum Historical Data dynamically (6 years)
        for (int year = historicalYearFrom; year <= historicalYearTo; year++)
        {
          var ftProperty = dtoType.GetProperty($"ACTUAL_FT_{year}");
          var ctProperty = dtoType.GetProperty($"ACTUAL_CT_{year}");
          var peProperty = dtoType.GetProperty($"ACTUAL_PE_{year}");

          if (ftProperty != null)
            ftProperty.SetValue(grandTotal, data.Sum(x => (decimal?)(ftProperty.GetValue(x)) ?? 0));

          if (ctProperty != null)
            ctProperty.SetValue(grandTotal, data.Sum(x => (decimal?)(ctProperty.GetValue(x)) ?? 0));

          if (peProperty != null)
            peProperty.SetValue(grandTotal, data.Sum(x => (decimal?)(peProperty.GetValue(x)) ?? 0));
        }

        // Sum Budget Year dynamically (prevBudgetYear)
        var budgetFtProp = dtoType.GetProperty($"BUDGET_FT_{prevBudgetYear}");
        var budgetCtProp = dtoType.GetProperty($"BUDGET_CT_{prevBudgetYear}");
        var currentPeProp = dtoType.GetProperty($"CURRENT_PE_{prevBudgetYear}");
        var currentPeBonusProp = dtoType.GetProperty($"CURRENT_PE_BONUS_{prevBudgetYear}");

        if (budgetFtProp != null)
          budgetFtProp.SetValue(grandTotal, data.Sum(x => (decimal?)(budgetFtProp.GetValue(x)) ?? 0));

        if (budgetCtProp != null)
          budgetCtProp.SetValue(grandTotal, data.Sum(x => (decimal?)(budgetCtProp.GetValue(x)) ?? 0));

        if (currentPeProp != null)
          currentPeProp.SetValue(grandTotal, data.Sum(x => (decimal?)(currentPeProp.GetValue(x)) ?? 0));

        if (currentPeBonusProp != null)
          currentPeBonusProp.SetValue(grandTotal, data.Sum(x => (decimal?)(currentPeBonusProp.GetValue(x)) ?? 0));

        // Sum Legal Entity & Company sections (no year suffix - static properties)
        grandTotal.ACTIVE_FT_LE = data.Sum(x => x.ACTIVE_FT_LE ?? 0);
        grandTotal.ACTIVE_CT_LE = data.Sum(x => x.ACTIVE_CT_LE ?? 0);
        grandTotal.ACTIVE_PE_LE = data.Sum(x => x.ACTIVE_PE_LE ?? 0);
        grandTotal.VAC_FT_LE = data.Sum(x => x.VAC_FT_LE ?? 0);
        grandTotal.VAC_CT_LE = data.Sum(x => x.VAC_CT_LE ?? 0);
        grandTotal.VAC_PE_LE = data.Sum(x => x.VAC_PE_LE ?? 0);
        grandTotal.NEW_FT_LE = data.Sum(x => x.NEW_FT_LE ?? 0);
        grandTotal.NEW_CT_LE = data.Sum(x => x.NEW_CT_LE ?? 0);
        grandTotal.NEW_PE_LE = data.Sum(x => x.NEW_PE_LE ?? 0);
        grandTotal.SUM_FT_LE = data.Sum(x => x.SUM_FT_LE ?? 0);
        grandTotal.SUM_CT_LE = data.Sum(x => x.SUM_CT_LE ?? 0);
        grandTotal.SUM_PE_LE = data.Sum(x => x.SUM_PE_LE ?? 0);
        grandTotal.OT_LE = data.Sum(x => x.OT_LE ?? 0);
        grandTotal.EB_LE = data.Sum(x => x.EB_LE ?? 0);
        grandTotal.SUM_PE_OTEB_LE = data.Sum(x => x.SUM_PE_OTEB_LE ?? 0);
        grandTotal.SUM_PE_OTOTH_LE = data.Sum(x => x.SUM_PE_OTOTH_LE ?? 0);

        grandTotal.ACTIVE_FT = data.Sum(x => x.ACTIVE_FT ?? 0);
        grandTotal.ACTIVE_CT = data.Sum(x => x.ACTIVE_CT ?? 0);
        grandTotal.ACTIVE_PE = data.Sum(x => x.ACTIVE_PE ?? 0);
        grandTotal.VAC_FT = data.Sum(x => x.VAC_FT ?? 0);
        grandTotal.VAC_CT = data.Sum(x => x.VAC_CT ?? 0);
        grandTotal.VAC_PE = data.Sum(x => x.VAC_PE ?? 0);
        grandTotal.NEW_FT = data.Sum(x => x.NEW_FT ?? 0);
        grandTotal.NEW_CT = data.Sum(x => x.NEW_CT ?? 0);
        grandTotal.NEW_PE = data.Sum(x => x.NEW_PE ?? 0);
        grandTotal.SUM_FT = data.Sum(x => x.SUM_FT ?? 0);
        grandTotal.SUM_CT = data.Sum(x => x.SUM_CT ?? 0);
        grandTotal.SUM_PE = data.Sum(x => x.SUM_PE ?? 0);
        grandTotal.OT = data.Sum(x => x.OT ?? 0);
        grandTotal.EB = data.Sum(x => x.EB ?? 0);
        grandTotal.SUM_PE_OTEB = data.Sum(x => x.SUM_PE_OTEB ?? 0);
        grandTotal.SUM_PE_OTOTH = data.Sum(x => x.SUM_PE_OTOTH ?? 0);



        _logger.LogInformation("Grand Total calculated for {Count} cost centers", data.Count);

        return Ok(grandTotal);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in GetPEBonusByCostCenterGrandTotal: {Message}", ex.Message);
        return StatusCode(500, new
        {
          error = "An error occurred while calculating grand total",
          message = ex.Message
        });
      }
    }

    /// <summary>
    /// Health check endpoint for Summary Controller
    /// </summary>
    [HttpGet("Health")]
    public IActionResult Health()
    {
      return Ok(new
      {
        controller = "SummaryController",
        status = "Healthy",
        timestamp = DateTime.Now,
        endpoints = new[]
        {
          "POST /api/Summary/GetPEBonusByCostCenter",
          "POST /api/Summary/GetPEBonusByCostCenterGrandTotal",
          "GET /api/Summary/Health"
        }
      });
    }

    /// <summary>
    /// Get PE HeadCount Summary Data by Grouping
    /// Calls Stored Procedure: SP_REP_HC_PE_BY_GROUPING
    /// </summary>
    /// <param name="filters">Filter criteria (Company, Year, COBU, Cost Center)</param>
    /// <returns>List of PE HeadCount Summary Data</returns>
    [HttpPost("GetPEHeadCountByGrouping")]
    public async Task<IActionResult> GetPEHeadCountByGrouping([FromBody] BudgetPEBonusFilterDto filters)
    {
      try
      {
        // 🔒 Company Access Check
        var allowedIds = await GetUserAllowedCompanyIdsAsync();
        if (!allowedIds.Any())
        {
          _logger.LogWarning("GetPEHeadCountByGrouping: User has no CompanyAccess");
          return Ok(new List<BudgetPEHeadCountDataDto>());
        }

        // Validate required filters
        if (filters.CompanyId <= 0)
        {
          return BadRequest(new { error = "Company ID is required" });
        }

        // 🔒 Check if user is allowed to access requested company
        if (!allowedIds.Contains(filters.CompanyId))
        {
          _logger.LogWarning("GetPEHeadCountByGrouping: User not allowed to access CompanyId={CompanyId}", filters.CompanyId);
          return Ok(new List<BudgetPEHeadCountDataDto>());
        }

        if (filters.BudgetYear <= 0)
        {
          return BadRequest(new { error = "Budget Year is required" });
        }

        _logger.LogInformation(
          "GetPEHeadCountByGrouping called with CompanyId={CompanyId}, BudgetYear={BudgetYear}, CobuFormat={CobuFormat}, CostCenter={CostCenter}",
          filters.CompanyId, filters.BudgetYear, filters.CobuFormat, filters.CostCenterCode);

        // Calculate dynamic year ranges based on Budget Year
        int budgetYear = filters.BudgetYear;
        int prevBudgetYear = budgetYear - 1;                     // e.g., 2026 → 2025
        int historicalYearCount = 6;                             // Fixed: 6 years of historical data
        int historicalYearTo = prevBudgetYear;                   // e.g., 2026 → 2025
        int historicalYearFrom = historicalYearTo - historicalYearCount; // e.g., 2025 - 6 = 2019

        _logger.LogInformation(
          "Dynamic Year Calculation: BudgetYear={BudgetYear}, PrevBudgetYear={PrevBudgetYear}, HistoricalRange={From}-{To}",
          budgetYear, prevBudgetYear, historicalYearFrom, historicalYearTo);

        string storedProcedureName = "SP_REP_HC_PE_BY_GROUPING";

        using (var connection = new SqlConnection(_connectionString))
        {
          await connection.OpenAsync();

          var parameters = new DynamicParameters();
          parameters.Add("@YearBudget", budgetYear, DbType.Int32);
          parameters.Add("@YearFrom", historicalYearFrom, DbType.Int32);
          parameters.Add("@YearTo", historicalYearTo, DbType.Int32);
          parameters.Add("@CompanyId", filters.CompanyId, DbType.Int32);
          parameters.Add("@CostCenterLike", null, DbType.String); // Always NULL as per spec

          _logger.LogInformation(
            "Executing Stored Procedure: {SpName} with parameters: YearBudget={YearBudget}, YearFrom={YearFrom}, YearTo={YearTo}, CompanyId={CompanyId}",
            storedProcedureName, budgetYear, historicalYearFrom, historicalYearTo, filters.CompanyId);

          var results = await connection.QueryAsync<BudgetPEHeadCountDataDto>(
            storedProcedureName,
            parameters,
            commandType: CommandType.StoredProcedure,
            commandTimeout: 120
          );

          var resultList = results.ToList();

          // Apply client-side filtering if needed (though SP might handle some)
          if (!string.IsNullOrWhiteSpace(filters.CobuFormat))
          {
            // Note: SP_REP_HC_PE_BY_GROUPING doesn't return COBU column directly in the main select list provided in MD
            // Assuming filtering might need to happen on client side or SP needs adjustment if COBU is required for filtering
            // For now, we skip COBU filtering here unless the DTO has COBU property populated
          }

          if (!string.IsNullOrWhiteSpace(filters.CostCenterCode))
          {
             resultList = resultList
              .Where(x => x.COST_CENTER != null && x.COST_CENTER.Contains(filters.CostCenterCode, StringComparison.OrdinalIgnoreCase))
              .ToList();
          }

          _logger.LogInformation(
            "Stored Procedure {SpName} returned {Count} records",
            storedProcedureName, resultList.Count);

          return Ok(resultList);
        }
      }
      catch (SqlException ex)
      {
        _logger.LogError(ex, "SQL Error in GetPEHeadCountByGrouping: {Message}", ex.Message);
        return StatusCode(500, new
        {
          error = "Database error occurred",
          message = ex.Message,
          sqlError = ex.Number
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in GetPEHeadCountByGrouping: {Message}", ex.Message);
        return StatusCode(500, new
        {
          error = "An error occurred while fetching data",
          message = ex.Message
        });
      }
    }
  }
}
