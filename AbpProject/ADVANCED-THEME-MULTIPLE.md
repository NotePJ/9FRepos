# ?? Multiple Themes in One Project Guide

## ?? ??????

????????????????????????????? themes ??????????????? ??????????????????????????

---

## ?? Use Cases

1. **Multi-tenant Applications** - ????? tenant ?? theme ?????????
2. **White-label Solutions** - ???? theme ?????????
3. **Theme Marketplace** - ?????????????? theme ??????
4. **A/B Testing** - ????? theme ?????????????
5. **Seasonal Themes** - ??????? theme ?????????

---

## ?? Method 1: CSS-Based Theme Switching

### Step 1: Define Multiple Themes

```css
/* wwwroot/css/themes.css */

/* ========================================
   Base Theme (Default)
   ======================================== */
[data-theme="default"] {
    --brand-primary: #1890ff;
    --brand-success: #52c41a;
    --brand-warning: #faad14;
    --brand-danger: #f5222d;
    --brand-info: #13c2c2;
    
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #262626;
    --text-secondary: #595959;
    --border-color: #d9d9d9;
    
    --logo: url('/images/themes/default/logo.png');
}

/* ========================================
   Theme 1: Professional Blue
   ======================================== */
[data-theme="professional"] {
    --brand-primary: #0052CC;
    --brand-success: #00875A;
    --brand-warning: #FFAB00;
    --brand-danger: #DE350B;
    --brand-info: #00B8D9;
    
    --bg-primary: #FFFFFF;
    --bg-secondary: #F4F5F7;
    --text-primary: #172B4D;
    --text-secondary: #5E6C84;
    --border-color: #DFE1E6;
    
    --logo: url('/images/themes/professional/logo.png');
}

/* ========================================
   Theme 2: Creative Purple
   ======================================== */
[data-theme="creative"] {
    --brand-primary: #7C3AED;
    --brand-success: #10B981;
    --brand-warning: #F59E0B;
    --brand-danger: #EF4444;
    --brand-info: #3B82F6;
    
    --bg-primary: #FFFFFF;
    --bg-secondary: #F3F4F6;
    --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --text-primary: #111827;
    --text-secondary: #6B7280;
    --border-color: #E5E7EB;
    
    --logo: url('/images/themes/creative/logo.png');
}

/* ========================================
   Theme 3: Modern Dark
   ======================================== */
[data-theme="modern-dark"] {
    --brand-primary: #FF6B6B;
    --brand-success: #51CF66;
    --brand-warning: #FFD93D;
    --brand-danger: #FF6B6B;
    --brand-info: #4ECDC4;
    
    --bg-primary: #1A1A2E;
    --bg-secondary: #16213E;
    --bg-card: #0F3460;
    --text-primary: #EAEAEA;
    --text-secondary: #B0B0B0;
    --border-color: #2E3A59;
    
    --logo: url('/images/themes/modern-dark/logo.png');
}

/* ========================================
   Theme 4: Minimal
   ======================================== */
[data-theme="minimal"] {
    --brand-primary: #000000;
    --brand-success: #2ECC71;
    --brand-warning: #F39C12;
    --brand-danger: #E74C3C;
    --brand-info: #3498DB;
    
    --bg-primary: #FFFFFF;
    --bg-secondary: #FAFAFA;
    --text-primary: #000000;
    --text-secondary: #757575;
    --border-color: #E0E0E0;
    
    --logo: url('/images/themes/minimal/logo.png');
}

/* ========================================
   Apply Variables to Components
   ======================================== */
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease;
}

.card {
    background-color: var(--bg-card, var(--bg-primary));
    border-color: var(--border-color);
}

.btn-primary {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
}

.text-muted {
    color: var(--text-secondary) !important;
}

.brand-logo {
    content: var(--logo);
}
```

### Step 2: Theme Switcher Component

```csharp
// Components/ThemeSwitcher/ThemeSwitcherViewComponent.cs
using Microsoft.AspNetCore.Mvc;

namespace AbpProject.Components.ThemeSwitcher;

public class ThemeSwitcherViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View();
    }
}
```

```cshtml
<!-- Components/ThemeSwitcher/Default.cshtml -->
<div class="theme-switcher">
    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
            type="button" 
            id="themeSwitcherDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false">
        <i class="fas fa-palette me-2"></i>
        <span id="currentThemeName">Default</span>
    </button>
    
    <ul class="dropdown-menu dropdown-menu-end theme-switcher-menu" 
        aria-labelledby="themeSwitcherDropdown">
        <li class="dropdown-header">Choose Theme</li>
        
        <li>
            <a class="dropdown-item theme-option" 
               href="#" 
               data-theme="default">
                <div class="theme-preview" style="background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);"></div>
                <span>Default</span>
                <i class="fas fa-check ms-auto"></i>
            </a>
        </li>
        
        <li>
            <a class="dropdown-item theme-option" 
               href="#" 
               data-theme="professional">
                <div class="theme-preview" style="background: linear-gradient(135deg, #0052CC 0%, #00875A 100%);"></div>
                <span>Professional</span>
                <i class="fas fa-check ms-auto"></i>
            </a>
        </li>
        
        <li>
            <a class="dropdown-item theme-option" 
               href="#" 
               data-theme="creative">
                <div class="theme-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                <span>Creative</span>
                <i class="fas fa-check ms-auto"></i>
            </a>
        </li>
        
        <li>
            <a class="dropdown-item theme-option" 
               href="#" 
               data-theme="modern-dark">
                <div class="theme-preview" style="background: linear-gradient(135deg, #1A1A2E 0%, #FF6B6B 100%);"></div>
                <span>Modern Dark</span>
                <i class="fas fa-check ms-auto"></i>
            </a>
        </li>
        
        <li>
            <a class="dropdown-item theme-option" 
               href="#" 
               data-theme="minimal">
                <div class="theme-preview" style="background: linear-gradient(135deg, #000000 0%, #757575 100%);"></div>
                <span>Minimal</span>
                <i class="fas fa-check ms-auto"></i>
            </a>
        </li>
    </ul>
</div>

<style>
.theme-switcher-menu {
    min-width: 250px;
}

.theme-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
}

.theme-preview {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 2px solid var(--border-color);
}

.theme-option .fa-check {
    opacity: 0;
    transition: opacity 0.2s;
}

.theme-option.active .fa-check {
    opacity: 1;
}

.theme-option:hover {
    background-color: var(--bg-tertiary);
}
</style>

<script>
(function() {
    const THEMES = {
        'default': 'Default',
        'professional': 'Professional',
        'creative': 'Creative',
        'modern-dark': 'Modern Dark',
        'minimal': 'Minimal'
    };
    
    const THEME_KEY = 'user-selected-theme';
    
    // Get current theme
    let currentTheme = localStorage.getItem(THEME_KEY) || 'default';
    
    // Apply theme on load
    applyTheme(currentTheme);
    
    // Theme switcher click handler
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const theme = this.dataset.theme;
            applyTheme(theme);
            localStorage.setItem(THEME_KEY, theme);
        });
    });
    
    function applyTheme(theme) {
        // Set data-theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update UI
        document.getElementById('currentThemeName').textContent = THEMES[theme];
        
        // Update active state
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }
})();
</script>
```

---

## ?? Method 2: Multi-Tenant Theme System

### Step 1: Tenant Theme Configuration

```csharp
// Entities/TenantTheme.cs
using System;
using Volo.Abp.Domain.Entities;

namespace AbpProject.Entities;

public class TenantTheme : Entity<Guid>
{
    public Guid? TenantId { get; set; }
    public string ThemeName { get; set; } = "default";
    public string PrimaryColor { get; set; } = "#1890ff";
    public string SecondaryColor { get; set; } = "#52c41a";
    public string LogoUrl { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string CustomCss { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
```

### Step 2: Theme Service

```csharp
// Services/ThemeService.cs
using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Domain.Repositories;

namespace AbpProject.Services;

public interface IThemeService
{
    Task<TenantTheme> GetCurrentThemeAsync();
    Task<string> GetThemeCssAsync();
}

public class ThemeService : IThemeService, ITransientDependency
{
    private readonly ICurrentTenant _currentTenant;
    private readonly IRepository<TenantTheme, Guid> _themeRepository;
    
    public ThemeService(
        ICurrentTenant currentTenant,
        IRepository<TenantTheme, Guid> themeRepository)
    {
        _currentTenant = currentTenant;
        _themeRepository = themeRepository;
    }
    
    public async Task<TenantTheme> GetCurrentThemeAsync()
    {
        var tenantId = _currentTenant.Id;
        
        if (tenantId.HasValue)
        {
            var theme = await _themeRepository.FirstOrDefaultAsync(
                t => t.TenantId == tenantId && t.IsActive
            );
            
            if (theme != null)
                return theme;
        }
        
        // Return default theme
        return new TenantTheme
        {
            ThemeName = "default",
            PrimaryColor = "#1890ff",
            SecondaryColor = "#52c41a"
        };
    }
    
    public async Task<string> GetThemeCssAsync()
    {
        var theme = await GetCurrentThemeAsync();
        
        return $@"
            :root {{
                --brand-primary: {theme.PrimaryColor};
                --brand-secondary: {theme.SecondaryColor};
                --logo: url('{theme.LogoUrl}');
            }}
            
            {theme.CustomCss}
        ";
    }
}
```

### Step 3: Dynamic Theme Injection

```cshtml
<!-- Pages/Shared/_Layout.cshtml -->
@inject IThemeService ThemeService

<!DOCTYPE html>
<html>
<head>
    <!-- ... other head content ... -->
    
    <!-- Dynamic theme CSS -->
    <style id="dynamic-theme">
        @(await ThemeService.GetThemeCssAsync())
    </style>
</head>
<body>
    <!-- ... body content ... -->
</body>
</html>
```

---

## ?? Method 3: Theme Configuration API

### Step 1: Theme Configuration Model

```csharp
// Models/ThemeConfiguration.cs
using System.Collections.Generic;

namespace AbpProject.Models;

public class ThemeConfiguration
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public Dictionary<string, string> Colors { get; set; } = new();
    public Dictionary<string, string> Assets { get; set; } = new();
    public string CustomCss { get; set; } = string.Empty;
    public bool IsDark { get; set; }
}

public class ThemeLibrary
{
    public static readonly Dictionary<string, ThemeConfiguration> Themes = new()
    {
        ["default"] = new ThemeConfiguration
        {
            Name = "default",
            DisplayName = "Default Theme",
            Colors = new Dictionary<string, string>
            {
                ["primary"] = "#1890ff",
                ["success"] = "#52c41a",
                ["warning"] = "#faad14",
                ["danger"] = "#f5222d"
            },
            Assets = new Dictionary<string, string>
            {
                ["logo"] = "/images/themes/default/logo.png",
                ["favicon"] = "/images/themes/default/favicon.ico"
            }
        },
        
        ["professional"] = new ThemeConfiguration
        {
            Name = "professional",
            DisplayName = "Professional Blue",
            Colors = new Dictionary<string, string>
            {
                ["primary"] = "#0052CC",
                ["success"] = "#00875A",
                ["warning"] = "#FFAB00",
                ["danger"] = "#DE350B"
            },
            Assets = new Dictionary<string, string>
            {
                ["logo"] = "/images/themes/professional/logo.png",
                ["favicon"] = "/images/themes/professional/favicon.ico"
            }
        },
        
        // ... more themes
    };
}
```

### Step 2: Theme API Controller

```csharp
// Controllers/ThemeController.cs
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;

namespace AbpProject.Controllers;

[Route("api/theme")]
public class ThemeController : AbpController
{
    private readonly IThemeService _themeService;
    
    public ThemeController(IThemeService themeService)
    {
        _themeService = themeService;
    }
    
    [HttpGet("available")]
    public IActionResult GetAvailableThemes()
    {
        return Ok(ThemeLibrary.Themes);
    }
    
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentTheme()
    {
        var theme = await _themeService.GetCurrentThemeAsync();
        return Ok(theme);
    }
    
    [HttpPost("apply")]
    public async Task<IActionResult> ApplyTheme([FromBody] string themeName)
    {
        // Save theme preference
        // Implementation depends on your requirements
        return Ok();
    }
}
```

---

## ?? Method 4: Theme Preview System

```javascript
// wwwroot/js/theme-preview.js

class ThemePreview {
    constructor() {
        this.previewIframe = null;
        this.init();
    }
    
    init() {
        this.createPreviewModal();
        this.attachListeners();
    }
    
    createPreviewModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'themePreviewModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Theme Preview</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <iframe id="themePreviewIframe" 
                                style="width: 100%; height: 70vh; border: none;">
                        </iframe>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="applyThemeBtn">Apply Theme</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.previewIframe = document.getElementById('themePreviewIframe');
    }
    
    preview(themeName) {
        // Load current page in iframe with selected theme
        const url = new URL(window.location.href);
        url.searchParams.set('previewTheme', themeName);
        
        this.previewIframe.src = url.toString();
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('themePreviewModal'));
        modal.show();
        
        // Store theme for apply button
        document.getElementById('applyThemeBtn').dataset.theme = themeName;
    }
    
    applyTheme(themeName) {
        localStorage.setItem('user-selected-theme', themeName);
        window.location.reload();
    }
    
    attachListeners() {
        // Preview buttons
        document.querySelectorAll('[data-theme-preview]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.preview(btn.dataset.themePreview);
            });
        });
        
        // Apply button
        document.getElementById('applyThemeBtn')?.addEventListener('click', () => {
            const theme = document.getElementById('applyThemeBtn').dataset.theme;
            this.applyTheme(theme);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themePreview = new ThemePreview();
});
```

---

## ?? Theme Gallery Page

```cshtml
<!-- Pages/ThemeGallery.cshtml -->
@page
@model ThemeGalleryModel

<div class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="display-4">Theme Gallery</h1>
            <p class="lead">Choose your favorite theme</p>
        </div>
    </div>
    
    <div class="row g-4">
        @foreach (var theme in Model.Themes)
        {
            <div class="col-md-6 col-lg-4">
                <div class="card theme-card">
                    <div class="card-img-top theme-thumbnail" 
                         style="background: @theme.PreviewGradient;">
                        <div class="theme-preview-overlay">
                            <button class="btn btn-light btn-sm" 
                                    data-theme-preview="@theme.Name">
                                <i class="fas fa-eye me-2"></i>Preview
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <h5 class="card-title">@theme.DisplayName</h5>
                        <p class="card-text text-muted">@theme.Description</p>
                        
                        <div class="theme-colors mb-3">
                            @foreach (var color in theme.Colors.Take(4))
                            {
                                <span class="color-swatch" 
                                      style="background-color: @color.Value;"
                                      title="@color.Key"></span>
                            }
                        </div>
                        
                        <button class="btn btn-primary w-100 theme-apply-btn" 
                                data-theme="@theme.Name">
                            <i class="fas fa-check me-2"></i>Apply Theme
                        </button>
                    </div>
                </div>
            </div>
        }
    </div>
</div>

<style>
.theme-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.theme-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.theme-thumbnail {
    height: 200px;
    position: relative;
}

.theme-preview-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 0.2s;
}

.theme-card:hover .theme-preview-overlay {
    opacity: 1;
}

.theme-colors {
    display: flex;
    gap: 8px;
}

.color-swatch {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

<script>
document.querySelectorAll('.theme-apply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const theme = this.dataset.theme;
        localStorage.setItem('user-selected-theme', theme);
        window.location.reload();
    });
});
</script>
```

---

## ?? User Theme Preference Storage

### Database Storage

```csharp
// Entities/UserThemePreference.cs
public class UserThemePreference : Entity<Guid>
{
    public Guid UserId { get; set; }
    public string ThemeName { get; set; } = "default";
    public DateTime UpdatedAt { get; set; }
}

// Service
public class UserThemePreferenceService : ITransientDependency
{
    private readonly IRepository<UserThemePreference, Guid> _repository;
    private readonly ICurrentUser _currentUser;
    
    public async Task SavePreferenceAsync(string themeName)
    {
        var userId = _currentUser.GetId();
        var preference = await _repository.FirstOrDefaultAsync(p => p.UserId == userId);
        
        if (preference == null)
        {
            preference = new UserThemePreference
            {
                UserId = userId,
                ThemeName = themeName,
                UpdatedAt = DateTime.UtcNow
            };
            await _repository.InsertAsync(preference);
        }
        else
        {
            preference.ThemeName = themeName;
            preference.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(preference);
        }
    }
    
    public async Task<string> GetPreferenceAsync()
    {
        if (!_currentUser.IsAuthenticated)
            return "default";
            
        var userId = _currentUser.GetId();
        var preference = await _repository.FirstOrDefaultAsync(p => p.UserId == userId);
        
        return preference?.ThemeName ?? "default";
    }
}
```

---

## ? Testing Multiple Themes

```javascript
// wwwroot/js/theme-tester.js

class ThemeTester {
    testAllThemes() {
        const themes = ['default', 'professional', 'creative', 'modern-dark', 'minimal'];
        let currentIndex = 0;
        
        const interval = setInterval(() => {
            if (currentIndex >= themes.length) {
                clearInterval(interval);
                return;
            }
            
            console.log(`Testing theme: ${themes[currentIndex]}`);
            document.documentElement.setAttribute('data-theme', themes[currentIndex]);
            currentIndex++;
        }, 2000);
    }
    
    compareThemes(theme1, theme2) {
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 20px;';
        
        // Create iframe for each theme
        [theme1, theme2].forEach(theme => {
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'width: 50%; height: 100vh;';
            iframe.src = `/?theme=${theme}`;
            container.appendChild(iframe);
        });
        
        document.body.appendChild(container);
    }
}

// Usage:
// const tester = new ThemeTester();
// tester.testAllThemes();
```

---

**Happy Multi-Theme Development! ??**
