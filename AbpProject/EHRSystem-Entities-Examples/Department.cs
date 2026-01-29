using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace EHRSystem.Entities;

/// <summary>
/// Department entity ??????????
/// </summary>
public class Department : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? ParentDepartmentId { get; set; }
    public Guid? ManagerId { get; set; }
    
    // Navigation properties
    public Department? ParentDepartment { get; set; }
    public Employee? Manager { get; set; }
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}

/// <summary>
/// Position entity ????????????????
/// </summary>
public class Position : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Level { get; set; }
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    
    // Navigation properties
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
