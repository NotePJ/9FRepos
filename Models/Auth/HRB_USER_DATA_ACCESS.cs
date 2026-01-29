using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// User Data Access Entity
    /// Controls user access to specific Companies and Cost Centers
    /// </summary>
    [Table("HRB_USER_DATA_ACCESS")]
    public class HRB_USER_DATA_ACCESS
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
        /// Company ID (NULL = All companies)
        /// </summary>
        [Column("CompanyId")]
        public int? CompanyId { get; set; }

        /// <summary>
        /// Cost Center Code (NULL = All in company)
        /// </summary>
        [Column("CostCenterCode")]
        [StringLength(50)]
        public string? CostCenterCode { get; set; }

        /// <summary>
        /// Access Type: FULL, VIEW_ONLY, EDIT
        /// </summary>
        [Required]
        [Column("AccessType")]
        [StringLength(20)]
        public string AccessType { get; set; } = "FULL";

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Who assigned the access
        /// </summary>
        [Column("AssignedBy")]
        [StringLength(100)]
        public string? AssignedBy { get; set; }

        /// <summary>
        /// When access was assigned
        /// </summary>
        [Column("AssignedDate")]
        public DateTime AssignedDate { get; set; } = DateTime.Now;

        // ═══════════════════════════════════════════════════════════════
        // Navigation Properties
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// User entity
        /// </summary>
        [ForeignKey("UserId")]
        public virtual HRB_USER? User { get; set; }
    }
}
