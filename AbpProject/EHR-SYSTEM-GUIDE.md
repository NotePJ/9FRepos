# ?? E-HR System - Complete Setup Guide

## ?? ?????????? E-HR

???? Human Resource Management ???????????:
- ? Employee Management (???????????????????)
- ? Leave Management (???????/?????????)
- ? Attendance Tracking (??????????????-??????)
- ? Payroll Management (??????????????)
- ? Department & Position (??????????????)
- ? Reports & Analytics (??????????????)

---

## ?? Quick Start

### 1. ?????????????
```powershell
.\Create-NewProject.ps1 `
    -NewProjectName "EHRSystem" `
    -OutputPath "D:\Projects" `
    -Port 5001 `
    -IncludeMigrations $false

cd D:\Projects\EHRSystem
```

### 2. ????? Entities

????? folder structure:
```powershell
New-Item -Path "Entities" -ItemType Directory
New-Item -Path "Entities\Employee.cs" -ItemType File
New-Item -Path "Entities\Department.cs" -ItemType File
New-Item -Path "Entities\Position.cs" -ItemType File
New-Item -Path "Entities\LeaveRequest.cs" -ItemType File
New-Item -Path "Entities\LeaveBalance.cs" -ItemType File
New-Item -Path "Entities\Attendance.cs" -ItemType File
New-Item -Path "Entities\Payroll.cs" -ItemType File
```

Copy ?????????? `EHRSystem-Entities-Examples/` ???????????????????

### 3. Update DbContext

```csharp
// Data/EHRSystemDbContext.cs
using EHRSystem.Entities;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace EHRSystem.Data;

[ConnectionStringName("Default")]
public class EHRSystemDbContext : AbpDbContext<EHRSystemDbContext>
{
    // DbSets
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Position> Positions { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<LeaveBalance> LeaveBalances { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Payroll> Payrolls { get; set; }

    public EHRSystemDbContext(DbContextOptions<EHRSystemDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureEHRSystem();
    }
}
```

### 4. ????? Model Configuration

```csharp
// Data/EHRSystemDbContextModelCreatingExtensions.cs
using EHRSystem.Entities;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace EHRSystem.Data;

public static class EHRSystemDbContextModelCreatingExtensions
{
    public static void ConfigureEHRSystem(this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        // Employee
        builder.Entity<Employee>(b =>
        {
            b.ToTable("Employees");
            b.ConfigureByConvention();
            
            b.Property(x => x.EmployeeCode).IsRequired().HasMaxLength(20);
            b.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            b.Property(x => x.LastName).IsRequired().HasMaxLength(100);
            b.Property(x => x.Email).IsRequired().HasMaxLength(200);
            b.Property(x => x.Salary).HasColumnType("decimal(18,2)");
            
            b.HasIndex(x => x.EmployeeCode).IsUnique();
            b.HasIndex(x => x.Email).IsUnique();
            
            // Relationships
            b.HasOne(x => x.Department)
                .WithMany(x => x.Employees)
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
                
            b.HasOne(x => x.Position)
                .WithMany(x => x.Employees)
                .HasForeignKey(x => x.PositionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Department
        builder.Entity<Department>(b =>
        {
            b.ToTable("Departments");
            b.ConfigureByConvention();
            
            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
            b.Property(x => x.Code).IsRequired().HasMaxLength(20);
            
            b.HasIndex(x => x.Code).IsUnique();
            
            b.HasOne(x => x.ParentDepartment)
                .WithMany()
                .HasForeignKey(x => x.ParentDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Position
        builder.Entity<Position>(b =>
        {
            b.ToTable("Positions");
            b.ConfigureByConvention();
            
            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
            b.Property(x => x.Code).IsRequired().HasMaxLength(20);
            b.Property(x => x.MinSalary).HasColumnType("decimal(18,2)");
            b.Property(x => x.MaxSalary).HasColumnType("decimal(18,2)");
            
            b.HasIndex(x => x.Code).IsUnique();
        });

        // LeaveRequest
        builder.Entity<LeaveRequest>(b =>
        {
            b.ToTable("LeaveRequests");
            b.ConfigureByConvention();
            
            b.HasOne(x => x.Employee)
                .WithMany(x => x.LeaveRequests)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // LeaveBalance
        builder.Entity<LeaveBalance>(b =>
        {
            b.ToTable("LeaveBalances");
            b.ConfigureByConvention();
            
            b.HasIndex(x => new { x.EmployeeId, x.Year, x.LeaveType }).IsUnique();
            
            b.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Attendance
        builder.Entity<Attendance>(b =>
        {
            b.ToTable("Attendances");
            b.ConfigureByConvention();
            
            b.HasIndex(x => new { x.EmployeeId, x.Date }).IsUnique();
            
            b.HasOne(x => x.Employee)
                .WithMany(x => x.Attendances)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Payroll
        builder.Entity<Payroll>(b =>
        {
            b.ToTable("Payrolls");
            b.ConfigureByConvention();
            
            b.Property(x => x.BasicSalary).HasColumnType("decimal(18,2)");
            b.Property(x => x.Allowances).HasColumnType("decimal(18,2)");
            b.Property(x => x.Deductions).HasColumnType("decimal(18,2)");
            b.Property(x => x.OvertimePay).HasColumnType("decimal(18,2)");
            b.Property(x => x.NetSalary).HasColumnType("decimal(18,2)");
            
            b.HasIndex(x => new { x.EmployeeId, x.Month, x.Year }).IsUnique();
            
            b.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

### 5. ????? Migration

```powershell
# ????? migration
dotnet ef migrations add InitialCreate

# ?? SQL ???????? (optional)
dotnet ef migrations script

# ??? migration
dotnet run --migrate-database
```

---

## ?? Pages ???????????

### 1. Employee Management
```
Pages/
??? Employees/
?   ??? Index.cshtml              (?????????????)
?   ??? Create.cshtml             (????????????)
?   ??? Edit.cshtml               (????????????)
?   ??? Details.cshtml            (?????????????????)
```

### 2. Leave Management
```
Pages/
??? Leaves/
?   ??? Index.cshtml              (????????????)
?   ??? MyLeaves.cshtml           (????????)
?   ??? Request.cshtml            (????)
?   ??? Approve.cshtml            (?????????)
?   ??? Balance.cshtml            (????????????)
```

### 3. Attendance
```
Pages/
??? Attendance/
?   ??? Index.cshtml              (????????????????)
?   ??? CheckIn.cshtml            (?????????????)
?   ??? Reports.cshtml            (????????????????)
```

### 4. Payroll
```
Pages/
??? Payroll/
?   ??? Index.cshtml              (???????????????)
?   ??? Calculate.cshtml          (??????????????)
?   ??? Slips.cshtml              (?????????????)
```

---

## ?? Update Homepage (Index.cshtml)

```razor
@page
@using EHRSystem.Localization
@inject IHtmlLocalizer<EHRSystemResource> L
@model EHRSystem.Pages.IndexModel

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="display-4">?? Welcome to E-HR System</h1>
            <p class="lead">?????????????????????????????</p>
        </div>
    </div>

    @if (Model.CurrentUser.IsAuthenticated)
    {
        <!-- Dashboard for logged-in users -->
        <div class="row mb-3">
            <!-- Total Employees Card -->
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card border-left-primary shadow h-100">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Total Employees
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">
                                    @Model.TotalEmployees
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-users fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Leave Requests Card -->
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card border-left-warning shadow h-100">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    Pending Leaves
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">
                                    @Model.PendingLeaveRequests
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-calendar-times fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Present Today Card -->
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card border-left-success shadow h-100">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Present Today
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">
                                    @Model.PresentToday
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-check-circle fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- On Leave Today Card -->
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card border-left-info shadow h-100">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    On Leave Today
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">
                                    @Model.OnLeaveToday
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-plane-departure fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="mb-0">? Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <a href="/Employees" class="btn btn-primary btn-lg btn-block">
                                    <i class="fas fa-users me-2"></i>
                                    Manage Employees
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="/Leaves/Request" class="btn btn-warning btn-lg btn-block">
                                    <i class="fas fa-calendar-plus me-2"></i>
                                    Request Leave
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="/Attendance/CheckIn" class="btn btn-success btn-lg btn-block">
                                    <i class="fas fa-clock me-2"></i>
                                    Check In/Out
                                </a>
                            </div>
                            <div class="col-md-3 mb-3">
                                <a href="/Payroll" class="btn btn-info btn-lg btn-block">
                                    <i class="fas fa-money-bill-wave me-2"></i>
                                    Payroll
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    else
    {
        <!-- Welcome message for non-authenticated users -->
        <div class="row">
            <div class="col-12 text-center">
                <div class="card shadow-lg">
                    <div class="card-body p-5">
                        <h2>Welcome to E-HR System</h2>
                        <p class="lead">Please login to access the system</p>
                        <a href="/Account/Login" class="btn btn-primary btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    }
</div>
```

---

## ?? Permissions

????????? `Permissions/EHRSystemPermissions.cs`:

```csharp
namespace EHRSystem.Permissions;

public static class EHRSystemPermissions
{
    public const string GroupName = "EHRSystem";

    public static class Employees
    {
        public const string Default = GroupName + ".Employees";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class Leaves
    {
        public const string Default = GroupName + ".Leaves";
        public const string Request = Default + ".Request";
        public const string Approve = Default + ".Approve";
        public const string ViewAll = Default + ".ViewAll";
    }

    public static class Attendance
    {
        public const string Default = GroupName + ".Attendance";
        public const string CheckIn = Default + ".CheckIn";
        public const string ViewAll = Default + ".ViewAll";
        public const string Edit = Default + ".Edit";
    }

    public static class Payroll
    {
        public const string Default = GroupName + ".Payroll";
        public const string Calculate = Default + ".Calculate";
        public const string ViewAll = Default + ".ViewAll";
        public const string ViewOwn = Default + ".ViewOwn";
    }
}
```

---

## ?? Menu Configuration

????? `Menus/EHRSystemMenuContributor.cs`:

```csharp
using EHRSystem.Permissions;
using Volo.Abp.UI.Navigation;

namespace EHRSystem.Menus;

public class EHRSystemMenuContributor : IMenuContributor
{
    public async Task ConfigureMenuAsync(MenuConfigurationContext context)
    {
        if (context.Menu.Name == StandardMenus.Main)
        {
            await ConfigureMainMenuAsync(context);
        }
    }

    private static Task ConfigureMainMenuAsync(MenuConfigurationContext context)
    {
        var l = context.GetLocalizer<EHRSystemResource>();

        // Dashboard
        context.Menu.Items.Insert(0, new ApplicationMenuItem(
            "EHRSystem.Dashboard",
            l["Dashboard"],
            "~/",
            icon: "fas fa-tachometer-alt"
        ));

        // Employees
        context.Menu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Employees",
            l["Employees"],
            "/Employees",
            icon: "fas fa-users",
            requiredPermissionName: EHRSystemPermissions.Employees.Default
        ));

        // Leaves
        var leavesMenu = new ApplicationMenuItem(
            "EHRSystem.Leaves",
            l["Leaves"],
            icon: "fas fa-calendar-alt"
        );
        leavesMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Leaves.MyLeaves",
            l["MyLeaves"],
            "/Leaves/MyLeaves"
        ));
        leavesMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Leaves.Request",
            l["RequestLeave"],
            "/Leaves/Request"
        ));
        leavesMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Leaves.Approve",
            l["ApproveLeaves"],
            "/Leaves/Approve",
            requiredPermissionName: EHRSystemPermissions.Leaves.Approve
        ));
        context.Menu.AddItem(leavesMenu);

        // Attendance
        var attendanceMenu = new ApplicationMenuItem(
            "EHRSystem.Attendance",
            l["Attendance"],
            icon: "fas fa-clock"
        );
        attendanceMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Attendance.CheckIn",
            l["CheckIn"],
            "/Attendance/CheckIn"
        ));
        attendanceMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Attendance.MyAttendance",
            l["MyAttendance"],
            "/Attendance/MyAttendance"
        ));
        attendanceMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Attendance.ViewAll",
            l["AllAttendance"],
            "/Attendance",
            requiredPermissionName: EHRSystemPermissions.Attendance.ViewAll
        ));
        context.Menu.AddItem(attendanceMenu);

        // Payroll
        context.Menu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Payroll",
            l["Payroll"],
            "/Payroll",
            icon: "fas fa-money-bill-wave",
            requiredPermissionName: EHRSystemPermissions.Payroll.Default
        ));

        // Reports
        var reportsMenu = new ApplicationMenuItem(
            "EHRSystem.Reports",
            l["Reports"],
            icon: "fas fa-chart-bar"
        );
        reportsMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Reports.Employees",
            l["EmployeeReports"],
            "/Reports/Employees"
        ));
        reportsMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Reports.Attendance",
            l["AttendanceReports"],
            "/Reports/Attendance"
        ));
        reportsMenu.AddItem(new ApplicationMenuItem(
            "EHRSystem.Reports.Leaves",
            l["LeaveReports"],
            "/Reports/Leaves"
        ));
        context.Menu.AddItem(reportsMenu);

        return Task.CompletedTask;
    }
}
```

---

## ?? Features Roadmap

### Phase 1: Core Features (Week 1-2)
- [x] Employee Management
- [x] Department & Position
- [ ] Basic authentication & authorization

### Phase 2: Leave Management (Week 3-4)
- [ ] Leave request workflow
- [ ] Leave approval system
- [ ] Leave balance tracking
- [ ] Leave calendar

### Phase 3: Attendance (Week 5-6)
- [ ] Check-in/Check-out system
- [ ] GPS location tracking (optional)
- [ ] Attendance reports
- [ ] Late/Absent tracking

### Phase 4: Payroll (Week 7-8)
- [ ] Salary calculation
- [ ] Payslip generation
- [ ] Deductions & allowances
- [ ] Tax calculations

### Phase 5: Reports & Analytics (Week 9-10)
- [ ] Employee reports
- [ ] Attendance analytics
- [ ] Leave statistics
- [ ] Payroll reports
- [ ] Dashboard charts

---

## ??? Additional Tools & Libraries

### Recommended NuGet Packages:

```powershell
# For Excel export
dotnet add package EPPlus

# For PDF generation
dotnet add package iText7

# For Charts
dotnet add package Chart.js (via CDN)

# For Date/Time handling
dotnet add package NodaTime
```

---

## ?? Resources

- [ABP Framework Documentation](https://abp.io/docs)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [HR System Best Practices](https://www.shrm.org/)

---

## ? Checklist

- [ ] Entities created
- [ ] DbContext configured
- [ ] Migrations created and applied
- [ ] Menu configured
- [ ] Permissions defined
- [ ] Home page updated
- [ ] Employee pages created
- [ ] Leave management pages created
- [ ] Attendance pages created
- [ ] Payroll pages created
- [ ] Reports pages created
- [ ] Testing completed
- [ ] Documentation updated

---

**Good luck with your E-HR System! ??**
