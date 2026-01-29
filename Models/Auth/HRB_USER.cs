using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// User Entity for Authentication (Simple DB Auth)
    /// รองรับทั้ง AD และ DB Authentication
    /// </summary>
    [Table("HRB_USER")]
    public class HRB_USER
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("UserId")]
        public int UserId { get; set; }

        /// <summary>
        /// Employee Code (unique)
        /// </summary>
        [Required]
        [Column("EmpCode")]
        [StringLength(50)]
        public string EmpCode { get; set; } = string.Empty;

        /// <summary>
        /// Login Username (unique)
        /// </summary>
        [Required]
        [Column("Username")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// BCrypt Password Hash (NULL = AD only user)
        /// </summary>
        [Column("PasswordHash")]
        [StringLength(256)]
        public string? PasswordHash { get; set; }

        /// <summary>
        /// Authentication Type: 'AD' or 'DB'
        /// </summary>
        [Required]
        [Column("AuthType")]
        [StringLength(20)]
        public string AuthType { get; set; } = "AD";

        /// <summary>
        /// Display Name
        /// </summary>
        [Column("FullName")]
        [StringLength(200)]
        public string? FullName { get; set; }

        /// <summary>
        /// Email Address
        /// </summary>
        [Column("Email")]
        [StringLength(200)]
        public string? Email { get; set; }

        /// <summary>
        /// User Role: Admin, SuperUser, Manager, User, Viewer
        /// </summary>
        [Column("Role")]
        [StringLength(50)]
        public string? Role { get; set; } = "User";

        /// <summary>
        /// Company Access: BJC, BIGC, or BJC,BIGC
        /// </summary>
        [Column("CompanyAccess")]
        [StringLength(100)]
        public string? CompanyAccess { get; set; }

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Locked Status (too many failed attempts)
        /// </summary>
        [Column("IsLocked")]
        public bool IsLocked { get; set; } = false;

        /// <summary>
        /// Failed Login Attempts Counter
        /// </summary>
        [Column("FailedLoginAttempts")]
        public int FailedLoginAttempts { get; set; } = 0;

        /// <summary>
        /// Last Login Date
        /// </summary>
        [Column("LastLoginDate")]
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// Last Password Change Date
        /// </summary>
        [Column("LastPasswordChange")]
        public DateTime? LastPasswordChange { get; set; }

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
    }
}
