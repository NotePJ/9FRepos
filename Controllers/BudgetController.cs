
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Collections.Generic;
// TODO: Uncomment when JWT Authentication is ready
// using System.Security.Claims;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.DTOs.Budget;
using HCBPCoreUI_Backend.Services;
using HCBPCoreUI_Backend.Attributes;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Budget Controller - API สำหรับจัดการงบประมาณ
    /// ต้องการ Permission: PAGE_BUDGET
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [RequireAuth]
    [RequirePermission("PAGE_BUDGET")]
    public class BudgetController : Controller
    {
    private readonly IBudgetService _budgetService;
    private readonly HRBudgetDbContext _context;

    public BudgetController(IBudgetService budgetService, HRBudgetDbContext context)
    {
      _budgetService = budgetService;
      _context = context;
    }

    // GET: /Budget/GetBudgets
    [HttpGet]
    [Route("B0Budgets")]
    public async Task<IActionResult> GetBudgets(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode,
      [FromQuery] string? sectionCode,
      [FromQuery] string? compStoreCode,
      [FromQuery] string? empStatus)
    {
      // Get UserId from Session for Data Access Filtering
      var userIdStr = HttpContext.Session.GetString("UserId");
      int? userId = !string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int uid) ? uid : null;

      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode,
        Section = sectionCode,
        StoreName = compStoreCode,
        EmpStatus = empStatus,
        UserId = userId  // Pass UserId for data access filtering
      };

      if (!filter.IsValid())
      {
        return BadRequest(filter.GetValidationError());
      }

      var list = await _budgetService.GetBudgetsAsync(filter);
      return Ok(list);
    }

    // GET: /Budget/GetDistinctCompanies
    [HttpGet]
    [Route("B0Companies")]
    public async Task<IActionResult> GetDistinctCompanies()
    {
      // 🔒 Get CompanyAccess from session (Option C)
      var empCode = HttpContext.Session.GetString("EmployeeNo");
      string? companyAccess = null;

      if (!string.IsNullOrEmpty(empCode))
      {
        var user = await _context.HRB_USER
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.EmpCode == empCode && u.IsActive);
        companyAccess = user?.CompanyAccess;
      }

      var distinctCompanies = await _budgetService.GetDistinctCompaniesAsync(companyAccess);
      return Ok(distinctCompanies);
    }

    // GET: /Budget/GetDistinctCoBU
    [HttpGet]
    [Route("B0CoBU")]
    public async Task<IActionResult> GetDistinctCoBU([FromQuery] string? companyID)
    {
      var distinctCoBU = await _budgetService.GetDistinctCoBUAsync(companyID);
      return Ok(distinctCoBU);
    }

    // GET: /Budget/GetDistinctPositions
    [HttpGet]
    [Route("B0Positions")]
    public async Task<IActionResult> GetDistinctPositions(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode,
      [FromQuery] string? sectionCode,
      [FromQuery] string? compStoreCode,
      [FromQuery] string? empStatus)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode,
        Section = sectionCode,
        StoreName = compStoreCode,
        EmpStatus = empStatus
      };
      var distinctPositions = await _budgetService.GetDistinctPositionsAsync(filter);
      return Ok(distinctPositions);
    }

    // GET: /Budget/GetDistinctDivisions
    [HttpGet]
    [Route("B0Divisions")]
    public async Task<IActionResult> GetDistinctDivisions(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode
      };
      var distinctDivision = await _budgetService.GetDistinctDivisionsAsync(filter);
      return Ok(distinctDivision);
    }

    // GET: /Budget/GetDistinctDepartments
    [HttpGet]
    [Route("B0Departments")]
    public async Task<IActionResult> GetDistinctDepartments(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode,
        Division = divisionCode
      };
      var distinctDepartments = await _budgetService.GetDistinctDepartmentsAsync(filter);
      return Ok(distinctDepartments);
    }

    // GET: /Budget/GetDistinctSections
    [HttpGet]
    [Route("B0Sections")]
    public async Task<IActionResult> GetDistinctSections(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode
      };
      var distinctSections = await _budgetService.GetDistinctSectionsAsync(filter);
      return Ok(distinctSections);
    }

    // GET: /Budget/GetDistinctStoreNames
    [HttpGet]
    [Route("B0StoreNames")]
    public async Task<IActionResult> GetDistinctStoreNames(
      [FromQuery] string? companyID,
      [FromQuery] string? cobu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode,
      [FromQuery] string? sectionCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = cobu,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode,
        Section = sectionCode
      };
      var distinctStoreNames = await _budgetService.GetDistinctStoreNamesAsync(filter);
      return Ok(distinctStoreNames);
    }

    // GET: /Budget/GetDistinctCostCenters
    [HttpGet]
    [Route("B0CostCenters")]
    public async Task<IActionResult> GetDistinctCostCenters(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu
      };
      var distinctCostCenters = await _budgetService.GetDistinctCostCentersAsync(filter);
      return Ok(distinctCostCenters);
    }

    // GET: /Budget/GetDistinctBudgetYears
    [HttpGet]
    [Route("B0BudgetYears")]
    public async Task<IActionResult> GetDistinctBudgetYears(
      [FromQuery] string? companyID)
    {
      var distinctYears = await _budgetService.GetDistinctBudgetYearsAsync(companyID);
      return Ok(distinctYears);
    }

    // GET: /Budget/GetDistinctEmpStatus
    [HttpGet]
    [Route("B0EmpStatuses")]
    public async Task<IActionResult> GetDistinctEmpStatuses(
      [FromQuery] string? companyID,
      [FromQuery] string? coBu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode,
      [FromQuery] string? sectionCode,
      [FromQuery] string? compStoreCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        Cobu = coBu,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode,
        Section = sectionCode,
        StoreName = compStoreCode
      };
      var distinctEmpStatuses = await _budgetService.GetDistinctEmpStatusesAsync(filter);
      return Ok(distinctEmpStatuses);
    }

    // GET: /Budget/GetDistinctJobBand
    [HttpGet]
    [Route("B0JobBands")]
    public async Task<IActionResult> GetDistinctJobBands(
      [FromQuery] string? companyID,
      [FromQuery] string? cobu,
      [FromQuery] string? budgetYear,
      [FromQuery] string? costCenterCode,
      [FromQuery] string? divisionCode,
      [FromQuery] string? departmentCode,
      [FromQuery] string? sectionCode,
      [FromQuery] string? compStoreCode,
      [FromQuery] string? empStatus,
      [FromQuery] string? positionCode)
    {
      var filter = new BudgetFilterDto
      {
        CompanyID = companyID ?? "1",
        BudgetYear = budgetYear,
        CostCenterCode = costCenterCode,
        Division = divisionCode,
        Department = departmentCode,
        Section = sectionCode,
        StoreName = compStoreCode,
        EmpStatus = empStatus,
        PositionCode = positionCode
      };
      var distinctJobBands = await _budgetService.GetDistinctJobBandsAsync(filter);
      return Ok(distinctJobBands);
    }

    // POST: /Budget/CreateBudget
    [HttpPost]
    [Route("CreateBudget")]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetRequest request)
    {
      try
      {
        if (request == null || request.Budget == null)
        {
          return BadRequest("Budget data is required.");
        }

        if (request.CompanyId <= 0)
        {
          return BadRequest("Valid Company ID is required.");
        }

        // Validate required fields based on company
        if (string.IsNullOrEmpty(request.Budget.EmpCode))
        {
          return BadRequest("Employee Code is required.");
        }

        if (string.IsNullOrEmpty(request.Budget.CostCenterCode))
        {
          return BadRequest("Cost Center Code is required.");
        }

        if (request.Budget.BudgetYear <= 0)
        {
          return BadRequest("Budget Year is required.");
        }

        // Set company-specific defaults
        request.Budget.CompanyId = request.CompanyId;
        request.Budget.UpdatedBy = "System"; // TODO: Get from authentication
        request.Budget.UpdatedDate = DateTime.Now;

        var createdBudget = await _budgetService.CreateBudgetAsync(request.Budget, request.CompanyId);

        return Ok(new {
          Success = true,
          Message = "Budget created successfully.",
          Data = createdBudget
        });
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new {
          Success = false,
          Message = ex.Message
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new {
          Success = false,
          Message = "An error occurred while creating the budget.",
          Error = ex.Message
        });
      }
    }

    // PUT: /Budget/UpdateBudget/{id}
    [HttpPut]
    [Route("UpdateBudget/{id}")]
    public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetRequest request)
    {
      try
      {
        if (request == null || request.Budget == null)
        {
          return BadRequest("Budget data is required.");
        }

        if (request.CompanyId <= 0)
        {
          return BadRequest("Valid Company ID is required.");
        }

        // Update audit fields
        request.Budget.UpdatedBy = "System"; // TODO: Get from authentication
        request.Budget.UpdatedDate = DateTime.Now;

        var updatedBudget = await _budgetService.UpdateBudgetAsync(id, request.Budget, request.CompanyId);

        if (updatedBudget == null)
        {
          return NotFound(new {
            Success = false,
            Message = "Budget not found."
          });
        }

        return Ok(new {
          Success = true,
          Message = "Budget updated successfully.",
          Data = updatedBudget
        });
      }
      catch (ArgumentException ex)
      {
        return BadRequest(new {
          Success = false,
          Message = ex.Message
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new {
          Success = false,
          Message = "An error occurred while updating the budget.",
          Error = ex.Message
        });
      }
    }

    // DELETE: /Budget/DeleteBudget/{id}
    [HttpDelete]
    [Route("DeleteBudget/{id}")]
    public async Task<IActionResult> DeleteBudget(int id, [FromQuery] int companyId)
    {
      try
      {
        if (companyId <= 0)
        {
          return BadRequest("Valid Company ID is required.");
        }

        var deleted = await _budgetService.DeleteBudgetAsync(id, companyId);

        if (!deleted)
        {
          return NotFound(new {
            Success = false,
            Message = "Budget not found."
          });
        }

        return Ok(new {
          Success = true,
          Message = "Budget deleted successfully."
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new {
          Success = false,
          Message = "An error occurred while deleting the budget.",
          Error = ex.Message
        });
      }
    }

    // GET: /Budget/GetBudget/{id}
    [HttpGet]
    [Route("GetBudget/{id}")]
    public async Task<IActionResult> GetBudget(int id, [FromQuery] int companyId)
    {
      try
      {
        if (companyId <= 0)
        {
          return BadRequest("Valid Company ID is required.");
        }

        var budget = await _budgetService.GetBudgetByIdAsync(id, companyId);

        if (budget == null)
        {
          return NotFound(new {
            Success = false,
            Message = "Budget not found."
          });
        }

        return Ok(budget);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new {
          Success = false,
          Message = "An error occurred while retrieving the budget.",
          Error = ex.Message
        });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 BATCH ENTRY SAVE - SA APPROVED IMPLEMENTATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SA Answers Applied:
    // - Q1: All or nothing (TransactionScope)
    // - Q2: ไม่จำกัดจำนวนแถว
    // - Q3: Reject duplicate
    // - Q4: JWT Token (Option 1 - Comment ไว้ก่อน)
    // - Q5: Modal + auto-close
    // - Q6: Pre-check duplicate
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// POST: /api/Budget/B0SaveBatchEntry
    /// บันทึก Batch Budget Entries พร้อมกันหลายแถว
    ///
    /// Q4 Option 1: JWT Authentication (Comment ไว้ก่อน)
    /// - ตอนนี้ใช้ "DevUser" ชั่วคราวสำหรับ Development/Testing
    /// - เมื่อ JWT Auth เสร็จ: Uncomment [Authorize] และ User.Identity?.Name
    /// </summary>
    // TODO: Uncomment when JWT Authentication is ready
    // [Authorize]
    [HttpPost]
    [Route("B0SaveBatchEntry")]
    public async Task<IActionResult> SaveBatchEntry([FromBody] BatchBudgetRequest request)
    {
      try
      {
        // 🔍 DEBUG: Log incoming request
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🔍 SaveBatchEntry - Incoming Request");
        Console.WriteLine($"   Request is null: {request == null}");
        if (request != null)
        {
          Console.WriteLine($"   Budgets is null: {request.Budgets == null}");
          Console.WriteLine($"   Budgets count: {request.Budgets?.Count ?? 0}");
          Console.WriteLine($"   CreatedBy: '{request.CreatedBy}'");

        }
        Console.WriteLine($"   ModelState.IsValid: {ModelState.IsValid}");
        if (!ModelState.IsValid)
        {
          Console.WriteLine("   ModelState Errors:");
          foreach (var key in ModelState.Keys)
          {
            var errors = ModelState[key]?.Errors;
            if (errors != null && errors.Count > 0)
            {
              Console.WriteLine($"     [{key}]:");
              foreach (var error in errors)
              {
                Console.WriteLine($"       - {error.ErrorMessage}");
                if (!string.IsNullOrEmpty(error.Exception?.Message))
                {
                  Console.WriteLine($"         Exception: {error.Exception.Message}");
                }
              }
            }
          }
        }
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // ===== Validation =====
        if (!ModelState.IsValid)
        {
          var errors = ModelState.Values
              .SelectMany(v => v.Errors)
              .Select(e => e.ErrorMessage)
              .ToList();

          return BadRequest(new
          {
            Success = false,
            Message = "Invalid request data",
            Errors = errors,
            ModelStateKeys = ModelState.Keys.ToList() // เพิ่ม keys เพื่อดู property ที่มีปัญหา
          });
        }

        if (request == null || request.Budgets == null || request.Budgets.Count == 0)
        {
          return BadRequest(new
          {
            Success = false,
            Message = "Budgets list cannot be empty"
          });
        }

        // Q2: ไม่จำกัดจำนวนแถว (No batch size limit)
        // Note: สามารถเพิ่ม validation limit ได้ถ้า SA ต้องการ เช่น:
        // if (request.Budgets.Count > 100) {
        //   return BadRequest(new { Message = "Cannot exceed 100 rows per batch" });
        // }

        // ===== Q4: Authentication (Option 1 - Comment ไว้ก่อน) =====
        // TODO: Uncomment when JWT Authentication is ready
        // var currentUser = User.Identity?.Name ?? "System";
        // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Temporary for Development/Testing
        var currentUser = "DevUser"; // ← Remove when uncomment above

        // ===== Call Service =====
        var response = await _budgetService.CreateBatchBudgetsAsync(
            request.Budgets,
            currentUser
        );

        // ===== Return Response =====
        if (response.Success)
        {
          return Ok(response); // 200 OK with success details
        }
        else
        {
          // Q1: All or nothing - ถ้า error จะ rollback ทั้งหมด
          return BadRequest(response); // 400 Bad Request with error details
        }
      }
      catch (Exception ex)
      {
        // Log error
        Console.WriteLine($"Error in SaveBatchEntry: {ex.Message}");
        Console.WriteLine($"Stack Trace: {ex.StackTrace}");

        return StatusCode(500, new
        {
          Success = false,
          Message = "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          Error = ex.Message
        });
      }
    }

    // ===================================================================
    // Cal Button - Budget Estimation API (BIGC)
    // ===================================================================

    /// <summary>
    /// Calculate BIGC Budget Estimate using fn_BudgetEstimate (57 fields)
    /// Called by Cal button in Batch Entry mode
    /// </summary>
    /// <param name="request">Budget calculation parameters (12 inputs)</param>
    /// <returns>BudgetEstimateResponse with 57 calculated fields</returns>
    [HttpPost]
    [Route("B0CalBIGCBenefits")]
    public async Task<IActionResult> CalculateBigcBudgetEstimate([FromBody] BudgetEstimateRequest request)
    {
      try
      {
        // 🔍 DEBUG: Log incoming request
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🔍 CalculateBigcBudgetEstimate - Incoming Request");
        Console.WriteLine($"   Year: {request.Year}");
        Console.WriteLine($"   YearLe: {request.YearLe}");
        Console.WriteLine($"   Salary: {request.Salary}");
        Console.WriteLine($"   PremiumAmt: {request.PremiumAmt}");
        Console.WriteLine($"   JobBand: '{request.JobBand}'");
        Console.WriteLine($"   CompanyId: {request.CompanyId}");
        Console.WriteLine($"   LeOfMonth: {request.LeOfMonth}");
        Console.WriteLine($"   NoOfMonth: {request.NoOfMonth}");
        Console.WriteLine($"   BonusType: '{request.BonusType}' (Length: {request.BonusType?.Length ?? 0})");
        Console.WriteLine($"   CompanyName: '{request.CompanyName}'");
        Console.WriteLine($"   CostCenter: '{request.CostCenter}'");
        Console.WriteLine($"   AllocateJson: {(request.AllocateJson == null ? "NULL" : $"'{request.AllocateJson}'")}");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Force BIGC company
        request.CompanyId = 2;

        // Validation: Salary is required
        if (request.Salary <= 0)
        {
          return BadRequest(new BudgetEstimateResponse<BudgetBigcEstimateResultDto>
          {
            Success = false,
            Message = "Salary is required and must be greater than 0"
          });
        }

        // Validation: Bonus Type is required
        if (string.IsNullOrWhiteSpace(request.BonusType))
        {
          return BadRequest(new BudgetEstimateResponse<BudgetBigcEstimateResultDto>
          {
            Success = false,
            Message = "Bonus Type is required"
          });
        }

        // Call fn_BudgetEstimate database function
        // ✅ No need for dummy columns anymore - using Result DTO
        var sql = @"
                    SELECT * FROM dbo.fn_BudgetEstimate(
                        @Year,
                        @YearLe,
                        @Salary,
                        @PremiumAmt,
                        @JobBand,
                        @CompanyId,
                        @LeOfMonth,
                        @NoOfMonth,
                        @BonusType,
                        @CompanyName,
                        @CostCenter,
                        @AllocateJson
                    )";

        var parameters = new[]
        {
                    new Microsoft.Data.SqlClient.SqlParameter("@Year", request.Year),
                    new Microsoft.Data.SqlClient.SqlParameter("@YearLe", request.YearLe),
                    new Microsoft.Data.SqlClient.SqlParameter("@Salary", request.Salary),
                    new Microsoft.Data.SqlClient.SqlParameter("@PremiumAmt", request.PremiumAmt),
                    new Microsoft.Data.SqlClient.SqlParameter("@JobBand", (object?)request.JobBand ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@CompanyId", request.CompanyId),
                    new Microsoft.Data.SqlClient.SqlParameter("@LeOfMonth", request.LeOfMonth),
                    new Microsoft.Data.SqlClient.SqlParameter("@NoOfMonth", request.NoOfMonth),
                    new Microsoft.Data.SqlClient.SqlParameter("@BonusType", request.BonusType),
                    new Microsoft.Data.SqlClient.SqlParameter("@CompanyName", (object?)request.CompanyName ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@CostCenter", (object?)request.CostCenter ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@AllocateJson", (object?)request.AllocateJson ?? DBNull.Value)
                };

        // 🔍 DEBUG: Before SQL execution
        Console.WriteLine("🔍 About to execute SQL query...");
        Console.WriteLine($"   SQL: {sql}");
        Console.WriteLine($"   Parameters count: {parameters.Length}");

        // Execute query - Use FromSqlRaw with BudgetBigc DbSet
        var result = await _budgetService.GetBudgetBigcEstimate(sql, parameters);

        // 🔍 DEBUG: After SQL execution
        Console.WriteLine($"✅ SQL executed successfully. Result count: {result?.Count ?? 0}");

        if (result == null || !result.Any())
        {
          return Ok(new BudgetEstimateResponse<BudgetBigcEstimateResultDto>
          {
            Success = false,
            Message = "No data returned from calculation. Please check input parameters.",
            Data = new List<BudgetBigcEstimateResultDto>()
          });
        }

        return Ok(new BudgetEstimateResponse<BudgetBigcEstimateResultDto>
        {
          Success = true,
          Data = result,
          Message = $"Calculated {result.Count} row(s) successfully"
        });
      }
      catch (Exception ex)
      {
        // Log error with full details
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("❌ ERROR in CalculateBigcBudgetEstimate");
        Console.WriteLine($"   Error Type: {ex.GetType().Name}");
        Console.WriteLine($"   Message: {ex.Message}");
        Console.WriteLine($"   Source: {ex.Source}");
        if (ex.InnerException != null)
        {
          Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
          Console.WriteLine($"   Inner Exception Type: {ex.InnerException.GetType().Name}");
        }
        Console.WriteLine($"   Stack Trace:");
        Console.WriteLine(ex.StackTrace);
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return StatusCode(500, new BudgetEstimateResponse<BudgetBigcEstimateResultDto>
        {
          Success = false,
          Message = $"Calculation error: {ex.Message}"
        });
      }
    }

    /// <summary>
    /// Calculate BJC Budget Estimate using fn_BudgetEstimate_BJC (92 fields)
    /// Called by Cal button in Batch Entry mode for BJC company
    /// </summary>
    /// <param name="request">Budget calculation parameters (19 inputs for BJC)</param>
    /// <returns>BudgetEstimateResponse with 92 calculated fields (44 LE + 44 BG + 4 summary)</returns>
    [HttpPost]
    [Route("B0CalBJCBenefits")]
    public async Task<IActionResult> CalculateBjcBudgetEstimate([FromBody] BudgetEstimateRequest request)
    {
      try
      {
        // 🔍 DEBUG: Log incoming request
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🔍 CalculateBjcBudgetEstimate - Incoming Request");
        Console.WriteLine($"   Year: {request.Year}");
        Console.WriteLine($"   YearLe: {request.YearLe}");
        Console.WriteLine($"   Salary: {request.Salary}");
        Console.WriteLine($"   PremiumAmt: {request.PremiumAmt}");
        Console.WriteLine($"   JobBand: '{request.JobBand}'");
        Console.WriteLine($"   EmpType: '{request.EmpType}'");
        Console.WriteLine($"   CompanyId: {request.CompanyId}");
        Console.WriteLine($"   LeOfMonth: {request.LeOfMonth}");
        Console.WriteLine($"   NoOfMonth: {request.NoOfMonth}");
        Console.WriteLine($"   BonusTypeLe: '{request.BonusTypeLe}'");
        Console.WriteLine($"   BonusType: '{request.BonusType}'");
        Console.WriteLine($"   CompanyName: '{request.CompanyName}'");
        Console.WriteLine($"   CostCenter: '{request.CostCenter}'");
        Console.WriteLine($"   PositionName: '{request.PositionName}'");
        Console.WriteLine($"   YosLe: {request.YosLe}");
        Console.WriteLine($"   Yos: {request.Yos}");
        Console.WriteLine($"   DeptName: '{request.DeptName}'");
        Console.WriteLine($"   Bu: '{request.Bu}'");
        Console.WriteLine($"   Cobu: '{request.Cobu}'");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Force BJC company
        request.CompanyId = 1;

        // ===== Validation =====

        // Salary is required
        if (request.Salary <= 0)
        {
          return BadRequest(new BudgetEstimateResponse<BudgetBjcEstimateResultDto>
          {
            Success = false,
            Message = "Salary is required and must be greater than 0"
          });
        }

        // Bonus Type is required
        if (string.IsNullOrWhiteSpace(request.BonusType))
        {
          return BadRequest(new BudgetEstimateResponse<BudgetBjcEstimateResultDto>
          {
            Success = false,
            Message = "Bonus Type is required"
          });
        }

        // ===== Call fn_BudgetEstimate_BJC =====
        var sql = @"
                    SELECT * FROM dbo.fn_BudgetEstimate_BJC(
                        @Year,
                        @YearLe,
                        @Salary,
                        @PremiumAmt,
                        @JobBand,
                        @EmpType,
                        @CompanyId,
                        @LeOfMonth,
                        @NoOfMonth,
                        @BonusTypeLe,
                        @BonusType,
                        @CompanyName,
                        @CostCenter,
                        @PositionName,
                        @YosLe,
                        @Yos,
                        @DeptName,
                        @Bu,
                        @Cobu
                    )";

        var parameters = new[]
        {
                    new Microsoft.Data.SqlClient.SqlParameter("@Year", request.Year),
                    new Microsoft.Data.SqlClient.SqlParameter("@YearLe", request.YearLe),
                    new Microsoft.Data.SqlClient.SqlParameter("@Salary", request.Salary),
                    new Microsoft.Data.SqlClient.SqlParameter("@PremiumAmt", request.PremiumAmt),
                    new Microsoft.Data.SqlClient.SqlParameter("@JobBand", (object?)request.JobBand ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@EmpType", (object?)request.EmpType ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@CompanyId", request.CompanyId),
                    new Microsoft.Data.SqlClient.SqlParameter("@LeOfMonth", request.LeOfMonth),
                    new Microsoft.Data.SqlClient.SqlParameter("@NoOfMonth", request.NoOfMonth),
                    new Microsoft.Data.SqlClient.SqlParameter("@BonusTypeLe", (object?)request.BonusTypeLe ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@BonusType", request.BonusType),
                    new Microsoft.Data.SqlClient.SqlParameter("@CompanyName", (object?)request.CompanyName ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@CostCenter", (object?)request.CostCenter ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@PositionName", (object?)request.PositionName ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@YosLe", (object?)request.YosLe ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@Yos", (object?)request.Yos ?? DBNull.Value),
                    new Microsoft.Data.SqlClient.SqlParameter("@DeptName", (object?)request.DeptName ?? DBNull.Value),
                    // TODO: @Bu parameter - Currently fixed to NULL, may be updated in the future
                    new Microsoft.Data.SqlClient.SqlParameter("@Bu", DBNull.Value), // Fixed to NULL for now
                    new Microsoft.Data.SqlClient.SqlParameter("@Cobu", (object?)request.Cobu ?? DBNull.Value)
                };

        // 🔍 DEBUG: Before SQL execution
        Console.WriteLine("🔍 About to execute SQL query for BJC...");
        Console.WriteLine($"   SQL: {sql}");
        Console.WriteLine($"   Parameters count: {parameters.Length}");

        // Execute query - Use GetBudgetBjcEstimate service method
        var result = await _budgetService.GetBudgetBjcEstimate(sql, parameters);

        // 🔍 DEBUG: After SQL execution
        Console.WriteLine($"✅ SQL executed successfully. Result count: {result?.Count ?? 0}");

        if (result == null || !result.Any())
        {
          return Ok(new BudgetEstimateResponse<BudgetBjcEstimateResultDto>
          {
            Success = false,
            Message = "No data returned from calculation. Please check input parameters.",
            Data = new List<BudgetBjcEstimateResultDto>()
          });
        }

        return Ok(new BudgetEstimateResponse<BudgetBjcEstimateResultDto>
        {
          Success = true,
          Data = result,
          Message = $"Calculated {result.Count} row(s) successfully for BJC company"
        });
      }
      catch (Exception ex)
      {
        // Log error with full details
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("❌ ERROR in CalculateBjcBudgetEstimate");
        Console.WriteLine($"   Error Type: {ex.GetType().Name}");
        Console.WriteLine($"   Message: {ex.Message}");
        Console.WriteLine($"   Source: {ex.Source}");
        if (ex.InnerException != null)
        {
          Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
          Console.WriteLine($"   Inner Exception Type: {ex.InnerException.GetType().Name}");
        }
        Console.WriteLine($"   Stack Trace:");
        Console.WriteLine(ex.StackTrace);
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return StatusCode(500, new BudgetEstimateResponse<BudgetBjcEstimateResultDto>
        {
          Success = false,
          Message = $"BJC Calculation error: {ex.Message}"
        });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 UPDATE BUDGET - SINGLE ROW UPDATE (SA APPROVED)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Implementation based on Save All button pattern
    // SA Requirements:
    // - UPDATE operation (not SAVE/CREATE)
    // - Validate 3 fields: CompanyId, BudgetId, BudgetYear
    // - Page reload after success
    // - NO Transaction needed (single SaveChangesAsync)
    // - Company-specific routing: CompanyId 1=BJC, 2=BIGC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// PUT: /api/Budget/UpdateBudget
    /// อัปเดตข้อมูล Budget รายการเดียว โดยแยก table ตาม CompanyId
    ///
    /// ⚠️ IMPORTANT: Must include CompanyId in request for correct table routing
    /// - CompanyId = 1 → Update HRB_BUDGET_BJC (147 columns)
    /// - CompanyId = 2 → Update HRB_BUDGET_BIGC (120 columns)
    ///
    /// SA Requirements:
    /// - SA Requirement #1: UPDATE operation (not SAVE) ✅
    /// - SA Requirement #2: Validate CompanyId, BudgetId, BudgetYear ✅
    /// - SA Requirement #3: Page reload after success (handled by frontend) ✅
    /// - SA Decision: NO Transaction needed (single SaveChangesAsync) ✅
    ///
    /// Reference: Similar to B0SaveBatchEntry but for single row update
    /// Service Layer: UpdateBudgetAsync() already exists in BudgetService
    /// </summary>
    [HttpPut]
    [Route("UpdateBudget")]
    public async Task<IActionResult> UpdateBudget([FromBody] UpdateBudgetRequest request)
    {
      try
      {
        // 🔍 DEBUG: Log incoming request
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🔍 UpdateBudget - Incoming Request");
        Console.WriteLine($"   Request is null: {request == null}");
        if (request != null)
        {
          Console.WriteLine($"   Budget is null: {request.Budget == null}");
          Console.WriteLine($"   CompanyId: {request.CompanyId}");
          if (request.Budget != null)
          {
            Console.WriteLine($"   BudgetId: {request.Budget.BudgetId}");
            Console.WriteLine($"   BudgetYear: {request.Budget.BudgetYear}");
            Console.WriteLine($"   EmpCode: '{request.Budget.EmpCode}'");
          }
        }
        Console.WriteLine($"   ModelState.IsValid: {ModelState.IsValid}");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // ===== Validation =====
        if (!ModelState.IsValid)
        {
          var errors = ModelState.Values
              .SelectMany(v => v.Errors)
              .Select(e => e.ErrorMessage)
              .ToList();

          return BadRequest(new UpdateBudgetResponse
          {
            Success = false,
            Message = "ข้อมูลไม่ถูกต้อง",
            ErrorMessage = string.Join("; ", errors)
          });
        }

        if (request == null || request.Budget == null)
        {
          return BadRequest(new UpdateBudgetResponse
          {
            Success = false,
            Message = "ข้อมูล Budget ไม่ครบถ้วน",
            ErrorMessage = "Request or Budget object is null"
          });
        }

        // ===== SA Requirement #2: Validate 3 Critical Fields =====

        // 1. CompanyId validation (CRITICAL for table routing)
        if (request.CompanyId != 1 && request.CompanyId != 2)
        {
          return BadRequest(new UpdateBudgetResponse
          {
            Success = false,
            Message = "รหัสบริษัทไม่ถูกต้อง (ต้องเป็น 1=BJC หรือ 2=BIGC)",
            ErrorMessage = $"Invalid CompanyId: {request.CompanyId}. Must be 1 (BJC) or 2 (BIGC)"
          });
        }

        // 2. BudgetId validation (CRITICAL for finding record)
        if (request.Budget.BudgetId <= 0)
        {
          return BadRequest(new UpdateBudgetResponse
          {
            Success = false,
            Message = "BudgetId ไม่ถูกต้อง",
            ErrorMessage = $"Invalid BudgetId: {request.Budget.BudgetId}. Must be > 0"
          });
        }

        // 3. BudgetYear validation (Business rule)
        if (request.Budget.BudgetYear <= 0)
        {
          return BadRequest(new UpdateBudgetResponse
          {
            Success = false,
            Message = "BudgetYear ไม่ถูกต้อง",
            ErrorMessage = $"Invalid BudgetYear: {request.Budget.BudgetYear}. Must be > 0"
          });
        }

        // ===== Set CompanyId in Budget DTO (for service layer routing) =====
        request.Budget.CompanyId = request.CompanyId;

        // ===== Authentication (TODO: JWT Token) =====
        // TODO: Get from JWT Token when ready
        var currentUser = "DevUser";
        request.Budget.UpdatedBy = currentUser;
        request.Budget.UpdatedDate = DateTime.Now;

        // ===== Call Service Layer =====
        // Service handles company-specific routing:
        // - CompanyId = 1 → MapToBjcDto() → UpdateBjcBudgetAsync() → HRB_BUDGET_BJC
        // - CompanyId = 2 → MapToBigcDto() → UpdateBigcBudgetAsync() → HRB_BUDGET_BIGC
        Console.WriteLine($"🔧 Calling UpdateBudgetUnifiedAsync for BudgetId={request.Budget.BudgetId}, CompanyId={request.CompanyId}");

        var updatedBudget = await _budgetService.UpdateBudgetUnifiedAsync(
          request.Budget.BudgetId,
          request.Budget,
          request.CompanyId
        );

        // ===== Handle Response =====
        if (updatedBudget == null)
        {
          // Budget not found
          return NotFound(new UpdateBudgetResponse
          {
            Success = false,
            Message = "ไม่พบข้อมูล Budget ที่ต้องการแก้ไข",
            ErrorMessage = $"Budget not found: BudgetId={request.Budget.BudgetId}, CompanyId={request.CompanyId}"
          });
        }

        Console.WriteLine($"✅ UpdateBudget successful for BudgetId={request.Budget.BudgetId}");

        // ===== Return Success Response =====
        return Ok(new UpdateBudgetResponse
        {
          Success = true,
          Message = "บันทึกข้อมูลสำเร็จ",
          Data = updatedBudget // Return updated budget data from service
        });
      }
      catch (ArgumentException ex)
      {
        // Validation or business rule errors
        Console.WriteLine($"❌ ArgumentException: {ex.Message}");
        return BadRequest(new UpdateBudgetResponse
        {
          Success = false,
          Message = "ข้อมูลไม่ถูกต้อง",
          ErrorMessage = ex.Message
        });
      }
      catch (Exception ex)
      {
        // Server errors
        Console.WriteLine($"💥 Exception in UpdateBudget: {ex.Message}");
        Console.WriteLine($"   StackTrace: {ex.StackTrace}");

        return StatusCode(500, new UpdateBudgetResponse
        {
          Success = false,
          Message = "เกิดข้อผิดพลาดในระบบ",
          ErrorMessage = ex.Message
        });
      }
    }
  }
}
