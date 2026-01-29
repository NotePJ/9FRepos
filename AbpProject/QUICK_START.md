# ?? Quick Start - Using Template Scripts

## ??????? 1: ??? PowerShell Script (????? - ??????????)

### ?????????????????
```powershell
# Basic usage
.\Create-NewProject.ps1 -NewProjectName "MyWebApp"

# ????? path ??? port
.\Create-NewProject.ps1 -NewProjectName "MyWebApp" -OutputPath "D:\Projects" -Port 5000

# ??? Migrations ????????
.\Create-NewProject.ps1 -NewProjectName "MyWebApp" -IncludeMigrations $true
```

### ???????
```
? Project created at: D:\Projects\MyWebApp
? Port: 5000
? Database: MyWebApp
? All files renamed
? Configuration updated
? Documentation created
```

---

## ??????? 2: ??? .NET Template (?????? Advanced Users)

### 1. Install Template
```powershell
# Install from local folder
cd D:\Documents\Projects\AbpProject
dotnet new install .

# ???? Install ??? NuGet package
dotnet new install AbpProject.Template.1.0.0.nupkg
```

### 2. ?? Templates ??????????
```powershell
dotnet new list
# ??: abp-razorpages
```

### 3. ?????????????????
```powershell
# Basic
dotnet new abp-razorpages -n MyWebApp -o D:\Projects\MyWebApp

# With options
dotnet new abp-razorpages -n MyWebApp -o D:\Projects\MyWebApp --Port 5000 --IncludeMigrations false

# Interactive mode
dotnet new abp-razorpages
```

### 4. Uninstall Template
```powershell
dotnet new uninstall AbpProject.Template
```

---

## ??????? 3: Manual Clone

### 1. Clone Repository
```powershell
cd D:\Projects
git clone https://your-repo-url.git MyWebApp
cd MyWebApp
```

### 2. Run Rename Script
```powershell
.\Rename-Project.ps1 -NewProjectName "MyWebApp"
```

### 3. Clean & Setup
```powershell
# Clean build artifacts
dotnet clean

# Restore packages
dotnet restore

# Create database
dotnet run --migrate-database
```

---

## ?? ????????????????????????

### 1. Setup Database
```powershell
cd [ProjectPath]
dotnet run --migrate-database
```

?????????:
```
[15:42:25 INF] Started database migrations...
[15:42:26 INF] Development mode detected. Seeding dev user...
[15:42:29 INF] Successfully created dev user 'dev'.
[15:42:30 INF] Successfully completed all database migrations.
```

### 2. Run Application
```powershell
dotnet run
```

### 3. Access Application
???????????????:
```
https://localhost:44360  (???? port ????????)
```

### 4. Login
**Development Mode:**
- Username: `dev`
- Password: `Dev@123`

**Admin Account:**
- Username: `admin`
- Password: `1q2w3E*`

---

## ?? ???????????

### ??????? Port
???????????:
1. `appsettings.json` ? `App.SelfUrl` ??? `AuthServer.Authority`
2. `Properties/launchSettings.json` ? `applicationUrl`

### ??????? Database Name
??????? `appsettings.json`:
```json
"ConnectionStrings": {
  "Default": "Server=(LocalDb)\\MSSQLLocalDB;Database=YourDbName;..."
}
```

### ??????? Dev User Credentials
??????? `Data/DevUserDataSeedContributor.cs`:
```csharp
await CreateDevUserAsync("your-username", "your-email@example.com", "Your@Password");
```

---

## ? Quick Commands Reference

```powershell
# ?????????????????
.\Create-NewProject.ps1 -NewProjectName "MyApp"

# Rename ????????????
.\Rename-Project.ps1 -NewProjectName "MyApp"

# Restore packages
dotnet restore

# Build
dotnet build

# Run migrations
dotnet run --migrate-database

# Run application
dotnet run

# Create migration
dotnet ef migrations add MigrationName

# Drop database
dotnet ef database drop --force

# List templates
dotnet new list

# Install template
dotnet new install .

# Uninstall template
dotnet new uninstall [TemplateName]
```

---

## ?? Best Practices

### 1. ???????????????????
- ??? PascalCase: `MyWebApplication`
- ?????? spaces ???? special characters
- ?????????????????

### 2. Port Management
- ??? port ????????????????????????
- Default ports: 44360, 44361, 44362...

### 3. Database Management
- ??????? database ???????????????
- Drop database ?????????????? fresh start
- Backup database ????????????????????????

### 4. Version Control
```powershell
git init
git add .
git commit -m "Initial commit from template"
git remote add origin [your-repo-url]
git push -u origin main
```

---

## ? Common Issues

### Script Execution Policy Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
??????? port ?? `launchSettings.json` ??? `appsettings.json`

### Database Connection Failed
```powershell
# Check SQL Server LocalDB
sqllocaldb info
sqllocaldb start MSSQLLocalDB
```

### Template Not Found
```powershell
# Verify installation
dotnet new list | Select-String "abp"

# Reinstall
dotnet new uninstall .
dotnet new install .
```

---

## ?? Additional Resources

- **Full Guide:** `PROJECT_TEMPLATE_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Dev Login Info:** `DEV_LOGIN_README.md`

---

## ?? Example Workflow

```powershell
# 1. ?????????????????
.\Create-NewProject.ps1 -NewProjectName "MyShop" -Port 5001

# 2. Navigate to project
cd D:\Projects\MyShop

# 3. Setup database
dotnet run --migrate-database

# 4. Run application
dotnet run

# 5. Open browser
Start-Process "https://localhost:5001"

# 6. Login with dev credentials
# Username: dev
# Password: Dev@123

# 7. Start development!
code .
```

---

**Happy Coding! ??**
