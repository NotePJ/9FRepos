using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace EHRSystem.Entities;

/// <summary>
/// Employee entity ???????????????????????
/// </summary>
public class Employee : FullAuditedAggregateRoot<Guid>
{
    // ?????????????
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    
    // ?????????????
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    
    // ??????????????
    public DateTime HireDate { get; set; }
    public EmployeeStatus Status { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid PositionId { get; set; }
    public decimal Salary { get; set; }
    
    // ?????????????
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string EmergencyContactRelation { get; set; } = string.Empty;
    
    // Navigation properties
    public Department Department { get; set; } = null!;
    public Position Position { get; set; } = null!;
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}

public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}

public enum EmployeeStatus
{
    Active = 1,
    Inactive = 2,
    OnLeave = 3,
    Terminated = 4
}
