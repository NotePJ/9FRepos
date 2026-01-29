using Microsoft.EntityFrameworkCore;
using HCBPCoreUI_Backend.Models.Budget;
using HCBPCoreUI_Backend.Models.Config;
using HCBPCoreUI_Backend.Models.Master;
using HCBPCoreUI_Backend.Models.Cost;
using HCBPCoreUI_Backend.Models.Employee;
using HCBPCoreUI_Backend.Models.PE;
using HCBPCoreUI_Backend.Models.Log;
using HCBPCoreUI_Backend.Models.Auth;

namespace HCBPCoreUI_Backend.Models
{
  public class HRBudgetDbContext : DbContext
  {
    public HRBudgetDbContext(DbContextOptions<HRBudgetDbContext> options) : base(options) { }

    // Budget
    public DbSet<HRB_BUDGET_BIGC> HRB_BUDGET_BIGC { get; set; }
    public DbSet<HRB_BUDGET_BJC> HRB_BUDGET_BJC { get; set; }

    // Config
    public DbSet<HRB_CONF_JB_BENEFITS> HRB_CONF_JB_BENEFITS { get; set; }
    public DbSet<HRB_MST_ITEM_CONFIG> HRB_MST_ITEM_CONFIG { get; set; }
    public DbSet<HRB_CONF_GROUP_RUNRATE> HRB_CONF_GROUP_RUNRATE { get; set; }
    public DbSet<HRB_CONF_FLEETCARD> HRB_CONF_FLEETCARD { get; set; }
    public DbSet<HRB_CONF_BUDGET_BONUS> HRB_CONF_BUDGET_BONUS { get; set; }
    public DbSet<HRB_CONF_SALARY_STRUCTURE> HRB_CONF_SALARY_STRUCTURE { get; set; }
    public DbSet<HRB_CONF_BU_SUP> HRB_CONF_BU_SUP { get; set; }
    public DbSet<HRB_CONF_BUDGETRATES> HRB_CONF_BUDGETRATES { get; set; }
    public DbSet<HRB_CONF_SALARY_RANGE> HRB_CONF_SALARY_RANGE { get; set; }
    public DbSet<HRB_CONF_HRBP> HRB_CONF_HRBP { get; set; }
    public DbSet<HRB_CONF_PE_ALLOCATION> HRB_CONF_PE_ALLOCATION { get; set; }

    // Master
    public DbSet<HRB_MST_COMPANY> HRB_MST_COMPANY { get; set; }
    public DbSet<HRB_MST_COST_CENTER> HRB_MST_COST_CENTER { get; set; }
    public DbSet<HRB_MST_GL_ACCOUNT> HRB_MST_GL_ACCOUNT { get; set; }
    public DbSet<HRB_MST_JOB_BAND> HRB_MST_JOB_BAND { get; set; }
    public DbSet<HRB_MST_POSITION> HRB_MST_POSITION { get; set; }
    public DbSet<HRB_MST_STATUS> HRB_MST_STATUS { get; set; }

    // Cost
    public DbSet<HRB_COST_GROUP_MAPPING> HRB_COST_GROUP_MAPPING { get; set; }
    public DbSet<HRB_COST_GROUP_RUNRATE> HRB_COST_GROUP_RUNRATE { get; set; }

    // Employee
    public DbSet<HRB_EMPLOYEE_DATA> HRB_EMPLOYEE_DATA { get; set; }
    public DbSet<HRB_EMP_EXPENSE_BIGC> HRB_EMP_EXPENSE_BIGC { get; set; }
    public DbSet<HRB_EMP_EXPENSE_BJC> HRB_EMP_EXPENSE_BJC { get; set; }

    // PE
    public DbSet<HRB_PE_MANAGEMENT> HRB_PE_MANAGEMENT { get; set; }
    public DbSet<HRB_PE_MOVEMENT> HRB_PE_MOVEMENT { get; set; }
    public DbSet<HRB_PE_NOTIFICATION> HRB_PE_NOTIFICATION { get; set; }

    // Log
    public DbSet<HRB_EMAIL_LOG> HRB_EMAIL_LOG { get; set; }
    public DbSet<HRB_UPLOAD_LOG> HRB_UPLOAD_LOG { get; set; }
    public DbSet<HRB_ACTIVITY_LOG> HRB_ACTIVITY_LOG { get; set; }

    // Auth
    public DbSet<HRB_USER> HRB_USER { get; set; }
    public DbSet<HRB_ROLE> HRB_ROLE { get; set; }
    public DbSet<HRB_USER_ROLE> HRB_USER_ROLE { get; set; }
    public DbSet<HRB_PERMISSION> HRB_PERMISSION { get; set; }
    public DbSet<HRB_ROLE_PERMISSION> HRB_ROLE_PERMISSION { get; set; }
    public DbSet<HRB_USER_DATA_ACCESS> HRB_USER_DATA_ACCESS { get; set; }
    public DbSet<HRB_USER_LOGIN_LOG> HRB_USER_LOGIN_LOG { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.HasDefaultSchema("dbo");

      // Budget - ตารางใหม่
      modelBuilder.Entity<HRB_BUDGET_BIGC>()
          .HasKey(b => b.BudgetId);
      modelBuilder.Entity<HRB_BUDGET_BJC>()
          .HasKey(b => b.BudgetId);

      // Config
      modelBuilder.Entity<HRB_CONF_JB_BENEFITS>()
          .HasKey(b => b.BenfId);
      modelBuilder.Entity<HRB_MST_ITEM_CONFIG>()
          .HasKey(i => i.ItemId);
      modelBuilder.Entity<HRB_CONF_GROUP_RUNRATE>()
          .HasKey(r => r.RunId);
      modelBuilder.Entity<HRB_CONF_FLEETCARD>()
          .HasKey(f => f.FcId);
      modelBuilder.Entity<HRB_CONF_BUDGET_BONUS>()
          .HasKey(b => b.BgrateId);
      modelBuilder.Entity<HRB_CONF_SALARY_STRUCTURE>()
          .HasKey(s => s.SsId);
      modelBuilder.Entity<HRB_CONF_BU_SUP>()
          .HasKey(b => b.BuId);
      modelBuilder.Entity<HRB_CONF_BUDGETRATES>()
          .HasKey(br => new { br.Id, br.CompanyId });
      modelBuilder.Entity<HRB_CONF_SALARY_RANGE>()
          .HasKey(sr => new { sr.Id, sr.CompanyId, sr.JobBand });
      modelBuilder.Entity<HRB_CONF_HRBP>()
          .HasKey(h => h.HrbpId);
      modelBuilder.Entity<HRB_CONF_PE_ALLOCATION>()
          .HasKey(p => new { p.AllocateId, p.CompanyId, p.CostCenterCode });

      // Master
      modelBuilder.Entity<HRB_MST_COMPANY>()
          .HasKey(c => c.CompanyId);
      modelBuilder.Entity<HRB_MST_COST_CENTER>()
          .HasKey(cc => cc.CostId);
      modelBuilder.Entity<HRB_MST_GL_ACCOUNT>()
          .HasKey(gl => gl.GlId);
      modelBuilder.Entity<HRB_MST_JOB_BAND>()
          .HasKey(jb => jb.JbId);
      modelBuilder.Entity<HRB_MST_POSITION>()
          .HasKey(p => p.PosId);
      modelBuilder.Entity<HRB_MST_STATUS>()
          .HasKey(s => s.StatusId);

      // Cost
      modelBuilder.Entity<HRB_COST_GROUP_MAPPING>()
          .HasKey(mp => mp.GroupId);
      modelBuilder.Entity<HRB_COST_GROUP_RUNRATE>()
          .HasKey(r => r.MapId);

      // Employee
      modelBuilder.Entity<HRB_EMPLOYEE_DATA>()
          .HasKey(e => e.EmpId);
      modelBuilder.Entity<HRB_EMP_EXPENSE_BIGC>()
          .HasKey(e => e.ExpenseId);
      modelBuilder.Entity<HRB_EMP_EXPENSE_BJC>()
          .HasKey(e => e.ExpenseId);

      // PE
      modelBuilder.Entity<HRB_PE_MANAGEMENT>()
          .HasKey(c => c.PeId);
      modelBuilder.Entity<HRB_PE_MOVEMENT>()
          .HasKey(m => m.Id);
      modelBuilder.Entity<HRB_PE_NOTIFICATION>(entity =>
      {
          entity.HasKey(e => e.NotificationId);
          entity.HasIndex(e => new { e.RecipientEmpCode, e.IsRead, e.IsActive });
          entity.HasIndex(e => e.MovementId);
      });

      // Log
      modelBuilder.Entity<HRB_EMAIL_LOG>()
          .HasKey(l => l.EmailId);
      modelBuilder.Entity<HRB_UPLOAD_LOG>()
          .HasKey(l => l.Id);
      modelBuilder.Entity<HRB_ACTIVITY_LOG>(entity =>
      {
          entity.HasKey(e => e.LogId);
          entity.HasIndex(e => e.Timestamp).IsDescending();
          entity.HasIndex(e => e.UserId);
          entity.HasIndex(e => e.ModuleName);
          entity.HasIndex(e => e.Action);
          entity.HasIndex(e => e.TargetId);
          entity.HasIndex(e => new { e.ModuleName, e.Timestamp }).IsDescending(false, true);
          entity.HasIndex(e => new { e.UserId, e.Timestamp }).IsDescending(false, true);
      });

      // Auth
      modelBuilder.Entity<HRB_USER>(entity =>
      {
          entity.HasKey(e => e.UserId);
          entity.HasIndex(e => e.EmpCode).IsUnique();
          entity.HasIndex(e => e.Username).IsUnique();
      });

      modelBuilder.Entity<HRB_ROLE>(entity =>
      {
          entity.HasKey(e => e.RoleId);
          entity.HasIndex(e => e.RoleCode).IsUnique();
      });

      modelBuilder.Entity<HRB_USER_ROLE>(entity =>
      {
          entity.HasKey(e => e.Id);
          entity.HasIndex(e => new { e.UserId, e.RoleId, e.CompanyId }).IsUnique();
          entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId);
          entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId);
      });

      modelBuilder.Entity<HRB_PERMISSION>(entity =>
      {
          entity.HasKey(e => e.PermissionId);
          entity.HasIndex(e => e.PermissionCode).IsUnique();
      });

      modelBuilder.Entity<HRB_ROLE_PERMISSION>(entity =>
      {
          entity.HasKey(e => e.Id);
          entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();
          entity.HasOne(e => e.Role)
                .WithMany()
                .HasForeignKey(e => e.RoleId);
          entity.HasOne(e => e.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(e => e.PermissionId);
      });

      modelBuilder.Entity<HRB_USER_DATA_ACCESS>(entity =>
      {
          entity.HasKey(e => e.Id);
          entity.HasIndex(e => e.UserId);
          entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId);
      });

      modelBuilder.Entity<HRB_USER_LOGIN_LOG>(entity =>
      {
          entity.HasKey(e => e.Id);
          entity.HasIndex(e => e.UserId);
          entity.HasIndex(e => e.LoginTime);
          entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId);
      });
    }
  }
}
