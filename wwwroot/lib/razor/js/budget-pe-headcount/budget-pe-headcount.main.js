/**
 * Budget PE Headcount Main Initialization
 * Simplified for Division Summary (Read-Only)
 * Initializes: Grid, Filters, Events, Fullscreen
 */

// Global variable for AG Grid API
let budgetPEHeadcountGridApi;

// Initialize Budget PE Headcount system
function initializeBudgetPEHeadcountSystem() {
  console.log('🚀 Initializing Budget PE Headcount system...');

  try {
    // Show loading state
    showGridLoading();

    // Initialize UI state
    if (window.initializeUIState) {
      window.initializeUIState();
    }

    // Initialize filters (disable all except company)
    if (window.initializeFilters) {
      window.initializeFilters();
    } else {
      console.warn('⚠️ initializeFilters function not loaded');
    }

    // Initialize main filters - start with companies
    if (window.fetchCompanies) {
      window.fetchCompanies();
    } else {
      console.warn('⚠️ fetchCompanies function not loaded');
    }

    // Initialize grid
    if (window.initBudgetPEHeadcountGrid) {
      window.initBudgetPEHeadcountGrid();
    } else {
      console.warn('⚠️ Grid module not loaded');
    }

    // Bind event listeners
    if (window.bindEventListeners) {
      window.bindEventListeners();
    } else {
      console.warn('⚠️ Events module not loaded');
    }

    // Initialize fullscreen module
    if (window.initializeFullscreenModule) {
      window.initializeFullscreenModule();
    } else {
      console.warn('⚠️ Fullscreen module not loaded');
    }

    // Initialize filter validation (green checkmarks)
    if (window.peHeadcountFilterValidator && !window.peHeadcountFilterValidator.isInitialized) {
      setTimeout(() => {
        window.peHeadcountFilterValidator.initialize();
        console.log('✅ PE Headcount Filter Validator initialized');
      }, 1500); // Wait for Select2 to be fully ready
    } else {
      console.warn('⚠️ PE Headcount Filter Validator not loaded');
    }

    // Hide loading after initialization
    setTimeout(() => {
      hideGridLoading();
      console.log('✅ Budget PE Headcount system initialized successfully');
    }, window.LOADING_DELAYS?.initialization || 1000);

  } catch (error) {
    console.error('❌ Error initializing Budget PE Headcount system:', error);
    hideGridLoading();
    showWarningModal('System initialization failed. Please refresh the page.');
  }
}

// Show warning modal
function showWarningModal(message) {
  // Try Bootstrap modal if available
  const modalHTML = `
    <div class="modal fade" id="warningModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title">Warning</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  $('#warningModal').remove();

  // Add new modal
  $('body').append(modalHTML);

  // Show modal
  const modalElement = document.getElementById('warningModal');
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();

    // Auto-remove after hidden
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM loaded, starting Budget PE Bonus initialization...');

  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    initializeBudgetPEHeadcountSystem();
  }, 100);
});

// Export global functions
window.showWarningModal = showWarningModal;

// Export grid API getters/setters
window.getBudgetPEHeadcountGridApi = () => budgetPEHeadcountGridApi;
window.setBudgetPEHeadcountGridApi = (api) => { budgetPEHeadcountGridApi = api; };
window.budgetPEHeadcountGridApi = budgetPEHeadcountGridApi;

// Legacy compatibility
window.getGridApi = () => budgetPEHeadcountGridApi;
window.setGridApi = (api) => { budgetPEHeadcountGridApi = api; };

console.log('✅ Budget PE Headcount main module loaded');
