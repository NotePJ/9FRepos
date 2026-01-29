/**
 * ═══════════════════════════════════════════════════════
 * 🔔 PE Notification System - Bell Component
 * ═══════════════════════════════════════════════════════
 *
 * Features:
 * - Real-time notification count badge
 * - Category tabs (ALL, PE_MOVEMENT, PE_ADDITIONAL)
 * - Mark as read / Mark all as read
 * - Click navigation to related record
 * - Auto-polling for new notifications
 */

// ===== Configuration =====
// Get base URL from global config (supports IIS virtual directory)
const NotificationApiBase = (window.AppConfig && window.AppConfig.apiBaseUrl) ? window.AppConfig.apiBaseUrl : './api/';

const NotificationConfig = {
    pollInterval: 30000,        // Poll every 30 seconds
    maxDisplayItems: 20,        // Max items in dropdown
    enablePolling: true,        // Enable/disable auto-refresh
    apiBaseUrl: NotificationApiBase + 'notification',
    categories: {
        ALL: 'ทั้งหมด',
        PE_MOVEMENT: 'Movement',
        PE_ADDITIONAL: 'Additional'
    }
};

// ===== State =====
let NotificationState = {
    currentCategory: 'ALL',
    notifications: [],
    unreadCount: 0,
    countByCategory: {},
    isLoading: false,
    pollTimer: null
};

// ===== Initialize =====
$(document).ready(function() {
    initNotificationSystem();
});

function initNotificationSystem() {
    console.log('🔔 Initializing Notification System...');

    // Initial load
    loadNotificationCount();
    loadNotifications();

    // Setup polling
    if (NotificationConfig.enablePolling) {
        startPolling();
    }

    // Event handlers
    setupEventHandlers();

    console.log('✅ Notification System Ready');
}

// ===== API Functions =====
async function loadNotificationCount() {
    try {
        const response = await fetch(`${NotificationConfig.apiBaseUrl}/count`);
        if (response.ok) {
            const data = await response.json();
            NotificationState.unreadCount = data.unreadCount || 0;
            updateBadge(NotificationState.unreadCount);
        }
    } catch (error) {
        console.error('Failed to load notification count:', error);
    }
}

async function loadCountByCategory() {
    try {
        const response = await fetch(`${NotificationConfig.apiBaseUrl}/count-by-category`);
        if (response.ok) {
            const data = await response.json();
            NotificationState.countByCategory = data.counts || {};
            updateTabBadges();
        }
    } catch (error) {
        console.error('Failed to load category counts:', error);
    }
}

async function loadNotifications(category = null) {
    if (NotificationState.isLoading) return;

    NotificationState.isLoading = true;
    showLoadingState();

    try {
        const cat = category || NotificationState.currentCategory;
        const url = cat === 'ALL'
            ? `${NotificationConfig.apiBaseUrl}/list?pageSize=${NotificationConfig.maxDisplayItems}`
            : `${NotificationConfig.apiBaseUrl}/list?category=${cat}&pageSize=${NotificationConfig.maxDisplayItems}`;

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            NotificationState.notifications = data.items || [];
            renderNotifications();
        } else {
            showErrorState('ไม่สามารถโหลดข้อมูลได้');
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
        showErrorState('เกิดข้อผิดพลาด');
    } finally {
        NotificationState.isLoading = false;
    }
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`${NotificationConfig.apiBaseUrl}/read/${notificationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Update local state
            const notification = NotificationState.notifications.find(n => n.notificationId === notificationId);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                NotificationState.unreadCount = Math.max(0, NotificationState.unreadCount - 1);
                updateBadge(NotificationState.unreadCount);
            }
            return true;
        }
    } catch (error) {
        console.error('Failed to mark as read:', error);
    }
    return false;
}

async function markAllAsRead() {
    try {
        const category = NotificationState.currentCategory === 'ALL' ? null : NotificationState.currentCategory;
        const url = category
            ? `${NotificationConfig.apiBaseUrl}/read-all?category=${category}`
            : `${NotificationConfig.apiBaseUrl}/read-all`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Update local state
            NotificationState.notifications.forEach(n => n.isRead = true);
            NotificationState.unreadCount = 0;
            updateBadge(0);
            renderNotifications();

            showToast('success', 'อ่านการแจ้งเตือนทั้งหมดแล้ว');
        }
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        showToast('error', 'เกิดข้อผิดพลาด');
    }
}

// ===== Rendering Functions =====
function renderNotifications() {
    const container = $('#notificationList');
    container.empty();

    if (NotificationState.notifications.length === 0) {
        container.html(renderEmptyState());
        return;
    }

    NotificationState.notifications.forEach(notification => {
        container.append(renderNotificationItem(notification));
    });
}

function renderNotificationItem(notification) {
    const iconInfo = getNotificationIcon(notification);
    const timeAgo = formatTimeAgo(notification.createdDate);
    const unreadClass = notification.isRead ? '' : 'unread';

    return `
        <a href="javascript:void(0)"
           class="notification-item ${unreadClass}"
           data-notification-id="${notification.notificationId}"
           data-ref-type="${notification.refType || ''}"
           data-ref-id="${notification.refId || ''}"
           onclick="handleNotificationClick(${notification.notificationId})">
            <div class="notification-icon ${iconInfo.colorClass}">
                <i class="${iconInfo.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${escapeHtml(notification.title)}</div>
                <div class="notification-message">${escapeHtml(notification.message || '')}</div>
                <div class="notification-meta">
                    <span class="notification-time">
                        <i class="fa-regular fa-clock"></i>
                        ${timeAgo}
                    </span>
                    ${notification.hasAttachment ? `
                        <span class="notification-attachment">
                            <i class="fa-solid fa-paperclip"></i>
                            แนบไฟล์
                        </span>
                    ` : ''}
                </div>
            </div>
        </a>
    `;
}

function renderEmptyState() {
    return `
        <div class="text-center text-muted py-4">
            <i class="fa-regular fa-bell-slash fa-2x mb-2"></i>
            <p class="mb-0">ไม่มีการแจ้งเตือน</p>
        </div>
    `;
}

function showLoadingState() {
    $('#notificationList').html(`
        <div class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0 mt-2">กำลังโหลด...</p>
        </div>
    `);
}

function showErrorState(message) {
    $('#notificationList').html(`
        <div class="text-center text-danger py-4">
            <i class="fa-solid fa-circle-exclamation fa-2x mb-2"></i>
            <p class="mb-0">${escapeHtml(message)}</p>
        </div>
    `);
}

// ===== UI Update Functions =====
function updateBadge(count) {
    const badge = $('#notificationBadge');
    if (count > 0) {
        badge.text(count > 99 ? '99+' : count).removeClass('d-none');
    } else {
        badge.addClass('d-none');
    }
}

function updateTabBadges() {
    const counts = NotificationState.countByCategory;

    // Update each tab badge
    Object.keys(counts).forEach(category => {
        const badge = $(`.notification-tabs .nav-link[data-category="${category}"] .badge`);
        if (badge.length && counts[category] > 0) {
            badge.text(counts[category]).removeClass('d-none');
        } else if (badge.length) {
            badge.addClass('d-none');
        }
    });
}

// ===== Event Handlers =====
function setupEventHandlers() {
    // Tab click
    $(document).on('click', '.notification-tabs .nav-link', function(e) {
        e.preventDefault();

        const category = $(this).data('category');

        // Update active state
        $('.notification-tabs .nav-link').removeClass('active');
        $(this).addClass('active');

        // Load notifications for category
        NotificationState.currentCategory = category;
        loadNotifications(category);
    });

    // Mark all as read
    $(document).on('click', '#markAllReadBtn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        markAllAsRead();
    });

    // Dropdown show - refresh data
    $('#notificationDropdown').on('show.bs.dropdown', function() {
        loadNotificationCount();
        loadCountByCategory();
        loadNotifications();
    });
}

function handleNotificationClick(notificationId) {
    const notification = NotificationState.notifications.find(n => n.notificationId === notificationId);
    if (!notification) return;

    // Mark as read
    markAsRead(notificationId);

    // Update UI immediately
    $(`.notification-item[data-notification-id="${notificationId}"]`).removeClass('unread');

    // Navigate based on type
    if (notification.refType === 'MOVEMENT' && notification.refId) {
        navigateToMovement(notification.refId);
    } else if (notification.refType === 'ADDITIONAL' && notification.refId) {
        navigateToAdditional(notification.refId);
    }

    // Close dropdown
    $('#notificationDropdown .dropdown-toggle').dropdown('hide');
}

function navigateToMovement(movementId) {
    // Navigate to PE B1 page with highlight
    const currentPage = window.location.pathname;

    if (currentPage.includes('/PEManagement/PEB1')) {
        // Already on page - just highlight the row
        highlightGridRow(movementId);
    } else {
        // Navigate to page with query param
        window.location.href = `/PEManagement/PEB1?highlight=${movementId}`;
    }
}

function navigateToAdditional(additionalId) {
    const currentPage = window.location.pathname;

    if (currentPage.includes('/PEManagement/PEB1')) {
        highlightGridRow(additionalId);
    } else {
        window.location.href = `/PEManagement/PEB1?highlightAdditional=${additionalId}`;
    }
}

function highlightGridRow(recordId) {
    // This will be called from AG Grid integration
    if (typeof window.highlightMovementRow === 'function') {
        window.highlightMovementRow(recordId);
    } else {
        console.warn('highlightMovementRow function not found');
    }
}

// ===== Polling =====
function startPolling() {
    if (NotificationState.pollTimer) {
        clearInterval(NotificationState.pollTimer);
    }

    NotificationState.pollTimer = setInterval(() => {
        loadNotificationCount();
    }, NotificationConfig.pollInterval);

    console.log(`🔄 Polling started (${NotificationConfig.pollInterval}ms)`);
}

function stopPolling() {
    if (NotificationState.pollTimer) {
        clearInterval(NotificationState.pollTimer);
        NotificationState.pollTimer = null;
        console.log('⏹️ Polling stopped');
    }
}

// ===== Helper Functions =====
function getNotificationIcon(notification) {
    const actionType = (notification.actionType || '').toUpperCase();
    const category = (notification.category || '').toUpperCase();

    // Check for approval actions
    if (actionType === 'APPROVED') {
        return { icon: 'fa-solid fa-circle-check', colorClass: 'approved' };
    }
    if (actionType === 'REJECTED') {
        return { icon: 'fa-solid fa-circle-xmark', colorClass: 'rejected' };
    }

    // Check category + action
    if (category === 'PE_MOVEMENT') {
        switch (actionType) {
            case 'MOVE_IN':
                return { icon: 'fa-solid fa-arrow-right-to-bracket', colorClass: 'move-in' };
            case 'MOVE_OUT':
                return { icon: 'fa-solid fa-arrow-right-from-bracket', colorClass: 'move-out' };
            case 'CUT':
                return { icon: 'fa-solid fa-scissors', colorClass: 'cut' };
            default:
                return { icon: 'fa-solid fa-right-left', colorClass: 'move-in' };
        }
    }

    if (category === 'PE_ADDITIONAL') {
        return { icon: 'fa-solid fa-user-plus', colorClass: 'additional' };
    }

    // Default
    return { icon: 'fa-solid fa-bell', colorClass: 'move-in' };
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'เมื่อสักครู่';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} วันที่แล้ว`;

    // Format as date for older
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(type, message) {
    // Use existing toast function if available
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    } else if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type === 'error' ? 'error' : 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    } else {
        console.log(`Toast [${type}]:`, message);
    }
}

// ===== Exports for external use =====
window.NotificationSystem = {
    loadNotifications,
    loadNotificationCount,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
    refreshBadge: loadNotificationCount
};

console.log('📦 notification.js loaded');
