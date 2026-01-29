# ?? Theme Package Deployment Guide

## ?? ??????

????????? deploy theme packages ????????????????????????

---

## ?? Deployment Options

1. **NuGet Package** - ???????? NuGet.org ???? private feed
2. **npm Package** - ???????? npmjs.com
3. **Git Repository** - ???????? GitHub/GitLab
4. **CDN** - Host static assets ?? CDN
5. **Internal Package Server** - Corporate package repository

---

## ?? Method 1: NuGet Package

### Step 1: Create Package Project

```powershell
# ????? project
dotnet new classlib -n MyCompany.Theme.Corporate -f net10.0
cd MyCompany.Theme.Corporate
```

### Step 2: Configure .csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    
    <!-- Package Info -->
    <PackageId>MyCompany.Theme.Corporate</PackageId>
    <Version>1.0.0</Version>
    <Authors>Your Company</Authors>
    <Company>Your Company</Company>
    <Description>Corporate theme for ABP applications</Description>
    <PackageTags>abp;theme;razor-pages</PackageTags>
    <PackageProjectUrl>https://github.com/yourcompany/theme</PackageProjectUrl>
    <RepositoryUrl>https://github.com/yourcompany/theme</RepositoryUrl>
    <RepositoryType>git</RepositoryType>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageIcon>icon.png</PackageIcon>
    <PackageReadmeFile>README.md</PackageReadmeFile>
    
    <!-- Embedding -->
    <GenerateEmbeddedFilesManifest>true</GenerateEmbeddedFilesManifest>
    <AddRazorSupportForMvc>true</AddRazorSupportForMvc>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite" Version="5.0.2" />
    <PackageReference Include="Microsoft.Extensions.FileProviders.Embedded" Version="10.0.0" />
  </ItemGroup>

  <ItemGroup>
    <EmbeddedResource Include="wwwroot/**/*" />
  </ItemGroup>
  
  <ItemGroup>
    <None Include="icon.png" Pack="true" PackagePath="" />
    <None Include="README.md" Pack="true" PackagePath="" />
  </ItemGroup>
</Project>
```

### Step 3: Pack & Publish

```powershell
# Pack
dotnet pack -c Release -o ./nupkg

# Publish to NuGet.org
dotnet nuget push ./nupkg/MyCompany.Theme.Corporate.1.0.0.nupkg `
    --api-key YOUR_API_KEY `
    --source https://api.nuget.org/v3/index.json

# Publish to private feed
dotnet nuget push ./nupkg/MyCompany.Theme.Corporate.1.0.0.nupkg `
    --source "https://your-private-feed.com/nuget"
```

### Step 4: Usage

```xml
<!-- In consuming project -->
<PackageReference Include="MyCompany.Theme.Corporate" Version="1.0.0" />
```

```csharp
[DependsOn(typeof(MyCompanyThemeCorporateModule))]
public class YourModule : AbpModule { }
```

---

## ?? Method 2: npm Package

### Step 1: Create package.json

```json
{
  "name": "@mycompany/theme-corporate",
  "version": "1.0.0",
  "description": "Corporate theme for web applications",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "wwwroot"
  ],
  "keywords": ["theme", "css", "abp"],
  "author": "Your Company",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourcompany/theme"
  }
}
```

### Step 2: Publish

```powershell
# Login
npm login

# Publish
npm publish --access public
```

### Step 3: Usage

```powershell
npm install @mycompany/theme-corporate
```

---

## ?? Method 3: Git Repository

### Setup

```powershell
# Initialize
git init
git add .
git commit -m "Initial theme"

# Tag version
git tag v1.0.0
git push origin v1.0.0
```

### Usage via Git Submodule

```powershell
# Add submodule
git submodule add https://github.com/yourcompany/theme.git Themes/Corporate

# Update
git submodule update --remote
```

### Usage via Direct Clone

```powershell
# Clone to shared location
git clone https://github.com/yourcompany/theme.git D:\SharedThemes\Corporate

# Symlink in projects
New-Item -ItemType SymbolicLink `
         -Path "YourProject\Themes\Corporate" `
         -Target "D:\SharedThemes\Corporate"
```

---

## ?? Method 4: CDN Deployment

### Step 1: Build Assets

```powershell
# Create release folder
New-Item -Path "release" -ItemType Directory

# Copy assets
Copy-Item "wwwroot\css\*" "release\css\" -Recurse
Copy-Item "wwwroot\images\*" "release\images\" -Recurse
Copy-Item "wwwroot\js\*" "release\js\" -Recurse

# Minify CSS
# Using tool like clean-css-cli
```

### Step 2: Upload to CDN

```powershell
# Example: Azure Blob Storage
az storage blob upload-batch `
    --account-name yourstorageaccount `
    --destination '$web' `
    --source ./release

# Example: AWS S3
aws s3 sync ./release s3://your-bucket/themes/corporate/v1.0.0/
```

### Step 3: Usage

```html
<link rel="stylesheet" 
      href="https://cdn.yourcompany.com/themes/corporate/v1.0.0/css/theme.css">
```

---

## ?? Method 5: Azure Artifacts / GitHub Packages

### Azure Artifacts

```powershell
# Add source
dotnet nuget add source "https://pkgs.dev.azure.com/yourorg/_packaging/yourfeed/nuget/v3/index.json" `
    --name AzureArtifacts `
    --username YOUR_USERNAME `
    --password YOUR_PAT

# Push
dotnet nuget push ./nupkg/MyCompany.Theme.Corporate.1.0.0.nupkg `
    --source AzureArtifacts `
    --api-key az
```

### GitHub Packages

```powershell
# Add to nuget.config
dotnet nuget add source "https://nuget.pkg.github.com/OWNER/index.json" `
    --name github `
    --username YOUR_USERNAME `
    --password YOUR_PAT

# Push
dotnet nuget push ./nupkg/MyCompany.Theme.Corporate.1.0.0.nupkg `
    --source github
```

---

## ?? Versioning Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

### Examples

```
1.0.0 - Initial release
1.0.1 - Bug fix
1.1.0 - New theme added
2.0.0 - Breaking change (CSS structure changed)
```

---

## ?? Documentation Requirements

### README.md

```markdown
# MyCompany Corporate Theme

Corporate theme for ABP applications.

## Installation

### NuGet
``````powershell
dotnet add package MyCompany.Theme.Corporate
``````

### npm
``````powershell
npm install @mycompany/theme-corporate
``````

## Usage

### ABP Module
``````csharp
[DependsOn(typeof(MyCompanyThemeCorporateModule))]
public class YourModule : AbpModule { }
``````

### Direct CSS
``````html
<link rel="stylesheet" href="~/css/theme.css">
``````

## Customization

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT
```

### CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2024-01-15
### Added
- Initial release
- Default theme
- Dark mode support

## [1.0.1] - 2024-01-20
### Fixed
- Button spacing issue
- Mobile responsive fixes
```

---

## ?? Security Considerations

### Code Signing

```powershell
# Sign NuGet package
nuget sign MyPackage.nupkg `
    -CertificateFingerprint YOUR_CERT_FINGERPRINT `
    -Timestamper http://timestamp.digicert.com
```

### Dependency Scanning

```yaml
# GitHub Actions
- name: Scan dependencies
  uses: snyk/actions/dotnet@master
  with:
    command: test
```

---

## ?? Analytics & Monitoring

### Download Stats

```powershell
# NuGet stats API
curl https://api.nuget.org/v3-flatcontainer/mycompany.theme.corporate/index.json

# npm stats
npm info @mycompany/theme-corporate
```

---

## ?? Quick Reference

### Publish Checklist

- [ ] Update version number
- [ ] Update CHANGELOG.md
- [ ] Run tests
- [ ] Build package
- [ ] Test package locally
- [ ] Push to repository
- [ ] Create git tag
- [ ] Publish package
- [ ] Update documentation
- [ ] Announce release

### Commands

```powershell
# Build
dotnet pack -c Release

# Test locally
dotnet add package MyCompany.Theme.Corporate --source ./nupkg

# Publish
dotnet nuget push ./nupkg/*.nupkg --source nuget.org --api-key KEY

# Version
dotnet pack -p:Version=1.0.1
```

---

**Happy Deploying! ??**
