/**
 * Role Management JavaScript
 * จัดการ Roles และ Permission Assignment
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // Global Variables
    // ═══════════════════════════════════════════════════════════════════════════
    let roleGrid = null;
    let roleFormOffcanvas = null;
    let isEditing = false;
    let allPermissions = [];
    let permissionCategories = [];

    // Get base URL from global config (supports IIS virtual directory)
    const ROLE_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

    // ═══════════════════════════════════════════════════════════════════════════
    // API Endpoints
    // ═══════════════════════════════════════════════════════════════════════════
    const API = {
        roles: {
            list: ROLE_API_BASE + 'role/GetAll',
            get: (id) => ROLE_API_BASE + `role/Get/${id}`,
            create: ROLE_API_BASE + 'role/Create',
            update: (id) => ROLE_API_BASE + `role/Update/${id}`,
            delete: (id) => ROLE_API_BASE + `role/Delete/${id}`
        },
        permissions: {
            list: ROLE_API_BASE + 'role/GetPermissions'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Initialization
    // ═══════════════════════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', async function() {
        initializeComponents();
        await loadPermissions();
        initializeRoleGrid();
        initializeEventHandlers();
    });

    function initializeComponents() {
        roleFormOffcanvas = new bootstrap.Offcanvas(document.getElementById('roleFormOffcanvas'));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Load Permissions
    // ═══════════════════════════════════════════════════════════════════════════
    async function loadPermissions() {
        try {
            const response = await fetch(API.permissions.list);
            const result = await response.json();

            if (result.success) {
                allPermissions = result.data;

                // Group by category
                permissionCategories = groupPermissionsByCategory(allPermissions);

                // Build permission checkboxes
                buildPermissionAccordion();
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        }
    }

    function groupPermissionsByCategory(permissions) {
        const categories = {};

        permissions.forEach(perm => {
            const category = perm.category || 'Other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(perm);
        });

        return categories;
    }

    function buildPermissionAccordion() {
        const accordion = document.getElementById('permissionAccordion');
        accordion.innerHTML = '';

        Object.keys(permissionCategories).sort().forEach((category, index) => {
            const permissions = permissionCategories[category];
            const categoryId = category.replace(/[^a-zA-Z0-9]/g, '_');

            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.innerHTML = `
                <h2 class="accordion-header" id="heading_${categoryId}">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapse_${categoryId}">
                        <span class="badge bg-secondary me-2">${permissions.length}</span>
                        ${getCategoryDisplayName(category)}
                    </button>
                </h2>
                <div id="collapse_${categoryId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
                     data-bs-parent="#permissionAccordion">
                    <div class="accordion-body p-2">
                        <div class="row g-2">
                            ${permissions.map(perm => `
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input permission-checkbox" type="checkbox"
                                               value="${perm.permissionId}" id="perm_${perm.permissionId}">
                                        <label class="form-check-label small" for="perm_${perm.permissionId}">
                                            <strong>${perm.permissionCode}</strong>
                                            <br><span class="text-muted">${perm.permissionNameTh || perm.permissionName}</span>
                                        </label>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-2 pt-2 border-top">
                            <button type="button" class="btn btn-link btn-sm text-primary p-0"
                                    onclick="RoleManagement.selectAllCategory('${categoryId}')">
                                <i class="fa-solid fa-check-double"></i> Select All
                            </button>
                            <button type="button" class="btn btn-link btn-sm text-secondary p-0 ms-3"
                                    onclick="RoleManagement.deselectAllCategory('${categoryId}')">
                                <i class="fa-solid fa-times"></i> Deselect All
                            </button>
                        </div>
                    </div>
                </div>
            `;
            accordion.appendChild(item);
        });
    }

    function getCategoryDisplayName(category) {
        const names = {
            'PAGE': 'Page Access',
            'FEATURE': 'Features',
            'DATA': 'Data Access',
            'ADMIN': 'Administration',
            'REPORT': 'Reports',
            'BUDGET': 'Budget Management'
        };
        return names[category] || category;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Role Grid (AG Grid)
    // ═══════════════════════════════════════════════════════════════════════════
    function initializeRoleGrid() {
        const gridDiv = document.getElementById('roleGrid');

        const columnDefs = [
            {
                headerName: 'Action',
                field: 'actions',
                width: 100,
                sortable: false,
                filter: false,
                cellRenderer: actionsCellRenderer,
                pinned: 'left'
            },
            { headerName: 'Role Code', field: 'roleCode', minWidth: 120, filter: 'agTextColumnFilter' },
            { headerName: 'Role Name', field: 'roleName', minWidth: 150, filter: 'agTextColumnFilter' },
            { headerName: 'Role Name (TH)', field: 'roleNameTh', minWidth: 150, filter: 'agTextColumnFilter' },
            { headerName: 'Level', field: 'roleLevel', width: 80 },
            {
                headerName: 'System',
                field: 'isSystem',
                width: 90,
                cellRenderer: params => {
                    return params.value ?
                        '<span class="badge bg-warning">System</span>' :
                        '<span class="badge bg-secondary">Custom</span>';
                }
            },
            {
                headerName: 'Status',
                field: 'isActive',
                width: 90,
                cellRenderer: params => {
                    return params.value ?
                        '<span class="badge bg-success">Active</span>' :
                        '<span class="badge bg-danger">Inactive</span>';
                }
            }
        ];

        const gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: {
                resizable: true,
                sortable: true
            },
            rowData: [],
            rowSelection: 'single',
            animateRows: true,
            pagination: true,
            paginationPageSize: 20,
            onGridReady: onGridReady,
            onRowDoubleClicked: onRowDoubleClicked
        };

        roleGrid = agGrid.createGrid(gridDiv, gridOptions);
    }

    function actionsCellRenderer(params) {
        const roleId = params.data.roleId;
        const isSystem = params.data.isSystem;

        let html = `
            <button type="button" class="btn btn-sm btn-outline-primary me-1"
                    onclick="RoleManagement.editRole(${roleId})" title="Edit">
                <i class="fa-solid fa-edit"></i>
            </button>
        `;

        // Don't allow deleting system roles
        if (!isSystem) {
            html += `
                <button type="button" class="btn btn-sm btn-outline-danger"
                        onclick="RoleManagement.deleteRole(${roleId})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
        }

        return html;
    }

    async function onGridReady(params) {
        await loadRoleData();
    }

    function onRowDoubleClicked(params) {
        editRole(params.data.roleId);
    }

    async function loadRoleData() {
        try {
            showLoading();

            const response = await fetch(API.roles.list);
            const result = await response.json();

            if (result.success) {
                roleGrid.setGridOption('rowData', result.data);
            } else {
                showToast('error', result.message || 'Failed to load roles');
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            showToast('error', 'Failed to load roles');
        } finally {
            hideLoading();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Event Handlers
    // ═══════════════════════════════════════════════════════════════════════════
    function initializeEventHandlers() {
        // Add Role button
        document.getElementById('btnAddRole').addEventListener('click', showAddRoleForm);

        // Refresh button
        document.getElementById('btnRefresh').addEventListener('click', loadRoleData);

        // Form close buttons
        document.getElementById('closeRoleFormBtn').addEventListener('click', closeRoleForm);
        document.getElementById('cancelRoleBtn').addEventListener('click', closeRoleForm);

        // Save role
        document.getElementById('roleForm').addEventListener('submit', saveRole);

        // Export Excel
        document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Role Form Functions
    // ═══════════════════════════════════════════════════════════════════════════
    function showAddRoleForm() {
        isEditing = false;
        document.getElementById('formTitleText').textContent = 'Add Role';
        document.getElementById('roleForm').reset();
        document.getElementById('roleId').value = '0';
        document.getElementById('roleLevel').value = '100';

        // Reset permission checkboxes
        document.querySelectorAll('.permission-checkbox').forEach(cb => cb.checked = false);

        // Enable role code field
        document.getElementById('roleCode').disabled = false;

        roleFormOffcanvas.show();
    }

    async function editRole(roleId) {
        try {
            showLoading();
            isEditing = true;

            const response = await fetch(API.roles.get(roleId));
            const result = await response.json();

            if (result.success) {
                const role = result.data;

                document.getElementById('formTitleText').textContent = 'Edit Role';
                document.getElementById('roleId').value = role.roleId;
                document.getElementById('roleCode').value = role.roleCode || '';
                document.getElementById('roleName').value = role.roleName || '';
                document.getElementById('roleNameTh').value = role.roleNameTh || '';
                document.getElementById('roleLevel').value = role.roleLevel || 100;
                document.getElementById('isActive').checked = role.isActive;
                document.getElementById('isSystem').checked = role.isSystem;

                // Disable role code for system roles
                document.getElementById('roleCode').disabled = role.isSystem;

                // Set permission checkboxes
                document.querySelectorAll('.permission-checkbox').forEach(cb => {
                    const permId = parseInt(cb.value);
                    cb.checked = (role.permissions || []).some(p => p.permissionId === permId);
                });

                roleFormOffcanvas.show();
            } else {
                showToast('error', result.message || 'Failed to load role');
            }
        } catch (error) {
            console.error('Error loading role:', error);
            showToast('error', 'Failed to load role details');
        } finally {
            hideLoading();
        }
    }

    function closeRoleForm() {
        roleFormOffcanvas.hide();
    }

    async function saveRole(e) {
        e.preventDefault();

        const form = document.getElementById('roleForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        try {
            showSaving(true);

            // Get selected permissions
            const selectedPermissions = Array.from(document.querySelectorAll('.permission-checkbox:checked'))
                .map(cb => parseInt(cb.value));

            const roleData = {
                roleId: parseInt(document.getElementById('roleId').value) || 0,
                roleCode: document.getElementById('roleCode').value,
                roleName: document.getElementById('roleName').value,
                roleNameTh: document.getElementById('roleNameTh').value || null,
                roleLevel: parseInt(document.getElementById('roleLevel').value) || 100,
                isActive: document.getElementById('isActive').checked,
                isSystem: document.getElementById('isSystem').checked,
                permissionIds: selectedPermissions
            };

            const url = isEditing ? API.roles.update(roleData.roleId) : API.roles.create;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData)
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', isEditing ? 'Role updated successfully' : 'Role created successfully');
                closeRoleForm();
                loadRoleData();
            } else {
                showToast('error', result.message || 'Failed to save role');
            }
        } catch (error) {
            console.error('Error saving role:', error);
            showToast('error', 'Failed to save role');
        } finally {
            showSaving(false);
        }
    }

    async function deleteRole(roleId) {
        const confirmed = await showConfirm('Delete Role', 'Are you sure you want to delete this role? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const response = await fetch(API.roles.delete(roleId), {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', 'Role deleted successfully');
                loadRoleData();
            } else {
                showToast('error', result.message || 'Failed to delete role');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            showToast('error', 'Failed to delete role');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Permission Selection Helpers
    // ═══════════════════════════════════════════════════════════════════════════
    function selectAllCategory(categoryId) {
        const container = document.getElementById(`collapse_${categoryId}`);
        if (container) {
            container.querySelectorAll('.permission-checkbox').forEach(cb => cb.checked = true);
        }
    }

    function deselectAllCategory(categoryId) {
        const container = document.getElementById(`collapse_${categoryId}`);
        if (container) {
            container.querySelectorAll('.permission-checkbox').forEach(cb => cb.checked = false);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Export Functions
    // ═══════════════════════════════════════════════════════════════════════════
    async function exportToExcel() {
        const rows = [];
        roleGrid.forEachNode(node => rows.push(node.data));

        if (rows.length === 0) {
            showToast('warning', 'No data to export');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Roles');

        worksheet.columns = [
            { header: 'Role Code', key: 'roleCode', width: 15 },
            { header: 'Role Name', key: 'roleName', width: 25 },
            { header: 'Role Name (TH)', key: 'roleNameTh', width: 25 },
            { header: 'Level', key: 'roleLevel', width: 10 },
            { header: 'System', key: 'isSystem', width: 10 },
            { header: 'Status', key: 'isActive', width: 10 }
        ];

        rows.forEach(row => {
            worksheet.addRow({
                roleCode: row.roleCode,
                roleName: row.roleName,
                roleNameTh: row.roleNameTh,
                roleLevel: row.roleLevel,
                isSystem: row.isSystem ? 'Yes' : 'No',
                isActive: row.isActive ? 'Active' : 'Inactive'
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `Roles_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UI Helpers
    // ═══════════════════════════════════════════════════════════════════════════
    function showLoading() {
        document.getElementById('gridLoadingSpinner').classList.remove('d-none');
    }

    function hideLoading() {
        document.getElementById('gridLoadingSpinner').classList.add('d-none');
    }

    function showSaving(saving) {
        const spinner = document.getElementById('saveSpinner');
        const text = document.getElementById('saveText');
        const btn = document.getElementById('btnSaveRole');

        if (saving) {
            spinner.classList.remove('d-none');
            text.textContent = 'Saving...';
            btn.disabled = true;
        } else {
            spinner.classList.add('d-none');
            text.innerHTML = '<i class="fa-solid fa-save"></i> Save Role';
            btn.disabled = false;
        }
    }

    function showToast(type, message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Warning',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert(message);
        }
    }

    function showConfirm(title, text) {
        return new Promise((resolve) => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: title,
                    text: text,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(result => resolve(result.isConfirmed));
            } else {
                resolve(confirm(text));
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Expose Global Functions
    // ═══════════════════════════════════════════════════════════════════════════
    window.RoleManagement = {
        editRole,
        deleteRole,
        selectAllCategory,
        deselectAllCategory
    };

})();
