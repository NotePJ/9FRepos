using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Auth
{
    /// <summary>
    /// User Login Log Entity
    /// บันทึกประวัติการเข้าสู่ระบบ
    /// </summary>
    [Table("HRB_USER_LOGIN_LOG")]
    public class HRB_USER_LOGIN_LOG
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("UserId")]
        public int? UserId { get; set; }

        [Column("Username")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Column("LoginTime")]
        public DateTime LoginTime { get; set; } = DateTime.Now;

        [Column("LogoutTime")]
        public DateTime? LogoutTime { get; set; }

        [Column("IPAddress")]
        [StringLength(50)]
        public string? IPAddress { get; set; }

        [Column("UserAgent")]
        [StringLength(500)]
        public string? UserAgent { get; set; }

        [Column("AuthType")]
        [StringLength(20)]
        public string AuthType { get; set; } = "AD";

        [Column("LoginStatus")]
        [StringLength(20)]
        public string LoginStatus { get; set; } = "SUCCESS"; // SUCCESS, FAILED

        [Column("FailReason")]
        [StringLength(500)]
        public string? FailReason { get; set; }

        [Column("Company")]
        [StringLength(50)]
        public string? Company { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual HRB_USER? User { get; set; }
    }
}
