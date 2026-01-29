using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// Request DTO สำหรับ Upload ไฟล์แนบ (สำหรับ Additional Transaction)
    /// </summary>
    public class FileUploadRequest
    {
        /// <summary>
        /// ID ของ Movement record ที่ต้องการแนบไฟล์
        /// </summary>
        [Required(ErrorMessage = "Movement ID is required")]
        public int MovementId { get; set; }

        /// <summary>
        /// ไฟล์ที่ต้องการ Upload (รองรับหลายไฟล์)
        /// Max size: 4 MB per file
        /// Allowed types: PDF, Excel, Word, Images
        /// </summary>
        [Required(ErrorMessage = "At least one file is required")]
        public List<IFormFile>? Files { get; set; }
    }

    /// <summary>
    /// Response DTO สำหรับการ Upload ไฟล์
    /// </summary>
    public class FileUploadResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public List<UploadedFileInfo>? UploadedFiles { get; set; }
    }

    /// <summary>
    /// ข้อมูลไฟล์ที่ Upload สำเร็จ
    /// </summary>
    public class UploadedFileInfo
    {
        public int Seq { get; set; }
        public string? FileName { get; set; }
        public string? FileSize { get; set; }
        public DateTime UploadedDate { get; set; }
    }
}
