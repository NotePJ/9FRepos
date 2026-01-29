/**
 * User Management JavaScript
 * จัดการ User, Role Assignment และ Data Access
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // Global Variables
    // ═══════════════════════════════════════════════════════════════════════════
    let userGrid = null;
    let dataAccessGrid = null;
    let userFormOffcanvas = null;
    let dataAccessModal = null;
    let resetPasswordModal = null;
    let isEditing = false;
    let allRoles = [];
    let allCompanies = [];
    let allCostCenters = [];
    let tempDataAccess = []; // Temporary storage for data access before save

    // Get base URL from global config (supports IIS virtual directory)
    const USER_API_BASE = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

    // ═══════════════════════════════════════════════════════════════════════════
    // API Endpoints
    // ═══════════════════════════════════════════════════════════════════════════
    const API = {
        users: {
            list: USER_API_BASE + 'auth/users',
            get: (id) => USER_API_BASE + `auth/users/${id}`,
            create: USER_API_BASE + 'auth/users',
            update: (id) => USER_API_BASE + `auth/users/${id}`,
            delete: (id) => USER_API_BASE + `auth/users/${id}`,
            resetPassword: (id) => USER_API_BASE + `auth/users/${id}/reset-password`,
            toggleActive: (id) => USER_API_BASE + `auth/users/${id}/toggle-active`
        },
        roles: {
            list: USER_API_BASE + 'role/list'
        },
        companies: {
            list: USER_API_BASE + 'select/companies'
        },
        costCenters: {
            list: USER_API_BASE + 'select/costcenters'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Initialization
    // ═══════════════════════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', async function() {
        initializeComponents();
        await loadLookupData();
        initializeUserGrid();
        initializeDataAccessGrid();
        initializeEventHandlers();
    });

    function initializeComponents() {
        // Initialize Bootstrap components
        userFormOffcanvas = new bootstrap.Offcanvas(document.getElementById('userFormOffcanvas'));
        dataAccessModal = new bootstrap.Modal(document.getElementById('dataAccessModal'));
        resetPasswordModal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Load Lookup Data
    // ═══════════════════════════════════════════════════════════════════════════
    async function loadLookupData() {
        try {
            showLoading();

            // Load roles, companies, and cost centers in parallel
            const [rolesRes, companiesRes, costCentersRes] = await Promise.all([
                fetch(API.roles.list),
                fetch(API.companies.list),
                fetch(API.costCenters.list)
            ]);

            // Check response status before parsing
            if (!rolesRes.ok) {
                console.warn('Failed to load roles:', rolesRes.status);
            }
            if (!companiesRes.ok) {
                console.warn('Failed to load companies:', companiesRes.status);
            }
            if (!costCentersRes.ok) {
                console.warn('Failed to load cost centers:', costCentersRes.status);
            }

            const rolesData = rolesRes.ok ? await rolesRes.json() : { success: false, data: [] };
            const companiesData = companiesRes.ok ? await companiesRes.json() : { success: false, data: [] };
            const costCentersData = costCentersRes.ok ? await costCentersRes.json() : { success: false, data: [] };

            allRoles = rolesData.success ? rolesData.data : (Array.isArray(rolesData) ? rolesData : []);
            allCompanies = companiesData.success ? companiesData.data : (Array.isArray(companiesData) ? companiesData : []);
            allCostCenters = costCentersData.success ? costCentersData.data : (Array.isArray(costCentersData) ? costCentersData : []);

            console.log('[UserManagement] Loaded:', {
                roles: allRoles.length,
                companies: allCompanies.length,
                costCenters: allCostCenters.length
            });

            // Populate role filter
            populateRoleFilter();

            // Populate company dropdowns
            populateCompanyDropdowns();

            // Populate role checkboxes
            populateRoleCheckboxes();

        } catch (error) {
            console.error('Error loading lookup data:', error);
            alert('Failed to load lookup data');
        } finally {
            hideLoading();
        }
    }

    function populateRoleFilter() {
        const filterRole = document.getElementById('filterRole');
        filterRole.innerHTML = '<option value="">All Roles</option>';
        allRoles.forEach(role => {
            filterRole.innerHTML += `<option value="${role.roleId}">${role.roleName}</option>`;
        });
    }

    function populateCompanyDropdowns() {
        const companyId = document.getElementById('companyId');
        const accessCompanyId = document.getElementById('accessCompanyId');

        // Main Company dropdown: Single company or All Companies
        const mainOptions = '<option value="">-- Select Company --</option>' +
            allCompanies.map(c => `<option value="${c.companyId}">${c.companyCode} - ${c.companyName || c.companyCode}</option>`).join('') +
            '<option value="1,2">All Companies (BJC & BIGC)</option>';

        // Data Access dropdown: Single company filter
        const accessOptions = '<option value="">All Companies</option>' +
            allCompanies.map(c => `<option value="${c.companyId}">${c.companyCode} - ${c.companyName || c.companyCode}</option>`).join('');

        companyId.innerHTML = mainOptions;
        accessCompanyId.innerHTML = accessOptions;
    }

    function populateRoleCheckboxes() {
        const container = document.getElementById('roleCheckboxList');
        container.innerHTML = '';

        allRoles.forEach(role => {
            const col = document.createElement('div');
            col.className = 'col-md-6';
            col.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input role-checkbox" type="checkbox" value="${role.roleId}" id="role_${role.roleId}">
                    <label class="form-check-label" for="role_${role.roleId}">
                        <strong>${role.roleName}</strong>
                        ${role.description ? `<br><small class="text-muted">${role.description}</small>` : ''}
                    </label>
                </div>
            `;
            container.appendChild(col);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // User Grid (AG Grid)
    // ═══════════════════════════════════════════════════════════════════════════
    function initializeUserGrid() {
        const gridDiv = document.getElementById('userGrid');

        const columnDefs = [
            {
                headerName: 'Action',
                field: 'actions',
                width: 120,
                sortable: false,
                filter: false,
                cellRenderer: actionsCellRenderer,
                pinned: 'left'
            },
            { headerName: 'Username', field: 'username', minWidth: 120, filter: 'agTextColumnFilter' },
            { headerName: 'Display Name', field: 'displayName', minWidth: 150, filter: 'agTextColumnFilter' },
            { headerName: 'Email', field: 'email', minWidth: 180, filter: 'agTextColumnFilter' },
            { headerName: 'Emp Code', field: 'empCode', width: 100, filter: 'agTextColumnFilter' },
            {
                headerName: 'Auth Type',
                field: 'authType',
                width: 100,
                cellRenderer: params => {
                    const type = params.value || 'AD';
                    const badge = type === 'DB' ? 'bg-info' : 'bg-secondary';
                    return `<span class="badge ${badge}">${type}</span>`;
                }
            },
            {
                headerName: 'Roles',
                field: 'roles',
                minWidth: 200,
                cellRenderer: params => {
                    const roles = params.value || [];
                    return roles.map(r => {
                        const roleCode = (r.roleCode || '').toUpperCase();
                        let badgeClass = 'bg-secondary'; // default

                        // กำหนดสีตาม RoleCode
                        if (roleCode === 'ADMIN' || roleCode.includes('ADMIN')) {
                            badgeClass = 'bg-success'; // เขียว - สิทธิ์สูงสุด
                        } else if (roleCode === 'SUPER_USER' || roleCode.includes('SUPER')) {
                            badgeClass = 'bg-purple'; // ม่วง - สิทธิ์สูง
                        } else if (roleCode === 'MANAGER' || roleCode.includes('MANAGER')) {
                            badgeClass = 'bg-primary'; // น้ำเงิน - ระดับจัดการ
                        } else if (roleCode === 'USER') {
                            badgeClass = 'bg-danger'; // แดง - ผู้ใช้ทั่วไป
                        } else if (roleCode === 'VIEWER' || roleCode.includes('VIEW')) {
                            badgeClass = 'bg-dark'; // เทาเข้ม - ดูอย่างเดียว
                        }

                        return `<span class="badge ${badgeClass} me-1">${r.roleName}</span>`;
                    }).join('');
                }
            },
            {
                headerName: 'Status',
                field: 'isActive',
                width: 90,
                cellRenderer: params => {
                    const active = params.value;
                    return `<span class="badge ${active ? 'bg-success' : 'bg-danger'}">${active ? 'Active' : 'Inactive'}</span>`;
                }
            },
            { headerName: 'Last Login', field: 'lastLoginAt', width: 150, valueFormatter: dateFormatter },
            { headerName: 'Created', field: 'createdAt', width: 150, valueFormatter: dateFormatter }
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
            paginationPageSizeSelector: [10, 20, 50, 100],
            onGridReady: onGridReady,
            onRowDoubleClicked: onRowDoubleClicked
        };

        userGrid = agGrid.createGrid(gridDiv, gridOptions);
    }

    function actionsCellRenderer(params) {
        const userId = params.data.userId;
        const isActive = params.data.isActive;
        const authType = params.data.authType || 'AD';

        let html = `
            <button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="window.UserManagement.editUser(${userId})" title="Edit">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-${isActive ? 'warning' : 'success'} me-1" onclick="window.UserManagement.toggleActive(${userId})" title="${isActive ? 'Deactivate' : 'Activate'}">
                <i class="fa-solid fa-${isActive ? 'ban' : 'check'}"></i>
            </button>
        `;

        // Show reset password only for DB auth
        if (authType === 'DB') {
            html += `
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.UserManagement.showResetPassword(${userId}, '${params.data.username}')" title="Reset Password">
                    <i class="fa-solid fa-key"></i>
                </button>
            `;
        }

        return html;
    }

    function dateFormatter(params) {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    async function onGridReady(params) {
        await loadUserData();
    }

    function onRowDoubleClicked(params) {
        editUser(params.data.userId);
    }

    async function loadUserData() {
        try {
            showLoading();

            const response = await fetch(API.users.list);
            const result = await response.json();

            if (result.success) {
                userGrid.setGridOption('rowData', result.data);
            } else {
                showToast('error', result.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showToast('error', 'Failed to load users');
        } finally {
            hideLoading();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Data Access Grid (inside form)
    // ═══════════════════════════════════════════════════════════════════════════
    function initializeDataAccessGrid() {
        const gridDiv = document.getElementById('dataAccessGrid');

        const columnDefs = [
            {
                headerName: '',
                width: 80,
                sortable: false,
                filter: false,
                cellRenderer: (params) => {
                    return `
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="window.UserManagement.removeDataAccess(${params.rowIndex})" title="Remove">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;
                }
            },
            {
                headerName: 'Company',
                field: 'companyId',
                flex: 1,
                valueFormatter: (params) => {
                    if (!params.value) return 'All Companies';
                    const company = allCompanies.find(c => c.companyId === params.value);
                    return company ? company.companyCode : params.value;
                }
            },
            {
                headerName: 'Cost Center',
                field: 'costCenterCode',
                flex: 1,
                valueFormatter: (params) => params.value || 'All Cost Centers'
            },
            {
                headerName: 'Access Type',
                field: 'accessType',
                width: 120,
                cellRenderer: (params) => {
                    const type = params.value || 'VIEW_ONLY';
                    const badges = {
                        'VIEW_ONLY': 'bg-info',
                        'EDIT': 'bg-warning',
                        'FULL': 'bg-success'
                    };
                    return `<span class="badge ${badges[type] || 'bg-secondary'}">${type.replace('_', ' ')}</span>`;
                }
            }
        ];

        const gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: { resizable: true },
            rowData: [],
            domLayout: 'autoHeight',
            headerHeight: 32,
            rowHeight: 36
        };

        dataAccessGrid = agGrid.createGrid(gridDiv, gridOptions);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Event Handlers
    // ═══════════════════════════════════════════════════════════════════════════
    function initializeEventHandlers() {
        // Add User button
        document.getElementById('btnAddUser').addEventListener('click', showAddUserForm);

        // Refresh button
        document.getElementById('btnRefresh').addEventListener('click', loadUserData);

        // Form close buttons
        document.getElementById('closeUserFormBtn').addEventListener('click', closeUserForm);
        document.getElementById('cancelUserBtn').addEventListener('click', closeUserForm);

        // Save user
        document.getElementById('userForm').addEventListener('submit', saveUser);

        // Auth type change
        document.getElementById('authType').addEventListener('change', onAuthTypeChange);

        // Add data access
        document.getElementById('btnAddDataAccess').addEventListener('click', showDataAccessModal);
        document.getElementById('btnSaveDataAccess').addEventListener('click', saveDataAccess);

        // Reset password
        document.getElementById('btnResetPassword').addEventListener('click', resetPassword);

        // Company filter for cost centers
        document.getElementById('accessCompanyId').addEventListener('change', filterCostCenters);

        // Filters
        document.getElementById('filterRole').addEventListener('change', applyFilters);
        document.getElementById('filterStatus').addEventListener('change', applyFilters);
        document.getElementById('filterAuthType').addEventListener('change', applyFilters);
        document.getElementById('btnClearFilter').addEventListener('click', clearFilters);

        // Export Excel
        document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // User Form Functions
    // ═══════════════════════════════════════════════════════════════════════════
    function showAddUserForm() {
        isEditing = false;
        document.getElementById('formTitleText').textContent = 'Add User';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '0';

        // Reset checkboxes
        document.querySelectorAll('.role-checkbox').forEach(cb => cb.checked = false);

        // Clear data access
        tempDataAccess = [];
        dataAccessGrid.setGridOption('rowData', []);

        // Show password section for DB auth
        onAuthTypeChange();

        // Show first tab
        document.getElementById('basic-tab').click();

        userFormOffcanvas.show();
    }

    async function editUser(userId) {
        try {
            showLoading();
            isEditing = true;

            const response = await fetch(API.users.get(userId));
            const result = await response.json();

            if (result.success) {
                const user = result.data;

                document.getElementById('formTitleText').textContent = 'Edit User';
                document.getElementById('userId').value = user.userId;
                document.getElementById('username').value = user.username || '';
                document.getElementById('empCode').value = user.empCode || '';
                document.getElementById('displayName').value = user.displayName || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('authType').value = user.authType || 'AD';
                document.getElementById('companyId').value = user.companyId || '';
                document.getElementById('isActive').checked = user.isActive;

                // Set role checkboxes
                document.querySelectorAll('.role-checkbox').forEach(cb => {
                    const roleId = parseInt(cb.value);
                    cb.checked = (user.roles || []).some(r => r.roleId === roleId);
                });

                // Set data access
                tempDataAccess = (user.dataAccess || []).map((da, index) => ({
                    ...da,
                    _tempId: index
                }));
                dataAccessGrid.setGridOption('rowData', tempDataAccess);

                // Show/hide password section
                onAuthTypeChange();

                // Hide password fields for edit (unless changing auth type)
                if (user.authType === 'DB') {
                    document.getElementById('pwdRequired').classList.add('d-none');
                    document.getElementById('confirmPwdRequired').classList.add('d-none');
                }

                document.getElementById('basic-tab').click();
                userFormOffcanvas.show();
            } else {
                showToast('error', result.message || 'Failed to load user');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            showToast('error', 'Failed to load user details');
        } finally {
            hideLoading();
        }
    }

    function closeUserForm() {
        userFormOffcanvas.hide();
    }

    async function saveUser(e) {
        e.preventDefault();

        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Validate password match for DB auth
        const authType = document.getElementById('authType').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (authType === 'DB' && !isEditing) {
            if (!password) {
                showToast('error', 'Password is required for DB authentication');
                return;
            }
            if (password !== confirmPassword) {
                showToast('error', 'Passwords do not match');
                return;
            }
        }

        try {
            showSaving(true);

            // Get selected roles
            const selectedRoles = Array.from(document.querySelectorAll('.role-checkbox:checked'))
                .map(cb => parseInt(cb.value));

            const userData = {
                userId: parseInt(document.getElementById('userId').value) || 0,
                username: document.getElementById('username').value,
                empCode: document.getElementById('empCode').value || null,
                displayName: document.getElementById('displayName').value,
                email: document.getElementById('email').value || null,
                authType: authType,
                companyId: document.getElementById('companyId').value ? parseInt(document.getElementById('companyId').value) : null,
                isActive: document.getElementById('isActive').checked,
                password: authType === 'DB' ? password : null,
                roleIds: selectedRoles,
                dataAccess: tempDataAccess.map(da => ({
                    companyId: da.companyId,
                    costCenterCode: da.costCenterCode,
                    accessType: da.accessType
                }))
            };

            const url = isEditing ? API.users.update(userData.userId) : API.users.create;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', isEditing ? 'User updated successfully' : 'User created successfully');
                closeUserForm();
                loadUserData();
            } else {
                showToast('error', result.message || 'Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showToast('error', 'Failed to save user');
        } finally {
            showSaving(false);
        }
    }

    function onAuthTypeChange() {
        const authType = document.getElementById('authType').value;
        const passwordSection = document.getElementById('passwordSection');

        if (authType === 'DB') {
            passwordSection.classList.remove('d-none');
        } else {
            passwordSection.classList.add('d-none');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Data Access Functions
    // ═══════════════════════════════════════════════════════════════════════════
    function showDataAccessModal() {
        document.getElementById('dataAccessForm').reset();
        document.getElementById('dataAccessId').value = '0';
        filterCostCenters();
        dataAccessModal.show();
    }

    function filterCostCenters() {
        const companyId = document.getElementById('accessCompanyId').value;
        const costCenterSelect = document.getElementById('accessCostCenterCode');

        let filtered = allCostCenters;
        if (companyId) {
            filtered = allCostCenters.filter(cc => cc.companyId == companyId);
        }

        costCenterSelect.innerHTML = '<option value="">All Cost Centers</option>' +
            filtered.map(cc => `<option value="${cc.costCenterCode}">${cc.costCenterCode} - ${cc.costCenterName || cc.costCenterCode}</option>`).join('');
    }

    function saveDataAccess() {
        const companyId = document.getElementById('accessCompanyId').value;
        const costCenterCode = document.getElementById('accessCostCenterCode').value;
        const accessType = document.getElementById('accessType').value;

        // Add to temporary array
        const newAccess = {
            _tempId: Date.now(),
            companyId: companyId ? parseInt(companyId) : null,
            costCenterCode: costCenterCode || null,
            accessType: accessType
        };

        tempDataAccess.push(newAccess);
        dataAccessGrid.setGridOption('rowData', [...tempDataAccess]);
        dataAccessModal.hide();
    }

    function removeDataAccess(index) {
        tempDataAccess.splice(index, 1);
        dataAccessGrid.setGridOption('rowData', [...tempDataAccess]);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // User Actions
    // ═══════════════════════════════════════════════════════════════════════════
    async function toggleActive(userId) {
        const confirmed = await showConfirm('Toggle Status', 'Are you sure you want to change the status of this user?');
        if (!confirmed) return;

        try {
            const response = await fetch(API.users.toggleActive(userId), {
                method: 'PUT'
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', 'User status updated');
                loadUserData();
            } else {
                showToast('error', result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('error', 'Failed to update status');
        }
    }

    function showResetPassword(userId, username) {
        document.getElementById('resetUserId').value = userId;
        document.getElementById('resetUserName').textContent = username;
        document.getElementById('resetPasswordForm').reset();
        resetPasswordModal.show();
    }

    async function resetPassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!newPassword || newPassword.length < 8) {
            showToast('error', 'Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }

        const userId = document.getElementById('resetUserId').value;

        try {
            const response = await fetch(API.users.resetPassword(userId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });

            const result = await response.json();

            if (result.success) {
                showToast('success', 'Password reset successfully');
                resetPasswordModal.hide();
            } else {
                showToast('error', result.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showToast('error', 'Failed to reset password');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Filter Functions
    // ═══════════════════════════════════════════════════════════════════════════
    function applyFilters() {
        const roleFilter = document.getElementById('filterRole').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const authTypeFilter = document.getElementById('filterAuthType').value;

        const filterModel = {};

        // Note: AG Grid external filter implementation would go here
        // For now, we reload data with server-side filtering
        loadUserData();
    }

    function clearFilters() {
        document.getElementById('filterRole').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterAuthType').value = '';
        loadUserData();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Export Functions
    // ═══════════════════════════════════════════════════════════════════════════
    async function exportToExcel() {
        const rows = [];
        userGrid.forEachNode(node => rows.push(node.data));

        if (rows.length === 0) {
            showToast('warning', 'No data to export');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        worksheet.columns = [
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Display Name', key: 'displayName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Emp Code', key: 'empCode', width: 15 },
            { header: 'Auth Type', key: 'authType', width: 12 },
            { header: 'Status', key: 'isActive', width: 10 },
            { header: 'Roles', key: 'roles', width: 30 },
            { header: 'Last Login', key: 'lastLoginAt', width: 20 },
            { header: 'Created', key: 'createdAt', width: 20 }
        ];

        rows.forEach(row => {
            worksheet.addRow({
                username: row.username,
                displayName: row.displayName,
                email: row.email,
                empCode: row.empCode,
                authType: row.authType,
                isActive: row.isActive ? 'Active' : 'Inactive',
                roles: (row.roles || []).map(r => r.roleName).join(', '),
                lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : '',
                createdAt: row.createdAt ? new Date(row.createdAt).toLocaleString() : ''
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
        a.download = `Users_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        const btn = document.getElementById('btnSaveUser');

        if (saving) {
            spinner.classList.remove('d-none');
            text.textContent = 'Saving...';
            btn.disabled = true;
        } else {
            spinner.classList.add('d-none');
            text.innerHTML = '<i class="fa-solid fa-save"></i> Save User';
            btn.disabled = false;
        }
    }

    function showToast(type, message) {
        // Use SweetAlert2 if available, otherwise use browser alert
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
    window.UserManagement = {
        editUser,
        toggleActive,
        showResetPassword,
        removeDataAccess
    };

})();
