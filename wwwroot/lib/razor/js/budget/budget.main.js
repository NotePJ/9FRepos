/**
 * Budget Main Initialization
 * Main orchestration file that initializes all budget modules and coordinates their interactions
 */

// Global variables for AG Grid APIs - used across multiple modules
let gridApi;
let masterGridApi;
let detailGridApi;

// Initialize all budget functionality
function initializeBudgetSystem() {
  // console.log('Initializing budget system...');

  try {
    // Initialize core loading states
    showGridLoading();

    // Initialize UI state (disable buttons initially)
    if (typeof initializeUIState === 'function') {
      initializeUIState();
    } else {
      // console.warn('initializeUIState function not available');
    }

    // Initialize filters (disable all except company)
    initializeFilters();

    // Initialize main filters - start with companies
    fetchCompanies();

    // Setup main filter relationships
    setupFilterCascadeRelationships();

    // Initialize the main budget grid
    initializeBudgetGrid();

    // Initialize master and detail grids (if containers exist)
    if (document.getElementById('masterGrid')) {
      initializeMasterGrid();
    }
    if (document.getElementById('detailGrid')) {
      initializeDetailGrid();
    }

    // Setup all event handlers
    bindEventListeners();

    // Initialize offcanvas functionality
    initializeOffcanvasHandlers();

    // Initialize auto-exit fullscreen functionality for master grid
    addAutoExitFullscreenListener();

    // Hide loading spinner after initialization
    setTimeout(() => {
      hideGridLoading();
    }, LOADING_DELAYS.initialization);

    // console.log('Budget system initialized successfully');

  } catch (error) {
    // console.error('Error initializing budget system:', error);
    hideGridLoading();
    showWarningModal('System Error', 'Failed to initialize budget system. Please refresh the page and try again.');
  }
}

// Initialize budget system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // console.log('DOM loaded, starting budget system initialization...');

  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    initializeBudgetSystem();
  }, 100);
});

// Export global functions for backward compatibility
window.populateDropdown = populateDropdown;
window.fetchBudgetData = fetchBudgetData;
window.fetchCompanies = fetchCompanies;
window.setupFilterCascadeRelationships = setupFilterCascadeRelationships;
window.initializeFilters = initializeFilters;
window.initializeUIState = initializeUIState;
window.showGridLoading = showGridLoading;
window.hideGridLoading = hideGridLoading;
window.debounce = debounce;
window.showWarningModal = showWarningModal;
window.smoothScrollToElement = smoothScrollToElement;

// Export grid APIs for access from other modules
window.getGridApi = () => gridApi;
window.getMasterGridApi = () => masterGridApi;
window.getDetailGridApi = () => detailGridApi;
window.setGridApi = (api) => { gridApi = api; };
window.setMasterGridApi = (api) => { masterGridApi = api; };
window.setDetailGridApi = (api) => { detailGridApi = api; };

// console.log('Budget main module loaded successfully');
