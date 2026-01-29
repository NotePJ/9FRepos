using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HCBPCoreUI_Backend.Models.PE
{
    /// <summary>
    /// PE Notification - แจ้งเตือนการ Movement ที่ต้องอนุมัติ
    /// </summary>
    [Table("HRB_PE_NOTIFICATION")]
    public class HRB_PE_NOTIFICATION
    {
        /// <summary>
        /// Primary Key
        /// </summary>
        [Key]
        [Column("NOTIFICATION_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        // ===== Reference to Movement =====

        /// <summary>
        /// FK to HRB_PE_MOVEMENT.Id
        /// </summary>
        [Column("MOVEMENT_ID")]
        public int MovementId { get; set; }

        // ===== Notification Type & Category =====

        /// <summary>
        /// Type: MOVE_IN_REQUEST, MOVE_APPROVED, MOVE_REJECTED,
        ///       ADDITIONAL_REQUEST, ADDITIONAL_APPROVED, ADDITIONAL_REJECTED
        /// </summary>
        [Column("NOTIFICATION_TYPE")]
        [StringLength(50)]
        [Required]
        public string NotificationType { get; set; } = string.Empty;

        /// <summary>
        /// Category: PE_MOVEMENT, PE_ADDITIONAL, BUDGET_APPROVAL, SYSTEM
        /// </summary>
        [Column("NOTIFICATION_CATEGORY")]
        [StringLength(50)]
        [Required]
        public string NotificationCategory { get; set; } = string.Empty;

        // ===== Recipient Info =====

        /// <summary>
        /// ผู้รับ Notification (Employee Code)
        /// </summary>
        [Column("RECIPIENT_EMP_CODE")]
        [StringLength(100)]
        [Required]
        public string RecipientEmpCode { get; set; } = string.Empty;

        /// <summary>
        /// Cost Center ที่ผู้รับดูแล
        /// </summary>
        [Column("RECIPIENT_COST_CENTER")]
        [StringLength(50)]
        public string? RecipientCostCenter { get; set; }

        // ===== Sender Info =====

        /// <summary>
        /// ผู้ส่ง Notification (Employee Code)
        /// </summary>
        [Column("SENDER_EMP_CODE")]
        [StringLength(100)]
        [Required]
        public string SenderEmpCode { get; set; } = string.Empty;

        /// <summary>
        /// Cost Center ของผู้ส่ง
        /// </summary>
        [Column("SENDER_COST_CENTER")]
        [StringLength(50)]
        public string? SenderCostCenter { get; set; }

        // ===== Content =====

        /// <summary>
        /// หัวข้อ Notification
        /// </summary>
        [Column("TITLE")]
        [StringLength(200)]
        [Required]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// รายละเอียด
        /// </summary>
        [Column("MESSAGE")]
        [StringLength(1000)]
        public string? Message { get; set; }

        // ===== Movement Details (Denormalized for display) =====

        /// <summary>
        /// HC ที่ขอ Move
        /// </summary>
        [Column("HC")]
        public int Hc { get; set; }

        /// <summary>
        /// Base+Wage ที่ขอ Move
        /// </summary>
        [Column("BASE_WAGE", TypeName = "decimal(18,2)")]
        public decimal BaseWage { get; set; }

        /// <summary>
        /// เดือน PE
        /// </summary>
        [Column("PE_MONTH")]
        public int PeMonth { get; set; }

        /// <summary>
        /// ปี PE
        /// </summary>
        [Column("PE_YEAR")]
        public int PeYear { get; set; }

        /// <summary>
        /// Company ID
        /// </summary>
        [Column("COMPANY_ID")]
        public int CompanyId { get; set; }

        // ===== Action URL =====

        /// <summary>
        /// URL สำหรับ Navigate ไปหน้าที่เกี่ยวข้อง
        /// </summary>
        [Column("ACTION_URL")]
        [StringLength(500)]
        public string? ActionUrl { get; set; }

        /// <summary>
        /// JSON Data สำหรับ Context เพิ่มเติม
        /// </summary>
        [Column("ACTION_DATA")]
        public string? ActionData { get; set; }

        // ===== Email Reference =====

        /// <summary>
        /// FK to HRB_EMAIL_LOG.EmailId
        /// </summary>
        [Column("EMAIL_LOG_ID")]
        public int? EmailLogId { get; set; }

        /// <summary>
        /// ส่ง Email แล้วหรือยัง
        /// </summary>
        [Column("EMAIL_SENT")]
        public bool EmailSent { get; set; } = false;

        /// <summary>
        /// วันที่ส่ง Email
        /// </summary>
        [Column("EMAIL_SENT_DATE")]
        public DateTime? EmailSentDate { get; set; }

        // ===== Upload Reference =====

        /// <summary>
        /// มีไฟล์แนบหรือไม่
        /// </summary>
        [Column("HAS_ATTACHMENT")]
        public bool HasAttachment { get; set; } = false;

        /// <summary>
        /// FK to HRB_UPLOAD_LOG.Id
        /// </summary>
        [Column("UPLOAD_LOG_ID")]
        public int? UploadLogId { get; set; }

        // ===== Status =====

        /// <summary>
        /// อ่านแล้วหรือยัง
        /// </summary>
        [Column("IS_READ")]
        public bool IsRead { get; set; } = false;

        /// <summary>
        /// วันที่อ่าน
        /// </summary>
        [Column("READ_DATE")]
        public DateTime? ReadDate { get; set; }

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;

        // ===== Timestamps =====

        /// <summary>
        /// วันที่สร้าง
        /// </summary>
        [Column("CREATED_DATE")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        /// <summary>
        /// ผู้สร้าง
        /// </summary>
        [Column("CREATED_BY")]
        [StringLength(100)]
        public string? CreatedBy { get; set; }
    }
}
