/**
 * Budget Core Functions
 * Core utilities and helper functions used throughout the budget system
 * Updated: 14 Jan 2026 - Support IIS virtual directory
 */

// Get base URL for SVG icons (supports IIS virtual directory)
const SVG_BASE_PATH = (window.AppConfig && window.AppConfig.baseUrl) ? window.AppConfig.baseUrl + 'lib/adcoreui/icons/svg/free.svg' : './lib/adcoreui/icons/svg/free.svg';

// Format currency helper function
function formatCurrency(value) {
  if (value == null || value === '') return '0';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Format number without currency symbol, showing decimals
function formatNumber(value) {
  if (value == null || value === '') return '0';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Get Offcanvas instance (CoreUI or Bootstrap fallback)
function getOffcanvasInstance(element) {
  var coreuiObj = window.coreui || window.CoreUI;
  if (coreuiObj && coreuiObj.Offcanvas && typeof coreuiObj.Offcanvas.getOrCreateInstance === 'function') {
    return coreuiObj.Offcanvas.getOrCreateInstance(element);
  }
  if (window.bootstrap && window.bootstrap.Offcanvas && typeof window.bootstrap.Offcanvas.getOrCreateInstance === 'function') {
    return window.bootstrap.Offcanvas.getOrCreateInstance(element);
  }
  alert('Offcanvas JS is not loaded.');
  throw new Error('Offcanvas JS is not loaded.');
}

// Debounce function to prevent rapid API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get current year from filter or default to current year
function getCurrentYear() {
  const selectedYear = document.getElementById('yearsFilter')?.value;
  // console.log('Current selected year:', selectedYear);
  return selectedYear || new Date().getFullYear();
}

// Get last year from filter or default to last year
function LastYear() {
  const selectedYear = document.getElementById('yearsFilter')?.value;
  return selectedYear ? (parseInt(selectedYear) - 1).toString() : (new Date().getFullYear() - 1).toString();
}

// Utility function for smooth scrolling with fallback
function smoothScrollToElement(element, options = {}) {
  if (!element) {
    // console.warn('smoothScrollToElement: Element not found');
    return;
  }

  // console.log('Scrolling to element:', element);

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    offset: 0
  };

  const scrollOptions = { ...defaultOptions, ...options };

  try {
    // Calculate element position
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;
    const offsetPosition = elementTop + (scrollOptions.offset || 0);

    // Use window.scrollTo with offset support
    window.scrollTo({
      top: offsetPosition,
      behavior: scrollOptions.behavior || 'smooth'
    });

    // console.log('Scroll executed successfully with offset:', scrollOptions.offset);
  } catch (error) {
    // Fallback for older browsers
    // console.warn('Enhanced scroll failed, using basic fallback:', error);

    const elementTop = element.offsetTop;
    const offsetPosition = elementTop + (scrollOptions.offset || -20);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Show page loading overlay
function showPageLoading(text = 'Data...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('d-none');
}

// Hide page loading overlay
function hidePageLoading() {
  document.getElementById('loadingOverlay').classList.add('d-none');
}

// Show specific dropdown spinner
function showDropdownSpinner(spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) {
    spinner.classList.remove('d-none');
  }
}

// Hide specific dropdown spinner
function hideDropdownSpinner(spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) {
    spinner.classList.add('d-none');
  }
}

// Show grid loading spinner
function showGridLoading() {
  document.getElementById('gridLoadingSpinner').classList.remove('d-none');
}

// Hide grid loading spinner
function hideGridLoading() {
  document.getElementById('gridLoadingSpinner').classList.add('d-none');
}

// Show offcanvas loading overlay
function showOffcanvasLoading(text = 'Loading...', offcanvasId = 'offcanvasEditRow') {
  //const offcanvasBody = document.querySelector(`#${offcanvasId} .offcanvas-body`);
  //offcanvas offcanvas-end show
  const offcanvasBody = document.querySelector(`#${offcanvasId} .offcanvas-body`);
  if (offcanvasBody) {
    // Disable scroll bar for offcanvas body
    offcanvasBody.style.overflow = 'hidden';
    offcanvasBody.scrollTop = 0;
    setTimeout(() => {
      if (offcanvasBody.style.position !== 'absolute') {
        offcanvasBody.style.position = 'absolute';
      }
    }, 100);

    // Create loading overlay if it doesn't exist
    let loadingOverlay = offcanvasBody.querySelector('.offcanvas-loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'offcanvas-loading-overlay position-absolute top-0 start-0 w-100 h-100 vh-100 d-flex justify-content-center align-items-center';
      loadingOverlay.style.cssText = 'background-color: var(--cui-body-bg, rgba(255, 255, 255, 0.9)); z-index: 1050; backdrop-filter: blur(2px)';
      loadingOverlay.innerHTML = `
        <div class="text-center">
          <div class="spinner-border spinner-border-lg mb-3" role="status" style="width: 3rem; height: 3rem; color: var(--cui-primary, #0d6efd);">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="loading-text mb-3" style="color: var(--cui-body-color, #333); font-weight: 500;">${text}</div>
          <div class="progress" style="width: 320px; height: 28px; margin: 0 auto; background-color: rgba(0, 0, 0, 0.1); border-radius: 8px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 id="offcanvasProgressBar"
                 role="progressbar"
                 style="width: 0%; font-size: 13px; font-weight: 600; background-color: var(--cui-primary, #0d6efd);"
                 aria-valuenow="0"
                 aria-valuemin="0"
                 aria-valuemax="100">
              <span id="offcanvasProgressText">0%</span>
            </div>
          </div>
        </div>
      `;
      offcanvasBody.appendChild(loadingOverlay);
    } else {
      const loadingText = loadingOverlay.querySelector('.loading-text');
      if (loadingText) loadingText.textContent = text;
      loadingOverlay.classList.remove('d-none');

      // Reset progress bar when showing again
      const progressBar = loadingOverlay.querySelector('#offcanvasProgressBar');
      const progressText = loadingOverlay.querySelector('#offcanvasProgressText');
      if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', '0');
      }
      if (progressText) {
        progressText.textContent = '0%';
      }
    }
  }
}

// Hide offcanvas loading overlay
function hideOffcanvasLoading(offcanvasId = 'offcanvasEditRow') {
  const loadingOverlay = document.querySelector(`#${offcanvasId} .offcanvas-loading-overlay`);
  if (loadingOverlay) {
    loadingOverlay.classList.add('d-none');
  }
  // Re-enable scroll bar for offcanvas body and reset scroll position
  const offcanvasBody = document.querySelector(`#${offcanvasId} .offcanvas-body`);
  if (offcanvasBody) {
    offcanvasBody.style.overflow = 'auto';
    // Reset scroll position to top
    offcanvasBody.scrollTop = 0;
    setTimeout(() => {
      if (offcanvasBody.style.position !== 'relative') {
        offcanvasBody.style.position = 'relative';
      }
    }, 300);

  }
}

// Update offcanvas loading progress
function updateOffcanvasProgress(percentage, text = null, offcanvasId = 'offcanvasEditRow') {
  const loadingOverlay = document.querySelector(`#${offcanvasId} .offcanvas-loading-overlay`);
  if (!loadingOverlay) return;

  const progressBar = loadingOverlay.querySelector('#offcanvasProgressBar');
  const progressText = loadingOverlay.querySelector('#offcanvasProgressText');
  const loadingText = loadingOverlay.querySelector('.loading-text');

  // Ensure percentage is between 0 and 100
  const safePercentage = Math.min(100, Math.max(0, percentage));

  if (progressBar) {
    progressBar.style.width = safePercentage + '%';
    progressBar.setAttribute('aria-valuenow', safePercentage);
  }

  if (progressText) {
    progressText.textContent = safePercentage + '%';
  }

  if (text && loadingText) {
    loadingText.textContent = text;
  }
}

// Reusable modal warning function
window.showWarningModal = function (msg) {
  if ($('#genericWarningModal').length === 0) {
    $('body').append(`
        <div class="modal fade" id="genericWarningModal" tabindex="-1" aria-labelledby="genericWarningLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="genericWarningLabel">Warning</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="genericWarningMsg">
                <!-- Message will be injected here -->
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-warning" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
      `);
  }
  $('#genericWarningMsg').text(msg);
  const modalEl = document.getElementById('genericWarningModal');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

  // ผูก click event เองเพื่อให้ปิด modal ได้
  const okBtn = modalEl.querySelector('.btn-warning');
  const closeBtn = modalEl.querySelector('.btn-close');

  if (okBtn) okBtn.onclick = () => modal.hide();
  if (closeBtn) closeBtn.onclick = () => modal.hide();

  modal.show();
};

// Reusable modal success function
window.showSuccessModal = function (msg) {
  if ($('#genericSuccessModal').length === 0) {
    $('body').append(`
        <div class="modal fade" id="genericSuccessModal" tabindex="-1" aria-labelledby="genericSuccessLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal">
            <div class="modal-content">
              <div class="modal-body">
                <div class="d-flex align-items-start">
                  <div class="flex-shrink-0 me-3">
                    <svg class="nav-icon nav-icon-xl text-success">
                      <use xlink:href="${SVG_BASE_PATH}#cil-check-circle"></use>
                    </svg>
                  </div>
                  <div class="flex-grow-1">
                    <h5 class="mb-2" id="genericSuccessLabel">Success</h5>
                    <p class="mb-0 text-muted" id="genericSuccessMsg"></p>
                  </div>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
              </div>
              <div class="modal-footer justify-content-end">
                <button type="button" class="btn btn-core" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
      `);
  }
  $('#genericSuccessMsg').text(msg);
  const modalEl = document.getElementById('genericSuccessModal');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

  // ผูก click event เองเพื่อให้ปิด modal ได้
  const okBtn = modalEl.querySelector('.btn-core');
  const closeBtn = modalEl.querySelector('.btn-close');

  if (okBtn) okBtn.onclick = () => modal.hide();
  if (closeBtn) closeBtn.onclick = () => modal.hide();

  modal.show();
};

// Reusable modal error function
window.showErrorModal = function (msg) {
  if ($('#genericErrorModal').length === 0) {
    $('body').append(`
        <div class="modal fade" id="genericErrorModal" tabindex="-1" aria-labelledby="genericErrorLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal">
            <div class="modal-content">
              <div class="modal-body">
                <div class="d-flex align-items-start">
                  <div class="flex-shrink-0 me-3">
                    <svg class="nav-icon nav-icon-xl text-danger">
                      <use xlink:href="${SVG_BASE_PATH}#cil-x-circle"></use>
                    </svg>
                  </div>
                  <div class="flex-grow-1">
                    <h5 class="mb-2" id="genericErrorLabel">Error</h5>
                    <p class="mb-0 text-muted" id="genericErrorMsg"></p>
                  </div>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
              </div>
              <div class="modal-footer justify-content-end">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
      `);
  }
  $('#genericErrorMsg').text(msg);
  const modalEl = document.getElementById('genericErrorModal');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

  // ผูก click event เองเพื่อให้ปิด modal ได้
  const okBtn = modalEl.querySelector('.btn-danger');
  const closeBtn = modalEl.querySelector('.btn-close');

  if (okBtn) okBtn.onclick = () => modal.hide();
  if (closeBtn) closeBtn.onclick = () => modal.hide();

  modal.show();
};

// Export functions to global scope for use by other modules
window.getOffcanvasInstance = getOffcanvasInstance;
window.debounce = debounce;
window.getCurrentYear = getCurrentYear;
window.LastYear = LastYear;
window.smoothScrollToElement = smoothScrollToElement;
window.showDropdownSpinner = showDropdownSpinner;
window.hideDropdownSpinner = hideDropdownSpinner;
window.showGridLoading = showGridLoading;
window.hideGridLoading = hideGridLoading;
window.showOffcanvasLoading = showOffcanvasLoading;
window.hideOffcanvasLoading = hideOffcanvasLoading;
window.updateOffcanvasProgress = updateOffcanvasProgress;
window.showWarningModal = showWarningModal;

// === Master Grid Fullscreen Utilities ===

// Check if masterGrid is currently in fullscreen mode
function isMasterGridInFullscreen() {
  const container = document.getElementById('masterGridContainer');
  if (!container) return false;

  // Check for fallback fullscreen
  if (container.classList.contains('fallback-fullscreen')) {
    return true;
  }

  // Check for native fullscreen
  const isNativeFullscreen = !!(document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement);

  if (isNativeFullscreen) {
    try {
      return container.matches(':fullscreen') ||
        container.matches(':-webkit-full-screen') ||
        container.matches(':-moz-full-screen');
    } catch (e) {
      // Fallback check - compare with fullscreen element
      return document.fullscreenElement === container ||
        document.mozFullScreenElement === container ||
        document.webkitFullscreenElement === container ||
        document.msFullscreenElement === container;
    }
  }

  return false;
}

// Exit masterGrid fullscreen mode
function exitMasterGridFullscreen() {
  const container = document.getElementById('masterGridContainer');
  const button = document.getElementById('btnToggleMasterFullscreen');
  const grid = document.getElementById('masterGrid');

  if (!container || !button || !grid) {
    // console.warn('Master grid elements not found for fullscreen exit');
    return;
  }

  try {
    // Check if in fallback fullscreen
    if (container.classList.contains('fallback-fullscreen')) {
      // Exit fallback fullscreen
      container.classList.remove('fallback-fullscreen');
      document.body.classList.remove('fallback-fullscreen-active');

      // Restore original grid size
      grid.style.height = '400px';
      grid.style.width = '100%';

      // Update button
      button.innerHTML = '⛶';
      button.title = 'Toggle Fullscreen';

      // console.log('Exited fallback fullscreen for master grid');

      // Resize grid after exit
      const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;
      if (masterGridApi) {
        setTimeout(() => {
          masterGridApi.sizeColumnsToFit();
        }, 100);
      }

      return;
    }

    // Check if in native fullscreen
    const isNativeFullscreen = !!(document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement);

    if (isNativeFullscreen) {
      // Exit native fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      // console.log('Exited native fullscreen for master grid');
      return;
    }

    // console.log('Master grid is not in fullscreen mode');

  } catch (error) {
    // console.error('Error exiting master grid fullscreen:', error);
  }
}

// Add auto-exit fullscreen listener for masterGrid
function addAutoExitFullscreenListener() {
  // Wait for masterGridApi to be available
  const checkMasterGrid = () => {
    const masterGridApi = window.getMasterGridApi ? window.getMasterGridApi() : null;

    if (masterGridApi) {
      // console.log('Adding auto-exit fullscreen listener to master grid');

      // Add selection changed listener
      masterGridApi.addEventListener('selectionChanged', () => {
        try {
          // console.log('Master grid selection changed detected');

          // Check if master grid is in fullscreen
          if (isMasterGridInFullscreen()) {
            // console.log('Master grid is in fullscreen mode');
            const selectedRows = masterGridApi.getSelectedRows();
            // console.log('Selected rows:', selectedRows);

            // If any rows are selected, exit fullscreen
            if (selectedRows && selectedRows.length > 0) {
              // console.log('Row selected in fullscreen mode, auto-exiting fullscreen');
              exitMasterGridFullscreen();
            }
          }
        } catch (error) {
          // console.error('Error in master grid selection handler:', error);
        }
      });

      // console.log('Auto-exit fullscreen listener added successfully');
    } else {
      // Retry after a short delay
      // console.log('Waiting for master grid API to be available...');
      setTimeout(checkMasterGrid, 200);
    }
  };

  // Start checking for masterGridApi
  checkMasterGrid();
}

// Export master grid fullscreen functions
window.isMasterGridInFullscreen = isMasterGridInFullscreen;
window.exitMasterGridFullscreen = exitMasterGridFullscreen;
window.addAutoExitFullscreenListener = addAutoExitFullscreenListener;

// === Company-Specific Utility Functions ===

// Get company configuration by ID
function getCompanyConfig(companyId) {
  const id = companyId?.toString();
  if (id === '1') return COMPANY_CONFIG.BJC;
  if (id === '2') return COMPANY_CONFIG.BIGC;
  return null;
}

// Detect current company from UI selection
function detectCurrentCompany() {
  const companyFilter = document.getElementById('companyFilter');
  const companyId = companyFilter?.value;

  if (!companyId) {
    return {
      id: null,
      config: null,
      isValid: false,
      error: 'No company selected'
    };
  }

  const config = getCompanyConfig(companyId);
  return {
    id: companyId,
    config: config,
    isValid: !!config,
    error: config ? null : 'Invalid company ID'
  };
}

// Get current COBU selection
function getCurrentCoBU() {
  const cobuFilter = document.getElementById('cobuFilter');
  return cobuFilter?.value || null;
}

// Get current budget year selection
function getCurrentBudgetYear() {
  const yearFilter = document.getElementById('yearsFilter');
  return yearFilter?.value || new Date().getFullYear().toString();
}

// Validate company-specific field requirements
function validateCompanyFields(companyId, fields = {}) {
  const company = detectCurrentCompany();

  if (!company.isValid) {
    return {
      isValid: false,
      error: company.error,
      missingFields: []
    };
  }

  const missingFields = [];
  const requiredFields = COMPANY_FIELD_CONFIG.DEFAULT_PARAMS;

  // Check default required fields
  requiredFields.forEach(field => {
    const value = fields[field] || getCurrentFieldValue(field);
    if (!value) {
      missingFields.push(field);
    }
  });

  // Company-specific validation
  const companyParams = COMPANY_FIELD_CONFIG.COMPANY_PARAMS[companyId];
  if (companyParams?.requiresRunrate && !fields.runrateCode) {
    missingFields.push('runrateCode');
  }

  return {
    isValid: missingFields.length === 0,
    error: missingFields.length > 0 ? `Missing required fields: ${missingFields.join(', ')}` : null,
    missingFields: missingFields
  };
}

// Helper to get current field values from UI
function getCurrentFieldValue(fieldName) {
  switch (fieldName) {
    case 'CompanyID':
      return getSelectedCompanyID();
    case 'COBU':
      return getCurrentCoBU();
    case 'BudgetYear':
      return getCurrentBudgetYear();
    default:
      return null;
  }
}

// Build standard API parameters with company validation
function buildStandardApiParams(additionalParams = {}) {
  const company = detectCurrentCompany();

  if (!company.isValid) {
    throw new Error(company.error);
  }

  const params = new URLSearchParams();

  // Add required parameters
  params.append('CompanyID', company.id);

  const cobu = getCurrentCoBU();
  if (cobu) {
    params.append('COBU', cobu);
  }

  const budgetYear = getCurrentBudgetYear();
  if (budgetYear) {
    params.append('BudgetYear', budgetYear);
  }

  // Add additional parameters
  Object.keys(additionalParams).forEach(key => {
    if (additionalParams[key] !== null && additionalParams[key] !== undefined) {
      params.append(key, additionalParams[key]);
    }
  });

  return params;
}

// Check if current selection supports specific features
function supportsCompanyFeature(featureName) {
  const company = detectCurrentCompany();

  if (!company.isValid) return false;

  switch (featureName) {
    case 'fleetCard':
      return company.config.hasFleetCard;
    case 'southRisk':
      return company.config.hasSouthRisk;
    case 'runrate':
      const companyParams = COMPANY_FIELD_CONFIG.COMPANY_PARAMS[company.id];
      return companyParams?.requiresRunrate || false;
    default:
      return false;
  }
}

// Get company-specific field count for validation
function getCompanyFieldCount(companyId) {
  const config = getCompanyConfig(companyId);
  return config?.fieldCount || 0;
}

// Format company display name
function formatCompanyDisplayName(companyId) {
  const config = getCompanyConfig(companyId);
  return config ? `${config.name} (${config.code})` : `Company ${companyId}`;
}

// Company-aware error messages
function getCompanyErrorMessage(errorType, companyId) {
  const companyName = formatCompanyDisplayName(companyId);

  switch (errorType) {
    case 'MISSING_COBU':
      return `COBU selection is required for ${companyName}`;
    case 'INVALID_COMPANY':
      return `Invalid company selection: ${companyName}`;
    case 'API_ERROR':
      return `Failed to fetch data for ${companyName}`;
    default:
      return `Error occurred for ${companyName}`;
  }
}

// Export utility functions
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;

// Export company-specific functions
window.getCompanyConfig = getCompanyConfig;
window.detectCurrentCompany = detectCurrentCompany;
window.getCurrentCoBU = getCurrentCoBU;
window.getCurrentBudgetYear = getCurrentBudgetYear;
window.validateCompanyFields = validateCompanyFields;
window.getCurrentFieldValue = getCurrentFieldValue;
window.buildStandardApiParams = buildStandardApiParams;
window.supportsCompanyFeature = supportsCompanyFeature;
window.getCompanyFieldCount = getCompanyFieldCount;
window.formatCompanyDisplayName = formatCompanyDisplayName;
window.getCompanyErrorMessage = getCompanyErrorMessage;

// ═══════════════════════════════════════════════════════════════════
// 🔐 SECURE RANDOM CODE GENERATION (Crypto-based)
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate secure random base-36 string with fixed length
 * Uses crypto.getRandomValues for cryptographically secure randomness
 *
 * @param {number} len - Length of random string (default: 7)
 * @returns {string} Random base-36 string (0-9a-z)
 *
 * @example
 * randomBase36Len(7) // "k3z9a0q"
 * randomBase36Len(7) // "9q1m2xp"
 *
 * @note Address space: 36^7 ≈ 78.36 million combinations
 */
function randomBase36Len(len = 7) {
  // 36^7 = 78,364,164 < 2^32 → ใช้ Uint32 ได้
  const u32 = new Uint32Array(1);
  crypto.getRandomValues(u32);
  const max = 36 ** len;
  const v = u32[0] % max; // จำกัดช่วง
  return v.toString(36).padStart(len, '0');
}

/**
 * Used codes cache for collision prevention (Session-scoped)
 * Stores all generated employee codes during current session to prevent duplicates
 * @type {Set<string>}
 */
const usedEmployeeCodes = new Set();

/**
 * Generate unique Employee Code with collision detection
 * Format: e[0-9a-z]{7} (8 chars total)
 * Address space: 36^7 ≈ 78.36 million codes
 *
 * @returns {string} Unique employee code (e.g., "e0k3z9a")
 *
 * @example
 * generateEmployeeCode() // "e0k3z9a" (first call)
 * generateEmployeeCode() // "e9q1m2x" (guaranteed unique in session)
 *
 * @throws {Error} If cannot generate unique code after 20 attempts (extremely rare)
 *
 * @note Regex pattern: ^e[0-9a-z]{7}$
 * @note Call clearUsedEmployeeCodes() before starting new calculation batch
 */
function generateEmployeeCode() {
  // Retry up to 20 times to find unique code
  for (let i = 0; i < 20; i++) {
    const code = `e${randomBase36Len(7)}`; // e + 7 chars base-36

    if (!usedEmployeeCodes.has(code)) {
      usedEmployeeCodes.add(code);
      console.log(`  🔑 Generated employee code: ${code} (attempt ${i + 1})`);
      return code;
    }

    console.warn(`  ⚠️ Code collision detected: ${code} (attempt ${i + 1}/20)`);
  }

  // Fallback (should never happen with 78M address space)
  const fallback = `e${Date.now().toString(36)}z`;
  console.error(`  ❌ Failed to generate unique code after 20 attempts! Using timestamp fallback: ${fallback}`);
  usedEmployeeCodes.add(fallback);
  return fallback;
}

/**
 * Clear used codes cache (Call when starting new calculation/session)
 *
 * @example
 * // Before "CAL ทั้งหมด" or "Clear All Rows"
 * clearUsedEmployeeCodes();
 *
 * @note Should be called:
 * - Before calculateAllAllocationRows()
 * - After clearAllAllocationRows()
 * - On page reload/initialization
 */
function clearUsedEmployeeCodes() {
  const count = usedEmployeeCodes.size;
  usedEmployeeCodes.clear();
  console.log(`  🧹 Cleared ${count} used employee codes from cache`);
}

// Export random code generation functions to global scope
window.randomBase36Len = randomBase36Len;
window.generateEmployeeCode = generateEmployeeCode;
window.clearUsedEmployeeCodes = clearUsedEmployeeCodes;
