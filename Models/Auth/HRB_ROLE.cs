using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// Role Entity - Master table for system roles
    /// Roles: ADMIN, SUPER_USER, MANAGER, USER, VIEWER
    /// </summary>
    [Table("HRB_ROLE")]
    public class HRB_ROLE
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("RoleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Role Code (unique): ADMIN, SUPER_USER, MANAGER, USER, VIEWER
        /// </summary>
        [Required]
        [Column("RoleCode")]
        [StringLength(50)]
        public string RoleCode { get; set; } = string.Empty;

        /// <summary>
        /// Display Name (English)
        /// </summary>
        [Required]
        [Column("RoleName")]
        [StringLength(100)]
        public string RoleName { get; set; } = string.Empty;

        /// <summary>
        /// Display Name (Thai)
        /// </summary>
        [Column("RoleNameTh")]
        [StringLength(100)]
        public string? RoleNameTh { get; set; }

        /// <summary>
        /// Role Description
        /// </summary>
        [Column("Description")]
        [StringLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Role Level: 1=Highest (Admin), 5=Lowest (Viewer)
        /// </summary>
        [Column("RoleLevel")]
        public int RoleLevel { get; set; } = 0;

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// System Role Flag - Cannot be deleted
        /// </summary>
        [Column("IsSystem")]
        public bool IsSystem { get; set; } = false;

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
        /// Users assigned to this role
        /// </summary>
        public virtual ICollection<HRB_USER_ROLE>? UserRoles { get; set; }
    }
}
