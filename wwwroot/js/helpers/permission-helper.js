/**
 * Permission Helper for Frontend
 * ใช้ตรวจสอบ Permission และซ่อน/แสดง UI elements
 *
 * Usage:
 *   // Check permission
 *   if (PermissionHelper.hasPermission('BTN_APPROVE')) { ... }
 *
 *   // Hide elements without permission
 *   PermissionHelper.hideIfNoPermission('.btn-approve', 'BTN_APPROVE');
 *
 *   // Auto-apply to elements with data-permission attribute
 *   <button data-permission="BTN_APPROVE">Approve</button>
 *   PermissionHelper.applyPermissions();
 */

const PermissionHelper = (function () {
    'use strict';

    // Cache for user permissions (loaded from session)
    let _permissions = [];
    let _roles = [];
    let _isAdmin = false;
    let _isLoaded = false;

    /**
     * Initialize - Load permissions from server
     */
    async function init() {
        if (_isLoaded) return;

        // Get base URL from global config (supports IIS virtual directory)
        const apiBase = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

        try {
            const response = await fetch(apiBase + 'Auth/GetCurrentUser');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    _permissions = data.user.permissions || [];
                    _roles = data.user.roles || [];
                    _isAdmin = data.user.isAdmin || false;
                    _isLoaded = true;
                    console.log('[PermissionHelper] Loaded:', {
                        roles: _roles,
                        permissions: _permissions.length,
                        isAdmin: _isAdmin
                    });
                }
            }
        } catch (error) {
            console.warn('[PermissionHelper] Failed to load permissions:', error);
            // Try to load from embedded data
            loadFromEmbeddedData();
        }
    }

    /**
     * Load permissions from embedded script data (alternative method)
     * Requires: <script>window.__USER_PERMISSIONS__ = @Html.Raw(Json.Serialize(permissions))</script>
     */
    function loadFromEmbeddedData() {
        if (window.__USER_PERMISSIONS__) {
            _permissions = window.__USER_PERMISSIONS__;
            _isLoaded = true;
        }
        if (window.__USER_ROLES__) {
            _roles = window.__USER_ROLES__;
        }
        if (window.__IS_ADMIN__ !== undefined) {
            _isAdmin = window.__IS_ADMIN__;
        }
    }

    /**
     * Check if user has a specific permission
     * @param {string} permissionCode - Permission code to check
     * @returns {boolean}
     */
    function hasPermission(permissionCode) {
        if (_isAdmin) return true; // Admin bypasses all checks
        return _permissions.includes(permissionCode);
    }

    /**
     * Check if user has ANY of the specified permissions
     * @param {string[]} permissionCodes - Array of permission codes
     * @returns {boolean}
     */
    function hasAnyPermission(permissionCodes) {
        if (_isAdmin) return true;
        return permissionCodes.some(p => _permissions.includes(p));
    }

    /**
     * Check if user has ALL of the specified permissions
     * @param {string[]} permissionCodes - Array of permission codes
     * @returns {boolean}
     */
    function hasAllPermissions(permissionCodes) {
        if (_isAdmin) return true;
        return permissionCodes.every(p => _permissions.includes(p));
    }

    /**
     * Check if user has a specific role
     * @param {string} roleCode - Role code to check
     * @returns {boolean}
     */
    function hasRole(roleCode) {
        return _roles.includes(roleCode);
    }

    /**
     * Check if user has ANY of the specified roles
     * @param {string[]} roleCodes - Array of role codes
     * @returns {boolean}
     */
    function hasAnyRole(roleCodes) {
        return roleCodes.some(r => _roles.includes(r));
    }

    /**
     * Check if user is Admin
     * @returns {boolean}
     */
    function isAdmin() {
        return _isAdmin || _roles.includes('ADMIN');
    }

    /**
     * Check if user is Super User or higher
     * @returns {boolean}
     */
    function isSuperUser() {
        return isAdmin() || _roles.includes('SUPER_USER');
    }

    /**
     * Hide element if user doesn't have permission
     * @param {string|Element} selector - CSS selector or DOM element
     * @param {string} permissionCode - Required permission
     */
    function hideIfNoPermission(selector, permissionCode) {
        if (!hasPermission(permissionCode)) {
            const elements = typeof selector === 'string'
                ? document.querySelectorAll(selector)
                : [selector];

            elements.forEach(el => {
                if (el) el.style.display = 'none';
            });
        }
    }

    /**
     * Disable element if user doesn't have permission
     * @param {string|Element} selector - CSS selector or DOM element
     * @param {string} permissionCode - Required permission
     */
    function disableIfNoPermission(selector, permissionCode) {
        if (!hasPermission(permissionCode)) {
            const elements = typeof selector === 'string'
                ? document.querySelectorAll(selector)
                : [selector];

            elements.forEach(el => {
                if (el) {
                    el.disabled = true;
                    el.classList.add('disabled');
                    el.setAttribute('title', 'คุณไม่มีสิทธิ์ใช้งานปุ่มนี้');
                }
            });
        }
    }

    /**
     * Apply permissions to all elements with data-permission attribute
     * Elements without permission will be hidden
     *
     * Usage in HTML:
     *   <button data-permission="BTN_APPROVE">Approve</button>
     *   <button data-permission="BTN_EDIT,BTN_CREATE" data-permission-mode="any">Edit/Create</button>
     *   <div data-permission="FEATURE_EXPORT" data-permission-action="disable">...</div>
     */
    function applyPermissions() {
        document.querySelectorAll('[data-permission]').forEach(el => {
            const permissionStr = el.getAttribute('data-permission');
            const mode = el.getAttribute('data-permission-mode') || 'any'; // 'any' or 'all'
            const action = el.getAttribute('data-permission-action') || 'hide'; // 'hide' or 'disable'

            if (!permissionStr) return;

            const permissions = permissionStr.split(',').map(p => p.trim());
            let hasAccess = false;

            if (mode === 'all') {
                hasAccess = hasAllPermissions(permissions);
            } else {
                hasAccess = hasAnyPermission(permissions);
            }

            if (!hasAccess) {
                if (action === 'disable') {
                    el.disabled = true;
                    el.classList.add('disabled');
                    el.setAttribute('title', 'คุณไม่มีสิทธิ์ใช้งาน');
                } else {
                    el.style.display = 'none';
                }
            }
        });
    }

    /**
     * Apply role-based visibility to elements with data-role attribute
     *
     * Usage in HTML:
     *   <div data-role="ADMIN">Admin Only Section</div>
     *   <button data-role="ADMIN,SUPER_USER">Admin/SuperUser Button</button>
     */
    function applyRoles() {
        document.querySelectorAll('[data-role]').forEach(el => {
            const roleStr = el.getAttribute('data-role');
            const action = el.getAttribute('data-role-action') || 'hide';

            if (!roleStr) return;

            const roles = roleStr.split(',').map(r => r.trim());
            const hasAccess = hasAnyRole(roles);

            if (!hasAccess) {
                if (action === 'disable') {
                    el.disabled = true;
                    el.classList.add('disabled');
                } else {
                    el.style.display = 'none';
                }
            }
        });
    }

    /**
     * Get all user permissions
     * @returns {string[]}
     */
    function getPermissions() {
        return [..._permissions];
    }

    /**
     * Get all user roles
     * @returns {string[]}
     */
    function getRoles() {
        return [..._roles];
    }

    // Public API
    return {
        init,
        loadFromEmbeddedData,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        isAdmin,
        isSuperUser,
        hideIfNoPermission,
        disableIfNoPermission,
        applyPermissions,
        applyRoles,
        getPermissions,
        getRoles
    };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Try to load from embedded data first (synchronous)
    PermissionHelper.loadFromEmbeddedData();

    // Then apply permissions
    PermissionHelper.applyPermissions();
    PermissionHelper.applyRoles();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PermissionHelper;
}
