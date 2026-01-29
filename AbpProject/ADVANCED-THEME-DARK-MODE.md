# ?? Dark Mode Theme Implementation Guide

## ?? ??????

???????????????????????????? Dark Mode ?????? ABP Theme ??????

---

## ?? Method 1: CSS Variables Based Dark Mode

### Step 1: Define Color Schemes

```css
/* wwwroot/css/theme-colors.css */

/* ========================================
   Light Mode (Default)
   ======================================== */
:root,
:root[data-bs-theme="light"] {
    /* Brand Colors */
    --brand-primary: #1890ff;
    --brand-success: #52c41a;
    --brand-warning: #faad14;
    --brand-danger: #f5222d;
    --brand-info: #13c2c2;
    
    /* Background Colors */
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --bg-tertiary: #fafafa;
    --bg-card: #ffffff;
    
    /* Text Colors */
    --text-primary: #262626;
    --text-secondary: #595959;
    --text-tertiary: #8c8c8c;
    --text-disabled: #bfbfbf;
    
    /* Border Colors */
    --border-color: #d9d9d9;
    --border-light: #f0f0f0;
    
    /* Shadow */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    
    /* Logo */
    --lpx-logo: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
    --lpx-logo-icon: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
}

/* ========================================
   Dark Mode
   ======================================== */
:root[data-bs-theme="dark"],
.dark-mode {
    /* Brand Colors (slightly adjusted for dark mode) */
    --brand-primary: #40a9ff;
    --brand-success: #73d13d;
    --brand-warning: #ffc53d;
    --brand-danger: #ff7875;
    --brand-info: #36cfc9;
    
    /* Background Colors */
    --bg-primary: #141414;
    --bg-secondary: #1f1f1f;
    --bg-tertiary: #262626;
    --bg-card: #1f1f1f;
    
    /* Text Colors */
    --text-primary: #e8e8e8;
    --text-secondary: #a6a6a6;
    --text-tertiary: #737373;
    --text-disabled: #4d4d4d;
    
    /* Border Colors */
    --border-color: #404040;
    --border-light: #303030;
    
    /* Shadow (darker shadows for dark mode) */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
    
    /* Logo (dark version) */
    --lpx-logo: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
    --lpx-logo-icon: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
}

/* ========================================
   Apply Variables to Components
   ======================================== */

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.card {
    background-color: var(--bg-card);
    border-color: var(--border-color);
    color: var(--text-primary);
}

.btn-primary {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
}

.text-muted {
    color: var(--text-secondary) !important;
}

/* Input fields */
.form-control {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
}

.form-control:focus {
    background-color: var(--bg-primary);
    border-color: var(--brand-primary);
    color: var(--text-primary);
}

/* Tables */
.table {
    color: var(--text-primary);
}

.table-striped > tbody > tr:nth-of-type(odd) {
    background-color: var(--bg-tertiary);
}

/* Navbar */
.navbar {
    background-color: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
}

/* Sidebar */
.sidebar {
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
}

/* Modal */
.modal-content {
    background-color: var(--bg-card);
    color: var(--text-primary);
}

.modal-header,
.modal-footer {
    border-color: var(--border-color);
}
```

### Step 2: Theme Toggle Component

```csharp
// Components/ThemeToggle/ThemeToggleViewComponent.cs
using Microsoft.AspNetCore.Mvc;

namespace AbpProject.Components.ThemeToggle;

public class ThemeToggleViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View();
    }
}
```

```cshtml
<!-- Components/ThemeToggle/Default.cshtml -->
<div class="theme-toggle">
    <button id="themeToggleBtn" 
            class="btn btn-sm btn-outline-secondary" 
            type="button"
            title="Toggle theme">
        <i id="themeIcon" class="fas fa-moon"></i>
    </button>
</div>

<style>
.theme-toggle {
    display: flex;
    align-items: center;
}

#themeToggleBtn {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

#themeToggleBtn:hover {
    background-color: var(--bg-tertiary);
}
</style>

<script>
(function() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;
    
    // Get saved theme or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', function() {
        const newTheme = htmlElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    function applyTheme(theme) {
        htmlElement.setAttribute('data-bs-theme', theme);
        
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeToggleBtn.title = 'Switch to light mode';
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeToggleBtn.title = 'Switch to dark mode';
        }
    }
})();
</script>
```

### Step 3: Add Toggle to Layout

```cshtml
<!-- Pages/Shared/_Layout.cshtml or equivalent -->
<!-- Add in navbar or toolbar -->
<div class="navbar-nav ms-auto">
    @await Component.InvokeAsync("ThemeToggle")
</div>
```

---

## ?? Method 2: Bootstrap 5.3+ Built-in Dark Mode

### Step 1: Enable Bootstrap Dark Mode

```cshtml
<!-- Pages/_ViewImports.cshtml or _Layout.cshtml -->
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <!-- ... -->
</head>
```

### Step 2: Simple Toggle Script

```javascript
// wwwroot/js/theme-toggle.js

class ThemeToggle {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.attachListeners();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-bs-theme', this.theme);
        this.updateIcon();
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }
    
    updateIcon() {
        const icons = document.querySelectorAll('.theme-toggle-icon');
        icons.forEach(icon => {
            icon.className = this.theme === 'dark' 
                ? 'fas fa-sun theme-toggle-icon' 
                : 'fas fa-moon theme-toggle-icon';
        });
    }
    
    attachListeners() {
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});
```

---

## ?? Method 3: Advanced Dark Mode with System Preference

### Complete Implementation

```javascript
// wwwroot/js/advanced-theme-toggle.js

class AdvancedThemeToggle {
    constructor() {
        this.THEME_KEY = 'user-theme-preference';
        this.themes = ['light', 'dark', 'auto'];
        this.preference = this.getPreference();
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.attachListeners();
        this.watchSystemPreference();
    }
    
    getPreference() {
        const saved = localStorage.getItem(this.THEME_KEY);
        return saved || 'auto';
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
    }
    
    getCurrentTheme() {
        return this.preference === 'auto' 
            ? this.getSystemTheme() 
            : this.preference;
    }
    
    applyTheme() {
        const theme = this.getCurrentTheme();
        document.documentElement.setAttribute('data-bs-theme', theme);
        this.updateUI();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme, preference: this.preference } 
        }));
    }
    
    setPreference(preference) {
        if (!this.themes.includes(preference)) return;
        
        this.preference = preference;
        localStorage.setItem(this.THEME_KEY, preference);
        this.applyTheme();
    }
    
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.preference);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setPreference(this.themes[nextIndex]);
    }
    
    updateUI() {
        const theme = this.getCurrentTheme();
        const preference = this.preference;
        
        // Update button icons
        document.querySelectorAll('[data-theme-icon]').forEach(icon => {
            const icons = {
                'light': 'fa-sun',
                'dark': 'fa-moon',
                'auto': 'fa-circle-half-stroke'
            };
            
            icon.className = `fas ${icons[preference]} theme-toggle-icon`;
        });
        
        // Update button text
        document.querySelectorAll('[data-theme-text]').forEach(text => {
            const labels = {
                'light': 'Light',
                'dark': 'Dark',
                'auto': 'Auto'
            };
            
            text.textContent = labels[preference];
        });
        
        // Update active state in dropdown
        document.querySelectorAll('[data-theme-option]').forEach(option => {
            const optionTheme = option.dataset.themeOption;
            option.classList.toggle('active', optionTheme === preference);
        });
    }
    
    watchSystemPreference() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', () => {
            if (this.preference === 'auto') {
                this.applyTheme();
            }
        });
    }
    
    attachListeners() {
        // Simple toggle button
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });
        
        // Theme option buttons
        document.querySelectorAll('[data-theme-option]').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.setPreference(option.dataset.themeOption);
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.advancedThemeToggle = new AdvancedThemeToggle();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedThemeToggle;
}
```

### UI Component with Dropdown

```cshtml
<!-- Components/ThemeToggle/Default.cshtml -->
<div class="dropdown theme-toggle-dropdown">
    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
            type="button" 
            id="themeDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false">
        <i data-theme-icon class="fas fa-circle-half-stroke"></i>
        <span data-theme-text class="ms-2 d-none d-md-inline">Auto</span>
    </button>
    
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="themeDropdown">
        <li>
            <a class="dropdown-item" href="#" data-theme-option="light">
                <i class="fas fa-sun me-2"></i>
                <span>Light</span>
                <i class="fas fa-check ms-auto d-none"></i>
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="#" data-theme-option="dark">
                <i class="fas fa-moon me-2"></i>
                <span>Dark</span>
                <i class="fas fa-check ms-auto d-none"></i>
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="#" data-theme-option="auto">
                <i class="fas fa-circle-half-stroke me-2"></i>
                <span>Auto (System)</span>
                <i class="fas fa-check ms-auto d-none"></i>
            </a>
        </li>
    </ul>
</div>

<style>
.theme-toggle-dropdown .dropdown-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
}

.theme-toggle-dropdown .dropdown-item.active {
    background-color: var(--bs-primary);
    color: white;
}

.theme-toggle-dropdown .dropdown-item.active .fa-check {
    display: inline-block !important;
}

.theme-toggle-dropdown .dropdown-item:hover {
    background-color: var(--bg-tertiary);
}
</style>
```

---

## ?? Method 4: ABP Framework Integration

### ABP Module Configuration

```csharp
// AbpProjectModule.cs or your custom module

using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;

public override void ConfigureServices(ServiceConfigurationContext context)
{
    Configure<AbpBundlingOptions>(options =>
    {
        // Add dark mode styles
        options
            .StyleBundles
            .Configure(LeptonXLiteThemeBundles.Styles.Global, bundle =>
            {
                bundle.AddFiles("/css/theme-colors.css");
                bundle.AddFiles("/css/dark-mode.css");
            });
        
        // Add dark mode scripts
        options
            .ScriptBundles
            .Configure(LeptonXLiteThemeBundles.Scripts.Global, bundle =>
            {
                bundle.AddFiles("/js/advanced-theme-toggle.js");
            });
    });
}
```

---

## ?? Dark Mode Best Practices

### 1. Test Both Modes

```css
/* Use this helper class for testing */
.theme-debug {
    border: 2px dashed red;
}

:root[data-bs-theme="dark"] .theme-debug {
    border-color: yellow;
}
```

### 2. Images for Dark Mode

```css
/* Default image */
.logo {
    content: url('/images/logo-light.png');
}

/* Dark mode image */
:root[data-bs-theme="dark"] .logo {
    content: url('/images/logo-dark.png');
}

/* Or use CSS filter */
:root[data-bs-theme="dark"] .logo-filter {
    filter: invert(1) hue-rotate(180deg);
}
```

### 3. Smooth Transitions

```css
/* Add smooth transition for theme changes */
* {
    transition: background-color 0.3s ease, 
                color 0.3s ease, 
                border-color 0.3s ease;
}

/* Disable transitions during theme switch */
body.theme-transitioning * {
    transition: none !important;
}
```

```javascript
// Add this to theme toggle
function applyThemeWithTransition(theme) {
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 50);
    }, 0);
}
```

### 4. Accessibility

```html
<!-- Add aria-label for screen readers -->
<button id="themeToggleBtn" 
        aria-label="Toggle dark mode"
        aria-pressed="false">
    <i class="fas fa-moon"></i>
    <span class="sr-only">Toggle dark mode</span>
</button>
```

---

## ?? Testing Checklist

- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Auto mode follows system preference
- [ ] Theme preference persists on reload
- [ ] All components styled in both modes
- [ ] Images/logos display correctly in both modes
- [ ] Transitions are smooth
- [ ] No color contrast issues (WCAG AA)
- [ ] Works on all browsers
- [ ] Works on mobile devices

---

## ?? Integration Example

### Complete Setup in New Project

```powershell
# 1. Copy theme files
Copy-Item "ExtractedThemes\CustomTheme\wwwroot\css\theme-colors.css" `
          "YourProject\wwwroot\css\"

# 2. Copy JavaScript
Copy-Item "ExtractedThemes\CustomTheme\wwwroot\js\advanced-theme-toggle.js" `
          "YourProject\wwwroot\js\"

# 3. Add to bundle (in Module.cs)
# Configure<AbpBundlingOptions> as shown above

# 4. Add toggle component to layout
# @await Component.InvokeAsync("ThemeToggle")

# 5. Test
dotnet run
```

---

## ?? Pro Tips

### 1. Debug Dark Mode
```javascript
// Console helper
console.log('Current theme:', document.documentElement.getAttribute('data-bs-theme'));
console.log('Preference:', localStorage.getItem('user-theme-preference'));
console.log('System prefers:', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
```

### 2. Force Dark Mode for Testing
```javascript
// In browser console
localStorage.setItem('user-theme-preference', 'dark');
location.reload();
```

### 3. CSS Variables Inspector
```javascript
// Check CSS variable values
const styles = getComputedStyle(document.documentElement);
console.log('--brand-primary:', styles.getPropertyValue('--brand-primary'));
```

---

**Happy Dark Mode Coding! ??**
