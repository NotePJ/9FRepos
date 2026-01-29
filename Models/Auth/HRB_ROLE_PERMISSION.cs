using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// Role-Permission Mapping Entity
    /// Many-to-Many relationship between HRB_ROLE and HRB_PERMISSION
    /// </summary>
    [Table("HRB_ROLE_PERMISSION")]
    public class HRB_ROLE_PERMISSION
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        /// <summary>
        /// Foreign Key to HRB_ROLE
        /// </summary>
        [Column("RoleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Foreign Key to HRB_PERMISSION
        /// </summary>
        [Column("PermissionId")]
        public int PermissionId { get; set; }

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

        // ═══════════════════════════════════════════════════════════════
        // Navigation Properties
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Role entity
        /// </summary>
        [ForeignKey("RoleId")]
        public virtual HRB_ROLE? Role { get; set; }

        /// <summary>
        /// Permission entity
        /// </summary>
        [ForeignKey("PermissionId")]
        public virtual HRB_PERMISSION? Permission { get; set; }
    }
}
