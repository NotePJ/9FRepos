using System.Text.Json.Serialization;

namespace HCBPCoreUI_Backend.DTOs.Auth
{
    /// <summary>
    /// Token response from external authentication API
    /// </summary>
    public class TokenResponse
    {
        /// <summary>
        /// Access token for API authentication
        /// </summary>
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>
        /// Token type (usually "Bearer")
        /// </summary>
        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        /// <summary>
        /// Token expiration time in seconds
        /// </summary>
        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
