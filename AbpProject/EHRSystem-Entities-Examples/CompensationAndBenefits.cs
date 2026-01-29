using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace EHRSystem.Entities.CompensationAndBenefits;

/// <summary>
/// Budget entity ???????????????????? HR
/// </summary>
public class Budget : FullAuditedAggregateRoot<Guid>
{
    public int FiscalYear { get; set; }
    public string BudgetName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BudgetType Type { get; set; }
    public BudgetStatus Status { get; set; }
    
    // Budget amounts
    public decimal TotalBudget { get; set; }
    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => TotalBudget - SpentAmount;
    
    // Approval
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedDate { get; set; }
    
    // Relations
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public ICollection<BudgetLineItem> LineItems { get; set; } = new List<BudgetLineItem>();
    public ICollection<BudgetAllocation> Allocations { get; set; } = new List<BudgetAllocation>();
}

public enum BudgetType
{
    Salary = 1,              // ???????????
    Bonus = 2,               // ???????
    Benefits = 3,            // ???????????
    Training = 4,            // ?????????
    Recruitment = 5,         // ??????????????
    WelfareAndEvents = 6,    // ????????????????
    HealthInsurance = 7,     // ??????????????
    Other = 99               // ?????
}

public enum BudgetStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Approved = 4,
    Rejected = 5,
    Active = 6,
    Closed = 7
}

/// <summary>
/// BudgetLineItem entity ???????????????????????????
/// </summary>
public class BudgetLineItem : FullAuditedAggregateRoot<Guid>
{
    public Guid BudgetId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BudgetCategory Category { get; set; }
    
    public decimal PlannedAmount { get; set; }
    public decimal ActualAmount { get; set; }
    public decimal Variance => PlannedAmount - ActualAmount;
    public decimal VariancePercentage => PlannedAmount > 0 ? (Variance / PlannedAmount) * 100 : 0;
    
    public int Quarter { get; set; }  // Q1, Q2, Q3, Q4
    public int Month { get; set; }
    
    public string Notes { get; set; } = string.Empty;
    
    // Relations
    public Budget Budget { get; set; } = null!;
}

public enum BudgetCategory
{
    BaseSalary = 1,
    OvertimePay = 2,
    PerformanceBonus = 3,
    AnnualBonus = 4,
    MedicalBenefits = 5,
    RetirementBenefits = 6,
    TransportationAllowance = 7,
    MealAllowance = 8,
    HousingAllowance = 9,
    TrainingAndDevelopment = 10,
    RecruitmentCosts = 11,
    TeamBuilding = 12,
    EmployeeWelfare = 13,
    Other = 99
}

/// <summary>
/// BudgetAllocation entity ???????????????????????
/// </summary>
public class BudgetAllocation : FullAuditedAggregateRoot<Guid>
{
    public Guid BudgetId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? EmployeeId { get; set; }
    
    public string AllocationName { get; set; } = string.Empty;
    public decimal AllocatedAmount { get; set; }
    public DateTime AllocationDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    public AllocationStatus Status { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    
    // Relations
    public Budget Budget { get; set; } = null!;
    public Department? Department { get; set; }
    public Employee? Employee { get; set; }
}

public enum AllocationStatus
{
    Pending = 1,
    Allocated = 2,
    PartiallyUsed = 3,
    FullyUsed = 4,
    Expired = 5,
    Cancelled = 6
}

/// <summary>
/// CompensationPackage entity ??????????????????????
/// </summary>
public class CompensationPackage : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public Guid? PositionId { get; set; }
    
    public DateTime EffectiveDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    // Salary components
    public decimal BaseSalary { get; set; }
    public decimal HousingAllowance { get; set; }
    public decimal TransportationAllowance { get; set; }
    public decimal MealAllowance { get; set; }
    public decimal PhoneAllowance { get; set; }
    public decimal OtherAllowances { get; set; }
    
    // Total compensation
    public decimal TotalMonthlyCompensation => BaseSalary + HousingAllowance + 
                                                TransportationAllowance + MealAllowance + 
                                                PhoneAllowance + OtherAllowances;
    public decimal AnnualCompensation => TotalMonthlyCompensation * 12;
    
    // Benefits
    public bool HasMedicalInsurance { get; set; }
    public bool HasDentalInsurance { get; set; }
    public bool HasLifeInsurance { get; set; }
    public bool HasRetirementPlan { get; set; }
    
    public string Notes { get; set; } = string.Empty;
    
    // Relations
    public Employee Employee { get; set; } = null!;
    public Position? Position { get; set; }
}

/// <summary>
/// SalaryReview entity ???????????????????????
/// </summary>
public class SalaryReview : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public DateTime ReviewDate { get; set; }
    public int ReviewYear { get; set; }
    public ReviewType Type { get; set; }
    
    // Current vs New
    public decimal CurrentSalary { get; set; }
    public decimal ProposedSalary { get; set; }
    public decimal IncreaseAmount => ProposedSalary - CurrentSalary;
    public decimal IncreasePercentage => CurrentSalary > 0 ? 
                                         (IncreaseAmount / CurrentSalary) * 100 : 0;
    
    // Justification
    public string Reason { get; set; } = string.Empty;
    public string PerformanceRating { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    
    // Approval workflow
    public ReviewStatus Status { get; set; }
    public Guid? ReviewedById { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }
    
    // Effective date
    public DateTime? EffectiveDate { get; set; }
    
    // Relations
    public Employee Employee { get; set; } = null!;
}

public enum ReviewType
{
    Annual = 1,              // ???????
    Promotion = 2,           // ?????????????
    MeritIncrease = 3,       // ?????????????
    CostOfLiving = 4,        // ?????????????????
    MarketAdjustment = 5,    // ???????????
    Special = 99             // ?????????
}

public enum ReviewStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Recommended = 4,
    Approved = 5,
    Rejected = 6,
    Implemented = 7
}

/// <summary>
/// BonusPool entity ?????????????????
/// </summary>
public class BonusPool : FullAuditedAggregateRoot<Guid>
{
    public int FiscalYear { get; set; }
    public string PoolName { get; set; } = string.Empty;
    public BonusPoolType Type { get; set; }
    
    public decimal TotalPoolAmount { get; set; }
    public decimal AllocatedAmount { get; set; }
    public decimal RemainingAmount => TotalPoolAmount - AllocatedAmount;
    
    public Guid? DepartmentId { get; set; }
    public DateTime? DistributionDate { get; set; }
    
    public BonusPoolStatus Status { get; set; }
    public string Notes { get; set; } = string.Empty;
    
    // Relations
    public Department? Department { get; set; }
    public ICollection<BonusAllocation> BonusAllocations { get; set; } = new List<BonusAllocation>();
}

public enum BonusPoolType
{
    Performance = 1,         // ????????
    ProfitSharing = 2,       // ??????????
    Annual = 3,              // ???????
    ProjectCompletion = 4,   // ?????????????
    Retention = 5,           // ????????????
    Referral = 6             // ???????
}

public enum BonusPoolStatus
{
    Planning = 1,
    Approved = 2,
    Active = 3,
    Distributed = 4,
    Closed = 5
}

/// <summary>
/// BonusAllocation entity ??????????????????????????????
/// </summary>
public class BonusAllocation : FullAuditedAggregateRoot<Guid>
{
    public Guid BonusPoolId { get; set; }
    public Guid EmployeeId { get; set; }
    
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
    public string Justification { get; set; } = string.Empty;
    
    public AllocationStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
    
    // Relations
    public BonusPool BonusPool { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
}

/// <summary>
/// BenefitPlan entity ??????????????????
/// </summary>
public class BenefitPlan : FullAuditedAggregateRoot<Guid>
{
    public string PlanName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BenefitType Type { get; set; }
    
    public decimal AnnualCostPerEmployee { get; set; }
    public decimal EmployerContribution { get; set; }
    public decimal EmployeeContribution { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public bool IsActive { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    
    // Coverage
    public string CoverageDetails { get; set; } = string.Empty;
    public decimal CoverageAmount { get; set; }
    
    // Relations
    public ICollection<EmployeeBenefit> EmployeeBenefits { get; set; } = new List<EmployeeBenefit>();
}

public enum BenefitType
{
    HealthInsurance = 1,
    DentalInsurance = 2,
    VisionInsurance = 3,
    LifeInsurance = 4,
    DisabilityInsurance = 5,
    RetirementPlan = 6,
    StockOptions = 7,
    EducationAssistance = 8,
    GymMembership = 9,
    CompanyCar = 10,
    Other = 99
}

/// <summary>
/// EmployeeBenefit entity ?????????????????????????
/// </summary>
public class EmployeeBenefit : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public Guid BenefitPlanId { get; set; }
    
    public DateTime EnrollmentDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    
    public BenefitEnrollmentStatus Status { get; set; }
    public decimal EmployeeContribution { get; set; }
    public decimal EmployerContribution { get; set; }
    
    // Dependents
    public int NumberOfDependents { get; set; }
    public string DependentDetails { get; set; } = string.Empty;
    
    // Relations
    public Employee Employee { get; set; } = null!;
    public BenefitPlan BenefitPlan { get; set; } = null!;
}

public enum BenefitEnrollmentStatus
{
    Pending = 1,
    Active = 2,
    Suspended = 3,
    Terminated = 4,
    Expired = 5
}
