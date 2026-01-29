using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// User-Role Mapping Entity
    /// Many-to-Many relationship between HRB_USER and HRB_ROLE
    /// </summary>
    [Table("HRB_USER_ROLE")]
    public class HRB_USER_ROLE
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        /// <summary>
        /// Foreign Key to HRB_USER
        /// </summary>
        [Column("UserId")]
        public int UserId { get; set; }

        /// <summary>
        /// Foreign Key to HRB_ROLE
        /// </summary>
        [Column("RoleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Company Scope (NULL = All companies)
        /// </summary>
        [Column("CompanyId")]
        public int? CompanyId { get; set; }

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Who assigned the role
        /// </summary>
        [Column("AssignedBy")]
        [StringLength(100)]
        public string? AssignedBy { get; set; }

        /// <summary>
        /// When role was assigned
        /// </summary>
        [Column("AssignedDate")]
        public DateTime AssignedDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Who revoked the role
        /// </summary>
        [Column("RevokedBy")]
        [StringLength(100)]
        public string? RevokedBy { get; set; }

        /// <summary>
        /// When role was revoked
        /// </summary>
        [Column("RevokedDate")]
        public DateTime? RevokedDate { get; set; }

        // ═══════════════════════════════════════════════════════════════
        // Navigation Properties
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// User entity
        /// </summary>
        [ForeignKey("UserId")]
        public virtual HRB_USER? User { get; set; }

        /// <summary>
        /// Role entity
        /// </summary>
        [ForeignKey("RoleId")]
        public virtual HRB_ROLE? Role { get; set; }
    }
}
