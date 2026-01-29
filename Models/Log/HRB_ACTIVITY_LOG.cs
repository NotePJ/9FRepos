using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.Log
{
    /// <summary>
    /// Entity Model สำหรับ Activity Log
    /// บันทึกกิจกรรมทุกเมนู: CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT
    /// </summary>
    [Table("HRB_ACTIVITY_LOG", Schema = "dbo")]
    public class HRB_ACTIVITY_LOG
    {
        /// <summary>
        /// Primary Key - Auto Increment
        /// </summary>
        [Key]
        [Column("LogId")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long LogId { get; set; }

        /// <summary>
        /// วันที่และเวลาที่เกิดเหตุการณ์ (UTC)
        /// </summary>
        [Column("Timestamp")]
        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// รหัสพนักงาน (EmpCode)
        /// </summary>
        [Column("UserId")]
        [Required]
        [StringLength(50)]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// ชื่อผู้ใช้งาน (Display Name)
        /// </summary>
        [Column("Username")]
        [StringLength(100)]
        public string? Username { get; set; }

        /// <summary>
        /// บทบาทขณะทำ (Role)
        /// </summary>
        [Column("UserRole")]
        [StringLength(50)]
        public string? UserRole { get; set; }

        /// <summary>
        /// ชื่อเมนู/โมดูล เช่น 'PE Management', 'User Management'
        /// </summary>
        [Column("ModuleName")]
        [Required]
        [StringLength(100)]
        public string ModuleName { get; set; } = string.Empty;

        /// <summary>
        /// ประเภทการกระทำ: CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT
        /// </summary>
        [Column("Action")]
        [Required]
        [StringLength(30)]
        public string Action { get; set; } = string.Empty;

        /// <summary>
        /// PK ของข้อมูลที่ถูกกระทำ (เช่น MovementId, UserId)
        /// </summary>
        [Column("TargetId")]
        [StringLength(100)]
        public string? TargetId { get; set; }

        /// <summary>
        /// ประเภท Entity: 'Movement', 'User', 'Role', 'MasterData'
        /// </summary>
        [Column("TargetType")]
        [StringLength(50)]
        public string? TargetType { get; set; }

        /// <summary>
        /// ข้อมูลเดิมก่อนแก้ไข (JSON)
        /// </summary>
        [Column("OldValue")]
        public string? OldValue { get; set; }

        /// <summary>
        /// ข้อมูลใหม่หลังแก้ไข (JSON)
        /// </summary>
        [Column("NewValue")]
        public string? NewValue { get; set; }

        /// <summary>
        /// IP Address ของผู้ใช้งาน (รองรับ IPv4/IPv6)
        /// </summary>
        [Column("IpAddress")]
        [StringLength(45)]
        public string? IpAddress { get; set; }

        /// <summary>
        /// ข้อมูล Browser และ OS
        /// </summary>
        [Column("UserAgent")]
        [StringLength(500)]
        public string? UserAgent { get; set; }

        /// <summary>
        /// API URL ที่เรียก
        /// </summary>
        [Column("RequestUrl")]
        [StringLength(500)]
        public string? RequestUrl { get; set; }

        /// <summary>
        /// สถานะความสำเร็จ: SUCCESS, FAILED
        /// </summary>
        [Column("Status")]
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "SUCCESS";

        /// <summary>
        /// Error Message กรณีที่ล้มเหลว
        /// </summary>
        [Column("ErrorMessage")]
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// ระยะเวลาในการทำงาน (milliseconds)
        /// </summary>
        [Column("DurationMs")]
        public int? DurationMs { get; set; }
    }
}
