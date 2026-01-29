using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
  [Table("HRB_CONF_PE_ALLOCATION")]
  public class HRB_CONF_PE_ALLOCATION
  {
    [Key]
    [Column("ALLOCATE_ID")]
    public int AllocateId { get; set; }

    [Key]
    [Column("COMPANY_ID")]
    public int CompanyId { get; set; }

    [Key]
    [Column("COST_CENTER_CODE")]
    [StringLength(20)]
    public string CostCenterCode { get; set; } = string.Empty;

    [Column("EMP_CODE")]
    [StringLength(100)]
    public string? EmpCode { get; set; }

    [Column("ALLOCATE_VALUE")]
    [Precision(5, 2)]
    public decimal? AllocateValue { get; set; }

    [Column("IS_ACTIVE")]
    public bool IsActive { get; set; } = true;

    [Column("UPDATED_BY")]
    [StringLength(50)]
    public string? UpdatedBy { get; set; }

    [Column("UPDATED_DATE")]
    public DateTime UpdatedDate { get; set; } = DateTime.Now;
  }
}
