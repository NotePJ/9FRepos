/**
 * User Menu & Role-based Navigation Controller
 * โหลดข้อมูล User จาก Session และควบคุมการแสดง/ซ่อนเมนูตาม Role
 *
 * Dependencies: PermissionHelper (wwwroot/js/helpers/permission-helper.js)
 */

const UserMenu = (function () {
    'use strict';

    // User data cache
    let _user = null;
    let _isLoaded = false;

    /**
     * Initialize - Load user data and apply menu visibility
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
                    _user = data.user;
                    _isLoaded = true;

                    // Update UI
                    updateUserDisplay();
                    applyRoleBasedMenus();

                    console.log('[UserMenu] Initialized:', {
                        empCode: _user.empCode,
                        roles: _user.roles,
                        isAdmin: _user.isAdmin
                    });
                } else {
                    console.warn('[UserMenu] User not logged in');
                    // Hide admin menus if not logged in
                    hideAdminMenus();
                }
            }
        } catch (error) {
            console.error('[UserMenu] Failed to load user data:', error);
            hideAdminMenus();
        }
    }

    /**
     * Update user display in header
     */
    function updateUserDisplay() {
        if (!_user) return;

        // Update avatar initial
        const avatarInitial = document.getElementById('userAvatarInitial');
        if (avatarInitial) {
            const initial = (_user.empCode || 'U').substring(0, 2).toUpperCase();
            avatarInitial.textContent = initial;
        }

        // Update display name
        const displayName = document.getElementById('userDisplayName');
        if (displayName) {
            displayName.textContent = _user.empCode || 'Unknown User';
        }

        // Update employee number
        const employeeNo = document.getElementById('userEmployeeNo');
        if (employeeNo) {
            employeeNo.textContent = _user.userId ? `ID: ${_user.userId}` : '';
        }

        // Update role badge
        const roleBadge = document.getElementById('userRoleBadge');
        if (roleBadge) {
            if (_user.isAdmin) {
                roleBadge.textContent = 'Admin';
                roleBadge.className = 'badge bg-danger';
            } else if (_user.roles && _user.roles.includes('SUPER_USER')) {
                roleBadge.textContent = 'Super User';
                roleBadge.className = 'badge bg-warning text-dark';
            } else if (_user.roles && _user.roles.length > 0) {
                roleBadge.textContent = _user.roles[0];
                roleBadge.className = 'badge bg-primary';
            } else {
                roleBadge.textContent = _user.userRole || 'User';
                roleBadge.className = 'badge bg-secondary';
            }
        }

        // Update company badge
        const companyBadge = document.getElementById('userCompanyBadge');
        if (companyBadge) {
            const company = (_user.company || '').toUpperCase();
            companyBadge.textContent = company || '-';

            // Color based on company
            if (company === 'BJC') {
                companyBadge.className = 'badge bg-success';
            } else if (company === 'BIGC') {
                companyBadge.className = 'badge bg-info';
            } else {
                companyBadge.className = 'badge bg-secondary';
            }
        }
    }

    /**
     * Apply role-based menu visibility
     */
    function applyRoleBasedMenus() {
        if (!_user) return;

        const userRoles = _user.roles || [];
        const isAdmin = _user.isAdmin || userRoles.includes('ADMIN');
        const isSuperUser = isAdmin || userRoles.includes('SUPER_USER');

        // Process all elements with data-role attribute
        document.querySelectorAll('[data-role]').forEach(el => {
            const roleStr = el.getAttribute('data-role');
            if (!roleStr) return;

            const requiredRoles = roleStr.split(',').map(r => r.trim());
            let hasAccess = false;

            // Admin has access to everything
            if (isAdmin) {
                hasAccess = true;
            } else {
                // Check if user has any of the required roles
                hasAccess = requiredRoles.some(role => {
                    if (role === 'ADMIN') return isAdmin;
                    if (role === 'SUPER_USER') return isSuperUser;
                    return userRoles.includes(role);
                });
            }

            // Apply visibility
            if (!hasAccess) {
                el.style.display = 'none';
            } else {
                // Make sure it's visible (in case it was hidden by CSS)
                el.style.display = '';
            }
        });

        // Special handling for admin menu group
        const adminMenuGroup = document.getElementById('adminMenuGroup');
        if (adminMenuGroup) {
            if (isAdmin || isSuperUser) {
                adminMenuGroup.style.display = '';
                adminMenuGroup.classList.remove('d-none');
            } else {
                adminMenuGroup.style.display = 'none';
            }
        }
    }

    /**
     * Hide all admin menus (when not logged in or error)
     */
    function hideAdminMenus() {
        document.querySelectorAll('[data-role]').forEach(el => {
            const roleStr = el.getAttribute('data-role');
            if (roleStr && (roleStr.includes('ADMIN') || roleStr.includes('SUPER_USER'))) {
                el.style.display = 'none';
            }
        });

        const adminMenuGroup = document.getElementById('adminMenuGroup');
        if (adminMenuGroup) {
            adminMenuGroup.style.display = 'none';
        }
    }

    /**
     * Check if user has a specific role
     * @param {string} roleCode - Role code to check
     * @returns {boolean}
     */
    function hasRole(roleCode) {
        if (!_user) return false;
        if (_user.isAdmin) return true;
        return (_user.roles || []).includes(roleCode);
    }

    /**
     * Check if user is Admin
     * @returns {boolean}
     */
    function isAdmin() {
        if (!_user) return false;
        return _user.isAdmin || (_user.roles || []).includes('ADMIN');
    }

    /**
     * Check if user is Super User or higher
     * @returns {boolean}
     */
    function isSuperUser() {
        return isAdmin() || hasRole('SUPER_USER');
    }

    /**
     * Get current user data
     * @returns {object|null}
     */
    function getUser() {
        return _user;
    }

    /**
     * Refresh user data
     */
    async function refresh() {
        _isLoaded = false;
        _user = null;
        await init();
    }

    // Public API
    return {
        init,
        refresh,
        getUser,
        hasRole,
        isAdmin,
        isSuperUser,
        applyRoleBasedMenus,
        updateUserDisplay
    };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    UserMenu.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserMenu;
}
