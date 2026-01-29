using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Models.Config
{
  [Table("HRB_CONF_BU_SUP")]
  public class HRB_CONF_BU_SUP
  {
    [Key]
    [Column("BU_ID")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BuId { get; set; }

    [Column("COMPANY_ID")]
    public int? CompanyId { get; set; }

    [Column("BU_CODE")]
    [StringLength(20)]
    public string? BuCode { get; set; }

    [Column("BU_NAME")]
    [StringLength(100)]
    public string? BuName { get; set; }

    [Column("COBU_CODE")]
    [StringLength(50)]
    public string? CobuCode { get; set; }

    [Column("IS_ACTIVE")]
    public bool? IsActive { get; set; } = true;

    [Column("UPDATED_BY")]
    [StringLength(50)]
    public string? UpdatedBy { get; set; }

    [Column("UPDATED_DATE")]
    public DateTime? UpdatedDate { get; set; } = DateTime.Now;
  }
}
