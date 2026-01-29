using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Log
{
    [Table("HRB_EMAIL_LOG", Schema = "HRBUDGET")]
    [Index(nameof(EmailId), nameof(EmailRefId), Name = "IX_HRB_EMAIL_LOG")]
    public class HRB_EMAIL_LOG
    {
        [Key]
        [Column("EMAIL_ID")]
        public int EmailId { get; set; }
        [Key]
        [Column("EMAIL_REF_ID")]
        public string? EmailRefId { get; set; }
        [Column("EMAIL_TYPE")]
        public string? EmailType { get; set; }
        [Column("TO_EMAIL")]
        public string? ToEmail { get; set; }
        [Column("CC_EMAIL")]
        public string? CcEmail { get; set; }
        [Column("BCC_EMAIL")]
        public string? BccEmail { get; set; }
        [Column("SUBJECT_EMAIL")]
        public string? SubjectEmail { get; set; }
        [Column("BODY_EMAIL")]
        public string? BodyEmail { get; set; }
        [Column("SEND_STATUS")]
        public string? SendStatus { get; set; }
        [Column("RESPONSE_MESSAGE")]
        public string? ResponseMessage { get; set; }
        [Column("UPDATED_BY")]
        public string? UpdatedBy { get; set; }
        [Column("UPDATED_DATE")]
        public DateTime? UpdatedDate { get; set; }
        [Column("SENTED_DATE")]
        public DateTime? SendedDate { get; set; }

        // ===== Reference Fields (Added for Notification System) =====

        /// <summary>
        /// Reference Type: PE_NOTIFICATION, PE_MOVEMENT, BUDGET_APPROVAL
        /// </summary>
        [Column("REF_TYPE")]
        [StringLength(50)]
        public string? RefType { get; set; }

        /// <summary>
        /// Reference ID (FK to source record)
        /// </summary>
        [Column("REF_ID")]
        public int? RefId { get; set; }

        /// <summary>
        /// Email Template Code: PE_MOVE_REQUEST, PE_APPROVED, PE_REJECTED
        /// </summary>
        [Column("TEMPLATE_CODE")]
        [StringLength(50)]
        public string? TemplateCode { get; set; }

        /// <summary>
        /// จำนวนครั้งที่ Retry
        /// </summary>
        [Column("RETRY_COUNT")]
        public int RetryCount { get; set; } = 0;

        /// <summary>
        /// จำนวนครั้งสูงสุดที่ Retry
        /// </summary>
        [Column("MAX_RETRY")]
        public int MaxRetry { get; set; } = 3;
    }
}
