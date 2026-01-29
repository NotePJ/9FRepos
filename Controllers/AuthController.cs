using HCBPCoreUI_Backend.DTOs.Auth;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Models.Auth;
using HCBPCoreUI_Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HCBPCoreUI_Backend.Controllers
{
    /// <summary>
    /// Authentication Controller
    /// Handles user login, logout, and session management
    /// </summary>
    public class AuthController : Controller
    {
        private readonly HRBudgetDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IUserService _userService;

        public AuthController(
            HRBudgetDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IUserService userService)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
            _userService = userService;
        }

        // ═══════════════════════════════════════════════════════════════════
        // 📍 ENDPOINT 1: GET /Auth/Index?path=/target
        // Purpose: Display login page or redirect if already logged in
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Display login page or redirect if user is already authenticated
        /// </summary>
        /// <param name="path">Redirect path after successful login (default: "/")</param>
        /// <returns>Login view or redirect to requested path</returns>
        [HttpGet]
        public IActionResult Index(string path = "/")
        {
            // Check if user is already logged in
            var employeeNo = HttpContext.Session.GetString("EmployeeNo");

            if (!string.IsNullOrEmpty(employeeNo))
            {
                // User is already authenticated, redirect to requested path
                _logger.LogInformation("User {EmployeeNo} already authenticated, redirecting to {Path}", employeeNo, path);
                return Redirect(path);
            }

            // User not logged in, show login page
            ViewBag.Path = path;
            return View("~/Views/Auth/Login.cshtml");
        }

        // ═══════════════════════════════════════════════════════════════════
        // 📍 ENDPOINT 1.5: GET /Auth/GenerateHash (DEVELOPMENT ONLY)
        // Purpose: Generate BCrypt hash for test users
        // ⚠️ REMOVE THIS ENDPOINT BEFORE PRODUCTION DEPLOYMENT
        // ═══════════════════════════════════════════════════════════════════

#if DEBUG
        /// <summary>
        /// Generate BCrypt hash for password (DEVELOPMENT ONLY)
        /// </summary>
        /// <param name="password">Plain text password</param>
        /// <returns>BCrypt hash</returns>
        [HttpGet]
        public IActionResult GenerateHash(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return BadRequest(new { error = "Password is required" });
            }

            var hash = BCrypt.Net.BCrypt.HashPassword(password, 12);
            return Ok(new
            {
                password,
                hash,
                usage = $"INSERT INTO dbo.HRB_USER (PasswordHash) VALUES ('{hash}')"
            });
        }

        /// <summary>
        /// Test User Session - Load roles and permissions for a user (DEVELOPMENT ONLY)
        /// GET /Auth/TestUserSession?empCode=test_admin
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> TestUserSession(string empCode)
        {
            if (string.IsNullOrEmpty(empCode))
            {
                return BadRequest(new { error = "empCode is required" });
            }

            var userSession = await _userService.GetUserSessionAsync(empCode);

            if (userSession == null)
            {
                return NotFound(new { error = $"User not found: {empCode}" });
            }

            return Ok(new
            {
                success = true,
                user = userSession,
                summary = new
                {
                    rolesCount = userSession.Roles.Count,
                    permissionsCount = userSession.Permissions.Count,
                    isAdmin = userSession.IsAdmin,
                    isSuperUser = userSession.IsSuperUser
                }
            });
        }
#endif

        // ═══════════════════════════════════════════════════════════════════
        // 📍 ENDPOINT: GET /api/Auth/GetCurrentUser
        // Purpose: Get current logged-in user info (for frontend permission check)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Get current user session data including roles and permissions
        /// Used by frontend PermissionHelper.js
        /// </summary>
        [HttpGet]
        [Route("/api/Auth/GetCurrentUser")]
        public IActionResult GetCurrentUser()
        {
            var employeeNo = HttpContext.Session.GetString("EmployeeNo");

            if (string.IsNullOrEmpty(employeeNo))
            {
                return Ok(new { success = false, message = "Not logged in" });
            }

            // Get data from session
            var rolesJson = HttpContext.Session.GetString("UserRoles");
            var permissionsJson = HttpContext.Session.GetString("UserPermissions");
            var isAdminStr = HttpContext.Session.GetString("IsAdmin");

            var roles = new List<string>();
            var permissions = new List<string>();

            if (!string.IsNullOrEmpty(rolesJson))
            {
                try { roles = JsonSerializer.Deserialize<List<string>>(rolesJson) ?? new List<string>(); }
                catch { /* ignore */ }
            }

            if (!string.IsNullOrEmpty(permissionsJson))
            {
                try { permissions = JsonSerializer.Deserialize<List<string>>(permissionsJson) ?? new List<string>(); }
                catch { /* ignore */ }
            }

            return Ok(new
            {
                success = true,
                user = new
                {
                    empCode = employeeNo,
                    userId = HttpContext.Session.GetString("UserId"),
                    userRole = HttpContext.Session.GetString("UserRole"),
                    company = HttpContext.Session.GetString("Company"),
                    authType = HttpContext.Session.GetString("AuthType"),
                    roles = roles,
                    permissions = permissions,
                    isAdmin = isAdminStr == "True"
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════
        // 📍 ENDPOINT 2: POST /Auth/Auth (JSON Body)
        // Purpose: Authenticate user credentials via external API
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Authenticate user credentials and create session
        /// </summary>
        /// <param name="request">Login credentials (Username, Password, Company)</param>
        /// <returns>JSON response with status and redirect path</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Auth([FromBody] LoginRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();

            // ═══════════════════════════════════════════════════════════════
            // 1️⃣ VALIDATION (3 checks)
            // ═══════════════════════════════════════════════════════════════
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new
                {
                    status = false,
                    message = new[] { "กรุณากรอก Username" }
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    status = false,
                    message = new[] { "กรุณากรอกรหัสผ่าน" }
                });
            }

            if (string.IsNullOrWhiteSpace(request.Company))
            {
                return BadRequest(new
                {
                    status = false,
                    message = new[] { "กรุณาเลือก Company" }
                });
            }

            try
            {
                // ═══════════════════════════════════════════════════════════
                // 2️⃣ DATA PREPARATION
                // ═══════════════════════════════════════════════════════════
                var username = request.Username.Trim();
                var password = request.Password.Trim();
                var company = request.Company.Trim().ToLower();
                var redirect = string.IsNullOrEmpty(request.Redirect)
                    ? "/"
                    : Uri.UnescapeDataString(request.Redirect);

                // ═══════════════════════════════════════════════════════════
                // 2.5️⃣ CHECK DB USER FIRST (AuthType = "DB")
                // ═══════════════════════════════════════════════════════════
                // หา User ด้วย username ตรงๆ ก่อน
                // ถ้า AuthType = "DB" → ใช้ username ตรงๆ ไม่ต้อง transform
                var dbUser = await _context.HRB_USER
                    .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

                if (dbUser != null && dbUser.AuthType == "DB")
                {
                    _logger.LogInformation("DB Auth attempt for {Username} ({Company}) from {IpAddress}",
                        username, company, ipAddress);

                    // Authenticate with BCrypt
                    var dbAuthResult = await TryDbAuthentication(username, password, company);
                    if (dbAuthResult.Success)
                    {
                        // ═══════════════════════════════════════════════════════════
                        // 🔒 VALIDATE COMPANY ACCESS (Option A - Double-layer security)
                        // ═══════════════════════════════════════════════════════════
                        var userCompanyAccess = dbAuthResult.User!.CompanyAccess?.ToUpper();
                        var selectedCompany = company.ToUpper();

                        if (!string.IsNullOrEmpty(userCompanyAccess))
                        {
                            var allowedCompanies = userCompanyAccess.Split(',')
                                .Select(c => c.Trim().ToUpper())
                                .ToList();

                            if (!allowedCompanies.Contains(selectedCompany))
                            {
                                _logger.LogWarning("User {Username} attempted to access {Company} but only has access to {AllowedCompanies}",
                                    username, selectedCompany, userCompanyAccess);

                                await LogLoginAttempt(dbAuthResult.User.UserId, username, company, false,
                                    $"Company access denied. User has access to: {userCompanyAccess}", ipAddress, userAgent, null, redirect, "DB");

                                return BadRequest(new
                                {
                                    status = false,
                                    message = new[] { $"คุณไม่มีสิทธิ์เข้าถึง {selectedCompany} กรุณาเลือก Company ที่ถูกต้อง" }
                                });
                            }
                        }

                        // ✅ DB Auth Success - Load User Session
                        return await CreateDbAuthSession(dbAuthResult, username, company, ipAddress, userAgent, redirect);
                    }
                    else
                    {
                        // DB User found but password incorrect
                        return BadRequest(new
                        {
                            status = false,
                            message = new[] { "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง" }
                        });
                    }
                }

                // ═══════════════════════════════════════════════════════════
                // 3️⃣ USERNAME TRANSFORMATION (Company-specific) - For AD Auth
                // ═══════════════════════════════════════════════════════════
                // BJC: username = "12345"
                // Big C: username = "b12345" (add prefix "b")
                var transformedUsername = username;
                if (company == "bigc" && !username.StartsWith("b"))
                {
                    transformedUsername = "b" + username;
                }

                _logger.LogInformation("AD Auth attempt for {Username} ({Company}) from {IpAddress}",
                    transformedUsername, company, ipAddress);

                // ═══════════════════════════════════════════════════════════
                // 3.5️⃣ CHECK DB AUTH WITH TRANSFORMED USERNAME (Fallback)
                // ═══════════════════════════════════════════════════════════
                var dbAuthResult2 = await TryDbAuthentication(transformedUsername, password, company);
                if (dbAuthResult2.Success)
                {
                    // 🔒 Validate Company Access (same pattern as Step 2.5)
                    var userCompanyAccess2 = dbAuthResult2.User!.CompanyAccess?.ToUpper();
                    var selectedCompany2 = company.ToUpper();

                    if (!string.IsNullOrEmpty(userCompanyAccess2))
                    {
                        var allowedCompanies2 = userCompanyAccess2.Split(',')
                            .Select(c => c.Trim().ToUpper())
                            .ToList();

                        if (!allowedCompanies2.Contains(selectedCompany2))
                        {
                            _logger.LogWarning("User {Username} attempted to access {Company} but only has access to {AllowedCompanies}",
                                transformedUsername, selectedCompany2, userCompanyAccess2);

                            await LogLoginAttempt(dbAuthResult2.User.UserId, transformedUsername, company, false,
                                $"Company access denied. User has access to: {userCompanyAccess2}", ipAddress, userAgent, null, redirect, "DB");

                            return BadRequest(new
                            {
                                status = false,
                                message = new[] { $"คุณไม่มีสิทธิ์เข้าถึง {selectedCompany2} กรุณาเลือก Company ที่ถูกต้อง" }
                            });
                        }
                    }

                    // ✅ DB Auth Success - Use helper method
                    return await CreateDbAuthSession(dbAuthResult2, transformedUsername, company, ipAddress, userAgent, redirect);
                }
                else if (dbAuthResult2.UserExists && !dbAuthResult2.Success)
                {
                    // ❌ DB User found but password wrong
                    _logger.LogWarning("DB Auth failed for {Username}: Invalid password", transformedUsername);

                    await LogLoginAttempt(null, transformedUsername, company, false,
                        "Invalid password (DB Auth)", ipAddress, userAgent, null, redirect, "DB");

                    return BadRequest(new
                    {
                        status = false,
                        message = new[] { "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" }
                    });
                }
                // If dbAuthResult2.UserExists = false, continue to AD Auth

                // ═══════════════════════════════════════════════════════════
                // 4️⃣ EXTERNAL API CALL (EHR OAuth Token)
                // ═══════════════════════════════════════════════════════════
                var apiUrl = _configuration["ExternalApi:BaseUrl"] ?? "https://ehr.bjc.co.th/api";
                var tokenEndpoint = _configuration["ExternalApi:TokenEndpoint"] ?? "/legacyauth/token";
                var clientId = _configuration["ExternalApi:ClientId"] ?? "ESS";

                var client = _httpClientFactory.CreateClient();
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("username", transformedUsername),
                    new KeyValuePair<string, string>("password", password),
                    new KeyValuePair<string, string>("grant_type", "password"),
                    new KeyValuePair<string, string>("client_id", clientId)
                });

                var response = await client.PostAsync($"{apiUrl}{tokenEndpoint}", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                // ═══════════════════════════════════════════════════════════
                // 5️⃣ RESPONSE HANDLING
                // ═══════════════════════════════════════════════════════════
                if (response.IsSuccessStatusCode)
                {
                    // ✅ SUCCESS: Deserialize token
                    var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(
                        responseContent,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );

                    if (tokenResponse == null)
                    {
                        _logger.LogError("Failed to deserialize token response");
                        await LogLoginAttempt(null, transformedUsername, company, false,
                            "Invalid token response", ipAddress, userAgent, null, redirect);

                        return StatusCode(500, new
                        {
                            status = false,
                            message = new[] { "เกิดข้อผิดพลาดในการประมวลผลข้อมูล" }
                        });
                    }

                    // ✅ Save to Session
                    HttpContext.Session.SetString("EmployeeNo", transformedUsername);
                    HttpContext.Session.SetString("AccessToken", tokenResponse.AccessToken);
                    HttpContext.Session.SetString("Company", company);
                    HttpContext.Session.SetString("AuthType", "AD");

                    var sessionId = HttpContext.Session.Id;

                    // ✅ Log successful login to database
                    await LogLoginAttempt(null, transformedUsername, company, true,
                        null, ipAddress, userAgent, sessionId, redirect);

                    _logger.LogInformation("Login successful for {Username}", transformedUsername);

                    // ✅ Return success response
                    return Ok(new
                    {
                        status = true,
                        redirect = redirect
                    });
                }
                else
                {
                    // ❌ FAIL: Invalid credentials
                    _logger.LogWarning("Login failed for {Username}: Invalid credentials", transformedUsername);

                    await LogLoginAttempt(null, transformedUsername, company, false,
                        "Invalid username or password", ipAddress, userAgent, null, redirect);

                    return BadRequest(new
                    {
                        status = false,
                        message = new[] { "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" }
                    });
                }
            }
            catch (HttpRequestException ex)
            {
                // 💥 ERROR: Network/API error
                _logger.LogError(ex, "API connection error during login for {Username}", request.Username);

                await LogLoginAttempt(null, request.Username, request.Company, false,
                    $"API Error: {ex.Message}", ipAddress, userAgent, null, request.Redirect);

                return StatusCode(500, new
                {
                    status = false,
                    message = new[] { "ไม่สามารถเชื่อมต่อกับระบบยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง" }
                });
            }
            catch (Exception ex)
            {
                // 💥 ERROR: General exception
                _logger.LogError(ex, "Login error for {Username}", request.Username);

                await LogLoginAttempt(null, request.Username, request.Company, false,
                    $"System Error: {ex.GetType().Name}", ipAddress, userAgent, null, request.Redirect);

                return StatusCode(500, new
                {
                    status = false,
                    message = new[] { "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // 📍 ENDPOINT 3: POST /Auth/Logout
        // Purpose: Clear session and logout user
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Logout user and clear session
        /// </summary>
        /// <returns>Redirect to login page</returns>
        [HttpGet, HttpPost]
        public IActionResult Logout()
        {
            var employeeNo = HttpContext.Session.GetString("EmployeeNo");

            if (!string.IsNullOrEmpty(employeeNo))
            {
                _logger.LogInformation("User {EmployeeNo} logged out", employeeNo);
            }

            // Clear session
            HttpContext.Session.Clear();

            // Redirect to login page
            return RedirectToAction(nameof(Index));
        }

        // ═══════════════════════════════════════════════════════════════════
        // 🔧 HELPER METHOD: Create DB Auth Session
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Create session for DB authenticated user
        /// </summary>
        private async Task<IActionResult> CreateDbAuthSession(
            DbAuthResult dbAuthResult,
            string username,
            string company,
            string? ipAddress,
            string? userAgent,
            string redirect)
        {
            var userSession = await _userService.GetUserSessionAsync(dbAuthResult.User!.EmpCode);

            HttpContext.Session.SetString("EmployeeNo", dbAuthResult.User!.EmpCode);
            HttpContext.Session.SetString("AccessToken", $"DB_TOKEN_{Guid.NewGuid()}");
            HttpContext.Session.SetString("Company", company);
            HttpContext.Session.SetString("AuthType", "DB");
            HttpContext.Session.SetString("UserId", dbAuthResult.User.UserId.ToString());

            // Store roles and permissions in session
            if (userSession != null)
            {
                var primaryRole = userSession.Roles.FirstOrDefault() ?? "User";
                HttpContext.Session.SetString("UserRole", primaryRole);
                HttpContext.Session.SetString("UserRoles", JsonSerializer.Serialize(userSession.Roles));
                HttpContext.Session.SetString("UserPermissions", JsonSerializer.Serialize(userSession.Permissions));
                HttpContext.Session.SetString("IsAdmin", userSession.IsAdmin.ToString());
            }
            else
            {
                HttpContext.Session.SetString("UserRole", dbAuthResult.User.Role ?? "User");
            }

            var sessionId = HttpContext.Session.Id;

            // Update last login
            dbAuthResult.User.LastLoginDate = DateTime.Now;
            dbAuthResult.User.FailedLoginAttempts = 0;
            await _context.SaveChangesAsync();

            await LogLoginAttempt(dbAuthResult.User.UserId, username, company, true,
                null, ipAddress, userAgent, sessionId, redirect, "DB");

            _logger.LogInformation("DB Auth successful for {Username} ({Company})", username, company);

            return Ok(new
            {
                status = true,
                redirect = redirect,
                sessionId = sessionId
            });
        }

        // ═══════════════════════════════════════════════════════════════════
        // 🔧 HELPER METHOD: Log Login Attempts to Database
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Log login attempt to HRB_USER_LOGIN_LOG table
        /// </summary>
        private async Task LogLoginAttempt(
            int? companyId,
            string? username,
            string company,
            bool success,
            string? failureReason,
            string? ipAddress,
            string? userAgent,
            string? sessionId,
            string? redirectPath,
            string authType = "AD")
        {
            try
            {
                var log = new HRB_USER_LOGIN_LOG
                {
                    Username = username ?? "Unknown",
                    LoginTime = DateTime.Now,
                    IPAddress = ipAddress?.Length > 50 ? ipAddress.Substring(0, 50) : ipAddress,
                    UserAgent = userAgent?.Length > 500 ? userAgent.Substring(0, 500) : userAgent,
                    AuthType = authType,
                    LoginStatus = success ? "SUCCESS" : "FAILED",
                    FailReason = failureReason?.Length > 500 ? failureReason.Substring(0, 500) : failureReason,
                    Company = company?.ToUpper()
                };

                await _context.HRB_USER_LOGIN_LOG.AddAsync(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Don't throw exception if logging fails
                _logger.LogError(ex, "Failed to log login attempt for {Username}", username);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // 🔧 HELPER METHOD: DB Authentication (Test Users)
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Try to authenticate user from HRB_USER table (DB Auth)
        /// </summary>
        /// <param name="username">Username or EmpCode</param>
        /// <param name="password">Plain text password</param>
        /// <param name="company">Company code (bjc/bigc)</param>
        /// <returns>DB Auth result with user info if successful</returns>
        private async Task<DbAuthResult> TryDbAuthentication(string username, string password, string company)
        {
            try
            {
                // Find user by Username or EmpCode with AuthType = 'DB'
                var user = await _context.HRB_USER
                    .Where(u => u.IsActive &&
                                u.AuthType == "DB" &&
                                (u.Username == username || u.EmpCode == username))
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    // User not found in DB, try AD Auth
                    return new DbAuthResult { Success = false, UserExists = false };
                }

                // User found, verify password using BCrypt
                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    _logger.LogWarning("DB User {Username} has no password hash", username);
                    return new DbAuthResult { Success = false, UserExists = true };
                }

                bool passwordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (passwordValid)
                {
                    return new DbAuthResult { Success = true, UserExists = true, User = user };
                }
                else
                {
                    return new DbAuthResult { Success = false, UserExists = true };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during DB authentication for {Username}", username);
                return new DbAuthResult { Success = false, UserExists = false };
            }
        }

        /// <summary>
        /// Result of DB Authentication attempt
        /// </summary>
        private class DbAuthResult
        {
            public bool Success { get; set; }
            public bool UserExists { get; set; }
            public HRB_USER? User { get; set; }
        }

        // ═══════════════════════════════════════════════════════════════════
        // 📍 USER MANAGEMENT API ENDPOINTS
        // Purpose: CRUD operations for user management
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>
        /// Get all users with their roles
        /// </summary>
        [HttpGet]
        [Route("api/auth/users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                // First get users with roles
                var users = await _context.HRB_USER
                    .Select(u => new
                    {
                        u.UserId,
                        u.Username,
                        DisplayName = u.FullName,
                        u.Email,
                        u.EmpCode,
                        u.AuthType,
                        CompanyAccess = u.CompanyAccess,
                        u.IsActive,
                        CreatedAt = u.CreatedDate,
                        u.LastLoginDate,
                        Roles = _context.HRB_USER_ROLE
                            .Where(ur => ur.UserId == u.UserId && ur.IsActive)
                            .Join(_context.HRB_ROLE, ur => ur.RoleId, r => r.RoleId, (ur, r) => new
                            {
                                r.RoleId,
                                r.RoleName,
                                r.RoleCode
                            })
                            .ToList()
                    })
                    .OrderBy(u => u.Username)
                    .ToListAsync();

                // Map to final result with CompanyAccess → CompanyId conversion
                var result = users.Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.DisplayName,
                    u.Email,
                    u.EmpCode,
                    u.AuthType,
                    // แปลง CompanyAccess (BJC/BIGC/BJC,BIGC) → CompanyId (1/2/1,2)
                    CompanyId = u.CompanyAccess?.ToUpper() switch
                    {
                        "BJC" => "1",
                        "BIGC" => "2",
                        "BJC,BIGC" => "1,2",
                        "BIGC,BJC" => "1,2",
                        _ => (string?)null
                    },
                    u.IsActive,
                    u.CreatedAt,
                    LastLoginAt = u.LastLoginDate,
                    u.Roles
                }).ToList();

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { success = false, message = "Error retrieving users: " + ex.Message });
            }
        }

        /// <summary>
        /// Get user by ID with roles and data access
        /// </summary>
        [HttpGet]
        [Route("api/auth/users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.HRB_USER
                    .Where(u => u.UserId == id)
                    .Select(u => new
                    {
                        u.UserId,
                        u.Username,
                        DisplayName = u.FullName,
                        u.Email,
                        u.EmpCode,
                        u.AuthType,
                        CompanyAccess = u.CompanyAccess,
                        u.IsActive,
                        CreatedAt = u.CreatedDate,
                        Roles = _context.HRB_USER_ROLE
                            .Where(ur => ur.UserId == u.UserId && ur.IsActive)
                            .Join(_context.HRB_ROLE, ur => ur.RoleId, r => r.RoleId, (ur, r) => new
                            {
                                r.RoleId,
                                r.RoleName,
                                r.RoleCode
                            })
                            .ToList(),
                        DataAccess = _context.HRB_USER_DATA_ACCESS
                            .Where(da => da.UserId == u.UserId && da.IsActive)
                            .Select(da => new
                            {
                                da.Id,
                                da.CompanyId,
                                da.CostCenterCode,
                                da.AccessType
                            })
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // แปลง CompanyAccess (BJC/BIGC/BJC,BIGC) → CompanyId (1/2/1,2)
                var companyId = user.CompanyAccess?.ToUpper() switch
                {
                    "BJC" => "1",
                    "BIGC" => "2",
                    "BJC,BIGC" => "1,2",
                    "BIGC,BJC" => "1,2",
                    _ => null
                };

                var result = new
                {
                    user.UserId,
                    user.Username,
                    user.DisplayName,
                    user.Email,
                    user.EmpCode,
                    user.AuthType,
                    CompanyId = companyId,
                    user.IsActive,
                    user.CreatedAt,
                    user.Roles,
                    user.DataAccess
                };

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", id);
                return StatusCode(500, new { success = false, message = "Error retrieving user" });
            }
        }

        /// <summary>
        /// Create new user
        /// </summary>
        [HttpPost]
        [Route("api/auth/users")]
        public async Task<IActionResult> CreateUser([FromBody] AuthUserCreateDto dto)
        {
            try
            {
                // Validate username uniqueness
                var exists = await _context.HRB_USER.AnyAsync(u => u.Username == dto.Username);
                if (exists)
                {
                    return BadRequest(new { success = false, message = "Username already exists" });
                }

                var currentUser = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";

                // แปลง CompanyId → CompanyCode (รองรับ Multi-Company)
                var companyAccess = dto.CompanyId?.ToUpper() switch
                {
                    "1" => "BJC",
                    "2" => "BIGC",
                    "1,2" => "BJC,BIGC",
                    "2,1" => "BJC,BIGC",
                    _ => null
                };

                var user = new HRB_USER
                {
                    Username = dto.Username,
                    FullName = dto.DisplayName,
                    Email = dto.Email,
                    EmpCode = dto.EmpCode ?? dto.Username,
                    AuthType = dto.AuthType,
                    CompanyAccess = companyAccess,
                    IsActive = dto.IsActive,
                    CreatedBy = currentUser,
                    CreatedDate = DateTime.Now
                };

                // Set password hash for DB auth
                if (dto.AuthType == "DB" && !string.IsNullOrEmpty(dto.Password))
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                }

                _context.HRB_USER.Add(user);
                await _context.SaveChangesAsync();

                // Assign roles
                if (dto.RoleIds != null && dto.RoleIds.Any())
                {
                    foreach (var roleId in dto.RoleIds)
                    {
                        _context.HRB_USER_ROLE.Add(new HRB_USER_ROLE
                        {
                            UserId = user.UserId,
                            RoleId = roleId,
                            IsActive = true,
                            AssignedBy = currentUser,
                            AssignedDate = DateTime.Now
                        });
                    }
                }

                // Add data access
                if (dto.DataAccess != null && dto.DataAccess.Any())
                {
                    // 🔒 Validate: Data Access CompanyId ต้องตรงกับ CompanyAccess ที่เลือก
                    if (!string.IsNullOrEmpty(dto.CompanyId))
                    {
                        // รองรับ Multi-Company: "1,2" → [1, 2]
                        var allowedCompanyIds = dto.CompanyId.Split(',')
                            .Select(s => int.TryParse(s.Trim(), out var id) ? id : (int?)null)
                            .Where(id => id.HasValue)
                            .Select(id => id!.Value)
                            .ToList();

                        var invalidAccess = dto.DataAccess.Any(da =>
                            da.CompanyId.HasValue && !allowedCompanyIds.Contains(da.CompanyId.Value));

                        if (invalidAccess)
                        {
                            return BadRequest(new
                            {
                                success = false,
                                message = "Data Access Rule must match selected Company"
                            });
                        }
                    }

                    foreach (var access in dto.DataAccess)
                    {
                        _context.HRB_USER_DATA_ACCESS.Add(new HRB_USER_DATA_ACCESS
                        {
                            UserId = user.UserId,
                            CompanyId = access.CompanyId,
                            CostCenterCode = access.CostCenterCode,
                            AccessType = access.AccessType ?? "VIEW_ONLY",
                            IsActive = true,
                            AssignedBy = currentUser,
                            AssignedDate = DateTime.Now
                        });
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {Username} created by {CreatedBy}", user.Username, currentUser);

                return Ok(new { success = true, data = new { userId = user.UserId }, message = "User created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { success = false, message = "Error creating user" });
            }
        }

        /// <summary>
        /// Update existing user
        /// </summary>
        [HttpPut]
        [Route("api/auth/users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AuthUserCreateDto dto)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Check username uniqueness (excluding current user)
                var usernameExists = await _context.HRB_USER
                    .AnyAsync(u => u.Username == dto.Username && u.UserId != id);
                if (usernameExists)
                {
                    return BadRequest(new { success = false, message = "Username already exists" });
                }

                var currentUser = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";

                // แปลง CompanyId → CompanyCode (รองรับ Multi-Company)
                var companyAccess = dto.CompanyId?.ToUpper() switch
                {
                    "1" => "BJC",
                    "2" => "BIGC",
                    "1,2" => "BJC,BIGC",
                    "2,1" => "BJC,BIGC",
                    _ => null
                };

                // Update user properties
                user.Username = dto.Username;
                user.FullName = dto.DisplayName;
                user.Email = dto.Email;
                user.EmpCode = dto.EmpCode ?? dto.Username;
                user.AuthType = dto.AuthType;
                user.CompanyAccess = companyAccess;
                user.IsActive = dto.IsActive;
                user.UpdatedBy = currentUser;
                user.UpdatedDate = DateTime.Now;

                // Update password if provided
                if (dto.AuthType == "DB" && !string.IsNullOrEmpty(dto.Password))
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                    user.LastPasswordChange = DateTime.Now;
                }

                // Update roles - remove existing and add new
                var existingRoles = await _context.HRB_USER_ROLE
                    .Where(ur => ur.UserId == id)
                    .ToListAsync();
                _context.HRB_USER_ROLE.RemoveRange(existingRoles);

                if (dto.RoleIds != null && dto.RoleIds.Any())
                {
                    foreach (var roleId in dto.RoleIds)
                    {
                        _context.HRB_USER_ROLE.Add(new HRB_USER_ROLE
                        {
                            UserId = id,
                            RoleId = roleId,
                            IsActive = true,
                            AssignedBy = currentUser,
                            AssignedDate = DateTime.Now
                        });
                    }
                }

                // Update data access - remove existing and add new
                var existingAccess = await _context.HRB_USER_DATA_ACCESS
                    .Where(da => da.UserId == id)
                    .ToListAsync();
                _context.HRB_USER_DATA_ACCESS.RemoveRange(existingAccess);

                if (dto.DataAccess != null && dto.DataAccess.Any())
                {
                    // 🔒 Validate: Data Access CompanyId ต้องตรงกับ CompanyAccess ที่เลือก
                    if (!string.IsNullOrEmpty(dto.CompanyId))
                    {
                        // รองรับ Multi-Company: "1,2" → [1, 2]
                        var allowedCompanyIds = dto.CompanyId.Split(',')
                            .Select(s => int.TryParse(s.Trim(), out var cid) ? cid : (int?)null)
                            .Where(cid => cid.HasValue)
                            .Select(cid => cid!.Value)
                            .ToList();

                        var invalidAccess = dto.DataAccess.Any(da =>
                            da.CompanyId.HasValue && !allowedCompanyIds.Contains(da.CompanyId.Value));

                        if (invalidAccess)
                        {
                            return BadRequest(new
                            {
                                success = false,
                                message = "Data Access Rule must match selected Company"
                            });
                        }
                    }

                    foreach (var access in dto.DataAccess)
                    {
                        _context.HRB_USER_DATA_ACCESS.Add(new HRB_USER_DATA_ACCESS
                        {
                            UserId = id,
                            CompanyId = access.CompanyId,
                            CostCenterCode = access.CostCenterCode,
                            AccessType = access.AccessType ?? "VIEW_ONLY",
                            IsActive = true,
                            AssignedBy = currentUser,
                            AssignedDate = DateTime.Now
                        });
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} updated by {UpdatedBy}", id, currentUser);

                return Ok(new { success = true, message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { success = false, message = "Error updating user" });
            }
        }

        /// <summary>
        /// Toggle user active status
        /// </summary>
        [HttpPut]
        [Route("api/auth/users/{id}/toggle-active")]
        public async Task<IActionResult> ToggleUserActive(int id)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var currentUser = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";

                user.IsActive = !user.IsActive;
                user.UpdatedBy = currentUser;
                user.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} status toggled to {IsActive} by {UpdatedBy}", id, user.IsActive, currentUser);

                return Ok(new { success = true, message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling user status {UserId}", id);
                return StatusCode(500, new { success = false, message = "Error updating user status" });
            }
        }

        /// <summary>
        /// Reset user password
        /// </summary>
        [HttpPost]
        [Route("api/auth/users/{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                if (user.AuthType != "DB")
                {
                    return BadRequest(new { success = false, message = "Password reset is only available for DB authentication users" });
                }

                if (string.IsNullOrEmpty(dto.NewPassword) || dto.NewPassword.Length < 8)
                {
                    return BadRequest(new { success = false, message = "Password must be at least 8 characters" });
                }

                var currentUser = HttpContext.Session.GetString("EmployeeNo") ?? "SYSTEM";

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                user.LastPasswordChange = DateTime.Now;
                user.UpdatedBy = currentUser;
                user.UpdatedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Password reset for user {UserId} by {UpdatedBy}", id, currentUser);

                return Ok(new { success = true, message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for user {UserId}", id);
                return StatusCode(500, new { success = false, message = "Error resetting password" });
            }
        }

        /// <summary>
        /// Delete user
        /// </summary>
        [HttpDelete]
        [Route("api/auth/users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.HRB_USER.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Remove related data
                var roles = await _context.HRB_USER_ROLE.Where(ur => ur.UserId == id).ToListAsync();
                var dataAccess = await _context.HRB_USER_DATA_ACCESS.Where(da => da.UserId == id).ToListAsync();
                var loginLogs = await _context.HRB_USER_LOGIN_LOG.Where(l => l.UserId == id).ToListAsync();

                _context.HRB_USER_ROLE.RemoveRange(roles);
                _context.HRB_USER_DATA_ACCESS.RemoveRange(dataAccess);
                _context.HRB_USER_LOGIN_LOG.RemoveRange(loginLogs);
                _context.HRB_USER.Remove(user);

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} ({Username}) deleted", id, user.Username);

                return Ok(new { success = true, message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { success = false, message = "Error deleting user" });
            }
        }
    }

    /// <summary>
    /// DTO for creating/updating user (Auth API specific)
    /// </summary>
    public class AuthUserCreateDto
    {
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? EmpCode { get; set; }
        public string AuthType { get; set; } = "AD";

        [JsonConverter(typeof(FlexibleStringConverter))]
        public string? CompanyId { get; set; }  // Support: 1, 2, "1", "2", "1,2"

        public bool IsActive { get; set; } = true;
        public string? Password { get; set; }
        public List<int>? RoleIds { get; set; }
        public List<AuthDataAccessDto>? DataAccess { get; set; }
    }

    public class AuthDataAccessDto
    {
        public int? CompanyId { get; set; }
        public string? CostCenterCode { get; set; }
        public string? AccessType { get; set; }
    }

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// Custom JsonConverter: รับได้ทั้ง int และ string แล้วแปลงเป็น string
    /// เช่น: 1 → "1", "2" → "2", "1,2" → "1,2"
    /// </summary>
    public class FlexibleStringConverter : JsonConverter<string?>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Number => reader.GetInt32().ToString(),
                JsonTokenType.String => reader.GetString(),
                JsonTokenType.Null => null,
                _ => null
            };
        }

        public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
        {
            if (value == null)
                writer.WriteNullValue();
            else
                writer.WriteStringValue(value);
        }
    }
}
