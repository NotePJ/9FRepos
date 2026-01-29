/**
 * PE Management Offcanvas Module
 * Handles Offcanvas panels for Movement transactions
 *
 * Created: 3 Dec 2025
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 * Author: Ten (AI Developer)
 */

const PEOffcanvas = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 📡 API BASE URL (supports IIS virtual directory)
    // ═══════════════════════════════════════════════════════

    const OFFCANVAS_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

    // ═══════════════════════════════════════════════════════
    // 🏠 PRIVATE STATE
    // ═══════════════════════════════════════════════════════

    let currentData = null;
    let currentMovementType = null;
    let uploadedFiles = [];
    let offcanvasInstance = null;
    let costCenterOptions = [];

    // ═══════════════════════════════════════════════════════
    // 🔧 INITIALIZATION
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize Offcanvas module
     */
    function init() {
        // Initialize Bootstrap Offcanvas
        const offcanvasEl = document.getElementById('peMovementOffcanvas');
        if (offcanvasEl) {
            offcanvasInstance = new bootstrap.Offcanvas(offcanvasEl);

            // Reset form on close
            offcanvasEl.addEventListener('hidden.bs.offcanvas', function () {
                resetForm();
            });
        }

        // Bind event handlers
        bindEventHandlers();

        // Load dropdown data
        loadDropdownData();

        // Initialize Movement Type Select2 with icons
        initMovementTypeSelect2();
    }

    /**
     * Initialize Movement Type dropdown with Select2 and Font Awesome icons
     */
    function initMovementTypeSelect2() {
        const $movementType = $('#ddlMovementType');
        if (!$movementType.length) return;

        // Format option with icon
        function formatMovementType(option) {
            if (!option.id) {
                return option.text; // placeholder
            }

            const $option = $(option.element);
            const iconClass = $option.data('icon');
            const iconColor = $option.data('color');

            if (iconClass) {
                return $(`<span><i class="${iconClass}" style="color: ${iconColor}; margin-right: 8px;"></i>${option.text}</span>`);
            }
            return option.text;
        }

        $movementType.select2({
            dropdownParent: $('#peMovementOffcanvas'),
            minimumResultsForSearch: Infinity, // ซ่อน search box
            templateResult: formatMovementType,
            templateSelection: formatMovementType,
            width: '100%'
        });
    }

    /**
     * Bind event handlers
     */
    function bindEventHandlers() {
        // Movement type dropdown change
        $(document).on('change', '#ddlMovementType', function () {
            const selectedType = $(this).val();
            if (selectedType) {
                updateFormForMovementType(selectedType);
            }
        });

        // Save button click
        $(document).on('click', '#btnSaveMovement', function () {
            saveMovement();
        });

        // Cancel button click
        $(document).on('click', '#btnCancelMovement', function () {
            hide();
        });

        // File input change
        $(document).on('change', '#fileUpload', function (e) {
            handleFileSelect(e.target.files);
        });

        // Remove file click
        $(document).on('click', '.btn-remove-file', function () {
            const index = $(this).data('index');
            removeFile(index);
        });

        // Cost Center search (using Select2 or similar)
        $(document).on('select2:select', '#ddlFromCostCenter, #ddlToCostCenter', function (e) {
            // Handle selection
        });

        // Approve button click in history table
        // Use event delegation on the history offcanvas container
        $('#peHistoryOffcanvas').on('click', '.btn-approve-history', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const movementId = $(this).data('movement-id');
            console.log('🔍 [Approve Click] movementId:', movementId);
            if (!movementId) {
                console.error('❌ [Approve Click] No movementId found!');
                return;
            }
            handleApproveFromHistory(movementId, $(this).closest('tr'));
        });

        // Reject button click in history table
        $('#peHistoryOffcanvas').on('click', '.btn-reject-history', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const movementId = $(this).data('movement-id');
            console.log('🔍 [Reject Click] movementId:', movementId);
            if (!movementId) {
                console.error('❌ [Reject Click] No movementId found!');
                return;
            }
            handleRejectFromHistory(movementId, $(this).closest('tr'));
        });
    }

    /**
     * Handle Approve from History table
     * @param {number} movementId - Movement ID
     * @param {jQuery} $row - Table row element
     */
    function handleApproveFromHistory(movementId, $row) {
        console.log('🔍 [handleApproveFromHistory] Starting... movementId:', movementId);

        PECore.showConfirmModal({
            title: 'Approve Movement',
            message: 'คุณต้องการอนุมัติรายการนี้หรือไม่?',
            iconType: 'question',
            confirmText: 'Approve',
            cancelText: 'Cancel',
            onConfirm: async function() {
                try {
                    console.log('🔍 [handleApproveFromHistory] Confirmed! Calling API...');
                    PECore.showLoading();

                    const response = await fetch(`${OFFCANVAS_API_BASE}PEManagement/Movement/Approve/${movementId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    const data = await response.json();
                    console.log('🔍 [handleApproveFromHistory] API response:', data);

                    PECore.hideLoading();

                    if (data.success) {
                        PECore.showSuccessModal(data.message || 'รายการได้รับการอนุมัติแล้ว');

                        // Update row UI
                        $row.find('.btn-approve-history, .btn-reject-history').parent().html('<span class="text-muted">-</span>');
                        $row.find('.badge').removeClass('bg-warning').addClass('bg-success').html('<i class="fa-solid fa-check me-1"></i>Approved');

                        // Refresh grid if available
                        if (typeof PEGrid !== 'undefined' && PEGrid.refreshData) {
                            PEGrid.refreshData();
                        }
                    } else {
                        PECore.showErrorModal(data.message || 'Failed to approve');
                    }
                } catch (error) {
                    PECore.hideLoading();
                    console.error('❌ [handleApproveFromHistory] Error:', error);
                    PECore.showErrorModal('เกิดข้อผิดพลาดในการอนุมัติ');
                }
            }
        });
    }

    /**
     * Handle Reject from History table
     * @param {number} movementId - Movement ID
     * @param {jQuery} $row - Table row element
     */
    function handleRejectFromHistory(movementId, $row) {
        console.log('🔍 [handleRejectFromHistory] Starting... movementId:', movementId);

        const modalElement = document.getElementById('peRejectReasonModal');
        if (!modalElement) {
            console.error('Reject modal not found');
            return;
        }

        const modal = new bootstrap.Modal(modalElement);
        const reasonInput = document.getElementById('rejectReasonText');
        const errorDiv = document.getElementById('rejectReasonError');
        const confirmBtn = document.getElementById('btnConfirmReject');

        // Reset form
        reasonInput.value = '';
        reasonInput.classList.remove('is-invalid');

        // Remove previous event listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Setup confirm handler
        newConfirmBtn.addEventListener('click', async function() {
            const reason = reasonInput.value.trim();

            if (!reason) {
                reasonInput.classList.add('is-invalid');
                return;
            }

            reasonInput.classList.remove('is-invalid');
            modal.hide();

            try {
                PECore.showLoading();

                const response = await fetch(`${OFFCANVAS_API_BASE}PEManagement/Movement/Reject/${movementId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: reason })
                });

                const data = await response.json();
                console.log('🔍 [handleRejectFromHistory] API response:', data);

                PECore.hideLoading();

                if (data.success) {
                    PECore.showSuccessModal(data.message || 'รายการถูกปฏิเสธแล้ว');

                    // Update row UI
                    $row.find('.btn-approve-history, .btn-reject-history').parent().html('<span class="text-muted">-</span>');
                    $row.find('.badge').removeClass('bg-warning').addClass('bg-danger').html('<i class="fa-solid fa-xmark me-1"></i>Rejected');

                    // Refresh grid if available
                    if (typeof PEGrid !== 'undefined' && PEGrid.refreshData) {
                        PEGrid.refreshData();
                    }
                } else {
                    PECore.showErrorModal(data.message || 'Failed to reject');
                }
            } catch (error) {
                PECore.hideLoading();
                console.error('❌ [handleRejectFromHistory] Error:', error);
                PECore.showErrorModal('เกิดข้อผิดพลาดในการปฏิเสธ');
            }
        });

        modal.show();
    }

    /**
     * Load dropdown data
     */
    async function loadDropdownData() {
        try {
            costCenterOptions = await PEApi.getCostCenters();
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    }

    // ═══════════════════════════════════════════════════════
    // 📋 OFFCANVAS MANAGEMENT
    // ═══════════════════════════════════════════════════════

    /**
     * Show offcanvas for a specific row
     * @param {object} rowData - Grid row data
     */
    function show(rowData) {
        currentData = rowData;
        currentMovementType = null;
        uploadedFiles = [];

        // Update offcanvas header with row info
        updateHeader(rowData);

        // Populate read-only fields
        populateReadOnlyFields(rowData);

        // Reset movement type dropdown
        $('#ddlMovementType').val('').trigger('change');

        // Hide form sections initially
        hideAllFormSections();

        // Show offcanvas
        if (offcanvasInstance) {
            offcanvasInstance.show();
        }
    }

    /**
     * Hide offcanvas
     */
    function hide() {
        if (offcanvasInstance) {
            offcanvasInstance.hide();
        }
    }

    /**
     * Reset form
     */
    function resetForm() {
        currentData = null;
        currentMovementType = null;
        uploadedFiles = [];

        // Clear all inputs
        $('#peMovementForm')[0]?.reset();
        $('#ddlMovementType').val('').trigger('change');
        $('#fileList').empty();

        // Hide form sections
        hideAllFormSections();

        // Clear validation
        clearValidation();
    }

    // ═══════════════════════════════════════════════════════
    // 📝 FORM MANAGEMENT
    // ═══════════════════════════════════════════════════════

    /**
     * Update offcanvas header
     * @param {object} rowData - Grid row data
     */
    function updateHeader(rowData) {
        const header = `
            <h5 class="offcanvas-title mb-0">
                <i class="fa-solid fa-plus me-2"></i>Add Movement
            </h5>
        `;
        $('#peOffcanvasTitle').html(header);
    }

    /**
     * Populate read-only fields
     * @param {object} rowData - Grid row data
     */
    function populateReadOnlyFields(rowData) {
        // Current HC and Base+Wage info
        $('#lblCurrentHC').text(PECore.formatHC(rowData.b1Hc));
        $('#lblCurrentBaseWage').text(PECore.formatCurrency(rowData.b1BaseWage));
        $('#lblCostCenter').text(`${rowData.costCenterCode} - ${rowData.costCenterName}`);
        $('#lblCompany').text(rowData.companyName || '-');
        $('#lblYear').text(rowData.peYear || rowData.year || '-');

        // Format month (1-12 to month name)
        const monthNum = rowData.peMonth || rowData.month;
        if (monthNum) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            $('#lblMonth').text(monthNames[parseInt(monthNum) - 1] || monthNum);
        } else {
            $('#lblMonth').text('-');
        }
    }

    /**
     * Update form based on movement type
     * @param {string} movementType - Selected movement type
     */
    function updateFormForMovementType(movementType) {
        currentMovementType = movementType;

        // Hide all sections first
        hideAllFormSections();

        // Show common fields
        $('#sectionCommonFields').show();

        // Show type-specific fields
        switch (movementType) {
            case 'MoveIn':
                showMoveInFields();
                break;
            case 'MoveOut':
                showMoveOutFields();
                break;
            case 'Additional':
                showAdditionalFields();
                break;
            case 'Cut':
                showCutFields();
                break;
        }

        // Update form title
        const typeConfig = PE_MOVEMENT_TYPES[movementType.toUpperCase()];
        $('#lblMovementTypeTitle').html(`
            <span class="badge text-bg-${typeConfig.color}">
                <i class="${typeConfig.icon}"></i> ${typeConfig.label}
            </span>
        `);
    }

    /**
     * Hide all form sections
     */
    function hideAllFormSections() {
        $('#sectionCommonFields').hide();
        $('#sectionMoveIn').hide();
        $('#sectionMoveOut').hide();
        $('#sectionAdditional').hide();
        $('#sectionCut').hide();
        $('#sectionFileUpload').hide();
        $('#lblMovementTypeTitle').empty();
    }

    /**
     * Show Move In specific fields
     */
    function showMoveInFields() {
        $('#sectionMoveIn').show();

        // Populate From Cost Center dropdown
        populateCostCenterDropdown('#ddlFromCostCenter', costCenterOptions, currentData?.costCenterCode);
    }

    /**
     * Show Move Out specific fields
     */
    function showMoveOutFields() {
        $('#sectionMoveOut').show();

        // Populate To Cost Center dropdown
        populateCostCenterDropdown('#ddlToCostCenter', costCenterOptions, currentData?.costCenterCode);
    }

    /**
     * Show Additional specific fields
     */
    function showAdditionalFields() {
        $('#sectionAdditional').show();
        $('#sectionFileUpload').show();

        // Remark is required for Additional
        $('#txtRemark').attr('required', true);
    }

    /**
     * Show Cut specific fields
     */
    function showCutFields() {
        $('#sectionCut').show();
    }

    /**
     * Populate Cost Center dropdown
     * @param {string} selector - Dropdown selector
     * @param {Array} options - Options array (from API: costCenterCode, costCenterName)
     * @param {string} excludeCode - Code to exclude (current cost center)
     */
    function populateCostCenterDropdown(selector, options, excludeCode) {
        const $dropdown = $(selector);
        $dropdown.empty();
        $dropdown.append('<option value="">-- Select Cost Center --</option>');

        options.forEach(function (opt) {
            // API returns: { costCenterCode, costCenterName }
            const code = opt.costCenterCode || opt.code;
            const name = opt.costCenterName || opt.name;

            if (code !== excludeCode) {
                $dropdown.append(`<option value="${code}">${code} - ${name}</option>`);
            }
        });

        // Initialize Select2 if available
        if ($.fn.select2) {
            $dropdown.select2({
                placeholder: 'Search Cost Center...',
                allowClear: true,
                dropdownParent: $('#peMovementOffcanvas')
            });
        }
    }

    // ═══════════════════════════════════════════════════════
    // 📁 FILE UPLOAD HANDLING
    // ═══════════════════════════════════════════════════════

    /**
     * Handle file selection
     * @param {FileList} files - Selected files
     */
    function handleFileSelect(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = PECore.validateFile(file);

            if (!validation.isValid) {
                PECore.showToast(validation.error, 'error');
                continue;
            }

            // Check if file already added
            if (uploadedFiles.some(f => f.name === file.name)) {
                PECore.showToast('File already added', 'warning');
                continue;
            }

            uploadedFiles.push(file);
        }

        updateFileList();

        // Clear input
        $('#fileUpload').val('');
    }

    /**
     * Remove file from list
     * @param {number} index - File index
     */
    function removeFile(index) {
        uploadedFiles.splice(index, 1);
        updateFileList();
    }

    /**
     * Update file list display
     */
    function updateFileList() {
        const $fileList = $('#fileList');
        $fileList.empty();

        uploadedFiles.forEach(function (file, index) {
            const iconClass = PECore.getFileIcon(file.name);
            const fileSize = PECore.formatFileSize(file.size);

            $fileList.append(`
                <div class="file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                    <div class="d-flex align-items-center">
                        <i class="bi ${iconClass} fs-4 me-2"></i>
                        <div>
                            <div class="fw-medium">${file.name}</div>
                            <small class="text-muted">${fileSize}</small>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-remove-file" data-index="${index}">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `);
        });
    }

    // ═══════════════════════════════════════════════════════
    // 💾 SAVE OPERATIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Save movement transaction
     * Using Bootstrap Modal for confirmation (Ref: budget-planning)
     */
    function saveMovement() {
        // Step 1: Validate inputs
        if (!currentMovementType || !currentData) {
            PECore.showToast('Please select a movement type', 'warning');
            return;
        }

        // Clear previous validation
        clearValidation();

        // Build form data
        const formData = getFormData();

        // Debug: Log form data
        console.log('PE Management: Form data prepared', formData);

        // Step 2: Validate form data
        const validation = validateFormData(formData);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }

        // Step 3: Get movement type label
        const movementLabel = PE_MOVEMENT_TYPES[currentMovementType.toUpperCase()]?.label || currentMovementType;

        // Step 4: Show Bootstrap Modal Confirm
        PECore.showConfirmModal({
            title: 'Confirm Transaction',
            message: `Are you sure you want to create ${movementLabel} transaction?`,
            iconType: 'question',
            confirmText: 'Yes, Save',
            cancelText: 'Cancel',
            onConfirm: function () {
                // Execute save after confirmation
                executeSaveMovement(formData);
            },
            onCancel: function () {
                console.log('PE Management: Save cancelled by user');
            }
        });
    }

    /**
     * Execute save movement API call
     * @param {object} formData - Validated form data
     */
    async function executeSaveMovement(formData) {
        // Store costCenterCode before hiding (currentData will be cleared)
        const costCenterCode = currentData.costCenterCode;

        // Hide offcanvas first to avoid UI conflicts
        hide();

        // Show loading
        PECore.showLoading();

        try {
            let response;

            console.log('PE Management: Calling API for', currentMovementType);

            switch (currentMovementType) {
                case 'MoveIn':
                    response = await PEApi.moveIn(formData);
                    break;
                case 'MoveOut':
                    response = await PEApi.moveOut(formData);
                    break;
                case 'Additional':
                    response = await PEApi.additional(formData);
                    // Upload files after Additional transaction
                    if (response.success && uploadedFiles.length > 0) {
                        await uploadFilesForMovement(response.data?.movementId);
                    }
                    break;
                case 'Cut':
                    response = await PEApi.cut(formData);
                    break;
                default:
                    throw new Error('Invalid movement type');
            }

            console.log('PE Management: API response', response);

            if (response && response.success) {
                PECore.showToast('Transaction saved successfully!', 'success');
                // Trigger grid refresh
                $(document).trigger('pe:movementSaved', [costCenterCode]);
            } else {
                PECore.showToast(response?.message || 'Failed to save transaction', 'error');
            }
        } catch (error) {
            console.error('PE Management: Save movement error:', error);
            PECore.showToast(error.message || 'An error occurred while saving', 'error');
        } finally {
            PECore.hideLoading();
        }
    }

    /**
     * Get form data based on movement type
     * @returns {object} Form data
     */
    function getFormData() {
        const baseData = {
            peId: PECore.parseInt(currentData.peId),  // Required for all movement types (ensure int)
            peYear: PECore.parseInt(currentData.peYear) || PECore.getCurrentYear(),
            peMonth: PECore.parseInt(currentData.peMonth) || PECore.getCurrentMonth(),
            hc: PECore.parseInt($('#txtHC').val()),
            baseWage: PECore.parseDecimal($('#txtBaseWage').val()),
            remark: $('#txtRemark').val() || null
        };

        switch (currentMovementType) {
            case 'MoveIn':
                return {
                    ...baseData,
                    fromCostCenterCode: $('#ddlFromCostCenter').val()
                };
            case 'MoveOut':
                return {
                    ...baseData,
                    toCostCenterCode: $('#ddlToCostCenter').val()
                };
            case 'Additional':
                return baseData;
            case 'Cut':
                return baseData;
        }

        return baseData;
    }

    /**
     * Validate form data
     * @param {object} formData - Form data
     * @returns {object} Validation result
     */
    function validateFormData(formData) {
        switch (currentMovementType) {
            case 'MoveIn':
                return PECore.validateMoveInForm(formData);
            case 'MoveOut':
                return PECore.validateMoveOutForm(formData);
            case 'Additional':
                return PECore.validateAdditionalForm(formData);
            case 'Cut':
                return PECore.validateCutForm(formData);
        }

        return { isValid: false, errors: ['Invalid movement type'] };
    }

    /**
     * Upload files for movement
     * @param {string} movementId - Movement ID
     */
    async function uploadFilesForMovement(movementId) {
        for (const file of uploadedFiles) {
            try {
                await PEApi.uploadFile(movementId, file);
            } catch (error) {
                console.error('File upload error:', error);
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // ⚠️ VALIDATION DISPLAY
    // ═══════════════════════════════════════════════════════

    /**
     * Show validation errors
     * @param {Array} errors - Error messages
     */
    function showValidationErrors(errors) {
        const errorHtml = errors.map(e => `<li>${e}</li>`).join('');

        $('#validationErrors').html(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong><i class="bi bi-exclamation-triangle me-2"></i>Validation Errors</strong>
                <ul class="mb-0 mt-2">${errorHtml}</ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
    }

    /**
     * Clear validation messages
     */
    function clearValidation() {
        $('#validationErrors').empty();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    }

    // ═══════════════════════════════════════════════════════
    // 📜 TRANSACTION HISTORY OFFCANVAS
    // ═══════════════════════════════════════════════════════

    /**
     * Show transaction history offcanvas
     * @param {object} rowData - Grid row data
     */
    async function showHistory(rowData) {
        console.log('🔍 [showHistory] rowData:', rowData);
        console.log('🔍 [showHistory] costCenterCode:', rowData.costCenterCode);
        console.log('🔍 [showHistory] peYear:', rowData.peYear);
        try {
            const history = await PEApi.getTransactionHistory(rowData.costCenterCode, rowData.peYear);
            console.log('🔍 [showHistory] history result:', history);
            console.log('🔍 [showHistory] history length:', history.length);

            const historyHtml = history.length > 0
                ? buildHistoryTable(history)
                : '<div class="text-center text-muted p-4"><i class="fa-solid fa-inbox fs-1"></i><p>No transaction history found</p></div>';

            $('#peHistoryContent').html(historyHtml);
            $('#peHistoryOffcanvasTitle').text(`Transaction History - ${rowData.costCenterCode}`);

            const historyOffcanvas = new bootstrap.Offcanvas(document.getElementById('peHistoryOffcanvas'));
            historyOffcanvas.show();
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    /**
     * Build transaction history table
     * @param {Array} history - Transaction history array
     * @returns {string} Table HTML
     */
    function buildHistoryTable(history) {
        const rows = history.map(item => {
            // Get HC and BaseWage based on movement type
            let hc = 0;
            let baseWage = 0;

            switch (item.movementType) {
                case 'MoveOut':
                    hc = item.moveOutHc || 0;
                    baseWage = item.moveOutBaseWage || 0;
                    break;
                case 'MoveIn':
                    hc = item.moveInHc || 0;
                    baseWage = item.moveInBaseWage || 0;
                    break;
                case 'Additional':
                    hc = item.additionalHc || 0;
                    baseWage = item.additionalBaseWage || 0;
                    break;
                case 'Cut':
                    hc = item.cutHc || 0;
                    baseWage = item.cutBaseWage || 0;
                    break;
            }

            const remarkText = item.remark || '-';

            // Get approval status badge
            const approvalBadge = getApprovalStatusBadge(item.approvalStatus, item.rejectedReason);

            // Get approval action buttons (only for PENDING status)
            const actionButtons = getApprovalActionButtons(item);

            return `
                <tr data-movement-id="${item.id}">
                    <td class="text-nowrap">${PECore.formatDateTime(item.updatedDate)}</td>
                    <td class="text-nowrap">${PECore.getMovementTypeBadge(item.movementType)}</td>
                    <td class="text-end text-nowrap">${PECore.formatHC(hc)}</td>
                    <td class="text-end text-nowrap">${PECore.formatCurrency(baseWage)}</td>
                    <td class="remark-cell" title="${remarkText}">${remarkText}</td>
                    <td class="text-nowrap">${PECore.getStatusBadge(item.status)}</td>
                    <td class="text-nowrap">${approvalBadge}</td>
                    <td class="text-nowrap">${actionButtons}</td>
                    <td class="text-nowrap">${item.updatedBy || '-'}</td>
                </tr>
            `;
        }).join('');

        return `
            <style>
                .remark-cell {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                }
                .remark-cell:hover {
                    background-color: #f8f9fa;
                }
            </style>
            <div class="table-responsive">
                <table class="table table-sm table-hover">
                    <thead class="table-light">
                        <tr>
                            <th class="text-nowrap">Date</th>
                            <th class="text-nowrap">Type</th>
                            <th class="text-end text-nowrap">HC</th>
                            <th class="text-end text-nowrap">Base+Wage</th>
                            <th style="width: 200px;">Remark</th>
                            <th class="text-nowrap">Status</th>
                            <th class="text-nowrap">Approval</th>
                            <th class="text-nowrap">Action</th>
                            <th class="text-nowrap">Created By</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    /**
     * Get approval status badge HTML
     * @param {string} approvalStatus - PENDING, APPROVED, REJECTED
     * @param {string} rejectedReason - Rejection reason if rejected
     * @returns {string} Badge HTML
     */
    function getApprovalStatusBadge(approvalStatus, rejectedReason) {
        if (!approvalStatus) return '<span class="text-muted">-</span>';

        const config = PE_APPROVAL_STATUS[approvalStatus];
        if (!config) return `<span class="badge bg-secondary">${approvalStatus}</span>`;

        let badge = `<span class="badge ${config.bgClass}"><i class="${config.icon} me-1"></i>${config.labelEn}</span>`;

        // Add tooltip for rejected reason
        if (approvalStatus === 'REJECTED' && rejectedReason) {
            badge = `<span class="badge ${config.bgClass}" title="Reason: ${rejectedReason}" data-bs-toggle="tooltip">
                <i class="${config.icon} me-1"></i>${config.labelEn}
            </span>`;
        }

        return badge;
    }

    /**
     * Get approval action buttons for PENDING movements
     * @param {object} item - Movement history item
     * @returns {string} Action buttons HTML
     */
    function getApprovalActionButtons(item) {
        // Only show buttons for PENDING approval status
        if (item.approvalStatus !== 'PENDING') {
            return '<span class="text-muted">-</span>';
        }

        // Check if current user is the pending approver
        const currentUser = UserMenu.getUser();
        const currentEmpCode = currentUser?.empCode || '';

        // Only show Approve/Reject buttons if current user is the pending approver
        if (!item.pendingEmpCode || item.pendingEmpCode.toUpperCase() !== currentEmpCode.toUpperCase()) {
            return '<span class="text-warning" title="Waiting for approval from another user"><i class="fa-solid fa-clock"></i> Pending</span>';
        }

        return `
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-success btn-approve-history"
                        data-movement-id="${item.id}"
                        title="Approve">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button type="button" class="btn btn-danger btn-reject-history"
                        data-movement-id="${item.id}"
                        title="Reject">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        init,
        show,
        hide,
        showHistory,
        resetForm
    };
})();

// Initialize on document ready
$(document).ready(function () {
    PEOffcanvas.init();
});
