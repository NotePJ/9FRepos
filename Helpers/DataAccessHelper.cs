using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Helpers
{
    /// <summary>
    /// Data Access Helper
    /// ตรวจสอบและกรองข้อมูลตามสิทธิ์การเข้าถึงของ User
    /// </summary>
    public static class DataAccessHelper
    {
        // ═══════════════════════════════════════════════════════════════
        // Access Check Methods
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Check if user can access a specific cost center
        /// </summary>
        public static async Task<bool> CanAccessCostCenterAsync(
            HRBudgetDbContext context,
            int userId,
            string costCenterCode,
            int? companyId = null)
        {
            // Check if user is admin
            if (await IsAdminAsync(context, userId))
                return true;

            // Get user data access
            var dataAccess = await context.HRB_USER_DATA_ACCESS
                .Where(da => da.UserId == userId && da.IsActive)
                .ToListAsync();

            // Check each access rule
            foreach (var access in dataAccess)
            {
                if (CheckAccessMatch(access, costCenterCode, companyId))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Check if user can access with specific access type
        /// </summary>
        public static async Task<bool> CanAccessWithTypeAsync(
            HRBudgetDbContext context,
            int userId,
            string costCenterCode,
            string requiredType,
            int? companyId = null)
        {
            // Admin has full access
            if (await IsAdminAsync(context, userId))
                return true;

            var dataAccess = await context.HRB_USER_DATA_ACCESS
                .Where(da => da.UserId == userId && da.IsActive)
                .ToListAsync();

            foreach (var access in dataAccess)
            {
                if (CheckAccessMatch(access, costCenterCode, companyId))
                {
                    // Check access type
                    var accessTypeValue = GetAccessTypeValue(access.AccessType);
                    var requiredTypeValue = GetAccessTypeValue(requiredType);

                    if (accessTypeValue >= requiredTypeValue)
                        return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Get access type for a cost center
        /// </summary>
        public static async Task<string?> GetAccessTypeAsync(
            HRBudgetDbContext context,
            int userId,
            string costCenterCode,
            int? companyId = null)
        {
            if (await IsAdminAsync(context, userId))
                return "FULL";

            var dataAccess = await context.HRB_USER_DATA_ACCESS
                .Where(da => da.UserId == userId && da.IsActive)
                .ToListAsync();

            string? highestType = null;
            int highestTypeValue = 0;

            foreach (var access in dataAccess)
            {
                if (CheckAccessMatch(access, costCenterCode, companyId))
                {
                    var typeValue = GetAccessTypeValue(access.AccessType);
                    if (typeValue > highestTypeValue)
                    {
                        highestTypeValue = typeValue;
                        highestType = access.AccessType;
                    }
                }
            }

            return highestType;
        }

        // ═══════════════════════════════════════════════════════════════
        // Filter Methods for Queries
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Get list of accessible cost center codes for a user
        /// Logic: Admin → All | SuperUser → ตาม CompanyAccess | User → ตาม Data Access Rule
        /// </summary>
        public static async Task<List<string>> GetAccessibleCostCentersAsync(
            HRBudgetDbContext context,
            int userId,
            int? companyId = null)
        {
            // 1️⃣ Admin Role → เห็นทุก Cost Center
            if (await IsAdminAsync(context, userId))
            {
                var query = context.HRB_MST_COST_CENTER.AsQueryable();
                if (companyId.HasValue)
                {
                    query = query.Where(cc => cc.CompanyId == companyId.Value);
                }
                return await query.Select(cc => cc.CostCenterCode).ToListAsync();
            }

            // 2️⃣ SuperUser Role → เห็นทุก Cost Center ตาม CompanyAccess
            if (await IsSuperUserAsync(context, userId))
            {
                var allowedCompanyIds = await GetUserCompanyAccessIdsAsync(context, userId);

                var query = context.HRB_MST_COST_CENTER.AsQueryable();

                // Filter by user's CompanyAccess
                if (allowedCompanyIds.Any())
                {
                    query = query.Where(cc => allowedCompanyIds.Contains(cc.CompanyId));
                }

                // Additional filter by requested companyId
                if (companyId.HasValue)
                {
                    query = query.Where(cc => cc.CompanyId == companyId.Value);
                }

                return await query.Select(cc => cc.CostCenterCode).ToListAsync();
            }

            // 3️⃣ Regular User → เห็นเฉพาะที่มี Data Access Rule
            var dataAccess = await context.HRB_USER_DATA_ACCESS
                .Where(da => da.UserId == userId && da.IsActive)
                .ToListAsync();

            // ถ้าไม่มี Data Access Rule → ไม่เห็นข้อมูลใดๆ
            if (!dataAccess.Any())
            {
                return new List<string>();
            }

            var accessibleCodes = new HashSet<string>();

            foreach (var access in dataAccess)
            {
                var codes = await GetCostCentersByAccessAsync(context, access, companyId);
                foreach (var code in codes)
                {
                    accessibleCodes.Add(code);
                }
            }

            return accessibleCodes.ToList();
        }

        /// <summary>
        /// Get list of accessible company IDs for a user
        /// </summary>
        public static async Task<List<int>> GetAccessibleCompanyIdsAsync(
            HRBudgetDbContext context,
            int userId)
        {
            if (await IsAdminAsync(context, userId))
            {
                return await context.HRB_MST_COMPANY
                    .Where(c => c.IsActive == true)
                    .Select(c => c.CompanyId)
                    .ToListAsync();
            }

            var dataAccess = await context.HRB_USER_DATA_ACCESS
                .Where(da => da.UserId == userId && da.IsActive)
                .ToListAsync();

            var companyIds = new HashSet<int>();

            foreach (var access in dataAccess)
            {
                if (access.CompanyId.HasValue)
                {
                    companyIds.Add(access.CompanyId.Value);
                }
                else
                {
                    // NULL CompanyId means all companies - get all company IDs
                    var allIds = await context.HRB_MST_COMPANY
                        .Where(c => c.IsActive == true)
                        .Select(c => c.CompanyId)
                        .ToListAsync();
                    foreach (var id in allIds)
                    {
                        companyIds.Add(id);
                    }
                }
            }

            return companyIds.ToList();
        }

        // ═══════════════════════════════════════════════════════════════
        // Private Helper Methods
        // ═══════════════════════════════════════════════════════════════

        private static async Task<bool> IsAdminAsync(HRBudgetDbContext context, int userId)
        {
            var roleIds = await context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            return await context.HRB_ROLE
                .AnyAsync(r => roleIds.Contains(r.RoleId) &&
                              r.RoleCode.ToUpper() == "ADMIN" &&
                              r.IsActive);
        }

        /// <summary>
        /// Check if user has SuperUser role
        /// </summary>
        private static async Task<bool> IsSuperUserAsync(HRBudgetDbContext context, int userId)
        {
            var roleIds = await context.HRB_USER_ROLE
                .Where(ur => ur.UserId == userId && ur.IsActive)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            return await context.HRB_ROLE
                .AnyAsync(r => roleIds.Contains(r.RoleId) &&
                              r.RoleCode.ToUpper() == "SUPERUSER" &&
                              r.IsActive);
        }

        /// <summary>
        /// Get list of CompanyIds from user's CompanyAccess field
        /// CompanyAccess: "BJC" → [1], "BIGC" → [2], "BJC,BIGC" → [1,2]
        /// </summary>
        private static async Task<List<int>> GetUserCompanyAccessIdsAsync(HRBudgetDbContext context, int userId)
        {
            var user = await context.HRB_USER
                .Where(u => u.UserId == userId)
                .Select(u => u.CompanyAccess)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(user))
                return new List<int>();

            var companyIds = new List<int>();
            var accessParts = user.ToUpper().Split(',');

            foreach (var part in accessParts)
            {
                var trimmed = part.Trim();
                if (trimmed == "BJC")
                    companyIds.Add(1);
                else if (trimmed == "BIGC")
                    companyIds.Add(2);
            }

            return companyIds;
        }

        private static bool CheckAccessMatch(HRB_USER_DATA_ACCESS access, string costCenterCode, int? companyId)
        {
            // If access has specific cost center, check exact match
            if (!string.IsNullOrEmpty(access.CostCenterCode))
            {
                return access.CostCenterCode.Equals(costCenterCode, StringComparison.OrdinalIgnoreCase);
            }

            // If no specific cost center, check company match
            if (access.CompanyId.HasValue)
            {
                return !companyId.HasValue || access.CompanyId == companyId;
            }

            // NULL CompanyId and NULL CostCenterCode means all access
            return true;
        }

        private static async Task<List<string>> GetCostCentersByAccessAsync(
            HRBudgetDbContext context,
            HRB_USER_DATA_ACCESS access,
            int? filterCompanyId)
        {
            var result = new List<string>();

            // If specific cost center is defined
            if (!string.IsNullOrEmpty(access.CostCenterCode))
            {
                result.Add(access.CostCenterCode);
                return result;
            }

            // If company is defined, get all cost centers for that company
            if (access.CompanyId.HasValue)
            {
                result = await context.HRB_MST_COST_CENTER
                    .Where(cc => cc.CompanyId == access.CompanyId.Value)
                    .Select(cc => cc.CostCenterCode)
                    .ToListAsync();
            }
            else
            {
                // All cost centers (optionally filtered by company)
                var query = context.HRB_MST_COST_CENTER.AsQueryable();
                if (filterCompanyId.HasValue)
                {
                    query = query.Where(cc => cc.CompanyId == filterCompanyId.Value);
                }
                result = await query.Select(cc => cc.CostCenterCode).ToListAsync();
            }

            return result;
        }

        private static int GetAccessTypeValue(string accessType)
        {
            return accessType.ToUpper() switch
            {
                "VIEW_ONLY" => 1,
                "EDIT" => 2,
                "FULL" => 3,
                _ => 0
            };
        }

        // ═══════════════════════════════════════════════════════════════
        // Extension Methods for Session
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Check if session user can access cost center
        /// </summary>
        public static bool CanAccessCostCenter(
            UserSessionDto session,
            string costCenterCode,
            int? companyId = null)
        {
            // Admin has full access
            if (session.IsAdmin)
                return true;

            // For now, simplified check - needs to be enhanced with actual data access
            return true;
        }

        /// <summary>
        /// Check if session user is admin or super user
        /// </summary>
        public static bool IsAdminOrSuperUser(UserSessionDto session)
        {
            return session.IsAdmin || session.IsSuperUser;
        }
    }
}
