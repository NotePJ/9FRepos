/**
 * PE Budget Dashboard Options Toggle Script
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
    document.getElementById('compstoreFilters'),
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

  console.log('PE Dashboard options module loaded successfully');
});
