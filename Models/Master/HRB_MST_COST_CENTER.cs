using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Master
{
  [Table("HRB_MST_COST_CENTER")]
  public class HRB_MST_COST_CENTER
  {
    [Key]
    [Column("COST_ID")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CostId { get; set; }

    [Required]
    [Column("COMPANY_ID")]
    public int CompanyId { get; set; }

    [Required]
    [Column("COST_CENTER_CODE")]
    [StringLength(20)]
    public string CostCenterCode { get; set; } = string.Empty;

    [Column("COST_CENTER_NAME")]
    [StringLength(100)]
    public string? CostCenterName { get; set; }

    [Column("START_DATE")]
    public DateTime? StartDate { get; set; }

    [Column("END_DATE")]
    public DateTime? EndDate { get; set; }

    [Column("HR_EMP_CODE")]
    [StringLength(20)]
    public string? HrEmpCode { get; set; }

    [Column("BU_HEAD_SUP")]
    [StringLength(100)]
    public string? BuHeadSup { get; set; }

    [Column("BU_HEAD")]
    [StringLength(100)]
    public string? BuHead { get; set; }

    [Column("BU")]
    [StringLength(100)]
    public string? Bu { get; set; }

    [Column("COBU")]
    [StringLength(100)]
    public string? Cobu { get; set; }

    [Column("DEPARTMENT")]
    [StringLength(100)]
    public string? Department { get; set; }

    [Column("COST_CENTER_NAME_FAD")]
    [StringLength(100)]
    public string? CostCenterNameFad { get; set; }

    [Column("COST_CENTER_NAME_HR")]
    [StringLength(100)]
    public string? CostCenterNameHr { get; set; }

    [Column("GROUP_TYPE")]
    [StringLength(100)]
    public string? GroupType { get; set; }

    [Column("GROUP_TOTAL")]
    [StringLength(100)]
    public string? GroupTotal { get; set; }

    [Column("GROUPING_HEAD")]
    [StringLength(100)]
    public string? GroupingHead { get; set; }

    [Column("GROUPING")]
    [StringLength(100)]
    public string? Grouping { get; set; }

    [Column("IS_ACTIVE")]
    public bool? IsActive { get; set; } = true;

    [Column("UPDATED_BY")]
    [StringLength(50)]
    public string? UpdatedBy { get; set; }

    [Column("UPDATED_DATE")]
    public DateTime? UpdatedDate { get; set; } = DateTime.Now;
  }
}
