/**
 * PE Management API Module
 * AJAX calls for PE Management operations
 *
 * Created: 3 Dec 2025
 * Author: Ten (AI Developer)
 */

const PEApi = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // 🔧 PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════

    /**
     * Make AJAX request with error handling
     * @param {object} options - AJAX options
     * @returns {Promise} AJAX promise
     */
    function makeRequest(options) {
        const defaults = {
            dataType: 'json',
            contentType: 'application/json',
            beforeSend: function () {
                PECore.showLoading();
            },
            complete: function () {
                PECore.hideLoading();
            }
        };

        return $.ajax({ ...defaults, ...options });
    }

    /**
     * Handle API error
     * @param {object} xhr - XHR object
     * @param {string} status - Status text
     * @param {string} error - Error message
     */
    function handleError(xhr, status, error) {
        console.error('API Error:', { xhr, status, error });

        let message = PE_MESSAGES.error.loadData;

        if (xhr.responseJSON && xhr.responseJSON.message) {
            message = xhr.responseJSON.message;
        } else if (xhr.status === 401) {
            message = 'Session expired. Please login again.';
        } else if (xhr.status === 403) {
            message = 'You do not have permission to perform this action.';
        } else if (xhr.status === 404) {
            message = 'Resource not found.';
        } else if (xhr.status === 500) {
            message = 'Internal server error. Please try again later.';
        }

        PECore.showToast(message, 'error');
    }

    // ═══════════════════════════════════════════════════════
    // 📊 DATA RETRIEVAL
    // ═══════════════════════════════════════════════════════

    /**
     * Get all PE Management data
     * @param {object} filter - Filter criteria { year, month, costCenter, company }
     * @returns {Promise<Array>} PE Management data array
     */
    function getAll(filter = {}) {
        return makeRequest({
            url: PE_API.getAll,
            method: 'GET',
            data: filter
        }).then(function (response) {
            if (response.success) {
                return response.data || [];
            }
            throw new Error(response.message || 'Failed to load data');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            return [];
        });
    }

    /**
     * Get PE Management data by Cost Center
     * @param {string} costCenterCode - Cost Center code
     * @param {string} year - Year (YYYY)
     * @returns {Promise<object>} PE Management data
     */
    function getByCostCenter(costCenterCode, year) {
        return makeRequest({
            url: PE_API.getByCostCenter,
            method: 'GET',
            data: { costCenterCode, year }
        }).then(function (response) {
            if (response.success) {
                return response.data;
            }
            throw new Error(response.message || 'Failed to load data');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            return null;
        });
    }

    /**
     * Get transaction history for a Cost Center
     * @param {string} costCenterCode - Cost Center code
     * @param {string} year - Year (YYYY)
     * @returns {Promise<Array>} Transaction history array
     */
    function getTransactionHistory(costCenterCode, year) {
        const requestUrl = `${PE_API.getTransactionHistory}/${costCenterCode}`;
        console.log('🔍 [API] getTransactionHistory called');
        console.log('🔍 [API] costCenterCode:', costCenterCode);
        console.log('🔍 [API] year:', year);
        console.log('🔍 [API] PE_API.getTransactionHistory:', PE_API.getTransactionHistory);
        console.log('🔍 [API] Full URL:', requestUrl);
        console.log('🔍 [API] Request data:', { peYear: year });

        return makeRequest({
            url: requestUrl,
            method: 'GET',
            data: { peYear: year }
        }).then(function (response) {
            console.log('🔍 [API] getTransactionHistory response:', response);
            if (response.success) {
                console.log('🔍 [API] Returning data:', response.data);
                return response.data || [];
            }
            throw new Error(response.message || 'Failed to load transaction history');
        }).catch(function (xhr, status, error) {
            console.error('🔍 [API] getTransactionHistory error:', { xhr, status, error });
            handleError(xhr, status, error);
            return [];
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📝 MOVEMENT TRANSACTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Create Move In transaction
     * @param {object} request - Move In request data
     * @returns {Promise<object>} Response
     */
    function moveIn(request) {
        return makeRequest({
            url: PE_API.moveIn,
            method: 'POST',
            data: JSON.stringify(request)
        }).then(function (response) {
            if (response.success) {
                PECore.showToast(PE_MESSAGES.success.moveIn, 'success');
                return response;
            }
            throw new Error(response.message || 'Move In failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    /**
     * Create Move Out transaction
     * @param {object} request - Move Out request data
     * @returns {Promise<object>} Response
     */
    function moveOut(request) {
        return makeRequest({
            url: PE_API.moveOut,
            method: 'POST',
            data: JSON.stringify(request)
        }).then(function (response) {
            if (response.success) {
                PECore.showToast(PE_MESSAGES.success.moveOut, 'success');
                return response;
            }
            throw new Error(response.message || 'Move Out failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    /**
     * Create Additional transaction
     * @param {object} request - Additional request data
     * @returns {Promise<object>} Response
     */
    function additional(request) {
        return makeRequest({
            url: PE_API.additional,
            method: 'POST',
            data: JSON.stringify(request)
        }).then(function (response) {
            if (response.success) {
                PECore.showToast(PE_MESSAGES.success.additional, 'success');
                return response;
            }
            throw new Error(response.message || 'Additional request failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    /**
     * Create Cut transaction
     * @param {object} request - Cut request data
     * @returns {Promise<object>} Response
     */
    function cut(request) {
        return makeRequest({
            url: PE_API.cut,
            method: 'POST',
            data: JSON.stringify(request)
        }).then(function (response) {
            if (response.success) {
                PECore.showToast(PE_MESSAGES.success.cut, 'success');
                return response;
            }
            throw new Error(response.message || 'Cut request failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📁 FILE UPLOAD
    // ═══════════════════════════════════════════════════════

    /**
     * Upload file for Additional transaction
     * @param {string} movementId - Movement ID
     * @param {File} file - File to upload
     * @returns {Promise<object>} Upload response
     */
    function uploadFile(movementId, file) {
        const formData = new FormData();
        formData.append('movementId', movementId);
        formData.append('file', file);

        return $.ajax({
            url: PE_API.uploadFile,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {
                PECore.showLoading();
            },
            complete: function () {
                PECore.hideLoading();
            }
        }).then(function (response) {
            if (response.success) {
                PECore.showToast('File uploaded successfully', 'success');
                return response;
            }
            throw new Error(response.message || 'File upload failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    /**
     * Download uploaded file
     * @param {number} uploadLogId - Upload Log ID
     */
    function downloadFile(uploadLogId) {
        window.open(`${PE_API.downloadFile}?uploadLogId=${uploadLogId}`, '_blank');
    }

    // ═══════════════════════════════════════════════════════
    // 📋 UPDATE OPERATIONS
    // ═══════════════════════════════════════════════════════

    /**
     * Update B0 values
     * @param {object} request - Update request { costCenterCode, year, b0Hc, b0BaseWage }
     * @returns {Promise<object>} Response
     */
    function updateB0(request) {
        return makeRequest({
            url: PE_API.updateB0,
            method: 'PUT',
            data: JSON.stringify(request)
        }).then(function (response) {
            if (response.success) {
                PECore.showToast('B0 updated successfully', 'success');
                return response;
            }
            throw new Error(response.message || 'Update failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    /**
     * Approve/Reject transaction
     * @param {string} movementId - Movement ID
     * @param {string} status - New status (Approved/Rejected)
     * @param {string} approver - Approver name
     * @returns {Promise<object>} Response
     */
    function approveTransaction(movementId, status, approver) {
        return makeRequest({
            url: PE_API.approveTransaction,
            method: 'PUT',
            data: JSON.stringify({ movementId, status, approver })
        }).then(function (response) {
            if (response.success) {
                PECore.showToast(`Transaction ${status.toLowerCase()} successfully`, 'success');
                return response;
            }
            throw new Error(response.message || 'Approval failed');
        }).catch(function (xhr, status, error) {
            handleError(xhr, status, error);
            throw error;
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📋 DROPDOWN DATA (B1 APIs)
    // ═══════════════════════════════════════════════════════

    /**
     * Get Company dropdown from HRB_PE_MANAGEMENT
     * @returns {Promise<Array>} Company options
     */
    function getCompanies() {
        return $.ajax({
            url: PE_API.b1Companies,
            method: 'GET',
            dataType: 'json'
        }).then(function (data) {
            // API returns array directly: [{ companyId, companyName }, ...]
            return data || [];
        }).catch(function (xhr, status, error) {
            console.error('Failed to load companies:', error);
            return [];
        });
    }

    /**
     * Get Year dropdown from HRB_PE_MANAGEMENT
     * @param {number} companyId - Company ID (optional)
     * @returns {Promise<Array>} Year options
     */
    function getYears(companyId) {
        const params = companyId ? { companyId: companyId } : {};
        return $.ajax({
            url: PE_API.b1Years,
            method: 'GET',
            data: params,
            dataType: 'json'
        }).then(function (data) {
            // API returns array directly: [2025, 2024, 2023, ...]
            return data || [];
        }).catch(function (xhr, status, error) {
            console.error('Failed to load years:', error);
            return [];
        });
    }

    /**
     * Get Month dropdown (Static)
     * @returns {Promise<Array>} Month options
     */
    function getMonths() {
        return $.ajax({
            url: PE_API.b1Months,
            method: 'GET',
            dataType: 'json'
        }).then(function (data) {
            // API returns array: [{ value, text, shortText }, ...]
            return data || [];
        }).catch(function (xhr, status, error) {
            console.error('Failed to load months:', error);
            return PE_MONTHS; // Fallback to config
        });
    }

    /**
     * Get Cost Center dropdown from HRB_PE_MANAGEMENT
     * @param {number} companyId - Company ID (optional)
     * @param {number} peYear - PE Year (optional)
     * @returns {Promise<Array>} Cost Center options
     */
    function getCostCenters(companyId, peYear) {
        const params = {};
        if (companyId) params.companyId = companyId;
        if (peYear) params.peYear = peYear;

        return $.ajax({
            url: PE_API.b1CostCenters,
            method: 'GET',
            data: params,
            dataType: 'json'
        }).then(function (data) {
            // API returns array: [{ costCenterCode, costCenterName }, ...]
            return data || [];
        }).catch(function (xhr, status, error) {
            console.error('Failed to load cost centers:', error);
            return [];
        });
    }

    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════

    return {
        // Data retrieval
        getAll,
        getByCostCenter,
        getTransactionHistory,

        // Movement transactions
        moveIn,
        moveOut,
        additional,
        cut,

        // File operations
        uploadFile,
        downloadFile,

        // Update operations
        updateB0,
        approveTransaction,

        // Dropdown data (B1)
        getCompanies,
        getYears,
        getMonths,
        getCostCenters
    };
})();
