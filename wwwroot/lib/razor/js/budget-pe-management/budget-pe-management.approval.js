/**
 * PE Management Approval Module
 * Handles Movement Approval/Rejection in AG Grid
 *
 * Created: 12 Dec 2025
 * Author: Ten (AI Developer)
 */

const PEApproval = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 🎯 CELL RENDERERS
    // ═══════════════════════════════════════════════════════

    /**
     * Approval Status Cell Renderer
     * @param {object} params - AG Grid cell params
     * @returns {string} HTML content
     */
    function ApprovalStatusRenderer(params) {
        if (!params.data) return '';

        const status = params.data.approvalStatus;
        const requiresApproval = params.data.requiresApproval;

        // ถ้าไม่ต้องอนุมัติ (เช่น MoveIn, MoveOut, Cut)
        if (!requiresApproval) {
            return '<span class="text-muted">-</span>';
        }

        const config = PE_APPROVAL_STATUS[status?.toUpperCase()] || PE_APPROVAL_STATUS.PENDING;

        return `
            <span class="approval-status-badge ${config.badgeClass}">
                <i class="${config.icon}"></i>
                ${config.label}
            </span>
        `;
    }

    /**
     * Approval Action Cell Renderer
     * แสดงปุ่ม Accept/Reject สำหรับ Movement ที่รอการอนุมัติ
     * @param {object} params - AG Grid cell params
     * @returns {string} HTML content
     */
    function ApprovalActionRenderer(params) {
        if (!params.data) return '';

        const status = params.data.approvalStatus;
        const requiresApproval = params.data.requiresApproval;
        const movementId = params.data.movementId;

        // ถ้าไม่ต้องอนุมัติ หรือ อนุมัติ/ไม่อนุมัติแล้ว
        if (!requiresApproval || status !== 'Pending') {
            return '';
        }

        return `
            <div class="d-flex gap-1 align-items-center h-100">
                <button type="button" class="btn btn-sm btn-outline-success btn-approve-movement"
                        data-action="approve"
                        data-movement-id="${movementId}"
                        title="Accept">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-reject-movement"
                        data-action="reject"
                        data-movement-id="${movementId}"
                        title="Reject">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════
    // 🎯 ROW STYLING
    // ═══════════════════════════════════════════════════════

    /**
     * Get row class based on approval status
     * @param {object} params - AG Grid row params
     * @returns {string} CSS class name
     */
    function getRowClass(params) {
        if (!params.data) return '';

        const status = params.data.approvalStatus;
        const requiresApproval = params.data.requiresApproval;

        if (!requiresApproval) return '';

        const config = PE_APPROVAL_STATUS[status?.toUpperCase()];
        return config?.rowClass || '';
    }

    // ═══════════════════════════════════════════════════════
    // 📡 API FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Approve a movement
     * @param {number} movementId - Movement ID
     * @returns {Promise} API response
     */
    async function approveMovement(movementId) {
        try {
            const response = await fetch(`${PE_NOTIFICATION_API.approveMovement}/${movementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to approve movement');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Approve movement error:', error);
            throw error;
        }
    }

    /**
     * Reject a movement
     * @param {number} movementId - Movement ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} API response
     */
    async function rejectMovement(movementId, reason) {
        try {
            const response = await fetch(`${PE_NOTIFICATION_API.rejectMovement}/${movementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to reject movement');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Reject movement error:', error);
            throw error;
        }
    }

    /**
     * Get pending movements for approval
     * @param {object} filter - Filter options (companyId, budgetYear, costCenterCode)
     * @returns {Promise<Array>} Pending movements
     */
    async function getPendingMovements(filter = {}) {
        try {
            const params = new URLSearchParams();
            if (filter.companyId) params.append('companyId', filter.companyId);
            if (filter.budgetYear) params.append('budgetYear', filter.budgetYear);
            if (filter.costCenterCode) params.append('costCenterCode', filter.costCenterCode);

            const url = `${PE_NOTIFICATION_API.pendingMovements}?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch pending movements');
            }

            return await response.json();
        } catch (error) {
            console.error('Get pending movements error:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // 🎯 EVENT HANDLERS
    // ═══════════════════════════════════════════════════════

    /**
     * Handle Approve button click
     * @param {number} movementId - Movement ID
     * @param {object} rowNode - AG Grid row node
     */
    async function handleApprove(movementId, rowNode) {
        try {
            // Confirm
            const confirmed = await Swal.fire({
                title: 'ยืนยันการอนุมัติ',
                text: 'คุณต้องการอนุมัติรายการนี้หรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'อนุมัติ',
                cancelButtonText: 'ยกเลิก'
            });

            if (!confirmed.isConfirmed) return;

            // Show loading
            Swal.fire({
                title: 'กำลังดำเนินการ...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Call API
            await approveMovement(movementId);

            // Update row data
            if (rowNode) {
                rowNode.setDataValue('approvalStatus', 'Approved');
            }

            // Success message
            Swal.fire({
                icon: 'success',
                title: 'อนุมัติสำเร็จ',
                text: 'รายการได้รับการอนุมัติแล้ว',
                timer: 2000,
                showConfirmButton: false
            });

            // Refresh notification badge
            if (window.NotificationSystem) {
                window.NotificationSystem.refreshBadge();
            }

            // Trigger refresh event
            $(document).trigger('pe:approvalChanged');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถอนุมัติรายการได้'
            });
        }
    }

    /**
     * Handle Reject button click
     * @param {number} movementId - Movement ID
     * @param {object} rowNode - AG Grid row node
     */
    async function handleReject(movementId, rowNode) {
        try {
            // Show reason input
            const { value: reason, isConfirmed } = await Swal.fire({
                title: 'เหตุผลในการไม่อนุมัติ',
                input: 'textarea',
                inputLabel: 'กรุณาระบุเหตุผล',
                inputPlaceholder: 'เหตุผลที่ไม่อนุมัติ...',
                inputAttributes: {
                    'aria-label': 'เหตุผลที่ไม่อนุมัติ'
                },
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'ไม่อนุมัติ',
                cancelButtonText: 'ยกเลิก',
                inputValidator: (value) => {
                    if (!value || value.trim().length < 5) {
                        return 'กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร';
                    }
                }
            });

            if (!isConfirmed) return;

            // Show loading
            Swal.fire({
                title: 'กำลังดำเนินการ...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Call API
            await rejectMovement(movementId, reason);

            // Update row data
            if (rowNode) {
                rowNode.setDataValue('approvalStatus', 'Rejected');
                rowNode.setDataValue('rejectedReason', reason);
            }

            // Success message
            Swal.fire({
                icon: 'success',
                title: 'ดำเนินการสำเร็จ',
                text: 'รายการถูกปฏิเสธแล้ว',
                timer: 2000,
                showConfirmButton: false
            });

            // Refresh notification badge
            if (window.NotificationSystem) {
                window.NotificationSystem.refreshBadge();
            }

            // Trigger refresh event
            $(document).trigger('pe:approvalChanged');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถปฏิเสธรายการได้'
            });
        }
    }

    // ═══════════════════════════════════════════════════════
    // 🎨 ROW HIGHLIGHT
    // ═══════════════════════════════════════════════════════

    /**
     * Highlight a specific movement row (called from notification click)
     * @param {number} movementId - Movement ID to highlight
     */
    function highlightMovementRow(movementId) {
        const gridApi = window.PEGrid?.getGridApi?.();
        if (!gridApi) {
            console.warn('Grid API not available for highlighting');
            return;
        }

        // Find the row
        let targetNode = null;
        gridApi.forEachNode(node => {
            if (node.data?.movementId === movementId) {
                targetNode = node;
            }
        });

        if (targetNode) {
            // Scroll to the row
            gridApi.ensureNodeVisible(targetNode, 'middle');

            // Add highlight class
            const rowElement = document.querySelector(`[row-id="${targetNode.id}"]`);
            if (rowElement) {
                rowElement.classList.add('row-highlight');

                // Remove highlight after animation
                setTimeout(() => {
                    rowElement.classList.remove('row-highlight');
                }, 3000);
            }

            // Select the row
            targetNode.setSelected(true);
        } else {
            console.warn('Movement row not found:', movementId);
        }
    }

    // ═══════════════════════════════════════════════════════
    // 🔧 INITIALIZATION
    // ═══════════════════════════════════════════════════════

    /**
     * Initialize approval module
     * Bind event handlers
     */
    function init() {
        // Bind approve button click
        $(document).on('click', '.btn-approve-movement', function (e) {
            e.stopPropagation();
            const movementId = $(this).data('movement-id');
            const rowNode = getRowNodeFromElement(this);
            handleApprove(movementId, rowNode);
        });

        // Bind reject button click
        $(document).on('click', '.btn-reject-movement', function (e) {
            e.stopPropagation();
            const movementId = $(this).data('movement-id');
            const rowNode = getRowNodeFromElement(this);
            handleReject(movementId, rowNode);
        });

        // Export highlight function globally
        window.highlightMovementRow = highlightMovementRow;

        console.log('PE Approval: Module initialized');
    }

    /**
     * Get AG Grid row node from button element
     * @param {HTMLElement} element - Button element
     * @returns {object|null} Row node
     */
    function getRowNodeFromElement(element) {
        const gridApi = window.PEGrid?.getGridApi?.();
        if (!gridApi) return null;

        const rowElement = element.closest('.ag-row');
        if (!rowElement) return null;

        const rowId = rowElement.getAttribute('row-id');
        return gridApi.getRowNode(rowId);
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        init,
        ApprovalStatusRenderer,
        ApprovalActionRenderer,
        getRowClass,
        approveMovement,
        rejectMovement,
        getPendingMovements,
        handleApprove,
        handleReject,
        highlightMovementRow
    };
})();

// Initialize on document ready
$(document).ready(function () {
    PEApproval.init();
});

console.log('📦 budget-pe-management.approval.js loaded');
