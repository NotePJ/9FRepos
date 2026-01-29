using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace HCBPCoreUI_Backend.Models.Log
{
    [Table("HRB_UPLOAD_LOG", Schema = "HRBUDGET")]
    [Index(nameof(Id), nameof(Seq), Name = "IX_HRB_UPLOAD_LOG")]
    public class HRB_UPLOAD_LOG
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }
        [Key]
        [Column("SEQ")]
        public int Seq { get; set; }
        [Column("FILE_NAME")]
        public string? FileName { get; set; }
        [Column("FILE_SIZE")]
        public string? FileSize { get; set; }
        [Column("FILE_DATA")]
        public byte[]? FileData { get; set; }
        [Column("UPLOADED_BY")]
        public string? UploadedBy { get; set; }
        [Column("UPLOADED_DATE")]
        public DateTime? UploadedDate { get; set; }

        // ===== Reference Fields (Added for Notification System) =====

        /// <summary>
        /// Reference Type: PE_MOVEMENT, PE_ADDITIONAL, BUDGET
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
        /// File Type: PDF, EXCEL, IMAGE, WORD
        /// </summary>
        [Column("FILE_TYPE")]
        [StringLength(50)]
        public string? FileType { get; set; }

        /// <summary>
        /// MIME Type: application/pdf, image/jpeg, etc.
        /// </summary>
        [Column("MIME_TYPE")]
        [StringLength(100)]
        public string? MimeType { get; set; }

        /// <summary>
        /// Active Status
        /// </summary>
        [Column("IS_ACTIVE")]
        public bool IsActive { get; set; } = true;
    }
}
