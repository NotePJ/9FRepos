<#
.SYNOPSIS
    ???????????????????? AbpProject template

.DESCRIPTION
    Script ????? copy AbpProject ????? location ???? ??????????????????????????????????????

.PARAMETER NewProjectName
    ???????????????? (???? "MyWebApp")

.PARAMETER OutputPath
    Path ?????????????????????? (default: D:\Projects)

.PARAMETER Port
    Port ?????? development (default: 44360)

.PARAMETER IncludeMigrations
    ??? Migrations ??????????? (default: $false)

.EXAMPLE
    .\Create-NewProject.ps1 -NewProjectName "MyWebApp"

.EXAMPLE
    .\Create-NewProject.ps1 -NewProjectName "MyWebApp" -OutputPath "C:\Projects" -Port 5000
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$NewProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "D:\Projects",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 44360,
    
    [Parameter(Mandatory=$false)]
    [bool]$IncludeMigrations = $false
)

# Colors
$SuccessColor = "Green"
$ErrorColor = "Red"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$([DateTime]::Now.ToString('HH:mm:ss'))] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $SuccessColor
}

function Write-Fail {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $ErrorColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "? $Message" -ForegroundColor $WarningColor
}

# ??????? parameters
if ([string]::IsNullOrWhiteSpace($NewProjectName)) {
    Write-Fail "NewProjectName is required!"
    exit 1
}

# Validate project name
if ($NewProjectName -notmatch '^[A-Za-z][A-Za-z0-9_]*$') {
    Write-Fail "Project name must start with a letter and contain only letters, numbers, and underscores!"
    exit 1
}

Write-Host @"

?????????????????????????????????????????????????????????????????
?         ABP Project Template Creator                          ?
?         Creating: $NewProjectName
?????????????????????????????????????????????????????????????????

"@ -ForegroundColor $InfoColor

# Variables
$TemplateProjectName = "AbpProject"
$TemplatePath = $PSScriptRoot
$NewProjectPath = Join-Path $OutputPath $NewProjectName

Write-Host "Template Path: $TemplatePath" -ForegroundColor Gray
Write-Host "New Project Path: $NewProjectPath" -ForegroundColor Gray
Write-Host ""

# Step 1: Check if target exists
Write-Step "Checking target location..."
if (Test-Path $NewProjectPath) {
    Write-Warning "Target path already exists: $NewProjectPath"
    $response = Read-Host "Do you want to overwrite? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
    Remove-Item -Path $NewProjectPath -Recurse -Force
    Write-Success "Removed existing directory"
}

# Step 2: Create output directory
Write-Step "Creating output directory..."
New-Item -ItemType Directory -Path $NewProjectPath -Force | Out-Null
Write-Success "Created: $NewProjectPath"

# Step 3: Copy files
Write-Step "Copying template files..."

$excludedFolders = @(
    '.git',
    '.vs',
    'bin',
    'obj',
    'Logs',
    'App_Data',
    'node_modules'
)

if (-not $IncludeMigrations) {
    $excludedFolders += 'Migrations'
}

$excludedFiles = @(
    '*.user',
    '*.suo',
    '*.pfx',
    'DEV_LOGIN_README.md',
    'TROUBLESHOOTING.md',
    'PROJECT_TEMPLATE_GUIDE.md',
    'Create-NewProject.ps1',
    'Rename-Project.ps1'
)

try {
    # Copy root files
    Get-ChildItem -Path $TemplatePath -File | 
        Where-Object { 
            $fileName = $_.Name
            -not ($excludedFiles | Where-Object { $fileName -like $_ })
        } |
        ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $NewProjectPath -Force
            Write-Host "  Copied: $($_.Name)" -ForegroundColor Gray
        }

    # Copy template project folder
    $templateProjectFolder = Join-Path $TemplatePath $TemplateProjectName
    if (Test-Path $templateProjectFolder) {
        $newProjectFolder = Join-Path $NewProjectPath $NewProjectName
        
        Copy-Item -Path $templateProjectFolder -Destination $newProjectFolder -Recurse -Force -Exclude $excludedFolders
        
        # Remove excluded folders from copied directory
        foreach ($folder in $excludedFolders) {
            $folderPath = Join-Path $newProjectFolder $folder
            if (Test-Path $folderPath) {
                Remove-Item -Path $folderPath -Recurse -Force
            }
        }
    }
    
    Write-Success "Files copied successfully"
} catch {
    Write-Fail "Failed to copy files: $_"
    exit 1
}

# Step 4: Rename files
Write-Step "Renaming project files..."

try {
    # Rename .csproj file
    $oldCsproj = Join-Path (Join-Path $NewProjectPath $NewProjectName) "$TemplateProjectName.csproj"
    $newCsproj = Join-Path (Join-Path $NewProjectPath $NewProjectName) "$NewProjectName.csproj"
    if (Test-Path $oldCsproj) {
        Rename-Item -Path $oldCsproj -NewName "$NewProjectName.csproj" -Force
        Write-Success "Renamed .csproj file"
    }

    # Rename .sln file
    $oldSln = Join-Path $NewProjectPath "$TemplateProjectName.sln"
    $newSln = Join-Path $NewProjectPath "$NewProjectName.sln"
    if (Test-Path $oldSln) {
        Rename-Item -Path $oldSln -NewName "$NewProjectName.sln" -Force
        Write-Success "Renamed .sln file"
    }

    Write-Success "Files renamed successfully"
} catch {
    Write-Fail "Failed to rename files: $_"
    exit 1
}

# Step 5: Replace content
Write-Step "Updating project content..."

$filesToUpdate = Get-ChildItem -Path $NewProjectPath -Recurse -Include @(
    '*.csproj',
    '*.sln',
    '*.cs',
    '*.cshtml',
    '*.razor',
    '*.json',
    '*.md',
    '*.js',
    '*.css'
) | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\wwwroot\\libs\\' }

$replacements = @{
    $TemplateProjectName = $NewProjectName
    "44359" = $Port.ToString()
    "Database=AbpProject" = "Database=$NewProjectName"
}

$filesUpdated = 0
foreach ($file in $filesToUpdate) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($null -ne $content) {
            $modified = $false
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                    $modified = $true
                }
            }
            
            if ($modified) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $filesUpdated++
                Write-Host "  Updated: $($file.Name)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Warning "Could not update: $($file.FullName)"
    }
}

Write-Success "Updated $filesUpdated files"

# Step 6: Generate new GUIDs
Write-Step "Generating new configuration values..."

$newCertPassPhrase = [guid]::NewGuid().ToString()
$appsettingsPath = Join-Path (Join-Path $NewProjectPath $NewProjectName) "appsettings.json"

if (Test-Path $appsettingsPath) {
    try {
        $appsettings = Get-Content -Path $appsettingsPath -Raw | ConvertFrom-Json
        $appsettings.AuthServer.CertificatePassPhrase = $newCertPassPhrase
        $appsettings | ConvertTo-Json -Depth 10 | Set-Content -Path $appsettingsPath
        Write-Success "Generated new CertificatePassPhrase"
    } catch {
        Write-Warning "Could not update appsettings.json: $_"
    }
}

# Step 7: Create README
Write-Step "Creating project documentation..."

$readmeContent = @"
# $NewProjectName

Project created from ABP template on $([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))

## Technology Stack
- .NET 10.0
- ABP Framework 10.0.2
- Bootstrap 5.3.8
- Entity Framework Core 10.0
- SQL Server LocalDB

## Prerequisites
- .NET 10 SDK
- SQL Server LocalDB
- Visual Studio 2022 or VS Code

## Getting Started

### 1. Restore Packages
``````powershell
cd $NewProjectName
dotnet restore
``````

### 2. Setup Database
``````powershell
dotnet run --migrate-database
``````

### 3. Run Application
``````powershell
dotnet run
``````

### 4. Access Application
Open your browser and navigate to:
``````
https://localhost:$Port
``````

## Default Credentials

### Development Mode
- **Username:** dev
- **Password:** Dev@123

### Admin Account
- **Username:** admin
- **Password:** 1q2w3E*

## Project Structure
``````
$NewProjectName/
??? Data/                    # Database context, migrations, seed data
??? Localization/           # Localization resources
??? Menus/                  # Menu configuration
??? Pages/                  # Razor Pages
??? Permissions/            # Permission definitions
??? wwwroot/                # Static files
??? appsettings.json        # Configuration
??? Program.cs              # Application entry point
``````

## Configuration

### Connection String
Update in ``appsettings.json``:
``````json
"ConnectionStrings": {
  "Default": "Server=(LocalDb)\\MSSQLLocalDB;Database=$NewProjectName;Trusted_Connection=True;TrustServerCertificate=true"
}
``````

### Application URL
Update in ``appsettings.json`` and ``launchSettings.json``:
``````
https://localhost:$Port
``````

## Development

### Create New Migration
``````powershell
dotnet ef migrations add YourMigrationName
``````

### Update Database
``````powershell
dotnet ef database update
``````

### Drop Database
``````powershell
dotnet ef database drop --force
``````

## Multi-Tenancy
This project has multi-tenancy enabled. To login as host admin, leave tenant selection as "Not selected".

## Troubleshooting

### Port Already in Use
Change the port in:
- ``launchSettings.json``
- ``appsettings.json`` (SelfUrl and Authority)

### Database Connection Failed
1. Ensure SQL Server LocalDB is installed
2. Check connection string in ``appsettings.json``
3. Try: ``sqllocaldb start MSSQLLocalDB``

### Certificate Issues
``````powershell
dotnet dev-certs https --clean
dotnet dev-certs https --trust
``````

## Additional Resources
- [ABP Documentation](https://abp.io/docs)
- [.NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)

## License
[Your License Here]

---
Generated by ABP Project Template Creator
"@

$readmePath = Join-Path $NewProjectPath "README.md"
Set-Content -Path $readmePath -Value $readmeContent
Write-Success "Created README.md"

# Step 8: Create .gitignore
Write-Step "Creating .gitignore..."

$gitignoreContent = @"
# Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Bb]in/
[Oo]bj/
[Ll]ogs/

# User-specific files
*.user
*.suo
*.userosscache
*.sln.docstates

# Visual Studio
.vs/
.vscode/

# Database files
*.mdf
*.ldf
App_Data/

# Node modules
node_modules/

# Certificates
*.pfx

# Logs
Logs/
*.log

# Environment files
.env
.env.local
"@

$gitignonrePath = Join-Path $NewProjectPath ".gitignore"
Set-Content -Path $gitignonrePath -Value $gitignoreContent
Write-Success "Created .gitignore"

# Step 9: Summary
Write-Host @"

?????????????????????????????????????????????????????????????????
?         Project Created Successfully!                         ?
?????????????????????????????????????????????????????????????????

"@ -ForegroundColor $SuccessColor

Write-Host "Project Name:    " -NoNewline -ForegroundColor Gray
Write-Host $NewProjectName -ForegroundColor $SuccessColor

Write-Host "Location:        " -NoNewline -ForegroundColor Gray
Write-Host $NewProjectPath -ForegroundColor $SuccessColor

Write-Host "Port:            " -NoNewline -ForegroundColor Gray
Write-Host $Port -ForegroundColor $SuccessColor

Write-Host "Database:        " -NoNewline -ForegroundColor Gray
Write-Host $NewProjectName -ForegroundColor $SuccessColor

Write-Host "`nNext Steps:" -ForegroundColor $InfoColor
Write-Host "  1. " -NoNewline -ForegroundColor Gray
Write-Host "cd `"$NewProjectPath`"" -ForegroundColor Yellow

Write-Host "  2. " -NoNewline -ForegroundColor Gray
Write-Host "dotnet run --migrate-database" -ForegroundColor Yellow

Write-Host "  3. " -NoNewline -ForegroundColor Gray
Write-Host "dotnet run" -ForegroundColor Yellow

Write-Host "  4. " -NoNewline -ForegroundColor Gray
Write-Host "Open https://localhost:$Port" -ForegroundColor Yellow

Write-Host "`nCredentials:" -ForegroundColor $InfoColor
Write-Host "  Dev User:  " -NoNewline -ForegroundColor Gray
Write-Host "dev / Dev@123" -ForegroundColor $SuccessColor

Write-Host "  Admin:     " -NoNewline -ForegroundColor Gray
Write-Host "admin / 1q2w3E*" -ForegroundColor $SuccessColor

Write-Host "`n? All done! Happy coding! ??" -ForegroundColor $SuccessColor
Write-Host ""
