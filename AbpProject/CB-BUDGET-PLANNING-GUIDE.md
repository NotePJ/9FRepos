# ?? C&B Budget Planning Module - Complete Guide

## ?? ?????? Compensation & Benefits Module

Module ???????????:
- ? Budget Planning & Allocation
- ? Compensation Package Management
- ? Salary Review & Adjustment
- ? Bonus Pool & Distribution
- ? Benefits Management
- ? Cost Analysis & Reporting

---

## ?? Core Features

### 1. Budget Planning
- **Annual Budget Creation**
  - ?????????????? HR ???????
  - ?????????????: Salary, Bonus, Benefits, Training, etc.
  - ????????????????????????

- **Budget Tracking**
  - ????????????????? real-time
  - ??????????? planned vs actual
  - ???????????????????????

- **Budget Approval Workflow**
  - Submit ? Review ? Approve/Reject
  - Multi-level approval
  - Audit trail

### 2. Compensation Management
- **Compensation Packages**
  - Base salary + allowances
  - Benefits breakdown
  - Total compensation view

- **Salary Review**
  - Annual salary review
  - Merit increase
  - Market adjustment
  - Promotion adjustments

- **Salary Benchmarking**
  - ??????????????????
  - Position-based salary range
  - Competitiveness analysis

### 3. Bonus Management
- **Bonus Pool**
  - ????? bonus pool ?????????
  - ?????????????
  - ???????? pool

- **Bonus Distribution**
  - Performance-based bonus
  - Profit sharing
  - Project completion bonus
  - Retention bonus

### 4. Benefits Administration
- **Benefit Plans**
  - Health insurance
  - Life insurance
  - Retirement plans
  - Other benefits

- **Employee Enrollment**
  - Self-service enrollment
  - Dependent management
  - Coverage tracking

---

## ??? Database Structure

### Core Tables

```
Budgets
??? Id (Guid)
??? FiscalYear (int)
??? BudgetName (string)
??? Type (BudgetType enum)
??? Status (BudgetStatus enum)
??? TotalBudget (decimal)
??? AllocatedAmount (decimal)
??? SpentAmount (decimal)
??? DepartmentId (Guid?)
??? ApprovedById (Guid?)

BudgetLineItems
??? Id (Guid)
??? BudgetId (Guid)
??? ItemName (string)
??? Category (BudgetCategory enum)
??? PlannedAmount (decimal)
??? ActualAmount (decimal)
??? Quarter (int)
??? Month (int)

BudgetAllocations
??? Id (Guid)
??? BudgetId (Guid)
??? DepartmentId (Guid?)
??? EmployeeId (Guid?)
??? AllocatedAmount (decimal)
??? AllocationDate (DateTime)
??? Status (AllocationStatus enum)

CompensationPackages
??? Id (Guid)
??? EmployeeId (Guid)
??? BaseSalary (decimal)
??? HousingAllowance (decimal)
??? TransportationAllowance (decimal)
??? MealAllowance (decimal)
??? EffectiveDate (DateTime)
??? Benefits (flags)

SalaryReviews
??? Id (Guid)
??? EmployeeId (Guid)
??? ReviewDate (DateTime)
??? CurrentSalary (decimal)
??? ProposedSalary (decimal)
??? Type (ReviewType enum)
??? Status (ReviewStatus enum)
??? ApprovedById (Guid?)

BonusPools
??? Id (Guid)
??? FiscalYear (int)
??? PoolName (string)
??? Type (BonusPoolType enum)
??? TotalPoolAmount (decimal)
??? AllocatedAmount (decimal)
??? Status (BonusPoolStatus enum)

BonusAllocations
??? Id (Guid)
??? BonusPoolId (Guid)
??? EmployeeId (Guid)
??? Amount (decimal)
??? Percentage (decimal)
??? Status (AllocationStatus enum)

BenefitPlans
??? Id (Guid)
??? PlanName (string)
??? Type (BenefitType enum)
??? AnnualCostPerEmployee (decimal)
??? EmployerContribution (decimal)
??? EmployeeContribution (decimal)

EmployeeBenefits
??? Id (Guid)
??? EmployeeId (Guid)
??? BenefitPlanId (Guid)
??? EnrollmentDate (DateTime)
??? Status (BenefitEnrollmentStatus enum)
??? NumberOfDependents (int)
```

---

## ?? Pages Structure

### Budget Management Pages
```
Pages/
??? Budget/
?   ??? Index.cshtml                    # ?????????????????????
?   ??? Create.cshtml                   # ?????????????????
?   ??? Edit.cshtml                     # ?????????????
?   ??? Details.cshtml                  # ??????????????????
?   ??? Allocate.cshtml                 # ????????
?   ??? Track.cshtml                    # ??????????????
?   ??? Reports.cshtml                  # ??????????????
```

### Compensation Pages
```
Pages/
??? Compensation/
?   ??? Packages/
?   ?   ??? Index.cshtml                # ?????? compensation packages
?   ?   ??? Create.cshtml               # ????? package ????
?   ?   ??? Edit.cshtml                 # ????? package
?   ?   ??? Compare.cshtml              # ??????????? packages
?   ?
?   ??? Reviews/
?   ?   ??? Index.cshtml                # ?????? salary reviews
?   ?   ??? Create.cshtml               # ????? review ????
?   ?   ??? Approve.cshtml              # ???????????????????????
?   ?   ??? History.cshtml              # ???????????????????????
?   ?
?   ??? Benchmarking/
?       ??? Index.cshtml                # Salary benchmarking
?       ??? Analysis.cshtml             # ????????????
```

### Bonus Pages
```
Pages/
??? Bonus/
?   ??? Pools/
?   ?   ??? Index.cshtml                # ?????? bonus pools
?   ?   ??? Create.cshtml               # ????? pool ????
?   ?   ??? Details.cshtml              # ?????????? pool
?   ?   ??? Distribute.cshtml           # ???? pool
?   ?
?   ??? Allocations/
?       ??? Index.cshtml                # ???????????????
?       ??? Employee.cshtml             # ????????????????
?       ??? Approve.cshtml              # ????????????????
```

### Benefits Pages
```
Pages/
??? Benefits/
?   ??? Plans/
?   ?   ??? Index.cshtml                # ?????? benefit plans
?   ?   ??? Create.cshtml               # ????? plan ????
?   ?   ??? Edit.cshtml                 # ????? plan
?   ?   ??? Details.cshtml              # ?????????? plan
?   ?
?   ??? Enrollment/
?       ??? Index.cshtml                # ??????????????????
?       ??? Enroll.cshtml               # ??????????????????
?       ??? MyBenefits.cshtml           # ???????????????
?       ??? Dependents.cshtml           # ??????????????????????
```

---

## ?? Example Page: Budget Dashboard

```razor
@page
@model EHRSystem.Pages.Budget.IndexModel
@{
    ViewData["Title"] = "Budget Dashboard";
}

<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="display-4">?? Budget Management</h1>
            <p class="lead">Fiscal Year @Model.CurrentFiscalYear</p>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
        <!-- Total Budget -->
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-left-primary shadow h-100">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Budget
                            </div>
                            <div class="h5 mb-0 font-weight-bold">
                                @Model.TotalBudget.ToString("C")
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-wallet fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Allocated -->
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-left-info shadow h-100">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Allocated
                            </div>
                            <div class="h5 mb-0 font-weight-bold">
                                @Model.AllocatedAmount.ToString("C")
                            </div>
                            <div class="text-xs text-muted">
                                @Model.AllocationPercentage.ToString("F1")% of total
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-hand-holding-usd fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Spent -->
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-left-warning shadow h-100">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Spent
                            </div>
                            <div class="h5 mb-0 font-weight-bold">
                                @Model.SpentAmount.ToString("C")
                            </div>
                            <div class="text-xs text-muted">
                                @Model.SpentPercentage.ToString("F1")% of allocated
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-chart-line fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remaining -->
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-left-success shadow h-100">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Remaining
                            </div>
                            <div class="h5 mb-0 font-weight-bold">
                                @Model.RemainingAmount.ToString("C")
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-piggy-bank fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Budget by Type Chart -->
    <div class="row mb-4">
        <div class="col-xl-6">
            <div class="card shadow">
                <div class="card-header">
                    <h5 class="mb-0">Budget by Type</h5>
                </div>
                <div class="card-body">
                    <canvas id="budgetByTypeChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Budget Status -->
        <div class="col-xl-6">
            <div class="card shadow">
                <div class="card-header">
                    <h5 class="mb-0">Budget Status</h5>
                </div>
                <div class="card-body">
                    <canvas id="budgetStatusChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Budget List -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Budget List</h5>
                        <a href="/Budget/Create" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>Create Budget
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Budget Name</th>
                                    <th>Type</th>
                                    <th>Department</th>
                                    <th>Total Amount</th>
                                    <th>Allocated</th>
                                    <th>Spent</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach (var budget in Model.Budgets)
                                {
                                    <tr>
                                        <td>@budget.BudgetName</td>
                                        <td>
                                            <span class="badge bg-info">@budget.Type</span>
                                        </td>
                                        <td>@budget.Department?.Name</td>
                                        <td>@budget.TotalBudget.ToString("C")</td>
                                        <td>@budget.AllocatedAmount.ToString("C")</td>
                                        <td>@budget.SpentAmount.ToString("C")</td>
                                        <td>
                                            <span class="@(budget.RemainingAmount < 0 ? "text-danger" : "text-success")">
                                                @budget.RemainingAmount.ToString("C")
                                            </span>
                                        </td>
                                        <td>
                                            @switch (budget.Status)
                                            {
                                                case BudgetStatus.Draft:
                                                    <span class="badge bg-secondary">Draft</span>
                                                    break;
                                                case BudgetStatus.Approved:
                                                    <span class="badge bg-success">Approved</span>
                                                    break;
                                                case BudgetStatus.Active:
                                                    <span class="badge bg-primary">Active</span>
                                                    break;
                                                case BudgetStatus.Closed:
                                                    <span class="badge bg-dark">Closed</span>
                                                    break;
                                            }
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="/Budget/Details/@budget.Id" class="btn btn-sm btn-info">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="/Budget/Edit/@budget.Id" class="btn btn-sm btn-warning">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <a href="/Budget/Allocate/@budget.Id" class="btn btn-sm btn-success">
                                                    <i class="fas fa-hand-holding-usd"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Budget by Type Chart
        const budgetByTypeCtx = document.getElementById('budgetByTypeChart').getContext('2d');
        new Chart(budgetByTypeCtx, {
            type: 'doughnut',
            data: {
                labels: @Html.Raw(Json.Serialize(Model.BudgetTypes)),
                datasets: [{
                    data: @Html.Raw(Json.Serialize(Model.BudgetAmounts)),
                    backgroundColor: [
                        '#4e73df',
                        '#1cc88a',
                        '#36b9cc',
                        '#f6c23e',
                        '#e74a3b',
                        '#858796'
                    ]
                }]
            }
        });

        // Budget Status Chart
        const budgetStatusCtx = document.getElementById('budgetStatusChart').getContext('2d');
        new Chart(budgetStatusCtx, {
            type: 'bar',
            data: {
                labels: ['Total', 'Allocated', 'Spent', 'Remaining'],
                datasets: [{
                    label: 'Amount',
                    data: [
                        @Model.TotalBudget,
                        @Model.AllocatedAmount,
                        @Model.SpentAmount,
                        @Model.RemainingAmount
                    ],
                    backgroundColor: [
                        '#4e73df',
                        '#1cc88a',
                        '#f6c23e',
                        '#36b9cc'
                    ]
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    </script>
}
```

---

## ?? Reports & Analytics

### Budget Reports
1. **Budget vs Actual Report**
   - ???????????????????????????????????
   - ???????????, ??????, ??????

2. **Variance Analysis**
   - ????????????????????
   - ??????????? over/under budget

3. **Budget Utilization Report**
   - ?????????????
   - Forecast ????????

### Compensation Reports
1. **Salary Distribution Report**
   - ?????????????????????????
   - Salary range analysis

2. **Compensation Cost Report**
   - ??????????????????
   - Trend analysis

3. **Salary Review History**
   - ???????????????????????
   - Average increase percentage

### Bonus Reports
1. **Bonus Distribution Report**
   - ???????????????
   - ???????????/???????

2. **Bonus Pool Utilization**
   - ?????? bonus pool
   - Remaining pool

### Benefits Reports
1. **Benefits Enrollment Report**
   - ?????????????????
   - Coverage analysis

2. **Benefits Cost Report**
   - ?????????????????????
   - Cost trend

---

## ?? Permissions

```csharp
public static class CompensationPermissions
{
    // Budget
    public const string Budget_View = "C&B.Budget.View";
    public const string Budget_Create = "C&B.Budget.Create";
    public const string Budget_Edit = "C&B.Budget.Edit";
    public const string Budget_Approve = "C&B.Budget.Approve";
    public const string Budget_Allocate = "C&B.Budget.Allocate";
    
    // Compensation
    public const string Compensation_ViewAll = "C&B.Compensation.ViewAll";
    public const string Compensation_ViewOwn = "C&B.Compensation.ViewOwn";
    public const string Compensation_Edit = "C&B.Compensation.Edit";
    public const string Compensation_Review = "C&B.Compensation.Review";
    public const string Compensation_Approve = "C&B.Compensation.Approve";
    
    // Bonus
    public const string Bonus_ViewPools = "C&B.Bonus.ViewPools";
    public const string Bonus_CreatePool = "C&B.Bonus.CreatePool";
    public const string Bonus_Distribute = "C&B.Bonus.Distribute";
    public const string Bonus_Approve = "C&B.Bonus.Approve";
    
    // Benefits
    public const string Benefits_ManagePlans = "C&B.Benefits.ManagePlans";
    public const string Benefits_ViewEnrollments = "C&B.Benefits.ViewEnrollments";
    public const string Benefits_Enroll = "C&B.Benefits.Enroll";
}
```

---

## ?? Implementation Roadmap

### Phase 1: Budget Management (Week 11-12)
- [ ] Budget entity & repository
- [ ] Budget CRUD pages
- [ ] Budget allocation
- [ ] Budget tracking
- [ ] Basic reports

### Phase 2: Compensation (Week 13-14)
- [ ] Compensation package entity
- [ ] Salary review workflow
- [ ] Approval process
- [ ] Compensation reports

### Phase 3: Bonus (Week 15-16)
- [ ] Bonus pool management
- [ ] Distribution logic
- [ ] Approval workflow
- [ ] Bonus reports

### Phase 4: Benefits (Week 17-18)
- [ ] Benefit plans
- [ ] Employee enrollment
- [ ] Dependent management
- [ ] Benefits reports

### Phase 5: Analytics & Optimization (Week 19-20)
- [ ] Advanced reports
- [ ] Dashboards
- [ ] Forecasting
- [ ] Integration with payroll

---

## ?? Key Metrics & KPIs

### Budget KPIs
- Budget utilization rate
- Variance percentage
- Over/under budget departments
- Budget forecast accuracy

### Compensation KPIs
- Average salary by position
- Salary competitiveness ratio
- Compensation cost per FTE
- Salary increase rate

### Bonus KPIs
- Bonus pool distribution rate
- Average bonus percentage
- Bonus cost as % of salary
- Employee satisfaction with bonus

### Benefits KPIs
- Benefits enrollment rate
- Benefits cost per employee
- Benefits utilization rate
- Employee satisfaction with benefits

---

**Ready to implement your comprehensive C&B system! ??**
