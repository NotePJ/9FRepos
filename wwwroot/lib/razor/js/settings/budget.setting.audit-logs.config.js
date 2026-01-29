/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Audit Logs Configuration
 * Contains column definitions, API endpoints, and log type configurations
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Get base URL from global config (supports IIS virtual directory)
const AUDIT_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

// ═══════════════════════════════════════════════════════════════════════════
// LOG TYPES CONFIGURATION (Extensible for future log types)
// ═══════════════════════════════════════════════════════════════════════════
const LOG_TYPES = {
    LOGIN: {
        key: 'login',
        name: 'Login Logs',
        icon: 'fa-right-to-bracket',
        apiEndpoint: AUDIT_API_BASE + 'Settings/AuditLogs/Login',
        gridId: 'loginGrid',
        defaultSortField: 'loginTime',
        defaultSortOrder: 'desc'
    },
    EMAIL: {
        key: 'email',
        name: 'Email Logs',
        icon: 'fa-envelope',
        apiEndpoint: AUDIT_API_BASE + 'Settings/AuditLogs/Email',
        gridId: 'emailGrid',
        defaultSortField: 'sentDate',
        defaultSortOrder: 'desc'
    },
    UPLOAD: {
        key: 'upload',
        name: 'Upload Logs',
        icon: 'fa-cloud-arrow-up',
        apiEndpoint: AUDIT_API_BASE + 'Settings/AuditLogs/Upload',
        gridId: 'uploadGrid',
        defaultSortField: 'uploadedDate',
        defaultSortOrder: 'desc'
    },
    ACTIVITY: {
        key: 'activity',
        name: 'Activity Logs',
        icon: 'fa-list-check',
        apiEndpoint: AUDIT_API_BASE + 'Settings/AuditLogs/Activity',
        gridId: 'activityGrid',
        defaultSortField: 'timestamp',
        defaultSortOrder: 'desc'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// COLUMN DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Login Logs Column Definitions
 */
const LOGIN_LOG_COLUMNS = [
    {
        headerName: '#',
        field: 'rowNum',
        width: 60,
        pinned: 'left',
        valueGetter: (params) => params.node.rowIndex + 1 + ((params.api.paginationGetCurrentPage?.() || 0) * (params.api.paginationGetPageSize?.() || 50)),
        sortable: false,
        filter: false
    },
    {
        headerName: 'Username',
        field: 'username',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Login Time',
        field: 'loginTime',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => formatDateTime(params.value)
    },
    {
        headerName: 'IP Address',
        field: 'ipAddress',
        width: 130,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Auth Type',
        field: 'authType',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            const badgeClass = value === 'AD' ? 'bg-primary' : 'bg-info';
            return `<span class="badge ${badgeClass}">${value}</span>`;
        }
    },
    {
        headerName: 'Status',
        field: 'loginStatus',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            const badgeClass = value === 'SUCCESS' ? 'bg-success' : 'bg-danger';
            return `<span class="badge ${badgeClass}">${value}</span>`;
        }
    },
    {
        headerName: 'Company',
        field: 'company',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'User Agent',
        field: 'userAgent',
        width: 250,
        filter: 'agTextColumnFilter',
        sortable: true,
        tooltipField: 'userAgent'
    },
    {
        headerName: 'Fail Reason',
        field: 'failReason',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: true,
        tooltipField: 'failReason'
    },
    {
        headerName: 'Logout Time',
        field: 'logoutTime',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? formatDateTime(params.value) : '-'
    }
];

/**
 * Email Logs Column Definitions
 */
const EMAIL_LOG_COLUMNS = [
    {
        headerName: '#',
        field: 'rowNum',
        width: 60,
        pinned: 'left',
        valueGetter: (params) => params.node.rowIndex + 1 + ((params.api.paginationGetCurrentPage?.() || 0) * (params.api.paginationGetPageSize?.() || 50)),
        sortable: false,
        filter: false
    },
    {
        headerName: 'Sent Date',
        field: 'sentDate',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? formatDateTime(params.value) : '-'
    },
    {
        headerName: 'To Email',
        field: 'toEmail',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Subject',
        field: 'subject',
        width: 250,
        filter: 'agTextColumnFilter',
        sortable: true,
        tooltipField: 'subject'
    },
    {
        headerName: 'Status',
        field: 'sendStatus',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            let badgeClass = 'bg-warning text-dark';
            if (value === 'SUCCESS' || value === 'SENT') badgeClass = 'bg-success';
            else if (value === 'FAILED' || value === 'ERROR') badgeClass = 'bg-danger';
            return `<span class="badge ${badgeClass}">${value}</span>`;
        }
    },
    {
        headerName: 'Email Type',
        field: 'emailType',
        width: 130,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Template',
        field: 'templateCode',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Retry',
        field: 'retryCount',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const retry = params.value || 0;
            const max = params.data?.maxRetry || 3;
            return `${retry}/${max}`;
        }
    },
    {
        headerName: 'CC Email',
        field: 'ccEmail',
        width: 180,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Ref Type',
        field: 'refType',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Ref ID',
        field: 'refId',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true
    },
    {
        headerName: 'Response',
        field: 'responseMessage',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: true,
        tooltipField: 'responseMessage'
    },
    {
        headerName: 'Updated Date',
        field: 'updatedDate',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? formatDateTime(params.value) : '-'
    }
];

/**
 * Upload Logs Column Definitions
 */
const UPLOAD_LOG_COLUMNS = [
    {
        headerName: '#',
        field: 'rowNum',
        width: 60,
        pinned: 'left',
        valueGetter: (params) => params.node.rowIndex + 1 + ((params.api.paginationGetCurrentPage?.() || 0) * (params.api.paginationGetPageSize?.() || 50)),
        sortable: false,
        filter: false
    },
    {
        headerName: 'Upload Date',
        field: 'uploadedDate',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? formatDateTime(params.value) : '-'
    },
    {
        headerName: 'Uploaded By',
        field: 'uploadedBy',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'File Name',
        field: 'fileName',
        width: 250,
        filter: 'agTextColumnFilter',
        sortable: true,
        tooltipField: 'fileName'
    },
    {
        headerName: 'File Type',
        field: 'fileType',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            let badgeClass = 'bg-secondary';
            if (value === 'PDF') badgeClass = 'bg-danger';
            else if (value === 'EXCEL') badgeClass = 'bg-success';
            else if (value === 'IMAGE') badgeClass = 'bg-info';
            else if (value === 'WORD') badgeClass = 'bg-primary';
            return `<span class="badge ${badgeClass}">${value || '-'}</span>`;
        }
    },
    {
        headerName: 'File Size',
        field: 'fileSize',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Ref Type',
        field: 'refType',
        width: 130,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Ref ID',
        field: 'refId',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true
    },
    {
        headerName: 'ID',
        field: 'id',
        width: 80,
        filter: 'agNumberColumnFilter',
        sortable: true
    },
    {
        headerName: 'Seq',
        field: 'seq',
        width: 70,
        filter: 'agNumberColumnFilter',
        sortable: true
    }
];

/**
 * Activity Logs Column Definitions
 */
const ACTIVITY_LOG_COLUMNS = [
    {
        headerName: '#',
        field: 'rowNum',
        width: 60,
        pinned: 'left',
        valueGetter: (params) => params.node.rowIndex + 1 + ((params.api.paginationGetCurrentPage?.() || 0) * (params.api.paginationGetPageSize?.() || 50)),
        sortable: false,
        filter: false
    },
    {
        headerName: 'Timestamp',
        field: 'timestamp',
        width: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? formatDateTime(params.value) : '-'
    },
    {
        headerName: 'User ID',
        field: 'userId',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Username',
        field: 'username',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Role',
        field: 'userRole',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            let badgeClass = 'bg-secondary';
            if (value === 'ADMIN') badgeClass = 'bg-danger';
            else if (value === 'MANAGER') badgeClass = 'bg-warning text-dark';
            else if (value === 'USER') badgeClass = 'bg-info';
            return value ? `<span class="badge ${badgeClass}">${value}</span>` : '-';
        }
    },
    {
        headerName: 'Module',
        field: 'moduleName',
        width: 140,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            let icon = 'fa-circle-question';
            if (value.includes('PE')) icon = 'fa-chart-pie';
            else if (value.includes('User')) icon = 'fa-users';
            else if (value.includes('Role')) icon = 'fa-user-shield';
            else if (value.includes('Master')) icon = 'fa-database';
            return `<i class="fa-solid ${icon} me-1 text-muted"></i>${value}`;
        }
    },
    {
        headerName: 'Action',
        field: 'action',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            let badgeClass = 'bg-secondary';
            if (value === 'CREATE') badgeClass = 'bg-success';
            else if (value === 'UPDATE') badgeClass = 'bg-info';
            else if (value === 'DELETE') badgeClass = 'bg-danger';
            else if (value === 'APPROVE') badgeClass = 'bg-primary';
            else if (value === 'REJECT') badgeClass = 'bg-warning text-dark';
            else if (value === 'MOVE_IN' || value === 'MOVE_OUT') badgeClass = 'bg-purple';
            else if (value === 'ADDITIONAL') badgeClass = 'bg-teal';
            else if (value === 'CUT') badgeClass = 'bg-orange';
            return `<span class="badge ${badgeClass}">${value}</span>`;
        }
    },
    {
        headerName: 'Target ID',
        field: 'targetId',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Target Type',
        field: 'targetType',
        width: 100,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Status',
        field: 'status',
        width: 90,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params) => {
            const value = params.value || '';
            const badgeClass = value === 'SUCCESS' ? 'bg-success' : 'bg-danger';
            return `<span class="badge ${badgeClass}">${value}</span>`;
        }
    },
    {
        headerName: 'Old Value',
        field: 'oldValue',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: false,
        tooltipField: 'oldValue',
        cellRenderer: (params) => {
            const value = params.value;
            if (!value) return '-';
            try {
                const obj = typeof value === 'string' ? JSON.parse(value) : value;
                return `<span class="text-muted small" style="cursor:pointer;" title="${escapeHtml(JSON.stringify(obj, null, 2))}">${truncateJson(value)}</span>`;
            } catch {
                return `<span class="text-muted small">${truncateText(value, 30)}</span>`;
            }
        }
    },
    {
        headerName: 'New Value',
        field: 'newValue',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: false,
        tooltipField: 'newValue',
        cellRenderer: (params) => {
            const value = params.value;
            if (!value) return '-';
            try {
                const obj = typeof value === 'string' ? JSON.parse(value) : value;
                return `<span class="text-primary small" style="cursor:pointer;" title="${escapeHtml(JSON.stringify(obj, null, 2))}">${truncateJson(value)}</span>`;
            } catch {
                return `<span class="text-primary small">${truncateText(value, 30)}</span>`;
            }
        }
    },
    {
        headerName: 'IP Address',
        field: 'ipAddress',
        width: 120,
        filter: 'agTextColumnFilter',
        sortable: true
    },
    {
        headerName: 'Duration (ms)',
        field: 'durationMs',
        width: 100,
        filter: 'agNumberColumnFilter',
        sortable: true,
        valueFormatter: (params) => params.value ? `${params.value} ms` : '-'
    },
    {
        headerName: 'Error',
        field: 'errorMessage',
        width: 200,
        filter: 'agTextColumnFilter',
        sortable: false,
        tooltipField: 'errorMessage',
        cellRenderer: (params) => {
            const value = params.value;
            if (!value) return '-';
            return `<span class="text-danger small">${truncateText(value, 50)}</span>`;
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format datetime string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Truncate JSON for display
 * @param {string} jsonStr - JSON string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncateJson(jsonStr, maxLength = 30) {
    if (!jsonStr) return '-';
    const str = typeof jsonStr === 'string' ? jsonStr : JSON.stringify(jsonStr);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

/**
 * Truncate text for display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncateText(text, maxLength = 50) {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped string
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Get column definitions by log type
 * @param {string} logType - Log type key (login, email, upload, activity)
 * @returns {Array} Column definitions
 */
function getColumnsByLogType(logType) {
    switch (logType) {
        case 'login':
            return LOGIN_LOG_COLUMNS;
        case 'email':
            return EMAIL_LOG_COLUMNS;
        case 'upload':
            return UPLOAD_LOG_COLUMNS;
        case 'activity':
            return ACTIVITY_LOG_COLUMNS;
        default:
            return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT GRID OPTIONS
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_GRID_OPTIONS = {
    defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
        minWidth: 50
    },
    animateRows: true,
    rowSelection: 'single',
    suppressRowClickSelection: true,
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100, 200],
    enableCellTextSelection: true,
    ensureDomOrder: true,
    tooltipShowDelay: 500
};

// Export for use in main script
window.AuditLogsConfig = {
    LOG_TYPES,
    LOGIN_LOG_COLUMNS,
    EMAIL_LOG_COLUMNS,
    UPLOAD_LOG_COLUMNS,
    ACTIVITY_LOG_COLUMNS,
    DEFAULT_GRID_OPTIONS,
    formatDateTime,
    truncateJson,
    truncateText,
    escapeHtml,
    getColumnsByLogType
};
