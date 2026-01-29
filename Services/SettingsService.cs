using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using HCBPCoreUI_Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Generic Settings Service
    /// Handles CRUD operations for all Master/Config/Cost/Employee models using reflection
    /// </summary>
    public class SettingsService : ISettingsService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<SettingsService> _logger;

        // Model mapping: friendly name -> Type
        private readonly Dictionary<string, Type> _modelTypes;

        public SettingsService(HRBudgetDbContext context, ILogger<SettingsService> logger)
        {
            _context = context;
            _logger = logger;

            // Initialize model mappings
            _modelTypes = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
            {
                // Master Models
                { "Company", typeof(Models.Master.HRB_MST_COMPANY) },
                { "CostCenter", typeof(Models.Master.HRB_MST_COST_CENTER) },
                { "GLAccount", typeof(Models.Master.HRB_MST_GL_ACCOUNT) },
                { "JobBand", typeof(Models.Master.HRB_MST_JOB_BAND) },
                { "Position", typeof(Models.Master.HRB_MST_POSITION) },
                { "Status", typeof(Models.Master.HRB_MST_STATUS) },

                // Config Models
                { "BudgetRates", typeof(Models.Config.HRB_CONF_BUDGETRATES) },
                { "BudgetBonus", typeof(Models.Config.HRB_CONF_BUDGET_BONUS) },
                { "BUSupervisor", typeof(Models.Config.HRB_CONF_BU_SUP) },
                { "FleetCard", typeof(Models.Config.HRB_CONF_FLEETCARD) },
                { "GroupRunRate", typeof(Models.Config.HRB_CONF_GROUP_RUNRATE) },
                { "HRBP", typeof(Models.Config.HRB_CONF_HRBP) },
                { "PEAllocation", typeof(Models.Config.HRB_CONF_PE_ALLOCATION) },
                { "JobBenefits", typeof(Models.Config.HRB_CONF_JB_BENEFITS) },
                { "SalaryRange", typeof(Models.Config.HRB_CONF_SALARY_RANGE) },
                { "SalaryStructure", typeof(Models.Config.HRB_CONF_SALARY_STRUCTURE) },
                { "ItemConfig", typeof(Models.Config.HRB_MST_ITEM_CONFIG) },

                // Cost Models
                { "CostGroupMapping", typeof(Models.Cost.HRB_COST_GROUP_MAPPING) },
                { "CostGroupRunRate", typeof(Models.Cost.HRB_COST_GROUP_RUNRATE) },

                // Employee Models
                { "EmployeeData", typeof(Models.Employee.HRB_EMPLOYEE_DATA) },
                { "EmployeeExpenseBigC", typeof(Models.Employee.HRB_EMP_EXPENSE_BIGC) },
                { "EmployeeExpenseBJC", typeof(Models.Employee.HRB_EMP_EXPENSE_BJC) }
            };
        }

        public bool IsValidModel(string modelName)
        {
            if (string.IsNullOrWhiteSpace(modelName))
                return false;

            return _modelTypes.ContainsKey(modelName);
        }

        public string GetModelDisplayName(string modelName)
        {
            if (!IsValidModel(modelName))
                return modelName;

            // Custom display names
            var customDisplayNames = new Dictionary<string, string>
            {
                { "BUSupervisor", "BU & COBU" },
                { "ItemConfig", "Data Constraints" }
            };

            if (customDisplayNames.TryGetValue(modelName, out var customName))
                return customName;

            // Convert camelCase to "Camel Case"
            return System.Text.RegularExpressions.Regex.Replace(modelName, "(\\B[A-Z])", " $1");
        }

        public async Task<object> GetAllAsync(string modelName)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                var modelType = _modelTypes[modelName];
                var dbSetProperty = _context.GetType().GetProperties()
                    .FirstOrDefault(p => p.PropertyType.IsGenericType &&
                                        p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>) &&
                                        p.PropertyType.GetGenericArguments()[0] == modelType);

                if (dbSetProperty == null)
                    throw new InvalidOperationException($"DbSet not found for model: {modelName}");

                var dbSet = dbSetProperty.GetValue(_context);
                var method = typeof(EntityFrameworkQueryableExtensions)
                    .GetMethod(nameof(EntityFrameworkQueryableExtensions.ToListAsync))
                    ?.MakeGenericMethod(modelType);

                if (method == null)
                    throw new InvalidOperationException("ToListAsync method not found");

                var task = (Task)method.Invoke(null, new[] { dbSet, default(CancellationToken) })!;
                await task.ConfigureAwait(false);

                var resultProperty = task.GetType().GetProperty("Result");
                return resultProperty?.GetValue(task) ?? new List<object>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all records for model: {ModelName}", modelName);
                throw;
            }
        }

        public async Task<object> GetColumnsAsync(string modelName)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                await Task.CompletedTask; // Async for future use

                var modelType = _modelTypes[modelName];
                _logger.LogInformation("Getting columns for model: {ModelName}, Type: {TypeName}", modelName, modelType.Name);

                var properties = modelType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
                _logger.LogInformation("Found {Count} properties for model: {ModelName}", properties.Length, modelName);

                var columns = properties.Select(prop =>
                {
                    var columnAttr = prop.GetCustomAttribute<ColumnAttribute>();
                    var keyAttr = prop.GetCustomAttribute<KeyAttribute>();
                    var requiredAttr = prop.GetCustomAttribute<RequiredAttribute>();
                    var stringLengthAttr = prop.GetCustomAttribute<StringLengthAttribute>();

                    // ✅ Convert to camelCase for JavaScript convention
                    var fieldName = char.ToLowerInvariant(prop.Name[0]) + prop.Name.Substring(1);
                    var headerName = SplitCamelCase(prop.Name);
                    var isPrimaryKey = keyAttr != null;
                    var isRequired = requiredAttr != null;
                    var maxLength = stringLengthAttr?.MaximumLength;

                    // Determine column type and width
                    var propType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                    string dataType = "text"; // For frontend use
                    int width = 150; // Default width

                    if (propType == typeof(int) || propType == typeof(long))
                    {
                        dataType = "number";
                        width = 120;
                    }
                    else if (propType == typeof(decimal) || propType == typeof(double))
                    {
                        dataType = "number";
                        width = 150;
                    }
                    else if (propType == typeof(DateTime))
                    {
                        dataType = "date";
                        width = 150;
                    }
                    else if (propType == typeof(bool))
                    {
                        dataType = "boolean";
                        width = 100;
                    }
                    else
                    {
                        width = maxLength.HasValue && maxLength.Value < 50 ? 150 : 200;
                    }

                    return new
                    {
                        field = fieldName,
                        headerName = headerName,
                        dataType = dataType, // Changed from 'type' to 'dataType' to avoid AG Grid warnings
                        editable = !isPrimaryKey,
                        isPrimaryKey = isPrimaryKey,
                        isRequired = isRequired,
                        maxLength = maxLength ?? 0,
                        width = width,
                        hide = fieldName.Contains("UpdatedBy") || fieldName.Contains("UpdatedDate"),
                        filter = true,
                        sortable = true,
                        resizable = true
                    };
                }).ToList();

                _logger.LogInformation("Generated {Count} column definitions for model: {ModelName}", columns.Count, modelName);
                return columns;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting columns for model: {ModelName}", modelName);
                throw;
            }
        }

        public async Task<object?> GetByIdAsync(string modelName, Dictionary<string, object> keys)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                var modelType = _modelTypes[modelName];
                var dbSetProperty = _context.GetType().GetProperties()
                    .FirstOrDefault(p => p.PropertyType.IsGenericType &&
                                        p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>) &&
                                        p.PropertyType.GetGenericArguments()[0] == modelType);

                if (dbSetProperty == null)
                    throw new InvalidOperationException($"DbSet not found for model: {modelName}");

                var dbSet = dbSetProperty.GetValue(_context);

                // Get primary key properties
                var keyProperties = modelType.GetProperties()
                    .Where(p => p.GetCustomAttribute<KeyAttribute>() != null)
                    .ToList();

                if (keyProperties.Count == 0)
                    throw new InvalidOperationException($"No primary key found for model: {modelName}");

                // Build key values array
                var keyValues = new object[keyProperties.Count];
                for (int i = 0; i < keyProperties.Count; i++)
                {
                    var keyProp = keyProperties[i];
                    // Try both PascalCase and camelCase
                    var camelCaseName = char.ToLowerInvariant(keyProp.Name[0]) + keyProp.Name.Substring(1);

                    if (keys.TryGetValue(keyProp.Name, out var keyValue) || keys.TryGetValue(camelCaseName, out keyValue))
                    {
                        keyValues[i] = ConvertValue(keyValue, keyProp.PropertyType) ?? throw new InvalidOperationException($"Key value for {keyProp.Name} cannot be null");
                    }
                    else
                    {
                        throw new InvalidOperationException($"Missing key value for: {keyProp.Name} (or {camelCaseName})");
                    }
                }

                var findMethod = dbSet?.GetType().GetMethod("FindAsync", new[] { typeof(object[]) });

                if (findMethod == null)
                    throw new InvalidOperationException("FindAsync method not found");

                // FindAsync returns ValueTask<T>, not Task<T>
                var valueTask = findMethod.Invoke(dbSet, new object[] { keyValues });

                if (valueTask == null)
                    throw new InvalidOperationException("FindAsync returned null");

                // Use reflection to await the ValueTask
                var asTaskMethod = valueTask.GetType().GetMethod("AsTask");
                if (asTaskMethod != null)
                {
                    var task = (Task)asTaskMethod.Invoke(valueTask, null)!;
                    await task.ConfigureAwait(false);
                    var resultProperty = task.GetType().GetProperty("Result");
                    return resultProperty?.GetValue(task);
                }
                else
                {
                    // Fallback: try to get Result directly from ValueTask
                    var resultProperty = valueTask.GetType().GetProperty("Result");
                    return resultProperty?.GetValue(valueTask);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting record by keys for model: {ModelName}, Keys: {@Keys}", modelName, keys);
                throw;
            }
        }

        public async Task<object> CreateAsync(string modelName, Dictionary<string, object?> data)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                var modelType = _modelTypes[modelName];
                var entity = Activator.CreateInstance(modelType)!;

                // Set properties from data dictionary
                foreach (var kvp in data)
                {
                    // Try both exact match and PascalCase version
                    var prop = modelType.GetProperty(kvp.Key);
                    if (prop == null && kvp.Key.Length > 0)
                    {
                        // Try PascalCase version (first char uppercase)
                        var pascalCaseName = char.ToUpperInvariant(kvp.Key[0]) + kvp.Key.Substring(1);
                        prop = modelType.GetProperty(pascalCaseName);
                    }

                    if (prop != null && prop.CanWrite)
                    {
                        var value = ConvertValue(kvp.Value, prop.PropertyType);
                        prop.SetValue(entity, value);
                    }
                }

                // Set audit fields if they exist
                SetAuditFields(entity, isUpdate: false);

                var dbSetProperty = _context.GetType().GetProperties()
                    .FirstOrDefault(p => p.PropertyType.IsGenericType &&
                                        p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>) &&
                                        p.PropertyType.GetGenericArguments()[0] == modelType);

                if (dbSetProperty == null)
                    throw new InvalidOperationException($"DbSet not found for model: {modelName}");

                var dbSet = dbSetProperty.GetValue(_context);
                var addMethod = dbSet?.GetType().GetMethod("Add", new[] { modelType });
                addMethod?.Invoke(dbSet, new[] { entity });

                await _context.SaveChangesAsync();

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating record for model: {ModelName}", modelName);
                throw;
            }
        }

        public async Task<object> UpdateAsync(string modelName, Dictionary<string, object> keys, Dictionary<string, object?> data)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                var entity = await GetByIdAsync(modelName, keys);
                if (entity == null)
                    throw new InvalidOperationException($"Record not found: {modelName} with keys {@keys}");

                var modelType = _modelTypes[modelName];

                // Update properties from data dictionary
                foreach (var kvp in data)
                {
                    // Try both exact match and PascalCase version
                    var prop = modelType.GetProperty(kvp.Key);
                    if (prop == null && kvp.Key.Length > 0)
                    {
                        // Try PascalCase version (first char uppercase)
                        var pascalCaseName = char.ToUpperInvariant(kvp.Key[0]) + kvp.Key.Substring(1);
                        prop = modelType.GetProperty(pascalCaseName);
                    }

                    if (prop != null && prop.CanWrite && !prop.GetCustomAttributes<KeyAttribute>().Any())
                    {
                        var value = ConvertValue(kvp.Value, prop.PropertyType);
                        prop.SetValue(entity, value);
                    }
                }

                // Set audit fields
                SetAuditFields(entity, isUpdate: true);

                _context.Entry(entity).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating record for model: {ModelName}, Keys: {@Keys}", modelName, keys);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string modelName, Dictionary<string, object> keys)
        {
            if (!IsValidModel(modelName))
                throw new ArgumentException($"Invalid model name: {modelName}");

            try
            {
                var entity = await GetByIdAsync(modelName, keys);
                if (entity == null)
                    return false;

                var modelType = _modelTypes[modelName];

                // Check if model has IsActive property (soft delete)
                var isActiveProperty = modelType.GetProperty("IsActive");
                if (isActiveProperty != null)
                {
                    // Soft delete
                    isActiveProperty.SetValue(entity, false);
                    SetAuditFields(entity, isUpdate: true);
                    _context.Entry(entity).State = EntityState.Modified;
                }
                else
                {
                    // Hard delete
                    _context.Remove(entity);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting record for model: {ModelName}, Keys: {@Keys}", modelName, keys);
                throw;
            }
        }

        // Helper Methods

        private void SetAuditFields(object entity, bool isUpdate)
        {
            var entityType = entity.GetType();

            // Set UpdatedDate
            var updatedDateProp = entityType.GetProperty("UpdatedDate");
            if (updatedDateProp != null && updatedDateProp.CanWrite)
            {
                updatedDateProp.SetValue(entity, DateTime.Now);
            }

            // Set UpdatedBy (TODO: Get from current user session)
            var updatedByProp = entityType.GetProperty("UpdatedBy");
            if (updatedByProp != null && updatedByProp.CanWrite)
            {
                updatedByProp.SetValue(entity, "System"); // TODO: Replace with actual user
            }

            // Set IsActive for new records
            if (!isUpdate)
            {
                var isActiveProp = entityType.GetProperty("IsActive");
                if (isActiveProp != null && isActiveProp.CanWrite)
                {
                    isActiveProp.SetValue(entity, true);
                }
            }
        }

        private object? ConvertValue(object? value, Type targetType)
        {
            if (value == null)
                return null;

            var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;

            // Handle JsonElement from ASP.NET Core JSON deserialization
            if (value is System.Text.Json.JsonElement jsonElement)
            {
                return ConvertJsonElement(jsonElement, underlyingType);
            }

            if (value.GetType() == underlyingType)
                return value;

            try
            {
                return Convert.ChangeType(value, underlyingType);
            }
            catch
            {
                return value;
            }
        }

        private object? ConvertJsonElement(System.Text.Json.JsonElement jsonElement, Type targetType)
        {
            try
            {
                // Handle different JSON value types
                switch (jsonElement.ValueKind)
                {
                    case System.Text.Json.JsonValueKind.String:
                        var stringValue = jsonElement.GetString();
                        if (targetType == typeof(string))
                            return stringValue;
                        if (targetType == typeof(DateTime) && DateTime.TryParse(stringValue, out var dateValue))
                            return dateValue;
                        return Convert.ChangeType(stringValue, targetType);

                    case System.Text.Json.JsonValueKind.Number:
                        if (targetType == typeof(int) || targetType == typeof(int?))
                            return jsonElement.GetInt32();
                        if (targetType == typeof(long) || targetType == typeof(long?))
                            return jsonElement.GetInt64();
                        if (targetType == typeof(decimal) || targetType == typeof(decimal?))
                            return jsonElement.GetDecimal();
                        if (targetType == typeof(double) || targetType == typeof(double?))
                            return jsonElement.GetDouble();
                        if (targetType == typeof(float) || targetType == typeof(float?))
                            return jsonElement.GetSingle();
                        if (targetType == typeof(short) || targetType == typeof(short?))
                            return jsonElement.GetInt16();
                        if (targetType == typeof(byte) || targetType == typeof(byte?))
                            return jsonElement.GetByte();
                        return jsonElement.GetInt32(); // Default to int

                    case System.Text.Json.JsonValueKind.True:
                        return true;

                    case System.Text.Json.JsonValueKind.False:
                        return false;

                    case System.Text.Json.JsonValueKind.Null:
                        return null;

                    default:
                        // For complex types, try to deserialize
                        return System.Text.Json.JsonSerializer.Deserialize(jsonElement.GetRawText(), targetType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error converting JsonElement to {TargetType}, Value: {Value}",
                    targetType.Name, jsonElement.ToString());
                return null;
            }
        }

        private string SplitCamelCase(string input)
        {
            return System.Text.RegularExpressions.Regex.Replace(input, "(\\B[A-Z])", " $1");
        }
    }
}
