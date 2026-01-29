// Budget PE Bonus API Functions
// Simplified version for Cost Center Summary (Read-Only)

function populateDropdown(elementId, apiUrl, defaultText, optionCallback, showSpinner = false) {
  const select = document.getElementById(elementId);

  if (!select) {
    console.error(`Element with id '${elementId}' not found.`);
    return;
  }

  if (showSpinner && SPINNER_MAP && SPINNER_MAP[elementId]) {
    showDropdownSpinner(SPINNER_MAP[elementId]);
  }

  const prevValue = select.value || '';

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // Create options
      select.innerHTML = `<option value="">${defaultText}</option>`;
      data.forEach(item => {
        const option = document.createElement('option');
        if (optionCallback) {
          optionCallback(option, item);
        } else {
          option.value = item;
          option.textContent = item;
        }
        select.appendChild(option);
      });

      const $select = $(select);

      // Check if select2 is available
      if (typeof $select.select2 !== 'function') {
        $select.trigger('change');
        return;
      }

      // Find parent container for dropdown
      const $parent = $select.closest('.card-body');
      const dropdownParent = $parent.length ? $parent : null;

      // ---------- Focus Management (Fix ARIA Warning) ----------
      // 1) Move focus away from select to prevent ARIA warning
      const focusSafe = dropdownParent ? dropdownParent[0] : document.body;
      const prevTabIndex = focusSafe.getAttribute('tabindex');
      if (!focusSafe.hasAttribute('tabindex')) focusSafe.setAttribute('tabindex', '-1');
      focusSafe.focus({ preventScroll: true });

      // 2) Close and destroy existing select2
      if ($select.data('select2')) {
        try { $select.select2('close'); } catch (_) { }
        $select.select2('destroy');
      }

      // 3) Initialize select2 with dropdown parent
      $select.select2({
        placeholder: defaultText,
        allowClear: true,
        width: '100%',
        dropdownParent: dropdownParent
      });

      // 4) Prevent focus on original select element
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true');

      // 5) Restore previous value if exists
      if (prevValue && $select.find(`option[value="${prevValue}"]`).length) {
        $select.val(prevValue).trigger('change.select2');
      } else {
        $select.trigger('change.select2');
      }

      // Restore tabindex
      if (prevTabIndex === null) {
        focusSafe.removeAttribute('tabindex');
      } else {
        focusSafe.setAttribute('tabindex', prevTabIndex);
      }
      // ---------- End Focus Management ----------
    })
    .catch(err => console.error(`Error fetching data for ${elementId}:`, err))
    .finally(() => {
      if (showSpinner && SPINNER_MAP && SPINNER_MAP[elementId]) {
        hideDropdownSpinner(SPINNER_MAP[elementId]);
      }
    });
}

function fetchCompanies() {
  populateDropdown('companyFilter', BUDGET_PE_HEADCOUNT_API.companies, 'Select Company',
    (opt, item) => {
      opt.value = item.companyId || item.CompanyId;
      opt.textContent = item.companyCode || item.CompanyCode;
    }, true);
}

// Fetch COBU data for a company
async function fetchCoBU(companyId) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    showDropdownSpinner('formatSpinner');
    const response = await fetch(`${BUDGET_PE_HEADCOUNT_API.cobu}?companyId=${companyId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const cobuFilter = $('#cobuFilter');
    cobuFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => {
        const option = new Option(
          item.description || item.text || item.code || item.value || item,
          item.code || item.value || item
        );
        cobuFilter.append(option);
      });
    }

    cobuFilter.select2({
      placeholder: 'All COBU/Format',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching COBU:', error);
    if (window.showWarningModal) {
      showWarningModal(`Failed to fetch COBU: ${error.message}`);
    }
  } finally {
    hideDropdownSpinner('formatSpinner');
  }
}

// Fetch budget years for a company
async function fetchBudgetYears(companyId) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    showDropdownSpinner('yearSpinner');
    const response = await fetch(`${BUDGET_PE_HEADCOUNT_API.budgetYears}?companyId=${companyId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const yearsFilter = $('#yearsFilter');
    yearsFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(year => {
        const option = new Option(year, year);
        yearsFilter.append(option);
      });
    }

    yearsFilter.select2({
      placeholder: 'All Years',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching budget years:', error);
    if (window.showWarningModal) {
      showWarningModal(`Failed to fetch budget years: ${error.message}`);
    }
  } finally {
    hideDropdownSpinner('yearSpinner');
  }
}

// Fetch cost centers for a company
async function fetchCostCenters(companyId) {
  try {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    showDropdownSpinner('costcenterSpinner');
    let apiUrl = `${BUDGET_PE_HEADCOUNT_API.costCenters}?companyId=${companyId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const costcenterFilter = $('#costcenterFilter');
    costcenterFilter.find('option:not(:first)').remove();

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => {
        const costCenterName = `${item.costCenterName} (${item.costCenterCode})`;
        const costCenterCode = item.costCenterCode;
        const option = new Option(costCenterName, costCenterCode);
        costcenterFilter.append(option);
      });
    }

    costcenterFilter.select2({
      placeholder: 'All Cost Centers',
      allowClear: true,
      width: '100%'
    });
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    if (window.showWarningModal) {
      showWarningModal(`Failed to fetch cost centers: ${error.message}`);
    }
  } finally {
    hideDropdownSpinner('costcenterSpinner');
  }
}

async function fetchBudgetPEHeadcountData(filters) {
  try {
    // Validate required filters
    if (!filters.companyId) {
      if (typeof toastr !== 'undefined') toastr.error('Please select a Company');
      return [];
    }

    // Construct API URL
    const requestBody = {
      companyId: parseInt(filters.companyId),
      budgetYear: parseInt(filters.yearBudget || 2026),
      cobuFormat: filters.cobu || null,
      costCenterCode: filters.costCenter || null
    };

    console.log('Fetching PE HeadCount data from:', requestBody);

    const response = await fetch(BUDGET_PE_HEADCOUNT_API.getData, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching PE HeadCount data:', error);
    if (typeof toastr !== 'undefined') toastr.error(`Failed: ${error.message}`);
    return [];
  }
}

window.populateDropdown = populateDropdown;
window.fetchCompanies = fetchCompanies;
window.fetchCoBU = fetchCoBU;
window.fetchBudgetYears = fetchBudgetYears;
window.fetchCostCenters = fetchCostCenters;
window.fetchBudgetPEHeadcountData = fetchBudgetPEHeadcountData;
window.fetchBudgetData = fetchBudgetPEHeadcountData;
console.log('Budget PE HC API module loaded');
