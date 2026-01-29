# Budget Allocation Workflow Documentation

## 📋 Overview
This document outlines the step-by-step workflow of the Budget Allocation Management system in `budget.allocation.js`.

## 🔧 System Components

### Global Variables
- `allocationCounter`: Counter for allocation rows
- `allocationRowsData`: Array to store allocation data
- `isAllocationInitialized`: Initialization flag

## 📊 Step-by-Step Workflow

### Step 1: System Initialization
```javascript
function initializeAllocationManagement()
```

**Process:**
1. **Check Initialization Status**
   - Return if already initialized
   - Log initialization start

2. **Container Validation**
   - Check if `allocationContainer` exists
   - Return with warning if not found

3. **Reset State**
   - Clear container HTML
   - Reset `allocationCounter` to 0

4. **Event Listeners Setup**
   - Remove existing listeners to prevent duplicates
   - Add `allocationCardVisible` event listener
   - Add `allocationCardHidden` event listener

5. **Button Event Handlers**
   - Setup "Add Cost Center" button (`addAllocationBtn`)
   - Setup "Refresh" button (`refreshCostCentersBtn`)

6. **Initial Row Creation**
   - Add allocation row if card is visible
   - Mark system as initialized

### Step 2: Allocation Card Visibility Management

#### Show Card Event
```javascript
function handleAllocationCardVisible(e)
```
- Check if container has no children
- Add initial allocation row if needed

#### Hide Card Event
```javascript
function handleAllocationCardHidden(e)
```
- Clear container HTML
- Reset allocation counter

### Step 3: Add Allocation Row Process

#### Pre-validation
```javascript
function handleAddAllocationClick()
```
1. **Duplicate Cost Center Check**
   - Validate no duplicate cost centers exist
   - Show alert if duplicates found

2. **Empty Selection Check**
   - Check for empty cost center selections
   - Confirm with user before proceeding

#### Row Creation
```javascript
function addAllocationRow()
```
1. **Counter Management**
   - Increment `allocationCounter`
   - Get container element

2. **HTML Generation**
   - Create `allocation-row` div
   - Set `data-allocation-id` attribute
   - Generate Bootstrap grid structure:
     - Col-6: Cost Center Select dropdown
     - Col-4: Percentage input with % suffix
     - Col-2: Remove button

3. **DOM Insertion**
   - Append row to container
   - Populate cost center dropdown
   - Add event listeners (delayed 200ms)
   - Calculate totals

### Step 4: Cost Center Population

```javascript
function populateAllocationCostCenter(rowId)
```

**Process:**
1. **Element Retrieval**
   - Get select element by ID
   - Show loading state

2. **Company Detection**
   - Get company from `editCompany` or `companyFilter`
   - Log company selection

3. **Data Population Methods**
   
   **API Method (Primary):**
   - Check if `populateDropdown` function exists
   - Use `BUDGET_API.costCenters` endpoint
   - Format options with name and code
   - Re-enable after 500ms

   **Fallback Method (Secondary):**
   - Use hardcoded cost center data
   - Simulate loading delay (300ms)
   - Include common cost centers

4. **Company Change Listener**
   - Add listener to company select (once only)
   - Update all allocation dropdowns when changed

### Step 5: Event Listeners Management

```javascript
function addAllocationEventListeners(rowId)
```

**Percentage Input Events:**
- `input`: Calculate totals on change
- `blur`: Validate range (0-100)

**Cost Center Select Events:**
- `change`: Validate duplication after 100ms delay

### Step 6: Validation System

#### Cost Center Duplication Check
```javascript
function validateCostCenterDuplication()
```

**Process:**
1. **Reset Visual States**
   - Clear all border colors and shadows

2. **Duplicate Detection**
   - Loop through all cost center selects
   - Track selected values and positions
   - Highlight duplicates in red

3. **Warning Display**
   - Show/hide duplication warning message
   - Return validation status

#### Pre-save Validation
```javascript
function validateAllocation()
```

**Checks:**
1. Total percentage equals 100%
2. At least one valid allocation exists
3. No duplicate cost centers
4. Show appropriate error messages

### Step 7: Calculation System

```javascript
function calculateAllocationTotals()
```

**Process:**
1. **Sum Percentages**
   - Query all percentage inputs
   - Calculate total percentage

2. **Update Total Field**
   - Set `totalAllocation` field value
   - Format to 2 decimal places

3. **Status Indicator**
   - Green: Exactly 100%
   - Red: Over 100%
   - Yellow: Under 100%

4. **Dynamic Forms Trigger**
   - Create forms if 100%
   - Remove forms if not 100%

### Step 8: Dynamic Forms Integration

#### Form Creation (100% Allocation)
```javascript
function createDynamicAllocationForms()
```

**Conditions:**
- Total allocation equals 100%
- Cost Center matches `ALLOCATION_COST_CENTER`

**Actions:**
- Create LE Benefits forms per cost center
- Create Budget Year Benefits forms per cost center
- Show dynamic containers

#### Form Removal (< 100% Allocation)
```javascript
function removeDynamicForms()
```
- Hide dynamic containers
- Clear form content

### Step 9: Data Management

#### Get Allocation Data
```javascript
function getAllocationData()
```
- Extract cost center and percentage pairs
- Filter valid entries (has cost center and > 0%)
- Return array of allocation objects

#### Load Allocation Data
```javascript
function loadAllocationData(allocationData)
```
- Clear existing rows
- Create rows for each allocation
- Set values in dropdowns and inputs
- Calculate totals

### Step 10: Integration & Export

#### Global Exports
- All functions exported to `window` object
- Integration with other budget modules
- DOM ready event listener setup

#### Integration Points
```javascript
function setupAllocationIntegration()
```
- Listen for offcanvas show/hide events
- Auto-initialize when offcanvas opens
- Handle existing visible offcanvas

## 🎯 Key Features

### 1. **Validation System**
- Real-time duplicate detection
- Percentage range validation (0-100%)
- Total allocation validation (must equal 100%)

### 2. **Dynamic UI Updates**
- Auto-refresh on company change
- Real-time total calculation
- Visual feedback for validation errors

### 3. **Integration Ready**
- Event-driven architecture
- Modular function design
- Global accessibility

### 4. **Error Handling**
- Graceful fallbacks for missing APIs
- User-friendly error messages
- Console logging for debugging

### 5. **Performance Optimizations**
- Delayed event listeners
- Debounced validations
- Efficient DOM queries

## 🔄 Event Flow Summary

```
1. Initialize → Check Container → Setup Events
2. Show Allocation Card → Add Initial Row
3. User Adds Row → Validate → Create HTML → Setup Events
4. User Selects Cost Center → Populate → Validate Duplicates
5. User Enters Percentage → Calculate Totals → Update Status
6. 100% Reached → Create Dynamic Forms
7. Save Action → Final Validation → Extract Data
```

## 📁 File Dependencies

- **Required APIs**: `BUDGET_API.costCenters`
- **Required Functions**: `populateDropdown()`
- **Required Elements**: `allocationContainer`, `budgetAllocationCard`
- **Integration**: `budget.offcanvas.js`, `budget.dynamic.forms.js`

## 🚀 Usage Examples

### Manual Initialization
```javascript
initializeAllocationManagement();
```

### Add Row Programmatically
```javascript
addAllocationRow();
```

### Get Current Data
```javascript
const allocations = getAllocationData();
console.log(allocations);
```

### Validate Before Save
```javascript
if (validateAllocation()) {
    // Proceed with save
    const data = getAllocationData();
}
```

---
*Generated on: October 6, 2025*
*File: budget.allocation.js workflow documentation*
