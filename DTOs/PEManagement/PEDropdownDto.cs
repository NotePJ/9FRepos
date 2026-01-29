namespace HCBPCoreUI_Backend.DTOs.PEManagement
{
    /// <summary>
    /// DTO สำหรับ Company dropdown
    /// </summary>
    public class PECompanyDto
    {
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
    }

    /// <summary>
    /// DTO สำหรับ Cost Center dropdown
    /// </summary>
    public class PECostCenterDto
    {
        public string? CostCenterCode { get; set; }
        public string? CostCenterName { get; set; }
    }

    /// <summary>
    /// DTO สำหรับ Month dropdown
    /// </summary>
    public class PEMonthDto
    {
        public int Value { get; set; }
        public string? Text { get; set; }
        public string? ShortText { get; set; }
    }

    /// <summary>
    /// Generic Response DTO สำหรับ Dropdown APIs
    /// </summary>
    public class PEDropdownResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public List<T>? Data { get; set; }
    }
}
