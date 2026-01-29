<#
.SYNOPSIS
    Rename existing AbpProject to new name

.DESCRIPTION
    Script ????????????????????????????????? (in-place rename)

.PARAMETER NewProjectName
    ????????????????

.PARAMETER ProjectPath
    Path ???????????????????????????????? (default: current directory)

.EXAMPLE
    .\Rename-Project.ps1 -NewProjectName "MyWebApp"

.EXAMPLE
    .\Rename-Project.ps1 -NewProjectName "MyWebApp" -ProjectPath "D:\Projects\AbpProject"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$NewProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = (Get-Location).Path
)

$OldProjectName = "AbpProject"
$ErrorActionPreference = "Stop"

Write-Host @"

?????????????????????????????????????????????????????????????????
?         ABP Project Rename Tool                               ?
?         Renaming: $OldProjectName -> $NewProjectName
?????????????????????????????????????????????????????????????????

"@ -ForegroundColor Cyan

# Validate
if ($NewProjectName -notmatch '^[A-Za-z][A-Za-z0-9_]*$') {
    Write-Host "? Project name must start with a letter!" -ForegroundColor Red
    exit 1
}

# Step 1: Backup
Write-Host "`n[1/5] Creating backup..." -ForegroundColor Cyan
$backupPath = Join-Path $ProjectPath "../AbpProject_Backup_$([DateTime]::Now.ToString('yyyyMMdd_HHmmss'))"
try {
    Copy-Item -Path $ProjectPath -Destination $backupPath -Recurse -Force
    Write-Host "? Backup created at: $backupPath" -ForegroundColor Green
} catch {
    Write-Host "? Failed to create backup: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Rename files
Write-Host "`n[2/5] Renaming project files..." -ForegroundColor Cyan

# Rename .csproj
$oldCsproj = Get-ChildItem -Path $ProjectPath -Filter "$OldProjectName.csproj" -Recurse | Select-Object -First 1
if ($oldCsproj) {
    $newCsprojPath = Join-Path $oldCsproj.DirectoryName "$NewProjectName.csproj"
    Rename-Item -Path $oldCsproj.FullName -NewName "$NewProjectName.csproj" -Force
    Write-Host "  ? Renamed .csproj" -ForegroundColor Green
}

# Rename .sln
$oldSln = Get-ChildItem -Path $ProjectPath -Filter "$OldProjectName.sln" | Select-Object -First 1
if ($oldSln) {
    Rename-Item -Path $oldSln.FullName -NewName "$NewProjectName.sln" -Force
    Write-Host "  ? Renamed .sln" -ForegroundColor Green
}

# Rename project folder
$oldProjectFolder = Join-Path $ProjectPath $OldProjectName
$newProjectFolder = Join-Path $ProjectPath $NewProjectName
if (Test-Path $oldProjectFolder) {
    Rename-Item -Path $oldProjectFolder -NewName $NewProjectName -Force
    Write-Host "  ? Renamed project folder" -ForegroundColor Green
}

# Step 3: Update content
Write-Host "`n[3/5] Updating file content..." -ForegroundColor Cyan

$filesToUpdate = Get-ChildItem -Path $ProjectPath -Recurse -Include @(
    '*.csproj',
    '*.sln',
    '*.cs',
    '*.cshtml',
    '*.json',
    '*.md'
) | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\wwwroot\\libs\\|\\bin\\|\\obj\\' }

$filesUpdated = 0
foreach ($file in $filesToUpdate) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match [regex]::Escape($OldProjectName)) {
        $content = $content -replace [regex]::Escape($OldProjectName), $NewProjectName
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesUpdated++
    }
}

Write-Host "  ? Updated $filesUpdated files" -ForegroundColor Green

# Step 4: Clean build artifacts
Write-Host "`n[4/5] Cleaning build artifacts..." -ForegroundColor Cyan

$foldersToClean = @('bin', 'obj', '.vs', 'Logs')
foreach ($folder in $foldersToClean) {
    Get-ChildItem -Path $ProjectPath -Directory -Filter $folder -Recurse | 
        ForEach-Object {
            Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
}

Write-Host "  ? Cleaned build artifacts" -ForegroundColor Green

# Step 5: Summary
Write-Host "`n[5/5] Verifying changes..." -ForegroundColor Cyan

$csprojExists = Test-Path (Join-Path $newProjectFolder "$NewProjectName.csproj")
$slnExists = Test-Path (Join-Path $ProjectPath "$NewProjectName.sln")

if ($csprojExists -and $slnExists) {
    Write-Host "  ? All files renamed successfully" -ForegroundColor Green
} else {
    Write-Host "  ? Some files may not have been renamed correctly" -ForegroundColor Red
}

Write-Host @"

?????????????????????????????????????????????????????????????????
?         Rename Completed!                                     ?
?????????????????????????????????????????????????????????????????

Project Name: $NewProjectName
Location:     $ProjectPath
Backup:       $backupPath

Next Steps:
  1. Verify changes
  2. Update database: dotnet run --migrate-database
  3. Build and run: dotnet run

?  If something went wrong, restore from backup at:
   $backupPath

"@ -ForegroundColor Green
