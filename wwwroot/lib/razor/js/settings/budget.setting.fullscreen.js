/**
 * Settings Fullscreen Module
 * Handles fullscreen functionality for Settings AG Grid
 * Simplified version for single grid usage
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // 📋 CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    const FULLSCREEN_CONFIG = {
        containerId: 'settingsGridContainer',
        buttonId: 'btnToggleFullscreen',
        gridId: 'myGrid',
        originalHeight: '500px',
        icons: {
            expand: 'fa-solid fa-expand',
            compress: 'fa-solid fa-compress'
        },
        titles: {
            expand: 'Toggle Fullscreen',
            compress: 'Exit Fullscreen'
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🔍 FULLSCREEN API DETECTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * ตรวจสอบว่า browser รองรับ native fullscreen API หรือไม่
     */
    function isFullscreenSupported() {
        return !!(
            document.fullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.msFullscreenEnabled
        );
    }

    /**
     * ตรวจสอบว่าอยู่ในโหมด native fullscreen หรือไม่
     */
    function isInNativeFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🚀 NATIVE FULLSCREEN OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * เข้าสู่โหมด native fullscreen
     * @param {HTMLElement} element - Element ที่จะทำ fullscreen
     * @returns {Promise}
     */
    function enterNativeFullscreen(element) {
        if (element.requestFullscreen) {
            return element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            return element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            return element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            return element.msRequestFullscreen();
        }
        return Promise.reject(new Error('Fullscreen not supported'));
    }

    /**
     * ออกจากโหมด native fullscreen
     * @returns {Promise}
     */
    function exitNativeFullscreen() {
        if (document.exitFullscreen) {
            return document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            return document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            return document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            return document.msExitFullscreen();
        }
        return Promise.reject(new Error('Exit fullscreen not supported'));
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎨 FALLBACK FULLSCREEN OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * เข้าสู่โหมด fallback fullscreen (position: fixed)
     * ใช้เมื่อ browser ไม่รองรับ native fullscreen
     */
    function enterFallbackFullscreen(container, gridId) {
        container.classList.add('fallback-fullscreen');
        document.body.classList.add('fallback-fullscreen-active');

        // Set grid to full container size
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.style.height = '100%';
            grid.style.width = '100%';
        }

        console.log('✅ Entered fallback fullscreen mode');
    }

    /**
     * ออกจากโหมด fallback fullscreen
     */
    function exitFallbackFullscreen(container, gridId, originalHeight) {
        container.classList.remove('fallback-fullscreen');
        document.body.classList.remove('fallback-fullscreen-active');

        // Restore original grid size
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.style.height = originalHeight;
            grid.style.width = '100%';
        }

        console.log('✅ Exited fallback fullscreen mode');
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎯 GRID RESIZE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Resize grid หลังจากเปลี่ยนโหมด fullscreen
     * @param {Object} gridApi - AG Grid API instance
     * @param {boolean} isExitingFullscreen - กำลังออกจาก fullscreen หรือไม่
     */
    function resizeGrid(gridApi, isExitingFullscreen = false) {
        if (!gridApi) {
            console.warn('⚠️ Grid API not available for resize');
            return;
        }

        // Refresh grid when exiting fullscreen to restore proper layout
        if (isExitingFullscreen && gridApi.refreshCells) {
            setTimeout(() => {
                gridApi.refreshCells();
                console.log('🔄 Grid refreshed after exiting fullscreen');
            }, 150);
        }

        // Let AG Grid handle resizing naturally
        console.log('📏 Grid resize called, isExitingFullscreen:', isExitingFullscreen);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔄 ICON & TITLE UPDATE
    // ═══════════════════════════════════════════════════════════════════

    /**
     * อัปเดต icon และ title ของปุ่ม fullscreen
     * @param {HTMLElement} button - ปุ่ม fullscreen
     * @param {boolean} isFullscreen - อยู่ในโหมด fullscreen หรือไม่
     */
    function updateButtonState(button, isFullscreen) {
        if (!button) return;

        const icon = button.querySelector('i');
        if (!icon) return;

        if (isFullscreen) {
            // เปลี่ยนเป็น compress icon
            icon.className = FULLSCREEN_CONFIG.icons.compress;
            button.title = FULLSCREEN_CONFIG.titles.compress;
        } else {
            // เปลี่ยนเป็น expand icon
            icon.className = FULLSCREEN_CONFIG.icons.expand;
            button.title = FULLSCREEN_CONFIG.titles.expand;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📡 FULLSCREEN CHANGE HANDLER
    // ═══════════════════════════════════════════════════════════════════

    /**
     * จัดการเมื่อมีการเปลี่ยนแปลงสถานะ fullscreen
     */
    function handleFullscreenChange() {
        const container = document.getElementById(FULLSCREEN_CONFIG.containerId);
        const button = document.getElementById(FULLSCREEN_CONFIG.buttonId);
        const grid = document.getElementById(FULLSCREEN_CONFIG.gridId);

        if (!container || !button || !grid) {
            console.warn('⚠️ Fullscreen elements not found');
            return;
        }

        // ตรวจสอบว่า container อยู่ใน fullscreen หรือไม่
        let isFullscreen = false;

        if (isInNativeFullscreen()) {
            // ตรวจสอบแต่ละ selector อย่างปลอดภัย
            try {
                if (container.matches(':fullscreen')) {
                    isFullscreen = true;
                }
            } catch (e) {
                // :fullscreen not supported
            }

            try {
                if (container.matches(':-webkit-full-screen')) {
                    isFullscreen = true;
                }
            } catch (e) {
                // :-webkit-full-screen not supported
            }

            try {
                if (container.matches(':-moz-full-screen')) {
                    isFullscreen = true;
                }
            } catch (e) {
                // :-moz-full-screen not supported
            }
        }

        // อัปเดต UI ตามสถานะ
        if (isFullscreen) {
            // กำลังเข้า fullscreen
            updateButtonState(button, true);
            grid.style.height = '97%';
            grid.style.width = '100%';

            // Get grid API from settings module
            const gridApi = window.settingsGridApi || null;
            resizeGrid(gridApi, false);

            console.log('🖥️ Entered fullscreen mode');
        } else {
            // กำลังออกจาก fullscreen
            updateButtonState(button, false);
            grid.style.height = FULLSCREEN_CONFIG.originalHeight;
            grid.style.width = '100%';

            // Get grid API from settings module
            const gridApi = window.settingsGridApi || null;
            resizeGrid(gridApi, true);

            console.log('🖥️ Exited fullscreen mode');
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎬 MAIN TOGGLE FUNCTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Toggle fullscreen mode
     * ฟังก์ชันหลักในการเปิด/ปิด fullscreen
     */
    function toggleFullscreen() {
        const container = document.getElementById(FULLSCREEN_CONFIG.containerId);
        const button = document.getElementById(FULLSCREEN_CONFIG.buttonId);

        if (!container || !button) {
            console.error('❌ Fullscreen elements not found');
            return;
        }

        // Get grid API from settings module
        const gridApi = window.settingsGridApi || null;

        // ตรวจสอบว่าอยู่ใน fallback fullscreen หรือไม่
        if (container.classList.contains('fallback-fullscreen')) {
            exitFallbackFullscreen(
                container,
                FULLSCREEN_CONFIG.gridId,
                FULLSCREEN_CONFIG.originalHeight
            );
            updateButtonState(button, false);
            resizeGrid(gridApi, true);
            return;
        }

        // ตรวจสอบว่าอยู่ใน native fullscreen หรือไม่
        if (isInNativeFullscreen()) {
            exitNativeFullscreen().catch(() => {
                // Fallback หาก native exit ล้มเหลว
                exitFallbackFullscreen(
                    container,
                    FULLSCREEN_CONFIG.gridId,
                    FULLSCREEN_CONFIG.originalHeight
                );
                updateButtonState(button, false);
                resizeGrid(gridApi, true);
            });
            return;
        }

        // พยายามเข้าสู่ fullscreen
        if (isFullscreenSupported()) {
            enterNativeFullscreen(container).catch(() => {
                // Fallback หาก native fullscreen ล้มเหลว
                enterFallbackFullscreen(container, FULLSCREEN_CONFIG.gridId);
                updateButtonState(button, true);
                resizeGrid(gridApi, false);
            });
        } else {
            // ใช้ fallback mode
            enterFallbackFullscreen(container, FULLSCREEN_CONFIG.gridId);
            updateButtonState(button, true);
            resizeGrid(gridApi, false);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🎯 EVENT LISTENERS INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * ติดตั้ง event listeners สำหรับปุ่ม fullscreen
     */
    function initializeFullscreenButton() {
        const button = document.getElementById(FULLSCREEN_CONFIG.buttonId);

        if (button) {
            button.addEventListener('click', toggleFullscreen);
            console.log('✅ Fullscreen button initialized');
        } else {
            console.warn('⚠️ Fullscreen button not found:', FULLSCREEN_CONFIG.buttonId);
        }
    }

    /**
     * ติดตั้ง event listeners สำหรับการเปลี่ยนแปลง fullscreen
     */
    function initializeFullscreenListeners() {
        // Add fullscreen change listeners (cross-browser)
        const events = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange'
        ];

        events.forEach(event => {
            document.addEventListener(event, handleFullscreenChange);
        });

        // ESC key handler สำหรับ fallback mode
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const container = document.getElementById(FULLSCREEN_CONFIG.containerId);
                const button = document.getElementById(FULLSCREEN_CONFIG.buttonId);

                if (container && container.classList.contains('fallback-fullscreen')) {
                    exitFallbackFullscreen(
                        container,
                        FULLSCREEN_CONFIG.gridId,
                        FULLSCREEN_CONFIG.originalHeight
                    );

                    if (button) {
                        updateButtonState(button, false);
                    }

                    // Get grid API from settings module
                    const gridApi = window.settingsGridApi || null;
                    resizeGrid(gridApi, true);

                    console.log('⌨️ ESC key pressed - exited fallback fullscreen');
                }
            }
        });

        console.log('✅ Fullscreen event listeners initialized');
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🚀 MODULE INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * เริ่มต้น fullscreen module
     */
    function initializeFullscreenModule() {
        initializeFullscreenButton();
        initializeFullscreenListeners();
        console.log('🎬 Settings Fullscreen Module initialized successfully');
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🌐 GLOBAL EXPORTS
    // ═══════════════════════════════════════════════════════════════════

    // Export functions to global scope
    window.SettingsFullscreen = {
        toggle: toggleFullscreen,
        initialize: initializeFullscreenModule,
        isInNativeFullscreen: isInNativeFullscreen
    };

    // ═══════════════════════════════════════════════════════════════════
    // 🎯 AUTO-INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Delay initialization to ensure other modules are loaded
        setTimeout(() => {
            initializeFullscreenModule();
        }, 300);
    });

    console.log('📦 Settings Fullscreen Module loaded successfully');

})();
