using System.Security.Cryptography;
using System.Text;

namespace HCBPCoreUI_Backend.Helpers
{
    /// <summary>
    /// AES-256 Encryption Helper
    /// ใช้สำหรับ Encrypt/Decrypt ข้อมูลสำคัญ เช่น ConnectionStrings
    ///
    /// Created: 13 Jan 2026
    /// Author: Ten (AI Developer)
    /// </summary>
    public static class EncryptionHelper
    {
        /// <summary>
        /// Encrypt ข้อความด้วย AES-256
        /// </summary>
        /// <param name="plainText">ข้อความที่ต้องการ encrypt</param>
        /// <param name="key">Key สำหรับ encryption</param>
        /// <returns>Base64 encoded encrypted string (IV + CipherText)</returns>
        public static string EncryptAES(string plainText, string key)
        {
            if (string.IsNullOrEmpty(plainText))
                throw new ArgumentNullException(nameof(plainText));

            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException(nameof(key));

            using var aes = Aes.Create();
            aes.Key = DeriveKey(key);
            aes.GenerateIV(); // สร้าง IV ใหม่ทุกครั้ง

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var msEncrypt = new MemoryStream();

            // เขียน IV ไว้ที่ต้น (16 bytes)
            msEncrypt.Write(aes.IV, 0, aes.IV.Length);

            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            using (var swEncrypt = new StreamWriter(csEncrypt))
            {
                swEncrypt.Write(plainText);
            }

            return Convert.ToBase64String(msEncrypt.ToArray());
        }

        /// <summary>
        /// Decrypt ข้อความที่ encrypt ด้วย AES-256
        /// </summary>
        /// <param name="cipherText">Base64 encoded encrypted string</param>
        /// <param name="key">Key สำหรับ decryption</param>
        /// <returns>Plain text</returns>
        public static string DecryptAES(string cipherText, string key)
        {
            if (string.IsNullOrEmpty(cipherText))
                throw new ArgumentNullException(nameof(cipherText));

            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException(nameof(key));

            var fullCipher = Convert.FromBase64String(cipherText);

            using var aes = Aes.Create();
            aes.Key = DeriveKey(key);

            // อ่าน IV จาก 16 bytes แรก
            var iv = new byte[16];
            Array.Copy(fullCipher, 0, iv, 0, iv.Length);
            aes.IV = iv;

            // อ่าน CipherText ส่วนที่เหลือ
            var cipher = new byte[fullCipher.Length - iv.Length];
            Array.Copy(fullCipher, iv.Length, cipher, 0, cipher.Length);

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var msDecrypt = new MemoryStream(cipher);
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);

            return srDecrypt.ReadToEnd();
        }

        /// <summary>
        /// สร้าง 256-bit key จาก password โดยใช้ SHA-256
        /// </summary>
        /// <param name="key">Password/Key string</param>
        /// <returns>256-bit (32 bytes) key</returns>
        private static byte[] DeriveKey(string key)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
        }
    }
}
