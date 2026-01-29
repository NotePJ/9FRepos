
    #region EncrypAndDecrypt

    private static byte[] key = { };
    private static byte[] IV = { 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef };
    private static string SEncryptionKey = "!#$a54?3";

    public static string Decrypt(string stringToDecrypt)
    {

        byte[] inputByteArray = new byte[stringToDecrypt.Length + 1];

        try
        {

            key = System.Text.Encoding.UTF8.GetBytes(SEncryptionKey.Substring(0, 8));
            DESCryptoServiceProvider des = new DESCryptoServiceProvider();
            inputByteArray = Convert.FromBase64String(stringToDecrypt);
            MemoryStream ms = new MemoryStream();
            CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(key, IV), CryptoStreamMode.Write);

            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            System.Text.Encoding encoding = System.Text.Encoding.UTF8;
            return encoding.GetString(ms.ToArray());

        }
        catch (Exception ex)
        {
            return ex.Message;
        }

    }

    public static string Encrypt(string stringToEncrypt)
    {
        try
        {
            key = System.Text.Encoding.UTF8.GetBytes(SEncryptionKey.Substring(0, 8));
            DESCryptoServiceProvider des = new DESCryptoServiceProvider();
            byte[] inputByteArray = Encoding.UTF8.GetBytes(stringToEncrypt);

            MemoryStream ms = new MemoryStream();
            CryptoStream cs = new CryptoStream(ms, des.CreateEncryptor(key, IV), CryptoStreamMode.Write);

            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            return Convert.ToBase64String(ms.ToArray());

        }
        catch (Exception ex)
        {
            return ex.Message;
        }

    }

    #endregion
