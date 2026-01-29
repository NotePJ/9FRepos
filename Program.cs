using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Services;
using HCBPCoreUI_Backend.Helpers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════
// 📦 SERVICES CONFIGURATION
// ═══════════════════════════════════════════════════════

// Register Services (Dependency Injection)
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<ISelectService, SelectService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IPEManagementService, PEManagementService>();  // PE Management Service
builder.Services.AddScoped<INotificationService, NotificationService>();  // Notification Service
builder.Services.AddScoped<IEmailService, EmailService>();  // Email Service (Phase 6)
builder.Services.AddScoped<IFileUploadService, FileUploadService>();  // File Upload Service (Phase 7)
builder.Services.AddScoped<IUserService, UserService>();  // User Service (Auth)
builder.Services.AddScoped<IAuthService, AuthService>();  // Auth Service (DB + AD)
builder.Services.AddScoped<IRoleService, RoleService>();  // Role Service
builder.Services.AddScoped<IPermissionService, PermissionService>();  // Permission Service
builder.Services.AddScoped<IAuditLogService, AuditLogService>();  // Audit Log Service

// Register DbContext for SQL Server (with encrypted connection string)
var encryptionKey = builder.Configuration["EncryptionSettings:Key"];
var encryptedConnStr = builder.Configuration.GetConnectionString("HRBudgetDb");
var decryptedConnStr = EncryptionHelper.DecryptAES(encryptedConnStr!, encryptionKey!);

builder.Services.AddDbContext<HRBudgetDbContext>(options =>
    options.UseSqlServer(decryptedConnStr));

// Configure MVC Controllers with JSON options
builder.Services.AddControllersWithViews()
    .AddJsonOptions(opts => {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Configure Session (30 minutes timeout)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);     // Session timeout
    options.Cookie.HttpOnly = true;                      // Prevent XSS attacks
    options.Cookie.IsEssential = true;                   // GDPR compliance
});

// Configure Cookie Authentication (3 hours expire)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Auth/Index";               // Login page URL
        options.LogoutPath = "/Auth/Logout";             // Logout URL
        options.ExpireTimeSpan = TimeSpan.FromHours(3);  // Cookie lifetime
        options.SlidingExpiration = true;                // Renew cookie on activity
    });

// Memory Cache (for performance optimization)
builder.Services.AddMemoryCache();

// HttpClient Factory (for external API calls)
builder.Services.AddHttpClient();

// ═══════════════════════════════════════════════════════
// 🚀 APPLICATION BUILD
// ═══════════════════════════════════════════════════════

var app = builder.Build();

// ═══════════════════════════════════════════════════════
// � BCRYPT HASH GENERATOR (ONE-TIME - DELETE AFTER USE)
// ═══════════════════════════════════════════════════════
// #if DEBUG
// Console.WriteLine("═══════════════════════════════════════════════════════");
// Console.WriteLine("🔐 BCrypt Hash Generator");
// Console.WriteLine("═══════════════════════════════════════════════════════");
// var testPassword = "P@ssw0rd123";
// var hash = BCrypt.Net.BCrypt.HashPassword(testPassword, 12);
// Console.WriteLine($"Password: {testPassword}");
// Console.WriteLine($"Hash: {hash}");
// Console.WriteLine("═══════════════════════════════════════════════════════");
// Console.WriteLine("📋 SQL UPDATE Command:");
// Console.WriteLine($"UPDATE dbo.HRB_USER SET PasswordHash = '{hash}' WHERE AuthType = 'DB';");
// Console.WriteLine("═══════════════════════════════════════════════════════");
// #endif

// ═══════════════════════════════════════════════════════

// �🔧 MIDDLEWARE PIPELINE CONFIGURATION
// ═══════════════════════════════════════════════════════

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();  // HTTPS Strict Transport Security
}

app.UseHttpsRedirection();  // Redirect HTTP to HTTPS
app.UseStaticFiles();       // Serve static files (CSS, JS, images)
app.UseRouting();           // Enable routing

// ⚠️ IMPORTANT: Middleware order matters!
app.UseSession();           // Enable session (must be before Authentication)
app.UseAuthentication();    // Enable authentication (must be before Authorization)
app.UseAuthorization();     // Enable authorization

// ═══════════════════════════════════════════════════════
// 🗺️ ROUTE MAPPING
// ═══════════════════════════════════════════════════════

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
