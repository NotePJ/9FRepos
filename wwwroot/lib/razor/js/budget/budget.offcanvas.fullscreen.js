/**
 * Budget Offcanvas Fullscreen Manager
 * Handles offcanvas DOM manipulation when entering/exiting fullscreen mode
 * Maintains proper z-index hierarchy and offcanvas functionality
 */

// Configuration for offcanvas fullscreen management
const OFFCANVAS_FULLSCREEN_CONFIG = {
  // Offcanvas selectors
  selectors: {
    offcanvasAddRow: '#offcanvasAddRow',
    offcanvasBenefits: '#offcanvasBenefits',
    offcanvasBackdrop: '.offcanvas-backdrop',
    fullscreenContainers: '.grid-container, .fallback-fullscreen'
  },

  // CSS classes for fullscreen state
  classes: {
    offcanvasInFullscreen: 'offcanvas-in-fullscreen',
    backdropInFullscreen: 'offcanvas-backdrop-in-fullscreen',
    fullscreenActive: 'fallback-fullscreen-active'
  },

  // Z-index values for proper layering - Higher values for fullscreen
  zIndex: {
    offcanvasInFullscreen: 9999,
    backdropInFullscreen: 9998,
    offcanvasNormal: 1100,
    backdropNormal: 1099
  },

  // Data attributes for storing original parent
  dataAttributes: {
    originalParent: 'data-original-parent-id',
    originalNextSibling: 'data-original-next-sibling-id'
  }
};

/**
 * Store original DOM positions for restoration
 */
class OffcanvasPositionTracker {
  constructor() {
    this.originalPositions = new Map();
  }

  /**
   * Store original position of an offcanvas element
   * @param {HTMLElement} element - The offcanvas element
   */
  storeOriginalPosition(element) {
    if (!element) return;

    const elementId = element.id;
    const parentElement = element.parentElement;
    const nextSibling = element.nextElementSibling;

    this.originalPositions.set(elementId, {
      parent: parentElement,
      nextSibling: nextSibling,
      parentId: parentElement?.id || null,
      nextSiblingId: nextSibling?.id || null
    });

    // Store in data attributes as backup
    element.setAttribute(OFFCANVAS_FULLSCREEN_CONFIG.dataAttributes.originalParent,
                        parentElement?.id || '');
    element.setAttribute(OFFCANVAS_FULLSCREEN_CONFIG.dataAttributes.originalNextSibling,
                        nextSibling?.id || '');

    // console.log(`📍 Stored original position for ${elementId}:`, {
    //   parentId: parentElement?.id,
    //   nextSiblingId: nextSibling?.id
    // });
  }

  /**
   * Get original position of an offcanvas element
   * @param {string} elementId - The ID of the offcanvas element
   * @returns {Object|null} Original position data
   */
  getOriginalPosition(elementId) {
    return this.originalPositions.get(elementId) || null;
  }

  /**
   * Clear stored position for an element
   * @param {string} elementId - The ID of the offcanvas element
   */
  clearPosition(elementId) {
    this.originalPositions.delete(elementId);

    const element = document.getElementById(elementId);
    if (element) {
      element.removeAttribute(OFFCANVAS_FULLSCREEN_CONFIG.dataAttributes.originalParent);
      element.removeAttribute(OFFCANVAS_FULLSCREEN_CONFIG.dataAttributes.originalNextSibling);
    }
  }

  /**
   * Clear all stored positions
   */
  clearAllPositions() {
    this.originalPositions.clear();
  }
}

// Global instance of position tracker
const offcanvasPositionTracker = new OffcanvasPositionTracker();

/**
 * Check if any fullscreen mode is currently active
 * @returns {boolean} True if fullscreen is active
 */
function isFullscreenActive() {
  // Check native fullscreen API
  const nativeFullscreen = !!(document.fullscreenElement ||
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement);

  // Check fallback fullscreen
  const fallbackFullscreen = document.body.classList.contains(
    OFFCANVAS_FULLSCREEN_CONFIG.classes.fullscreenActive
  );

  return nativeFullscreen || fallbackFullscreen;
}

/**
 * Get the current fullscreen container element
 * @returns {HTMLElement|null} The fullscreen container or null
 */
function getFullscreenContainer() {
  // Check native fullscreen first
  const nativeFullscreenElement = document.fullscreenElement ||
                                 document.webkitFullscreenElement ||
                                 document.mozFullScreenElement;

  if (nativeFullscreenElement) {
    return nativeFullscreenElement;
  }

  // Check fallback fullscreen
  const fallbackFullscreen = document.querySelector('.fallback-fullscreen');
  if (fallbackFullscreen) {
    return fallbackFullscreen;
  }

  return null;
}

/**
 * Move offcanvas elements to fullscreen container
 * @param {HTMLElement} fullscreenContainer - The fullscreen container element
 */
function moveOffcanvasToFullscreen(fullscreenContainer) {
  if (!fullscreenContainer) {
    // console.warn('⚠️ No fullscreen container provided for offcanvas movement');
    return;
  }

  // console.log('🔄 Moving offcanvas elements to fullscreen container', fullscreenContainer);

  // Get all offcanvas elements
  const offcanvasElements = [
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasAddRow),
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasBenefits)
  ].filter(Boolean);

  // Get all backdrop elements
  const backdropElements = Array.from(
    document.querySelectorAll(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasBackdrop)
  );

  // Move offcanvas elements
  offcanvasElements.forEach(offcanvas => {
    if (offcanvas && !fullscreenContainer.contains(offcanvas)) {
      // Store original position before moving
      offcanvasPositionTracker.storeOriginalPosition(offcanvas);

      // Add fullscreen class and aggressive z-index
      offcanvas.classList.add(OFFCANVAS_FULLSCREEN_CONFIG.classes.offcanvasInFullscreen);
      offcanvas.style.zIndex = OFFCANVAS_FULLSCREEN_CONFIG.zIndex.offcanvasInFullscreen + '!important';
      offcanvas.style.position = 'fixed !important';

      // Force show above everything
      offcanvas.style.top = '0';
      offcanvas.style.left = 'auto';
      offcanvas.style.right = '0';
      offcanvas.style.bottom = '0';
      offcanvas.style.height = '100vh';

      fullscreenContainer.appendChild(offcanvas);

      // console.log(`✅ Moved ${offcanvas.id} to fullscreen container with z-index: ${OFFCANVAS_FULLSCREEN_CONFIG.zIndex.offcanvasInFullscreen}`);
    }
  });

  // Move backdrop elements
  backdropElements.forEach(backdrop => {
    if (backdrop && !fullscreenContainer.contains(backdrop)) {
      // Store original position
      if (backdrop.id) {
        offcanvasPositionTracker.storeOriginalPosition(backdrop);
      }

      // Add fullscreen class and aggressive z-index
      backdrop.classList.add(OFFCANVAS_FULLSCREEN_CONFIG.classes.backdropInFullscreen);
      backdrop.style.zIndex = OFFCANVAS_FULLSCREEN_CONFIG.zIndex.backdropInFullscreen + '!important';
      backdrop.style.position = 'fixed !important';

      // Force backdrop to cover fullscreen
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.right = '0';
      backdrop.style.bottom = '0';
      backdrop.style.width = '100vw';
      backdrop.style.height = '100vh';

      fullscreenContainer.appendChild(backdrop);

      // console.log('✅ Moved offcanvas backdrop to fullscreen container with z-index:', OFFCANVAS_FULLSCREEN_CONFIG.zIndex.backdropInFullscreen);
    }
  });
}

/**
 * Restore offcanvas elements to their original positions
 */
function restoreOffcanvasToOriginalPosition() {
  // console.log('🔄 Restoring offcanvas elements to original positions');

  // Get all offcanvas elements that were moved to fullscreen
  const offcanvasElements = [
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasAddRow),
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasBenefits)
  ].filter(Boolean);

  // Get all backdrop elements
  const backdropElements = Array.from(
    document.querySelectorAll(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasBackdrop)
  );

  // Restore offcanvas elements
  offcanvasElements.forEach(offcanvas => {
    if (offcanvas.classList.contains(OFFCANVAS_FULLSCREEN_CONFIG.classes.offcanvasInFullscreen)) {
      const originalPosition = offcanvasPositionTracker.getOriginalPosition(offcanvas.id);

      if (originalPosition && originalPosition.parent) {
        // Remove fullscreen classes and reset all styles
        offcanvas.classList.remove(OFFCANVAS_FULLSCREEN_CONFIG.classes.offcanvasInFullscreen);
        offcanvas.style.zIndex = '';
        offcanvas.style.position = '';
        offcanvas.style.top = '';
        offcanvas.style.left = '';
        offcanvas.style.right = '';
        offcanvas.style.bottom = '';
        offcanvas.style.height = '';

        // Restore to original position
        if (originalPosition.nextSibling && originalPosition.parent.contains(originalPosition.nextSibling)) {
          originalPosition.parent.insertBefore(offcanvas, originalPosition.nextSibling);
        } else {
          originalPosition.parent.appendChild(offcanvas);
        }

        // console.log(`✅ Restored ${offcanvas.id} to original position`);

        // Clear stored position
        offcanvasPositionTracker.clearPosition(offcanvas.id);
      } else {
        // Fallback: move to document body
        // console.warn(`⚠️ No original position found for ${offcanvas.id}, moving to body`);
        document.body.appendChild(offcanvas);

        // Reset all styles
        offcanvas.classList.remove(OFFCANVAS_FULLSCREEN_CONFIG.classes.offcanvasInFullscreen);
        offcanvas.style.zIndex = '';
        offcanvas.style.position = '';
        offcanvas.style.top = '';
        offcanvas.style.left = '';
        offcanvas.style.right = '';
        offcanvas.style.bottom = '';
        offcanvas.style.height = '';
      }
    }
  });

  // Restore backdrop elements
  backdropElements.forEach(backdrop => {
    if (backdrop.classList.contains(OFFCANVAS_FULLSCREEN_CONFIG.classes.backdropInFullscreen)) {
      const backdropId = backdrop.id;
      const originalPosition = backdropId ?
        offcanvasPositionTracker.getOriginalPosition(backdropId) : null;

      // Remove fullscreen classes and reset all styles
      backdrop.classList.remove(OFFCANVAS_FULLSCREEN_CONFIG.classes.backdropInFullscreen);
      backdrop.style.zIndex = '';
      backdrop.style.position = '';
      backdrop.style.top = '';
      backdrop.style.left = '';
      backdrop.style.right = '';
      backdrop.style.bottom = '';
      backdrop.style.width = '';
      backdrop.style.height = '';

      if (originalPosition && originalPosition.parent) {
        // Restore to original position
        if (originalPosition.nextSibling && originalPosition.parent.contains(originalPosition.nextSibling)) {
          originalPosition.parent.insertBefore(backdrop, originalPosition.nextSibling);
        } else {
          originalPosition.parent.appendChild(backdrop);
        }

        // console.log('✅ Restored offcanvas backdrop to original position');

        // Clear stored position
        if (backdropId) {
          offcanvasPositionTracker.clearPosition(backdropId);
        }
      } else {
        // Fallback: move to document body
        document.body.appendChild(backdrop);
        // console.log('✅ Moved offcanvas backdrop to body (fallback)');
      }
    }
  });
}

/**
 * Handle fullscreen enter event
 * Called when entering fullscreen mode
 */
function handleFullscreenEnter() {
  // console.log('🎯 Handling fullscreen enter - moving offcanvas elements');

  const fullscreenContainer = getFullscreenContainer();
  if (fullscreenContainer) {
    moveOffcanvasToFullscreen(fullscreenContainer);
  } else {
    // console.warn('⚠️ No fullscreen container found during fullscreen enter');
  }
}

/**
 * Handle fullscreen exit event
 * Called when exiting fullscreen mode
 */
function handleFullscreenExit() {
  // console.log('🎯 Handling fullscreen exit - restoring offcanvas elements');

  // Small delay to ensure fullscreen transition is complete
  setTimeout(() => {
    restoreOffcanvasToOriginalPosition();
  }, 50);
}

/**
 * Setup fullscreen change event listeners
 * Monitors both native and fallback fullscreen events
 */
function setupFullscreenOffcanvasListeners() {
  // console.log('🎯 Setting up fullscreen offcanvas listeners');

  // Native fullscreen events
  document.addEventListener('fullscreenchange', handleFullscreenStateChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenStateChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenStateChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenStateChange);

  // Fallback fullscreen events (custom events from budget.fullscreen.js)
  document.addEventListener('fallbackFullscreenEnter', handleFullscreenEnter);
  document.addEventListener('fallbackFullscreenExit', handleFullscreenExit);

  // Listen for offcanvas show events to sync position
  document.addEventListener('show.bs.offcanvas', function(e) {
    // console.log('🎯 Offcanvas show detected, checking fullscreen state');
    if (isFullscreenActive()) {
      setTimeout(() => {
        // console.log('🔄 Auto-syncing offcanvas position after show');
        forceUpdateOffcanvasPositions();
      }, 100);
    }
  });

  document.addEventListener('show.coreui.offcanvas', function(e) {
    // console.log('🎯 CoreUI Offcanvas show detected, checking fullscreen state');
    if (isFullscreenActive()) {
      setTimeout(() => {
        // console.log('🔄 Auto-syncing offcanvas position after CoreUI show');
        forceUpdateOffcanvasPositions();
      }, 100);
    }
  });

  // Additional monitoring for DOM changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // Check if fallback-fullscreen-active class was added/removed from body
      if (mutation.target === document.body &&
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class') {

        const isCurrentlyFullscreen = isFullscreenActive();
        const wasFullscreen = mutation.oldValue?.includes(
          OFFCANVAS_FULLSCREEN_CONFIG.classes.fullscreenActive
        ) || false;

        if (isCurrentlyFullscreen && !wasFullscreen) {
          // console.log('📱 Detected fallback fullscreen activation via mutation observer');
          setTimeout(handleFullscreenEnter, 100);
        } else if (!isCurrentlyFullscreen && wasFullscreen) {
          // console.log('📱 Detected fallback fullscreen deactivation via mutation observer');
          handleFullscreenExit();
        }
      }

      // Check for new offcanvas elements being added to DOM
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this is an offcanvas or contains offcanvas
            const offcanvasElements = node.matches && node.matches('.offcanvas') ?
              [node] : node.querySelectorAll ? node.querySelectorAll('.offcanvas') : [];

            if (offcanvasElements.length > 0 && isFullscreenActive()) {
              // console.log('🎯 New offcanvas detected in fullscreen mode, syncing...');
              setTimeout(forceUpdateOffcanvasPositions, 50);
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true
  });

  // console.log('✅ Fullscreen offcanvas listeners setup complete');
}

/**
 * Handle fullscreen state change for native fullscreen API
 */
function handleFullscreenStateChange() {
  const isCurrentlyFullscreen = isFullscreenActive();

  if (isCurrentlyFullscreen) {
    // console.log('📱 Native fullscreen activated');
    handleFullscreenEnter();
  } else {
    // console.log('📱 Native fullscreen deactivated');
    handleFullscreenExit();
  }
}

/**
 * Force update offcanvas positions
 * Useful for manual synchronization
 */
function forceUpdateOffcanvasPositions() {
  // console.log('🔄 Force updating offcanvas positions');

  if (isFullscreenActive()) {
    const fullscreenContainer = getFullscreenContainer();
    if (fullscreenContainer) {
      moveOffcanvasToFullscreen(fullscreenContainer);
    }
  } else {
    restoreOffcanvasToOriginalPosition();
  }
}

/**
 * Get current offcanvas fullscreen status
 * @returns {Object} Status information
 */
function getOffcanvasFullscreenStatus() {
  const isFullscreen = isFullscreenActive();
  const fullscreenContainer = getFullscreenContainer();
  const offcanvasElements = [
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasAddRow),
    document.querySelector(OFFCANVAS_FULLSCREEN_CONFIG.selectors.offcanvasBenefits)
  ].filter(Boolean);

  return {
    isFullscreenActive: isFullscreen,
    fullscreenContainer: fullscreenContainer,
    offcanvasCount: offcanvasElements.length,
    offcanvasInFullscreen: offcanvasElements.filter(el =>
      el.classList.contains(OFFCANVAS_FULLSCREEN_CONFIG.classes.offcanvasInFullscreen)
    ).length,
    storedPositions: offcanvasPositionTracker.originalPositions.size
  };
}

/**
 * Initialize offcanvas fullscreen management
 * Call this after DOM is ready
 */
function initializeOffcanvasFullscreenManager() {
  // console.log('🚀 Initializing Offcanvas Fullscreen Manager');

  // Setup event listeners
  setupFullscreenOffcanvasListeners();

  // Check initial state and adjust if needed
  if (isFullscreenActive()) {
    // console.log('📱 Initial fullscreen state detected - adjusting offcanvas positions');
    handleFullscreenEnter();
  }

  // Add debug helper to window for testing
  window.debugOffcanvasFullscreen = function() {
    const status = getOffcanvasFullscreenStatus();
    // console.log('🔍 Offcanvas Fullscreen Debug Info:', status);

    // Check current z-index of offcanvas elements
    const offcanvasElements = document.querySelectorAll('.offcanvas');
    offcanvasElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      // console.log(`🎯 ${el.id || 'unnamed'} offcanvas:`, {
      //   zIndex: computedStyle.zIndex,
      //   position: computedStyle.position,
      //   display: computedStyle.display,
      //   visibility: computedStyle.visibility,
      //   classes: el.className,
      //   parent: el.parentElement?.tagName,
      //   inFullscreenContainer: getFullscreenContainer()?.contains(el)
      // });
    });

    return status;
  };

  // console.log('✅ Offcanvas Fullscreen Manager initialized successfully');
  // console.log('💡 Use window.debugOffcanvasFullscreen() to debug offcanvas positioning');
}

// Export functions to global scope for use by other modules
window.initializeOffcanvasFullscreenManager = initializeOffcanvasFullscreenManager;
window.forceUpdateOffcanvasPositions = forceUpdateOffcanvasPositions;
window.getOffcanvasFullscreenStatus = getOffcanvasFullscreenStatus;
window.handleFullscreenEnter = handleFullscreenEnter;
window.handleFullscreenExit = handleFullscreenExit;

// Export configuration for external access
window.OFFCANVAS_FULLSCREEN_CONFIG = OFFCANVAS_FULLSCREEN_CONFIG;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure other modules are loaded
  setTimeout(initializeOffcanvasFullscreenManager, 100);
});

// console.log('📄 Budget Offcanvas Fullscreen Manager module loaded');
