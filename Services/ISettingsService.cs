using System.Collections.Generic;
using System.Threading.Tasks;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// Generic Settings Service Interface
    /// Provides CRUD operations for all Master/Config/Cost/Employee models
    /// </summary>
    public interface ISettingsService
    {
        /// <summary>
        /// Get all records from a model
        /// </summary>
        /// <param name="modelName">Model name (e.g., "Company", "CostCenter")</param>
        /// <returns>List of records as dynamic objects</returns>
        Task<object> GetAllAsync(string modelName);

        /// <summary>
        /// Get column definitions for AG Grid
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <returns>Column definitions with field names, types, and display names</returns>
        Task<object> GetColumnsAsync(string modelName);

        /// <summary>
        /// Get a single record by ID (supports composite keys)
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <param name="keys">Primary key values (for composite keys, pass multiple values)</param>
        /// <returns>Single record as dynamic object</returns>
        Task<object?> GetByIdAsync(string modelName, Dictionary<string, object> keys);

        /// <summary>
        /// Create a new record
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <param name="data">Record data as dictionary</param>
        /// <returns>Created record with ID</returns>
        Task<object> CreateAsync(string modelName, Dictionary<string, object?> data);

        /// <summary>
        /// Update an existing record (supports composite keys)
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <param name="keys">Primary key values</param>
        /// <param name="data">Updated data as dictionary</param>
        /// <returns>Updated record</returns>
        Task<object> UpdateAsync(string modelName, Dictionary<string, object> keys, Dictionary<string, object?> data);

        /// <summary>
        /// Delete a record (soft delete if IsActive exists, supports composite keys)
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <param name="keys">Primary key values</param>
        /// <returns>Success status</returns>
        Task<bool> DeleteAsync(string modelName, Dictionary<string, object> keys);

        /// <summary>
        /// Check if a model name is valid
        /// </summary>
        /// <param name="modelName">Model name to validate</param>
        /// <returns>True if model exists</returns>
        bool IsValidModel(string modelName);

        /// <summary>
        /// Get model display name
        /// </summary>
        /// <param name="modelName">Model name</param>
        /// <returns>User-friendly display name</returns>
        string GetModelDisplayName(string modelName);
    }
}
