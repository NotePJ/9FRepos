using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace EHRSystem.Entities;

/// <summary>
/// Attendance entity ????????????????????-??????
/// </summary>
public class Attendance : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public AttendanceStatus Status { get; set; }
    public TimeSpan? WorkingHours { get; set; }
    public TimeSpan? OvertimeHours { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Employee Employee { get; set; } = null!;
}

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    OnLeave = 4,
    Holiday = 5,
    Weekend = 6
}

/// <summary>
/// Payroll entity ???????????????
/// </summary>
public class Payroll : FullAuditedAggregateRoot<Guid>
{
    public Guid EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal NetSalary { get; set; }
    public PayrollStatus Status { get; set; }
    public DateTime? PaidDate { get; set; }
    
    // Navigation properties
    public Employee Employee { get; set; } = null!;
}

public enum PayrollStatus
{
    Draft = 1,
    Approved = 2,
    Paid = 3,
    Cancelled = 4
}
