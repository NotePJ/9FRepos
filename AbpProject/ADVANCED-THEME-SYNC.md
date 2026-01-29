# ?? Theme Sync & Update Guide

## ?? ??????

????????? sync ??? update themes ??????? projects

---

## ?? Sync Strategies

1. **Git Submodules** - Sync via git
2. **Package Updates** - Update via package manager
3. **Automated Sync** - CI/CD pipeline
4. **Manual Sync** - Copy files manually
5. **Symbolic Links** - Share via symlinks

---

## ?? Method 1: Git Submodules

### Setup

```powershell
# Add theme as submodule
git submodule add https://github.com/yourcompany/theme.git Themes/Shared

# Initialize
git submodule init
git submodule update
```

### Update

```powershell
# Update to latest
git submodule update --remote Themes/Shared

# Update to specific version
cd Themes/Shared
git checkout v1.2.0
cd ../..
git add Themes/Shared
git commit -m "Update theme to v1.2.0"
```

### Automate Updates

```yaml
# .github/workflows/update-theme.yml
name: Update Theme

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          
      - name: Update submodules
        run: git submodule update --remote
        
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "Update theme submodule"
          commit-message: "chore: update theme"
```

---

## ?? Method 2: Package Manager Sync

### NuGet Updates

```powershell
# Check for updates
dotnet list package --outdated

# Update to latest
dotnet add package MyCompany.Theme.Corporate

# Update to specific version
dotnet add package MyCompany.Theme.Corporate --version 1.2.0

# Update all packages
dotnet restore
```

### Automated Package Updates

```yaml
# .github/workflows/update-packages.yml
name: Update Packages

on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Update packages
        run: |
          dotnet add package MyCompany.Theme.Corporate
          
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "Update theme package"
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "nuget"
    directory: "/"
    schedule:
      interval: "weekly"
    allow:
      - dependency-name: "MyCompany.Theme.*"
```

---

## ?? Method 3: PowerShell Sync Script

```powershell
# Sync-Theme.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$SourceTheme,
    
    [Parameter(Mandatory=$true)]
    [string]$TargetProject,
    
    [Parameter(Mandatory=$false)]
    [bool]$DryRun = $false
)

function Write-Info { param($Message); Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param($Message); Write-Host "? $Message" -ForegroundColor Green }
function Write-Warning { param($Message); Write-Host "? $Message" -ForegroundColor Yellow }

Write-Info "Syncing theme from: $SourceTheme"
Write-Info "Target project: $TargetProject"

# Verify paths
if (-not (Test-Path $SourceTheme)) {
    Write-Error "Source theme not found: $SourceTheme"
    exit 1
}

if (-not (Test-Path $TargetProject)) {
    Write-Error "Target project not found: $TargetProject"
    exit 1
}

# Get file changes
$sourceFiles = Get-ChildItem "$SourceTheme\wwwroot" -Recurse -File
$targetWwwroot = Join-Path $TargetProject "wwwroot"

$changes = @{
    New = @()
    Modified = @()
    Unchanged = @()
}

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Substring("$SourceTheme\wwwroot\".Length)
    $targetFile = Join-Path $targetWwwroot $relativePath
    
    if (-not (Test-Path $targetFile)) {
        $changes.New += $relativePath
    } else {
        $sourceHash = (Get-FileHash $file.FullName).Hash
        $targetHash = (Get-FileHash $targetFile).Hash
        
        if ($sourceHash -ne $targetHash) {
            $changes.Modified += $relativePath
        } else {
            $changes.Unchanged += $relativePath
        }
    }
}

# Display summary
Write-Host "`nSync Summary:" -ForegroundColor Yellow
Write-Host "  New files:      $($changes.New.Count)" -ForegroundColor Green
Write-Host "  Modified files: $($changes.Modified.Count)" -ForegroundColor Yellow
Write-Host "  Unchanged:      $($changes.Unchanged.Count)" -ForegroundColor Gray

if ($DryRun) {
    Write-Warning "DRY RUN - No files will be copied"
    
    if ($changes.New.Count -gt 0) {
        Write-Host "`nNew files:" -ForegroundColor Green
        $changes.New | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }
    }
    
    if ($changes.Modified.Count -gt 0) {
        Write-Host "`nModified files:" -ForegroundColor Yellow
        $changes.Modified | ForEach-Object { Write-Host "  ~ $_" -ForegroundColor Yellow }
    }
    
    exit 0
}

# Confirm
if (-not $DryRun) {
    $confirm = Read-Host "`nProceed with sync? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Warning "Sync cancelled"
        exit 0
    }
}

# Perform sync
$copied = 0
foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Substring("$SourceTheme\wwwroot\".Length)
    $targetFile = Join-Path $targetWwwroot $relativePath
    $targetDir = Split-Path $targetFile -Parent
    
    if (-not (Test-Path $targetDir)) {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
    }
    
    Copy-Item $file.FullName $targetFile -Force
    $copied++
    
    if ($copied % 10 -eq 0) {
        Write-Host "." -NoNewline
    }
}

Write-Host ""
Write-Success "Synced $copied files"
Write-Info "Sync completed successfully!"
```

### Usage

```powershell
# Dry run
.\Sync-Theme.ps1 `
    -SourceTheme "D:\Themes\Corporate" `
    -TargetProject "D:\Projects\MyApp" `
    -DryRun $true

# Actual sync
.\Sync-Theme.ps1 `
    -SourceTheme "D:\Themes\Corporate" `
    -TargetProject "D:\Projects\MyApp"
```

---

## ?? Method 4: Watch & Auto-Sync

```powershell
# Watch-Theme.ps1

param(
    [string]$SourcePath,
    [string]$TargetPath
)

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $SourcePath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $relativePath = $path.Substring($SourcePath.Length + 1)
    $targetFile = Join-Path $TargetPath $relativePath
    
    switch ($changeType) {
        'Created' {
            $targetDir = Split-Path $targetFile -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            }
            Copy-Item $path $targetFile -Force
            Write-Host "Created: $relativePath" -ForegroundColor Green
        }
        'Changed' {
            Copy-Item $path $targetFile -Force
            Write-Host "Updated: $relativePath" -ForegroundColor Yellow
        }
        'Deleted' {
            if (Test-Path $targetFile) {
                Remove-Item $targetFile -Force
                Write-Host "Deleted: $relativePath" -ForegroundColor Red
            }
        }
    }
}

Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action

Write-Host "Watching for changes in: $SourcePath" -ForegroundColor Cyan
Write-Host "Auto-syncing to: $TargetPath" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

try {
    while ($true) { Start-Sleep 1 }
}
finally {
    $watcher.Dispose()
}
```

---

## ?? Method 5: CI/CD Pipeline Sync

```yaml
# .github/workflows/sync-theme.yml
name: Sync Theme

on:
  repository_dispatch:
    types: [theme-updated]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Checkout theme
        uses: actions/checkout@v3
        with:
          repository: yourcompany/theme
          path: theme-temp
          
      - name: Sync files
        run: |
          rm -rf wwwroot/css/theme*
          cp -r theme-temp/wwwroot/css/theme* wwwroot/css/
          cp -r theme-temp/wwwroot/images wwwroot/
          
      - name: Commit changes
        run: |
          git config user.name "Theme Bot"
          git config user.email "bot@yourcompany.com"
          git add .
          git commit -m "chore: sync theme files" || echo "No changes"
          git push
```

---

## ?? Version Tracking

### Track Theme Version

```csharp
// Models/ThemeVersion.cs
public class ThemeVersion
{
    public string Version { get; set; } = "1.0.0";
    public DateTime LastUpdate { get; set; }
    public string Source { get; set; } = string.Empty;
}

// Service
public class ThemeVersionService
{
    public ThemeVersion GetCurrentVersion()
    {
        // Read from wwwroot/theme-version.json
        var json = File.ReadAllText("wwwroot/theme-version.json");
        return JsonSerializer.Deserialize<ThemeVersion>(json);
    }
    
    public bool IsUpdateAvailable()
    {
        var current = GetCurrentVersion();
        var latest = GetLatestVersion(); // From API/package source
        
        return Version.Parse(latest.Version) > Version.Parse(current.Version);
    }
}
```

### Update Notification

```cshtml
<!-- Pages/Shared/_Layout.cshtml -->
@inject ThemeVersionService ThemeVersion

@if (ThemeVersion.IsUpdateAvailable())
{
    <div class="alert alert-info alert-dismissible">
        <i class="fas fa-info-circle me-2"></i>
        New theme version available!
        <a href="/admin/theme-update" class="alert-link">Update now</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
}
```

---

## ?? Best Practices

### 1. Semantic Versioning
```
1.0.0 - Initial
1.0.1 - Bug fixes
1.1.0 - New features
2.0.0 - Breaking changes
```

### 2. Changelog
```markdown
## [1.1.0] - 2024-01-20
### Added
- Dark mode support
### Changed
- Button styles
### Fixed
- Mobile responsive issues
```

### 3. Breaking Changes
```
?? BREAKING: CSS class names changed
  .btn-custom ? .custom-btn
  
Migration guide: docs/migration/v2.md
```

### 4. Automated Testing
```yaml
- name: Test theme integration
  run: |
    dotnet test --filter Category=ThemeIntegration
```

---

## ? Quick Commands

```powershell
# Check for updates
.\Check-ThemeUpdates.ps1

# Dry run sync
.\Sync-Theme.ps1 -DryRun $true

# Actual sync
.\Sync-Theme.ps1

# Watch for changes
.\Watch-Theme.ps1 -SourcePath "D:\Themes\Corporate" -TargetPath "D:\Projects\MyApp\wwwroot"

# Update package
dotnet add package MyCompany.Theme.Corporate

# Update submodule
git submodule update --remote

# Check version
.\Get-ThemeVersion.ps1
```

---

**Happy Syncing! ??**
