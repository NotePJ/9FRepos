using System.Collections.Generic;

namespace HCBPCoreUI_Backend.DTOs.Budget
{
    /// <summary>
    /// Request DTO for batch PE Allocation Configuration save
    /// </summary>
    public class PEAllocationBatchRequest
    {
        public List<PEAllocationDto> Allocations { get; set; } = new List<PEAllocationDto>();
        public string CreatedBy { get; set; } = string.Empty;
    }

    /// <summary>
    /// Individual PE Allocation Configuration record
    /// </summary>
    public class PEAllocationDto
    {
        public int AllocateId { get; set; }
        public int CompanyId { get; set; }
        public string CostCenterCode { get; set; } = string.Empty;
        public string? EmpCode { get; set; }
        public decimal? AllocateValue { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
