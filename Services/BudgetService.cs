using HCBPCoreUI_Backend.DTOs.Budget;
using HCBPCoreUI_Backend.DTOs.Employee;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Exceptions;
using HCBPCoreUI_Backend.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

namespace HCBPCoreUI_Backend.Services
{
  public class BudgetService : IBudgetService
  {
    private readonly HRBudgetDbContext _context;

    public BudgetService(HRBudgetDbContext context)
    {
      _context = context;
    }

    // Company-Specific API Methods (Returns actual Company-specific DTOs)
    public async Task<object> GetBudgetsAsync(BudgetFilterDto filter)
    {
      try
      {
        // ตรวจสอบ CompanyID เพื่อเลือก table ที่ถูกต้อง
        if (filter.CompanyID == "1") // BJC
        {
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          return bjcBudgets; // Return List<BudgetBjcDto> directly
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var bigcBudgets = await GetBigcBudgetsAsync(filter);
          return bigcBudgets; // Return List<BudgetBigcDto> directly
        }
        else
        {
          // ถ้าไม่ระบุ CompanyID ให้ดึงจากทั้งสอง company และรวมกัน (as unified response)
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          var bigcBudgets = await GetBigcBudgetsAsync(filter);

          var bjcMapped = bjcBudgets.Select(b => MapToResponseDto(b));
          var bigcMapped = bigcBudgets.Select(b => MapToResponseDto(b));

          return bjcMapped.Union(bigcMapped).ToList(); // Return List<BudgetResponseDto>
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBudgetsAsync: {ex.Message}");
        return filter.CompanyID == "1" ? new List<BudgetBjcDto>() :
               filter.CompanyID == "2" ? new List<BudgetBigcDto>() :
               new List<BudgetResponseDto>();
      }
    }

    // Legacy Unified API Methods (Backward compatibility)
    public async Task<List<BudgetResponseDto>> GetBudgetsUnifiedAsync(BudgetFilterDto filter)
    {
      try
      {
        List<BudgetResponseDto> budgets = new List<BudgetResponseDto>();

        // ตรวจสอบ CompanyID เพื่อเลือก table ที่ถูกต้อง
        if (filter.CompanyID == "1") // BJC
        {
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          budgets = bjcBudgets.Select(b => MapToResponseDto(b)).ToList();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var bigcBudgets = await GetBigcBudgetsAsync(filter);
          budgets = bigcBudgets.Select(b => MapToResponseDto(b)).ToList();
        }
        else
        {
          // ถ้าไม่ระบุ CompanyID ให้ดึงจากทั้งสอง company และรวมกัน
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          var bigcBudgets = await GetBigcBudgetsAsync(filter);

          var bjcMapped = bjcBudgets.Select(b => MapToResponseDto(b));
          var bigcMapped = bigcBudgets.Select(b => MapToResponseDto(b));

          budgets = bjcMapped.Union(bigcMapped).ToList();
        }

        return budgets;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBudgetsUnifiedAsync: {ex.Message}");
        return new List<BudgetResponseDto>();
      }
    }

    public async Task<object?> GetBudgetByIdAsync(int budgetId, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          var bjcBudget = await GetBjcBudgetByIdAsync(budgetId);
          return bjcBudget; // Return BudgetBjcDto directly
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = await GetBigcBudgetByIdAsync(budgetId);
          return bigcBudget; // Return BudgetBigcDto directly
        }

        return null;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBudgetByIdAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<BudgetResponseDto?> GetBudgetByIdUnifiedAsync(int budgetId, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          var bjcBudget = await GetBjcBudgetByIdAsync(budgetId);
          return bjcBudget != null ? MapToResponseDto(bjcBudget) : null;
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = await GetBigcBudgetByIdAsync(budgetId);
          return bigcBudget != null ? MapToResponseDto(bigcBudget) : null;
        }

        return null;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBudgetByIdUnifiedAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<object> CreateBudgetAsync(object budget, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          var bjcBudget = budget as BudgetBjcDto ?? throw new ArgumentException("Expected BudgetBjcDto for BJC company");
          var createdBjc = await CreateBjcBudgetAsync(bjcBudget);
          return createdBjc; // Return BudgetBjcDto directly
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = budget as BudgetBigcDto ?? throw new ArgumentException("Expected BudgetBigcDto for BIGC company");
          var createdBigc = await CreateBigcBudgetAsync(bigcBudget);
          return createdBigc; // Return BudgetBigcDto directly
        }

        throw new ArgumentException($"Invalid company ID: {companyId}");
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in CreateBudgetAsync: {ex.Message}");
        throw;
      }
    }

    public async Task<BudgetResponseDto> CreateBudgetUnifiedAsync(BudgetResponseDto budget, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          var bjcBudget = MapToBjcDto(budget);
          var createdBjc = await CreateBjcBudgetAsync(bjcBudget);
          return MapToResponseDto(createdBjc);
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = MapToBigcDto(budget);
          var createdBigc = await CreateBigcBudgetAsync(bigcBudget);
          return MapToResponseDto(createdBigc);
        }

        throw new ArgumentException($"Invalid company ID: {companyId}");
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in CreateBudgetUnifiedAsync: {ex.Message}");
        throw;
      }
    }

    public async Task<object?> UpdateBudgetAsync(int budgetId, object budget, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          var bjcBudget = budget as BudgetBjcDto ?? throw new ArgumentException("Expected BudgetBjcDto for BJC company");
          var updatedBjc = await UpdateBjcBudgetAsync(budgetId, bjcBudget);
          return updatedBjc; // Return BudgetBjcDto directly
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = budget as BudgetBigcDto ?? throw new ArgumentException("Expected BudgetBigcDto for BIGC company");
          var updatedBigc = await UpdateBigcBudgetAsync(budgetId, bigcBudget);
          return updatedBigc; // Return BudgetBigcDto directly
        }

        return null;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in UpdateBudgetAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<BudgetResponseDto?> UpdateBudgetUnifiedAsync(int budgetId, BudgetResponseDto budget, int companyId)
    {
      try
      {
        // ✅ Phase 2: Use Selective Update (only update non-null fields)
        // This reduces database writes and provides better audit trail
        Console.WriteLine($"🔧 UpdateBudgetUnifiedAsync - CompanyId={companyId}, BudgetId={budgetId}");

        if (companyId == 1) // BJC
        {
          var bjcBudget = MapToBjcDto(budget);

          // ✅ Use selective update (only updates fields that are non-null)
          var updatedBjc = await UpdateBjcBudgetSelectiveAsync(budgetId, bjcBudget);
          return updatedBjc != null ? MapToResponseDto(updatedBjc) : null;
        }
        else if (companyId == 2) // BIGC
        {
          var bigcBudget = MapToBigcDto(budget);

          // ✅ Use selective update (only updates fields that are non-null)
          var updatedBigc = await UpdateBigcBudgetSelectiveAsync(budgetId, bigcBudget);
          return updatedBigc != null ? MapToResponseDto(updatedBigc) : null;
        }

        return null;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in UpdateBudgetUnifiedAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<bool> DeleteBudgetAsync(int budgetId, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          return await DeleteBjcBudgetAsync(budgetId);
        }
        else if (companyId == 2) // BIGC
        {
          return await DeleteBigcBudgetAsync(budgetId);
        }

        return false;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in DeleteBudgetAsync: {ex.Message}");
        return false;
      }
    }

    public async Task<bool> DeleteBudgetUnifiedAsync(int budgetId, int companyId)
    {
      try
      {
        if (companyId == 1) // BJC
        {
          return await DeleteBjcBudgetAsync(budgetId);
        }
        else if (companyId == 2) // BIGC
        {
          return await DeleteBigcBudgetAsync(budgetId);
        }

        return false;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in DeleteBudgetUnifiedAsync: {ex.Message}");
        return false;
      }
    }

    // Company-Specific Methods
    public async Task<List<BudgetBjcDto>> GetBjcBudgetsAsync(BudgetFilterDto filter)
    {
      try
      {
        var query = _context.HRB_BUDGET_BJC.AsQueryable();

        // ═══════════════════════════════════════════════════════════════
        // Data Access Filtering - กรองข้อมูลตามสิทธิ์ของ User
        // ═══════════════════════════════════════════════════════════════
        if (filter.UserId.HasValue && filter.UserId.Value > 0)
        {
          int? companyId = null;
          if (int.TryParse(filter.CompanyID, out int cid))
          {
            companyId = cid;
          }

          var accessibleCostCenters = await DataAccessHelper.GetAccessibleCostCentersAsync(
              _context, filter.UserId.Value, companyId);

          if (accessibleCostCenters.Any())
          {
            query = query.Where(b => accessibleCostCenters.Contains(b.CostCenterCode));
          }
          else
          {
            // User has no data access - return empty
            return new List<BudgetBjcDto>();
          }
        }

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Cobu))
        {
          query = query.Where(b => b.Cobu == filter.Cobu);
        }

        if (!string.IsNullOrEmpty(filter.BudgetYear))
        {
          if (int.TryParse(filter.BudgetYear, out int budgetYear))
          {
            query = query.Where(b => b.BudgetYear == budgetYear);
          }
        }

        if (!string.IsNullOrEmpty(filter.Division))
        {
          query = query.Where(b => b.Division == filter.Division);
        }

        if (!string.IsNullOrEmpty(filter.Department))
        {
          query = query.Where(b => b.Department == filter.Department);
        }

        if (!string.IsNullOrEmpty(filter.Section))
        {
          query = query.Where(b => b.Section == filter.Section);
        }

        // Add EmpCode filter for employee benefits
        if (!string.IsNullOrEmpty(filter.EmpCode))
        {
          query = query.Where(b => b.EmpCode == filter.EmpCode);
        }

        var bjcBudgets = await query.ToListAsync();

        return bjcBudgets.Select(b => new BudgetBjcDto
        {
          // Base fields (inherited from BaseBudgetDto)
          BudgetId = b.BudgetId,
          BudgetYear = b.BudgetYear,
          BudgetYearLe = b.BudgetYearLe,
          CompanyId = b.CompanyId,
          CompanyCode = b.CompanyCode,
          Bu = b.Bu,
          Cobu = b.Cobu,
          Division = b.Division,
          Department = b.Department,
          Section = b.Section,
          StoreName = b.StoreName,
          EmpCode = b.EmpCode,
          EmpStatus = b.EmpStatus,
          TitleTh = b.TitleTh,
          FnameTh = b.FnameTh,
          LnameTh = b.LnameTh,
          TitleEn = b.TitleEn,
          FnameEn = b.FnameEn,
          LnameEn = b.LnameEn,
          CostCenterCode = b.CostCenterCode,
          CostCenterName = b.CostCenterName,
          PositionCode = b.PositionCode,
          PositionName = b.PositionName,
          JobBand = b.JobBand,
          JoinDate = b.JoinDate,
          YosCurrYear = b.YosCurrYear,
          YosNextYear = b.YosNextYear,
          EmpTypeCode = b.EmpTypeCode,
          NewHcCode = b.NewHcCode,
          NewVacPeriod = b.NewVacPeriod,
          NewVacLe = b.NewVacLe,
          Reason = b.Reason,
          GroupName = b.GroupName,
          GroupLevel1 = b.GroupLevel1,
          GroupLevel2 = b.GroupLevel2,
          GroupLevel3 = b.GroupLevel3,
          HrbpEmpCode = b.HrbpEmpCode,
          LeOfMonth = b.LeOfMonth,
          NoOfMonth = b.NoOfMonth,
          PayrollLe = b.PayrollLe,
          PremiumLe = b.PremiumLe,
          BonusLe = b.BonusLe,
          PeSbMthLe = b.PeSbMthLe,
          PeSbYearLe = b.PeSbYearLe,
          Payroll = b.Payroll,
          Premium = b.Premium,
          Bonus = b.Bonus,
          PeSbMth = b.PeSbMth,
          PeSbYear = b.PeSbYear,
          CostCenterPlan = b.CostCenterPlan,
          SalaryStructure = b.SalaryStructure,
          PeMthLe = b.PeMthLe,
          PeYearLe = b.PeYearLe,
          PeMth = b.PeMth,
          PeYear = b.PeYear,
          RunrateCode = b.RunrateCode,
          Discount = b.Discount,
          Executive = b.Executive,
          FocusHc = b.FocusHc,
          FocusPe = b.FocusPe,
          JoinPvf = b.JoinPvf,
          Pvf = b.Pvf,
          UpdatedBy = b.UpdatedBy,
          UpdatedDate = b.UpdatedDate,

          // BJC specific Salary fields
          SalWithEn = b.SalWithEn,
          SalWithEnLe = b.SalWithEnLe,
          SalNotEn = b.SalNotEn,
          SalNotEnLe = b.SalNotEnLe,
          SalTemp = b.SalTemp,
          SalTempLe = b.SalTempLe,
          BonusType = b.BonusType,
          BonusTypeLe = b.BonusTypeLe,

          // BJC Performance Components (LE)
          SalesManagementPcLe = b.SalesManagementPcLe,
          ShelfStackingPcLe = b.ShelfStackingPcLe,
          DiligenceAllowancePcLe = b.DiligenceAllowancePcLe,
          PostAllowancePcLe = b.PostAllowancePcLe,
          PhoneAllowancePcLe = b.PhoneAllowancePcLe,
          TransportationPcLe = b.TransportationPcLe,
          SkillAllowancePcLe = b.SkillAllowancePcLe,
          OtherAllowancePcLe = b.OtherAllowancePcLe,

          // BJC Performance Components (Current)
          SalesManagementPc = b.SalesManagementPc,
          ShelfStackingPc = b.ShelfStackingPc,
          DiligenceAllowancePc = b.DiligenceAllowancePc,
          PostAllowancePc = b.PostAllowancePc,
          PhoneAllowancePc = b.PhoneAllowancePc,
          TransportationPc = b.TransportationPc,
          SkillAllowancePc = b.SkillAllowancePc,
          OtherAllowancePc = b.OtherAllowancePc,

          // BJC Staff and Benefits
          TemporaryStaffSal = b.TemporaryStaffSal,
          TemporaryStaffSalLe = b.TemporaryStaffSalLe,
          SocialSecurity = b.SocialSecurity,
          SocialSecurityLe = b.SocialSecurityLe,
          SocialSecurityTmp = b.SocialSecurityTmp,
          SocialSecurityTmpLe = b.SocialSecurityTmpLe,
          ProvidentFund = b.ProvidentFund,
          ProvidentFundLe = b.ProvidentFundLe,
          WorkmenCompensation = b.WorkmenCompensation,
          WorkmenCompensationLe = b.WorkmenCompensationLe,

          // BJC Allowances
          HousingAllowance = b.HousingAllowance,
          HousingAllowanceLe = b.HousingAllowanceLe,
          SalesCarAllowance = b.SalesCarAllowance,
          SalesCarAllowanceLe = b.SalesCarAllowanceLe,
          Accommodation = b.Accommodation,
          AccommodationLe = b.AccommodationLe,
          SouthriskAllowance = b.SouthriskAllowance,
          SouthriskAllowanceLe = b.SouthriskAllowanceLe,
          SouthriskAllowanceTmp = b.SouthriskAllowanceTmp,
          SouthriskAllowanceTmpLe = b.SouthriskAllowanceTmpLe,
          MealAllowance = b.MealAllowance,
          MealAllowanceLe = b.MealAllowanceLe,
          CarAllowance = b.CarAllowance,
          CarAllowanceLe = b.CarAllowanceLe,
          LicenseAllowance = b.LicenseAllowance,
          LicenseAllowanceLe = b.LicenseAllowanceLe,
          OthersSubjectTax = b.OthersSubjectTax,
          OthersSubjectTaxLe = b.OthersSubjectTaxLe,

          // BJC Outsource and Car
          OutsourceWages = b.OutsourceWages,
          OutsourceWagesLe = b.OutsourceWagesLe,
          CompCarsGas = b.CompCarsGas,
          CompCarsGasLe = b.CompCarsGasLe,
          CompCarsOther = b.CompCarsOther,
          CompCarsOtherLe = b.CompCarsOtherLe,
          CarRental = b.CarRental,
          CarRentalLe = b.CarRentalLe,
          CarGasoline = b.CarGasoline,
          CarGasolineLe = b.CarGasolineLe,
          CarRepair = b.CarRepair,
          CarRepairLe = b.CarRepairLe,
          CarMaintenance = b.CarMaintenance,
          CarMaintenanceLe = b.CarMaintenanceLe,
          CarMaintenanceTmp = b.CarMaintenanceTmp,
          CarMaintenanceTmpLe = b.CarMaintenanceTmpLe,

          // BJC Medical and Others
          MedicalOutside = b.MedicalOutside,
          MedicalOutsideLe = b.MedicalOutsideLe,
          MedicalInhouse = b.MedicalInhouse,
          MedicalInhouseLe = b.MedicalInhouseLe,
          StaffActivities = b.StaffActivities,
          StaffActivitiesLe = b.StaffActivitiesLe,
          Uniform = b.Uniform,
          UniformLe = b.UniformLe,
          LifeInsurance = b.LifeInsurance,
          LifeInsuranceLe = b.LifeInsuranceLe,
          Other = b.Other,
          OtherLe = b.OtherLe
        }).ToList();
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBjcBudgetsAsync: {ex.Message}");
        return new List<BudgetBjcDto>();
      }
    }

    public async Task<List<BudgetBigcDto>> GetBigcBudgetsAsync(BudgetFilterDto filter)
    {
      try
      {
        var query = _context.HRB_BUDGET_BIGC.AsQueryable();

        // ═══════════════════════════════════════════════════════════════
        // Data Access Filtering - กรองข้อมูลตามสิทธิ์ของ User
        // ═══════════════════════════════════════════════════════════════
        if (filter.UserId.HasValue && filter.UserId.Value > 0)
        {
          int? companyId = null;
          if (int.TryParse(filter.CompanyID, out int cid))
          {
            companyId = cid;
          }

          var accessibleCostCenters = await DataAccessHelper.GetAccessibleCostCentersAsync(
              _context, filter.UserId.Value, companyId);

          if (accessibleCostCenters.Any())
          {
            query = query.Where(b => accessibleCostCenters.Contains(b.CostCenterCode));
          }
          else
          {
            // User has no data access - return empty
            return new List<BudgetBigcDto>();
          }
        }

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Cobu))
        {
          query = query.Where(b => b.Cobu == filter.Cobu);
        }

        if (!string.IsNullOrEmpty(filter.BudgetYear))
        {
          if (int.TryParse(filter.BudgetYear, out int budgetYear))
          {
            query = query.Where(b => b.BudgetYear == budgetYear);
          }
        }

        if (!string.IsNullOrEmpty(filter.CostCenterCode))
        {
          query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
        }

        if (!string.IsNullOrEmpty(filter.Division))
        {
          query = query.Where(b => b.Division == filter.Division);
        }

        if (!string.IsNullOrEmpty(filter.Department))
        {
          query = query.Where(b => b.Department == filter.Department);
        }

        if (!string.IsNullOrEmpty(filter.Section))
        {
          query = query.Where(b => b.Section == filter.Section);
        }

        if (!string.IsNullOrEmpty(filter.StoreName))
        {
          query = query.Where(b => b.StoreName == filter.StoreName);
        }

        if (!string.IsNullOrEmpty(filter.EmpStatus))
        {
          query = query.Where(b => b.EmpStatus == filter.EmpStatus);
        }

        // Add EmpCode filter for employee benefits
        // if (!string.IsNullOrEmpty(filter.EmpCode))
        // {
        //   query = query.Where(b => b.EmpCode == filter.EmpCode);
        // }

        var bigcBudgets = await query.ToListAsync();

        return bigcBudgets.Select(b => new BudgetBigcDto
        {
          // Base fields (inherited from BaseBudgetDto)
          BudgetId = b.BudgetId,
          BudgetYear = b.BudgetYear,
          BudgetYearLe = b.BudgetYearLe,
          CompanyId = b.CompanyId,
          CompanyCode = b.CompanyCode,
          Bu = b.Bu,
          Cobu = b.Cobu,
          Division = b.Division,
          Department = b.Department,
          Section = b.Section,
          StoreName = b.StoreName,
          OrgUnitCode = b.OrgUnitCode,
          OrgUnitName = b.OrgUnitName,
          EmpCode = b.EmpCode,
          EmpStatus = b.EmpStatus,
          TitleTh = b.TitleTh,
          FnameTh = b.FnameTh,
          LnameTh = b.LnameTh,
          TitleEn = b.TitleEn,
          FnameEn = b.FnameEn,
          LnameEn = b.LnameEn,
          CostCenterCode = b.CostCenterCode,
          CostCenterName = b.CostCenterName,
          PositionCode = b.PositionCode,
          PositionName = b.PositionName,
          JobBand = b.JobBand,
          JoinDate = b.JoinDate,
          YosCurrYear = b.YosCurrYear,
          YosNextYear = b.YosNextYear,
          EmpTypeCode = b.EmpTypeCode,
          NewHcCode = b.NewHcCode,
          NewVacPeriod = b.NewVacPeriod,
          NewVacLe = b.NewVacLe,
          Reason = b.Reason,
          GroupName = b.GroupName,
          GroupLevel1 = b.GroupLevel1,
          GroupLevel2 = b.GroupLevel2,
          GroupLevel3 = b.GroupLevel3,
          HrbpEmpCode = b.HrbpEmpCode,
          LeOfMonth = b.LeOfMonth,
          NoOfMonth = b.NoOfMonth,
          PayrollLe = b.PayrollLe,
          PremiumLe = b.PremiumLe,
          BonusLe = b.BonusLe,
          PeSbMthLe = b.PeSbMthLe,
          PeSbYearLe = b.PeSbYearLe,
          Payroll = b.Payroll,
          Premium = b.Premium,
          Bonus = b.Bonus,
          PeSbMth = b.PeSbMth,
          PeSbYear = b.PeSbYear,
          CostCenterPlan = b.CostCenterPlan,
          SalaryStructure = b.SalaryStructure,
          PeMthLe = b.PeMthLe,
          PeYearLe = b.PeYearLe,
          PeMth = b.PeMth,
          PeYear = b.PeYear,
          RunrateCode = b.RunrateCode,
          Discount = b.Discount,
          Executive = b.Executive,
          FocusHc = b.FocusHc,
          FocusPe = b.FocusPe,
          JoinPvf = b.JoinPvf,
          Pvf = b.Pvf,
          UpdatedBy = b.UpdatedBy,
          UpdatedDate = b.UpdatedDate,

          // BIGC specific LE (Last Estimate) Fields
          TotalPayrollLe = b.TotalPayrollLe,
          FleetCardPeLe = b.FleetCardPeLe,
          CarAllowanceLe = b.CarAllowanceLe,
          LicenseAllowanceLe = b.LicenseAllowanceLe,
          HousingAllowanceLe = b.HousingAllowanceLe,
          GasolineAllowanceLe = b.GasolineAllowanceLe,
          WageStudentLe = b.WageStudentLe,
          CarRentalPeLe = b.CarRentalPeLe,
          SkillPayAllowanceLe = b.SkillPayAllowanceLe,
          OtherAllowanceLe = b.OtherAllowanceLe,
          SocialSecurityLe = b.SocialSecurityLe,
          LaborFundFeeLe = b.LaborFundFeeLe,
          OtherStaffBenefitLe = b.OtherStaffBenefitLe,
          ProvidentFundLe = b.ProvidentFundLe,
          EmployeeWelfareLe = b.EmployeeWelfareLe,
          ProvisionLe = b.ProvisionLe,
          InterestLe = b.InterestLe,
          StaffInsuranceLe = b.StaffInsuranceLe,
          MedicalExpenseLe = b.MedicalExpenseLe,
          MedicalInhouseLe = b.MedicalInhouseLe,
          TrainingLe = b.TrainingLe,
          LongServiceLe = b.LongServiceLe,

          // BIGC specific Budget Fields (Current Year)
          TotalPayroll = b.TotalPayroll,
          BonusTypes = b.BonusTypes,
          FleetCardPe = b.FleetCardPe,
          CarAllowance = b.CarAllowance,
          LicenseAllowance = b.LicenseAllowance,
          HousingAllowance = b.HousingAllowance,
          GasolineAllowance = b.GasolineAllowance,
          WageStudent = b.WageStudent,
          CarRentalPe = b.CarRentalPe,
          SkillPayAllowance = b.SkillPayAllowance,
          OtherAllowance = b.OtherAllowance,
          SocialSecurity = b.SocialSecurity,
          LaborFundFee = b.LaborFundFee,
          OtherStaffBenefit = b.OtherStaffBenefit,
          ProvidentFund = b.ProvidentFund,
          EmployeeWelfare = b.EmployeeWelfare,
          Provision = b.Provision,
          Interest = b.Interest,
          StaffInsurance = b.StaffInsurance,
          MedicalExpense = b.MedicalExpense,
          MedicalInhouse = b.MedicalInhouse,
          Training = b.Training,
          LongService = b.LongService
        }).ToList();
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBigcBudgetsAsync: {ex.Message}");
        return new List<BudgetBigcDto>();
      }
    }

    public async Task<BudgetBjcDto?> GetBjcBudgetByIdAsync(int budgetId)
    {
      try
      {
        var budget = await _context.HRB_BUDGET_BJC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (budget == null) return null;

        return new BudgetBjcDto
        {
          // Base fields (inherited from BaseBudgetDto)
          BudgetId = budget.BudgetId,
          BudgetYear = budget.BudgetYear,
          BudgetYearLe = budget.BudgetYearLe,
          CompanyId = budget.CompanyId,
          CompanyCode = budget.CompanyCode,
          Bu = budget.Bu,
          Cobu = budget.Cobu,
          Division = budget.Division,
          Department = budget.Department,
          Section = budget.Section,
          StoreName = budget.StoreName,
          EmpCode = budget.EmpCode,
          EmpStatus = budget.EmpStatus,
          TitleTh = budget.TitleTh,
          FnameTh = budget.FnameTh,
          LnameTh = budget.LnameTh,
          TitleEn = budget.TitleEn,
          FnameEn = budget.FnameEn,
          LnameEn = budget.LnameEn,
          CostCenterCode = budget.CostCenterCode,
          CostCenterName = budget.CostCenterName,
          PositionCode = budget.PositionCode,
          PositionName = budget.PositionName,
          JobBand = budget.JobBand,
          JoinDate = budget.JoinDate,
          YosCurrYear = budget.YosCurrYear,
          YosNextYear = budget.YosNextYear,
          EmpTypeCode = budget.EmpTypeCode,
          NewHcCode = budget.NewHcCode,
          NewVacPeriod = budget.NewVacPeriod,
          NewVacLe = budget.NewVacLe,
          Reason = budget.Reason,
          GroupName = budget.GroupName,
          GroupLevel1 = budget.GroupLevel1,
          GroupLevel2 = budget.GroupLevel2,
          GroupLevel3 = budget.GroupLevel3,
          HrbpEmpCode = budget.HrbpEmpCode,
          LeOfMonth = budget.LeOfMonth,
          NoOfMonth = budget.NoOfMonth,
          PayrollLe = budget.PayrollLe,
          PremiumLe = budget.PremiumLe,
          BonusLe = budget.BonusLe,
          PeSbMthLe = budget.PeSbMthLe,
          PeSbYearLe = budget.PeSbYearLe,
          Payroll = budget.Payroll,
          Premium = budget.Premium,
          Bonus = budget.Bonus,
          PeSbMth = budget.PeSbMth,
          PeSbYear = budget.PeSbYear,
          CostCenterPlan = budget.CostCenterPlan,
          SalaryStructure = budget.SalaryStructure,
          PeMthLe = budget.PeMthLe,
          PeYearLe = budget.PeYearLe,
          PeMth = budget.PeMth,
          PeYear = budget.PeYear,
          RunrateCode = budget.RunrateCode,
          Discount = budget.Discount,
          Executive = budget.Executive,
          FocusHc = budget.FocusHc,
          FocusPe = budget.FocusPe,
          JoinPvf = budget.JoinPvf,
          Pvf = budget.Pvf,
          UpdatedBy = budget.UpdatedBy,
          UpdatedDate = budget.UpdatedDate,

          // BJC specific Salary fields
          SalWithEn = budget.SalWithEn,
          SalWithEnLe = budget.SalWithEnLe,
          SalNotEn = budget.SalNotEn,
          SalNotEnLe = budget.SalNotEnLe,
          SalTemp = budget.SalTemp,
          SalTempLe = budget.SalTempLe,
          BonusType = budget.BonusType,
          BonusTypeLe = budget.BonusTypeLe,

          // BJC Performance Components (LE)
          SalesManagementPcLe = budget.SalesManagementPcLe,
          ShelfStackingPcLe = budget.ShelfStackingPcLe,
          DiligenceAllowancePcLe = budget.DiligenceAllowancePcLe,
          PostAllowancePcLe = budget.PostAllowancePcLe,
          PhoneAllowancePcLe = budget.PhoneAllowancePcLe,
          TransportationPcLe = budget.TransportationPcLe,
          SkillAllowancePcLe = budget.SkillAllowancePcLe,
          OtherAllowancePcLe = budget.OtherAllowancePcLe,

          // BJC Performance Components (Current)
          SalesManagementPc = budget.SalesManagementPc,
          ShelfStackingPc = budget.ShelfStackingPc,
          DiligenceAllowancePc = budget.DiligenceAllowancePc,
          PostAllowancePc = budget.PostAllowancePc,
          PhoneAllowancePc = budget.PhoneAllowancePc,
          TransportationPc = budget.TransportationPc,
          SkillAllowancePc = budget.SkillAllowancePc,
          OtherAllowancePc = budget.OtherAllowancePc,

          // BJC Staff and Benefits
          TemporaryStaffSal = budget.TemporaryStaffSal,
          TemporaryStaffSalLe = budget.TemporaryStaffSalLe,
          SocialSecurity = budget.SocialSecurity,
          SocialSecurityLe = budget.SocialSecurityLe,
          SocialSecurityTmp = budget.SocialSecurityTmp,
          SocialSecurityTmpLe = budget.SocialSecurityTmpLe,
          ProvidentFund = budget.ProvidentFund,
          ProvidentFundLe = budget.ProvidentFundLe,
          WorkmenCompensation = budget.WorkmenCompensation,
          WorkmenCompensationLe = budget.WorkmenCompensationLe,

          // BJC Allowances
          HousingAllowance = budget.HousingAllowance,
          HousingAllowanceLe = budget.HousingAllowanceLe,
          SalesCarAllowance = budget.SalesCarAllowance,
          SalesCarAllowanceLe = budget.SalesCarAllowanceLe,
          Accommodation = budget.Accommodation,
          AccommodationLe = budget.AccommodationLe,
          SouthriskAllowance = budget.SouthriskAllowance,
          SouthriskAllowanceLe = budget.SouthriskAllowanceLe,
          SouthriskAllowanceTmp = budget.SouthriskAllowanceTmp,
          SouthriskAllowanceTmpLe = budget.SouthriskAllowanceTmpLe,
          MealAllowance = budget.MealAllowance,
          MealAllowanceLe = budget.MealAllowanceLe,
          CarAllowance = budget.CarAllowance,
          CarAllowanceLe = budget.CarAllowanceLe,
          LicenseAllowance = budget.LicenseAllowance,
          LicenseAllowanceLe = budget.LicenseAllowanceLe,
          OthersSubjectTax = budget.OthersSubjectTax,
          OthersSubjectTaxLe = budget.OthersSubjectTaxLe,

          // BJC Outsource and Car
          OutsourceWages = budget.OutsourceWages,
          OutsourceWagesLe = budget.OutsourceWagesLe,
          CompCarsGas = budget.CompCarsGas,
          CompCarsGasLe = budget.CompCarsGasLe,
          CompCarsOther = budget.CompCarsOther,
          CompCarsOtherLe = budget.CompCarsOtherLe,
          CarRental = budget.CarRental,
          CarRentalLe = budget.CarRentalLe,
          CarGasoline = budget.CarGasoline,
          CarGasolineLe = budget.CarGasolineLe,
          CarRepair = budget.CarRepair,
          CarRepairLe = budget.CarRepairLe,
          CarMaintenance = budget.CarMaintenance,
          CarMaintenanceLe = budget.CarMaintenanceLe,
          CarMaintenanceTmp = budget.CarMaintenanceTmp,
          CarMaintenanceTmpLe = budget.CarMaintenanceTmpLe,

          // BJC Medical and Others
          MedicalOutside = budget.MedicalOutside,
          MedicalOutsideLe = budget.MedicalOutsideLe,
          MedicalInhouse = budget.MedicalInhouse,
          MedicalInhouseLe = budget.MedicalInhouseLe,
          StaffActivities = budget.StaffActivities,
          StaffActivitiesLe = budget.StaffActivitiesLe,
          Uniform = budget.Uniform,
          UniformLe = budget.UniformLe,
          LifeInsurance = budget.LifeInsurance,
          LifeInsuranceLe = budget.LifeInsuranceLe,
          Other = budget.Other,
          OtherLe = budget.OtherLe
        };
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBjcBudgetByIdAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<BudgetBigcDto?> GetBigcBudgetByIdAsync(int budgetId)
    {
      try
      {
        var budget = await _context.HRB_BUDGET_BIGC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (budget == null) return null;

        return new BudgetBigcDto
        {
          // Base fields (inherited from BaseBudgetDto)
          BudgetId = budget.BudgetId,
          BudgetYear = budget.BudgetYear,
          BudgetYearLe = budget.BudgetYearLe,
          CompanyId = budget.CompanyId,
          CompanyCode = budget.CompanyCode,
          Bu = budget.Bu,
          Cobu = budget.Cobu,
          Division = budget.Division,
          Department = budget.Department,
          Section = budget.Section,
          StoreName = budget.StoreName,
          OrgUnitCode = budget.OrgUnitCode,
          OrgUnitName = budget.OrgUnitName,
          EmpCode = budget.EmpCode,
          EmpStatus = budget.EmpStatus,
          TitleTh = budget.TitleTh,
          FnameTh = budget.FnameTh,
          LnameTh = budget.LnameTh,
          TitleEn = budget.TitleEn,
          FnameEn = budget.FnameEn,
          LnameEn = budget.LnameEn,
          CostCenterCode = budget.CostCenterCode,
          CostCenterName = budget.CostCenterName,
          PositionCode = budget.PositionCode,
          PositionName = budget.PositionName,
          JobBand = budget.JobBand,
          JoinDate = budget.JoinDate,
          YosCurrYear = budget.YosCurrYear,
          YosNextYear = budget.YosNextYear,
          EmpTypeCode = budget.EmpTypeCode,
          NewHcCode = budget.NewHcCode,
          NewVacPeriod = budget.NewVacPeriod,
          NewVacLe = budget.NewVacLe,
          Reason = budget.Reason,
          GroupName = budget.GroupName,
          GroupLevel1 = budget.GroupLevel1,
          GroupLevel2 = budget.GroupLevel2,
          GroupLevel3 = budget.GroupLevel3,
          HrbpEmpCode = budget.HrbpEmpCode,
          LeOfMonth = budget.LeOfMonth,
          NoOfMonth = budget.NoOfMonth,
          PayrollLe = budget.PayrollLe,
          PremiumLe = budget.PremiumLe,
          BonusLe = budget.BonusLe,
          PeSbMthLe = budget.PeSbMthLe,
          PeSbYearLe = budget.PeSbYearLe,
          Payroll = budget.Payroll,
          Premium = budget.Premium,
          Bonus = budget.Bonus,
          PeSbMth = budget.PeSbMth,
          PeSbYear = budget.PeSbYear,
          CostCenterPlan = budget.CostCenterPlan,
          SalaryStructure = budget.SalaryStructure,
          PeMthLe = budget.PeMthLe,
          PeYearLe = budget.PeYearLe,
          PeMth = budget.PeMth,
          PeYear = budget.PeYear,
          RunrateCode = budget.RunrateCode,
          Discount = budget.Discount,
          Executive = budget.Executive,
          FocusHc = budget.FocusHc,
          FocusPe = budget.FocusPe,
          JoinPvf = budget.JoinPvf,
          Pvf = budget.Pvf,
          UpdatedBy = budget.UpdatedBy,
          UpdatedDate = budget.UpdatedDate,

          // BIGC specific LE (Last Estimate) Fields
          TotalPayrollLe = budget.TotalPayrollLe,
          FleetCardPeLe = budget.FleetCardPeLe,
          CarAllowanceLe = budget.CarAllowanceLe,
          LicenseAllowanceLe = budget.LicenseAllowanceLe,
          HousingAllowanceLe = budget.HousingAllowanceLe,
          GasolineAllowanceLe = budget.GasolineAllowanceLe,
          WageStudentLe = budget.WageStudentLe,
          CarRentalPeLe = budget.CarRentalPeLe,
          SkillPayAllowanceLe = budget.SkillPayAllowanceLe,
          OtherAllowanceLe = budget.OtherAllowanceLe,
          SocialSecurityLe = budget.SocialSecurityLe,
          LaborFundFeeLe = budget.LaborFundFeeLe,
          OtherStaffBenefitLe = budget.OtherStaffBenefitLe,
          ProvidentFundLe = budget.ProvidentFundLe,
          EmployeeWelfareLe = budget.EmployeeWelfareLe,
          ProvisionLe = budget.ProvisionLe,
          InterestLe = budget.InterestLe,
          StaffInsuranceLe = budget.StaffInsuranceLe,
          MedicalExpenseLe = budget.MedicalExpenseLe,
          MedicalInhouseLe = budget.MedicalInhouseLe,
          TrainingLe = budget.TrainingLe,
          LongServiceLe = budget.LongServiceLe,

          // BIGC specific Budget Fields (Current Year)
          TotalPayroll = budget.TotalPayroll,
          BonusTypes = budget.BonusTypes,
          FleetCardPe = budget.FleetCardPe,
          CarAllowance = budget.CarAllowance,
          LicenseAllowance = budget.LicenseAllowance,
          HousingAllowance = budget.HousingAllowance,
          GasolineAllowance = budget.GasolineAllowance,
          WageStudent = budget.WageStudent,
          CarRentalPe = budget.CarRentalPe,
          SkillPayAllowance = budget.SkillPayAllowance,
          OtherAllowance = budget.OtherAllowance,
          SocialSecurity = budget.SocialSecurity,
          LaborFundFee = budget.LaborFundFee,
          OtherStaffBenefit = budget.OtherStaffBenefit,
          ProvidentFund = budget.ProvidentFund,
          EmployeeWelfare = budget.EmployeeWelfare,
          Provision = budget.Provision,
          Interest = budget.Interest,
          StaffInsurance = budget.StaffInsurance,
          MedicalExpense = budget.MedicalExpense,
          MedicalInhouse = budget.MedicalInhouse,
          Training = budget.Training,
          LongService = budget.LongService
        };
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBigcBudgetByIdAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<BudgetBjcDto> CreateBjcBudgetAsync(BudgetBjcDto budget)
    {
      try
      {
        var bjcEntity = new HCBPCoreUI_Backend.Models.Budget.HRB_BUDGET_BJC
        {
          // Base fields from budget DTO
          BudgetYear = budget.BudgetYear,
          BudgetYearLe = budget.BudgetYearLe,
          CompanyId = budget.CompanyId,
          CompanyCode = budget.CompanyCode,
          Bu = budget.Bu,
          Cobu = budget.Cobu,
          Division = budget.Division,
          Department = budget.Department,
          Section = budget.Section,
          StoreName = budget.StoreName,
          EmpCode = budget.EmpCode,
          EmpStatus = budget.EmpStatus,
          TitleTh = budget.TitleTh,
          FnameTh = budget.FnameTh,
          LnameTh = budget.LnameTh,
          TitleEn = budget.TitleEn,
          FnameEn = budget.FnameEn,
          LnameEn = budget.LnameEn,
          CostCenterCode = budget.CostCenterCode,
          CostCenterName = budget.CostCenterName,
          PositionCode = budget.PositionCode,
          PositionName = budget.PositionName,
          JobBand = budget.JobBand,
          JoinDate = budget.JoinDate,
          YosCurrYear = budget.YosCurrYear,
          YosNextYear = budget.YosNextYear,
          EmpTypeCode = budget.EmpTypeCode,
          NewHcCode = budget.NewHcCode,
          NewVacPeriod = budget.NewVacPeriod,
          NewVacLe = budget.NewVacLe,
          Reason = budget.Reason,
          GroupName = budget.GroupName,
          GroupLevel1 = budget.GroupLevel1,
          GroupLevel2 = budget.GroupLevel2,
          GroupLevel3 = budget.GroupLevel3,
          HrbpEmpCode = budget.HrbpEmpCode,
          LeOfMonth = budget.LeOfMonth,
          NoOfMonth = budget.NoOfMonth,

          // LE Fields
          PayrollLe = budget.PayrollLe,
          PremiumLe = budget.PremiumLe,
          BonusLe = budget.BonusLe,
          SalWithEnLe = budget.SalWithEnLe,
          SalNotEnLe = budget.SalNotEnLe,
          SalTempLe = budget.SalTempLe,
          BonusTypeLe = budget.BonusTypeLe,
          SalesManagementPcLe = budget.SalesManagementPcLe,
          ShelfStackingPcLe = budget.ShelfStackingPcLe,
          DiligenceAllowancePcLe = budget.DiligenceAllowancePcLe,
          PostAllowancePcLe = budget.PostAllowancePcLe,
          PhoneAllowancePcLe = budget.PhoneAllowancePcLe,
          TransportationPcLe = budget.TransportationPcLe,
          SkillAllowancePcLe = budget.SkillAllowancePcLe,
          OtherAllowancePcLe = budget.OtherAllowancePcLe,
          TemporaryStaffSalLe = budget.TemporaryStaffSalLe,
          SocialSecurityLe = budget.SocialSecurityLe,
          SocialSecurityTmpLe = budget.SocialSecurityTmpLe,
          ProvidentFundLe = budget.ProvidentFundLe,
          WorkmenCompensationLe = budget.WorkmenCompensationLe,
          HousingAllowanceLe = budget.HousingAllowanceLe,
          SalesCarAllowanceLe = budget.SalesCarAllowanceLe,
          AccommodationLe = budget.AccommodationLe,
          SouthriskAllowanceLe = budget.SouthriskAllowanceLe,
          SouthriskAllowanceTmpLe = budget.SouthriskAllowanceTmpLe,
          MealAllowanceLe = budget.MealAllowanceLe,
          CarAllowanceLe = budget.CarAllowanceLe,
          LicenseAllowanceLe = budget.LicenseAllowanceLe,
          OthersSubjectTaxLe = budget.OthersSubjectTaxLe,
          OutsourceWagesLe = budget.OutsourceWagesLe,
          CompCarsGasLe = budget.CompCarsGasLe,
          CompCarsOtherLe = budget.CompCarsOtherLe,
          CarRentalLe = budget.CarRentalLe,
          CarGasolineLe = budget.CarGasolineLe,
          CarRepairLe = budget.CarRepairLe,
          CarMaintenanceLe = budget.CarMaintenanceLe,
          CarMaintenanceTmpLe = budget.CarMaintenanceTmpLe,
          MedicalOutsideLe = budget.MedicalOutsideLe,
          MedicalInhouseLe = budget.MedicalInhouseLe,
          StaffActivitiesLe = budget.StaffActivitiesLe,
          UniformLe = budget.UniformLe,
          LifeInsuranceLe = budget.LifeInsuranceLe,
          OtherLe = budget.OtherLe,
          PeSbMthLe = budget.PeSbMthLe,
          PeSbYearLe = budget.PeSbYearLe,

          // Current Year Budget Fields
          Payroll = budget.Payroll,
          Premium = budget.Premium,
          Bonus = budget.Bonus,
          SalWithEn = budget.SalWithEn,
          SalNotEn = budget.SalNotEn,
          SalTemp = budget.SalTemp,
          BonusType = budget.BonusType,
          SalesManagementPc = budget.SalesManagementPc,
          ShelfStackingPc = budget.ShelfStackingPc,
          DiligenceAllowancePc = budget.DiligenceAllowancePc,
          PostAllowancePc = budget.PostAllowancePc,
          PhoneAllowancePc = budget.PhoneAllowancePc,
          TransportationPc = budget.TransportationPc,
          SkillAllowancePc = budget.SkillAllowancePc,
          OtherAllowancePc = budget.OtherAllowancePc,
          TemporaryStaffSal = budget.TemporaryStaffSal,
          SocialSecurity = budget.SocialSecurity,
          SocialSecurityTmp = budget.SocialSecurityTmp,
          ProvidentFund = budget.ProvidentFund,
          WorkmenCompensation = budget.WorkmenCompensation,
          HousingAllowance = budget.HousingAllowance,
          SalesCarAllowance = budget.SalesCarAllowance,
          Accommodation = budget.Accommodation,
          SouthriskAllowance = budget.SouthriskAllowance,
          SouthriskAllowanceTmp = budget.SouthriskAllowanceTmp,
          MealAllowance = budget.MealAllowance,
          CarAllowance = budget.CarAllowance,
          LicenseAllowance = budget.LicenseAllowance,
          OthersSubjectTax = budget.OthersSubjectTax,
          OutsourceWages = budget.OutsourceWages,
          CompCarsGas = budget.CompCarsGas,
          CompCarsOther = budget.CompCarsOther,
          CarRental = budget.CarRental,
          CarGasoline = budget.CarGasoline,
          CarRepair = budget.CarRepair,
          CarMaintenance = budget.CarMaintenance,
          CarMaintenanceTmp = budget.CarMaintenanceTmp,
          MedicalOutside = budget.MedicalOutside,
          MedicalInhouse = budget.MedicalInhouse,
          StaffActivities = budget.StaffActivities,
          Uniform = budget.Uniform,
          LifeInsurance = budget.LifeInsurance,
          Other = budget.Other,
          PeSbMth = budget.PeSbMth,
          PeSbYear = budget.PeSbYear,

          // Additional Fields
          CostCenterPlan = budget.CostCenterPlan,
          SalaryStructure = budget.SalaryStructure,
          PeMthLe = budget.PeMthLe,
          PeYearLe = budget.PeYearLe,
          PeMth = budget.PeMth,
          PeYear = budget.PeYear,
          RunrateCode = budget.RunrateCode,
          Discount = budget.Discount,
          Executive = budget.Executive,
          FocusHc = budget.FocusHc,
          FocusPe = budget.FocusPe,
          JoinPvf = budget.JoinPvf,
          Pvf = budget.Pvf,
          UpdatedBy = budget.UpdatedBy,
          UpdatedDate = DateTime.Now
        };

        _context.HRB_BUDGET_BJC.Add(bjcEntity);
        await _context.SaveChangesAsync();

        budget.BudgetId = bjcEntity.BudgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in CreateBjcBudgetAsync: {ex.Message}");
        throw;
      }
    }

    public async Task<BudgetBigcDto> CreateBigcBudgetAsync(BudgetBigcDto budget)
    {
      try
      {
        var bigcEntity = new HCBPCoreUI_Backend.Models.Budget.HRB_BUDGET_BIGC
        {
          // Base fields from budget DTO
          BudgetYear = budget.BudgetYear,
          BudgetYearLe = budget.BudgetYearLe,
          CompanyId = budget.CompanyId,
          CompanyCode = budget.CompanyCode,
          Bu = budget.Bu,
          Cobu = budget.Cobu,
          Division = budget.Division,
          Department = budget.Department,
          Section = budget.Section,
          StoreName = budget.StoreName,
          OrgUnitCode = budget.OrgUnitCode,
          OrgUnitName = budget.OrgUnitName,
          EmpCode = budget.EmpCode,
          EmpStatus = budget.EmpStatus,
          TitleTh = budget.TitleTh,
          FnameTh = budget.FnameTh,
          LnameTh = budget.LnameTh,
          TitleEn = budget.TitleEn,
          FnameEn = budget.FnameEn,
          LnameEn = budget.LnameEn,
          CostCenterCode = budget.CostCenterCode,
          CostCenterName = budget.CostCenterName,
          PositionCode = budget.PositionCode,
          PositionName = budget.PositionName,
          JobBand = budget.JobBand,
          JoinDate = budget.JoinDate,
          YosCurrYear = budget.YosCurrYear,
          YosNextYear = budget.YosNextYear,
          EmpTypeCode = budget.EmpTypeCode,
          NewHcCode = budget.NewHcCode,
          NewVacPeriod = budget.NewVacPeriod,
          NewVacLe = budget.NewVacLe,
          Reason = budget.Reason,
          GroupName = budget.GroupName,
          GroupLevel1 = budget.GroupLevel1,
          GroupLevel2 = budget.GroupLevel2,
          GroupLevel3 = budget.GroupLevel3,
          HrbpEmpCode = budget.HrbpEmpCode,
          LeOfMonth = budget.LeOfMonth,
          NoOfMonth = budget.NoOfMonth,

          // LE Fields
          PayrollLe = budget.PayrollLe,
          PremiumLe = budget.PremiumLe,
          BonusLe = budget.BonusLe,
          TotalPayrollLe = budget.TotalPayrollLe,
          FleetCardPeLe = budget.FleetCardPeLe,
          CarAllowanceLe = budget.CarAllowanceLe,
          LicenseAllowanceLe = budget.LicenseAllowanceLe,
          HousingAllowanceLe = budget.HousingAllowanceLe,
          GasolineAllowanceLe = budget.GasolineAllowanceLe,
          WageStudentLe = budget.WageStudentLe,
          CarRentalPeLe = budget.CarRentalPeLe,
          SkillPayAllowanceLe = budget.SkillPayAllowanceLe,
          OtherAllowanceLe = budget.OtherAllowanceLe,
          SocialSecurityLe = budget.SocialSecurityLe,
          LaborFundFeeLe = budget.LaborFundFeeLe,
          OtherStaffBenefitLe = budget.OtherStaffBenefitLe,
          ProvidentFundLe = budget.ProvidentFundLe,
          EmployeeWelfareLe = budget.EmployeeWelfareLe,
          ProvisionLe = budget.ProvisionLe,
          InterestLe = budget.InterestLe,
          StaffInsuranceLe = budget.StaffInsuranceLe,
          MedicalExpenseLe = budget.MedicalExpenseLe,
          MedicalInhouseLe = budget.MedicalInhouseLe,
          TrainingLe = budget.TrainingLe,
          LongServiceLe = budget.LongServiceLe,
          PeSbMthLe = budget.PeSbMthLe,
          PeSbYearLe = budget.PeSbYearLe,

          // Budget Fields
          Payroll = budget.Payroll,
          Premium = budget.Premium,
          Bonus = budget.Bonus,
          TotalPayroll = budget.TotalPayroll,
          BonusTypes = budget.BonusTypes,
          FleetCardPe = budget.FleetCardPe,
          CarAllowance = budget.CarAllowance,
          LicenseAllowance = budget.LicenseAllowance,
          HousingAllowance = budget.HousingAllowance,
          GasolineAllowance = budget.GasolineAllowance,
          WageStudent = budget.WageStudent,
          CarRentalPe = budget.CarRentalPe,
          SkillPayAllowance = budget.SkillPayAllowance,
          OtherAllowance = budget.OtherAllowance,
          SocialSecurity = budget.SocialSecurity,
          LaborFundFee = budget.LaborFundFee,
          OtherStaffBenefit = budget.OtherStaffBenefit,
          ProvidentFund = budget.ProvidentFund,
          EmployeeWelfare = budget.EmployeeWelfare,
          Provision = budget.Provision,
          Interest = budget.Interest,
          StaffInsurance = budget.StaffInsurance,
          MedicalExpense = budget.MedicalExpense,
          MedicalInhouse = budget.MedicalInhouse,
          Training = budget.Training,
          LongService = budget.LongService,
          PeSbMth = budget.PeSbMth,
          PeSbYear = budget.PeSbYear,

          // Additional Fields
          CostCenterPlan = budget.CostCenterPlan,
          SalaryStructure = budget.SalaryStructure,
          PeMthLe = budget.PeMthLe,
          PeYearLe = budget.PeYearLe,
          PeMth = budget.PeMth,
          PeYear = budget.PeYear,
          RunrateCode = budget.RunrateCode,
          Discount = budget.Discount,
          Executive = budget.Executive,
          FocusHc = budget.FocusHc,
          FocusPe = budget.FocusPe,
          JoinPvf = budget.JoinPvf,
          Pvf = budget.Pvf,
          UpdatedBy = budget.UpdatedBy,
          UpdatedDate = DateTime.Now
        };

        _context.HRB_BUDGET_BIGC.Add(bigcEntity);
        await _context.SaveChangesAsync();

        budget.BudgetId = bigcEntity.BudgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in CreateBigcBudgetAsync: {ex.Message}");
        throw;
      }
    }

    public async Task<BudgetBjcDto?> UpdateBjcBudgetAsync(int budgetId, BudgetBjcDto budget)
    {
      try
      {
        var existingBudget = await _context.HRB_BUDGET_BJC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (existingBudget == null) return null;

        // Update base properties
        existingBudget.BudgetYear = budget.BudgetYear;
        existingBudget.BudgetYearLe = budget.BudgetYearLe;
        existingBudget.CompanyId = budget.CompanyId;
        existingBudget.CompanyCode = budget.CompanyCode;
        existingBudget.Bu = budget.Bu;
        existingBudget.Cobu = budget.Cobu;
        existingBudget.Division = budget.Division;
        existingBudget.Department = budget.Department;
        existingBudget.Section = budget.Section;
        existingBudget.StoreName = budget.StoreName;
        existingBudget.EmpCode = budget.EmpCode;
        existingBudget.EmpStatus = budget.EmpStatus;
        existingBudget.TitleTh = budget.TitleTh;
        existingBudget.FnameTh = budget.FnameTh;
        existingBudget.LnameTh = budget.LnameTh;
        existingBudget.TitleEn = budget.TitleEn;
        existingBudget.FnameEn = budget.FnameEn;
        existingBudget.LnameEn = budget.LnameEn;
        existingBudget.CostCenterCode = budget.CostCenterCode;
        existingBudget.CostCenterName = budget.CostCenterName;
        existingBudget.PositionCode = budget.PositionCode;
        existingBudget.PositionName = budget.PositionName;
        existingBudget.JobBand = budget.JobBand;
        existingBudget.JoinDate = budget.JoinDate;
        existingBudget.YosCurrYear = budget.YosCurrYear;
        existingBudget.YosNextYear = budget.YosNextYear;
        existingBudget.EmpTypeCode = budget.EmpTypeCode;
        existingBudget.NewHcCode = budget.NewHcCode;
        existingBudget.NewVacPeriod = budget.NewVacPeriod;
        existingBudget.NewVacLe = budget.NewVacLe;
        existingBudget.Reason = budget.Reason;
        existingBudget.GroupName = budget.GroupName;
        existingBudget.GroupLevel1 = budget.GroupLevel1;
        existingBudget.GroupLevel2 = budget.GroupLevel2;
        existingBudget.GroupLevel3 = budget.GroupLevel3;
        existingBudget.HrbpEmpCode = budget.HrbpEmpCode;
        existingBudget.LeOfMonth = budget.LeOfMonth;
        existingBudget.NoOfMonth = budget.NoOfMonth;

        // Update LE Fields
        existingBudget.PayrollLe = budget.PayrollLe;
        existingBudget.PremiumLe = budget.PremiumLe;
        existingBudget.BonusLe = budget.BonusLe;
        existingBudget.SalWithEnLe = budget.SalWithEnLe;
        existingBudget.SalNotEnLe = budget.SalNotEnLe;
        existingBudget.SalTempLe = budget.SalTempLe;
        existingBudget.BonusTypeLe = budget.BonusTypeLe;
        existingBudget.SalesManagementPcLe = budget.SalesManagementPcLe;
        existingBudget.ShelfStackingPcLe = budget.ShelfStackingPcLe;
        existingBudget.DiligenceAllowancePcLe = budget.DiligenceAllowancePcLe;
        existingBudget.PostAllowancePcLe = budget.PostAllowancePcLe;
        existingBudget.PhoneAllowancePcLe = budget.PhoneAllowancePcLe;
        existingBudget.TransportationPcLe = budget.TransportationPcLe;
        existingBudget.SkillAllowancePcLe = budget.SkillAllowancePcLe;
        existingBudget.OtherAllowancePcLe = budget.OtherAllowancePcLe;
        existingBudget.TemporaryStaffSalLe = budget.TemporaryStaffSalLe;
        existingBudget.SocialSecurityLe = budget.SocialSecurityLe;
        existingBudget.SocialSecurityTmpLe = budget.SocialSecurityTmpLe;
        existingBudget.ProvidentFundLe = budget.ProvidentFundLe;
        existingBudget.WorkmenCompensationLe = budget.WorkmenCompensationLe;
        existingBudget.HousingAllowanceLe = budget.HousingAllowanceLe;
        existingBudget.SalesCarAllowanceLe = budget.SalesCarAllowanceLe;
        existingBudget.AccommodationLe = budget.AccommodationLe;
        existingBudget.SouthriskAllowanceLe = budget.SouthriskAllowanceLe;
        existingBudget.SouthriskAllowanceTmpLe = budget.SouthriskAllowanceTmpLe;
        existingBudget.MealAllowanceLe = budget.MealAllowanceLe;
        existingBudget.CarAllowanceLe = budget.CarAllowanceLe;
        existingBudget.LicenseAllowanceLe = budget.LicenseAllowanceLe;
        existingBudget.OthersSubjectTaxLe = budget.OthersSubjectTaxLe;
        existingBudget.OutsourceWagesLe = budget.OutsourceWagesLe;
        existingBudget.CompCarsGasLe = budget.CompCarsGasLe;
        existingBudget.CompCarsOtherLe = budget.CompCarsOtherLe;
        existingBudget.CarRentalLe = budget.CarRentalLe;
        existingBudget.CarGasolineLe = budget.CarGasolineLe;
        existingBudget.CarRepairLe = budget.CarRepairLe;
        existingBudget.CarMaintenanceLe = budget.CarMaintenanceLe;
        existingBudget.CarMaintenanceTmpLe = budget.CarMaintenanceTmpLe;
        existingBudget.MedicalOutsideLe = budget.MedicalOutsideLe;
        existingBudget.MedicalInhouseLe = budget.MedicalInhouseLe;
        existingBudget.StaffActivitiesLe = budget.StaffActivitiesLe;
        existingBudget.UniformLe = budget.UniformLe;
        existingBudget.LifeInsuranceLe = budget.LifeInsuranceLe;
        existingBudget.OtherLe = budget.OtherLe;
        existingBudget.PeSbMthLe = budget.PeSbMthLe;
        existingBudget.PeSbYearLe = budget.PeSbYearLe;

        // Update Current Year Budget Fields
        existingBudget.Payroll = budget.Payroll;
        existingBudget.Premium = budget.Premium;
        existingBudget.Bonus = budget.Bonus;
        existingBudget.SalWithEn = budget.SalWithEn;
        existingBudget.SalNotEn = budget.SalNotEn;
        existingBudget.SalTemp = budget.SalTemp;
        existingBudget.BonusType = budget.BonusType;
        existingBudget.SalesManagementPc = budget.SalesManagementPc;
        existingBudget.ShelfStackingPc = budget.ShelfStackingPc;
        existingBudget.DiligenceAllowancePc = budget.DiligenceAllowancePc;
        existingBudget.PostAllowancePc = budget.PostAllowancePc;
        existingBudget.PhoneAllowancePc = budget.PhoneAllowancePc;
        existingBudget.TransportationPc = budget.TransportationPc;
        existingBudget.SkillAllowancePc = budget.SkillAllowancePc;
        existingBudget.OtherAllowancePc = budget.OtherAllowancePc;
        existingBudget.TemporaryStaffSal = budget.TemporaryStaffSal;
        existingBudget.SocialSecurity = budget.SocialSecurity;
        existingBudget.SocialSecurityTmp = budget.SocialSecurityTmp;
        existingBudget.ProvidentFund = budget.ProvidentFund;
        existingBudget.WorkmenCompensation = budget.WorkmenCompensation;
        existingBudget.HousingAllowance = budget.HousingAllowance;
        existingBudget.SalesCarAllowance = budget.SalesCarAllowance;
        existingBudget.Accommodation = budget.Accommodation;
        existingBudget.SouthriskAllowance = budget.SouthriskAllowance;
        existingBudget.SouthriskAllowanceTmp = budget.SouthriskAllowanceTmp;
        existingBudget.MealAllowance = budget.MealAllowance;
        existingBudget.CarAllowance = budget.CarAllowance;
        existingBudget.LicenseAllowance = budget.LicenseAllowance;
        existingBudget.OthersSubjectTax = budget.OthersSubjectTax;
        existingBudget.OutsourceWages = budget.OutsourceWages;
        existingBudget.CompCarsGas = budget.CompCarsGas;
        existingBudget.CompCarsOther = budget.CompCarsOther;
        existingBudget.CarRental = budget.CarRental;
        existingBudget.CarGasoline = budget.CarGasoline;
        existingBudget.CarRepair = budget.CarRepair;
        existingBudget.CarMaintenance = budget.CarMaintenance;
        existingBudget.CarMaintenanceTmp = budget.CarMaintenanceTmp;
        existingBudget.MedicalOutside = budget.MedicalOutside;
        existingBudget.MedicalInhouse = budget.MedicalInhouse;
        existingBudget.StaffActivities = budget.StaffActivities;
        existingBudget.Uniform = budget.Uniform;
        existingBudget.LifeInsurance = budget.LifeInsurance;
        existingBudget.Other = budget.Other;
        existingBudget.PeSbMth = budget.PeSbMth;
        existingBudget.PeSbYear = budget.PeSbYear;

        // Update Additional Fields
        existingBudget.CostCenterPlan = budget.CostCenterPlan;
        existingBudget.SalaryStructure = budget.SalaryStructure;
        existingBudget.PeMthLe = budget.PeMthLe;
        existingBudget.PeYearLe = budget.PeYearLe;
        existingBudget.PeMth = budget.PeMth;
        existingBudget.PeYear = budget.PeYear;
        existingBudget.RunrateCode = budget.RunrateCode;
        existingBudget.Discount = budget.Discount;
        existingBudget.Executive = budget.Executive;
        existingBudget.FocusHc = budget.FocusHc;
        existingBudget.FocusPe = budget.FocusPe;
        existingBudget.JoinPvf = budget.JoinPvf;
        existingBudget.Pvf = budget.Pvf;
        existingBudget.UpdatedBy = budget.UpdatedBy;
        existingBudget.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        budget.BudgetId = budgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in UpdateBjcBudgetAsync: {ex.Message}");
        return null;
      }
    }

    public async Task<BudgetBigcDto?> UpdateBigcBudgetAsync(int budgetId, BudgetBigcDto budget)
    {
      try
      {
        var existingBudget = await _context.HRB_BUDGET_BIGC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (existingBudget == null) return null;

        // Update base properties
        existingBudget.BudgetYear = budget.BudgetYear;
        existingBudget.BudgetYearLe = budget.BudgetYearLe;
        existingBudget.CompanyId = budget.CompanyId;
        existingBudget.CompanyCode = budget.CompanyCode;
        existingBudget.Bu = budget.Bu;
        existingBudget.Cobu = budget.Cobu;
        existingBudget.Division = budget.Division;
        existingBudget.Department = budget.Department;
        existingBudget.Section = budget.Section;
        existingBudget.StoreName = budget.StoreName;
        existingBudget.OrgUnitCode = budget.OrgUnitCode;
        existingBudget.OrgUnitName = budget.OrgUnitName;
        existingBudget.EmpCode = budget.EmpCode;
        existingBudget.EmpStatus = budget.EmpStatus;
        existingBudget.TitleTh = budget.TitleTh;
        existingBudget.FnameTh = budget.FnameTh;
        existingBudget.LnameTh = budget.LnameTh;
        existingBudget.TitleEn = budget.TitleEn;
        existingBudget.FnameEn = budget.FnameEn;
        existingBudget.LnameEn = budget.LnameEn;
        existingBudget.CostCenterCode = budget.CostCenterCode;
        existingBudget.CostCenterName = budget.CostCenterName;
        existingBudget.PositionCode = budget.PositionCode;
        existingBudget.PositionName = budget.PositionName;
        existingBudget.JobBand = budget.JobBand;
        existingBudget.JoinDate = budget.JoinDate;
        existingBudget.YosCurrYear = budget.YosCurrYear;
        existingBudget.YosNextYear = budget.YosNextYear;
        existingBudget.EmpTypeCode = budget.EmpTypeCode;
        existingBudget.NewHcCode = budget.NewHcCode;
        existingBudget.NewVacPeriod = budget.NewVacPeriod;
        existingBudget.NewVacLe = budget.NewVacLe;
        existingBudget.Reason = budget.Reason;
        existingBudget.GroupName = budget.GroupName;
        existingBudget.GroupLevel1 = budget.GroupLevel1;
        existingBudget.GroupLevel2 = budget.GroupLevel2;
        existingBudget.GroupLevel3 = budget.GroupLevel3;
        existingBudget.HrbpEmpCode = budget.HrbpEmpCode;
        existingBudget.LeOfMonth = budget.LeOfMonth;
        existingBudget.NoOfMonth = budget.NoOfMonth;

        // Update LE Fields
        existingBudget.PayrollLe = budget.PayrollLe;
        existingBudget.PremiumLe = budget.PremiumLe;
        existingBudget.BonusLe = budget.BonusLe;
        existingBudget.TotalPayrollLe = budget.TotalPayrollLe;
        existingBudget.FleetCardPeLe = budget.FleetCardPeLe;
        existingBudget.CarAllowanceLe = budget.CarAllowanceLe;
        existingBudget.LicenseAllowanceLe = budget.LicenseAllowanceLe;
        existingBudget.HousingAllowanceLe = budget.HousingAllowanceLe;
        existingBudget.GasolineAllowanceLe = budget.GasolineAllowanceLe;
        existingBudget.WageStudentLe = budget.WageStudentLe;
        existingBudget.CarRentalPeLe = budget.CarRentalPeLe;
        existingBudget.SkillPayAllowanceLe = budget.SkillPayAllowanceLe;
        existingBudget.OtherAllowanceLe = budget.OtherAllowanceLe;
        existingBudget.SocialSecurityLe = budget.SocialSecurityLe;
        existingBudget.LaborFundFeeLe = budget.LaborFundFeeLe;
        existingBudget.OtherStaffBenefitLe = budget.OtherStaffBenefitLe;
        existingBudget.ProvidentFundLe = budget.ProvidentFundLe;
        existingBudget.EmployeeWelfareLe = budget.EmployeeWelfareLe;
        existingBudget.ProvisionLe = budget.ProvisionLe;
        existingBudget.InterestLe = budget.InterestLe;
        existingBudget.StaffInsuranceLe = budget.StaffInsuranceLe;
        existingBudget.MedicalExpenseLe = budget.MedicalExpenseLe;
        existingBudget.MedicalInhouseLe = budget.MedicalInhouseLe;
        existingBudget.TrainingLe = budget.TrainingLe;
        existingBudget.LongServiceLe = budget.LongServiceLe;
        existingBudget.PeSbMthLe = budget.PeSbMthLe;
        existingBudget.PeSbYearLe = budget.PeSbYearLe;

        // Update Budget Fields
        existingBudget.Payroll = budget.Payroll;
        existingBudget.Premium = budget.Premium;
        existingBudget.Bonus = budget.Bonus;
        existingBudget.TotalPayroll = budget.TotalPayroll;
        existingBudget.BonusTypes = budget.BonusTypes;
        existingBudget.FleetCardPe = budget.FleetCardPe;
        existingBudget.CarAllowance = budget.CarAllowance;
        existingBudget.LicenseAllowance = budget.LicenseAllowance;
        existingBudget.HousingAllowance = budget.HousingAllowance;
        existingBudget.GasolineAllowance = budget.GasolineAllowance;
        existingBudget.WageStudent = budget.WageStudent;
        existingBudget.CarRentalPe = budget.CarRentalPe;
        existingBudget.SkillPayAllowance = budget.SkillPayAllowance;
        existingBudget.OtherAllowance = budget.OtherAllowance;
        existingBudget.SocialSecurity = budget.SocialSecurity;
        existingBudget.LaborFundFee = budget.LaborFundFee;
        existingBudget.OtherStaffBenefit = budget.OtherStaffBenefit;
        existingBudget.ProvidentFund = budget.ProvidentFund;
        existingBudget.EmployeeWelfare = budget.EmployeeWelfare;
        existingBudget.Provision = budget.Provision;
        existingBudget.Interest = budget.Interest;
        existingBudget.StaffInsurance = budget.StaffInsurance;
        existingBudget.MedicalExpense = budget.MedicalExpense;
        existingBudget.MedicalInhouse = budget.MedicalInhouse;
        existingBudget.Training = budget.Training;
        existingBudget.LongService = budget.LongService;
        existingBudget.PeSbMth = budget.PeSbMth;
        existingBudget.PeSbYear = budget.PeSbYear;

        // Update Additional Fields
        existingBudget.CostCenterPlan = budget.CostCenterPlan;
        existingBudget.SalaryStructure = budget.SalaryStructure;
        existingBudget.PeMthLe = budget.PeMthLe;
        existingBudget.PeYearLe = budget.PeYearLe;
        existingBudget.PeMth = budget.PeMth;
        existingBudget.PeYear = budget.PeYear;
        existingBudget.RunrateCode = budget.RunrateCode;
        existingBudget.Discount = budget.Discount;
        existingBudget.Executive = budget.Executive;
        existingBudget.FocusHc = budget.FocusHc;
        existingBudget.FocusPe = budget.FocusPe;
        existingBudget.JoinPvf = budget.JoinPvf;
        existingBudget.Pvf = budget.Pvf;
        existingBudget.UpdatedBy = budget.UpdatedBy;
        existingBudget.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        budget.BudgetId = budgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in UpdateBigcBudgetAsync: {ex.Message}");
        return null;
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 Phase 2: Selective Update Methods (Update only changed fields)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// Update BJC budget with selective field update (only non-null properties are updated)
    /// This is used for Partial Update pattern where frontend sends only changed fields
    /// </summary>
    /// <param name="budgetId">Budget ID to update</param>
    /// <param name="budget">DTO containing only changed fields (other fields will be null)</param>
    /// <returns>Updated budget DTO or null if not found</returns>
    public async Task<BudgetBjcDto?> UpdateBjcBudgetSelectiveAsync(int budgetId, BudgetBjcDto budget)
    {
      try
      {
        var existingBudget = await _context.HRB_BUDGET_BJC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (existingBudget == null)
        {
          Console.WriteLine($"❌ Budget not found: BudgetId={budgetId}");
          return null;
        }

        Console.WriteLine($"🔄 Selective Update for BJC BudgetId={budgetId}");
        int updatedFieldsCount = 0;

        // Use reflection to update only non-null properties
        var dtoType = typeof(BudgetBjcDto);
        var entityType = typeof(Models.Budget.HRB_BUDGET_BJC);
        var properties = dtoType.GetProperties();

        foreach (var dtoProp in properties)
        {
          // Skip properties that shouldn't be updated
          if (dtoProp.Name == "BudgetId") continue; // Primary key
          if (!dtoProp.CanRead) continue; // Can't read value

          // Get value from DTO
          var newValue = dtoProp.GetValue(budget);

          // ✅ Update only if value is NOT null (null = not sent from frontend = don't update)
          if (newValue != null)
          {
            // Find corresponding property in entity
            var entityProp = entityType.GetProperty(dtoProp.Name);

            if (entityProp != null && entityProp.CanWrite)
            {
              var oldValue = entityProp.GetValue(existingBudget);

              // Only update if value actually changed
              if (!Equals(oldValue, newValue))
              {
                entityProp.SetValue(existingBudget, newValue);
                Console.WriteLine($"   ✓ {dtoProp.Name}: {FormatValue(oldValue)} → {FormatValue(newValue)}");
                updatedFieldsCount++;
              }
            }
          }
        }

        // Always update audit fields
        existingBudget.UpdatedBy = budget.UpdatedBy ?? "System";
        existingBudget.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        Console.WriteLine($"✅ BJC Selective Update completed: {updatedFieldsCount} fields updated");

        // Return full budget data
        budget.BudgetId = budgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"❌ Error in UpdateBjcBudgetSelectiveAsync: {ex.Message}");
        Console.WriteLine($"   StackTrace: {ex.StackTrace}");
        return null;
      }
    }

    /// <summary>
    /// Update BIGC budget with selective field update (only non-null properties are updated)
    /// This is used for Partial Update pattern where frontend sends only changed fields
    /// </summary>
    /// <param name="budgetId">Budget ID to update</param>
    /// <param name="budget">DTO containing only changed fields (other fields will be null)</param>
    /// <returns>Updated budget DTO or null if not found</returns>
    public async Task<BudgetBigcDto?> UpdateBigcBudgetSelectiveAsync(int budgetId, BudgetBigcDto budget)
    {
      try
      {
        var existingBudget = await _context.HRB_BUDGET_BIGC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (existingBudget == null)
        {
          Console.WriteLine($"❌ Budget not found: BudgetId={budgetId}");
          return null;
        }

        Console.WriteLine($"🔄 Selective Update for BIGC BudgetId={budgetId}");
        int updatedFieldsCount = 0;

        // Use reflection to update only non-null properties
        var dtoType = typeof(BudgetBigcDto);
        var entityType = typeof(Models.Budget.HRB_BUDGET_BIGC);
        var properties = dtoType.GetProperties();

        foreach (var dtoProp in properties)
        {
          // Skip properties that shouldn't be updated
          if (dtoProp.Name == "BudgetId") continue; // Primary key
          if (!dtoProp.CanRead) continue; // Can't read value

          // Get value from DTO
          var newValue = dtoProp.GetValue(budget);

          // ✅ Update only if value is NOT null (null = not sent from frontend = don't update)
          if (newValue != null)
          {
            // Find corresponding property in entity
            var entityProp = entityType.GetProperty(dtoProp.Name);

            if (entityProp != null && entityProp.CanWrite)
            {
              var oldValue = entityProp.GetValue(existingBudget);

              // Only update if value actually changed
              if (!Equals(oldValue, newValue))
              {
                entityProp.SetValue(existingBudget, newValue);
                Console.WriteLine($"   ✓ {dtoProp.Name}: {FormatValue(oldValue)} → {FormatValue(newValue)}");
                updatedFieldsCount++;
              }
            }
          }
        }

        // Always update audit fields
        existingBudget.UpdatedBy = budget.UpdatedBy ?? "System";
        existingBudget.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        Console.WriteLine($"✅ BIGC Selective Update completed: {updatedFieldsCount} fields updated");

        // Return full budget data
        budget.BudgetId = budgetId;
        return budget;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"❌ Error in UpdateBigcBudgetSelectiveAsync: {ex.Message}");
        Console.WriteLine($"   StackTrace: {ex.StackTrace}");
        return null;
      }
    }

    /// <summary>
    /// Helper method to format values for console logging
    /// </summary>
    private string FormatValue(object? value)
    {
      if (value == null) return "null";
      if (value is string str) return str.Length > 50 ? str.Substring(0, 47) + "..." : str;
      if (value is decimal d) return d.ToString("N2");
      if (value is double db) return db.ToString("N2");
      if (value is float f) return f.ToString("N2");
      if (value is DateTime dt) return dt.ToString("yyyy-MM-dd HH:mm:ss");
      return value.ToString() ?? "null";
    }

    public async Task<bool> DeleteBjcBudgetAsync(int budgetId)
    {
      try
      {
        var budget = await _context.HRB_BUDGET_BJC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (budget == null) return false;

        _context.HRB_BUDGET_BJC.Remove(budget);
        await _context.SaveChangesAsync();

        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in DeleteBjcBudgetAsync: {ex.Message}");
        return false;
      }
    }

    public async Task<bool> DeleteBigcBudgetAsync(int budgetId)
    {
      try
      {
        var budget = await _context.HRB_BUDGET_BIGC
            .FirstOrDefaultAsync(b => b.BudgetId == budgetId);

        if (budget == null) return false;

        _context.HRB_BUDGET_BIGC.Remove(budget);
        await _context.SaveChangesAsync();

        return true;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in DeleteBigcBudgetAsync: {ex.Message}");
        return false;
      }
    }

    // Mapping Methods
    public BudgetResponseDto MapToResponseDto(BudgetBjcDto bjcDto)
    {
      return new BudgetResponseDto
      {
        // Base fields (from BaseBudgetDto)
        BudgetId = bjcDto.BudgetId,
        BudgetYear = bjcDto.BudgetYear,
        BudgetYearLe = bjcDto.BudgetYearLe,
        CompanyId = bjcDto.CompanyId,
        CompanyCode = bjcDto.CompanyCode,
        Bu = bjcDto.Bu,
        Cobu = bjcDto.Cobu,
        Division = bjcDto.Division,
        Department = bjcDto.Department,
        Section = bjcDto.Section,
        StoreName = bjcDto.StoreName,
        EmpCode = bjcDto.EmpCode,
        EmpStatus = bjcDto.EmpStatus,
        TitleTh = bjcDto.TitleTh,
        FnameTh = bjcDto.FnameTh,
        LnameTh = bjcDto.LnameTh,
        TitleEn = bjcDto.TitleEn,
        FnameEn = bjcDto.FnameEn,
        LnameEn = bjcDto.LnameEn,
        CostCenterCode = bjcDto.CostCenterCode,
        CostCenterName = bjcDto.CostCenterName,
        PositionCode = bjcDto.PositionCode,
        PositionName = bjcDto.PositionName,
        JobBand = bjcDto.JobBand,
        JoinDate = bjcDto.JoinDate,
        YosCurrYear = bjcDto.YosCurrYear,
        YosNextYear = bjcDto.YosNextYear,
        EmpTypeCode = bjcDto.EmpTypeCode,
        NewHcCode = bjcDto.NewHcCode,
        NewVacPeriod = bjcDto.NewVacPeriod,
        NewVacLe = bjcDto.NewVacLe,
        Reason = bjcDto.Reason,
        GroupName = bjcDto.GroupName,
        GroupLevel1 = bjcDto.GroupLevel1,
        GroupLevel2 = bjcDto.GroupLevel2,
        GroupLevel3 = bjcDto.GroupLevel3,
        HrbpEmpCode = bjcDto.HrbpEmpCode,
        LeOfMonth = bjcDto.LeOfMonth,
        NoOfMonth = bjcDto.NoOfMonth,
        PayrollLe = bjcDto.PayrollLe,
        PremiumLe = bjcDto.PremiumLe,
        BonusLe = bjcDto.BonusLe,
        PeSbMthLe = bjcDto.PeSbMthLe,
        PeSbYearLe = bjcDto.PeSbYearLe,
        Payroll = bjcDto.Payroll,
        Premium = bjcDto.Premium,
        Bonus = bjcDto.Bonus,
        PeSbMth = bjcDto.PeSbMth,
        PeSbYear = bjcDto.PeSbYear,
        CostCenterPlan = bjcDto.CostCenterPlan,
        SalaryStructure = bjcDto.SalaryStructure,
        PeMthLe = bjcDto.PeMthLe,
        PeYearLe = bjcDto.PeYearLe,
        PeMth = bjcDto.PeMth,
        PeYear = bjcDto.PeYear,
        RunrateCode = bjcDto.RunrateCode,
        Discount = bjcDto.Discount,
        Executive = bjcDto.Executive,
        FocusHc = bjcDto.FocusHc,
        FocusPe = bjcDto.FocusPe,
        JoinPvf = bjcDto.JoinPvf,
        Pvf = bjcDto.Pvf,
        UpdatedBy = bjcDto.UpdatedBy,
        UpdatedDate = bjcDto.UpdatedDate,

        // BJC specific mappings to BudgetResponseDto fields
        SalWithEn = bjcDto.SalWithEn,
        SalWithEnLe = bjcDto.SalWithEnLe,
        SalNotEn = bjcDto.SalNotEn,
        SalNotEnLe = bjcDto.SalNotEnLe,
        SalTemp = bjcDto.SalTemp,
        SalTempLe = bjcDto.SalTempLe,
        BonusType = bjcDto.BonusType,
        BonusTypeLe = bjcDto.BonusTypeLe,

        // BJC Performance Components
        SalesManagementPc = bjcDto.SalesManagementPc,
        SalesManagementPcLe = bjcDto.SalesManagementPcLe,
        ShelfStackingPc = bjcDto.ShelfStackingPc,
        ShelfStackingPcLe = bjcDto.ShelfStackingPcLe,
        DiligenceAllowancePc = bjcDto.DiligenceAllowancePc,
        DiligenceAllowancePcLe = bjcDto.DiligenceAllowancePcLe,
        PostAllowancePc = bjcDto.PostAllowancePc,
        PostAllowancePcLe = bjcDto.PostAllowancePcLe,
        PhoneAllowancePc = bjcDto.PhoneAllowancePc,
        PhoneAllowancePcLe = bjcDto.PhoneAllowancePcLe,
        TransportationPc = bjcDto.TransportationPc,
        TransportationPcLe = bjcDto.TransportationPcLe,
        SkillAllowancePc = bjcDto.SkillAllowancePc,
        SkillAllowancePcLe = bjcDto.SkillAllowancePcLe,
        OtherAllowancePc = bjcDto.OtherAllowancePc,
        OtherAllowancePcLe = bjcDto.OtherAllowancePcLe,

        // BJC Staff and Benefits
        TemporaryStaffSal = bjcDto.TemporaryStaffSal,
        TemporaryStaffSalLe = bjcDto.TemporaryStaffSalLe,
        SocialSecurityTmp = bjcDto.SocialSecurityTmp,
        SocialSecurityTmpLe = bjcDto.SocialSecurityTmpLe,
        WorkmenCompensation = bjcDto.WorkmenCompensation,
        WorkmenCompensationLe = bjcDto.WorkmenCompensationLe,

        // BJC Allowances
        SalesCarAllowance = bjcDto.SalesCarAllowance,
        SalesCarAllowanceLe = bjcDto.SalesCarAllowanceLe,
        Accommodation = bjcDto.Accommodation,
        AccommodationLe = bjcDto.AccommodationLe,
        SouthriskAllowance = bjcDto.SouthriskAllowance,
        SouthriskAllowanceLe = bjcDto.SouthriskAllowanceLe,
        SouthriskAllowanceTmp = bjcDto.SouthriskAllowanceTmp,
        SouthriskAllowanceTmpLe = bjcDto.SouthriskAllowanceTmpLe,
        MealAllowance = bjcDto.MealAllowance,
        MealAllowanceLe = bjcDto.MealAllowanceLe,
        OthersSubjectTax = bjcDto.OthersSubjectTax,
        OthersSubjectTaxLe = bjcDto.OthersSubjectTaxLe,
        OutsourceWages = bjcDto.OutsourceWages,
        OutsourceWagesLe = bjcDto.OutsourceWagesLe,

        // BJC Car Related
        CompCarsGas = bjcDto.CompCarsGas,
        CompCarsGasLe = bjcDto.CompCarsGasLe,
        CompCarsOther = bjcDto.CompCarsOther,
        CompCarsOtherLe = bjcDto.CompCarsOtherLe,
        CarRental = bjcDto.CarRental,
        CarRentalLe = bjcDto.CarRentalLe,
        CarGasoline = bjcDto.CarGasoline,
        CarGasolineLe = bjcDto.CarGasolineLe,
        CarRepair = bjcDto.CarRepair,
        CarRepairLe = bjcDto.CarRepairLe,
        CarMaintenance = bjcDto.CarMaintenance,
        CarMaintenanceLe = bjcDto.CarMaintenanceLe,
        CarMaintenanceTmp = bjcDto.CarMaintenanceTmp,
        CarMaintenanceTmpLe = bjcDto.CarMaintenanceTmpLe,

        // BJC Medical and Others
        MedicalOutside = bjcDto.MedicalOutside,
        MedicalOutsideLe = bjcDto.MedicalOutsideLe,
        StaffActivities = bjcDto.StaffActivities,
        StaffActivitiesLe = bjcDto.StaffActivitiesLe,
        Uniform = bjcDto.Uniform,
        UniformLe = bjcDto.UniformLe,
        LifeInsurance = bjcDto.LifeInsurance,
        LifeInsuranceLe = bjcDto.LifeInsuranceLe,
        Other = bjcDto.Other,
        OtherLe = bjcDto.OtherLe
      };
    }

    public BudgetResponseDto MapToResponseDto(BudgetBigcDto bigcDto)
    {
      return new BudgetResponseDto
      {
        // Base fields (from BaseBudgetDto)
        BudgetId = bigcDto.BudgetId,
        BudgetYear = bigcDto.BudgetYear,
        BudgetYearLe = bigcDto.BudgetYearLe,
        CompanyId = bigcDto.CompanyId,
        CompanyCode = bigcDto.CompanyCode,
        Bu = bigcDto.Bu,
        Cobu = bigcDto.Cobu,
        Division = bigcDto.Division,
        Department = bigcDto.Department,
        Section = bigcDto.Section,
        StoreName = bigcDto.StoreName,
        OrgUnitCode = bigcDto.OrgUnitCode,
        OrgUnitName = bigcDto.OrgUnitName,
        EmpCode = bigcDto.EmpCode,
        EmpStatus = bigcDto.EmpStatus,
        TitleTh = bigcDto.TitleTh,
        FnameTh = bigcDto.FnameTh,
        LnameTh = bigcDto.LnameTh,
        TitleEn = bigcDto.TitleEn,
        FnameEn = bigcDto.FnameEn,
        LnameEn = bigcDto.LnameEn,
        CostCenterCode = bigcDto.CostCenterCode,
        CostCenterName = bigcDto.CostCenterName,
        PositionCode = bigcDto.PositionCode,
        PositionName = bigcDto.PositionName,
        JobBand = bigcDto.JobBand,
        JoinDate = bigcDto.JoinDate,
        YosCurrYear = bigcDto.YosCurrYear,
        YosNextYear = bigcDto.YosNextYear,
        EmpTypeCode = bigcDto.EmpTypeCode,
        NewHcCode = bigcDto.NewHcCode,
        NewVacPeriod = bigcDto.NewVacPeriod,
        NewVacLe = bigcDto.NewVacLe,
        Reason = bigcDto.Reason,
        GroupName = bigcDto.GroupName,
        GroupLevel1 = bigcDto.GroupLevel1,
        GroupLevel2 = bigcDto.GroupLevel2,
        GroupLevel3 = bigcDto.GroupLevel3,
        HrbpEmpCode = bigcDto.HrbpEmpCode,
        LeOfMonth = bigcDto.LeOfMonth,
        NoOfMonth = bigcDto.NoOfMonth,
        PayrollLe = bigcDto.PayrollLe,
        PremiumLe = bigcDto.PremiumLe,
        BonusLe = bigcDto.BonusLe,
        PeSbMthLe = bigcDto.PeSbMthLe,
        PeSbYearLe = bigcDto.PeSbYearLe,
        Payroll = bigcDto.Payroll,
        Premium = bigcDto.Premium,
        Bonus = bigcDto.Bonus,
        PeSbMth = bigcDto.PeSbMth,
        PeSbYear = bigcDto.PeSbYear,
        CostCenterPlan = bigcDto.CostCenterPlan,
        SalaryStructure = bigcDto.SalaryStructure,
        PeMthLe = bigcDto.PeMthLe,
        PeYearLe = bigcDto.PeYearLe,
        PeMth = bigcDto.PeMth,
        PeYear = bigcDto.PeYear,
        RunrateCode = bigcDto.RunrateCode,
        Discount = bigcDto.Discount,
        Executive = bigcDto.Executive,
        FocusHc = bigcDto.FocusHc,
        FocusPe = bigcDto.FocusPe,
        JoinPvf = bigcDto.JoinPvf,
        Pvf = bigcDto.Pvf,
        UpdatedBy = bigcDto.UpdatedBy,
        UpdatedDate = bigcDto.UpdatedDate,

        // BIGC specific mappings to BudgetResponseDto fields
        BonusTypes = bigcDto.BonusTypes,
        TotalPayroll = bigcDto.TotalPayroll,
        TotalPayrollLe = bigcDto.TotalPayrollLe,
        WageStudent = bigcDto.WageStudent,
        WageStudentLe = bigcDto.WageStudentLe,
        FleetCardPe = bigcDto.FleetCardPe,
        FleetCardPeLe = bigcDto.FleetCardPeLe,

        // Map other BIGC allowances that exist in both DTOs
        SkillPayAllowance = bigcDto.SkillPayAllowance,
        SkillPayAllowanceLe = bigcDto.SkillPayAllowanceLe,

        // Map car-related fields
        CarRental = bigcDto.CarRentalPe,  // Map CarRentalPe to CarRental
        CarRentalLe = bigcDto.CarRentalPeLe,

        // Training field is already mapped in BIGC-Specific Benefits section
      };
    }

    public BudgetBjcDto MapToBjcDto(BudgetResponseDto responseDto)
    {
      return new BudgetBjcDto
      {
        // Base fields mapping
        BudgetId = responseDto.BudgetId,
        BudgetYear = responseDto.BudgetYear,
        BudgetYearLe = responseDto.BudgetYearLe,
        CompanyId = responseDto.CompanyId,
        CompanyCode = responseDto.CompanyCode,
        Bu = responseDto.Bu,
        Cobu = responseDto.Cobu,
        Division = responseDto.Division,
        Department = responseDto.Department,
        Section = responseDto.Section,
        StoreName = responseDto.StoreName,
        EmpCode = responseDto.EmpCode,
        EmpStatus = responseDto.EmpStatus,
        TitleTh = responseDto.TitleTh,
        FnameTh = responseDto.FnameTh,
        LnameTh = responseDto.LnameTh,
        TitleEn = responseDto.TitleEn,
        FnameEn = responseDto.FnameEn,
        LnameEn = responseDto.LnameEn,
        CostCenterCode = responseDto.CostCenterCode,
        CostCenterName = responseDto.CostCenterName,
        PositionCode = responseDto.PositionCode,
        PositionName = responseDto.PositionName,
        JobBand = responseDto.JobBand,
        JoinDate = responseDto.JoinDate,
        YosCurrYear = responseDto.YosCurrYear,
        YosNextYear = responseDto.YosNextYear,
        EmpTypeCode = responseDto.EmpTypeCode,
        NewHcCode = responseDto.NewHcCode,
        NewVacPeriod = responseDto.NewVacPeriod,
        NewVacLe = responseDto.NewVacLe,
        Reason = responseDto.Reason,
        GroupName = responseDto.GroupName,
        GroupLevel1 = responseDto.GroupLevel1,
        GroupLevel2 = responseDto.GroupLevel2,
        GroupLevel3 = responseDto.GroupLevel3,
        HrbpEmpCode = responseDto.HrbpEmpCode,
        LeOfMonth = responseDto.LeOfMonth,
        NoOfMonth = responseDto.NoOfMonth,

        // ✅ LE (Last Estimate) Fields - Ordered as in HRB_BUDGET_BJC.cs
        PayrollLe = responseDto.PayrollLe,
        PremiumLe = responseDto.PremiumLe,
        SalWithEnLe = responseDto.SalWithEnLe,
        SalNotEnLe = responseDto.SalNotEnLe,
        BonusTypeLe = responseDto.BonusTypeLe,
        BonusLe = responseDto.BonusLe,
        SalTempLe = responseDto.SalTempLe,
        SocialSecurityTmpLe = responseDto.SocialSecurityTmpLe,
        SouthriskAllowanceTmpLe = responseDto.SouthriskAllowanceTmpLe,
        CarMaintenanceTmpLe = responseDto.CarMaintenanceTmpLe,
        SalesManagementPcLe = responseDto.SalesManagementPcLe,
        ShelfStackingPcLe = responseDto.ShelfStackingPcLe,
        DiligenceAllowancePcLe = responseDto.DiligenceAllowancePcLe,
        PostAllowancePcLe = responseDto.PostAllowancePcLe,
        PhoneAllowancePcLe = responseDto.PhoneAllowancePcLe,
        TransportationPcLe = responseDto.TransportationPcLe,
        SkillAllowancePcLe = responseDto.SkillAllowancePcLe,
        OtherAllowancePcLe = responseDto.OtherAllowancePcLe,
        TemporaryStaffSalLe = responseDto.TemporaryStaffSalLe,
        SocialSecurityLe = responseDto.SocialSecurityLe,
        ProvidentFundLe = responseDto.ProvidentFundLe,
        WorkmenCompensationLe = responseDto.WorkmenCompensationLe,
        HousingAllowanceLe = responseDto.HousingAllowanceLe,
        SalesCarAllowanceLe = responseDto.SalesCarAllowanceLe,
        AccommodationLe = responseDto.AccommodationLe,
        CarMaintenanceLe = responseDto.CarMaintenanceLe,
        SouthriskAllowanceLe = responseDto.SouthriskAllowanceLe,
        MealAllowanceLe = responseDto.MealAllowanceLe,
        OtherLe = responseDto.OtherLe,
        OthersSubjectTaxLe = responseDto.OthersSubjectTaxLe,
        CarAllowanceLe = responseDto.CarAllowanceLe,
        LicenseAllowanceLe = responseDto.LicenseAllowanceLe,
        OutsourceWagesLe = responseDto.OutsourceWagesLe,
        CompCarsGasLe = responseDto.CompCarsGasLe,
        CompCarsOtherLe = responseDto.CompCarsOtherLe,
        CarRentalLe = responseDto.CarRentalLe,
        CarGasolineLe = responseDto.CarGasolineLe,
        CarRepairLe = responseDto.CarRepairLe,
        MedicalOutsideLe = responseDto.MedicalOutsideLe,
        MedicalInhouseLe = responseDto.MedicalInHouseLe,  // ✅ TEST: Fixed property name - BudgetResponseDto uses MedicalInHouseLe (Capital H)
        StaffActivitiesLe = responseDto.StaffActivitiesLe,
        UniformLe = responseDto.UniformLe,
        LifeInsuranceLe = responseDto.LifeInsuranceLe,
        PeSbMthLe = responseDto.PeSbMthLe,
        PeSbYearLe = responseDto.PeSbYearLe,

        // ✅ Current Year Budget Fields - Ordered as in HRB_BUDGET_BJC.cs
        Payroll = responseDto.Payroll,
        Premium = responseDto.Premium,
        SalWithEn = responseDto.SalWithEn,
        SalNotEn = responseDto.SalNotEn,
        BonusType = responseDto.BonusType,
        Bonus = responseDto.Bonus,
        SalTemp = responseDto.SalTemp,
        SocialSecurityTmp = responseDto.SocialSecurityTmp,
        SouthriskAllowanceTmp = responseDto.SouthriskAllowanceTmp,
        CarMaintenanceTmp = responseDto.CarMaintenanceTmp,
        SalesManagementPc = responseDto.SalesManagementPc,
        ShelfStackingPc = responseDto.ShelfStackingPc,
        DiligenceAllowancePc = responseDto.DiligenceAllowancePc,
        PostAllowancePc = responseDto.PostAllowancePc,
        PhoneAllowancePc = responseDto.PhoneAllowancePc,
        TransportationPc = responseDto.TransportationPc,
        SkillAllowancePc = responseDto.SkillAllowancePc,
        OtherAllowancePc = responseDto.OtherAllowancePc,
        TemporaryStaffSal = responseDto.TemporaryStaffSal,
        SocialSecurity = responseDto.SocialSecurity,
        ProvidentFund = responseDto.ProvidentFund,
        WorkmenCompensation = responseDto.WorkmenCompensation,
        HousingAllowance = responseDto.HousingAllowance,
        SalesCarAllowance = responseDto.SalesCarAllowance,
        Accommodation = responseDto.Accommodation,
        CarMaintenance = responseDto.CarMaintenance,
        SouthriskAllowance = responseDto.SouthriskAllowance,
        MealAllowance = responseDto.MealAllowance,
        Other = responseDto.Other,
        OthersSubjectTax = responseDto.OthersSubjectTax,
        CarAllowance = responseDto.CarAllowance,
        LicenseAllowance = responseDto.LicenseAllowance,
        OutsourceWages = responseDto.OutsourceWages,
        CompCarsGas = responseDto.CompCarsGas,
        CompCarsOther = responseDto.CompCarsOther,
        CarRental = responseDto.CarRental,
        CarGasoline = responseDto.CarGasoline,
        CarRepair = responseDto.CarRepair,
        MedicalOutside = responseDto.MedicalOutside,
        MedicalInhouse = responseDto.MedicalInHouse,  // ✅ TEST: Fixed property name - BudgetResponseDto uses MedicalInHouse (Capital H)
        StaffActivities = responseDto.StaffActivities,
        Uniform = responseDto.Uniform,
        LifeInsurance = responseDto.LifeInsurance,
        PeSbMth = responseDto.PeSbMth,
        PeSbYear = responseDto.PeSbYear,

        // ✅ Additional Fields - Ordered as in HRB_BUDGET_BJC.cs
        CostCenterPlan = responseDto.CostCenterPlan,
        SalaryStructure = responseDto.SalaryStructure,
        PeMthLe = responseDto.PeMthLe,
        PeYearLe = responseDto.PeYearLe,
        PeMth = responseDto.PeMth,
        PeYear = responseDto.PeYear,
        RunrateCode = responseDto.RunrateCode,
        Discount = responseDto.Discount,
        Executive = responseDto.Executive,
        FocusHc = responseDto.FocusHc,
        FocusPe = responseDto.FocusPe,
        JoinPvf = responseDto.JoinPvf,
        Pvf = responseDto.Pvf,
        UpdatedBy = responseDto.UpdatedBy,
        UpdatedDate = responseDto.UpdatedDate

        // ❌ Next Year Fields (35 Nx) - Intentionally NOT mapped (not used in system)
      };
    }

    public BudgetBigcDto MapToBigcDto(BudgetResponseDto responseDto)
    {
      return new BudgetBigcDto
      {
        // Base fields mapping
        BudgetId = responseDto.BudgetId,
        BudgetYear = responseDto.BudgetYear,
        BudgetYearLe = responseDto.BudgetYearLe,
        CompanyId = responseDto.CompanyId,
        CompanyCode = responseDto.CompanyCode,
        Bu = responseDto.Bu,
        Cobu = responseDto.Cobu,
        Division = responseDto.Division,
        Department = responseDto.Department,
        Section = responseDto.Section,
        StoreName = responseDto.StoreName,
        OrgUnitCode = responseDto.OrgUnitCode,
        OrgUnitName = responseDto.OrgUnitName,
        EmpCode = responseDto.EmpCode,
        EmpStatus = responseDto.EmpStatus,
        TitleTh = responseDto.TitleTh,
        FnameTh = responseDto.FnameTh,
        LnameTh = responseDto.LnameTh,
        TitleEn = responseDto.TitleEn,
        FnameEn = responseDto.FnameEn,
        LnameEn = responseDto.LnameEn,
        CostCenterCode = responseDto.CostCenterCode,
        CostCenterName = responseDto.CostCenterName,
        PositionCode = responseDto.PositionCode,
        PositionName = responseDto.PositionName,
        JobBand = responseDto.JobBand,
        JoinDate = responseDto.JoinDate,
        YosCurrYear = responseDto.YosCurrYear,
        YosNextYear = responseDto.YosNextYear,
        EmpTypeCode = responseDto.EmpTypeCode,
        NewHcCode = responseDto.NewHcCode,
        NewVacPeriod = responseDto.NewVacPeriod,
        NewVacLe = responseDto.NewVacLe,
        Reason = responseDto.Reason,
        GroupName = responseDto.GroupName,
        GroupLevel1 = responseDto.GroupLevel1,
        GroupLevel2 = responseDto.GroupLevel2,
        GroupLevel3 = responseDto.GroupLevel3,
        HrbpEmpCode = responseDto.HrbpEmpCode,
        LeOfMonth = responseDto.LeOfMonth,
        NoOfMonth = responseDto.NoOfMonth,

        // ✅ LE (Last Estimate) Fields - Ordered as in HRB_BUDGET_BIGC.cs
        PayrollLe = responseDto.PayrollLe,
        PremiumLe = responseDto.PremiumLe,
        TotalPayrollLe = responseDto.TotalPayrollLe,
        BonusLe = responseDto.BonusLe,
        FleetCardPeLe = responseDto.FleetCardPeLe,
        CarAllowanceLe = responseDto.CarAllowanceLe,
        LicenseAllowanceLe = responseDto.LicenseAllowanceLe,
        HousingAllowanceLe = responseDto.HousingAllowanceLe,
        GasolineAllowanceLe = responseDto.GasolineAllowanceLe,
        WageStudentLe = responseDto.WageStudentLe,
        CarRentalPeLe = responseDto.CarRentalPeLe,
        SkillPayAllowanceLe = responseDto.SkillPayAllowanceLe,
        OtherAllowanceLe = responseDto.OtherAllowanceLe,
        SocialSecurityLe = responseDto.SocialSecurityLe,
        LaborFundFeeLe = responseDto.LaborFundFeeLe,
        OtherStaffBenefitLe = responseDto.OtherStaffBenefitLe,
        ProvidentFundLe = responseDto.ProvidentFundLe,
        EmployeeWelfareLe = responseDto.EmployeeWelfareLe,
        ProvisionLe = responseDto.ProvisionLe,
        InterestLe = responseDto.InterestLe,
        StaffInsuranceLe = responseDto.StaffInsuranceLe,
        MedicalExpenseLe = responseDto.MedicalExpenseLe,
        MedicalInhouseLe = responseDto.MedicalInHouseLe,  // ✅ TEST: Fixed property name - BudgetResponseDto uses MedicalInHouseLe (Capital H)
        TrainingLe = responseDto.TrainingLe,
        LongServiceLe = responseDto.LongServiceLe,
        PeSbMthLe = responseDto.PeSbMthLe,
        PeSbYearLe = responseDto.PeSbYearLe,

        // ✅ Budget Fields (Current Year) - Ordered as in HRB_BUDGET_BIGC.cs
        Payroll = responseDto.Payroll,
        Premium = responseDto.Premium,
        TotalPayroll = responseDto.TotalPayroll,
        Bonus = responseDto.Bonus,
        BonusTypes = responseDto.BonusTypes,
        FleetCardPe = responseDto.FleetCardPe,
        CarAllowance = responseDto.CarAllowance,
        LicenseAllowance = responseDto.LicenseAllowance,
        HousingAllowance = responseDto.HousingAllowance,
        GasolineAllowance = responseDto.GasolineAllowance,
        WageStudent = responseDto.WageStudent,
        CarRentalPe = responseDto.CarRentalPe,
        SkillPayAllowance = responseDto.SkillPayAllowance,
        OtherAllowance = responseDto.OtherAllowance,
        SocialSecurity = responseDto.SocialSecurity,
        LaborFundFee = responseDto.LaborFundFee,
        OtherStaffBenefit = responseDto.OtherStaffBenefit,
        ProvidentFund = responseDto.ProvidentFund,
        EmployeeWelfare = responseDto.EmployeeWelfare,
        Provision = responseDto.Provision,
        Interest = responseDto.Interest,
        StaffInsurance = responseDto.StaffInsurance,
        MedicalExpense = responseDto.MedicalExpense,
        MedicalInhouse = responseDto.MedicalInHouse,  // ✅ TEST: Fixed property name - BudgetResponseDto uses MedicalInHouse (Capital H)
        Training = responseDto.Training,
        LongService = responseDto.LongService,
        PeSbMth = responseDto.PeSbMth,
        PeSbYear = responseDto.PeSbYear,

        // ✅ Additional Fields - Ordered as in HRB_BUDGET_BIGC.cs
        CostCenterPlan = responseDto.CostCenterPlan,
        SalaryStructure = responseDto.SalaryStructure,
        PeMthLe = responseDto.PeMthLe,
        PeYearLe = responseDto.PeYearLe,
        PeMth = responseDto.PeMth,
        PeYear = responseDto.PeYear,
        RunrateCode = responseDto.RunrateCode,
        Discount = responseDto.Discount,
        Executive = responseDto.Executive,
        FocusHc = responseDto.FocusHc,
        FocusPe = responseDto.FocusPe,
        JoinPvf = responseDto.JoinPvf,
        Pvf = responseDto.Pvf,
        UpdatedBy = responseDto.UpdatedBy,
        UpdatedDate = responseDto.UpdatedDate
      };
    }

    // Support Methods
    public async Task<int> GetBudgetCountAsync(BudgetFilterDto filter)
    {
      try
      {
        int totalCount = 0;

        if (filter.CompanyID == "1") // BJC
        {
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          totalCount = bjcBudgets.Count;
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var bigcBudgets = await GetBigcBudgetsAsync(filter);
          totalCount = bigcBudgets.Count;
        }
        else
        {
          // รวมจากทั้งสอง company
          var bjcBudgets = await GetBjcBudgetsAsync(filter);
          var bigcBudgets = await GetBigcBudgetsAsync(filter);
          totalCount = bjcBudgets.Count + bigcBudgets.Count;
        }

        return totalCount;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetBudgetCountAsync: {ex.Message}");
        return 0;
      }
    }

    public async Task<decimal> GetTotalPayrollAsync(BudgetFilterDto filter)
    {
      try
      {
        decimal totalPayroll = 0;

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // รวมจากทั้งสอง company
          var bjcTotal = await _context.HRB_BUDGET_BJC
              .SumAsync(b => b.Payroll ?? 0);

          var bigcTotal = await _context.HRB_BUDGET_BIGC
              .SumAsync(b => b.Payroll ?? 0);

          totalPayroll = bjcTotal + bigcTotal;
        }
        else if (filter.CompanyID == "1") // BJC
        {
          totalPayroll = await _context.HRB_BUDGET_BJC
              .SumAsync(b => b.Payroll ?? 0);
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          totalPayroll = await _context.HRB_BUDGET_BIGC
              .SumAsync(b => b.Payroll ?? 0);
        }

        return totalPayroll;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetTotalPayrollAsync: {ex.Message}");
        return 0;
      }
    }

    public async Task<decimal> GetTotalBonusAsync(BudgetFilterDto filter)
    {
      try
      {
        decimal totalBonus = 0;

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // รวมจากทั้งสอง company
          var bjcTotal = await _context.HRB_BUDGET_BJC
              .SumAsync(b => b.Bonus ?? 0);

          var bigcTotal = await _context.HRB_BUDGET_BIGC
              .SumAsync(b => b.Bonus ?? 0);

          totalBonus = bjcTotal + bigcTotal;
        }
        else if (filter.CompanyID == "1") // BJC
        {
          totalBonus = await _context.HRB_BUDGET_BJC
              .SumAsync(b => b.Bonus ?? 0);
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          totalBonus = await _context.HRB_BUDGET_BIGC
              .SumAsync(b => b.Bonus ?? 0);
        }

        return totalBonus;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetTotalBonusAsync: {ex.Message}");
        return 0;
      }
    }

    public async Task<int> GetEmployeeCountAsync(BudgetFilterDto filter)
    {
      try
      {
        int employeeCount = 0;

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // รวมจากทั้งสอง company
          var bjcCount = await _context.HRB_BUDGET_BJC.CountAsync();
          var bigcCount = await _context.HRB_BUDGET_BIGC.CountAsync();
          employeeCount = bjcCount + bigcCount;
        }
        else if (filter.CompanyID == "1") // BJC
        {
          employeeCount = await _context.HRB_BUDGET_BJC.CountAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          employeeCount = await _context.HRB_BUDGET_BIGC.CountAsync();
        }

        return employeeCount;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetEmployeeCountAsync: {ex.Message}");
        return 0;
      }
    }

    // Dropdown Methods
    public async Task<List<object>> GetDistinctCompaniesAsync(string? companyAccess = null)
    {
      try
      {
        var query = _context.HRB_MST_COMPANY
            .Where(c => c.IsActive == true);

        // 🔒 Filter by CompanyAccess (Option C)
        if (!string.IsNullOrEmpty(companyAccess))
        {
          // Parse CompanyAccess: BJC, BIGC, หรือ BJC,BIGC
          var allowedCodes = companyAccess.Split(',')
              .Select(c => c.Trim().ToUpper())
              .Where(c => !string.IsNullOrEmpty(c))
              .ToList();

          query = query.Where(c => allowedCodes.Contains(c.CompanyCode.ToUpper()));
        }
        else
        {
          // ไม่มี companyAccess → return empty (security)
          return new List<object>();
        }

        var companies = await query
            .Select(c => new
            {
              CompanyId = c.CompanyId.ToString(),
              CompanyCode = c.CompanyCode
            })
            .Distinct()
            .ToListAsync();

        return companies.Cast<object>().ToList();
      }
      catch (Exception ex)
      {
        // Log error if needed
        Console.WriteLine($"Error in GetDistinctCompaniesAsync: {ex.Message}");
        return new List<object>();
      }
    }

    public async Task<List<string?>> GetDistinctCoBUAsync(string? companyID)
    {
      try
      {
        List<string?> distinctCoBU = new List<string?>();

        // ถ้าไม่ระบุ CompanyID ให้ดึงจากทั้งสอง company
        if (string.IsNullOrEmpty(companyID))
        {
          // ดึงจาก BJC (Company ID = 1)
          var bjcCoBU = await _context.HRB_BUDGET_BJC
              .Where(b => !string.IsNullOrEmpty(b.Cobu))
              .Select(b => b.Cobu)
              .Distinct()
              .ToListAsync();

          // ดึงจาก BIGC (Company ID = 2)
          var bigcCoBU = await _context.HRB_BUDGET_BIGC
              .Where(b => !string.IsNullOrEmpty(b.Cobu))
              .Select(b => b.Cobu)
              .Distinct()
              .ToListAsync();

          // รวมและเอาค่าที่ไม่ซ้ำกัน
          distinctCoBU = bjcCoBU.Union(bigcCoBU).Distinct().ToList();
        }
        else
        {
          // ดึงตาม Company ID ที่เลือก
          if (companyID == "1") // BJC
          {
            distinctCoBU = await _context.HRB_BUDGET_BJC
                .Where(b => !string.IsNullOrEmpty(b.Cobu))
                .Select(b => b.Cobu)
                .Distinct()
                .ToListAsync();
          }
          else if (companyID == "2") // BIGC
          {
            distinctCoBU = await _context.HRB_BUDGET_BIGC
                .Where(b => !string.IsNullOrEmpty(b.Cobu))
                .Select(b => b.Cobu)
                .Distinct()
                .ToListAsync();
          }
        }

        return distinctCoBU;
      }
      catch (Exception ex)
      {
        // Log error if needed
        Console.WriteLine($"Error in GetDistinctCoBUAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<object>> GetDistinctPositionsAsync(BudgetFilterDto filter)
    {
      try
      {
        List<object> distinctPositions = new List<object>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bjcQuery = bjcQuery.Where(b => b.EmpStatus == filter.EmpStatus);

          var bjcPositions = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.PositionCode))
              .Select(b => new { PositionCode = b.PositionCode, PositionName = b.PositionName })
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bigcQuery = bigcQuery.Where(b => b.EmpStatus == filter.EmpStatus);

          var bigcPositions = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.PositionCode))
              .Select(b => new { PositionCode = b.PositionCode, PositionName = b.PositionName })
              .Distinct()
              .ToListAsync();

          distinctPositions = bjcPositions.Cast<object>()
              .Union(bigcPositions.Cast<object>())
              .ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply all cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            query = query.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            query = query.Where(b => b.EmpStatus == filter.EmpStatus);

          var positions = await query
              .Where(b => !string.IsNullOrEmpty(b.PositionCode))
              .Select(b => new { PositionCode = b.PositionCode, PositionName = b.PositionName })
              .Distinct()
              .ToListAsync();

          distinctPositions = positions.Cast<object>().ToList();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply all cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            query = query.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            query = query.Where(b => b.EmpStatus == filter.EmpStatus);

          var positions = await query
              .Where(b => !string.IsNullOrEmpty(b.PositionCode))
              .Select(b => new { PositionCode = b.PositionCode, PositionName = b.PositionName })
              .Distinct()
              .ToListAsync();

          distinctPositions = positions.Cast<object>().ToList();
        }

        return distinctPositions;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctPositionsAsync: {ex.Message}");
        return new List<object>();
      }
    }

    public async Task<List<string?>> GetDistinctDivisionsAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctDivisions = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);

          var bjcDivisions = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.Division))
              .Select(b => b.Division)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);

          var bigcDivisions = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.Division))
              .Select(b => b.Division)
              .Distinct()
              .ToListAsync();

          distinctDivisions = bjcDivisions.Union(bigcDivisions).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);

          distinctDivisions = await query
              .Where(b => !string.IsNullOrEmpty(b.Division))
              .Select(b => b.Division)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);

          distinctDivisions = await query
              .Where(b => !string.IsNullOrEmpty(b.Division))
              .Select(b => b.Division)
              .Distinct()
              .ToListAsync();
        }

        return distinctDivisions;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctDivisionsAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctDepartmentsAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctDepartments = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);

          var bjcDepartments = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.Department))
              .Select(b => b.Department)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);

          var bigcDepartments = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.Department))
              .Select(b => b.Department)
              .Distinct()
              .ToListAsync();

          distinctDepartments = bjcDepartments.Union(bigcDepartments).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);

          distinctDepartments = await query
              .Where(b => !string.IsNullOrEmpty(b.Department))
              .Select(b => b.Department)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);

          distinctDepartments = await query
              .Where(b => !string.IsNullOrEmpty(b.Department))
              .Select(b => b.Department)
              .Distinct()
              .ToListAsync();
        }

        return distinctDepartments;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctDepartmentsAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctSectionsAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctSections = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);

          var bjcSections = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.Section))
              .Select(b => b.Section)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);

          var bigcSections = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.Section))
              .Select(b => b.Section)
              .Distinct()
              .ToListAsync();

          distinctSections = bjcSections.Union(bigcSections).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);

          distinctSections = await query
              .Where(b => !string.IsNullOrEmpty(b.Section))
              .Select(b => b.Section)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);

          distinctSections = await query
              .Where(b => !string.IsNullOrEmpty(b.Section))
              .Select(b => b.Section)
              .Distinct()
              .ToListAsync();
        }

        return distinctSections;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctSectionsAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctStoreNamesAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctStoreNames = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);

          var bjcStoreNames = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.StoreName))
              .Select(b => b.StoreName)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);

          var bigcStoreNames = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.StoreName))
              .Select(b => b.StoreName)
              .Distinct()
              .ToListAsync();

          distinctStoreNames = bjcStoreNames.Union(bigcStoreNames).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            query = query.Where(b => b.Section == filter.Section);

          distinctStoreNames = await query
              .Where(b => !string.IsNullOrEmpty(b.StoreName))
              .Select(b => b.StoreName)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply cascading filters
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            query = query.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            query = query.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            query = query.Where(b => b.Section == filter.Section);

          distinctStoreNames = await query
              .Where(b => !string.IsNullOrEmpty(b.StoreName))
              .Select(b => b.StoreName)
              .Distinct()
              .ToListAsync();
        }

        return distinctStoreNames;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctStoreNamesAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<object>> GetDistinctCostCentersAsync(BudgetFilterDto filter)
    {
      try
      {
        List<object> distinctCostCenters = new List<object>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);

          var bjcCostCenters = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.CostCenterCode))
              .Select(b => new { CostCenterCode = b.CostCenterCode, CostCenterName = b.CostCenterName })
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);

          var bigcCostCenters = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.CostCenterCode))
              .Select(b => new { CostCenterCode = b.CostCenterCode, CostCenterName = b.CostCenterName })
              .Distinct()
              .ToListAsync();

          distinctCostCenters = bjcCostCenters.Cast<object>()
              .Union(bigcCostCenters.Cast<object>())
              .ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var query = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply BudgetYear filter
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);

          var costCenters = await query
              .Where(b => !string.IsNullOrEmpty(b.CostCenterCode))
              .Select(b => new { CostCenterCode = b.CostCenterCode, CostCenterName = b.CostCenterName })
              .Distinct()
              .ToListAsync();

          distinctCostCenters = costCenters.Cast<object>().ToList();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var query = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply BudgetYear filter
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int year))
            query = query.Where(b => b.BudgetYear == year);
          if (!string.IsNullOrEmpty(filter.Cobu))
            query = query.Where(b => b.Cobu == filter.Cobu);

          var costCenters = await query
              .Where(b => !string.IsNullOrEmpty(b.CostCenterCode))
              .Select(b => new { CostCenterCode = b.CostCenterCode, CostCenterName = b.CostCenterName })
              .Distinct()
              .ToListAsync();

          distinctCostCenters = costCenters.Cast<object>().ToList();
        }

        return distinctCostCenters;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctCostCentersAsync: {ex.Message}");
        return new List<object>();
      }
    }

    public async Task<List<int?>> GetDistinctBudgetYearsAsync(string? companyID)
    {
      try
      {
        List<int?> distinctYears = new List<int?>();

        if (string.IsNullOrEmpty(companyID))
        {
          // ดึงจากทั้งสอง company
          var bjcYears = await _context.HRB_BUDGET_BJC
              .Select(b => (int?)b.BudgetYear)
              .Distinct()
              .ToListAsync();

          var bigcYears = await _context.HRB_BUDGET_BIGC
              .Select(b => (int?)b.BudgetYear)
              .Distinct()
              .ToListAsync();

          distinctYears = bjcYears.Union(bigcYears).Distinct().ToList();
        }
        else if (companyID == "1") // BJC
        {
          distinctYears = await _context.HRB_BUDGET_BJC
              .Select(b => (int?)b.BudgetYear)
              .Distinct()
              .ToListAsync();
        }
        else if (companyID == "2") // BIGC
        {
          distinctYears = await _context.HRB_BUDGET_BIGC
              .Select(b => (int?)b.BudgetYear)
              .Distinct()
              .ToListAsync();
        }

        return distinctYears;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctBudgetYearsAsync: {ex.Message}");
        return new List<int?>();
      }
    }

    public async Task<List<string?>> GetDistinctEmpStatusesAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctEmpStatuses = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          // ดึงจากทั้งสอง company
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bjcQuery = bjcQuery.Where(b => b.StoreName == filter.StoreName);

          var bjcEmpStatuses = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.EmpStatus))
              .Select(b => b.EmpStatus)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bigcQuery = bigcQuery.Where(b => b.StoreName == filter.StoreName);

          var bigcEmpStatuses = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.EmpStatus))
              .Select(b => b.EmpStatus)
              .Distinct()
              .ToListAsync();

          distinctEmpStatuses = bjcEmpStatuses.Union(bigcEmpStatuses).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bjcQuery = bjcQuery.Where(b => b.StoreName == filter.StoreName);

          distinctEmpStatuses = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.EmpStatus))
              .Select(b => b.EmpStatus)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bigcQuery = bigcQuery.Where(b => b.StoreName == filter.StoreName);

          distinctEmpStatuses = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.EmpStatus))
              .Select(b => b.EmpStatus)
              .Distinct()
              .ToListAsync();
        }

        return distinctEmpStatuses;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctEmpStatusesAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctJobBandsAsync(BudgetFilterDto filter)
    {
      try
      {
        List<string?> distinctJobBands = new List<string?>();

        if (string.IsNullOrEmpty(filter.CompanyID))
        {
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bjcQuery = bjcQuery.Where(b => b.StoreName == filter.StoreName);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bjcQuery = bjcQuery.Where(b => b.EmpStatus == filter.EmpStatus);
          if (!string.IsNullOrEmpty(filter.PositionCode))
            bjcQuery = bjcQuery.Where(b => b.PositionCode == filter.PositionCode);

          var bjcJobBands = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.JobBand))
              .Select(b => b.JobBand)
              .Distinct()
              .ToListAsync();

          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bigcQuery = bigcQuery.Where(b => b.StoreName == filter.StoreName);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bigcQuery = bigcQuery.Where(b => b.EmpStatus == filter.EmpStatus);
          if (!string.IsNullOrEmpty(filter.PositionCode))
            bigcQuery = bigcQuery.Where(b => b.PositionCode == filter.PositionCode);

          var bigcJobBands = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.JobBand))
              .Select(b => b.JobBand)
              .Distinct()
              .ToListAsync();

          distinctJobBands = bjcJobBands.Union(bigcJobBands).Distinct().ToList();
        }
        else if (filter.CompanyID == "1") // BJC
        {
          var bjcQuery = _context.HRB_BUDGET_BJC.AsQueryable();

          // Apply filters for BJC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bjcYear))
            bjcQuery = bjcQuery.Where(b => b.BudgetYear == bjcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bjcQuery = bjcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bjcQuery = bjcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bjcQuery = bjcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bjcQuery = bjcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bjcQuery = bjcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bjcQuery = bjcQuery.Where(b => b.StoreName == filter.StoreName);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bjcQuery = bjcQuery.Where(b => b.EmpStatus == filter.EmpStatus);
          if (!string.IsNullOrEmpty(filter.PositionCode))
            bjcQuery = bjcQuery.Where(b => b.PositionCode == filter.PositionCode);

          distinctJobBands = await bjcQuery
              .Where(b => !string.IsNullOrEmpty(b.JobBand))
              .Select(b => b.JobBand)
              .Distinct()
              .ToListAsync();
        }
        else if (filter.CompanyID == "2") // BIGC
        {
          var bigcQuery = _context.HRB_BUDGET_BIGC.AsQueryable();

          // Apply filters for BIGC
          if (!string.IsNullOrEmpty(filter.BudgetYear) && int.TryParse(filter.BudgetYear, out int bigcYear))
            bigcQuery = bigcQuery.Where(b => b.BudgetYear == bigcYear);
          if (!string.IsNullOrEmpty(filter.Cobu))
            bigcQuery = bigcQuery.Where(b => b.Cobu == filter.Cobu);
          if (!string.IsNullOrEmpty(filter.CostCenterCode))
            bigcQuery = bigcQuery.Where(b => b.CostCenterCode == filter.CostCenterCode);
          if (!string.IsNullOrEmpty(filter.Division))
            bigcQuery = bigcQuery.Where(b => b.Division == filter.Division);
          if (!string.IsNullOrEmpty(filter.Department))
            bigcQuery = bigcQuery.Where(b => b.Department == filter.Department);
          if (!string.IsNullOrEmpty(filter.Section))
            bigcQuery = bigcQuery.Where(b => b.Section == filter.Section);
          if (!string.IsNullOrEmpty(filter.StoreName))
            bigcQuery = bigcQuery.Where(b => b.StoreName == filter.StoreName);
          if (!string.IsNullOrEmpty(filter.EmpStatus))
            bigcQuery = bigcQuery.Where(b => b.EmpStatus == filter.EmpStatus);
          if (!string.IsNullOrEmpty(filter.PositionCode))
            bigcQuery = bigcQuery.Where(b => b.PositionCode == filter.PositionCode);

          distinctJobBands = await bigcQuery
              .Where(b => !string.IsNullOrEmpty(b.JobBand))
              .Select(b => b.JobBand)
              .Distinct()
              .ToListAsync();
        }

        return distinctJobBands;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctJobBandsAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctRunrateCodesAsync(string? companyID)
    {
      try
      {
        List<string?> distinctRunrateCodes = new List<string?>();

        if (string.IsNullOrEmpty(companyID))
        {
          // ดึงจากทั้งสอง company
          var bjcRunrateCodes = await _context.HRB_BUDGET_BJC
              .Where(b => !string.IsNullOrEmpty(b.RunrateCode))
              .Select(b => b.RunrateCode)
              .Distinct()
              .ToListAsync();

          var bigcRunrateCodes = await _context.HRB_BUDGET_BIGC
              .Where(b => !string.IsNullOrEmpty(b.RunrateCode))
              .Select(b => b.RunrateCode)
              .Distinct()
              .ToListAsync();

          distinctRunrateCodes = bjcRunrateCodes.Union(bigcRunrateCodes).Distinct().ToList();
        }
        else if (companyID == "1") // BJC
        {
          distinctRunrateCodes = await _context.HRB_BUDGET_BJC
              .Where(b => !string.IsNullOrEmpty(b.RunrateCode))
              .Select(b => b.RunrateCode)
              .Distinct()
              .ToListAsync();
        }
        else if (companyID == "2") // BIGC
        {
          distinctRunrateCodes = await _context.HRB_BUDGET_BIGC
              .Where(b => !string.IsNullOrEmpty(b.RunrateCode))
              .Select(b => b.RunrateCode)
              .Distinct()
              .ToListAsync();
        }

        return distinctRunrateCodes;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctRunrateCodesAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<string?>> GetDistinctHrbpEmpCodesAsync(string? companyID)
    {
      try
      {
        List<string?> distinctHrbpEmpCodes = new List<string?>();

        if (string.IsNullOrEmpty(companyID))
        {
          // ดึงจากทั้งสอง company
          var bjcHrbpEmpCodes = await _context.HRB_BUDGET_BJC
              .Where(b => !string.IsNullOrEmpty(b.HrbpEmpCode))
              .Select(b => b.HrbpEmpCode)
              .Distinct()
              .ToListAsync();

          var bigcHrbpEmpCodes = await _context.HRB_BUDGET_BIGC
              .Where(b => !string.IsNullOrEmpty(b.HrbpEmpCode))
              .Select(b => b.HrbpEmpCode)
              .Distinct()
              .ToListAsync();

          distinctHrbpEmpCodes = bjcHrbpEmpCodes.Union(bigcHrbpEmpCodes).Distinct().ToList();
        }
        else if (companyID == "1") // BJC
        {
          distinctHrbpEmpCodes = await _context.HRB_BUDGET_BJC
              .Where(b => !string.IsNullOrEmpty(b.HrbpEmpCode))
              .Select(b => b.HrbpEmpCode)
              .Distinct()
              .ToListAsync();
        }
        else if (companyID == "2") // BIGC
        {
          distinctHrbpEmpCodes = await _context.HRB_BUDGET_BIGC
              .Where(b => !string.IsNullOrEmpty(b.HrbpEmpCode))
              .Select(b => b.HrbpEmpCode)
              .Distinct()
              .ToListAsync();
        }

        return distinctHrbpEmpCodes;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetDistinctHrbpEmpCodesAsync: {ex.Message}");
        return new List<string?>();
      }
    }

    public async Task<List<EmployeeExpenseDto>> GetEmployeeExpensesAsync()
    {
      try
      {
        // สมมติว่าดึงข้อมูลจาก Employee Expense tables ที่เกี่ยวข้อง
        // ถ้ามีตารางเฉพาะหรือ logic เฉพาะ สามารถปรับแต่งได้ตรงนี้
        await Task.CompletedTask; // เพื่อแก้ warning
        var employeeExpenses = new List<EmployeeExpenseDto>();

        // ตัวอย่าง: ดึงจาก HRB_EMP_EXPENSE_DATA table ถ้ามี
        // var expenses = await _context.HRB_EMP_EXPENSE_DATA.ToListAsync();
        // employeeExpenses = expenses.Select(e => new EmployeeExpenseDto { ... }).ToList();

        return employeeExpenses;
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetEmployeeExpensesAsync: {ex.Message}");
        return new List<EmployeeExpenseDto>();
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 BATCH ENTRY SAVE - SA APPROVED IMPLEMENTATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SA Answers Applied:
    // - Q1: All or nothing (TransactionScope) - ถ้า 1 แถว error จะ rollback ทั้งหมด
    // - Q2: ไม่จำกัดจำนวนแถว
    // - Q3: Reject duplicate
    // - Q4: JWT Token (comment ไว้ก่อน - รับ createdBy เป็น parameter)
    // - Q6: Option B (Pre-check duplicate) - ตรวจสอบก่อน save
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// บันทึก Batch Budget Entries พร้อมกันหลายแถว
    ///
    /// Q1: All or nothing - ใช้ TransactionScope เพื่อ rollback ทั้งหมดถ้า error 1 แถว
    /// Q6: Pre-check duplicate - ตรวจสอบข้อมูลซ้ำก่อน save
    /// </summary>
    public async Task<BatchBudgetResponse> CreateBatchBudgetsAsync(
        List<BudgetResponseDto> budgets,
        string createdBy)
    {
      var response = new BatchBudgetResponse
      {
        TotalSubmitted = budgets.Count,
        SuccessfulSaves = new List<BudgetSaveResult>(),
        FailedSaves = new List<BudgetSaveError>()
      };

      // Q1: All or nothing - ใช้ TransactionScope
      using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
      {
        try
        {
          // Q6: Pre-check duplicate BEFORE saving
          await CheckDuplicatesAsync(budgets);

          int rowIndex = 0;
          foreach (var budget in budgets)
          {
            try
            {
              // Validate CompanyId
              if (!budget.CompanyId.HasValue)
              {
                throw new ArgumentException("CompanyId is required");
              }

              // Route to correct table based on CompanyId
              BudgetResponseDto savedBudget;

              if (budget.CompanyId == 1) // BJC
              {
                var bjcDto = MapToBjcDto(budget);
                // Note: UPDATED_BY and UPDATED_DATE will be set in CreateBjcBudgetAsync
                // bjcDto doesn't have these properties, they're on the entity

                var savedBjcDto = await CreateBjcBudgetAsync(bjcDto);
                savedBudget = MapToResponseDto(savedBjcDto);
              }
              else if (budget.CompanyId == 2) // BIGC
              {
                var bigcDto = MapToBigcDto(budget);
                // Note: UPDATED_BY and UPDATED_DATE will be set in CreateBigcBudgetAsync
                // bigcDto doesn't have these properties, they're on the entity

                var savedBigcDto = await CreateBigcBudgetAsync(bigcDto);
                savedBudget = MapToResponseDto(savedBigcDto);
              }
              else
              {
                throw new ArgumentException($"Invalid CompanyId: {budget.CompanyId}. Must be 1 (BJC) or 2 (BIGC)");
              }

              // Add to success list
              response.SuccessfulSaves.Add(new BudgetSaveResult
              {
                RowIndex = rowIndex,
                BudgetId = savedBudget.BudgetId,
                EmpCode = savedBudget.EmpCode ?? string.Empty,
                BudgetYear = savedBudget.BudgetYear,
                CostCenterCode = savedBudget.CostCenterCode ?? string.Empty,
                CompanyId = savedBudget.CompanyId.GetValueOrDefault(),
                Message = "บันทึกสำเร็จ"
              });
            }
            catch (Exception ex)
            {
              // Q1: ถ้า 1 แถว error → throw เพื่อ rollback ทั้งหมด
              throw new Exception(
                $"Error at row {rowIndex}: {ex.Message}",
                ex
              );
            }

            rowIndex++;
          }

          // Commit transaction - บันทึกทั้งหมดถ้าสำเร็จ
          scope.Complete();

          response.TotalSuccess = response.SuccessfulSaves.Count;
          response.TotalFailed = 0;
          response.Success = true;
          response.Message = $"บันทึกสำเร็จทั้งหมด {response.TotalSuccess} รายการ";
        }
        catch (DuplicateBudgetException dupEx)
        {
          // Q6: Duplicate error - rollback ทั้งหมด
          Console.WriteLine($"Duplicate budget found: {dupEx.Message}");

          response.TotalSuccess = 0;
          response.TotalFailed = budgets.Count;
          response.Success = false;
          response.Message = "พบข้อมูลซ้ำ ไม่สามารถบันทึกได้";
          response.FailedSaves.Add(new BudgetSaveError
          {
            RowIndex = dupEx.RowIndex,
            EmpCode = dupEx.EmpCode,
            BudgetYear = dupEx.BudgetYear,
            CostCenterCode = dupEx.CostCenterCode,
            ErrorMessage = dupEx.Message, // ภาษาไทย
            ErrorDetails = $"พบข้อมูลซ้ำ: {dupEx.EmpCode} ปีงบประมาณ {dupEx.BudgetYear} Cost Center {dupEx.CostCenterCode}",
            SubmittedData = dupEx.SubmittedData
          });
        }
        catch (Exception ex)
        {
          // Q1: Any error - rollback ทั้งหมด
          Console.WriteLine($"Error in CreateBatchBudgetsAsync: {ex.Message}");

          response.TotalSuccess = 0;
          response.TotalFailed = budgets.Count;
          response.Success = false;
          response.Message = "เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้";
          response.FailedSaves.Add(new BudgetSaveError
          {
            RowIndex = -1,
            ErrorMessage = "เกิดข้อผิดพลาด: " + ex.Message,
            ErrorDetails = ex.StackTrace
          });
        }
        // ถ้าไม่ Complete() → จะ rollback อัตโนมัติ
      }

      return response;
    }

    /// <summary>
    /// Q6: Pre-check duplicate before save
    /// ตรวจสอบข้อมูลซ้ำก่อนบันทึก (EMP_CODE + BUDGET_YEAR + COST_CENTER_CODE)
    /// </summary>
    private async Task CheckDuplicatesAsync(List<BudgetResponseDto> budgets)
    {
      int rowIndex = 0;
      foreach (var budget in budgets)
      {
        bool isDuplicate = false;

        if (budget.CompanyId == 1) // BJC
        {
          isDuplicate = await _context.HRB_BUDGET_BJC.AnyAsync(b =>
              b.EmpCode == budget.EmpCode &&
              b.BudgetYear == budget.BudgetYear &&
              b.CostCenterCode == budget.CostCenterCode
          );
        }
        else if (budget.CompanyId == 2) // BIGC
        {
          isDuplicate = await _context.HRB_BUDGET_BIGC.AnyAsync(b =>
              b.EmpCode == budget.EmpCode &&
              b.BudgetYear == budget.BudgetYear &&
              b.CostCenterCode == budget.CostCenterCode
          );
        }

        if (isDuplicate)
        {
          // Q3: Reject - throw error
          var errorMessage = DuplicateBudgetException.FormatMessage(
              budget.EmpCode ?? string.Empty,
              budget.BudgetYear,
              budget.CostCenterCode ?? string.Empty
          );

          throw new DuplicateBudgetException(errorMessage)
          {
            EmpCode = budget.EmpCode ?? string.Empty,
            BudgetYear = budget.BudgetYear,
            CostCenterCode = budget.CostCenterCode ?? string.Empty,
            RowIndex = rowIndex,
            SubmittedData = budget
          };
        }

        rowIndex++;
      }
    }

    // ===================================================================
    // Cal Button - Budget Estimation Method
    // ===================================================================

    /// <summary>
    /// Get BIGC Budget Estimate from fn_BudgetEstimate database function
    /// Returns 57 calculated fields (26 LE + 25 Budget Year + 6 Summary)
    ///
    /// Field Mapping Reference: budget.plan.log.md:15-71
    /// - PayrollLe, PremiumLe, TotalPayrollLe, BonusLe (LE fields)
    /// - Payroll, Premium, Bonus, BonusTypes (Budget Year fields)
    /// - PeSbMth, PeSbYear, PeMthLe, PeYearLe, PeMth, PeYear (Summary fields)
    /// </summary>
    // ═══════════════════════════════════════════════════════════════════
    // 🧮 CAL BUTTON - BUDGET ESTIMATION (fn_BudgetEstimate)
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get BIGC Budget Estimate from fn_BudgetEstimate database function
    /// Uses dedicated Result DTO to avoid Entity Framework mapping issues
    /// </summary>
    public async Task<List<BudgetBigcEstimateResultDto>> GetBudgetBigcEstimate(
        string sql,
        Microsoft.Data.SqlClient.SqlParameter[] parameters)
    {
      try
      {
        // ✅ FIX: Use Result DTO instead of Entity Model
        // This avoids "required column not present" errors from EF
        var results = await _context.Database
            .SqlQueryRaw<BudgetBigcEstimateResultDto>(sql, parameters)
            .ToListAsync();

        Console.WriteLine($"✅ GetBudgetBigcEstimate: Retrieved {results.Count} row(s)");
        return results;
      }
      catch (Exception ex)
      {
        // Log error
        Console.WriteLine($"❌ Error in GetBudgetBigcEstimate: {ex.Message}");
        Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        throw;
      }
    }

    /// <summary>
    /// Get BJC Budget Estimate from fn_BudgetEstimate database function
    /// Uses dedicated Result DTO to avoid Entity Framework mapping issues
    /// </summary>
    public async Task<List<BudgetBjcEstimateResultDto>> GetBudgetBjcEstimate(
        string sql,
        Microsoft.Data.SqlClient.SqlParameter[] parameters)
    {
      try
      {
        // ✅ FIX: Use Result DTO instead of Entity Model
        // This avoids "required column not present" errors from EF
        var results = await _context.Database
            .SqlQueryRaw<BudgetBjcEstimateResultDto>(sql, parameters)
            .ToListAsync();

        Console.WriteLine($"✅ GetBudgetBjcEstimate: Retrieved {results.Count} row(s)");
        return results;
      }
      catch (Exception ex)
      {
        // Log error
        Console.WriteLine($"❌ Error in GetBudgetBjcEstimate: {ex.Message}");
        Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        throw;
      }
    }
  }
}
