using Microsoft.AspNetCore.Mvc;
using HCBPCoreUI_Backend.Models.Master;
using HCBPCoreUI_Backend.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using HCBPCoreUI_Backend.Services;

namespace HCBPCoreUI_Backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class SelectController : Controller
  {
    private readonly ISelectService _service;
    private readonly HRBudgetDbContext _context;

    public SelectController(ISelectService service, HRBudgetDbContext context)
    {
      _service = service;
      _context = context;
    }

    [HttpGet("companies")]
    public async Task<IActionResult> GetActiveCompanies()
    {
      try
      {
        // ═══════════════════════════════════════════════════════════
        // 🔒 FILTER BY USER COMPANY ACCESS (Option C)
        // ═══════════════════════════════════════════════════════════
        var empCode = HttpContext.Session.GetString("EmployeeNo");

        if (!string.IsNullOrEmpty(empCode))
        {
          // ดึง CompanyAccess จาก HRB_USER
          var user = await _context.HRB_USER
              .AsNoTracking()
              .FirstOrDefaultAsync(u => u.EmpCode == empCode && u.IsActive);

          if (user != null && !string.IsNullOrEmpty(user.CompanyAccess))
          {
            var companies = await _service.GetActiveCompaniesByAccessAsync(user.CompanyAccess);
            return Ok(companies ?? new List<object>());
          }
        }

        // Fallback: ถ้าไม่มี session หรือไม่มี CompanyAccess → return empty (security)
        return Ok(new List<object>());
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, new { success = false, message = ex.InnerException?.Message ?? "Internal server error" });
      }
    }

    [HttpGet]
    [Route("costcenters")]
    public async Task<IActionResult> GetActiveCostCenters([FromQuery] int? companyId)
    {
      try
      {
        // If companyId is provided, filter by company
        if (companyId.HasValue && companyId.Value > 0)
        {
          var costCenters = await _service.GetActiveCostCentersAsync(companyId.Value);
          return Ok(new { success = true, data = costCenters ?? new List<object>() });
        }

        // If no companyId, return all active cost centers
        var allCostCenters = await _service.GetAllActiveCostCentersAsync();
        return Ok(new { success = true, data = allCostCenters ?? new List<object>() });
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, new { success = false, message = ex.InnerException?.Message ?? "Internal server error" });
      }
    }

    [HttpGet]
    [Route("Positions")]
    public async Task<IActionResult> GetActivePositions([FromQuery] int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var positions = await _service.GetActivePositionsAsync(companyId);
        if (positions == null || !positions.Any())
          return NotFound();
        return Ok(positions);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("jobbands")]
    public async Task<IActionResult> GetActiveJobBands([FromQuery] int companyId, [FromQuery] string? positionCode)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var jobBands = await _service.GetActiveJobBandsAsync(companyId, positionCode);
        if (jobBands == null || !jobBands.Any())
          return NotFound();
        return Ok(jobBands);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("statuses")]
    public async Task<IActionResult> GetActiveStatuses([FromQuery] int companyId, [FromQuery] string? statusType)
    {
      // ✅ Allow empty string or null for statusType (SA requirement)
      if (companyId <= 0)
      {
        return BadRequest("companyId is required");
      }

      try
      {
        // Pass statusType as-is (can be null or empty string)
        var statuses = await _service.GetActiveStatusesAsync(companyId, statusType ?? string.Empty);

        return Ok(statuses);
      }
      catch (Exception ex)
      {
        // Console.WriteLine($"❌ Error in GetActiveStatuses: {ex.Message}");
        return StatusCode(500, ex.Message);
      }
    }

    [HttpGet]
    [Route("employeetypes")]
    public async Task<IActionResult> GetBudgetEmployeeTypes([FromQuery] int companyId)
    {
      try
      {
        if (companyId <= 0)
          return BadRequest("Invalid companyId");
        var employeeTypes = await _service.GetBudgetEmployeeTypesAsync(companyId);
        if (employeeTypes == null || !employeeTypes.Any())
          return NotFound();
        return Ok(employeeTypes);
      }
      catch (Exception ex)
      {
        // Detailed error logging
        var errorMessage = $"Error in GetBudgetEmployeeTypes: {ex.Message}";
        if (ex.InnerException != null)
        {
          errorMessage += $" Inner: {ex.InnerException.Message}";
        }
        errorMessage += $" StackTrace: {ex.StackTrace}";

        return StatusCode(500, new { error = errorMessage, companyId = companyId });
      }
    }

    [HttpGet]
    [Route("empprefixes")]
    public async Task<IActionResult> GetEmployeePrefixes(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var employeePrefixes = await _service.GetEmployeePrefixesAsync(companyId);
        if (employeePrefixes == null || !employeePrefixes.Any())
          return NotFound();
        return Ok(employeePrefixes);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("newhc")]
    public async Task<IActionResult> GetBudgetNewHC(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var newHCItems = await _service.GetBudgetNewHCAsync(companyId);
        if (newHCItems == null || !newHCItems.Any())
          return NotFound();
        return Ok(newHCItems);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("lenewperiods")]
    public async Task<IActionResult> GetBudgetLENewPeriods(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var newPeriods = await _service.GetBudgetLENewPeriodsAsync(companyId);
        if (newPeriods == null || !newPeriods.Any())
          return NotFound();
        return Ok(newPeriods);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("nofmonths")]
    public async Task<IActionResult> GetBudgetNoOfMonths(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var noOfMonths = await _service.GetBudgetNoOfMonthsAsync(companyId);
        if (noOfMonths == null || !noOfMonths.Any())
          return NotFound();
        return Ok(noOfMonths);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("lenofmonths")]
    public async Task<IActionResult> GetBudgetLENoOfMonths(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var leNoOfMonths = await _service.GetBudgetLENoOfMonthsAsync(companyId);
        if (leNoOfMonths == null || !leNoOfMonths.Any())
          return NotFound();
        return Ok(leNoOfMonths);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("joinpvf")]
    public async Task<IActionResult> GetBudgetJoinPVF(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var joinPvfItems = await _service.GetBudgetJoinPVFAsync(companyId);
        if (joinPvfItems == null || !joinPvfItems.Any())
          return NotFound();
        return Ok(joinPvfItems);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("salarystructures")]
    public async Task<IActionResult> GetBudgetSalaryStructures(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var salaryStructures = await _service.GetBudgetSalaryStructuresAsync(companyId);
        if (salaryStructures == null || !salaryStructures.Any())
          return NotFound();
        return Ok(salaryStructures);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("focusHC")]
    public async Task<IActionResult> GetBudgetFocusHC(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var focusHCItems = await _service.GetBudgetFocusHCAsync(companyId);
        if (focusHCItems == null || !focusHCItems.Any())
          return NotFound();
        return Ok(focusHCItems);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("focusPE")]
    public async Task<IActionResult> GetBudgetFocusPE(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var focusPEItems = await _service.GetBudgetFocusPEAsync(companyId);
        if (focusPEItems == null || !focusPEItems.Any())
          return NotFound();
        return Ok(focusPEItems);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("executives")]
    public async Task<IActionResult> GetBudgetExecutives(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var executives = await _service.GetBudgetExecutivesAsync(companyId);
        if (executives == null || !executives.Any())
          return NotFound();
        return Ok(executives);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("salaryranges")]
    public async Task<IActionResult> GetBudgetSalaryRanges([FromQuery] int companyId, [FromQuery] string? jobBand)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var salaryRanges = await _service.GetBudgetSalaryRangesAsync(companyId, jobBand);
        if (salaryRanges == null || !salaryRanges.Any())
          return NotFound();
        return Ok(salaryRanges);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet("budget-merit-percentages")]
    public async Task<IActionResult> GetBudgetMeritPercentages(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var meritPercentages = await _service.GetBudgetMeritPercentagesAsync(companyId);
        if (meritPercentages == null || !meritPercentages.Any())
          return NotFound();
        return Ok(meritPercentages);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet("budget-discount-pf-percentages")]
    public async Task<IActionResult> GetBudgetDiscountPFPercentages(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var discountPFPercentages = await _service.GetBudgetDiscountPFPercentagesAsync(companyId);
        if (discountPFPercentages == null || !discountPFPercentages.Any())
          return NotFound();
        return Ok(discountPFPercentages);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet("budget-labor-fund-fees")]
    public async Task<IActionResult> GetBudgetLaborFundFees(int companyId)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      try
      {
        var laborFundFees = await _service.GetBudgetLaborFundFeesAsync(companyId);
        if (laborFundFees == null || !laborFundFees.Any())
          return NotFound();
        return Ok(laborFundFees);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("grouprunrates")]
    public async Task<IActionResult> GetBudgetGroupRunRates([FromQuery] int companyId, [FromQuery] string? costCenterCode)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");

      try
      {
        var groupRunRates = await _service.GetBudgetGroupRunRatesAsync(companyId, costCenterCode);
        if (groupRunRates == null || !groupRunRates.Any())
          return NotFound("No group run rates found");
        return Ok(groupRunRates);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new
        {
          error = ex.Message
        });
      }
    }

    [HttpGet]
    [Route("bonustypes")]
    public async Task<IActionResult> GetBudgetBonusTypes([FromQuery] int companyId, [FromQuery] int budgetYear)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      if (budgetYear <= 0)
        return BadRequest("Invalid budgetYear");

      try
      {
        var bonusTypes = await _service.GetBudgetBonusTypesAsync(companyId, budgetYear);
        if (bonusTypes == null || !bonusTypes.Any())
          return NotFound("No bonus types found");
        return Ok(bonusTypes);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("isexecutivebyjobband")]
    public async Task<IActionResult> GetBudgetIsExecutiveByJobBand([FromQuery] int companyId, [FromQuery] string? jobBand)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      if (string.IsNullOrEmpty(jobBand))
        return BadRequest("Invalid jobBand");

      try
      {
        var isExecutive = await _service.GetBudgetIsExecutiveByJobBandAsync(companyId, jobBand);
        return Ok(isExecutive);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }

    [HttpGet]
    [Route("businessunits")]
    public async Task<IActionResult> GetBusinessUnits([FromQuery] int companyId, [FromQuery] string cobuCode)
    {
      if (companyId <= 0)
        return BadRequest("Invalid companyId");
      if (string.IsNullOrEmpty(cobuCode))
        return BadRequest("Invalid cobuCode");

      try
      {
        var businessUnits = await _service.GetBusinessUnitsAsync(companyId, cobuCode);
        if (businessUnits == null || !businessUnits.Any())
          return NotFound("No business units found");
        return Ok(businessUnits);
      }
      catch (Exception ex)
      {
        // Log error here
        return StatusCode(500, ex.InnerException?.Message ?? "Internal server error");
      }
    }
  }
}
