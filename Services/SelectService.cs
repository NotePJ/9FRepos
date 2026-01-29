using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Cost;
using HCBPCoreUI_Backend.Models.Config;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
  public class SelectService : ISelectService
  {
    private readonly HRBudgetDbContext _context;
    public SelectService(HRBudgetDbContext context)
    {
      _context = context;
    }

    public async Task<List<object>> GetActiveCompaniesAsync()
    {
      return await _context.HRB_MST_COMPANY
          .AsNoTracking()
          .Where(c => c.IsActive == true)
          .Select(c => new { c.CompanyId, c.CompanyCode, c.CompanyName })
          .ToListAsync<object>();
    }

    /// <summary>
    /// ดึง Companies ตาม User CompanyAccess (BJC, BIGC, หรือ BJC,BIGC)
    /// </summary>
    public async Task<List<object>> GetActiveCompaniesByAccessAsync(string? companyAccess)
    {
      // ถ้าไม่มี companyAccess → return empty (security)
      if (string.IsNullOrEmpty(companyAccess))
        return new List<object>();

      // Parse CompanyAccess (BJC, BIGC, หรือ BJC,BIGC)
      var allowedCodes = companyAccess.Split(',')
          .Select(c => c.Trim().ToUpper())
          .Where(c => !string.IsNullOrEmpty(c))
          .ToList();

      return await _context.HRB_MST_COMPANY
          .AsNoTracking()
          .Where(c => c.IsActive == true && allowedCodes.Contains(c.CompanyCode.ToUpper()))
          .Select(c => new { c.CompanyId, c.CompanyCode, c.CompanyName })
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetActiveCostCentersAsync(int companyId)
    {
      return await _context.HRB_MST_COST_CENTER
          .AsNoTracking()
          .Where(cc => cc.IsActive == true && cc.CompanyId == companyId &&
                       cc.StartDate == _context.HRB_MST_COST_CENTER
                           .Where(cx => cx.IsActive == true && cx.CompanyId == cc.CompanyId)
                           .Max(cx => cx.StartDate) &&
                       cc.EndDate == null)
          .Select(cc => new { cc.CostCenterCode, cc.CostCenterName })
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetAllActiveCostCentersAsync()
    {
      return await _context.HRB_MST_COST_CENTER
          .AsNoTracking()
          .Where(cc => cc.IsActive == true && cc.EndDate == null)
          .Select(cc => new { cc.CompanyId, cc.CostCenterCode, cc.CostCenterName })
          .Distinct()
          .OrderBy(cc => cc.CompanyId)
          .ThenBy(cc => cc.CostCenterCode)
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetActiveStatusesAsync(int companyId, string statusType)
    {
      if (string.IsNullOrEmpty(statusType))
      {
        return await _context.HRB_MST_STATUS
            .AsNoTracking()
            .Where(s => s.IsActive == true  && s.CompanyId == companyId)
            .Select(s => new { s.StatusCode, s.StatusName })
            .Distinct()
            .ToListAsync<object>();
      }
      else
      {
        return await _context.HRB_MST_STATUS
            .AsNoTracking()
            .Where(s => s.IsActive == true && s.StatusType == statusType && s.CompanyId == companyId)
            .Select(s => new { s.StatusCode, s.StatusName })
            .Distinct()
            .ToListAsync<object>();
      }
    }

    public async Task<List<object>> GetActivePositionsAsync(int companyId)
    {
      return await _context.HRB_MST_POSITION
          .AsNoTracking()
          .Where(p => p.IsActive == true && p.CompanyId == companyId)
          .Select(p => new { p.PositionCode, p.PositionName })
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetActiveJobBandsAsync(int companyId, string? positionCode = null)
    {
      var query = from hmp in _context.HRB_MST_POSITION
                  join hmjb in _context.HRB_MST_JOB_BAND
                      on new { hmp.JobBand, hmp.CompanyId } equals new { JobBand = hmjb.JbName, hmjb.CompanyId }
                  where hmp.IsActive == true && hmp.CompanyId == companyId && hmjb.IsActive == true
                      && (string.IsNullOrEmpty(positionCode) || hmp.PositionCode == positionCode)
                  orderby hmjb.JbId
                  select new { hmjb.JbId, hmjb.JbCode, hmjb.JbName };

      return await query
          .AsNoTracking()
          .Distinct()
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetBudgetEmployeeTypesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Employee Type");
    }

    public async Task<List<object>> GetEmployeePrefixesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Prefixes");
    }

    public async Task<List<object>> GetBudgetNewHCAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "New HC");
    }

    public async Task<List<object>> GetBudgetLENewPeriodsAsync(int companyId)
    {
      return await GetItemConfigIntValue(companyId, "LE Period");
    }

    public async Task<List<object>> GetBudgetNoOfMonthsAsync(int companyId)
    {
      return await GetItemConfigIntValue(companyId, "No. of Month");
    }

    public async Task<List<object>> GetBudgetLENoOfMonthsAsync(int companyId)
    {
      return await GetItemConfigIntValue(companyId, "LE No. of Month");
    }

    public async Task<List<object>> GetBudgetJoinPVFAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Join PVF");
    }

    public async Task<List<object>> GetBudgetSalaryStructuresAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Salary Structure");
    }

    public async Task<List<object>> GetBudgetMeritPercentagesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Merit Percent");
    }

    public async Task<List<object>> GetBudgetDiscountPFPercentagesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Discount PF Percent");
    }

    public async Task<List<object>> GetBudgetLaborFundFeesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Labor fund fee");
    }

    public async Task<List<object>> GetBudgetFocusHCAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Focus HC");
    }

    public async Task<List<object>> GetBudgetFocusPEAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Focus PE");
    }

    public async Task<List<object>> GetBudgetExecutivesAsync(int companyId)
    {
      return await GetItemConfigByType(companyId, "Executives");
    }

    public async Task<List<object>> GetBudgetGroupRunRatesAsync(int companyId, string? costCenterCode)
    {
      return await (
          from ccgr in _context.HRB_COST_GROUP_RUNRATE
          join cfgr in _context.HRB_CONF_GROUP_RUNRATE
              on new { ccgr.CompanyId, ccgr.RunId } equals new { cfgr.CompanyId, cfgr.RunId }
          where ccgr.CompanyId == companyId && ccgr.IsActive == true
              && (string.IsNullOrEmpty(costCenterCode) || ccgr.CostCenterCode == costCenterCode)
          select new
          {
            ccgr.Grouping,
            cfgr.RunRateCode,
            cfgr.RunRateName,
            cfgr.RunRateValue
          }
      )
      .AsNoTracking()
      .ToListAsync<object>();
    }

    public async Task<List<object>> GetBudgetSalaryRangesAsync(int companyId, string? jobBand)
    {
      return await _context.HRB_CONF_SALARY_STRUCTURE
          .AsNoTracking()
          .Where(sr => sr.IsActive == true && sr.CompanyId == companyId &&
                       (string.IsNullOrEmpty(jobBand) || sr.JobBand == jobBand))
          .Select(sr => new { sr.JobBand, sr.FunctionName, sr.MinSalary, sr.MidSalary, sr.P75Salary, sr.MaxSalary })
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetBudgetIsExecutiveByJobBandAsync(int companyId, string? jobBand)
    {
      return await _context.HRB_MST_JOB_BAND
          .AsNoTracking()
          .Where(jb => jb.IsActive == true && jb.CompanyId == companyId && jb.JbCode == jobBand)
          .Select(jb => new { jb.JbName, jb.IsExc })
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetBudgetBonusTypesAsync(int companyId, int budgetYear)
    {
      return await _context.HRB_CONF_BUDGET_BONUS
          .AsNoTracking()
          .Where(br => br.BudgetYear == budgetYear && br.CompanyId == companyId && br.IsActive == true)
          .Select(br => new { br.BudgetCategory, br.Rate })
          .Distinct()
          .ToListAsync<object>();
    }

    public async Task<List<object>> GetBusinessUnitsAsync(int companyId, string? cobuCode)
    {
      return await _context.HRB_CONF_BU_SUP
          .AsNoTracking()
          .Where(bu => bu.IsActive == true && bu.CompanyId == companyId &&
                       (string.IsNullOrEmpty(cobuCode) || bu.CobuCode == cobuCode))
          .Select(bu => new { bu.BuId, bu.BuCode, bu.BuName, bu.CobuCode })
          .ToListAsync<object>();
    }

    private async Task<List<object>> GetItemConfigByType(int companyId, string itemType)
    {
      return await _context.HRB_MST_ITEM_CONFIG
          .AsNoTracking()
          .Where(ic => ic.IsActive == true && ic.ItemType == itemType && ic.CompanyId == companyId)
          .OrderBy(ic => ic.ItemCode)
          .Select(ic => new { ic.ItemCode, ic.ItemName, ItemValue = ic.ItemValue ?? 0 })
          .ToListAsync<object>();
    }

    private async Task<List<object>> GetItemConfigIntValue(int companyId, string itemType)
    {
      return await _context.HRB_MST_ITEM_CONFIG
          .AsNoTracking()
          .Where(ic => ic.IsActive == true && ic.ItemType == itemType && ic.CompanyId == companyId)
          .OrderBy(ic => ic.ItemId)
          .Select(ic => new { ic.ItemCode, ic.ItemName, ItemValue = Convert.ToInt32(ic.ItemValue ?? 0) })
          .ToListAsync<object>();
    }
  }
}
