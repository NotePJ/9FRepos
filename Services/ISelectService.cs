using System.Collections.Generic;
using System.Threading.Tasks;

namespace HCBPCoreUI_Backend.Services
{
  public interface ISelectService
  {
    Task<List<object>> GetActiveCompaniesAsync();
    Task<List<object>> GetActiveCompaniesByAccessAsync(string? companyAccess);
    Task<List<object>> GetActiveCostCentersAsync(int companyId);
    Task<List<object>> GetAllActiveCostCentersAsync();
    Task<List<object>> GetActiveStatusesAsync(int companyId, string statusType);
    Task<List<object>> GetActivePositionsAsync(int companyId);
    Task<List<object>> GetActiveJobBandsAsync(int companyId, string? positionCode);
    Task<List<object>> GetBudgetEmployeeTypesAsync(int companyId);
    Task<List<object>> GetBudgetNewHCAsync(int companyId);
    Task<List<object>> GetBudgetLENewPeriodsAsync(int companyId);
    Task<List<object>> GetBudgetNoOfMonthsAsync(int companyId);
    Task<List<object>> GetBudgetLENoOfMonthsAsync(int companyId);
    Task<List<object>> GetBudgetJoinPVFAsync(int companyId);
    Task<List<object>> GetBudgetSalaryStructuresAsync(int companyId);
    Task<List<object>> GetBudgetSalaryRangesAsync(int companyId, string? jobBand);
    Task<List<object>> GetBudgetMeritPercentagesAsync(int companyId);
    Task<List<object>> GetBudgetDiscountPFPercentagesAsync(int companyId);
    Task<List<object>> GetBudgetLaborFundFeesAsync(int companyId);
    Task<List<object>> GetBudgetFocusHCAsync(int companyId);
    Task<List<object>> GetBudgetFocusPEAsync(int companyId);
    Task<List<object>> GetBudgetExecutivesAsync(int companyId);
    Task<List<object>> GetBudgetGroupRunRatesAsync(int companyId, string? costCenterCode);
    Task<List<object>> GetBudgetBonusTypesAsync(int companyId, int budgetYear);
    Task<List<object>> GetBudgetIsExecutiveByJobBandAsync(int companyId, string? jobBand);
    Task<List<object>> GetBusinessUnitsAsync(int companyId, string? cobuCode);
    Task<List<object>> GetEmployeePrefixesAsync(int companyId);
  }
}
