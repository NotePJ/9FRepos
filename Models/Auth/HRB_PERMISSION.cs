using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// Permission Entity - Master table for system permissions
    /// Categories: PAGE, BUTTON, API, FEATURE
    /// </summary>
    [Table("HRB_PERMISSION")]
    public class HRB_PERMISSION
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("PermissionId")]
        public int PermissionId { get; set; }

        /// <summary>
        /// Permission Code (unique): PAGE_DASHBOARD, BTN_SAVE, etc.
        /// </summary>
        [Required]
        [Column("PermissionCode")]
        [StringLength(100)]
        public string PermissionCode { get; set; } = string.Empty;

        /// <summary>
        /// Display Name (English)
        /// </summary>
        [Required]
        [Column("PermissionName")]
        [StringLength(200)]
        public string PermissionName { get; set; } = string.Empty;

        /// <summary>
        /// Display Name (Thai)
        /// </summary>
        [Column("PermissionNameTh")]
        [StringLength(200)]
        public string? PermissionNameTh { get; set; }

        /// <summary>
        /// Permission Description
        /// </summary>
        [Column("Description")]
        [StringLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Category: PAGE, BUTTON, API, FEATURE
        /// </summary>
        [Required]
        [Column("Category")]
        [StringLength(50)]
        public string Category { get; set; } = "PAGE";

        /// <summary>
        /// Module: BUDGET, PE, SETTINGS, etc.
        /// </summary>
        [Column("Module")]
        [StringLength(50)]
        public string? Module { get; set; }

        /// <summary>
        /// Sort Order for display
        /// </summary>
        [Column("SortOrder")]
        public int SortOrder { get; set; } = 0;

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Created By
        /// </summary>
        [Column("CreatedBy")]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        /// <summary>
        /// Created Date
        /// </summary>
        [Column("CreatedDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Updated By
        /// </summary>
        [Column("UpdatedBy")]
        [StringLength(100)]
        public string? UpdatedBy { get; set; }

        /// <summary>
        /// Updated Date
        /// </summary>
        [Column("UpdatedDate")]
        public DateTime? UpdatedDate { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // Navigation Properties
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Roles that have this permission
        /// </summary>
        public virtual ICollection<HRB_ROLE_PERMISSION>? RolePermissions { get; set; }
    }
}
