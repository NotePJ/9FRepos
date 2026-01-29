using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Log;
using Microsoft.EntityFrameworkCore;

namespace HCBPCoreUI_Backend.Services
{
    /// <summary>
    /// File Upload Service Interface
    /// Phase 7: File Upload Integration
    /// </summary>
    public interface IFileUploadService
    {
        /// <summary>
        /// Upload file และ link กับ Movement
        /// </summary>
        Task<FileUploadResult> UploadFileAsync(FileUploadInput request);

        /// <summary>
        /// Get files by reference
        /// </summary>
        Task<List<FileInfoDto>> GetFilesByReferenceAsync(string refType, int refId);

        /// <summary>
        /// Get file by ID
        /// </summary>
        Task<FileDownloadResult?> GetFileAsync(int id, int seq);

        /// <summary>
        /// Delete file (soft delete)
        /// </summary>
        Task<bool> DeleteFileAsync(int id, int seq);
    }

    /// <summary>
    /// File Upload Input DTO
    /// </summary>
    public class FileUploadInput
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] FileData { get; set; } = Array.Empty<byte>();
        public string MimeType { get; set; } = string.Empty;
        public string RefType { get; set; } = string.Empty;  // PE_MOVEMENT, PE_ADDITIONAL
        public int RefId { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
    }

    /// <summary>
    /// File Upload Result
    /// </summary>
    public class FileUploadResult
    {
        public bool Success { get; set; }
        public int Id { get; set; }
        public int Seq { get; set; }
        public string? Message { get; set; }
        public string? FileName { get; set; }
    }

    /// <summary>
    /// File Info DTO
    /// </summary>
    public class FileInfoDto
    {
        public int Id { get; set; }
        public int Seq { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileSize { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime? UploadedDate { get; set; }
    }

    /// <summary>
    /// File Download Result
    /// </summary>
    public class FileDownloadResult
    {
        public byte[] FileData { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
    }

    /// <summary>
    /// File Upload Service Implementation
    /// </summary>
    public class FileUploadService : IFileUploadService
    {
        private readonly HRBudgetDbContext _context;
        private readonly ILogger<FileUploadService> _logger;

        // Allowed file types
        private static readonly HashSet<string> AllowedMimeTypes = new()
        {
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  // xlsx
            "application/vnd.ms-excel",  // xls
            "application/msword",  // doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // docx
            "image/png",
            "image/jpeg",
            "image/jpg"
        };

        private const int MaxFileSizeBytes = 4 * 1024 * 1024;  // 4 MB

        public FileUploadService(
            HRBudgetDbContext context,
            ILogger<FileUploadService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Upload file และ link กับ Movement
        /// </summary>
        public async Task<FileUploadResult> UploadFileAsync(FileUploadInput request)
        {
            try
            {
                // Validate file
                if (request.FileData == null || request.FileData.Length == 0)
                {
                    return new FileUploadResult { Success = false, Message = "ไม่พบไฟล์" };
                }

                if (request.FileData.Length > MaxFileSizeBytes)
                {
                    return new FileUploadResult { Success = false, Message = "ขนาดไฟล์เกิน 4 MB" };
                }

                if (!AllowedMimeTypes.Contains(request.MimeType.ToLower()))
                {
                    return new FileUploadResult { Success = false, Message = "ประเภทไฟล์ไม่รองรับ" };
                }

                // Get next ID and Seq
                var maxId = await _context.HRB_UPLOAD_LOG
                    .Where(u => u.RefType == request.RefType && u.RefId == request.RefId)
                    .MaxAsync(u => (int?)u.Id) ?? 0;

                var newId = maxId > 0 ? maxId : request.RefId;

                var maxSeq = await _context.HRB_UPLOAD_LOG
                    .Where(u => u.Id == newId)
                    .MaxAsync(u => (int?)u.Seq) ?? 0;

                var newSeq = maxSeq + 1;

                // Determine file type
                var fileType = GetFileType(request.MimeType);

                // Create upload log
                var uploadLog = new HRB_UPLOAD_LOG
                {
                    Id = newId,
                    Seq = newSeq,
                    FileName = request.FileName,
                    FileSize = FormatFileSize(request.FileData.Length),
                    FileData = request.FileData,
                    UploadedBy = request.UploadedBy,
                    UploadedDate = DateTime.Now,
                    RefType = request.RefType,
                    RefId = request.RefId,
                    FileType = fileType,
                    MimeType = request.MimeType,
                    IsActive = true
                };

                _context.HRB_UPLOAD_LOG.Add(uploadLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("File uploaded: {FileName} for {RefType}:{RefId}",
                    request.FileName, request.RefType, request.RefId);

                return new FileUploadResult
                {
                    Success = true,
                    Id = newId,
                    Seq = newSeq,
                    FileName = request.FileName,
                    Message = "อัพโหลดสำเร็จ"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file: {FileName}", request.FileName);
                return new FileUploadResult { Success = false, Message = "เกิดข้อผิดพลาดในการอัพโหลด" };
            }
        }

        /// <summary>
        /// Get files by reference
        /// </summary>
        public async Task<List<FileInfoDto>> GetFilesByReferenceAsync(string refType, int refId)
        {
            return await _context.HRB_UPLOAD_LOG
                .Where(u => u.RefType == refType && u.RefId == refId && u.IsActive)
                .OrderBy(u => u.Seq)
                .Select(u => new FileInfoDto
                {
                    Id = u.Id,
                    Seq = u.Seq,
                    FileName = u.FileName ?? "",
                    FileSize = u.FileSize ?? "",
                    FileType = u.FileType ?? "",
                    MimeType = u.MimeType ?? "",
                    UploadedBy = u.UploadedBy ?? "",
                    UploadedDate = u.UploadedDate
                })
                .ToListAsync();
        }

        /// <summary>
        /// Get file by ID
        /// </summary>
        public async Task<FileDownloadResult?> GetFileAsync(int id, int seq)
        {
            var file = await _context.HRB_UPLOAD_LOG
                .Where(u => u.Id == id && u.Seq == seq && u.IsActive)
                .FirstOrDefaultAsync();

            if (file == null || file.FileData == null)
                return null;

            return new FileDownloadResult
            {
                FileData = file.FileData,
                FileName = file.FileName ?? $"file_{id}_{seq}",
                MimeType = file.MimeType ?? "application/octet-stream"
            };
        }

        /// <summary>
        /// Delete file (soft delete)
        /// </summary>
        public async Task<bool> DeleteFileAsync(int id, int seq)
        {
            var file = await _context.HRB_UPLOAD_LOG
                .Where(u => u.Id == id && u.Seq == seq)
                .FirstOrDefaultAsync();

            if (file == null)
                return false;

            file.IsActive = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("File deleted: ID={Id}, Seq={Seq}", id, seq);
            return true;
        }

        // ═══════════════════════════════════════════════════════
        // 🔧 PRIVATE HELPER METHODS
        // ═══════════════════════════════════════════════════════

        private static string GetFileType(string mimeType)
        {
            return mimeType.ToLower() switch
            {
                "application/pdf" => "PDF",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => "EXCEL",
                "application/vnd.ms-excel" => "EXCEL",
                "application/msword" => "WORD",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => "WORD",
                "image/png" => "IMAGE",
                "image/jpeg" => "IMAGE",
                "image/jpg" => "IMAGE",
                _ => "OTHER"
            };
        }

        private static string FormatFileSize(long bytes)
        {
            if (bytes < 1024)
                return $"{bytes} B";
            if (bytes < 1024 * 1024)
                return $"{bytes / 1024.0:F1} KB";
            return $"{bytes / (1024.0 * 1024.0):F2} MB";
        }
    }
}
