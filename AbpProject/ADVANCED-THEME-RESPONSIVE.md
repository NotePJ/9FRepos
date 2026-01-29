# ?? Responsive Theme Customization Guide

## ?? ??????

???????????????????????????? Theme responsive ??? mobile-friendly

---

## ?? Bootstrap 5 Breakpoints

```css
/* Bootstrap 5 Default Breakpoints */
/* Extra small devices (portrait phones, less than 576px) */
/* xs: No media query since this is the default */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) { ... }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { ... }

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) { ... }

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) { ... }

/* Extra extra large devices (larger desktops, 1400px and up) */
@media (min-width: 1400px) { ... }
```

---

## ?? Method 1: Responsive CSS Variables

### Step 1: Define Responsive Sizes

```css
/* wwwroot/css/responsive-variables.css */

:root {
    /* Font Sizes - Mobile First */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 30px;
    --font-size-4xl: 36px;
    
    /* Spacing - Mobile First */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    --spacing-3xl: 64px;
    
    /* Container Width */
    --container-width: 100%;
    --container-padding: var(--spacing-md);
    
    /* Card */
    --card-padding: var(--spacing-md);
    --card-border-radius: 8px;
    
    /* Sidebar */
    --sidebar-width: 280px;
    --sidebar-collapsed-width: 60px;
    
    /* Navbar */
    --navbar-height: 60px;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
    :root {
        --font-size-base: 16px;
        --font-size-lg: 20px;
        --font-size-xl: 24px;
        --font-size-2xl: 28px;
        --font-size-3xl: 36px;
        --font-size-4xl: 48px;
        
        --spacing-lg: 32px;
        --spacing-xl: 48px;
        --spacing-2xl: 64px;
        
        --container-padding: var(--spacing-lg);
        --card-padding: var(--spacing-lg);
    }
}

/* Desktop (992px and up) */
@media (min-width: 992px) {
    :root {
        --container-width: 960px;
        --sidebar-width: 300px;
    }
}

/* Large Desktop (1200px and up) */
@media (min-width: 1200px) {
    :root {
        --container-width: 1140px;
    }
}

/* Extra Large Desktop (1400px and up) */
@media (min-width: 1400px) {
    :root {
        --container-width: 1320px;
    }
}
```

### Step 2: Apply Responsive Variables

```css
/* wwwroot/css/responsive-components.css */

/* Container */
.custom-container {
    width: var(--container-width);
    margin: 0 auto;
    padding: 0 var(--container-padding);
}

/* Typography */
h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

/* Card */
.card {
    padding: var(--card-padding);
    border-radius: var(--card-border-radius);
}

/* Sidebar */
.sidebar {
    width: var(--sidebar-width);
    transition: width 0.3s ease;
}

.sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
}

/* Navbar */
.navbar {
    height: var(--navbar-height);
}
```

---

## ?? Method 2: Mobile-First Responsive Components

### Dashboard Cards

```css
/* wwwroot/css/responsive-dashboard.css */

/* Mobile First - Stack vertically */
.dashboard-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
}

.dashboard-card {
    padding: var(--spacing-md);
    border-radius: var(--card-border-radius);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
}

.dashboard-card-icon {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-sm);
}

.dashboard-card-value {
    font-size: var(--font-size-2xl);
    font-weight: bold;
}

.dashboard-card-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

/* Tablet (768px and up) - 2 columns */
@media (min-width: 768px) {
    .dashboard-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
    }
    
    .dashboard-card {
        padding: var(--spacing-lg);
    }
}

/* Desktop (992px and up) - 3 columns */
@media (min-width: 992px) {
    .dashboard-cards {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Large Desktop (1200px and up) - 4 columns */
@media (min-width: 1200px) {
    .dashboard-cards {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### Responsive Table

```css
/* wwwroot/css/responsive-table.css */

/* Mobile - Card view */
.responsive-table-wrapper {
    overflow-x: auto;
}

.responsive-table {
    width: 100%;
    border-collapse: collapse;
}

/* Mobile - Hide table, show cards */
@media (max-width: 767px) {
    .responsive-table thead {
        display: none;
    }
    
    .responsive-table tbody tr {
        display: block;
        margin-bottom: var(--spacing-md);
        border: 1px solid var(--border-color);
        border-radius: var(--card-border-radius);
        padding: var(--spacing-md);
        background: var(--bg-card);
    }
    
    .responsive-table tbody td {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid var(--border-light);
    }
    
    .responsive-table tbody td:last-child {
        border-bottom: none;
    }
    
    .responsive-table tbody td::before {
        content: attr(data-label);
        font-weight: bold;
        margin-right: var(--spacing-md);
    }
}

/* Tablet and up - Normal table */
@media (min-width: 768px) {
    .responsive-table th,
    .responsive-table td {
        padding: var(--spacing-md);
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }
    
    .responsive-table thead {
        background: var(--bg-secondary);
    }
}
```

### Responsive Navigation

```css
/* wwwroot/css/responsive-nav.css */

/* Mobile - Hamburger menu */
.navbar-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
}

.navbar-hamburger {
    display: block;
    font-size: var(--font-size-2xl);
    cursor: pointer;
    color: var(--text-primary);
}

.navbar-menu {
    display: none;
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-card);
    padding: var(--spacing-lg);
    overflow-y: auto;
    z-index: 1000;
}

.navbar-menu.active {
    display: block;
}

.navbar-menu-item {
    display: block;
    padding: var(--spacing-md);
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid var(--border-light);
}

.navbar-menu-item:hover {
    background: var(--bg-tertiary);
}

/* Desktop - Horizontal menu */
@media (min-width: 992px) {
    .navbar-hamburger {
        display: none;
    }
    
    .navbar-menu {
        display: flex !important;
        position: static;
        flex-direction: row;
        background: transparent;
        padding: 0;
    }
    
    .navbar-menu-item {
        border-bottom: none;
        padding: var(--spacing-sm) var(--spacing-md);
    }
}
```

---

## ?? Method 3: Responsive Utility Classes

```css
/* wwwroot/css/responsive-utilities.css */

/* Display utilities */
.d-mobile-none { display: none; }
.d-tablet-none { display: none; }
.d-desktop-none { display: none; }

@media (min-width: 768px) {
    .d-mobile-none { display: block; }
    .d-tablet-block { display: block; }
}

@media (min-width: 992px) {
    .d-tablet-none { display: none; }
    .d-desktop-block { display: block; }
}

/* Text alignment */
.text-mobile-center { text-align: center; }

@media (min-width: 768px) {
    .text-tablet-left { text-align: left; }
    .text-tablet-center { text-align: center; }
    .text-tablet-right { text-align: right; }
}

@media (min-width: 992px) {
    .text-desktop-left { text-align: left; }
    .text-desktop-center { text-align: center; }
    .text-desktop-right { text-align: right; }
}

/* Spacing */
.p-mobile-sm { padding: var(--spacing-sm); }
.p-mobile-md { padding: var(--spacing-md); }
.p-mobile-lg { padding: var(--spacing-lg); }

@media (min-width: 768px) {
    .p-tablet-lg { padding: var(--spacing-lg); }
    .p-tablet-xl { padding: var(--spacing-xl); }
}

@media (min-width: 992px) {
    .p-desktop-xl { padding: var(--spacing-xl); }
    .p-desktop-2xl { padding: var(--spacing-2xl); }
}

/* Flexbox utilities */
.flex-mobile-column { flex-direction: column; }

@media (min-width: 768px) {
    .flex-tablet-row { flex-direction: row; }
}

/* Width utilities */
.w-mobile-full { width: 100%; }

@media (min-width: 768px) {
    .w-tablet-auto { width: auto; }
    .w-tablet-50 { width: 50%; }
}

@media (min-width: 992px) {
    .w-desktop-auto { width: auto; }
    .w-desktop-33 { width: 33.333%; }
    .w-desktop-25 { width: 25%; }
}
```

---

## ?? Method 4: JavaScript Responsive Helpers

```javascript
// wwwroot/js/responsive-helpers.js

class ResponsiveHelpers {
    constructor() {
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }
    
    init() {
        this.attachResizeListener();
        this.setBreakpointClass();
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.xxl) return 'xxl';
        if (width >= this.breakpoints.xl) return 'xl';
        if (width >= this.breakpoints.lg) return 'lg';
        if (width >= this.breakpoints.md) return 'md';
        if (width >= this.breakpoints.sm) return 'sm';
        return 'xs';
    }
    
    isMobile() {
        return this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
    }
    
    isTablet() {
        return this.currentBreakpoint === 'md';
    }
    
    isDesktop() {
        return ['lg', 'xl', 'xxl'].includes(this.currentBreakpoint);
    }
    
    setBreakpointClass() {
        document.body.classList.remove('xs', 'sm', 'md', 'lg', 'xl', 'xxl');
        document.body.classList.add(this.currentBreakpoint);
        document.body.setAttribute('data-breakpoint', this.currentBreakpoint);
    }
    
    attachResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                
                if (newBreakpoint !== this.currentBreakpoint) {
                    const oldBreakpoint = this.currentBreakpoint;
                    this.currentBreakpoint = newBreakpoint;
                    this.setBreakpointClass();
                    
                    // Dispatch custom event
                    window.dispatchEvent(new CustomEvent('breakpointChange', {
                        detail: {
                            from: oldBreakpoint,
                            to: newBreakpoint,
                            isMobile: this.isMobile(),
                            isTablet: this.isTablet(),
                            isDesktop: this.isDesktop()
                        }
                    }));
                }
            }, 150);
        });
    }
    
    // Utility methods
    getViewportWidth() {
        return window.innerWidth || document.documentElement.clientWidth;
    }
    
    getViewportHeight() {
        return window.innerHeight || document.documentElement.clientHeight;
    }
    
    isLandscape() {
        return this.getViewportWidth() > this.getViewportHeight();
    }
    
    isPortrait() {
        return this.getViewportHeight() > this.getViewportWidth();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveHelpers = new ResponsiveHelpers();
});

// Usage example:
// window.addEventListener('breakpointChange', (e) => {
//     console.log('Breakpoint changed:', e.detail);
//     if (e.detail.isMobile) {
//         // Do mobile-specific stuff
//     }
// });
```

---

## ?? Method 5: Mobile-First Components

### Responsive Card Component

```cshtml
<!-- Components/ResponsiveCard/Default.cshtml -->
<div class="responsive-card @Model.CssClass">
    <div class="responsive-card-header">
        @if (!string.IsNullOrEmpty(Model.Icon))
        {
            <i class="@Model.Icon responsive-card-icon"></i>
        }
        <h3 class="responsive-card-title">@Model.Title</h3>
    </div>
    
    <div class="responsive-card-body">
        @Model.Content
    </div>
    
    @if (Model.Actions != null && Model.Actions.Any())
    {
        <div class="responsive-card-actions">
            @foreach (var action in Model.Actions)
            {
                <a href="@action.Url" class="btn @action.CssClass">
                    @if (!string.IsNullOrEmpty(action.Icon))
                    {
                        <i class="@action.Icon"></i>
                    }
                    <span class="d-none d-md-inline">@action.Text</span>
                </a>
            }
        </div>
    }
</div>
```

```css
/* Responsive Card Styles */
.responsive-card {
    background: var(--bg-card);
    border-radius: var(--card-border-radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.responsive-card-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.responsive-card-icon {
    font-size: var(--font-size-xl);
    color: var(--brand-primary);
}

.responsive-card-title {
    font-size: var(--font-size-lg);
    margin: 0;
}

.responsive-card-body {
    padding: var(--spacing-md);
}

.responsive-card-actions {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

/* Tablet and up */
@media (min-width: 768px) {
    .responsive-card-header {
        padding: var(--spacing-lg);
    }
    
    .responsive-card-body {
        padding: var(--spacing-lg);
    }
    
    .responsive-card-actions {
        padding: var(--spacing-lg);
        justify-content: flex-end;
    }
}
```

---

## ?? Touch-Friendly Enhancements

```css
/* wwwroot/css/touch-friendly.css */

/* Larger touch targets (minimum 44x44px) */
.touch-target {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Remove hover effects on touch devices */
@media (hover: none) {
    .btn:hover {
        background-color: inherit;
    }
    
    .card:hover {
        transform: none;
        box-shadow: inherit;
    }
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Prevent text selection on buttons */
button, .btn {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* iOS specific */
@supports (-webkit-touch-callout: none) {
    /* Fix iOS input zoom */
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    textarea {
        font-size: 16px !important;
    }
    
    /* Remove iOS input shadows */
    input,
    textarea,
    select {
        -webkit-appearance: none;
        appearance: none;
    }
}
```

---

## ?? Testing Checklist

- [ ] Test on actual devices (iPhone, iPad, Android)
- [ ] Test in Chrome DevTools device mode
- [ ] Test landscape and portrait orientations
- [ ] Test with different screen sizes
- [ ] Test touch interactions
- [ ] Test with slow network (3G)
- [ ] Verify images are responsive
- [ ] Check font sizes are readable
- [ ] Verify buttons are tap-friendly (44x44px minimum)
- [ ] Test forms on mobile
- [ ] Check tables are usable on mobile
- [ ] Verify navigation works on mobile

---

## ?? Best Practices

### 1. Mobile-First Approach
```css
/* ? Good - Mobile first */
.element {
    width: 100%;
}

@media (min-width: 768px) {
    .element {
        width: 50%;
    }
}

/* ? Bad - Desktop first */
.element {
    width: 50%;
}

@media (max-width: 767px) {
    .element {
        width: 100%;
    }
}
```

### 2. Use Relative Units
```css
/* ? Good */
font-size: 1rem;
padding: 1em;
width: 100%;

/* ? Bad */
font-size: 16px;
padding: 16px;
width: 1200px;
```

### 3. Optimize Images
```html
<!-- Responsive images -->
<img src="image.jpg" 
     srcset="image-small.jpg 576w,
             image-medium.jpg 768w,
             image-large.jpg 1200w"
     sizes="(max-width: 576px) 100vw,
            (max-width: 768px) 50vw,
            33vw"
     alt="Responsive image">
```

---

**Happy Responsive Coding! ??**
