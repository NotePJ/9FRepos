using HCBPCoreUI_Backend.Services;
using HCBPCoreUI_Backend.DTOs.Budget;
using HCBPCoreUI_Backend.DTOs.AuditLog;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Config;
using HCBPCoreUI_Backend.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Settings Controller - จัดการ Master Data
    /// ต้องการ Permission: PAGE_SETTINGS
    /// </summary>
    [RequireAuth]
    [RequirePermission("PAGE_SETTINGS")]
    public class SettingsController : Controller
    {
    private readonly ISettingsService _settingsService;
    private readonly ILogger<SettingsController> _logger;
    private readonly HRBudgetDbContext _context;
    private readonly IAuditLogService _auditLogService;

    public SettingsController(
        ISettingsService settingsService,
        ILogger<SettingsController> logger,
        HRBudgetDbContext context,
        IAuditLogService auditLogService)
    {
      _settingsService = settingsService;
      _logger = logger;
      _context = context;
      _auditLogService = auditLogService;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 VIEW: GET /Settings/UserManagement
    // Purpose: Display User Management page
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Display User Management page
    /// </summary>
    /// <returns>User Management view</returns>
    [HttpGet]
    [Route("Settings/UserManagement")]
    public IActionResult UserManagement()
    {
        _logger.LogInformation("Accessing User Management page");
        return View();
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 VIEW: GET /Settings/RoleManagement
    // Purpose: Display Role Management page
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Display Role Management page
    /// </summary>
    /// <returns>Role Management view</returns>
    [HttpGet]
    [Route("Settings/RoleManagement")]
    public IActionResult RoleManagement()
    {
        _logger.LogInformation("Accessing Role Management page");
        return View();
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 VIEW: GET /Settings/Manage/{modelName}
    // Purpose: Display AG Grid page with Offcanvas for CRUD operations
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Display management page for a specific model
    /// </summary>
    /// <param name="modelName">Model name (e.g., "Company", "CostCenter")</param>
    /// <returns>Manage view with AG Grid</returns>
    [HttpGet]
    [Route("Settings/Manage/{modelName}")]
    public IActionResult Manage(string modelName)
    {
      if (string.IsNullOrWhiteSpace(modelName))
      {
        return BadRequest("Model name is required");
      }

      if (!_settingsService.IsValidModel(modelName))
      {
        return NotFound($"Model '{modelName}' not found");
      }

      ViewBag.ModelName = modelName;
      ViewBag.DisplayName = _settingsService.GetModelDisplayName(modelName);;

      _logger.LogInformation("Accessing settings page for model: {ModelName}", modelName);

      return View();
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /Settings/GetData/{modelName}
    // Purpose: Get all records for AG Grid
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get all records for a model
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <returns>JSON array of records</returns>
    [HttpGet]
    [Route("api/Settings/getdata/{modelName}")]
    public async Task<IActionResult> GetData(string modelName)
    {
      try
      {
        if (!_settingsService.IsValidModel(modelName))
        {
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        var data = await _settingsService.GetAllAsync(modelName);

        return Ok(new { success = true, data = data });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting data for model: {ModelName}. Exception: {Message}, StackTrace: {StackTrace}",
            modelName, ex.Message, ex.StackTrace);
        return StatusCode(500, new { success = false, message = $"Error retrieving data: {ex.Message}" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /Settings/GetColumns/{modelName}
    // Purpose: Get column definitions for AG Grid
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get column definitions for AG Grid
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <returns>JSON array of column definitions</returns>
    [HttpGet]
    [Route("api/Settings/getcolumns/{modelName}")]
    public async Task<IActionResult> GetColumns(string modelName)
    {
      try
      {
        _logger.LogInformation("GetColumns called for model: {ModelName}", modelName);

        if (!_settingsService.IsValidModel(modelName))
        {
          _logger.LogWarning("Invalid model name: {ModelName}", modelName);
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        var columns = await _settingsService.GetColumnsAsync(modelName);

        return Ok(new { success = true, columns = columns });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting columns for model: {ModelName}. Exception: {Message}", modelName, ex.Message);
        return StatusCode(500, new { success = false, message = $"Error retrieving columns: {ex.Message}" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /Settings/GetById/{modelName}?key1=value1&key2=value2
    // Purpose: Get a single record by ID for editing (supports composite keys)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get a single record by ID (supports composite keys via query parameters)
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <returns>JSON object of the record</returns>
    [HttpGet]
    [Route("api/Settings/getbyid/{modelName}")]
    public async Task<IActionResult> GetById(string modelName)
    {
      try
      {
        if (!_settingsService.IsValidModel(modelName))
        {
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        // Extract all query parameters as keys
        var keys = new Dictionary<string, object>();
        foreach (var param in Request.Query)
        {
          if (param.Key.ToLower() != "modelname")
          {
            keys[param.Key] = param.Value.ToString();
          }
        }

        if (keys.Count == 0)
        {
          return BadRequest(new { success = false, message = "No key parameters provided" });
        }

        var record = await _settingsService.GetByIdAsync(modelName, keys);

        if (record == null)
        {
          return NotFound(new { success = false, message = "Record not found" });
        }

        return Ok(new { success = true, data = record });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting record for model: {ModelName}", modelName);
        return StatusCode(500, new { success = false, message = "Error retrieving record" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: POST /Settings/Create/{modelName}
    // Purpose: Create a new record
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Create a new record
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <param name="data">Record data</param>
    /// <returns>Created record with ID</returns>
    [HttpPost]
    [Route("api/Settings/create/{modelName}")]
    public async Task<IActionResult> Create(string modelName, [FromBody] Dictionary<string, object?> data)
    {
      try
      {
        if (!_settingsService.IsValidModel(modelName))
        {
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        if (data == null || data.Count == 0)
        {
          return BadRequest(new { success = false, message = "No data provided" });
        }

        var result = await _settingsService.CreateAsync(modelName, data);

        _logger.LogInformation("Created new record for model: {ModelName}", modelName);

        // Activity Log
        _ = _auditLogService.LogAsync(
            ActivityModules.MasterData,
            ActivityActions.Create,
            modelName,
            modelName,
            null,
            data,
            HttpContext);

        return Ok(new { success = true, data = result, message = "Record created successfully" });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error creating record for model: {ModelName}", modelName);
        return StatusCode(500, new { success = false, message = $"Error creating record: {ex.Message}" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: PUT /Settings/Update/{modelName} (keys in body)
    // Purpose: Update an existing record (supports composite keys)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Update an existing record (keys included in data)
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <param name="data">Updated data including primary key(s)</param>
    /// <returns>Updated record</returns>
    [HttpPut]
    [Route("api/Settings/update/{modelName}")]
    public async Task<IActionResult> Update(string modelName, [FromBody] Dictionary<string, object?> data)
    {
      try
      {
        if (!_settingsService.IsValidModel(modelName))
        {
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        if (data == null || data.Count == 0)
        {
          return BadRequest(new { success = false, message = "No data provided" });
        }

        // Extract primary keys from data
        var keys = ExtractPrimaryKeys(modelName, data);

        if (keys.Count == 0)
        {
          return BadRequest(new { success = false, message = "No primary key values provided" });
        }

        // Get old data for audit log
        var oldData = await _settingsService.GetByIdAsync(modelName, keys);

        var result = await _settingsService.UpdateAsync(modelName, keys, data);

        _logger.LogInformation("Updated record for model: {ModelName}, Keys: {@Keys}", modelName, keys);

        // Activity Log
        _ = _auditLogService.LogAsync(
            ActivityModules.MasterData,
            ActivityActions.Update,
            string.Join(",", keys.Values),
            modelName,
            oldData,
            data,
            HttpContext);

        return Ok(new { success = true, data = result, message = "Record updated successfully" });
      }
      catch (InvalidOperationException ex)
      {
        return NotFound(new { success = false, message = ex.Message });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error updating record for model: {ModelName}", modelName);
        return StatusCode(500, new { success = false, message = $"Error updating record: {ex.Message}" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: DELETE /Settings/Delete/{modelName}?key1=value1&key2=value2
    // Purpose: Delete a record (soft delete if IsActive exists, supports composite keys)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Delete a record (supports composite keys via query parameters)
    /// </summary>
    /// <param name="modelName">Model name</param>
    /// <returns>Success status</returns>
    [HttpDelete]
    [Route("api/Settings/delete/{modelName}")]
    public async Task<IActionResult> Delete(string modelName)
    {
      try
      {
        if (!_settingsService.IsValidModel(modelName))
        {
          return NotFound(new { success = false, message = $"Model '{modelName}' not found" });
        }

        // Extract all query parameters as keys
        var keys = new Dictionary<string, object>();
        foreach (var param in Request.Query)
        {
          if (param.Key.ToLower() != "modelname")
          {
            keys[param.Key] = param.Value.ToString();
          }
        }

        if (keys.Count == 0)
        {
          return BadRequest(new { success = false, message = "No key parameters provided" });
        }

        // Get old data for audit log
        var oldData = await _settingsService.GetByIdAsync(modelName, keys);

        var result = await _settingsService.DeleteAsync(modelName, keys);

        if (!result)
        {
          return NotFound(new { success = false, message = "Record not found" });
        }

        _logger.LogInformation("Deleted record for model: {ModelName}, Keys: {@Keys}", modelName, keys);

        // Activity Log
        _ = _auditLogService.LogAsync(
            ActivityModules.MasterData,
            ActivityActions.Delete,
            string.Join(",", keys.Values),
            modelName,
            oldData,
            null,
            HttpContext);

        return Ok(new { success = true, message = "Record deleted successfully" });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error deleting record for model: {ModelName}", modelName);
        return StatusCode(500, new { success = false, message = $"Error deleting record: {ex.Message}" });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔧 HELPER METHOD: Extract Primary Keys from Data
    // ═══════════════════════════════════════════════════════════════════

    private Dictionary<string, object> ExtractPrimaryKeys(string modelName, Dictionary<string, object?> data)
    {
      var keys = new Dictionary<string, object>();

      // Get model type
      var modelTypeProperty = typeof(Services.SettingsService)
          .GetField("_modelTypes", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

      // Use reflection to get primary key properties (simplified approach)
      // In production, you might want to inject this information or use a better method
      var keyProperties = new[] { "CompanyId", "Id", "JbId", "CostId", "GlId", "PosId", "StatusId",
                                       "BenfId", "ItemId", "RunId", "FcId", "BgrateId", "SsId", "BuId",
                                       "GroupId", "MapId", "EmpId", "ExpenseId", "HrbpId", "JobBand",
                                       "AllocateId", "CostCenterCode" };

      foreach (var keyProp in keyProperties)
      {
        // Try PascalCase first
        if (data.ContainsKey(keyProp) && data[keyProp] != null)
        {
          keys[keyProp] = data[keyProp]!;
        }
        // Try camelCase (first character lowercase)
        else if (keyProp.Length > 0)
        {
          var camelCaseKey = char.ToLowerInvariant(keyProp[0]) + keyProp.Substring(1);
          if (data.ContainsKey(camelCaseKey) && data[camelCaseKey] != null)
          {
            keys[keyProp] = data[camelCaseKey]!; // Store as PascalCase for backend
          }
        }
      }

      return keys;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /api/Settings/GetMaxAllocateId
    // Purpose: Get MAX(AllocateId) from HRB_CONF_PE_ALLOCATION for generating new ID
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get MAX(AllocateId) + 1 for new allocation batch
    /// </summary>
    /// <returns>Next AllocateId to use</returns>
    [HttpGet]
    [Route("api/Settings/GetMaxAllocateId")]
    public async Task<IActionResult> GetMaxAllocateId()
    {
      try
      {
        var maxId = await _context.HRB_CONF_PE_ALLOCATION
            .MaxAsync(p => (int?)p.AllocateId) ?? 0;

        var nextId = maxId + 1;

        _logger.LogInformation("GetMaxAllocateId - Current MAX: {MaxId}, Next ID: {NextId}", maxId, nextId);

        return Ok(new
        {
          success = true,
          maxId = maxId,
          nextId = nextId
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting MAX(AllocateId)");
        return StatusCode(500, new
        {
          success = false,
          message = "Error getting MAX AllocateId",
          error = ex.Message
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: POST /Settings/SavePEAllocationBatch
    // Purpose: Save PE Allocation Configuration Batch (Auto-called after budget save)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Save PE Allocation Configuration Batch
    /// Called automatically after budget batch save in Allocation mode
    /// </summary>
    /// <param name="request">PE Allocation configuration records</param>
    /// <returns>Success response with saved record count</returns>
    [HttpPost]
    [Route("api/Settings/savePEallocationbatch")]
    public async Task<IActionResult> SavePEAllocationBatch([FromBody] PEAllocationBatchRequest request)
    {
      try
      {
        _logger.LogInformation("SavePEAllocationBatch - Request received");
        _logger.LogInformation("SavePEAllocationBatch - Request is null? {IsNull}", request == null);

        if (request != null)
        {
          _logger.LogInformation("SavePEAllocationBatch - Allocations is null? {IsNull}", request.Allocations == null);
          _logger.LogInformation("SavePEAllocationBatch - Allocations Count: {Count}", request.Allocations?.Count ?? 0);
          _logger.LogInformation("SavePEAllocationBatch - CreatedBy: {CreatedBy}", request.CreatedBy ?? "NULL");
        }

        // ===== Validation =====
        if (request == null || request.Allocations == null || request.Allocations.Count == 0)
        {
          _logger.LogWarning("SavePEAllocationBatch - Validation failed: request={RequestNull}, allocations={AllocationsNull}, count={Count}",
              request == null, request?.Allocations == null, request?.Allocations?.Count ?? 0);

          return BadRequest(new
          {
            Success = false,
            Message = "Allocations list cannot be empty"
          });
        }

        _logger.LogInformation("SavePEAllocationBatch - Received {Count} allocation records", request.Allocations.Count);

        // ===== Authentication =====
        var currentUser = request.CreatedBy ?? "System";

        // ===== Business Logic =====
        var savedCount = 0;

        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
          try
          {
            foreach (var allocation in request.Allocations)
            {
              // Check if record already exists (composite key)
              var existing = await _context.HRB_CONF_PE_ALLOCATION
                  .FirstOrDefaultAsync(p =>
                      p.AllocateId == allocation.AllocateId &&
                      p.CompanyId == allocation.CompanyId &&
                      p.CostCenterCode == allocation.CostCenterCode);

              if (existing != null)
              {
                // Update existing record
                existing.EmpCode = allocation.EmpCode;
                existing.AllocateValue = allocation.AllocateValue;
                existing.IsActive = allocation.IsActive;
                existing.UpdatedBy = currentUser;
                existing.UpdatedDate = DateTime.Now;

                _context.HRB_CONF_PE_ALLOCATION.Update(existing);
                _logger.LogInformation("Updated PE Allocation: AllocateId={AllocateId}, CompanyId={CompanyId}, CostCenter={CostCenter}",
                    allocation.AllocateId, allocation.CompanyId, allocation.CostCenterCode);
              }
              else
              {
                // Insert new record
                var newRecord = new HRB_CONF_PE_ALLOCATION
                {
                  AllocateId = allocation.AllocateId,
                  CompanyId = allocation.CompanyId,
                  CostCenterCode = allocation.CostCenterCode,
                  EmpCode = allocation.EmpCode,
                  AllocateValue = allocation.AllocateValue,
                  IsActive = allocation.IsActive,
                  UpdatedBy = currentUser,
                  UpdatedDate = DateTime.Now
                };

                await _context.HRB_CONF_PE_ALLOCATION.AddAsync(newRecord);
                _logger.LogInformation("Inserted PE Allocation: AllocateId={AllocateId}, CompanyId={CompanyId}, CostCenter={CostCenter}",
                    allocation.AllocateId, allocation.CompanyId, allocation.CostCenterCode);
              }

              savedCount++;
            }

            // Save all changes in transaction
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Successfully saved {SavedCount} PE Allocation configuration records", savedCount);

            return Ok(new
            {
              Success = true,
              Message = $"Successfully saved {savedCount} PE Allocation configuration records",
              SavedCount = savedCount
            });
          }
          catch (Exception ex)
          {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error during PE Allocation batch save transaction");
            throw;
          }
        }
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error saving PE Allocation configuration batch");

        return StatusCode(500, new
        {
          Success = false,
          Message = "เกิดข้อผิดพลาดในการบันทึก PE Allocation Configuration",
          Error = ex.Message
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 VIEW: GET /Settings/AuditLogs
    // Purpose: Display Audit Logs page (Admin + Super User only)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Display Audit Logs page
    /// </summary>
    /// <returns>Audit Logs view</returns>
    [HttpGet]
    [Route("Settings/AuditLogs")]
    public IActionResult AuditLogs()
    {
        _logger.LogInformation("Accessing Audit Logs page");
        return View();
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /api/Settings/AuditLogs/Login
    // Purpose: Get Login Logs with Server-side Pagination
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get Login Logs with pagination
    /// </summary>
    [HttpGet]
    [Route("api/Settings/AuditLogs/Login")]
    public async Task<IActionResult> GetLoginLogs([FromQuery] AuditLogQueryRequest request)
    {
        try
        {
            _logger.LogInformation("Fetching login logs - Page: {Page}, PageSize: {PageSize}",
                request.Page, request.PageSize);

            var result = await _auditLogService.GetLoginLogsAsync(request);

            return Ok(new
            {
                success = true,
                data = result.Data,
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize,
                totalPages = result.TotalPages,
                hasPreviousPage = result.HasPreviousPage,
                hasNextPage = result.HasNextPage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching login logs");
            return StatusCode(500, new { success = false, message = "Error fetching login logs", error = ex.Message });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /api/Settings/AuditLogs/Email
    // Purpose: Get Email Logs with Server-side Pagination
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get Email Logs with pagination
    /// </summary>
    [HttpGet]
    [Route("api/Settings/AuditLogs/Email")]
    public async Task<IActionResult> GetEmailLogs([FromQuery] AuditLogQueryRequest request)
    {
        try
        {
            _logger.LogInformation("Fetching email logs - Page: {Page}, PageSize: {PageSize}",
                request.Page, request.PageSize);

            var result = await _auditLogService.GetEmailLogsAsync(request);

            return Ok(new
            {
                success = true,
                data = result.Data,
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize,
                totalPages = result.TotalPages,
                hasPreviousPage = result.HasPreviousPage,
                hasNextPage = result.HasNextPage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email logs");
            return StatusCode(500, new { success = false, message = "Error fetching email logs", error = ex.Message });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /api/Settings/AuditLogs/Upload
    // Purpose: Get Upload Logs with Server-side Pagination
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get Upload Logs with pagination
    /// </summary>
    [HttpGet]
    [Route("api/Settings/AuditLogs/Upload")]
    public async Task<IActionResult> GetUploadLogs([FromQuery] AuditLogQueryRequest request)
    {
        try
        {
            _logger.LogInformation("Fetching upload logs - Page: {Page}, PageSize: {PageSize}",
                request.Page, request.PageSize);

            var result = await _auditLogService.GetUploadLogsAsync(request);

            return Ok(new
            {
                success = true,
                data = result.Data,
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize,
                totalPages = result.TotalPages,
                hasPreviousPage = result.HasPreviousPage,
                hasNextPage = result.HasNextPage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching upload logs");
            return StatusCode(500, new { success = false, message = "Error fetching upload logs", error = ex.Message });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📍 API: GET /api/Settings/AuditLogs/Activity
    // Purpose: Get Activity Logs with Filter
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get Activity Logs with filter
    /// </summary>
    [HttpGet]
    [Route("api/Settings/AuditLogs/Activity")]
    public async Task<IActionResult> GetActivityLogs([FromQuery] ActivityLogQueryRequest request)
    {
        try
        {
            _logger.LogInformation("Fetching activity logs - DateFrom: {DateFrom}, DateTo: {DateTo}, Module: {Module}, Action: {Action}",
                request.DateFrom, request.DateTo, request.ModuleName, request.Action);

            var result = await _auditLogService.GetActivityLogsAsync(request);

            return Ok(new
            {
                success = true,
                data = result.Data,
                totalCount = result.TotalCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching activity logs");
            return StatusCode(500, new { success = false, message = "Error fetching activity logs", error = ex.Message });
        }
    }
  }
}
