// ═══════════════════════════════════════════════════════════════════
// 🎯 GENERIC SETTINGS MANAGER
// Handles CRUD operations for all Master/Config/Cost/Employee models
// ═══════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // 📋 CONFIGURATION (Using BudgetSettingsConfig)
    // ═══════════════════════════════════════════════════════════════════

    const MODEL_NAME = BudgetSettingsConfig.MODEL_NAME;
    const DISPLAY_NAME = BudgetSettingsConfig.DISPLAY_NAME;
    const SETTINGS_API = BudgetSettingsConfig.API;

    let gridApi = null;
    let columnDefs = [];
    let allColumns = [];
    let isEditMode = false;

    // ═══════════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', function () {
        console.log('Initializing Settings Manager for:', MODEL_NAME);

        loadColumnsAndData();
        attachEventListeners();
    });

    // ═══════════════════════════════════════════════════════════════════
    // 🏗️ AG GRID INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    async function loadColumnsAndData() {
        try {
            // Load column definitions
            const columnResponse = await fetch(`${SETTINGS_API.getcolumns}/${MODEL_NAME}`);

            if (!columnResponse.ok) {
                const errorText = await columnResponse.text();
                console.error('Column API Error:', errorText);
                showError(`Failed to load columns: ${columnResponse.status} - ${errorText}`);
                return;
            }

            const columnResult = await columnResponse.json();
            console.log('Column API Response:', columnResult);

            if (!columnResult.success) {
                showError('Failed to load column definitions: ' + (columnResult.message || 'Unknown error'));
                return;
            }

            allColumns = columnResult.columns;

            console.log('📋 All columns metadata:', allColumns);
            console.log('🔑 Column fields:', allColumns.map(c => c.field));

            // Create AG Grid column definitions (only AG Grid recognized properties)
            const gridColumns = allColumns
                .filter(col => !col.hide)
                .map(col => {
                    // Only include AG Grid recognized properties
                    const gridCol = {
                        field: col.field,
                        headerName: col.headerName,
                        width: col.width,
                        editable: col.editable,
                        filter: col.filter,
                        sortable: col.sortable,
                        resizable: col.resizable
                    };

                    // Add cellRenderer for boolean columns
                    if (col.dataType === 'boolean') {
                        gridCol.cellRenderer = params => {
                            if (params.value === null || params.value === undefined) return '';
                            return params.value ?
                                `<i class="${BudgetSettingsConfig.ICONS.checkSuccess}"></i>` :
                                `<i class="${BudgetSettingsConfig.ICONS.timesDanger}"></i>`;
                        };
                    }

                    // Add valueFormatter for date columns
                    if (col.dataType === 'date') {
                        gridCol.valueFormatter = params => {
                            if (!params.value) return '';
                            const date = new Date(params.value);
                            return date.toLocaleDateString(BudgetSettingsConfig.LOCALE.dateFormat);
                        };
                    }

                    return gridCol;
                });

            console.log('🎨 Grid columns (visible):', gridColumns);

            // Add Action columns at the beginning
            columnDefs = [
                {
                    headerName: BudgetSettingsConfig.GRID.actionColumn.headerName,
                    field: BudgetSettingsConfig.GRID.actionColumn.field,
                    width: BudgetSettingsConfig.GRID.actionColumn.width,
                    cellRenderer: function (params) {
                        return `
                            <button class="${BudgetSettingsConfig.CSS.btnEdit}"
                                    data-index="${params.rowIndex}"
                                    title="Edit">
                                <i class="${BudgetSettingsConfig.ICONS.edit}"></i>
                            </button>
                            <button class="${BudgetSettingsConfig.CSS.btnDelete}"
                                    data-index="${params.rowIndex}"
                                    title="Delete">
                                <i class="${BudgetSettingsConfig.ICONS.delete}"></i>
                            </button>
                        `;
                    },
                    editable: BudgetSettingsConfig.GRID.actionColumn.editable,
                    filter: BudgetSettingsConfig.GRID.actionColumn.filter,
                    sortable: BudgetSettingsConfig.GRID.actionColumn.sortable,
                    pinned: BudgetSettingsConfig.GRID.actionColumn.pinned
                },
                ...gridColumns
            ];

            console.log('✅ Final columnDefs:', columnDefs);
            console.log('📊 Column count:', columnDefs.length);

            // Initialize AG Grid
            initializeGrid();

            // Load data
            await loadData();

        } catch (error) {
            console.error('Error loading columns:', error);
            showError(BudgetSettingsConfig.MESSAGES.failedToInitializeGrid);
        }
    }

    function initializeGrid() {
        const gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: BudgetSettingsConfig.GRID.defaultColDef,
            rowData: [],
            pagination: BudgetSettingsConfig.GRID.pagination,
            paginationPageSize: BudgetSettingsConfig.GRID.paginationPageSize,
            paginationPageSizeSelector: BudgetSettingsConfig.GRID.paginationPageSizeSelector,
            rowSelection: BudgetSettingsConfig.GRID.rowSelection,
            animateRows: BudgetSettingsConfig.GRID.animateRows,
            suppressCellFocus: BudgetSettingsConfig.GRID.suppressCellFocus,
            enableCellTextSelection: BudgetSettingsConfig.GRID.enableCellTextSelection,
            onGridReady: (params) => {
                console.log('✅ Grid ready');
            }
        };

        const gridDiv = document.querySelector(BudgetSettingsConfig.DOM.gridContainer);
        if (!gridDiv) {
            console.error('❌ Grid container #myGrid not found!');
            return;
        }

        gridApi = agGrid.createGrid(gridDiv, gridOptions);

        if (!gridApi) {
            console.error('❌ Failed to create grid API');
            return;
        }

        // Expose gridApi to global scope for fullscreen module
        window.settingsGridApi = gridApi;

        console.log('✅ Grid initialized successfully');
        console.log('Grid API:', gridApi);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📊 DATA OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    async function loadData() {
        try {
            showLoadingOverlay(true);

            const response = await fetch(`${SETTINGS_API.getdata}/${MODEL_NAME}`);
            const result = await response.json();

            console.log('📊 Data API Response:', result);

            if (result.success && result.data && result.data.length > 0) {
                console.log('📋 Data received:', result.data.length, 'records');
                console.log('🔍 First record:', result.data[0]);
                console.log('🔑 Data fields:', Object.keys(result.data[0]));

                if (!gridApi) {
                    console.error('❌ Grid API not initialized!');
                    showError(BudgetSettingsConfig.MESSAGES.gridNotInitialized);
                    return;
                }

                console.log('⚙️ Setting rowData to grid...');
                gridApi.setGridOption('rowData', result.data);

                console.log('✅ Loaded', result.data.length, 'records for', MODEL_NAME);

                // Auto-fit columns after data is loaded
                setTimeout(() => {
                    if (gridApi) {
                        console.log('📏 Fitting columns to grid width');
                        gridApi.sizeColumnsToFit();
                    }
                }, BudgetSettingsConfig.TIMING.autoFitDelay);
            } else if (result.success && (!result.data || result.data.length === 0)) {
                console.log('ℹ️ No data returned from API');
                if (gridApi) {
                    gridApi.setGridOption('rowData', []);
                }
                showError(BudgetSettingsConfig.MESSAGES.noDataFound);
            } else {
                console.error('❌ API returned error:', result.message);
                showError('Failed to load data: ' + (result.message || 'Unknown error'));
            }

        } catch (error) {
            console.error('❌ Error loading data:', error);
            showError(BudgetSettingsConfig.MESSAGES.errorLoadingData + ': ' + error.message);
        } finally {
            showLoadingOverlay(false);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎨 OFFCANVAS OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    function getOffcanvasInstance() {
        const offcanvasElement = document.getElementById(BudgetSettingsConfig.DOM.formOffcanvas);
        if (!offcanvasElement) {
            console.error('❌ Offcanvas element not found!');
            return null;
        }

        // Try CoreUI first
        var coreuiObj = window.coreui || window.CoreUI;
        if (coreuiObj && coreuiObj.Offcanvas && typeof coreuiObj.Offcanvas.getOrCreateInstance === 'function') {
            return coreuiObj.Offcanvas.getOrCreateInstance(offcanvasElement);
        }

        // Fallback to Bootstrap
        if (window.bootstrap && window.bootstrap.Offcanvas && typeof window.bootstrap.Offcanvas.getOrCreateInstance === 'function') {
            return window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
        }

        console.error('❌ Offcanvas library not found!');
        alert(BudgetSettingsConfig.MESSAGES.offcanvasNotLoaded);
        return null;
    }

    function openAddForm() {
        isEditMode = false;
        document.getElementById(BudgetSettingsConfig.DOM.formOffcanvasLabel).textContent = BudgetSettingsConfig.MESSAGES.addTitle(DISPLAY_NAME);
        document.getElementById(BudgetSettingsConfig.DOM.recordId).value = '';
        document.getElementById(BudgetSettingsConfig.DOM.crudForm).reset();

        generateFormFields();

        const offcanvas = getOffcanvasInstance();
        if (offcanvas) {
            offcanvas.show();
        }
    }

    function openEditForm(rowData) {
        isEditMode = true;
        document.getElementById(BudgetSettingsConfig.DOM.formOffcanvasLabel).textContent = BudgetSettingsConfig.MESSAGES.editTitle(DISPLAY_NAME);

        generateFormFields(rowData);

        // Set form values
        const form = document.getElementById(BudgetSettingsConfig.DOM.crudForm);
        allColumns.forEach(col => {
            const input = form.querySelector(`[name="${col.field}"]`);
            if (input && rowData[col.field] !== undefined) {
                if (col.dataType === 'boolean') {
                    input.checked = rowData[col.field];
                } else if (col.dataType === 'date' && rowData[col.field]) {
                    // Format date to YYYY-MM-DD
                    const date = new Date(rowData[col.field]);
                    input.value = date.toISOString().split('T')[0];
                } else {
                    input.value = rowData[col.field] || '';
                }
            }
        });

        const offcanvas = getOffcanvasInstance();
        if (offcanvas) {
            offcanvas.show();
        }
    }

    function generateFormFields(rowData = null) {
        const container = document.getElementById(BudgetSettingsConfig.DOM.formFields);
        container.innerHTML = '';

        allColumns.forEach(col => {
            // Store primary key as hidden field in edit mode
            if (col.isPrimaryKey) {
                if (isEditMode && rowData) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = col.field;
                    hiddenInput.value = rowData[col.field];
                    container.appendChild(hiddenInput);
                }
                return; // Don't show primary key in form
            }

            // Skip audit fields
            if (BudgetSettingsConfig.FIELD_FILTERS.auditFields.some(field => col.field.includes(field))) {
                return;
            }

            const fieldDiv = document.createElement('div');
            fieldDiv.className = BudgetSettingsConfig.CSS.mb3;

            const label = document.createElement('label');
            label.className = BudgetSettingsConfig.CSS.formLabel;
            label.textContent = col.headerName;
            if (col.isRequired) {
                label.innerHTML += ' <span class="text-danger">*</span>';
            }

            let input;

            if (col.dataType === 'boolean') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = BudgetSettingsConfig.CSS.formCheckInput;
                input.name = col.field;
                input.id = col.field;

                const checkDiv = document.createElement('div');
                checkDiv.className = BudgetSettingsConfig.CSS.formCheck;
                checkDiv.appendChild(input);
                checkDiv.appendChild(label);
                fieldDiv.appendChild(checkDiv);
            } else {
                fieldDiv.appendChild(label);

                if (col.dataType === 'date') {
                    input = document.createElement('input');
                    input.type = 'date';
                    input.className = BudgetSettingsConfig.CSS.formControl;
                } else if (col.dataType === 'number') {
                    input = document.createElement('input');
                    input.type = 'number';
                    input.className = BudgetSettingsConfig.CSS.formControl;
                    input.step = 'any'; // Allow decimals
                } else {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.className = BudgetSettingsConfig.CSS.formControl;
                    if (col.maxLength) {
                        input.maxLength = col.maxLength;
                    }
                }

                input.name = col.field;
                input.id = col.field;
                input.disabled = col.isPrimaryKey && isEditMode;
                input.required = col.isRequired && !col.isPrimaryKey;

                fieldDiv.appendChild(input);
            }

            container.appendChild(fieldDiv);
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 💾 CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    async function handleFormSubmit(event) {
        event.preventDefault();

        const form = document.getElementById(BudgetSettingsConfig.DOM.crudForm);
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to object (includes hidden fields)
        for (const [key, value] of formData.entries()) {
            const col = allColumns.find(c => c.field === key);
            if (col) {
                if (col.dataType === 'boolean') {
                    data[key] = form.querySelector(`[name="${key}"]`).checked;
                } else if (col.dataType === 'number') {
                    data[key] = value ? parseFloat(value) : null;
                } else {
                    data[key] = value || null;
                }
            } else {
                // Include hidden fields (like primary keys) even if not in allColumns visible list
                data[key] = value;
            }
        }

        console.log('Submitting data:', data); // Debug log

        try {
            showSaveSpinner(true);

            let response;
            if (isEditMode) {
                response = await fetch(`${SETTINGS_API.update}/${MODEL_NAME}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(`${SETTINGS_API.create}/${MODEL_NAME}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            const result = await response.json();

            if (result.success) {
                showSuccess(result.message || (isEditMode ? BudgetSettingsConfig.MESSAGES.updateSuccess : BudgetSettingsConfig.MESSAGES.createSuccess));
                const offcanvas = getOffcanvasInstance();
                if (offcanvas) {
                    offcanvas.hide();
                }
                await loadData();
            } else {
                showError(result.message || BudgetSettingsConfig.MESSAGES.operationFailed);
            }

        } catch (error) {
            console.error('Error saving record:', error);
            showError(BudgetSettingsConfig.MESSAGES.errorSavingRecord);
        } finally {
            showSaveSpinner(false);
        }
    }

    async function handleDelete(rowData) {
        // Show confirmation modal
        if (!await showConfirmDialog(
            BudgetSettingsConfig.MESSAGES.confirmDeleteTitle,
            BudgetSettingsConfig.MESSAGES.confirmDeleteMessage(DISPLAY_NAME),
            BudgetSettingsConfig.MESSAGES.confirmDeleteButton,
            BudgetSettingsConfig.CSS.btnDanger
        )) {
            return;
        }

        try {
            showLoadingOverlay(true);

            // Build query string with all primary key values
            const primaryKeyCols = allColumns.filter(c => c.isPrimaryKey);
            const queryParams = primaryKeyCols.map(col => {
                const value = rowData[col.field];
                return `${encodeURIComponent(col.field)}=${encodeURIComponent(value)}`;
            }).join('&');

            const response = await fetch(`${SETTINGS_API.delete}/${MODEL_NAME}?${queryParams}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showSuccess(BudgetSettingsConfig.MESSAGES.deleteSuccess);
                await loadData();
            } else {
                showError(result.message || BudgetSettingsConfig.MESSAGES.deleteFailed);
            }

        } catch (error) {
            console.error('Error deleting record:', error);
            showError(BudgetSettingsConfig.MESSAGES.errorDeletingRecord);
        } finally {
            showLoadingOverlay(false);
        }
    }

    function showConfirmDialog(title, message, confirmText = 'Confirm', confirmClass = BudgetSettingsConfig.CSS.btnDanger) {
        return new Promise((resolve) => {
            // Create modal HTML
            const modalHtml = `
                <div class="modal fade" id="${BudgetSettingsConfig.DOM.confirmModal}" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmModalLabel">${title}</h5>
                                <button type="button" class="btn-close" data-coreui-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${message}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="${BudgetSettingsConfig.CSS.btnSecondary}" data-coreui-dismiss="modal">${BudgetSettingsConfig.MESSAGES.cancelButton}</button>
                                <button type="button" class="btn ${confirmClass}" id="${BudgetSettingsConfig.DOM.confirmBtn}">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to body
            const modalWrapper = document.createElement('div');
            modalWrapper.innerHTML = modalHtml;
            const modalElement = modalWrapper.firstElementChild;
            document.body.appendChild(modalElement);

            // Initialize modal
            if (typeof coreui !== 'undefined' && coreui.Modal) {
                const modal = new coreui.Modal(modalElement);
                modal.show();

                // Handle confirm button
                document.getElementById(BudgetSettingsConfig.DOM.confirmBtn).addEventListener('click', function () {
                    modal.hide();
                    resolve(true);
                });

                // Handle cancel/close
                modalElement.addEventListener('hidden.coreui.modal', function () {
                    modalElement.remove();
                    resolve(false);
                });
            } else {
                // Fallback to native confirm
                modalElement.remove();
                resolve(confirm(message));
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎯 EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════════

    function attachEventListeners() {
        // Add button
        document.getElementById(BudgetSettingsConfig.DOM.btnAdd)?.addEventListener('click', function() {
            console.log('🖱️ Add button clicked');
            openAddForm();
        });

        // Refresh button
        document.getElementById(BudgetSettingsConfig.DOM.btnRefresh)?.addEventListener('click', loadData);

        // Form submit
        document.getElementById(BudgetSettingsConfig.DOM.crudForm)?.addEventListener('submit', handleFormSubmit);

        // Offcanvas close button (X)
        const closeBtn = document.querySelector(`#${BudgetSettingsConfig.DOM.formOffcanvas} .btn-close`);
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                console.log('🔒 Close button clicked - hiding offcanvas');
                const instance = getOffcanvasInstance();
                if (instance) {
                    instance.hide();
                }
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById(BudgetSettingsConfig.DOM.cancelBtn);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                console.log('❌ Cancel button clicked - hiding offcanvas');
                const instance = getOffcanvasInstance();
                if (instance) {
                    instance.hide();
                }
            });
        }

        // Global event delegation for Edit/Delete buttons in AG Grid
        document.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');

            if (editBtn) {
                const rowIndex = editBtn.getAttribute('data-index');
                if (rowIndex !== null && gridApi) {
                    const rowData = gridApi.getDisplayedRowAtIndex(Number(rowIndex))?.data;
                    if (rowData) {
                        console.log('✏️ Edit button clicked for row:', rowIndex, rowData);
                        openEditForm(rowData);
                    }
                }
            }

            if (deleteBtn) {
                const rowIndex = deleteBtn.getAttribute('data-index');
                if (rowIndex !== null && gridApi) {
                    const rowData = gridApi.getDisplayedRowAtIndex(Number(rowIndex))?.data;
                    if (rowData) {
                        console.log('🗑️ Delete button clicked for row:', rowIndex, rowData);
                        handleDelete(rowData);
                    }
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎨 UI HELPERS
    // ═══════════════════════════════════════════════════════════════════

    function showLoadingOverlay(show) {
        if (gridApi) {
            if (show) {
                gridApi.showLoadingOverlay();
            } else {
                gridApi.hideOverlay();
            }
        }
    }

    function showSaveSpinner(show) {
        const spinner = document.getElementById(BudgetSettingsConfig.DOM.saveSpinner);
        const saveText = document.getElementById(BudgetSettingsConfig.DOM.saveText);
        const saveBtn = document.getElementById(BudgetSettingsConfig.DOM.btnSave);

        if (spinner) spinner.classList.toggle('d-none', !show);
        if (saveText) saveText.innerHTML = show ? BudgetSettingsConfig.MESSAGES.saving : `<i class="${BudgetSettingsConfig.ICONS.save}"></i> Save`;
        if (saveBtn) saveBtn.disabled = show;
    }

    function showSuccess(message) {
        console.log('✅ Success:', message);

        // Create toast notification
        const toastHtml = `
            <div class="${BudgetSettingsConfig.CSS.toastSuccess}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="${BudgetSettingsConfig.ICONS.checkCircle}"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-coreui-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        showToast(toastHtml);
    }

    function showError(message) {
        console.error('❌ Error:', message);

        // Create toast notification
        const toastHtml = `
            <div class="${BudgetSettingsConfig.CSS.toastDanger}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="${BudgetSettingsConfig.ICONS.exclamationCircle}"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-coreui-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        showToast(toastHtml);
    }

    function showToast(toastHtml) {
        // Get or create toast container
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = BudgetSettingsConfig.CSS.toastContainer;
            toastContainer.style.zIndex = BudgetSettingsConfig.TOAST.zIndex;
            document.body.appendChild(toastContainer);
        }

        // Add toast to container
        const toastWrapper = document.createElement('div');
        toastWrapper.innerHTML = toastHtml;
        const toastElement = toastWrapper.firstElementChild;
        toastContainer.appendChild(toastElement);

        // Initialize and show toast
        if (typeof coreui !== 'undefined' && coreui.Toast) {
            const toast = new coreui.Toast(toastElement, {
                autohide: BudgetSettingsConfig.TOAST.autohide,
                delay: BudgetSettingsConfig.TOAST.delay
            });
            toast.show();

            // Remove toast after it's hidden
            toastElement.addEventListener('hidden.coreui.toast', function () {
                toastElement.remove();
            });
        }
    }

})();
