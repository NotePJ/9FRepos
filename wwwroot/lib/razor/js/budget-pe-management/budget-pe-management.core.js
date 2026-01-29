/**
 * PE Management Core Utilities
 * Utility functions for the PE Management system
 *
 * Created: 3 Dec 2025
 * Author: Ten (AI Developer)
 */

const PECore = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 🔢 NUMBER FORMATTING
    // ═══════════════════════════════════════════════════════

    /**
     * Format number with thousand separator
     * @param {number|string} value - Value to format
     * @param {number} decimals - Number of decimal places (default: 0)
     * @returns {string} Formatted number string
     */
    function formatNumber(value, decimals = 0) {
        if (value === null || value === undefined || value === '') return '-';

        const num = parseFloat(String(value).replace(/,/g, ''));
        if (isNaN(num)) return '-';

        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Format currency value (2 decimal places)
     * @param {number|string} value - Value to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value) {
        return formatNumber(value, 2);
    }

    /**
     * Format HC value (integer)
     * @param {number|string} value - Value to format
     * @returns {string} Formatted HC string
     */
    function formatHC(value) {
        return formatNumber(value, 0);
    }

    /**
     * Parse string to decimal
     * @param {string} value - String value to parse
     * @returns {number} Parsed decimal value
     */
    function parseDecimal(value) {
        if (value === null || value === undefined || value === '') return 0;
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    }

    /**
     * Parse string to integer
     * @param {string} value - String value to parse
     * @returns {number} Parsed integer value
     */
    function parseInt(value) {
        if (value === null || value === undefined || value === '') return 0;
        const num = window.parseInt(String(value).replace(/,/g, ''), 10);
        return isNaN(num) ? 0 : num;
    }

    // ═══════════════════════════════════════════════════════
    // 📐 CALCULATION FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Calculate B1 HC
     * Formula: B1_HC = B0_HC + ACC_MOVE_IN_HC + ACC_ADD_HC - ACC_MOVE_OUT_HC - ACC_CUT_HC
     * @param {object} data - PE Management data
     * @returns {number} Calculated B1 HC
     */
    function calculateB1Hc(data) {
        const b0 = parseInt(data.b0Hc);
        const accMoveIn = parseInt(data.accMoveInHc);
        const accAdd = parseInt(data.accAddHc);
        const accMoveOut = parseInt(data.accMoveOutHc);
        const accCut = parseInt(data.accCutHc);

        return b0 + accMoveIn + accAdd - accMoveOut - accCut;
    }

    /**
     * Calculate B1 Base+Wage
     * Formula: B1_BASE_WAGE = B0_BASE_WAGE + ACC_MOVE_IN_BASE_WAGE + ACC_ADD_BASE_WAGE - ACC_MOVE_OUT_BASE_WAGE - ACC_CUT_BASE_WAGE
     * @param {object} data - PE Management data
     * @returns {number} Calculated B1 Base+Wage
     */
    function calculateB1BaseWage(data) {
        const b0 = parseDecimal(data.b0BaseWage);
        const accMoveIn = parseDecimal(data.accMoveInBaseWage);
        const accAdd = parseDecimal(data.accAddBaseWage);
        const accMoveOut = parseDecimal(data.accMoveOutBaseWage);
        const accCut = parseDecimal(data.accCutBaseWage);

        return b0 + accMoveIn + accAdd - accMoveOut - accCut;
    }

    /**
     * Calculate Diff B0 HC
     * Formula: DIFF_B0_HC = B0_HC - ACTUAL_HC
     * @param {object} data - PE Management data
     * @returns {number} Calculated Diff B0 HC
     */
    function calculateDiffB0Hc(data) {
        return parseInt(data.b0Hc) - parseInt(data.actualHc);
    }

    /**
     * Calculate Diff B0 Base+Wage
     * @param {object} data - PE Management data
     * @returns {number} Calculated Diff B0 Base+Wage
     */
    function calculateDiffB0BaseWage(data) {
        return parseDecimal(data.b0BaseWage) - parseDecimal(data.actualBaseWagePremium);
    }

    /**
     * Calculate Diff B1 HC
     * Formula: DIFF_B1_HC = B1_HC - ACTUAL_HC
     * @param {object} data - PE Management data
     * @returns {number} Calculated Diff B1 HC
     */
    function calculateDiffB1Hc(data) {
        return parseInt(data.b1Hc) - parseInt(data.actualHc);
    }

    /**
     * Calculate Diff B1 Base+Wage
     * @param {object} data - PE Management data
     * @returns {number} Calculated Diff B1 Base+Wage
     */
    function calculateDiffB1BaseWage(data) {
        return parseDecimal(data.b1BaseWage) - parseDecimal(data.actualBaseWagePremium);
    }

    // ═══════════════════════════════════════════════════════
    // ✅ VALIDATION FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Validate HC value
     * @param {number|string} value - HC value to validate
     * @returns {boolean} Is valid
     */
    function validateHC(value) {
        const num = parseInt(value);
        return num > 0;
    }

    /**
     * Validate Base+Wage value
     * @param {number|string} value - Base+Wage value to validate
     * @returns {boolean} Is valid
     */
    function validateBaseWage(value) {
        const num = parseDecimal(value);
        return num > 0;
    }

    /**
     * Validate file size
     * @param {File} file - File to validate
     * @returns {boolean} Is valid
     */
    function validateFileSize(file) {
        return file.size <= PE_FILE_UPLOAD.maxFileSize;
    }

    /**
     * Validate file type
     * @param {File} file - File to validate
     * @returns {boolean} Is valid
     */
    function validateFileType(file) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return PE_FILE_UPLOAD.allowedTypes.includes(ext);
    }

    /**
     * Validate file (size and type)
     * @param {File} file - File to validate
     * @returns {object} Validation result { isValid, error }
     */
    function validateFile(file) {
        if (!validateFileSize(file)) {
            return { isValid: false, error: `File size exceeds ${PE_FILE_UPLOAD.maxFileSizeText}` };
        }
        if (!validateFileType(file)) {
            return { isValid: false, error: 'Invalid file type' };
        }
        return { isValid: true, error: null };
    }

    /**
     * Validate Move In form
     * @param {object} formData - Form data
     * @returns {object} Validation result { isValid, errors }
     */
    function validateMoveInForm(formData) {
        const errors = [];

        if (!formData.fromCostCenterCode) {
            errors.push('From Cost Center is required');
        }
        if (!validateHC(formData.hc)) {
            errors.push('HC must be greater than 0');
        }
        if (!validateBaseWage(formData.baseWage)) {
            errors.push('Base+Wage must be greater than 0');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Validate Move Out form
     * @param {object} formData - Form data
     * @returns {object} Validation result { isValid, errors }
     */
    function validateMoveOutForm(formData) {
        const errors = [];

        if (!formData.toCostCenterCode) {
            errors.push('To Cost Center is required');
        }
        if (!validateHC(formData.hc)) {
            errors.push('HC must be greater than 0');
        }
        if (!validateBaseWage(formData.baseWage)) {
            errors.push('Base+Wage must be greater than 0');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Validate Additional form
     * @param {object} formData - Form data
     * @returns {object} Validation result { isValid, errors }
     */
    function validateAdditionalForm(formData) {
        const errors = [];

        if (!validateHC(formData.hc)) {
            errors.push('HC must be greater than 0');
        }
        if (!validateBaseWage(formData.baseWage)) {
            errors.push('Base+Wage must be greater than 0');
        }
        if (!formData.remark || formData.remark.trim() === '') {
            errors.push('Remark is required for Additional request');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Validate Cut form
     * @param {object} formData - Form data
     * @returns {object} Validation result { isValid, errors }
     */
    function validateCutForm(formData) {
        const errors = [];

        if (!validateHC(formData.hc)) {
            errors.push('HC must be greater than 0');
        }
        if (!validateBaseWage(formData.baseWage)) {
            errors.push('Base+Wage must be greater than 0');
        }

        return { isValid: errors.length === 0, errors };
    }

    // ═══════════════════════════════════════════════════════
    // 📁 FILE HELPERS
    // ═══════════════════════════════════════════════════════

    /**
     * Format file size to human readable
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    function formatFileSize(bytes) {
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        }
        if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' bytes';
    }

    /**
     * Get file icon class based on extension
     * @param {string} fileName - File name
     * @returns {string} Bootstrap icon class
     */
    function getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'bi-file-pdf text-danger',
            'xlsx': 'bi-file-excel text-success',
            'xls': 'bi-file-excel text-success',
            'doc': 'bi-file-word text-primary',
            'docx': 'bi-file-word text-primary',
            'png': 'bi-file-image text-info',
            'jpg': 'bi-file-image text-info',
            'jpeg': 'bi-file-image text-info'
        };
        return icons[ext] || 'bi-file-earmark';
    }

    // ═══════════════════════════════════════════════════════
    // 📅 DATE/TIME HELPERS
    // ═══════════════════════════════════════════════════════

    /**
     * Get current month (1-12)
     * @returns {number} Current month
     */
    function getCurrentMonth() {
        return new Date().getMonth() + 1;
    }

    /**
     * Get current year (YYYY)
     * @returns {string} Current year
     */
    function getCurrentYear() {
        return new Date().getFullYear().toString();
    }

    /**
     * Format date to display format
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date (DD/MM/YYYY)
     */
    function formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    }

    /**
     * Format datetime to display format
     * @param {string|Date} datetime - Datetime to format
     * @returns {string} Formatted datetime (DD/MM/YYYY HH:mm)
     */
    function formatDateTime(datetime) {
        if (!datetime) return '-';
        const d = new Date(datetime);
        if (isNaN(d.getTime())) return '-';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // ═══════════════════════════════════════════════════════
    // 🔧 UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show loading overlay
     */
    function showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (overlay) {
            if (loadingText) {
                loadingText.textContent = text;
            }
            overlay.classList.remove('d-none');
        }
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('d-none');
        }
    }

    /**
     * Show toast notification using Bootstrap Toast
     * @param {string} message - Message to show
     * @param {string} type - Type: success, error, warning, info
     */
    function showToast(message, type = 'info') {
        // Create toast container if not exists
        let toastContainer = document.getElementById('peToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'peToastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        const colorMap = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info'
        };

        const iconMap = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${colorMap[type] || colorMap.info} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fa-solid ${iconMap[type] || iconMap.info} me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();

        // Remove from DOM after hidden
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }

    /**
     * Show success modal
     * @param {string} message - Success message
     */
    function showSuccessModal(message) {
        showMessageModal('Success', message, 'success');
    }

    /**
     * Show error modal
     * @param {string} message - Error message
     */
    function showErrorModal(message) {
        showMessageModal('Error', message, 'danger');
    }

    /**
     * Show warning modal
     * @param {string} message - Warning message
     */
    function showWarningModal(message) {
        showMessageModal('Warning', message, 'warning');
    }

    /**
     * Show generic message modal
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {string} type - Type: success, danger, warning, info
     */
    function showMessageModal(title, message, type = 'info') {
        const modalElement = document.getElementById('peMessageModal');
        if (!modalElement) {
            // Fallback to alert if modal not found
            alert(message);
            return;
        }

        const modal = new bootstrap.Modal(modalElement);
        const modalLabel = modalElement.querySelector('#peMessageModalLabel');
        const modalMessage = modalElement.querySelector('#peMessageModalBody');
        const modalIcon = modalElement.querySelector('#peMessageModalIcon');
        const okBtn = modalElement.querySelector('.btn-primary');

        const iconConfig = {
            success: { icon: 'fa-circle-check', color: 'text-success' },
            danger: { icon: 'fa-circle-xmark', color: 'text-danger' },
            warning: { icon: 'fa-triangle-exclamation', color: 'text-warning' },
            info: { icon: 'fa-circle-info', color: 'text-info' }
        };
        const cfg = iconConfig[type] || iconConfig.info;

        if (modalIcon) {
            modalIcon.className = `fa-solid ${cfg.icon} fa-2x ${cfg.color} me-3`;
        }
        if (modalLabel) modalLabel.textContent = title;
        if (modalMessage) modalMessage.textContent = message;

        // Update OK button color
        if (okBtn) {
            okBtn.className = `btn btn-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}`;
        }

        modal.show();
    }

    /**
     * Show confirmation dialog using Bootstrap Modal
     * @param {object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string} options.message - Modal message
     * @param {string} [options.iconType='question'] - Icon type: question, warning, danger, success, info
     * @param {string} [options.confirmText='Confirm'] - Confirm button text
     * @param {string} [options.cancelText='Cancel'] - Cancel button text
     * @param {Function} options.onConfirm - Callback when confirmed
     * @param {Function} [options.onCancel=null] - Callback when cancelled
     */
    function showConfirmModal(options) {
        const {
            title,
            message,
            iconType = 'question',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm,
            onCancel = null
        } = options;

        const modalElement = document.getElementById('confirmActionModal');
        if (!modalElement) {
            console.error('Confirm modal not found');
            if (confirm(message)) {
                onConfirm && onConfirm();
            } else {
                onCancel && onCancel();
            }
            return;
        }

        const modal = new bootstrap.Modal(modalElement);
        const modalLabel = modalElement.querySelector('#confirmActionModalLabel');
        const modalMessage = modalElement.querySelector('#confirmActionModalMessage');
        const modalIcon = modalElement.querySelector('#confirmActionIcon');
        const confirmBtn = document.getElementById('confirmActionBtn');
        const cancelBtn = document.getElementById('cancelActionBtn');

        // Update icon based on type
        const iconConfig = {
            question: { icon: 'fa-circle-question', color: 'text-primary' },
            warning: { icon: 'fa-triangle-exclamation', color: 'text-warning' },
            danger: { icon: 'fa-circle-exclamation', color: 'text-danger' },
            success: { icon: 'fa-circle-check', color: 'text-success' },
            info: { icon: 'fa-circle-info', color: 'text-info' }
        };
        const iconCfg = iconConfig[iconType] || iconConfig.question;
        modalIcon.className = `fa-solid ${iconCfg.icon} fa-2x ${iconCfg.color}`;

        // Update content
        modalLabel.textContent = title;
        modalMessage.textContent = message;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        // Remove previous event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Setup new handlers
        newConfirmBtn.addEventListener('click', function () {
            modal.hide();
            onConfirm && onConfirm();
        });

        newCancelBtn.addEventListener('click', function () {
            modal.hide();
            onCancel && onCancel();
        });

        // Show modal
        modal.show();
    }

    /**
     * Show confirmation dialog (Legacy - returns Promise)
     * @param {string} message - Confirmation message
     * @param {string} title - Dialog title
     * @returns {Promise<boolean>} User's choice
     * @deprecated Use showConfirmModal() instead for better compatibility
     */
    async function showConfirm(message, title = 'Confirm') {
        // Use native confirm as fallback since SweetAlert2 has issues with Offcanvas
        return confirm(`${title}\n\n${message}`);
    }

    /**
     * Get status badge HTML
     * @param {string} status - Status value
     * @returns {string} Badge HTML
     */
    function getStatusBadge(status) {
        const statusConfig = PE_STATUS[status?.toUpperCase()] || PE_STATUS.PENDING;
        return `<span class="badge ${statusConfig.badgeClass}">${statusConfig.label}</span>`;
    }

    /**
     * Get movement type badge HTML
     * @param {string} type - Movement type
     * @returns {string} Badge HTML
     */
    function getMovementTypeBadge(type) {
        const typeConfig = PE_MOVEMENT_TYPES[type?.toUpperCase()] || {};
        const colorClass = `text-bg-${typeConfig.color || 'secondary'}`;
        return `<span class="badge ${colorClass}">
            <i class="${typeConfig.icon || 'fa-solid fa-arrows-left-right'}"></i> ${typeConfig.label || type}
        </span>`;
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        // Number formatting
        formatNumber,
        formatCurrency,
        formatHC,
        parseDecimal,
        parseInt,

        // Calculations
        calculateB1Hc,
        calculateB1BaseWage,
        calculateDiffB0Hc,
        calculateDiffB0BaseWage,
        calculateDiffB1Hc,
        calculateDiffB1BaseWage,

        // Validation
        validateHC,
        validateBaseWage,
        validateFileSize,
        validateFileType,
        validateFile,
        validateMoveInForm,
        validateMoveOutForm,
        validateAdditionalForm,
        validateCutForm,

        // File helpers
        formatFileSize,
        getFileIcon,

        // Date/Time
        getCurrentMonth,
        getCurrentYear,
        formatDate,
        formatDateTime,

        // Utilities
        debounce,
        showLoading,
        hideLoading,
        showToast,
        showConfirm,
        showConfirmModal,
        showSuccessModal,
        showErrorModal,
        showWarningModal,
        showMessageModal,
        getStatusBadge,
        getMovementTypeBadge
    };
})();
