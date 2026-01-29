using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace EHRSystem.Entities;

/// <summary>
/// LeaveRequest entity ?????????????
/// </summary>
public class LeaveRequest : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public LeaveType LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public LeaveRequestStatus Status { get; set; }
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }
    
    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Employee? ApprovedBy { get; set; }
}

public enum LeaveType
{
    AnnualLeave = 1,
    SickLeave = 2,
    PersonalLeave = 3,
    MaternityLeave = 4,
    PaternityLeave = 5,
    UnpaidLeave = 6
}

public enum LeaveRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}

/// <summary>
/// LeaveBalance entity ??????????????????
/// </summary>
public class LeaveBalance : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public int Year { get; set; }
    public LeaveType LeaveType { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays => TotalDays - UsedDays;
    
    // Navigation properties
    public Employee Employee { get; set; } = null!;
}
