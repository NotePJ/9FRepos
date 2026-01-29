using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Config
{
  [Table("HRB_CONF_SALARY_RANGE")]
  [Index(nameof(Id), nameof(JobBand), nameof(CompanyId), Name = "IX_HRB_CONF_SALARY_RANGE")]
  public class HRB_CONF_SALARY_RANGE
  {
    [Key]
    [Column("ID")]
    public int Id { get; set; }
    [Key]
    [Column("COMPANY_ID")]
    public int CompanyId { get; set; }
    [Key]
    [Column("JOB_BAND")]
    public string? JobBand { get; set; }
    [Column("FUNCTION_NAME")]
    public string? FunctionName { get; set; }
    [Column("MIN_SALARY")]
    public decimal? MinSalary { get; set; }
    [Column("MID_SALARY")]
    public decimal? MidSalary { get; set; }
    [Column("P75_SALARY")]
    public decimal? P75Salary { get; set; }
    [Column("MAX_SALARY")]
    public decimal? MaxSalary { get; set; }
    [Column("IS_ACTIVE")]
    public bool IsActive { get; set; }
    [Column("UPDATED_BY")]
    public string? UpdatedBy { get; set; }
    [Column("UPDATED_DATE")]
    public DateTime UpdatedDate { get; set; }
  }
}
