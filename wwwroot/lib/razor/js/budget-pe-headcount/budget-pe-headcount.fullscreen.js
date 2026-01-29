/**
 * PE Headcount By Cost Center Fullscreen Module
 * Handles fullscreen functionality for PE Headcount By Cost Center Grid
 */

// Store original heights for each grid
const originalHeights = {
  peHeadcountByCostCenter: '500px'
};

// Check if browser supports native fullscreen API
function isFullscreenSupported() {
  return !!(document.fullscreenEnabled || document.mozFullScreenEnabled ||
            document.webkitFullscreenEnabled || document.msFullscreenEnabled);
}

// Check if we're currently in native fullscreen
function isInNativeFullscreen() {
  return !!(document.fullscreenElement || document.mozFullScreenElement ||
            document.webkitFullscreenElement || document.msFullscreenElement);
}

// Enter native fullscreen
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

// Exit native fullscreen
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

// Enter fallback fullscreen (position: fixed)
function enterFallbackFullscreen(container, gridId) {
  container.classList.add('fallback-fullscreen');
  document.body.classList.add('fallback-fullscreen-active');

  // Set grid to full container size
  const grid = document.getElementById(gridId);
  if (grid) {
    grid.style.height = '100%';
    grid.style.width = '100%';
  }
}

// Exit fallback fullscreen
function exitFallbackFullscreen(container, gridId, originalHeight) {
  container.classList.remove('fallback-fullscreen');
  document.body.classList.remove('fallback-fullscreen-active');

  // Restore original grid size
  const grid = document.getElementById(gridId);
  if (grid) {
    grid.style.height = originalHeight;
    grid.style.width = '100%';
  }
}

// Helper function to get display name for grid
function getGridDisplayName(gridId) {
  const gridNames = {
    'budgetPEHeadcountGrid': 'PE Headcount By Cost Center Grid'
  };
  return gridNames[gridId] || gridId;
}

// Resize grid after fullscreen change
function resizeGrid(gridApi, isExitingFullscreen = false, gridName = 'Unknown') {
  // DISABLED: Causing column layout issues in fullscreen mode
  // Auto-sizing may interfere with natural grid behavior

  // Option 1: Auto-size all columns based on content
  if (gridApi && gridApi.autoSizeAllColumns) {
    setTimeout(() => {
      gridApi.autoSizeAllColumns();
    }, 100);
  }

  // Option 2: Size columns to fit container
  // if (gridApi && gridApi.sizeColumnsToFit) {
  //   setTimeout(() => {
  //     gridApi.sizeColumnsToFit();
  //   }, 100);
  // }

  // Refresh grid when exiting fullscreen to restore proper layout
  if (isExitingFullscreen && gridApi && gridApi.refreshCells) {
    setTimeout(() => {
      gridApi.refreshCells();
      //// console.log(`Grid "${gridName}" refreshed after exiting fullscreen ${gridApi ? '(with API)' : '(no API)'}`);
    }, 150);
  }

  // Current: No automatic resizing - let AG Grid handle it naturally
  //// console.log(`Grid resize called for "${gridName}", isExitingFullscreen:`, isExitingFullscreen);
}

// Handle fullscreen change events
function handleFullscreenChange(containerId, buttonId, gridId, gridApi, originalHeight) {
  const container = document.getElementById(containerId);
  const button = document.getElementById(buttonId);
  const grid = document.getElementById(gridId);

  if (!container || !button || !grid) return;

  // Determine grid name from gridId
  const gridName = getGridDisplayName(gridId);

  // Check if container is in fullscreen using safe selector checking
  let isFullscreen = false;

  if (isInNativeFullscreen()) {
    // Safely check each selector
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

  if (isFullscreen) {
    button.innerHTML = '🗗';
    button.title = 'Exit Fullscreen';
    grid.style.height = '97%';
    grid.style.width = '100%';
    resizeGrid(gridApi, false, gridName); // Entering fullscreen
  } else {
    button.innerHTML = '⛶';
    button.title = 'Toggle Fullscreen';
    grid.style.height = originalHeight;
    grid.style.width = '100%';
    resizeGrid(gridApi, true, gridName); // Exiting fullscreen - trigger refresh
  }
}

// Main toggle fullscreen function
function toggleFullscreen(containerId, buttonId, gridId, gridApi, originalHeight) {
  const container = document.getElementById(containerId);
  const button = document.getElementById(buttonId);

  if (!container || !button) return;

  // Determine grid name from gridId
  const gridName = getGridDisplayName(gridId);

  // Check if we're in fallback fullscreen
  if (container.classList.contains('fallback-fullscreen')) {
    exitFallbackFullscreen(container, gridId, originalHeight);
    button.innerHTML = '⛶';
    button.title = 'Toggle Fullscreen';
    resizeGrid(gridApi, true, gridName); // Exiting fullscreen
    return;
  }

  // Check if we're in native fullscreen
  if (isInNativeFullscreen()) {
    exitNativeFullscreen().catch(() => {
      // Fallback if native exit fails
      exitFallbackFullscreen(container, gridId, originalHeight);
      button.innerHTML = '⛶';
      button.title = 'Toggle Fullscreen';
      resizeGrid(gridApi, true, gridName); // Exiting fullscreen
    });
    return;
  }

  // Try to enter fullscreen
  if (isFullscreenSupported()) {
    enterNativeFullscreen(container).catch(() => {
      // Fallback if native fullscreen fails
      enterFallbackFullscreen(container, gridId);
      button.innerHTML = '🗗';
      button.title = 'Exit Fullscreen';
      resizeGrid(gridApi, false, gridName); // Entering fullscreen
    });
  } else {
    // Use fallback mode
    enterFallbackFullscreen(container, gridId);
    button.innerHTML = '🗗';
    button.title = 'Exit Fullscreen';
    resizeGrid(gridApi, false, gridName); // Entering fullscreen
  }
}

// Initialize fullscreen button event listeners
function initializeFullscreenButtons() {
  // PE Headcount By Cost Center Grid Fullscreen
  const peHeadcountByCostCenterBtn = document.getElementById('btnTogglepeHeadcountByCostCenterFullscreen');
  if (peHeadcountByCostCenterBtn) {
    peHeadcountByCostCenterBtn.addEventListener('click', () => {
      const peHeadcountByCostCenterGridApi = window.getGridApi ? window.getGridApi() : null;
      toggleFullscreen('budgetPEHeadcountGridContainer', 'btnToggleBudgetPEHeadcountFullscreen', 'budgetPEHeadcountGrid', peHeadcountByCostCenterGridApi, originalHeights.peHeadcountByCostCenter);
    });
  }

  // console.log('Fullscreen buttons initialized');
}

// Initialize fullscreen change listeners
function initializeFullscreenListeners() {
  // Add fullscreen change listeners
  ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => {
    document.addEventListener(event, () => {
      // PE Headcount By Cost Center Grid
      const peHeadcountByCostCenterGridApi = window.getGridApi ? window.getGridApi() : null;
      handleFullscreenChange('budgetPEHeadcountGridContainer', 'btnToggleBudgetPEHeadcountFullscreen', 'budgetPEHeadcountGrid', peHeadcountByCostCenterGridApi, originalHeights.peHeadcountByCostCenter);
    });
  });

  // ESC key handler for fallback mode
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const container = document.getElementById('budgetPEHeadcountGridContainer');
      if (container && container.classList.contains('fallback-fullscreen')) {
        const gridName = getGridDisplayName('budgetPEHeadcountGrid');
        exitFallbackFullscreen(container, 'budgetPEHeadcountGrid', originalHeights.peHeadcountByCostCenter);
        const button = document.getElementById('btnToggleBudgetPEHeadcountFullscreen');
        if (button) {
          button.innerHTML = '⛶';
          button.title = 'Toggle Fullscreen';
        }
        const gridApi = window.getGridApi ? window.getGridApi() : null;
        resizeGrid(gridApi, true, gridName);
      }
    }
  });

  // console.log('Fullscreen event listeners initialized');
}

// Initialize all fullscreen functionality
function initializeFullscreenModule() {
  initializeFullscreenButtons();
  initializeFullscreenListeners();
  // console.log('Fullscreen module initialized successfully');
}

// Export functions to global scope
window.toggleFullscreen = toggleFullscreen;
window.initializeFullscreenModule = initializeFullscreenModule;
window.isInNativeFullscreen = isInNativeFullscreen;
window.resizeGrid = resizeGrid;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization to ensure other modules are loaded
  setTimeout(() => {
    initializeFullscreenModule();
  }, 200);
});

// console.log('PE Bonus By Cost Center fullscreen module loaded successfully');
