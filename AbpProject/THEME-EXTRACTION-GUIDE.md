# ?? ABP Theme Extraction & Reuse Guide

## ?? ??????

???????????????????????:
1. ??? Theme ??? CSS ??? AbpProject
2. Package ???? Reusable Theme
3. ????????? project ?????

---

## ?? Theme Components ??????????

### 1. CSS Files
```
wwwroot/
??? global-styles.css              # Global theme variables
??? libs/                          # Third-party CSS libraries
?   ??? bootstrap/                 # Bootstrap 5.3.8
?   ??? @fortawesome/             # Font Awesome icons
?   ??? sweetalert2/              # Alert dialogs
?   ??? select2/                  # Dropdown select
?   ??? datatables.net-bs5/       # DataTables
??? custom/                        # Custom theme CSS (?????)
```

### 2. Images & Assets
```
wwwroot/
??? images/
?   ??? logo/
?   ?   ??? leptonxlite/          # Theme logos
?   ??? getting-started/          # Landing page images
??? fonts/                         # Custom fonts (?????)
```

### 3. JavaScript
```
wwwroot/
??? libs/
    ??? abp/                       # ABP core JS
    ??? bootstrap/                 # Bootstrap JS
    ??? jquery/                    # jQuery
    ??? [other libraries]
```

### 4. Layout Files
```
Themes/                            # ABP Theme overrides (?????)
Pages/
??? _ViewImports.cshtml           # Razor imports
??? [Page-specific CSS]
```

---

## ?? Method 1: Create Theme NuGet Package

### Step 1: Create Theme Project

```powershell
# ????? Class Library project
dotnet new classlib -n MyCompany.Theme.LeptonXLite -f net10.0

cd MyCompany.Theme.LeptonXLite
```

### Step 2: Add Package References

```xml
<!-- MyCompany.Theme.LeptonXLite.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <AddRazorSupportForMvc>true</AddRazorSupportForMvc>
    <GenerateEmbeddedFilesManifest>true</GenerateEmbeddedFilesManifest>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite" Version="5.0.2" />
    <PackageReference Include="Microsoft.Extensions.FileProviders.Embedded" Version="10.0.0" />
  </ItemGroup>

  <ItemGroup>
    <!-- Embed all wwwroot files -->
    <EmbeddedResource Include="wwwroot/**/*" />
  </ItemGroup>
</Project>
```

### Step 3: Copy Theme Files

```powershell
# ?????????????? folder
New-Item -Path "wwwroot" -ItemType Directory
New-Item -Path "wwwroot/css" -ItemType Directory
New-Item -Path "wwwroot/images" -ItemType Directory
New-Item -Path "wwwroot/js" -ItemType Directory

# Copy files ??? AbpProject
Copy-Item -Path "..\AbpProject\wwwroot\global-styles.css" -Destination "wwwroot\css\"
Copy-Item -Path "..\AbpProject\wwwroot\images\*" -Destination "wwwroot\images\" -Recurse
```

### Step 4: Create Theme Module

```csharp
// MyCompanyThemeModule.cs
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Volo.Abp.Modularity;

namespace MyCompany.Theme.LeptonXLite;

[DependsOn(
    typeof(LeptonXLiteThemeModule)
)]
public class MyCompanyThemeModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options
                .StyleBundles
                .Configure(LeptonXLiteThemeBundles.Styles.Global, bundle =>
                {
                    // Add custom global styles
                    bundle.AddFiles("/css/global-styles.css");
                });
        });
    }
}
```

### Step 5: Pack & Publish

```powershell
# Pack to NuGet
dotnet pack -c Release -o ./nupkg

# Publish to local feed
dotnet nuget push ./nupkg/MyCompany.Theme.LeptonXLite.1.0.0.nupkg --source "LocalFeed"

# Or publish to NuGet.org
dotnet nuget push ./nupkg/MyCompany.Theme.LeptonXLite.1.0.0.nupkg --api-key YOUR_API_KEY --source https://api.nuget.org/v3/index.json
```

---

## ?? Method 2: Shared Theme Folder

### Step 1: Create Shared Theme Repository

```powershell
# ????? shared theme folder
New-Item -Path "D:\SharedThemes\ABPTheme" -ItemType Directory

# Copy theme files
Copy-Item -Path "AbpProject\wwwroot\*" -Destination "D:\SharedThemes\ABPTheme\wwwroot\" -Recurse -Force
```

### Step 2: Git Repository (Optional)

```powershell
cd D:\SharedThemes\ABPTheme

git init
git add .
git commit -m "Initial ABP theme"
git remote add origin https://your-git-repo.git
git push -u origin main
```

### Step 3: Use in New Projects

```powershell
# ??????????????
cd D:\Projects\NewProject

# Copy theme files
Copy-Item -Path "D:\SharedThemes\ABPTheme\wwwroot\*" -Destination "wwwroot\" -Recurse -Force

# ??????? Git submodule
git submodule add https://your-git-repo.git Themes/ABPTheme
```

---

## ?? Method 3: CSS Framework Only

### Extract Core CSS Variables

```css
/* custom-theme.css */

/* ========================================
   Custom Theme Variables
   Based on ABP LeptonX Lite Theme
   ======================================== */

:root {
    /* Brand Colors */
    --brand-primary: #1890ff;
    --brand-success: #52c41a;
    --brand-warning: #faad14;
    --brand-danger: #f5222d;
    --brand-info: #13c2c2;
    
    /* Logo */
    --lpx-logo: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
    --lpx-logo-icon: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
    
    /* Typography */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    --font-size-base: 14px;
    --line-height-base: 1.5;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Border Radius */
    --border-radius-sm: 2px;
    --border-radius-md: 4px;
    --border-radius-lg: 8px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Dark mode support */
:root[data-bs-theme="dark"] {
    --brand-primary: #1890ff;
    --lpx-logo: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
}

/* Account layout specific */
:root .abp-account-layout .lpx-brand-logo {
    --lpx-logo: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
    background-position: left;
}

/* Card with background image */
.card-bg-image {
    pointer-events: none;
    position: absolute;
    width: 630px;
    height: auto;
    bottom: 0;
    right: 0;
    z-index: 1;
}

.starting-content {
    position: relative;
    z-index: 2;
}

/* Custom utility classes */
.border-left-primary {
    border-left: 4px solid var(--brand-primary) !important;
}

.border-left-success {
    border-left: 4px solid var(--brand-success) !important;
}

.border-left-warning {
    border-left: 4px solid var(--brand-warning) !important;
}

.border-left-info {
    border-left: 4px solid var(--brand-info) !important;
}

/* ABP specific overrides */
.abp-logo {
    display: inline-block;
    width: 40px;
    height: 40px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.abp-support {
    background-image: url('/images/getting-started/support-icon.svg');
}

.abp-blog {
    background-image: url('/images/getting-started/blog-icon.svg');
}

.abp-community {
    background-image: url('/images/getting-started/community-icon.svg');
}
```

### Create Theme Bundle File

```csharp
// Bundling/CustomThemeBundleContributor.cs
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;

namespace MyCompany.Theme;

public class CustomThemeBundleContributor : BundleContributor
{
    public override void ConfigureBundle(BundleConfigurationContext context)
    {
        context.Files.Add("/css/custom-theme.css");
        context.Files.Add("/css/custom-utilities.css");
    }
}
```

---

## ?? Integration in New Project

### Option A: Use NuGet Package

```xml
<!-- YourProject.csproj -->
<ItemGroup>
  <PackageReference Include="MyCompany.Theme.LeptonXLite" Version="1.0.0" />
</ItemGroup>
```

```csharp
// YourProjectModule.cs
[DependsOn(
    typeof(MyCompanyThemeModule)
)]
public class YourProjectModule : AbpModule
{
    // ...
}
```

### Option B: Direct CSS Import

```cshtml
<!-- Pages/Shared/_Layout.cshtml or equivalent -->
<link rel="stylesheet" href="~/css/custom-theme.css" />
```

### Option C: ABP Bundling

```csharp
// YourProjectModule.cs
public override void ConfigureServices(ServiceConfigurationContext context)
{
    Configure<AbpBundlingOptions>(options =>
    {
        options
            .StyleBundles
            .Configure(LeptonXLiteThemeBundles.Styles.Global, bundle =>
            {
                bundle.AddFiles("/css/custom-theme.css");
            });
    });
}
```

---

## ?? Recommended Theme Structure

```
MyCompany.Theme.LeptonXLite/
??? wwwroot/
?   ??? css/
?   ?   ??? theme.css                  # Main theme file
?   ?   ??? variables.css              # CSS variables
?   ?   ??? utilities.css              # Utility classes
?   ?   ??? components/
?   ?       ??? cards.css
?   ?       ??? buttons.css
?   ?       ??? forms.css
?   ?       ??? tables.css
?   ?
?   ??? images/
?   ?   ??? logo/
?   ?   ??? icons/
?   ?
?   ??? js/
?       ??? theme.js                   # Custom JS (if needed)
?
??? Bundling/
?   ??? ThemeBundleContributor.cs
?
??? MyCompanyThemeModule.cs
??? MyCompany.Theme.LeptonXLite.csproj
```

---

## ?? Customization Guide

### 1. Change Brand Colors

```css
/* wwwroot/css/variables.css */
:root {
    --brand-primary: #YOUR_PRIMARY_COLOR;
    --brand-success: #YOUR_SUCCESS_COLOR;
    /* ... other colors */
}
```

### 2. Change Logo

```css
/* wwwroot/css/theme.css */
:root {
    --lpx-logo: url('/images/logo/your-logo-light.png');
    --lpx-logo-icon: url('/images/logo/your-icon.png');
}
```

### 3. Custom Components

```css
/* wwwroot/css/components/cards.css */
.custom-card {
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    /* ... your styles */
}
```

---

## ?? PowerShell Script: Extract Theme

```powershell
# Extract-Theme.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$SourceProject,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [string]$ThemeName = "CustomTheme"
)

Write-Host "Extracting theme from $SourceProject..." -ForegroundColor Cyan

# Create output directory
$themePath = Join-Path $OutputPath $ThemeName
New-Item -Path $themePath -ItemType Directory -Force | Out-Null

# Create wwwroot structure
$wwwrootPath = Join-Path $themePath "wwwroot"
New-Item -Path $wwwrootPath -ItemType Directory -Force | Out-Null
New-Item -Path "$wwwrootPath\css" -ItemType Directory -Force | Out-Null
New-Item -Path "$wwwrootPath\images" -ItemType Directory -Force | Out-Null
New-Item -Path "$wwwrootPath\js" -ItemType Directory -Force | Out-Null

# Copy global styles
$sourceWwwroot = Join-Path $SourceProject "wwwroot"
if (Test-Path "$sourceWwwroot\global-styles.css") {
    Copy-Item "$sourceWwwroot\global-styles.css" "$wwwrootPath\css\" -Force
    Write-Host "? Copied global-styles.css" -ForegroundColor Green
}

# Copy images
if (Test-Path "$sourceWwwroot\images") {
    Copy-Item "$sourceWwwroot\images\*" "$wwwrootPath\images\" -Recurse -Force
    Write-Host "? Copied images" -ForegroundColor Green
}

# Copy page-specific CSS
$pagesPath = Join-Path $SourceProject "Pages"
Get-ChildItem -Path $pagesPath -Filter "*.css" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($pagesPath.Length + 1)
    $destPath = Join-Path "$wwwrootPath\css\pages" $relativePath
    $destDir = Split-Path $destPath -Parent
    New-Item -Path $destDir -ItemType Directory -Force | Out-Null
    Copy-Item $_.FullName $destPath -Force
    Write-Host "? Copied $($_.Name)" -ForegroundColor Green
}

# Create README
$readmeContent = @"
# $ThemeName

Theme extracted from $SourceProject

## Installation

### Option 1: Copy files
``````powershell
Copy-Item -Path "wwwroot\*" -Destination "YourProject\wwwroot\" -Recurse -Force
``````

### Option 2: Reference in bundle
``````csharp
Configure<AbpBundlingOptions>(options =>
{
    options.StyleBundles.Configure(
        LeptonXLiteThemeBundles.Styles.Global,
        bundle => bundle.AddFiles("/css/global-styles.css")
    );
});
``````

## Customization

Edit CSS files in wwwroot/css/ to customize the theme.
"@

Set-Content -Path (Join-Path $themePath "README.md") -Value $readmeContent

Write-Host "`n? Theme extracted successfully to: $themePath" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and customize CSS files" -ForegroundColor Gray
Write-Host "2. Update logo images if needed" -ForegroundColor Gray
Write-Host "3. Copy to your new project or create NuGet package" -ForegroundColor Gray
```

---

## ?? Usage Example

### Extract Theme

```powershell
.\Extract-Theme.ps1 `
    -SourceProject "D:\Documents\Projects\AbpProject\AbpProject" `
    -OutputPath "D:\Themes" `
    -ThemeName "MyCustomTheme"
```

### Use in New Project

```powershell
# Method 1: Direct copy
Copy-Item -Path "D:\Themes\MyCustomTheme\wwwroot\*" `
          -Destination "D:\Projects\NewProject\wwwroot\" `
          -Recurse -Force

# Method 2: Create symlink (Windows)
New-Item -ItemType SymbolicLink `
         -Path "D:\Projects\NewProject\Themes" `
         -Target "D:\Themes\MyCustomTheme"
```

---

## ?? Checklist

### Before Extraction
- [ ] Identify all custom CSS files
- [ ] List custom images and assets
- [ ] Document color scheme and variables
- [ ] Note any custom JavaScript

### During Extraction
- [ ] Copy global-styles.css
- [ ] Copy page-specific CSS
- [ ] Copy images and logos
- [ ] Copy fonts (if any)
- [ ] Extract CSS variables
- [ ] Document dependencies

### After Extraction
- [ ] Test in clean project
- [ ] Update paths and references
- [ ] Create documentation
- [ ] Version the theme
- [ ] Share with team

---

## ?? Best Practices

### 1. Use CSS Variables
```css
/* Good - Easy to customize */
:root {
    --primary-color: #1890ff;
}
.btn-primary {
    background-color: var(--primary-color);
}

/* Bad - Hard to maintain */
.btn-primary {
    background-color: #1890ff;
}
```

### 2. Namespace Your CSS
```css
/* Prefix with theme name */
.mycompany-card { }
.mycompany-btn { }
```

### 3. Document Everything
```css
/* ========================================
   Button Styles
   
   Usage:
   <button class="mycompany-btn mycompany-btn-primary">
   ======================================== */
```

### 4. Version Your Theme
```
MyTheme.v1.0.0/
??? CHANGELOG.md
??? README.md
??? wwwroot/
```

---

## ?? Next Steps

1. **Extract theme** ??? AbpProject
2. **Test** ?? project ????
3. **Document** ?????????
4. **Package** ???? NuGet (optional)
5. **Share** ??????

---

**Happy Theming! ??**
