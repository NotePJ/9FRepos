/**
 * Budget Options Toggle Script
 * Handles the More Options toggle functionality for filter visibility
 */

document.addEventListener('DOMContentLoaded', function () {
  // === More Options Toggle Functionality ===
  const moreOptionsToggle = document.getElementById('moreOptionsToggle');
  const filterElements = [
    document.getElementById('cosFilters'),
    document.getElementById('divFilters'),
    document.getElementById('deptFilters'),
    document.getElementById('secFilters'),
    document.getElementById('locFilters'),
    document.getElementById('empstatFilters'),
    document.getElementById('posFilters'),
    document.getElementById('jbandFilters')
  ];

  // Initialize filters with CSS classes
  filterElements.forEach(filter => {
    if (filter) {
      filter.classList.add('filter-fade', 'filter-hidden');
      filter.style.display = 'none'; // Always hidden but controlled by CSS
    }
  });

  if (moreOptionsToggle && filterElements.every(el => el !== null)) {
    let isVisible = false;

    moreOptionsToggle.addEventListener('click', function (e) {
      e.preventDefault();

      const icon = this.querySelector('i');

      if (!isVisible) {
        // Show all filters with smooth fade in
        filterElements.forEach((filter, index) => {
          // First set display to block, then add visible class with delay
          filter.style.display = 'block';
          setTimeout(() => {
            filter.classList.remove('filter-hidden');
            filter.classList.add('filter-visible');
          }, index * 50); // Small delay to ensure display:block is applied first
        });
        icon.className = 'fas fa-chevron-up me-2';
        this.innerHTML = '<i class="fas fa-chevron-up me-2"></i>Less Options';
        isVisible = true;
      } else {
        // Hide all filters with smooth fade out
        filterElements.forEach((filter, index) => {
          setTimeout(() => {
            filter.classList.remove('filter-visible');
            filter.classList.add('filter-hidden');
            // Set display to none after animation completes
            setTimeout(() => {
              filter.style.display = 'none';
            }, 300); // Match the CSS transition duration
          }, index);
        });
        icon.className = 'fas fa-chevron-down me-2';
        this.innerHTML = '<i class="fas fa-chevron-down me-2"></i>More Options';
        isVisible = false;
      }
    });
  }

  console.log('Budget options module loaded successfully');

  // === Year Display Management Functions ===

  /**
   * Update all year-related display elements based on selected year
   * @param {string|number} selectedYear - The year selected from dropdown
   */
  function updateBudgetYearDisplay(selectedYear) {
    const year = parseInt(selectedYear);
    const leYear = year - 1; // LE Benefits year is previous year

    try {
      // Update LE Benefits year (previous year)
      const leBenefitsYearElement = document.getElementById('leBenefitsYear');
      if (leBenefitsYearElement) {
        leBenefitsYearElement.textContent = leYear;
      }

      // Update Budget year (selected year)
      const benefitsYearElement = document.getElementById('benefitsYear');
      if (benefitsYearElement) {
        benefitsYearElement.textContent = year;
      }

      // Update Dynamic section title
      const dynamicBgBenefitsYearElement = document.getElementById('dynamicBgBenefitsYear');
      if (dynamicBgBenefitsYearElement) {
        dynamicBgBenefitsYearElement.textContent = year;
      }

      // Update Plan Cost Center year in label
      const planCostCenterYearElement = document.getElementById('planCostCenterYear');
      if (planCostCenterYearElement) {
        planCostCenterYearElement.textContent = year;
      }

      // Update Plan Cost Center year in option text
      const planCostCenterYearOptionElement = document.getElementById('planCostCenterYearOption');
      if (planCostCenterYearOptionElement) {
        planCostCenterYearOptionElement.textContent = year;
      }

      // console.log(`Year display updated: LE=${leYear}, Budget=${year}`);
    } catch (error) {
      // console.error('Error updating year display:', error);
    }
  }

  /**
   * Initialize year display functionality
   */
  function initializeYearDisplay() {
    try {
      // Get dropdown elements
      const editYearDropdown = document.getElementById('editYear');
      const yearsFilterDropdown = document.getElementById('yearsFilter');

      // Setup event listeners for editYear dropdown
      if (editYearDropdown) {
        editYearDropdown.addEventListener('change', function() {
          const selectedYear = this.value;
          if (selectedYear) {
            updateBudgetYearDisplay(selectedYear);
          }
        });

        // Initialize with current value if exists
        if (editYearDropdown.value) {
          updateBudgetYearDisplay(editYearDropdown.value);
        }
      }

      // Setup event listeners for yearsFilter dropdown (if needed)
      if (yearsFilterDropdown) {
        yearsFilterDropdown.addEventListener('change', function() {
          const selectedYear = this.value;
          if (selectedYear) {
            updateBudgetYearDisplay(selectedYear);
          }
        });
      }

      // console.log('Year display management initialized');
    } catch (error) {
      // console.error('Error initializing year display:', error);
    }
  }

  // Initialize year display when DOM is ready
  initializeYearDisplay();

  // Export functions to global scope for external access
  window.updateBudgetYearDisplay = updateBudgetYearDisplay;
  window.initializeYearDisplay = initializeYearDisplay;
});
