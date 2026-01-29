using System.ComponentModel.DataAnnotations;

namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// Login request model for authentication
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// Employee number (username)
        /// </summary>
        [Required(ErrorMessage = "กรุณากรอก Employee Number")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// User password
        /// </summary>
        [Required(ErrorMessage = "กรุณากรอกรหัสผ่าน")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Company selection: "bjc" or "bigc"
        /// </summary>
        [Required(ErrorMessage = "กรุณาเลือก Company")]
        public string Company { get; set; } = string.Empty;

        /// <summary>
        /// Redirect path after successful login (optional)
        /// Default: "/"
        /// </summary>
        public string? Redirect { get; set; }
    }
}
