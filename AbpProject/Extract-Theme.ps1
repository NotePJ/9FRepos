<#
.SYNOPSIS
    Extract theme files from ABP project for reuse

.DESCRIPTION
    This script extracts CSS, images, and other theme assets from an ABP project
    to create a reusable theme package

.PARAMETER SourceProject
    Path to source ABP project

.PARAMETER OutputPath
    Path where theme will be extracted

.PARAMETER ThemeName
    Name for the extracted theme (default: CustomTheme)

.PARAMETER IncludeLibs
    Include third-party libraries (default: false)

.EXAMPLE
    .\Extract-Theme.ps1 -SourceProject "AbpProject" -OutputPath "D:\Themes" -ThemeName "MyTheme"

.EXAMPLE
    .\Extract-Theme.ps1 -SourceProject "AbpProject" -OutputPath "D:\Themes" -ThemeName "MyTheme" -IncludeLibs $true
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$SourceProject = "AbpProject",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\ExtractedThemes",
    
    [Parameter(Mandatory=$false)]
    [string]$ThemeName = "CustomTheme",
    
    [Parameter(Mandatory=$false)]
    [bool]$IncludeLibs = $false
)

# Colors
$InfoColor = "Cyan"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $ErrorColor
}

Write-Host @"

?????????????????????????????????????????????????????????????????
?         ABP Theme Extraction Tool                             ?
?         Extracting from: $SourceProject
?????????????????????????????????????????????????????????????????

"@ -ForegroundColor $InfoColor

# Validate source project
if (-not (Test-Path $SourceProject)) {
    Write-Error "Source project not found: $SourceProject"
    exit 1
}

$sourceWwwroot = Join-Path $SourceProject "wwwroot"
if (-not (Test-Path $sourceWwwroot)) {
    Write-Error "wwwroot folder not found in source project"
    exit 1
}

# Create output directory
Write-Info "`n[1/6] Creating output directory..."
$themePath = Join-Path $OutputPath $ThemeName
New-Item -Path $themePath -ItemType Directory -Force | Out-Null
Write-Success "Created: $themePath"

# Create wwwroot structure
Write-Info "`n[2/6] Creating theme structure..."
$wwwrootPath = Join-Path $themePath "wwwroot"
$dirs = @("css", "images", "js", "fonts")
foreach ($dir in $dirs) {
    $dirPath = Join-Path $wwwrootPath $dir
    New-Item -Path $dirPath -ItemType Directory -Force | Out-Null
    Write-Success "Created: $dir/"
}

# Copy global styles
Write-Info "`n[3/6] Copying CSS files..."
$copiedCss = 0

# Global styles
if (Test-Path "$sourceWwwroot\global-styles.css") {
    Copy-Item "$sourceWwwroot\global-styles.css" "$wwwrootPath\css\" -Force
    Write-Success "global-styles.css"
    $copiedCss++
}

# Page-specific CSS
$pagesPath = Join-Path $SourceProject "Pages"
if (Test-Path $pagesPath) {
    $pageCssFiles = Get-ChildItem -Path $pagesPath -Filter "*.css" -Recurse
    foreach ($cssFile in $pageCssFiles) {
        $relativePath = $cssFile.FullName.Substring($pagesPath.Length + 1)
        $destPath = Join-Path "$wwwrootPath\css\pages" $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        Copy-Item $cssFile.FullName $destPath -Force
        Write-Success "$($cssFile.Name)"
        $copiedCss++
    }
}

Write-Info "Total CSS files copied: $copiedCss"

# Copy images
Write-Info "`n[4/6] Copying images..."
$copiedImages = 0

if (Test-Path "$sourceWwwroot\images") {
    $imageFiles = Get-ChildItem -Path "$sourceWwwroot\images" -Recurse -File
    foreach ($imageFile in $imageFiles) {
        $relativePath = $imageFile.FullName.Substring("$sourceWwwroot\images".Length + 1)
        $destPath = Join-Path "$wwwrootPath\images" $relativePath
        $destDir = Split-Path $destPath -Parent
        New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        Copy-Item $imageFile.FullName $destPath -Force
        $copiedImages++
    }
    Write-Success "Copied $copiedImages images"
}

# Copy fonts (if any)
Write-Info "`n[5/6] Copying fonts..."
if (Test-Path "$sourceWwwroot\fonts") {
    Copy-Item "$sourceWwwroot\fonts\*" "$wwwrootPath\fonts\" -Recurse -Force
    Write-Success "Copied fonts"
}

# Copy libraries (optional)
if ($IncludeLibs) {
    Write-Info "`n[5.5/6] Copying third-party libraries..."
    if (Test-Path "$sourceWwwroot\libs") {
        Copy-Item "$sourceWwwroot\libs" "$wwwrootPath\" -Recurse -Force
        Write-Success "Copied libs/"
    }
}

# Create documentation
Write-Info "`n[6/6] Creating documentation..."

$readmeContent = @"
# $ThemeName

Theme extracted from **$SourceProject** on $([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))

## ?? Package Contents

- **CSS Files**: $copiedCss files
- **Images**: $copiedImages files
- **Fonts**: $(if (Test-Path "$wwwrootPath\fonts") { "Included" } else { "Not included" })
- **Libraries**: $(if ($IncludeLibs) { "Included" } else { "Not included" })

## ?? Installation

### Method 1: Direct Copy

``````powershell
# Copy entire wwwroot folder
Copy-Item -Path "$ThemeName\wwwroot\*" ``
          -Destination "YourProject\wwwroot\" ``
          -Recurse -Force
``````

### Method 2: Copy Specific Files

``````powershell
# Copy only CSS
Copy-Item -Path "$ThemeName\wwwroot\css\*" ``
          -Destination "YourProject\wwwroot\css\" ``
          -Recurse -Force

# Copy only images
Copy-Item -Path "$ThemeName\wwwroot\images\*" ``
          -Destination "YourProject\wwwroot\images\" ``
          -Recurse -Force
``````

### Method 3: ABP Bundling

``````csharp
// In your Module.cs
Configure<AbpBundlingOptions>(options =>
{
    options.StyleBundles.Configure(
        LeptonXLiteThemeBundles.Styles.Global,
        bundle =>
        {
            bundle.AddFiles("/css/global-styles.css");
        }
    );
});
``````

## ?? Customization

### 1. Edit CSS Variables

``````css
/* wwwroot/css/global-styles.css */
:root {
    --brand-primary: #YOUR_COLOR;
    --lpx-logo: url('/images/your-logo.png');
}
``````

### 2. Replace Logo Images

Replace files in:
- ``wwwroot/images/logo/``

### 3. Customize Colors

Edit brand colors in:
- ``wwwroot/css/global-styles.css``

## ?? File Structure

``````
$ThemeName/
??? wwwroot/
?   ??? css/
?   ?   ??? global-styles.css
?   ?   ??? pages/
?   ??? images/
?   ?   ??? logo/
?   ?   ??? getting-started/
?   ??? js/
?   ??? fonts/
??? README.md
``````

## ?? Integration Examples

### Razor Pages (_Layout.cshtml)

``````cshtml
<link rel="stylesheet" href="~/css/global-styles.css" />
``````

### ABP Module

``````csharp
[DependsOn(typeof(LeptonXLiteThemeModule))]
public class YourModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle => bundle.AddFiles("/css/global-styles.css")
            );
        });
    }
}
``````

## ?? Resources

- [ABP Documentation](https://abp.io/docs)
- [LeptonX Lite Theme](https://abp.io/docs/latest/themes/lepton-x-lite/mvc)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)

## ?? Troubleshooting

### Images not displaying
- Check image paths in CSS
- Ensure images are copied to wwwroot/images/

### CSS not applied
- Verify CSS file is included in bundle
- Check browser console for 404 errors
- Clear browser cache

### Logo not showing
- Update --lpx-logo path in global-styles.css
- Ensure logo files exist in wwwroot/images/logo/

## ?? Changelog

### Version 1.0.0 ($([DateTime]::Now.ToString('yyyy-MM-dd')))
- Initial theme extraction
- Includes all CSS and images from source project

---

**Created by:** Theme Extraction Tool
**Source:** $SourceProject
**Date:** $([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))
"@

Set-Content -Path (Join-Path $themePath "README.md") -Value $readmeContent -Encoding UTF8
Write-Success "Created README.md"

# Create usage example
$usageContent = @"
# Quick Start Examples

## 1. Use in New ABP Project

``````powershell
# Navigate to new project
cd D:\Projects\NewProject

# Copy theme
Copy-Item -Path "$themePath\wwwroot\*" ``
          -Destination "wwwroot\" ``
          -Recurse -Force

# Run project
dotnet run
``````

## 2. Use in Existing Project

``````powershell
# Backup existing theme (optional)
Move-Item "wwwroot\css\global-styles.css" "wwwroot\css\global-styles.backup.css"

# Copy new theme CSS
Copy-Item -Path "$themePath\wwwroot\css\*" ``
          -Destination "wwwroot\css\" ``
          -Recurse -Force

# Copy new images
Copy-Item -Path "$themePath\wwwroot\images\*" ``
          -Destination "wwwroot\images\" ``
          -Recurse -Force
``````

## 3. Create NuGet Package

``````powershell
# Create new project
dotnet new classlib -n MyCompany.Theme -f net10.0
cd MyCompany.Theme

# Copy theme files
Copy-Item -Path "$themePath\wwwroot" -Destination . -Recurse

# Edit .csproj
# Add: <EmbeddedResource Include="wwwroot/**/*" />

# Pack
dotnet pack -c Release

# Use in projects
# <PackageReference Include="MyCompany.Theme" Version="1.0.0" />
``````

## 4. Customize Logo

``````powershell
# Replace logo files
Copy-Item "your-logo-light.png" ``
          "$themePath\wwwroot\images\logo\leptonxlite\logo-light-thumbnail.png"

Copy-Item "your-logo-dark.png" ``
          "$themePath\wwwroot\images\logo\leptonxlite\logo-dark-thumbnail.png"
``````

## 5. Customize Colors

``````css
/* Edit wwwroot/css/global-styles.css */
:root {
    --brand-primary: #FF6B6B;    /* Your brand color */
    --brand-success: #51CF66;
    --brand-warning: #FFA500;
    --brand-danger: #FF4757;
}
``````
"@

Set-Content -Path (Join-Path $themePath "USAGE.md") -Value $usageContent -Encoding UTF8
Write-Success "Created USAGE.md"

# Create CSS variables extraction
$variablesContent = @"
/* ========================================
   CSS Variables Template
   
   Copy these to your custom theme and modify
   ======================================== */

:root {
    /* Brand Colors */
    --brand-primary: #1890ff;
    --brand-success: #52c41a;
    --brand-warning: #faad14;
    --brand-danger: #f5222d;
    --brand-info: #13c2c2;
    
    /* Logo URLs */
    --lpx-logo: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
    --lpx-logo-icon: url('/images/logo/leptonxlite/logo-light-thumbnail.png');
    
    /* Typography */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
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

/* Dark Theme */
:root[data-bs-theme="dark"] {
    --lpx-logo: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
}

/* Account Layout */
:root .abp-account-layout .lpx-brand-logo {
    --lpx-logo: url('/images/logo/leptonxlite/logo-dark-thumbnail.png');
    background-position: left;
}
"@

Set-Content -Path (Join-Path "$wwwrootPath\css" "variables-template.css") -Value $variablesContent -Encoding UTF8
Write-Success "Created variables-template.css"

# Create summary file
$summaryContent = @"
# Theme Extraction Summary

**Extraction Date:** $([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))
**Source Project:** $SourceProject
**Theme Name:** $ThemeName
**Output Path:** $themePath

## Extracted Files

### CSS Files: $copiedCss
$(if ($copiedCss -gt 0) {
    Get-ChildItem -Path "$wwwrootPath\css" -Recurse -File | ForEach-Object {
        "- $($_.Name) ($([math]::Round($_.Length/1024, 2)) KB)"
    } | Out-String
})

### Images: $copiedImages
$(if ($copiedImages -gt 0) {
    $totalSize = (Get-ChildItem -Path "$wwwrootPath\images" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    "Total size: $([math]::Round($totalSize/1MB, 2)) MB"
})

### Libraries
$(if ($IncludeLibs) {
    "? Third-party libraries included"
} else {
    "? Third-party libraries not included"
})

## Next Steps

1. **Review** extracted files in: $themePath
2. **Customize** CSS variables in: wwwroot/css/variables-template.css
3. **Replace** logo images if needed
4. **Test** in a new project using USAGE.md examples
5. **Share** with your team or create NuGet package

## Quick Commands

### Copy to new project
``````powershell
Copy-Item -Path "$themePath\wwwroot\*" -Destination "YourProject\wwwroot\" -Recurse -Force
``````

### View README
``````powershell
code "$themePath\README.md"
``````

### View usage examples
``````powershell
code "$themePath\USAGE.md"
``````

---

Theme extraction completed successfully! ??
"@

Set-Content -Path (Join-Path $themePath "EXTRACTION-SUMMARY.txt") -Value $summaryContent -Encoding UTF8
Write-Success "Created EXTRACTION-SUMMARY.txt"

# Final summary
Write-Host @"

?????????????????????????????????????????????????????????????????
?         Theme Extraction Completed!                           ?
?????????????????????????????????????????????????????????????????

"@ -ForegroundColor $SuccessColor

Write-Host "Theme Name:      " -NoNewline -ForegroundColor Gray
Write-Host $ThemeName -ForegroundColor $SuccessColor

Write-Host "Output Path:     " -NoNewline -ForegroundColor Gray
Write-Host $themePath -ForegroundColor $SuccessColor

Write-Host "CSS Files:       " -NoNewline -ForegroundColor Gray
Write-Host $copiedCss -ForegroundColor $SuccessColor

Write-Host "Images:          " -NoNewline -ForegroundColor Gray
Write-Host $copiedImages -ForegroundColor $SuccessColor

Write-Host "Libraries:       " -NoNewline -ForegroundColor Gray
Write-Host $(if ($IncludeLibs) { "Included" } else { "Not included" }) -ForegroundColor $(if ($IncludeLibs) { $SuccessColor } else { $WarningColor })

Write-Host "`nDocumentation:" -ForegroundColor $InfoColor
Write-Host "  README.md              - " -NoNewline -ForegroundColor Gray
Write-Host "Theme overview and installation" -ForegroundColor White
Write-Host "  USAGE.md               - " -NoNewline -ForegroundColor Gray
Write-Host "Quick start examples" -ForegroundColor White
Write-Host "  EXTRACTION-SUMMARY.txt - " -NoNewline -ForegroundColor Gray
Write-Host "Extraction details" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor $InfoColor
Write-Host "  1. " -NoNewline -ForegroundColor Gray
Write-Host "Review extracted files: " -NoNewline -ForegroundColor White
Write-Host "code `"$themePath`"" -ForegroundColor Yellow

Write-Host "  2. " -NoNewline -ForegroundColor Gray
Write-Host "Customize CSS: " -NoNewline -ForegroundColor White
Write-Host "Edit variables-template.css" -ForegroundColor Yellow

Write-Host "  3. " -NoNewline -ForegroundColor Gray
Write-Host "Use in new project: " -NoNewline -ForegroundColor White
Write-Host "See USAGE.md" -ForegroundColor Yellow

Write-Host "`n? Theme is ready to use! ??" -ForegroundColor $SuccessColor
Write-Host ""
