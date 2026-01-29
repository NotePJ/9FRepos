/**
 * PE Management Configuration
 * Constants and configuration settings for the PE Management system
 *
 * Created: 3 Dec 2025
 * Updated: 9 Dec 2025 - เปลี่ยน Dropdown APIs เป็น B1 endpoints
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 * Author: Ten (AI Developer)
 */

// Get base URL from global config (supports IIS virtual directory)
const PE_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

// ═══════════════════════════════════════════════════════
// 📡 API ENDPOINTS
// ═══════════════════════════════════════════════════════

const PE_API = {
    // GET APIs (Data)
    getAll: PE_API_BASE + 'PEManagement/GetAll',
    getByCostCenter: PE_API_BASE + 'PEManagement/GetByCostCenter',
    getAccumulatedData: PE_API_BASE + 'PEManagement/GetAccumulatedData',
    getTransactionHistory: PE_API_BASE + 'PEManagement/GetTransactionHistory',

    // POST APIs (Movement Transactions)
    moveIn: PE_API_BASE + 'PEManagement/MoveIn',
    moveOut: PE_API_BASE + 'PEManagement/MoveOut',
    additional: PE_API_BASE + 'PEManagement/Additional',
    cut: PE_API_BASE + 'PEManagement/Cut',
    uploadFile: PE_API_BASE + 'PEManagement/UploadFile',

    // PUT APIs
    updateB0: PE_API_BASE + 'PEManagement/UpdateB0',
    approveTransaction: PE_API_BASE + 'PEManagement/ApproveTransaction',

    // Dropdown APIs (B1 - ดึงจาก HRB_PE_MANAGEMENT)
    b1Companies: PE_API_BASE + 'PEManagement/B1Companies',
    b1Years: PE_API_BASE + 'PEManagement/B1Years',
    b1Months: PE_API_BASE + 'PEManagement/B1Months',
    b1CostCenters: PE_API_BASE + 'PEManagement/B1CostCenters',

    // File Download
    downloadFile: PE_API_BASE + 'PEManagement/DownloadFile'
};

// ═══════════════════════════════════════════════════════
// 🎨 HEADER COLORS - AG Grid (Screen Display)
// สีอ่อนกว่าสำหรับแสดงบนหน้าจอ อ่านง่าย
// ═══════════════════════════════════════════════════════

const PE_HEADER_COLORS = {
    // ═══════════════════════════════════════════════════════
    // 🎨 สีตามที่ SA กำหนด (11 Dec 2025)
    // ═══════════════════════════════════════════════════════

    // 1. กลุ่มสีเทา (Grey) #D9D9D9
    // Columns: Cost center, Cost center name, Transfer In, Transfer Out, Additional, Cut
    grey: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },

    // 2. กลุ่มสีเหลืองทอง (Gold) #ffd966
    // Columns: Div, Department, Section
    gold: {
        background: '#ffd966',
        color: '#000000',
        className: 'header-gold'
    },

    // 3. กลุ่มสีฟ้าอ่อน (Light Blue) #B4C6E7
    // Columns: B0, B1 (After adjust)
    lightBlue: {
        background: '#B4C6E7',
        color: '#000000',
        className: 'header-light-blue'
    },

    // 4. กลุ่มสีส้มอ่อน (Light Orange) #F4B084
    // Columns: Acc. Transfer in, Acc. Transfer Out, Acc Additional, Acc. Cut
    lightOrange: {
        background: '#F4B084',
        color: '#000000',
        className: 'header-light-orange'
    },

    // 5. กลุ่มสีเขียวอ่อน (Light Green) #C6E0B4
    // Columns: Actual
    lightGreen: {
        background: '#C6E0B4',
        color: '#000000',
        className: 'header-light-green'
    },

    // 6. กลุ่มสีส้มเข้ม (Dark Orange) #ED7D31
    // Columns: Diff from B0, Diff from B1
    darkOrange: {
        background: '#ED7D31',
        color: '#FFFFFF',
        className: 'header-dark-orange'
    },

    // ═══════════════════════════════════════════════════════
    // 🔗 Aliases สำหรับ backward compatibility
    // ═══════════════════════════════════════════════════════

    // Cost Center columns → Grey
    org: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },
    // Div, Dept, Section → Gold
    orgDivision: {
        background: '#ffd966',
        color: '#000000',
        className: 'header-gold'
    },
    // B0 → Light Blue
    b0: {
        background: '#B4C6E7',
        color: '#000000',
        className: 'header-light-blue'
    },
    // Transfer In → Grey
    transferIn: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },
    // Transfer Out → Grey
    transferOut: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },
    // Additional → Grey
    additional: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },
    // Cut → Grey
    cut: {
        background: '#D9D9D9',
        color: '#000000',
        className: 'header-grey'
    },
    // Acc. Transfer In → Light Orange
    accTransferIn: {
        background: '#F4B084',
        color: '#000000',
        className: 'header-light-orange'
    },
    // Acc. Transfer Out → Light Orange
    accTransferOut: {
        background: '#F4B084',
        color: '#000000',
        className: 'header-light-orange'
    },
    // Acc. Additional → Light Orange
    accAdditional: {
        background: '#F4B084',
        color: '#000000',
        className: 'header-light-orange'
    },
    // Acc. Cut → Light Orange
    accCut: {
        background: '#F4B084',
        color: '#000000',
        className: 'header-light-orange'
    },
    // B1 → Light Blue
    b1: {
        background: '#B4C6E7',
        color: '#000000',
        className: 'header-light-blue'
    },
    // Actual → Light Green
    actual: {
        background: '#C6E0B4',
        color: '#000000',
        className: 'header-light-green'
    },
    // Diff B0 → Dark Orange
    diffB0: {
        background: '#ED7D31',
        color: '#FFFFFF',
        className: 'header-dark-orange'
    },
    // Diff B1 → Dark Orange
    diffB1: {
        background: '#ED7D31',
        color: '#FFFFFF',
        className: 'header-dark-orange'
    }
};

// ═══════════════════════════════════════════════════════
// 📊 EXCEL COLORS - Export to Excel
// สีตรงตาม Excel ต้นฉบับ (ไม่มี # นำหน้า สำหรับ ExcelJS)
// ═══════════════════════════════════════════════════════

const PE_EXCEL_COLORS = {
    // Organization - Yellow
    org: {
        background: 'FFFF00',
        color: '000000'
    },
    // B0 - Light Green
    b0: {
        background: '92D050',
        color: '000000'
    },
    // Transfer In - Blue
    transferIn: {
        background: '00B0F0',
        color: 'FFFFFF'
    },
    // Transfer Out - Orange
    transferOut: {
        background: 'ffd966',
        color: '000000'
    },
    // Additional (Init Approved) - Light Purple
    additional: {
        background: 'B4A7D6',
        color: '000000'
    },
    // Cut - Red
    cut: {
        background: 'FF0000',
        color: 'FFFFFF'
    },
    // Acc. Transfer In - Dark Blue
    accTransferIn: {
        background: '0070C0',
        color: 'FFFFFF'
    },
    // Acc. Transfer Out - Dark Orange
    accTransferOut: {
        background: 'ED7D31',
        color: 'FFFFFF'
    },
    // Acc. Additional (Approved) - Purple
    accAdditional: {
        background: '7030A0',
        color: 'FFFFFF'
    },
    // Acc. Cut - Dark Red
    accCut: {
        background: 'C00000',
        color: 'FFFFFF'
    },
    // B1 (After Adjust) - Green
    b1: {
        background: '00B050',
        color: 'FFFFFF'
    },
    // Actual - Gray
    actual: {
        background: 'A6A6A6',
        color: '000000'
    },
    // Diff B0 - White
    diffB0: {
        background: 'FFFFFF',
        color: '000000'
    },
    // Diff B1 - White
    diffB1: {
        background: 'FFFFFF',
        color: '000000'
    }
};

// ═══════════════════════════════════════════════════════
// 📊 MOVEMENT TYPES
// ═══════════════════════════════════════════════════════

const PE_MOVEMENT_TYPES = {
    MOVEIN: {
        value: 'MoveIn',
        label: 'Move In',
        description: 'ย้าย HC เข้ามาที่ Cost Center นี้',
        icon: 'fa-solid fa-right-to-bracket',
        color: 'success',
        hexColor: '#198754'
    },
    MOVEOUT: {
        value: 'MoveOut',
        label: 'Move Out',
        description: 'ย้าย HC ออกจาก Cost Center นี้',
        icon: 'fa-solid fa-right-from-bracket',
        color: 'warning',
        hexColor: '#fd7e14'
    },
    ADDITIONAL: {
        value: 'Additional',
        label: 'Additional (Approved by MGT)',
        description: 'เพิ่ม HC ใหม่ (ต้องได้รับอนุมัติ)',
        icon: 'fa-solid fa-user-plus',
        color: 'primary',
        hexColor: '#6f42c1',
        requiresApproval: true,
        allowFileUpload: true
    },
    CUT: {
        value: 'Cut',
        label: 'Cut',
        description: 'ลด HC ออกจากระบบ',
        icon: 'fa-solid fa-user-minus',
        color: 'danger',
        hexColor: '#dc3545'
    }
};

// ═══════════════════════════════════════════════════════
// 📁 FILE UPLOAD CONSTRAINTS
// ═══════════════════════════════════════════════════════

const PE_FILE_UPLOAD = {
    maxFileSize: 4 * 1024 * 1024,  // 4 MB
    maxFileSizeText: '4 MB',
    allowedTypes: ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.png', '.jpg', '.jpeg'],
    allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg'
    ]
};

// ═══════════════════════════════════════════════════════
// ✅ TRANSACTION STATUS
// ═══════════════════════════════════════════════════════

const PE_STATUS = {
    PENDING: {
        value: 'Pending',
        label: 'Pending',
        badgeClass: 'bg-warning',
        icon: 'fa-solid fa-clock'
    },
    APPROVED: {
        value: 'Approved',
        label: 'Approved',
        badgeClass: 'bg-success',
        icon: 'fa-solid fa-circle-check'
    },
    REJECTED: {
        value: 'Rejected',
        label: 'Rejected',
        badgeClass: 'bg-danger',
        icon: 'fa-solid fa-circle-xmark'
    }
};

// ═══════════════════════════════════════════════════════
// ✅ APPROVAL STATUS - สำหรับ Movement ที่ต้องอนุมัติ
// ═══════════════════════════════════════════════════════

const PE_APPROVAL_STATUS = {
    PENDING: {
        value: 'Pending',
        label: 'รอการอนุมัติ',
        labelEn: 'Pending Approval',
        badgeClass: 'approval-status-pending',
        bgClass: 'bg-warning',
        textClass: 'text-warning',
        icon: 'fa-solid fa-hourglass-half',
        rowClass: 'row-pending'
    },
    APPROVED: {
        value: 'Approved',
        label: 'อนุมัติแล้ว',
        labelEn: 'Approved',
        badgeClass: 'approval-status-approved',
        bgClass: 'bg-success',
        textClass: 'text-success',
        icon: 'fa-solid fa-circle-check',
        rowClass: ''
    },
    REJECTED: {
        value: 'Rejected',
        label: 'ไม่อนุมัติ',
        labelEn: 'Rejected',
        badgeClass: 'approval-status-rejected',
        bgClass: 'bg-danger',
        textClass: 'text-danger',
        icon: 'fa-solid fa-circle-xmark',
        rowClass: 'row-rejected'
    },
    NOT_REQUIRED: {
        value: null,
        label: '-',
        labelEn: '-',
        badgeClass: '',
        bgClass: '',
        textClass: 'text-muted',
        icon: '',
        rowClass: ''
    }
};

// ═══════════════════════════════════════════════════════
// 📡 NOTIFICATION & APPROVAL API ENDPOINTS
// ═══════════════════════════════════════════════════════

const PE_NOTIFICATION_API = {
    // Notification APIs
    count: PE_API_BASE + 'notification/count',
    countByCategory: PE_API_BASE + 'notification/count-by-category',
    list: PE_API_BASE + 'notification/list',
    get: PE_API_BASE + 'notification',
    markRead: PE_API_BASE + 'notification/read',
    markAllRead: PE_API_BASE + 'notification/read-all',

    // Approval APIs (PascalCase to match Controller routes)
    pendingMovements: PE_API_BASE + 'PEManagement/Pending',
    approveMovement: PE_API_BASE + 'PEManagement/Movement/Approve',
    rejectMovement: PE_API_BASE + 'PEManagement/Movement/Reject',
    movementAttachments: PE_API_BASE + 'PEManagement/Movement/{id}/Attachments'
};

// ═══════════════════════════════════════════════════════
// 📅 MONTHS DATA
// ═══════════════════════════════════════════════════════

const PE_MONTHS = [
    { value: 1, text: 'January', shortText: 'Jan' },
    { value: 2, text: 'February', shortText: 'Feb' },
    { value: 3, text: 'March', shortText: 'Mar' },
    { value: 4, text: 'April', shortText: 'Apr' },
    { value: 5, text: 'May', shortText: 'May' },
    { value: 6, text: 'June', shortText: 'Jun' },
    { value: 7, text: 'July', shortText: 'Jul' },
    { value: 8, text: 'August', shortText: 'Aug' },
    { value: 9, text: 'September', shortText: 'Sep' },
    { value: 10, text: 'October', shortText: 'Oct' },
    { value: 11, text: 'November', shortText: 'Nov' },
    { value: 12, text: 'December', shortText: 'Dec' }
];

// ═══════════════════════════════════════════════════════
// ⚙️ GRID OPTIONS
// ═══════════════════════════════════════════════════════

const PE_GRID_OPTIONS = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        suppressMenu: false,
        floatingFilter: true
    },
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    animateRows: true,
    rowSelection: 'single',
    suppressRowClickSelection: false,
    enableCellTextSelection: true,
    ensureDomOrder: true
};

// ═══════════════════════════════════════════════════════
// 🔢 NUMBER FORMAT OPTIONS
// ═══════════════════════════════════════════════════════

const PE_NUMBER_FORMAT = {
    hc: {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    },
    currency: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
};

// ═══════════════════════════════════════════════════════
// 💬 MESSAGES
// ═══════════════════════════════════════════════════════

const PE_MESSAGES = {
    // Success messages
    success: {
        moveIn: 'Move In transaction saved successfully',
        moveOut: 'Move Out transaction saved successfully',
        additional: 'Additional transaction saved successfully (Pending approval)',
        cut: 'Cut transaction saved successfully',
        uploadFile: 'File(s) uploaded successfully',
        approve: 'Transaction approved successfully',
        reject: 'Transaction rejected successfully'
    },
    // Error messages
    error: {
        loadData: 'Error loading data. Please try again.',
        saveData: 'Error saving data. Please try again.',
        invalidForm: 'Please fill in all required fields.',
        invalidFile: 'Invalid file type or size exceeded.',
        noRowSelected: 'Please select a row first.',
        networkError: 'Network error. Please check your connection.'
    },
    // Confirm messages
    confirm: {
        moveIn: 'Are you sure you want to Move In this HC?',
        moveOut: 'Are you sure you want to Move Out this HC?',
        additional: 'Are you sure you want to add Additional HC?',
        cut: 'Are you sure you want to Cut this HC?',
        approve: 'Are you sure you want to approve this transaction?',
        reject: 'Are you sure you want to reject this transaction?'
    }
};

// ═══════════════════════════════════════════════════════
// 🕐 DEBOUNCE DELAYS
// ═══════════════════════════════════════════════════════

const PE_DEBOUNCE_DELAYS = {
    search: 300,
    filter: 200,
    dropdown: 150
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PE_API,
        PE_HEADER_COLORS,
        PE_EXCEL_COLORS,
        PE_MOVEMENT_TYPES,
        PE_FILE_UPLOAD,
        PE_STATUS,
        PE_MONTHS,
        PE_GRID_OPTIONS,
        PE_NUMBER_FORMAT,
        PE_MESSAGES,
        PE_DEBOUNCE_DELAYS
    };
}
